"""config.py — 應用設定管理（pydantic-settings）"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # 應用
    app_name: str = "MixMaster API"
    app_version: str = "1.0.0-alpha"
    environment: str = "development"
    app_debug: bool = True

    # 資料庫
    database_url: str = "postgresql://mixmaster_user:password@localhost:5432/mixmaster_db"

    # 安全
    secret_key: str = "change-me-in-production-min-32-chars"
    allowed_origins: list[str] = ["*"]

    # 速率限制
    rate_limit_default: str = "100/minute"
    rate_limit_engine: str = "10/minute"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
