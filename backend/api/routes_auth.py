"""routes_auth.py — 註冊、登入與帳號資訊"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..auth import create_access_token, get_current_user, hash_password, verify_password
from ..db import get_db
from ..models.db_models import User

router = APIRouter(prefix="/auth", tags=["Auth 🔐"])

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
    return TokenResponse(access_token=create_access_token(user.id), user=_to_out(user))


@router.post("/login", response_model=TokenResponse, summary="登入")
async def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == body.email.lower()))
    # 帳號不存在與密碼錯誤回傳相同訊息，避免洩漏哪些信箱已註冊
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="電子郵件或密碼錯誤")
    return TokenResponse(access_token=create_access_token(user.id), user=_to_out(user))


@router.get("/me", response_model=UserOut, summary="目前登入的帳號")
async def me(user: User = Depends(get_current_user)):
    return _to_out(user)
