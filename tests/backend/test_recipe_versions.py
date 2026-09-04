"""
配方版本歷史測試 (F)

每次更新前保存當下內容，使用者得以檢視改動並回溯。
"""
import pytest

BASE = {
    "nameZh": "初版",
    "method": "build",
    "ingredients": [{"slug": "tanqueray-gin", "amount": 2, "unit": "oz"}],
    "steps": ["加冰"],
}


def account(client, email):
    r = client.post("/api/v1/auth/register",
                    json={"email": email, "password": "a-good-password"})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture
def alice(auth_client):
    return account(auth_client, "alice@example.com")


@pytest.fixture
def bob(auth_client):
    return account(auth_client, "bob@example.com")


@pytest.fixture
def recipe(auth_client, alice):
    return auth_client.post("/api/v1/recipes", json=BASE, headers=alice).json()["id"]


def update(client, headers, rid, name):
    return client.put(f"/api/v1/recipes/{rid}", json={**BASE, "nameZh": name}, headers=headers)


class TestSnapshotOnUpdate:
    def test_no_versions_before_first_update(self, auth_client, alice, recipe):
        assert auth_client.get(f"/api/v1/recipes/{recipe}/versions",
                               headers=alice).json()["total"] == 0

    def test_update_saves_previous_content(self, auth_client, alice, recipe):
        update(auth_client, alice, recipe, "第二版")
        body = auth_client.get(f"/api/v1/recipes/{recipe}/versions", headers=alice).json()
        assert body["total"] == 1
        assert body["items"][0]["nameZh"] == "初版", "保存的應為更新前的內容"

    def test_versions_increment_and_sort_desc(self, auth_client, alice, recipe):
        for name in ["第二版", "第三版", "第四版"]:
            update(auth_client, alice, recipe, name)
        items = auth_client.get(f"/api/v1/recipes/{recipe}/versions", headers=alice).json()["items"]
        assert [i["version"] for i in items] == [3, 2, 1]
        assert items[0]["nameZh"] == "第三版"

    def test_history_is_capped(self, auth_client, alice, recipe):
        """長期編輯不應讓歷史無限成長。"""
        from backend.api.routes_recipes import MAX_VERSIONS
        for i in range(MAX_VERSIONS + 5):
            update(auth_client, alice, recipe, f"版本 {i}")
        total = auth_client.get(f"/api/v1/recipes/{recipe}/versions", headers=alice).json()["total"]
        assert total == MAX_VERSIONS

    def test_oldest_versions_are_dropped_first(self, auth_client, alice, recipe):
        from backend.api.routes_recipes import MAX_VERSIONS
        for i in range(MAX_VERSIONS + 3):
            update(auth_client, alice, recipe, f"版本 {i}")
        items = auth_client.get(f"/api/v1/recipes/{recipe}/versions", headers=alice).json()["items"]
        versions = [i["version"] for i in items]
        assert min(versions) > 1, "應汰除最舊的版本"


class TestViewVersion:
    def test_returns_full_content(self, auth_client, alice, recipe):
        update(auth_client, alice, recipe, "第二版")
        r = auth_client.get(f"/api/v1/recipes/{recipe}/versions/1", headers=alice)
        assert r.status_code == 200
        assert r.json()["nameZh"] == "初版"

    def test_ingredient_names_are_resolved(self, auth_client, alice, recipe):
        update(auth_client, alice, recipe, "第二版")
        body = auth_client.get(f"/api/v1/recipes/{recipe}/versions/1", headers=alice).json()
        assert body["ingredients"][0]["nameZh"]

    def test_unknown_version_returns_404(self, auth_client, alice, recipe):
        assert auth_client.get(f"/api/v1/recipes/{recipe}/versions/99",
                               headers=alice).status_code == 404


class TestRestore:
    def test_restores_previous_content(self, auth_client, alice, recipe):
        update(auth_client, alice, recipe, "第二版")
        r = auth_client.post(f"/api/v1/recipes/{recipe}/versions/1/restore", headers=alice)
        assert r.status_code == 200 and r.json()["nameZh"] == "初版"

    def test_restore_is_itself_undoable(self, auth_client, alice, recipe):
        """回溯本身也保存為一版，否則使用者誤按後無從還原。"""
        update(auth_client, alice, recipe, "第二版")
        auth_client.post(f"/api/v1/recipes/{recipe}/versions/1/restore", headers=alice)
        items = auth_client.get(f"/api/v1/recipes/{recipe}/versions", headers=alice).json()["items"]
        assert items[0]["nameZh"] == "第二版", "回溯前的內容應被保存"

    def test_unknown_version_returns_404(self, auth_client, alice, recipe):
        assert auth_client.post(f"/api/v1/recipes/{recipe}/versions/99/restore",
                                headers=alice).status_code == 404


class TestAuthorisation:
    def test_requires_authentication(self, auth_client, recipe):
        assert auth_client.get(f"/api/v1/recipes/{recipe}/versions").status_code == 401
        assert auth_client.post(f"/api/v1/recipes/{recipe}/versions/1/restore").status_code == 401

    def test_others_cannot_view_or_restore(self, auth_client, alice, bob, recipe):
        update(auth_client, alice, recipe, "第二版")
        assert auth_client.get(f"/api/v1/recipes/{recipe}/versions",
                               headers=bob).status_code == 404
        assert auth_client.get(f"/api/v1/recipes/{recipe}/versions/1",
                               headers=bob).status_code == 404
        assert auth_client.post(f"/api/v1/recipes/{recipe}/versions/1/restore",
                                headers=bob).status_code == 404

    def test_deleting_recipe_removes_versions(self, auth_client, alice, recipe, db_session):
        from backend.models.db_models import UserRecipeVersion
        update(auth_client, alice, recipe, "第二版")
        assert db_session.query(UserRecipeVersion).count() == 1
        auth_client.delete(f"/api/v1/recipes/{recipe}", headers=alice)
        assert db_session.query(UserRecipeVersion).count() == 0
