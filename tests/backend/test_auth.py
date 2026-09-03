"""
帳號與認證測試 (D2)

安全性相關行為（密碼雜湊、權杖驗證、使用者隔離）必須有測試把關，
否則一次重構就可能悄悄開放他人資料。
"""
from datetime import UTC

import pytest

VALID = {"email": "alice@example.com", "password": "a-good-password", "displayName": "Alice"}


def register(client, **over):
    return client.post("/api/v1/auth/register", json={**VALID, **over})


def token_of(client, **over):
    return register(client, **over).json()["access_token"]


def auth(token):
    return {"Authorization": f"Bearer {token}"}


class TestRegister:
    def test_creates_account_and_returns_token(self, auth_client):
        r = register(auth_client)
        assert r.status_code == 201
        body = r.json()
        assert body["access_token"]
        assert body["user"]["email"] == "alice@example.com"

    def test_email_is_normalised_to_lowercase(self, auth_client):
        r = register(auth_client, email="MiXeD@Example.COM")
        assert r.json()["user"]["email"] == "mixed@example.com"

    def test_duplicate_email_conflicts(self, auth_client):
        register(auth_client)
        assert register(auth_client).status_code == 409

    def test_duplicate_is_case_insensitive(self, auth_client):
        register(auth_client, email="dup@example.com")
        assert register(auth_client, email="DUP@example.com").status_code == 409

    @pytest.mark.parametrize("password", ["", "short", "1234567"])
    def test_rejects_weak_password(self, auth_client, password):
        assert register(auth_client, password=password).status_code == 422

    @pytest.mark.parametrize("email", ["not-an-email", "@example.com", ""])
    def test_rejects_invalid_email(self, auth_client, email):
        assert register(auth_client, email=email).status_code == 422

    def test_display_name_defaults_to_email_prefix(self, auth_client):
        r = register(auth_client, displayName="")
        assert r.json()["user"]["displayName"] == "alice"

    def test_password_is_never_returned(self, auth_client):
        body = register(auth_client).json()
        assert "password" not in str(body).lower() or "password_hash" not in str(body)
        assert "passwordHash" not in body["user"]


class TestPasswordStorage:
    def test_password_is_hashed_not_stored_plainly(self, auth_client, db_session):
        from backend.models.db_models import User
        register(auth_client, password="my-secret-password")
        user = db_session.query(User).filter_by(email="alice@example.com").one()
        assert user.password_hash != "my-secret-password"
        assert user.password_hash.startswith("$2")   # bcrypt
        assert "my-secret-password" not in user.password_hash


class TestLogin:
    def test_succeeds_with_correct_password(self, auth_client):
        register(auth_client)
        r = auth_client.post("/api/v1/auth/login",
                             json={"email": VALID["email"], "password": VALID["password"]})
        assert r.status_code == 200 and r.json()["access_token"]

    def test_fails_with_wrong_password(self, auth_client):
        register(auth_client)
        r = auth_client.post("/api/v1/auth/login",
                             json={"email": VALID["email"], "password": "wrong"})
        assert r.status_code == 401

    def test_unknown_and_wrong_password_are_indistinguishable(self, auth_client):
        """回應不應洩漏某個信箱是否已註冊。"""
        register(auth_client)
        wrong = auth_client.post("/api/v1/auth/login",
                                 json={"email": VALID["email"], "password": "wrong"})
        missing = auth_client.post("/api/v1/auth/login",
                                   json={"email": "nobody@example.com", "password": "wrong"})
        assert wrong.status_code == missing.status_code == 401
        assert wrong.json()["detail"] == missing.json()["detail"]

    def test_login_is_case_insensitive_on_email(self, auth_client):
        register(auth_client)
        r = auth_client.post("/api/v1/auth/login",
                             json={"email": "ALICE@EXAMPLE.COM", "password": VALID["password"]})
        assert r.status_code == 200


class TestCurrentUser:
    def test_returns_account_with_valid_token(self, auth_client):
        t = token_of(auth_client)
        r = auth_client.get("/api/v1/auth/me", headers=auth(t))
        assert r.status_code == 200 and r.json()["email"] == "alice@example.com"

    @pytest.mark.parametrize("headers", [
        {},
        {"Authorization": "Bearer not.a.real.token"},
        {"Authorization": "Bearer "},
        {"Authorization": "Basic abc"},
    ])
    def test_rejects_missing_or_invalid_token(self, auth_client, headers):
        assert auth_client.get("/api/v1/auth/me", headers=headers).status_code == 401

    def test_token_signed_with_other_secret_is_rejected(self, auth_client):
        from jose import jwt
        forged = jwt.encode({"sub": "1"}, "a-different-secret", algorithm="HS256")
        assert auth_client.get("/api/v1/auth/me", headers=auth(forged)).status_code == 401

    def test_expired_token_is_rejected(self, auth_client):
        from datetime import datetime, timedelta

        from jose import jwt

        from backend.config import get_settings
        s = get_settings()
        expired = jwt.encode(
            {"sub": "1", "exp": datetime.now(UTC) - timedelta(minutes=1)},
            s.secret_key, algorithm=s.jwt_algorithm)
        assert auth_client.get("/api/v1/auth/me", headers=auth(expired)).status_code == 401

    def test_token_for_deleted_account_is_rejected(self, auth_client, db_session):
        from backend.models.db_models import User
        t = token_of(auth_client)
        db_session.query(User).delete()
        db_session.commit()
        assert auth_client.get("/api/v1/auth/me", headers=auth(t)).status_code == 401
