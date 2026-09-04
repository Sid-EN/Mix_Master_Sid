"""
使用者自建配方測試 (D1 / D)

配方屬於帳號：僅擁有者可讀寫。先前以 JSON 檔儲存且無擁有者概念，
任何未登入者都能刪改他人的配方。
"""
import pytest

VALID = {
    "nameZh": "測試特調",
    "nameEn": "Test Highball",
    "method": "build",
    "glassType": "highball",
    "ingredients": [
        {"slug": "tanqueray-gin", "amount": 2, "unit": "oz"},
        {"slug": "fresh-lime-juice", "amount": 0.75, "unit": "oz"},
        {"slug": "simple-syrup", "amount": 0.5, "unit": "oz"},
    ],
    "steps": ["加冰", "攪拌"],
    "tags": ["自創"],
}


def account(client, email):
    r = client.post("/api/v1/auth/register",
                    json={"email": email, "password": "a-good-password"})
    assert r.status_code == 201, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture
def alice(auth_client):
    return account(auth_client, "alice@example.com")


@pytest.fixture
def bob(auth_client):
    return account(auth_client, "bob@example.com")


def create(client, headers, **over):
    return client.post("/api/v1/recipes", json={**VALID, **over}, headers=headers)


class TestAuthorisation:
    def test_create_requires_authentication(self, auth_client):
        """迴歸：先前未登入即可建立配方。"""
        assert auth_client.post("/api/v1/recipes", json=VALID).status_code == 401

    def test_update_and_delete_require_authentication(self, auth_client, alice):
        rid = create(auth_client, alice).json()["id"]
        assert auth_client.put(f"/api/v1/recipes/{rid}", json=VALID).status_code == 401
        assert auth_client.delete(f"/api/v1/recipes/{rid}").status_code == 401

    def test_mine_requires_authentication(self, auth_client):
        assert auth_client.get("/api/v1/recipes/mine").status_code == 401


class TestOwnership:
    def test_others_cannot_modify_or_delete(self, auth_client, alice, bob):
        """迴歸：先前任何人都能刪除他人的配方。"""
        rid = create(auth_client, alice).json()["id"]
        assert auth_client.put(f"/api/v1/recipes/{rid}", json=VALID, headers=bob).status_code == 404
        assert auth_client.delete(f"/api/v1/recipes/{rid}", headers=bob).status_code == 404

    def test_others_recipes_are_reported_as_missing(self, auth_client, alice, bob):
        """回 404 而非 403，避免洩漏該配方是否存在。"""
        rid = create(auth_client, alice).json()["id"]
        assert auth_client.delete(f"/api/v1/recipes/{rid}", headers=bob).status_code == 404

    def test_mine_only_lists_own_recipes(self, auth_client, alice, bob):
        create(auth_client, alice)
        assert auth_client.get("/api/v1/recipes/mine", headers=alice).json()["total"] == 1
        assert auth_client.get("/api/v1/recipes/mine", headers=bob).json()["total"] == 0

    def test_owner_can_update_and_delete(self, auth_client, alice):
        rid = create(auth_client, alice).json()["id"]
        r = auth_client.put(f"/api/v1/recipes/{rid}", json={**VALID, "nameZh": "改名"}, headers=alice)
        assert r.status_code == 200 and r.json()["nameZh"] == "改名"
        assert auth_client.delete(f"/api/v1/recipes/{rid}", headers=alice).status_code == 204

    def test_deleting_account_removes_its_recipes(self, auth_client, alice, db_session):
        from backend.models.db_models import User, UserRecipe
        create(auth_client, alice)
        assert db_session.query(UserRecipe).count() == 1
        db_session.query(User).delete()
        db_session.commit()
        assert db_session.query(UserRecipe).count() == 0


class TestCreate:
    def test_creates_and_returns_201(self, auth_client, alice):
        r = create(auth_client, alice)
        assert r.status_code == 201
        assert r.json()["type"] == "user" and r.json()["id"]

    def test_engine_scores_user_recipe(self, auth_client, alice):
        body = create(auth_client, alice).json()
        assert 0 <= body["balanceScore"] <= 100
        assert body["grade"] in {"A", "B", "C", "D"}

    def test_score_is_not_client_controlled(self, auth_client, alice):
        body = create(auth_client, alice, balanceScore=100, grade="A").json()
        assert body["grade"] in {"A", "B", "C", "D"}

    def test_ingredient_names_are_resolved(self, auth_client, alice):
        for ing in create(auth_client, alice).json()["ingredients"]:
            assert ing["nameZh"]

    def test_rejects_unknown_ingredient(self, auth_client, alice):
        r = create(auth_client, alice, ingredients=[{"slug": "not-real", "amount": 1}])
        assert r.status_code == 422 and "材料不存在" in r.json()["detail"]

    @pytest.mark.parametrize("over", [
        {"method": "microwave"}, {"ingredients": []},
        {"ingredients": [{"slug": "tanqueray-gin", "amount": 0}]},
    ])
    def test_rejects_invalid_input(self, auth_client, alice, over):
        assert create(auth_client, alice, **over).status_code == 422

    def test_rejects_missing_name(self, auth_client, alice):
        payload = {k: v for k, v in VALID.items() if k != "nameZh"}
        assert auth_client.post("/api/v1/recipes", json=payload, headers=alice).status_code == 422

    def test_duplicate_slug_conflicts(self, auth_client, alice):
        create(auth_client, alice, slug="my-drink")
        assert create(auth_client, alice, slug="my-drink").status_code == 409

    def test_classic_recipes_are_protected(self, auth_client, alice):
        assert auth_client.put("/api/v1/recipes/classic-negroni", json=VALID,
                               headers=alice).status_code == 403
        assert auth_client.delete("/api/v1/recipes/classic-negroni",
                                  headers=alice).status_code == 403


class TestSharing:
    def test_not_shared_by_default(self, auth_client, alice):
        assert create(auth_client, alice).json()["isShared"] is False

    def test_share_returns_unguessable_token(self, auth_client, alice):
        rid = create(auth_client, alice).json()["id"]
        r = auth_client.post(f"/api/v1/recipes/{rid}/share", headers=alice)
        assert r.status_code == 200
        token = r.json()["shareToken"]
        assert len(token) >= 24, "分享權杖須足夠長而不可猜測"
        assert token != rid, "不應直接以配方代號作為公開網址"

    def test_shared_recipe_readable_without_login(self, auth_client, alice):
        rid = create(auth_client, alice).json()["id"]
        token = auth_client.post(f"/api/v1/recipes/{rid}/share", headers=alice).json()["shareToken"]
        r = auth_client.get(f"/api/v1/recipes/shared/{token}")
        assert r.status_code == 200 and r.json()["nameZh"] == VALID["nameZh"]

    def test_share_is_idempotent(self, auth_client, alice):
        rid = create(auth_client, alice).json()["id"]
        first = auth_client.post(f"/api/v1/recipes/{rid}/share", headers=alice).json()["shareToken"]
        second = auth_client.post(f"/api/v1/recipes/{rid}/share", headers=alice).json()["shareToken"]
        assert first == second, "重複分享不應產生新權杖而使舊連結失效"

    def test_revoking_invalidates_link(self, auth_client, alice):
        rid = create(auth_client, alice).json()["id"]
        token = auth_client.post(f"/api/v1/recipes/{rid}/share", headers=alice).json()["shareToken"]
        assert auth_client.delete(f"/api/v1/recipes/{rid}/share", headers=alice).status_code == 204
        assert auth_client.get(f"/api/v1/recipes/shared/{token}").status_code == 404

    def test_unknown_token_returns_404(self, auth_client):
        assert auth_client.get("/api/v1/recipes/shared/not-a-real-token").status_code == 404

    def test_others_cannot_share_or_revoke(self, auth_client, alice, bob):
        rid = create(auth_client, alice).json()["id"]
        assert auth_client.post(f"/api/v1/recipes/{rid}/share", headers=bob).status_code == 404
        assert auth_client.delete(f"/api/v1/recipes/{rid}/share", headers=bob).status_code == 404

    def test_sharing_requires_authentication(self, auth_client, alice):
        rid = create(auth_client, alice).json()["id"]
        assert auth_client.post(f"/api/v1/recipes/{rid}/share").status_code == 401


class TestClassicsUnaffected:
    def test_classic_list_still_available(self, auth_client):
        items = auth_client.get("/api/v1/recipes?type=classic&limit=500").json()["items"]
        assert len(items) == 51

    def test_classic_detail_still_public(self, auth_client):
        assert auth_client.get("/api/v1/recipes/classic-negroni").status_code == 200
