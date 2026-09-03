"""
db.py — 資料庫連線與 Session 管理

配方與材料等靜態內容仍以 JSON 檔提供（見 data_store.py）；
資料庫僅用於帳號與使用者個人資料。
"""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import get_settings

settings = get_settings()

# pool_pre_ping：連線閒置後可能被資料庫端關閉，取用前先探測避免拋出陳舊連線
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    future=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """所有 ORM 模型的基底。"""


def get_db() -> Generator[Session, None, None]:
    """FastAPI 相依項：每個請求一個 Session，結束時確保關閉。"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
