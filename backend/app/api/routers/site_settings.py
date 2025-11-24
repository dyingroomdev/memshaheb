from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_roles
from app.core.rate_limit import limiter
from app.models.site_settings import SiteSettings
from app.models.user import User, UserRole
from app.schemas.site_settings import SiteSettingsRead, SiteSettingsUpdate

router = APIRouter(prefix="/site/settings", tags=["site-settings"])


def _get_or_create_settings(db: Session) -> SiteSettings:
    settings = db.query(SiteSettings).order_by(SiteSettings.id.asc()).first()
    if settings:
        return settings
    settings = SiteSettings()
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


@router.get("", response_model=SiteSettingsRead)
@limiter.limit("30/minute")
def get_settings(request: Request, response: Response, db: Session = Depends(get_db_session)) -> SiteSettingsRead:
    settings = _get_or_create_settings(db)
    # normalize nav_links shape (older rows may store an object)
    if isinstance(settings.nav_links, dict):
        settings.nav_links = []
        db.commit()
        db.refresh(settings)
    return SiteSettingsRead.model_validate(settings)


@router.patch("", response_model=SiteSettingsRead)
def update_settings(
    payload: SiteSettingsUpdate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> SiteSettingsRead:
    settings = _get_or_create_settings(db)
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No updates provided")

    for field, value in data.items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)
    return SiteSettingsRead.model_validate(settings)
