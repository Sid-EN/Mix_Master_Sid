"""
推播訂閱測試 (J)

實際的推播「送達」需連線至瀏覽器廠商的推送服務，測試環境無法驗證；
此處涵蓋訂閱管理與失效訂閱的清理邏輯。
"""
from unittest.mock import patch

import pytest
from pywebpush import WebPushException


def account(client, email="alice@example.com"):
    r = client.post("/api/v1/auth/register",
                    json={"email": email, "password": "a-good-password"})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


SUB = {
    "endpoint": "https://push.example.com/endpoint/abc123",
    "keys": {"p256dh": "test-p256dh-key", "auth": "test-auth-key"},
}


@pytest.fixture
def alice(auth_client):
    return account(auth_client)


@pytest.fixture
def bob(auth_client):
    return account(auth_client, "bob@example.com")


class TestPublicKey:
    def test_available_without_login(self, auth_client):
        r = auth_client.get("/api/v1/push/public-key")
        assert r.status_code == 200 and "enabled" in r.json()

    def test_reports_disabled_when_unconfigured(self, auth_client, monkeypatch):
        """未設定金鑰時應回報停用，而非給出無效的公鑰。"""
        import backend.api.routes_push as mod
        monkeypatch.setattr(mod.settings, "vapid_public_key", "")
        body = auth_client.get("/api/v1/push/public-key").json()
        assert body["enabled"] is False and body["publicKey"] is None


class TestSubscribe:
    def test_requires_authentication(self, auth_client):
        assert auth_client.post("/api/v1/push/subscribe", json=SUB).status_code == 401

    def test_creates_subscription(self, auth_client, alice, db_session):
        from backend.models.db_models import PushSubscription
        r = auth_client.post("/api/v1/push/subscribe", json=SUB, headers=alice)
        assert r.status_code == 201
        assert db_session.query(PushSubscription).count() == 1

    def test_same_endpoint_is_not_duplicated(self, auth_client, alice, db_session):
        from backend.models.db_models import PushSubscription
        auth_client.post("/api/v1/push/subscribe", json=SUB, headers=alice)
        auth_client.post("/api/v1/push/subscribe", json=SUB, headers=alice)
        assert db_session.query(PushSubscription).count() == 1

    def test_endpoint_transfers_on_account_change(self, auth_client, alice, bob, db_session):
        """同一瀏覽器換帳號登入時，該訂閱應改屬新帳號。"""
        from backend.models.db_models import PushSubscription
        auth_client.post("/api/v1/push/subscribe", json=SUB, headers=alice)
        auth_client.post("/api/v1/push/subscribe", json=SUB, headers=bob)
        rows = db_session.query(PushSubscription).all()
        assert len(rows) == 1

    def test_multiple_devices_per_user(self, auth_client, alice, db_session):
        from backend.models.db_models import PushSubscription
        auth_client.post("/api/v1/push/subscribe", json=SUB, headers=alice)
        auth_client.post("/api/v1/push/subscribe", headers=alice, json={
            **SUB, "endpoint": "https://push.example.com/endpoint/device2"})
        assert db_session.query(PushSubscription).count() == 2

    def test_rejects_malformed_subscription(self, auth_client, alice):
        assert auth_client.post("/api/v1/push/subscribe",
                                json={"endpoint": "x"}, headers=alice).status_code == 422


class TestUnsubscribe:
    def test_removes_subscription(self, auth_client, alice, db_session):
        from backend.models.db_models import PushSubscription
        auth_client.post("/api/v1/push/subscribe", json=SUB, headers=alice)
        r = auth_client.delete(f"/api/v1/push/subscribe?endpoint={SUB['endpoint']}",
                               headers=alice)
        assert r.status_code == 204
        assert db_session.query(PushSubscription).count() == 0

    def test_others_cannot_remove(self, auth_client, alice, bob):
        auth_client.post("/api/v1/push/subscribe", json=SUB, headers=alice)
        assert auth_client.delete(f"/api/v1/push/subscribe?endpoint={SUB['endpoint']}",
                                  headers=bob).status_code == 404

    def test_unknown_endpoint_returns_404(self, auth_client, alice):
        assert auth_client.delete("/api/v1/push/subscribe?endpoint=nope",
                                  headers=alice).status_code == 404


class TestSending:
    def test_requires_subscription(self, auth_client, alice):
        r = auth_client.post("/api/v1/push/test",
                             json={"body": "測試"}, headers=alice)
        assert r.status_code == 404

    def test_sends_to_all_devices(self, auth_client, alice):
        auth_client.post("/api/v1/push/subscribe", json=SUB, headers=alice)
        auth_client.post("/api/v1/push/subscribe", headers=alice, json={
            **SUB, "endpoint": "https://push.example.com/endpoint/device2"})
        with patch("backend.api.routes_push.webpush") as mock:
            r = auth_client.post("/api/v1/push/test",
                                 json={"body": "測試"}, headers=alice)
        assert r.status_code == 200 and r.json()["sent"] == 2
        assert mock.call_count == 2

    def test_expired_subscription_is_removed(self, auth_client, alice, db_session):
        """推送服務回報 410 代表訂閱已不存在，應清除以免持續重試。"""
        from backend.models.db_models import PushSubscription
        auth_client.post("/api/v1/push/subscribe", json=SUB, headers=alice)

        class FakeResponse:
            status_code = 410

        with patch("backend.api.routes_push.webpush",
                   side_effect=WebPushException("gone", response=FakeResponse())):
            body = auth_client.post("/api/v1/push/test",
                                    json={"body": "測試"}, headers=alice).json()
        assert body["removed"] == 1
        assert db_session.query(PushSubscription).count() == 0

    def test_transient_failure_keeps_subscription(self, auth_client, alice, db_session):
        """暫時性錯誤不應誤刪訂閱。"""
        from backend.models.db_models import PushSubscription
        auth_client.post("/api/v1/push/subscribe", json=SUB, headers=alice)

        class FakeResponse:
            status_code = 500

        with patch("backend.api.routes_push.webpush",
                   side_effect=WebPushException("boom", response=FakeResponse())):
            body = auth_client.post("/api/v1/push/test",
                                    json={"body": "測試"}, headers=alice).json()
        assert body["sent"] == 0 and body["removed"] == 0
        assert db_session.query(PushSubscription).count() == 1

    def test_rejects_empty_body(self, auth_client, alice):
        auth_client.post("/api/v1/push/subscribe", json=SUB, headers=alice)
        assert auth_client.post("/api/v1/push/test", json={"body": ""},
                                headers=alice).status_code == 422

    def test_deleting_account_removes_subscriptions(self, auth_client, alice, db_session):
        from backend.models.db_models import PushSubscription, User
        auth_client.post("/api/v1/push/subscribe", json=SUB, headers=alice)
        db_session.query(User).delete()
        db_session.commit()
        assert db_session.query(PushSubscription).count() == 0
