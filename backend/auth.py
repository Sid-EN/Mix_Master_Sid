"""
auth.py — 密碼雜湊與 JWT 存取權杖

密碼以 bcrypt 雜湊儲存，永不以明文或可逆形式保存。
權杖以 HS256 簽章，密鑰取自設定；正式環境務必覆寫 SECRET_KEY。
"""
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


def create_access_token(user_id: int) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> int:
    """回傳權杖對應的使用者 id；無效時拋出 401。"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        subject = payload.get("sub")
        if subject is None:
            raise CREDENTIALS_ERROR
        return int(subject)
    except (JWTError, ValueError) as e:
        raise CREDENTIALS_ERROR from e


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """取得目前登入的使用者；未提供或無效權杖一律 401。"""
    if not token:
        raise CREDENTIALS_ERROR
    user = db.get(User, decode_token(token))
    if user is None:
        # 權杖簽章有效但帳號已被刪除
        raise CREDENTIALS_ERROR
    return user
