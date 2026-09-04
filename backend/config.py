"""config.py — 應用設定管理（pydantic-settings）"""
import os
from functools import lru_cache

from pydantic_settings import BaseSettings

# .env 位於 backend/ 之下；以絕對路徑指定，避免因啟動時的工作目錄不同而讀不到
# （應用實際由專案根目錄以 `uvicorn backend.main:app` 啟動）
_ENV_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")


class Settings(BaseSettings):
    # 應用
    app_name: str = "MixMaster API"
    app_version: str = "2.3.0"
    environment: str = "development"
    app_debug: bool = True

    # 資料庫
    database_url: str = "postgresql://mixmaster_user:password@localhost:5432/mixmaster_db"

    # 安全
    secret_key: str = "change-me-in-production-min-32-chars"   # 正式環境必須覆寫
    allowed_origins: list[str] = ["*"]

    # JWT
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7   # 7 天

    # 速率限制
    # 開發與測試時關閉，避免測試套件因限流而不穩定；正式環境預設開啟。
    rate_limit_enabled: bool = True
    rate_limit_default: str = "100/minute"
    rate_limit_engine: str = "10/minute"

    class Config:
        env_file = _ENV_FILE
        case_sensitive = False


DEFAULT_SECRET_KEY = "change-me-in-production-min-32-chars"


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    # 以預設密鑰簽發的 JWT 任何人都能偽造；正式環境必須攔阻，
    # 否則此疏漏會在部署後靜默生效而無人察覺。
    if settings.environment == "production" and settings.secret_key == DEFAULT_SECRET_KEY:
        raise RuntimeError(
            "SECRET_KEY 仍為預設值，正式環境不得使用。請設定足夠長度的隨機密鑰："
            "SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(48))')"
        )
    return settings
