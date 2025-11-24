from collections.abc import Callable
from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, HTTPException, Query, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User, UserRole

reusable_oauth2 = HTTPBearer(auto_error=False)


def get_db_session() -> Session:
    yield from get_db()


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Security(reusable_oauth2)],
    db: Session = Depends(get_db_session),
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        payload = decode_token(credentials.credentials)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    subject = payload.get("sub")
    if subject is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

    try:
        user_id = int(subject)
    except (TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject") from None

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


def get_current_user_optional(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Security(reusable_oauth2)],
    db: Session = Depends(get_db_session),
) -> User | None:
    if credentials is None:
        return None
    if credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication scheme")
    return get_current_user(credentials, db)


def require_roles(*roles: UserRole) -> Callable[[User], User]:
    role_set = set(roles)

    def _dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in role_set:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user

    return _dependency


@dataclass(slots=True)
class PaginationParams:
    page: int
    page_size: int

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


def get_pagination(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
) -> PaginationParams:
    return PaginationParams(page=page, page_size=page_size)
