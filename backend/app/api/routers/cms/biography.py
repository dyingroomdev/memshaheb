from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_roles
from app.models.biography import Biography
from app.models.user import User, UserRole
from app.schemas.biography import BiographyRead, BiographyUpdate
from app.core.config import settings

router = APIRouter(prefix="/biography", tags=["biography"])


def _get_singleton(db: Session) -> Biography:
    biography = db.query(Biography).order_by(Biography.id.asc()).first()
    if not biography:
        biography = Biography(name="Memshaheb", timeline=[])
        db.add(biography)
        db.commit()
        db.refresh(biography)
        return biography

    mutated = False
    if biography.name is None:
        biography.name = "Memshaheb"
        mutated = True
    if biography.timeline is None:
        biography.timeline = []
        mutated = True
    if mutated:
        db.commit()
        db.refresh(biography)
    return biography


def _normalize_portrait_url(value: str | None) -> str | None:
    if not value:
        return value

    parsed = urlparse(value)
    base = settings.MEDIA_BASE_URL.rstrip("/")
    base_parsed = urlparse(base)

    # Convert legacy localhost:8000 links to the current media host
    if parsed.scheme and parsed.netloc:
        if parsed.netloc != base_parsed.netloc or parsed.scheme != base_parsed.scheme:
            return f"{base}{parsed.path}"
        return value

    # Treat relative paths as being under the media base
    if value.startswith("/"):
        return f"{base}{value}"

    return value


def _normalize_optional_string(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = str(value).strip()
    return cleaned or None


def _sanitize_timeline(items: list[dict] | None) -> list[dict[str, str]]:
    if not items:
        return []

    sanitized: list[dict[str, str]] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        time_label = _normalize_optional_string(item.get("time_label")) or _normalize_optional_string(
            item.get("timeLabel")
        )
        title = _normalize_optional_string(item.get("title"))
        description = _normalize_optional_string(item.get("description"))
        if time_label and title and description:
            sanitized.append(
                {
                    "time_label": time_label,
                    "title": title,
                    "description": description,
                }
            )
    return sanitized


@router.get(
    "",
    response_model=BiographyRead,
)
def get_biography(
    db: Session = Depends(get_db_session),
) -> BiographyRead:
    biography = _get_singleton(db)
    mutated = False
    normalized_portrait = _normalize_portrait_url(biography.portrait_url)
    if normalized_portrait != biography.portrait_url:
        biography.portrait_url = normalized_portrait
        mutated = True
    sanitized_timeline = _sanitize_timeline(biography.timeline or [])
    if sanitized_timeline != (biography.timeline or []):
        biography.timeline = sanitized_timeline
        mutated = True
    if mutated:
        db.commit()
        db.refresh(biography)
    return BiographyRead.model_validate(biography)


@router.patch(
    "",
    response_model=BiographyRead,
)
def update_biography(
    payload: BiographyUpdate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> BiographyRead:
    biography = _get_singleton(db)
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No updates provided")

    if "portrait_url" in data:
        portrait_value = _normalize_optional_string(data["portrait_url"])
        data["portrait_url"] = _normalize_portrait_url(portrait_value)
    if "name" in data:
        data["name"] = _normalize_optional_string(data["name"])
    if "tagline" in data:
        data["tagline"] = _normalize_optional_string(data["tagline"])
    if "quote" in data:
        data["quote"] = _normalize_optional_string(data["quote"])
    if "quote_attribution" in data:
        data["quote_attribution"] = _normalize_optional_string(data["quote_attribution"])
    if "timeline" in data:
        data["timeline"] = _sanitize_timeline(data["timeline"])

    for field, value in data.items():
        setattr(biography, field, value)
    biography.updated_by_id = current_user.id
    db.commit()
    db.refresh(biography)
    return BiographyRead.model_validate(biography)
