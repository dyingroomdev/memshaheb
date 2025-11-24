from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_roles
from app.models.philosophy import Philosophy
from app.models.user import User, UserRole
from app.schemas.philosophy import PhilosophyRead, PhilosophyUpdate

router = APIRouter(prefix="/philosophy", tags=["philosophy"])


def _get_singleton(db: Session) -> Philosophy:
    record = db.query(Philosophy).order_by(Philosophy.id.asc()).first()
    if not record:
        record = Philosophy(
            title="Readable & Reflective",
            subtitle="A contemplative manifesto for night-first creativity—made skimmable for busy scrolls and expansive for deep reading.",
            content="",
            manifesto_blocks=[],
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    mutated = False
    if record.title is None:
        record.title = "Readable & Reflective"
        mutated = True
    if record.subtitle is None:
        record.subtitle = "A contemplative manifesto for night-first creativity—made skimmable for busy scrolls and expansive for deep reading."
        mutated = True
    if record.manifesto_blocks is None:
        record.manifesto_blocks = []
        mutated = True
    if mutated:
        db.commit()
        db.refresh(record)
    return record


def _normalize_optional_string(value: Any) -> str | None:
    if value is None:
        return None
    return str(value).strip() or None


def _sanitize_manifesto(items: list[dict] | None) -> list[dict[str, str]]:
    if not items:
        return []

    cleaned: list[dict[str, str]] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        title = _normalize_optional_string(item.get("title"))
        body = _normalize_optional_string(item.get("body"))
        if title and body:
            cleaned.append({"title": title, "body": body})
    return cleaned


@router.get(
    "",
    response_model=PhilosophyRead,
)
def get_philosophy(
    db: Session = Depends(get_db_session),
) -> PhilosophyRead:
    record = _get_singleton(db)
    sanitized = _sanitize_manifesto(record.manifesto_blocks)
    if sanitized != (record.manifesto_blocks or []):
        record.manifesto_blocks = sanitized
        db.commit()
        db.refresh(record)
    return PhilosophyRead.model_validate(record)


@router.patch(
    "",
    response_model=PhilosophyRead,
)
def update_philosophy(
    payload: PhilosophyUpdate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> PhilosophyRead:
    record = _get_singleton(db)
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No updates provided")

    if "title" in data:
        data["title"] = _normalize_optional_string(data["title"])
    if "subtitle" in data:
        data["subtitle"] = _normalize_optional_string(data["subtitle"])
    if "content" in data:
        data["content"] = _normalize_optional_string(data["content"]) or ""
    if "manifesto_blocks" in data:
        data["manifesto_blocks"] = _sanitize_manifesto(data["manifesto_blocks"])

    for field, value in data.items():
        setattr(record, field, value)
    record.updated_by_id = current_user.id
    db.commit()
    db.refresh(record)
    return PhilosophyRead.model_validate(record)
