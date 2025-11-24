from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import bcrypt

from jose import JWTError, jwt

from .config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def get_password_hash(password: str) -> str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')


def _create_token(subject: str, expires_delta: timedelta, token_type: str) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode: Dict[str, Any] = {"sub": subject, "exp": expire, "type": token_type}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_access_token(subject: str, expires_minutes: Optional[int] = None) -> str:
    minutes = expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    return _create_token(subject, timedelta(minutes=minutes), "access")


def create_refresh_token(subject: str, expires_minutes: Optional[int] = None) -> str:
    minutes = expires_minutes or settings.REFRESH_TOKEN_EXPIRE_MINUTES
    return _create_token(subject, timedelta(minutes=minutes), "refresh")


def decode_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as exc:
        raise ValueError("Invalid token") from exc