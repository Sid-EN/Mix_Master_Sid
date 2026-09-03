"""
db_models.py — 帳號與使用者資料的 ORM 模型

使用者資料（我的酒櫃、收藏、學習進度等）在前端本就是形狀各異的 JSON，
且會隨功能演進而變動。因此不為每項功能各建一張表，而以 (user_id, key)
為索引的 JSONB 文件儲存——既沿用前端既有的資料形狀，也免除每次調整
功能就要遷移結構。日後若有跨使用者查詢需求（例如「哪些人收藏了某配方」），
可再將該項目正規化為獨立資料表。
"""
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, func
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
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=_utcnow, nullable=False
    )

    data: Mapped[list["UserData"]] = relationship(
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
