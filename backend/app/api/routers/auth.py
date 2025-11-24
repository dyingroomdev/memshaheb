from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, get_current_user
from app.core.security import decode_token
from app.models.user import User
from app.schemas.auth import LoginRequest, RefreshRequest, TokenResponse
from app.services.auth import authenticate_user, issue_tokens_for_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db_session)) -> TokenResponse:
    user = authenticate_user(db, email=data.email, password=data.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    tokens = issue_tokens_for_user(user)
    return TokenResponse(**tokens)


@router.post("/refresh", response_model=TokenResponse)
def refresh_tokens(data: RefreshRequest, db: Session = Depends(get_db_session)) -> TokenResponse:
    try:
        payload = decode_token(data.refresh_token)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if payload.get("type") != "refresh":
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

    tokens = issue_tokens_for_user(user)
    return TokenResponse(**tokens)


@router.get("/verify")
def verify_token(current_user: User = Depends(get_current_user)) -> dict:
    return {"user_id": current_user.id, "email": current_user.email}