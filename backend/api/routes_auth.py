"""routes_auth.py — 註冊、登入、帳號資訊與密碼管理"""
import logging
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..auth import (
    create_access_token,
    generate_reset_token,
    get_current_user,
    hash_password,
    hash_reset_token,
    verify_password,
)
from ..db import get_db
from ..models.db_models import PasswordResetToken, User

router = APIRouter(prefix="/auth", tags=["Auth 🔐"])
logger = logging.getLogger("mixmaster.auth")

MIN_PASSWORD_LENGTH = 8


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=MIN_PASSWORD_LENGTH, max_length=128)
    display_name: str = Field("", alias="displayName", max_length=80)

    model_config = {"populate_by_name": True}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    email: str
    display_name: str = Field(..., alias="displayName")

    model_config = {"populate_by_name": True, "from_attributes": True}


TokenResponse.model_rebuild()


def _to_out(user: User) -> UserOut:
    return UserOut(id=user.id, email=user.email, displayName=user.display_name)


@router.post("/register", status_code=status.HTTP_201_CREATED,
             response_model=TokenResponse, summary="註冊帳號")
async def register(body: RegisterRequest, db: Session = Depends(get_db)):
    email = body.email.lower()
    user = User(
        email=email,
        display_name=body.display_name or email.split("@")[0],
        password_hash=hash_password(body.password),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        # 唯一索引是併發情況下的最終防線，先查詢再寫入仍可能競爭
        raise HTTPException(status.HTTP_409_CONFLICT, detail="此電子郵件已註冊") from e
    db.refresh(user)
    return TokenResponse(access_token=create_access_token(user.id, user.token_version), user=_to_out(user))


@router.post("/login", response_model=TokenResponse, summary="登入")
async def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == body.email.lower()))
    # 帳號不存在與密碼錯誤回傳相同訊息，避免洩漏哪些信箱已註冊
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="電子郵件或密碼錯誤")
    return TokenResponse(access_token=create_access_token(user.id, user.token_version), user=_to_out(user))


@router.get("/me", response_model=UserOut, summary="目前登入的帳號")
async def me(user: User = Depends(get_current_user)):
    return _to_out(user)


# ── 密碼管理 ────────────────────────────────────────────────

RESET_TOKEN_TTL = timedelta(hours=1)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., alias="currentPassword", max_length=128)
    new_password: str = Field(..., alias="newPassword",
                              min_length=MIN_PASSWORD_LENGTH, max_length=128)

    model_config = {"populate_by_name": True}


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=8, max_length=256)
    new_password: str = Field(..., alias="newPassword",
                              min_length=MIN_PASSWORD_LENGTH, max_length=128)

    model_config = {"populate_by_name": True}


class UpdateProfileRequest(BaseModel):
    display_name: str = Field(..., alias="displayName", min_length=1, max_length=80)

    model_config = {"populate_by_name": True}


@router.post("/change-password", response_model=TokenResponse, summary="變更密碼")
async def change_password(
    body: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(body.current_password, user.password_hash):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="目前密碼不正確")
    if body.new_password == body.current_password:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="新密碼不可與目前密碼相同")

    user.password_hash = hash_password(body.new_password)
    user.password_changed_at = datetime.now(UTC)
    user.token_version += 1          # 使先前簽發的所有權杖失效
    # 變更密碼即撤銷所有尚未使用的重設權杖
    for t in user.reset_tokens:
        if t.used_at is None:
            t.used_at = datetime.now(UTC)
    db.commit()
    db.refresh(user)
    # 舊權杖已因 password_changed_at 而失效，需回傳新的權杖
    return TokenResponse(access_token=create_access_token(user.id, user.token_version), user=_to_out(user))


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED, summary="申請密碼重設")
async def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    一律回傳 202，不透露該信箱是否已註冊——否則此端點會淪為帳號探測工具。

    重設連結目前輸出至伺服器日誌；正式環境應改接電子郵件服務。
    絕不可將權杖放進 API 回應，否則任何人都能重設他人密碼。
    """
    user = db.scalar(select(User).where(User.email == body.email.lower()))
    if user is not None:
        raw, hashed = generate_reset_token()
        db.add(PasswordResetToken(
            user_id=user.id,
            token_hash=hashed,
            expires_at=datetime.now(UTC) + RESET_TOKEN_TTL,
        ))
        db.commit()
        logger.info("密碼重設連結（%s）：/account/reset?token=%s", user.email, raw)
    return {"detail": "若該電子郵件已註冊，重設連結將寄送至該信箱"}


@router.post("/reset-password", response_model=TokenResponse, summary="以權杖重設密碼")
async def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    row = db.scalar(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == hash_reset_token(body.token)
        )
    )
    now = datetime.now(UTC)
    if row is None or row.used_at is not None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="重設連結無效或已過期")

    expires = row.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=UTC)
    if expires < now:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="重設連結無效或已過期")

    user = db.get(User, row.user_id)
    if user is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="重設連結無效或已過期")

    user.password_hash = hash_password(body.new_password)
    user.password_changed_at = now
    user.token_version += 1          # 使先前簽發的所有權杖失效
    row.used_at = now
    db.commit()
    db.refresh(user)
    return TokenResponse(access_token=create_access_token(user.id, user.token_version), user=_to_out(user))


@router.patch("/me", response_model=UserOut, summary="更新帳號資料")
async def update_profile(
    body: UpdateProfileRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.display_name = body.display_name.strip()
    db.commit()
    db.refresh(user)
    return _to_out(user)
