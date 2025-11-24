from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_roles
from app.models.user import User, UserRole
from app.schemas.user import (
    PasswordChange,
    UserCreate,
    UserProfileUpdate,
    UserRead,
    UserUpdateAdmin,
)
from app.services.auth import create_user, verify_password, get_password_hash

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
def list_users(
    role: Optional[UserRole] = None,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> list[UserRead]:
    stmt = db.query(User).order_by(User.created_at.desc())
    if role:
        stmt = stmt.filter(User.role == role)
    return [UserRead.model_validate(user) for user in stmt.all()]


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user_endpoint(
    data: UserCreate,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN)),
) -> UserRead:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = create_user(
        db,
        email=data.email,
        password=data.password,
        role=data.role,
        display_name=data.display_name,
        bio=data.bio,
    )
    return UserRead.model_validate(user)


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR, UserRole.READER))) -> UserRead:
    return UserRead.model_validate(current_user)


@router.put("/me", response_model=UserRead)
def update_me(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR, UserRole.READER)),
) -> UserRead:
    data = payload.model_dump(exclude_unset=True)
    if "email" in data:
        existing = db.query(User).filter(User.email == data["email"], User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")
    for field, value in data.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return UserRead.model_validate(current_user)


@router.post("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: PasswordChange,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR, UserRole.READER)),
) -> None:
    if not verify_password(payload.old_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect current password")
    current_user.password_hash = get_password_hash(payload.new_password)
    db.commit()


@router.put("/{user_id}", response_model=UserRead)
def update_user_admin(
    user_id: int,
    payload: UserUpdateAdmin,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN)),
) -> UserRead:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    data = payload.model_dump(exclude_unset=True)
    if "email" in data:
        existing = db.query(User).filter(User.email == data["email"], User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")
    for field, value in data.items():
        if field == "password":
            user.password_hash = get_password_hash(value)
        else:
            setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return UserRead.model_validate(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_admin(
    user_id: int,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN)),
) -> None:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
