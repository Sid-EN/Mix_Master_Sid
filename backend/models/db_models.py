"""
db_models.py — 帳號與使用者資料的 ORM 模型

使用者資料（我的酒櫃、收藏、學習進度等）在前端本就是形狀各異的 JSON，
且會隨功能演進而變動。因此不為每項功能各建一張表，而以 (user_id, key)
為索引的 JSONB 文件儲存——既沿用前端既有的資料形狀，也免除每次調整
功能就要遷移結構。日後若有跨使用者查詢需求（例如「哪些人收藏了某配方」），
可再將該項目正規化為獨立資料表。
"""
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base


def _utcnow() -> datetime:
    return datetime.now(UTC)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    # 以小寫正規化後儲存，避免同一信箱因大小寫不同而重複註冊
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(80), nullable=False, default="")
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    password_changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    # 權杖版本；變更或重設密碼時遞增，使先前簽發的權杖全部失效。
    # 不以簽發時間比對——JWT 的 iat 僅有秒精度，同一秒內簽發與撤銷無從區分。
    token_version: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=_utcnow, nullable=False
    )

    data: Mapped[list["UserData"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    reset_tokens: Mapped[list["PasswordResetToken"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    recipes: Mapped[list["UserRecipe"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class UserData(Base):
    """單一使用者的一組個人資料，key 對應前端原本的 localStorage 鍵。"""

    __tablename__ = "user_data"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    key: Mapped[str] = mapped_column(String(64), nullable=False)
    value: Mapped[dict | list] = mapped_column(JSONB, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=_utcnow, nullable=False
    )

    user: Mapped[User] = relationship(back_populates="data")

    __table_args__ = (
        Index("ix_user_data_user_key", "user_id", "key", unique=True),
    )


class PasswordResetToken(Base):
    """
    密碼重設權杖。

    僅保存雜湊值：資料庫外洩時，攻擊者無法據以重設任何人的密碼。
    權杖具時效且僅能使用一次。
    """

    __tablename__ = "password_reset_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token_hash: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped[User] = relationship(back_populates="reset_tokens")


class UserRecipe(Base):
    """
    使用者自建配方。

    先前以 JSON 檔儲存且無擁有者概念，任何人都能刪改他人的配方。
    改存資料庫並綁定帳號後，僅擁有者可修改。

    配方內容欄位會隨功能演進，故以 JSONB 整包儲存；
    slug 與分享權杖則獨立成欄，因需建立唯一索引供查詢。
    """

    __tablename__ = "user_recipes"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    # 公開分享用的不可猜測權杖；為 None 代表未公開。
    # 不直接以 slug 作為公開網址，否則無從撤銷分享。
    share_token: Mapped[str | None] = mapped_column(
        String(64), unique=True, index=True, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=_utcnow, nullable=False
    )

    user: Mapped[User] = relationship(back_populates="recipes")
