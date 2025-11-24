from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User, UserRole


def authenticate_user(db: Session, *, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def create_user(
    db: Session,
    *,
    email: str,
    password: str,
    role: UserRole,
    display_name: str | None = None,
    bio: str | None = None,
) -> User:
    user = User(email=email, password_hash=get_password_hash(password), role=role, display_name=display_name, bio=bio)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def issue_tokens_for_user(user: User) -> dict[str, str]:
    subject = str(user.id)
    return {
        "access_token": create_access_token(subject),
        "refresh_token": create_refresh_token(subject),
        "token_type": "bearer",
    }
