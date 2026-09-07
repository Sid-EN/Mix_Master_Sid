"""
db_models.py — 帳號與使用者資料的 ORM 模型

使用者資料（我的酒櫃、收藏、學習進度等）在前端本就是形狀各異的 JSON，
且會隨功能演進而變動。因此不為每項功能各建一張表，而以 (user_id, key)
為索引的 JSONB 文件儲存——既沿用前端既有的資料形狀，也免除每次調整
功能就要遷移結構。日後若有跨使用者查詢需求（例如「哪些人收藏了某配方」），
可再將該項目正規化為獨立資料表。
"""
from datetime import UTC, datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
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
    push_subscriptions: Mapped[list["PushSubscription"]] = relationship(
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
    # 是否列入公開目錄。與 share_token 是兩件事：
    # 權杖分享是「知道網址的人看得到」，公開目錄是「所有人都找得到」。
    # 兩者分開，才不會有人以為只是傳給朋友卻被整站列出。
    is_public: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false", index=True
    )
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=_utcnow, nullable=False
    )

    user: Mapped[User] = relationship(back_populates="recipes")
    versions: Mapped[list["UserRecipeVersion"]] = relationship(
        back_populates="recipe", cascade="all, delete-orphan",
        order_by="UserRecipeVersion.version.desc()",
    )
    ratings: Mapped[list["RecipeRating"]] = relationship(
        back_populates="recipe", cascade="all, delete-orphan"
    )
    comments: Mapped[list["RecipeComment"]] = relationship(
        back_populates="recipe", cascade="all, delete-orphan"
    )


class UserRecipeVersion(Base):
    """
    配方的歷史版本。

    每次更新前先保存當下內容，使用者得以檢視改動並回溯。
    僅保留最近數版，避免長期編輯導致資料無限成長。
    """

    __tablename__ = "user_recipe_versions"

    id: Mapped[int] = mapped_column(primary_key=True)
    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("user_recipes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    recipe: Mapped[UserRecipe] = relationship(back_populates="versions")

    __table_args__ = (
        Index("ix_user_recipe_versions_recipe_version", "recipe_id", "version", unique=True),
    )


class RecipeRating(Base):
    """
    他人對已公開配方的評分。

    與 sync 中的 favorites 不同：後者是使用者自己的私人筆記與評分，
    此處是可跨使用者彙總的公開評價，故需獨立資料表。
    每位使用者對同一配方僅能有一筆評分。
    """

    __tablename__ = "recipe_ratings"

    id: Mapped[int] = mapped_column(primary_key=True)
    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("user_recipes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    score: Mapped[int] = mapped_column(Integer, nullable=False)   # 1–5
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=_utcnow, nullable=False
    )

    recipe: Mapped[UserRecipe] = relationship(back_populates="ratings")
    user: Mapped[User] = relationship()

    __table_args__ = (
        Index("ix_recipe_ratings_recipe_user", "recipe_id", "user_id", unique=True),
    )


class RecipeComment(Base):
    """已公開配方的留言。作者可刪自己的，配方擁有者可刪自己配方下的任一則。"""

    __tablename__ = "recipe_comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("user_recipes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    recipe: Mapped[UserRecipe] = relationship(back_populates="comments")
    user: Mapped[User] = relationship()


class PushSubscription(Base):
    """
    瀏覽器推播訂閱。

    每個裝置／瀏覽器各有一組 endpoint，同一使用者可有多筆。
    endpoint 由瀏覽器廠商的推送服務簽發，本身即為識別碼，故設為唯一。
    """

    __tablename__ = "push_subscriptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    endpoint: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    p256dh: Mapped[str] = mapped_column(String(255), nullable=False)
    auth: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped[User] = relationship(back_populates="push_subscriptions")


class Follow(Base):
    """
    追蹤關係。

    只記錄「誰追蹤誰」；被追蹤者不需同意，也看不到追蹤者名單——
    公開的只有配方，追蹤本身屬於追蹤者的個人資料。

    以 (follower_id, followee_id) 建立唯一索引，
    重複追蹤在資料庫層即被擋下，不必仰賴應用層先查再寫。
    """

    __tablename__ = "follows"
    __table_args__ = (
        UniqueConstraint("follower_id", "followee_id", name="uq_follow_pair"),
        CheckConstraint("follower_id <> followee_id", name="ck_follow_not_self"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    follower_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    followee_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
