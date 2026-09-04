"""
密碼管理測試 (I)

涵蓋變更密碼、忘記密碼與重設，重點在於：
舊權杖必須失效、重設權杖只能用一次、且端點不得洩漏帳號是否存在。
"""
import re

import pytest

PW = "a-good-password"
NEW = "an-even-better-password"


def register(client, email="alice@example.com", password=PW):
    r = client.post("/api/v1/auth/register", json={"email": email, "password": password})
    assert r.status_code == 201, r.text
    return r.json()["access_token"]


def auth(token):
    return {"Authorization": f"Bearer {token}"}


class TestChangePassword:
    def test_changes_password_and_returns_new_token(self, auth_client):
        token = register(auth_client)
        r = auth_client.post("/api/v1/auth/change-password",
                             json={"currentPassword": PW, "newPassword": NEW},
                             headers=auth(token))
        assert r.status_code == 200
        assert r.json()["access_token"]

    def test_can_login_with_new_password_only(self, auth_client):
        token = register(auth_client)
        auth_client.post("/api/v1/auth/change-password",
                         json={"currentPassword": PW, "newPassword": NEW},
                         headers=auth(token))
        assert auth_client.post("/api/v1/auth/login",
                                json={"email": "alice@example.com", "password": NEW}).status_code == 200
        assert auth_client.post("/api/v1/auth/login",
                                json={"email": "alice@example.com", "password": PW}).status_code == 401

    def test_old_token_is_invalidated(self, auth_client):
        """迴歸：變更密碼後，先前簽發的權杖必須失效，否則外洩的權杖仍可使用。"""
        token = register(auth_client)
        assert auth_client.get("/api/v1/auth/me", headers=auth(token)).status_code == 200
        auth_client.post("/api/v1/auth/change-password",
                         json={"currentPassword": PW, "newPassword": NEW},
                         headers=auth(token))
        assert auth_client.get("/api/v1/auth/me", headers=auth(token)).status_code == 401

    def test_new_token_still_works(self, auth_client):
        token = register(auth_client)
        r = auth_client.post("/api/v1/auth/change-password",
                             json={"currentPassword": PW, "newPassword": NEW},
                             headers=auth(token))
        assert auth_client.get("/api/v1/auth/me",
                               headers=auth(r.json()["access_token"])).status_code == 200

    def test_rejects_wrong_current_password(self, auth_client):
        token = register(auth_client)
        r = auth_client.post("/api/v1/auth/change-password",
                             json={"currentPassword": "wrong", "newPassword": NEW},
                             headers=auth(token))
        assert r.status_code == 400

    def test_rejects_same_password(self, auth_client):
        token = register(auth_client)
        r = auth_client.post("/api/v1/auth/change-password",
                             json={"currentPassword": PW, "newPassword": PW},
                             headers=auth(token))
        assert r.status_code == 400

    def test_rejects_weak_new_password(self, auth_client):
        token = register(auth_client)
        r = auth_client.post("/api/v1/auth/change-password",
                             json={"currentPassword": PW, "newPassword": "short"},
                             headers=auth(token))
        assert r.status_code == 422

    def test_requires_authentication(self, auth_client):
        r = auth_client.post("/api/v1/auth/change-password",
                             json={"currentPassword": PW, "newPassword": NEW})
        assert r.status_code == 401


def _issued_token(caplog):
    """從日誌取出重設權杖；權杖不會出現在 API 回應中。"""
    m = re.search(r"token=([\w\-]+)", caplog.text)
    return m.group(1) if m else None


class TestForgotPassword:
    def test_always_returns_202_for_unknown_email(self, auth_client):
        """不得透露信箱是否已註冊，否則淪為帳號探測工具。"""
        r = auth_client.post("/api/v1/auth/forgot-password",
                             json={"email": "nobody@example.com"})
        assert r.status_code == 202

    def test_same_response_for_known_and_unknown(self, auth_client):
        register(auth_client)
        known = auth_client.post("/api/v1/auth/forgot-password", json={"email": "alice@example.com"})
        unknown = auth_client.post("/api/v1/auth/forgot-password", json={"email": "nobody@example.com"})
        assert known.status_code == unknown.status_code
        assert known.json() == unknown.json()

    def test_token_is_not_returned_in_response(self, auth_client):
        register(auth_client)
        r = auth_client.post("/api/v1/auth/forgot-password", json={"email": "alice@example.com"})
        assert "token" not in r.text.lower()

    def test_token_is_stored_hashed(self, auth_client, db_session, caplog):
        from backend.models.db_models import PasswordResetToken
        register(auth_client)
        with caplog.at_level("INFO", logger="mixmaster.auth"):
            auth_client.post("/api/v1/auth/forgot-password", json={"email": "alice@example.com"})
        raw = _issued_token(caplog)
        assert raw
        row = db_session.query(PasswordResetToken).one()
        assert row.token_hash != raw, "資料庫不應存放明文權杖"
        assert len(row.token_hash) == 64


class TestResetPassword:
    @pytest.fixture
    def raw_token(self, auth_client, caplog):
        register(auth_client)
        with caplog.at_level("INFO", logger="mixmaster.auth"):
            auth_client.post("/api/v1/auth/forgot-password", json={"email": "alice@example.com"})
        return _issued_token(caplog)

    def test_resets_password(self, auth_client, raw_token):
        r = auth_client.post("/api/v1/auth/reset-password",
                             json={"token": raw_token, "newPassword": NEW})
        assert r.status_code == 200
        assert auth_client.post("/api/v1/auth/login",
                                json={"email": "alice@example.com", "password": NEW}).status_code == 200

    def test_token_is_single_use(self, auth_client, raw_token):
        auth_client.post("/api/v1/auth/reset-password",
                         json={"token": raw_token, "newPassword": NEW})
        again = auth_client.post("/api/v1/auth/reset-password",
                                 json={"token": raw_token, "newPassword": "yet-another-password"})
        assert again.status_code == 400

    def test_rejects_unknown_token(self, auth_client):
        r = auth_client.post("/api/v1/auth/reset-password",
                             json={"token": "definitely-not-a-real-token", "newPassword": NEW})
        assert r.status_code == 400

    def test_rejects_expired_token(self, auth_client, db_session, raw_token):
        from datetime import UTC, datetime, timedelta

        from backend.models.db_models import PasswordResetToken
        row = db_session.query(PasswordResetToken).one()
        row.expires_at = datetime.now(UTC) - timedelta(minutes=1)
        db_session.commit()
        r = auth_client.post("/api/v1/auth/reset-password",
                             json={"token": raw_token, "newPassword": NEW})
        assert r.status_code == 400

    def test_reset_invalidates_old_tokens(self, auth_client, caplog):
        token = register(auth_client, email="bob@example.com")
        with caplog.at_level("INFO", logger="mixmaster.auth"):
            auth_client.post("/api/v1/auth/forgot-password", json={"email": "bob@example.com"})
        raw = _issued_token(caplog)
        auth_client.post("/api/v1/auth/reset-password", json={"token": raw, "newPassword": NEW})
        assert auth_client.get("/api/v1/auth/me", headers=auth(token)).status_code == 401

    def test_change_password_revokes_pending_reset_tokens(self, auth_client, caplog):
        token = register(auth_client)
        with caplog.at_level("INFO", logger="mixmaster.auth"):
            auth_client.post("/api/v1/auth/forgot-password", json={"email": "alice@example.com"})
        raw = _issued_token(caplog)
        r = auth_client.post("/api/v1/auth/change-password",
                             json={"currentPassword": PW, "newPassword": NEW},
                             headers=auth(token))
        assert r.status_code == 200
        # 已變更密碼，先前申請的重設連結不應再有效
        assert auth_client.post("/api/v1/auth/reset-password",
                                json={"token": raw, "newPassword": "third-password"}).status_code == 400


class TestUpdateProfile:
    def test_updates_display_name(self, auth_client):
        token = register(auth_client)
        r = auth_client.patch("/api/v1/auth/me", json={"displayName": "新名字"},
                              headers=auth(token))
        assert r.status_code == 200 and r.json()["displayName"] == "新名字"

    def test_requires_authentication(self, auth_client):
        assert auth_client.patch("/api/v1/auth/me", json={"displayName": "x"}).status_code == 401

    def test_rejects_empty_name(self, auth_client):
        token = register(auth_client)
        assert auth_client.patch("/api/v1/auth/me", json={"displayName": ""},
                                 headers=auth(token)).status_code == 422
