"""
auth.py — 密碼雜湊與 JWT 存取權杖

密碼以 bcrypt 雜湊儲存，永不以明文或可逆形式保存。
權杖以 HS256 簽章，密鑰取自設定；正式環境務必覆寫 SECRET_KEY。
"""
import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .config import get_settings
from .db import get_db
from .models.db_models import User

settings = get_settings()

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="憑證無效或已過期",
    headers={"WWW-Authenticate": "Bearer"},
)


def hash_password(password: str) -> str:
    # bcrypt 僅取前 72 bytes，超過部分會被靜默截斷；先行截斷以免行為不一致
    return _pwd.hash(password[:72])


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return _pwd.verify(password[:72], password_hash)
    except ValueError:
        # 雜湊格式毀損時不應讓登入端點拋出 500
        return False


def create_access_token(user_id: int, token_version: int = 0) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "ver": token_version,
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> tuple[int, int]:
    """回傳 (使用者 id, 權杖版本)；無效時拋出 401。"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        subject = payload.get("sub")
        if subject is None:
            raise CREDENTIALS_ERROR
        return int(subject), int(payload.get("ver", 0))
    except (JWTError, ValueError, TypeError) as e:
        raise CREDENTIALS_ERROR from e


def hash_reset_token(raw: str) -> str:
    """重設權杖為高熵隨機值，以 SHA-256 雜湊即可，不需 bcrypt 的計算成本。"""
    return hashlib.sha256(raw.encode()).hexdigest()


def generate_reset_token() -> tuple[str, str]:
    """
    產生密碼重設權杖，回傳 (明文, 雜湊)。

    明文僅透過重設連結交付使用者，資料庫只存雜湊；
    如此即使資料庫外洩，也無法據以重設他人密碼。
    """
    raw = secrets.token_urlsafe(32)
    return raw, hash_reset_token(raw)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """取得目前登入的使用者；未提供或無效權杖一律 401。"""
    if not token:
        raise CREDENTIALS_ERROR
    user_id, version = decode_token(token)
    user = db.get(User, user_id)
    if user is None:
        # 權杖簽章有效但帳號已被刪除
        raise CREDENTIALS_ERROR
    # 變更或重設密碼會遞增版本，使先前簽發的權杖全部失效
    if version != user.token_version:
        raise CREDENTIALS_ERROR
    return user
