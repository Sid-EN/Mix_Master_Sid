"""
跨裝置同步測試 (D2)

最關鍵的性質是使用者隔離：任何情況下都不得讀到他人的資料。
"""
import pytest


def account(client, email, password="a-good-password"):
    r = client.post("/api/v1/auth/register", json={"email": email, "password": password})
    assert r.status_code == 201, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture
def alice(auth_client):
    return account(auth_client, "alice@example.com")


@pytest.fixture
def bob(auth_client):
    return account(auth_client, "bob@example.com")


class TestAuthorisation:
    @pytest.mark.parametrize("method,path", [
        ("get", "/api/v1/sync"),
        ("get", "/api/v1/sync/my-bar"),
        ("put", "/api/v1/sync/my-bar"),
        ("delete", "/api/v1/sync/my-bar"),
    ])
    def test_requires_authentication(self, auth_client, method, path):
        call = getattr(auth_client, method)
        r = call(path, json={"value": []}) if method == "put" else call(path)
        assert r.status_code == 401


class TestIsolation:
    def test_users_cannot_read_each_others_data(self, auth_client, alice, bob):
        auth_client.put("/api/v1/sync/my-bar", json={"value": ["alice-gin"]}, headers=alice)
        auth_client.put("/api/v1/sync/my-bar", json={"value": ["bob-rum"]}, headers=bob)

        assert auth_client.get("/api/v1/sync/my-bar", headers=alice).json()["value"] == ["alice-gin"]
        assert auth_client.get("/api/v1/sync/my-bar", headers=bob).json()["value"] == ["bob-rum"]

    def test_bulk_endpoint_only_returns_own_data(self, auth_client, alice, bob):
        auth_client.put("/api/v1/sync/favorites", json={"value": {"secret": 1}}, headers=alice)
        assert auth_client.get("/api/v1/sync", headers=bob).json() == {}

    def test_deleting_own_data_does_not_affect_others(self, auth_client, alice, bob):
        auth_client.put("/api/v1/sync/my-bar", json={"value": ["alice-gin"]}, headers=alice)
        auth_client.put("/api/v1/sync/my-bar", json={"value": ["bob-rum"]}, headers=bob)
        auth_client.delete("/api/v1/sync/my-bar", headers=bob)
        assert auth_client.get("/api/v1/sync/my-bar", headers=alice).status_code == 200

    def test_deleting_account_removes_its_data(self, auth_client, alice, db_session):
        from backend.models.db_models import User, UserData
        auth_client.put("/api/v1/sync/my-bar", json={"value": ["gin"]}, headers=alice)
        assert db_session.query(UserData).count() == 1
        db_session.query(User).delete()
        db_session.commit()
        assert db_session.query(UserData).count() == 0, "刪除帳號時應一併移除其資料"


class TestRoundTrip:
    @pytest.mark.parametrize("key,value", [
        ("my-bar", ["tanqueray-gin", "campari"]),
        ("favorites", {"classic-negroni": {"rating": 5, "note": "很棒"}}),
        ("progress", {"xp": 120, "level": 3, "viewed": ["a", "b"]}),
        ("flavor-pref", {"sweet": 0.3, "sour": 0.8}),
        ("quiz-history", [{"score": 8, "total": 10}]),
        ("personality", {"type": "explorer"}),
    ])
    def test_stores_and_returns_value_unchanged(self, auth_client, alice, key, value):
        assert auth_client.put(f"/api/v1/sync/{key}", json={"value": value},
                               headers=alice).status_code == 200
        assert auth_client.get(f"/api/v1/sync/{key}", headers=alice).json()["value"] == value

    def test_put_is_idempotent_and_overwrites(self, auth_client, alice):
        auth_client.put("/api/v1/sync/my-bar", json={"value": ["a"]}, headers=alice)
        auth_client.put("/api/v1/sync/my-bar", json={"value": ["b"]}, headers=alice)
        assert auth_client.get("/api/v1/sync/my-bar", headers=alice).json()["value"] == ["b"]

    def test_unicode_survives_round_trip(self, auth_client, alice):
        value = {"note": "尼格羅尼很苦但很棒 🍸"}
        auth_client.put("/api/v1/sync/favorites", json={"value": value}, headers=alice)
        assert auth_client.get("/api/v1/sync/favorites", headers=alice).json()["value"] == value

    def test_missing_key_returns_404(self, auth_client, alice):
        assert auth_client.get("/api/v1/sync/my-bar", headers=alice).status_code == 404

    def test_bulk_returns_all_keys(self, auth_client, alice):
        auth_client.put("/api/v1/sync/my-bar", json={"value": ["a"]}, headers=alice)
        auth_client.put("/api/v1/sync/progress", json={"value": {"xp": 1}}, headers=alice)
        assert set(auth_client.get("/api/v1/sync", headers=alice).json()) == {"my-bar", "progress"}


class TestValidation:
    @pytest.mark.parametrize("key", ["theme", "locale", "arbitrary", "../etc/passwd"])
    def test_rejects_keys_outside_whitelist(self, auth_client, alice, key):
        """避免同步端點淪為任意資料的儲存空間；theme 與 locale 屬裝置偏好。"""
        r = auth_client.put(f"/api/v1/sync/{key}", json={"value": {}}, headers=alice)
        assert r.status_code in (404, 422)

    def test_rejects_oversized_payload(self, auth_client, alice):
        huge = {"blob": "x" * (300 * 1024)}
        r = auth_client.put("/api/v1/sync/favorites", json={"value": huge}, headers=alice)
        assert r.status_code == 413

    def test_rejects_non_object_value(self, auth_client, alice):
        r = auth_client.put("/api/v1/sync/my-bar", json={"value": "just-a-string"}, headers=alice)
        assert r.status_code == 422
