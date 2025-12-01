from functools import lru_cache
from pathlib import Path
from typing import Literal, Optional

from pydantic import EmailStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "memshaheb-backend"
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 14

    INITIAL_ADMIN_EMAIL: EmailStr = "admin@example.com"
    INITIAL_ADMIN_PASSWORD: str = "ChangeMePlease!"
    INITIAL_ADMIN_DISPLAY_NAME: Optional[str] = "Administrator"

    MEDIA_STORAGE_BACKEND: Literal["local", "s3"] = "local"
    MEDIA_LOCAL_ROOT: Path = Path("backend/media")
    MEDIA_BASE_URL: str = "http://localhost:8001/media"
    MEDIA_S3_BUCKET: Optional[str] = None
    MEDIA_S3_REGION: Optional[str] = None
    MEDIA_S3_ENDPOINT_URL: Optional[str] = None
    MEDIA_S3_ACCESS_KEY_ID: Optional[str] = None
    MEDIA_S3_SECRET_ACCESS_KEY: Optional[str] = None
    MEDIA_SIGNED_URL_EXPIRE_SECONDS: int = 3600

    WC_STORE_URL: Optional[str] = None
    WC_CONSUMER_KEY: Optional[str] = None
    WC_CONSUMER_SECRET: Optional[str] = None
    WC_WEBHOOK_SECRET: Optional[str] = None
    WC_API_VERSION: str = "v3"
    WC_MAX_RETRIES: int = 3
    WC_RETRY_BACKOFF_SECONDS: float = 1.5

    REQUEST_ID_HEADER: str = "X-Request-ID"
    DEFAULT_RATE_LIMIT: str = "60/minute"
    CORS_ALLOW_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://memsahebbd.com",
        "https://www.memsahebbd.com",
        "https://api.memsahebbd.com",
        "http://memsahebbd.com",
        "http://www.memsahebbd.com",
        "http://api.memsahebbd.com",
    ]
    CORS_ALLOW_ORIGIN_REGEX: Optional[str] = r"https?://([^.]+\\.)?memsahebbd\\.com"
    CORS_ALLOW_METHODS: list[str] = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    CORS_ALLOW_HEADERS: list[str] = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True

    @field_validator("DATABASE_URL")
    @classmethod
    def ensure_postgres_url(cls, v: str) -> str:
        if not v.startswith("postgresql"):
            raise ValueError("DATABASE_URL must be a PostgreSQL URL.")
        return v

    @field_validator("MEDIA_BASE_URL")
    @classmethod
    def ensure_media_base_url(cls, v: str) -> str:
        if not v:
            raise ValueError("MEDIA_BASE_URL cannot be empty")
        return v.rstrip("/")

    @field_validator("MEDIA_LOCAL_ROOT")
    @classmethod
    def ensure_media_root(cls, v: Path) -> Path:
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
