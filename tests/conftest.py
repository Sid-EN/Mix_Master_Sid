"""共用 fixture：資料檔與 API client。"""
import json
import os
import sys

import pytest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

# 測試會在數秒內送出數百次請求；限流開啟時會造成隨機失敗。
# 限流本身另由 test_rate_limit.py 以獨立的應用實例驗證。
os.environ.setdefault("RATE_LIMIT_ENABLED", "false")

DATA_DIR = os.path.join(ROOT, "backend", "data")


def _load(name):
    with open(os.path.join(DATA_DIR, name), encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="session")
def ingredients():
    return _load("ingredients.json")


@pytest.fixture(scope="session")
def ingredient_index(ingredients):
    return {i["id"]: i for i in ingredients}


@pytest.fixture(scope="session")
def recipes():
    return _load("classic_recipes.json")


@pytest.fixture(scope="session")
def preps():
    return _load("prep_recipes.json")


@pytest.fixture(scope="session")
def client():
    """FastAPI TestClient；整個測試 session 共用一個應用實例。"""
    from fastapi.testclient import TestClient

    from backend.main import app
    with TestClient(app) as c:
        yield c


def _resolve_test_db_url() -> str | None:
    """
    決定測試資料庫連線字串。

    優先使用 TEST_DATABASE_URL（CI 以服務容器提供）；否則沿用開發連線設定，
    僅將資料庫名稱換成 *_test，避免測試污染實際帳號資料。
    無法取得時回傳 None，相關測試會被跳過而非讓整個套件失敗。
    """
    explicit = os.environ.get("TEST_DATABASE_URL")
    if explicit:
        return explicit
    try:
        from backend.config import get_settings
        dev = get_settings().database_url
    except Exception:
        return None
    if not dev or "@" not in dev:
        return None
    base, _, name = dev.rpartition("/")
    return f"{base}/{name}_test" if name and not name.endswith("_test") else dev


@pytest.fixture(scope="session")
def db_url() -> str:
    url = _resolve_test_db_url()
    if not url:
        pytest.skip("未設定測試資料庫（TEST_DATABASE_URL 或 backend/.env）")
    return url


@pytest.fixture(scope="session")
def _db_engine(db_url):
    """建立測試資料庫結構；整個 session 共用。"""
    from sqlalchemy import create_engine
    from sqlalchemy.exc import OperationalError

    from backend.db import Base
    from backend.models import db_models  # noqa: F401  匯入以註冊模型

    engine = create_engine(db_url, pool_pre_ping=True)
    try:
        Base.metadata.drop_all(engine)
        Base.metadata.create_all(engine)
    except OperationalError as e:
        engine.dispose()
        pytest.skip(f"無法連線測試資料庫：{e}")
    yield engine
    engine.dispose()


@pytest.fixture
def db_session(_db_engine):
    """每個測試一個乾淨的資料狀態。"""
    from sqlalchemy.orm import sessionmaker

    from backend.models.db_models import User

    Session = sessionmaker(bind=_db_engine, expire_on_commit=False)
    session = Session()
    # 逐測試清空；cascade 會一併移除 user_data
    session.query(User).delete()
    session.commit()
    yield session
    session.close()


@pytest.fixture
def auth_client(_db_engine, db_session):
    """已接上測試資料庫的 API client。"""
    from fastapi.testclient import TestClient
    from sqlalchemy.orm import sessionmaker

    from backend.db import get_db
    from backend.main import app

    Session = sessionmaker(bind=_db_engine, expire_on_commit=False)

    def _override():
        s = Session()
        try:
            yield s
        finally:
            s.close()

    app.dependency_overrides[get_db] = _override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.pop(get_db, None)
