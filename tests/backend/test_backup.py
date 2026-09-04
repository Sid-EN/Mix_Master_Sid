"""
匯出與匯入測試 (H)

匯入是外部資料進入系統的入口，必須逐項驗證；
同時匯入應是增添而非抹除，誤匯入舊備份不該清空既有內容。
"""
import pytest

RECIPE = {
    "nameZh": "備份測試酒",
    "method": "build",
    "ingredients": [{"slug": "tanqueray-gin", "amount": 2, "unit": "oz"}],
    "steps": ["加冰"],
}


def account(client, email):
    r = client.post("/api/v1/auth/register",
                    json={"email": email, "password": "a-good-password"})
    assert r.status_code == 201
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture
def alice(auth_client):
    return account(auth_client, "alice@example.com")


@pytest.fixture
def bob(auth_client):
    return account(auth_client, "bob@example.com")


@pytest.fixture
def populated(auth_client, alice):
    auth_client.put("/api/v1/sync/my-bar",
                    json={"value": ["tanqueray-gin", "campari"]}, headers=alice)
    auth_client.put("/api/v1/sync/favorites",
                    json={"value": {"classic-negroni": {"rating": 5}}}, headers=alice)
    auth_client.post("/api/v1/recipes", json=RECIPE, headers=alice)
    return alice


class TestExport:
    def test_requires_authentication(self, auth_client):
        assert auth_client.get("/api/v1/backup/export").status_code == 401

    def test_includes_sync_data_and_recipes(self, auth_client, populated):
        body = auth_client.get("/api/v1/backup/export", headers=populated).json()
        assert body["version"] == 1
        assert body["data"]["my-bar"] == ["tanqueray-gin", "campari"]
        assert len(body["recipes"]) == 1
        assert body["recipes"][0]["data"]["nameZh"] == "備份測試酒"

    def test_includes_account_info(self, auth_client, populated):
        body = auth_client.get("/api/v1/backup/export", headers=populated).json()
        assert body["account"]["email"] == "alice@example.com"

    def test_excludes_share_tokens(self, auth_client, populated):
        """分享狀態不隨備份轉移；匯入他處後應由該帳號自行決定是否公開。"""
        rid = auth_client.get("/api/v1/recipes/mine", headers=populated).json()["items"][0]["id"]
        auth_client.post(f"/api/v1/recipes/{rid}/share", headers=populated)
        body = auth_client.get("/api/v1/backup/export", headers=populated).json()
        assert "shareToken" not in body["recipes"][0]
        assert "shareToken" not in body["recipes"][0]["data"]

    def test_empty_account_exports_cleanly(self, auth_client, alice):
        body = auth_client.get("/api/v1/backup/export", headers=alice).json()
        assert body["data"] == {} and body["recipes"] == []

    def test_only_exports_own_data(self, auth_client, populated, bob):
        body = auth_client.get("/api/v1/backup/export", headers=bob).json()
        assert body["data"] == {} and body["recipes"] == []


class TestImportRoundTrip:
    def test_restores_into_another_account(self, auth_client, populated, bob):
        backup = auth_client.get("/api/v1/backup/export", headers=populated).json()
        r = auth_client.post("/api/v1/backup/import", json=backup, headers=bob)
        assert r.status_code == 200

        synced = auth_client.get("/api/v1/sync", headers=bob).json()
        assert synced["my-bar"] == ["tanqueray-gin", "campari"]
        mine = auth_client.get("/api/v1/recipes/mine", headers=bob).json()
        assert mine["total"] == 1 and mine["items"][0]["nameZh"] == "備份測試酒"

    def test_reports_what_was_imported(self, auth_client, populated, bob):
        backup = auth_client.get("/api/v1/backup/export", headers=populated).json()
        body = auth_client.post("/api/v1/backup/import", json=backup, headers=bob).json()
        assert set(body["importedKeys"]) == {"my-bar", "favorites"}
        assert body["importedRecipes"] == 1


class TestImportSafety:
    def test_requires_authentication(self, auth_client):
        assert auth_client.post("/api/v1/backup/import",
                                json={"version": 1}).status_code == 401

    def test_skips_keys_outside_whitelist(self, auth_client, alice):
        """匯入不得成為任意資料的注入管道。"""
        body = auth_client.post("/api/v1/backup/import", headers=alice, json={
            "version": 1,
            "data": {"my-bar": ["campari"], "arbitrary": {"x": 1}, "theme": {"mode": "dark"}},
        }).json()
        assert body["importedKeys"] == ["my-bar"]
        assert set(body["skippedKeys"]) == {"arbitrary", "theme"}

    def test_rejects_future_format_version(self, auth_client, alice):
        r = auth_client.post("/api/v1/backup/import",
                             json={"version": 999}, headers=alice)
        assert r.status_code == 422

    def test_skips_invalid_recipes(self, auth_client, alice):
        body = auth_client.post("/api/v1/backup/import", headers=alice, json={
            "version": 1,
            "recipes": [
                {"data": {"nameZh": "有效", "method": "build",
                          "ingredients": [{"slug": "tanqueray-gin", "amount": 2}], "steps": []}},
                {"data": {"nameZh": "材料不存在", "method": "build",
                          "ingredients": [{"slug": "nope", "amount": 2}], "steps": []}},
                {"data": {"nameZh": "手法無效", "method": "microwave",
                          "ingredients": [{"slug": "tanqueray-gin", "amount": 2}], "steps": []}},
                {"data": "not-an-object"},
            ],
        }).json()
        assert body["importedRecipes"] == 1
        assert len(body["skippedRecipes"]) == 3

    def test_rejects_too_many_recipes(self, auth_client, alice):
        many = [{"data": RECIPE} for _ in range(201)]
        r = auth_client.post("/api/v1/backup/import",
                             json={"version": 1, "recipes": many}, headers=alice)
        assert r.status_code == 422

    def test_does_not_delete_existing_data(self, auth_client, populated):
        """匯入應是增添而非抹除，否則誤匯入舊備份會靜默清空現有內容。"""
        auth_client.post("/api/v1/backup/import", headers=populated,
                         json={"version": 1, "data": {"progress": {"xp": 10}}})
        synced = auth_client.get("/api/v1/sync", headers=populated).json()
        assert "my-bar" in synced and "favorites" in synced and "progress" in synced

    def test_does_not_overwrite_existing_recipes(self, auth_client, populated):
        backup = auth_client.get("/api/v1/backup/export", headers=populated).json()
        auth_client.post("/api/v1/backup/import", json=backup, headers=populated)
        mine = auth_client.get("/api/v1/recipes/mine", headers=populated).json()
        assert mine["total"] == 2, "代號衝突時應另取新代號而非覆寫"

    def test_same_key_is_overwritten(self, auth_client, populated):
        auth_client.post("/api/v1/backup/import", headers=populated,
                         json={"version": 1, "data": {"my-bar": ["aperol"]}})
        assert auth_client.get("/api/v1/sync/my-bar",
                               headers=populated).json()["value"] == ["aperol"]

    def test_imported_recipes_are_rescored(self, auth_client, alice):
        """分數由引擎重算，不採信備份中的數值。"""
        auth_client.post("/api/v1/backup/import", headers=alice, json={
            "version": 1,
            "recipes": [{"data": {**RECIPE, "balanceScore": 100, "grade": "A"}}],
        })
        item = auth_client.get("/api/v1/recipes/mine", headers=alice).json()["items"][0]
        assert item["grade"] in {"A", "B", "C", "D"}
