from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user_optional, get_db_session, require_roles
from app.models.museum_artifact import MuseumArtifact
from app.models.museum_room import MuseumRoom
from app.models.painting import Painting
from app.models.user import User, UserRole
from app.schemas.museum import MuseumArtifactCreate, MuseumArtifactRead, MuseumArtifactUpdate

router = APIRouter(prefix="/museum/artifacts", tags=["museum-artifacts"])


def _artifact_with_painting(db: Session, artifact_id: int) -> MuseumArtifact:
    artifact = (
        db.query(MuseumArtifact)
        .options(joinedload(MuseumArtifact.painting))
        .filter(MuseumArtifact.id == artifact_id)
        .first()
    )
    if not artifact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artifact not found")
    return artifact


@router.get("", response_model=list[MuseumArtifactRead])
def list_artifacts(
    room_id: int | None = Query(default=None),
    painting_id: int | None = Query(default=None),
    db: Session = Depends(get_db_session),
    current_user: User | None = Depends(get_current_user_optional),
) -> list[MuseumArtifactRead]:
    query = db.query(MuseumArtifact).options(joinedload(MuseumArtifact.painting))
    if current_user is None or current_user.role == UserRole.READER:
        query = (
            query.join(MuseumArtifact.painting)
            .filter(Painting.published_at.isnot(None))
            .filter(Painting.published_at <= func.now())
        )
    if room_id is not None:
        query = query.filter(MuseumArtifact.room_id == room_id)
    if painting_id is not None:
        query = query.filter(MuseumArtifact.painting_id == painting_id)
    artifacts = query.order_by(MuseumArtifact.sort.asc(), MuseumArtifact.id.asc()).all()
    return [MuseumArtifactRead.model_validate(artifact) for artifact in artifacts]


def _ensure_relations(db: Session, room_id: int, painting_id: int) -> None:
    if not db.get(MuseumRoom, room_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid room_id")
    if not db.get(Painting, painting_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid painting_id")


@router.post("", response_model=MuseumArtifactRead, status_code=status.HTTP_201_CREATED)
def create_artifact(
    payload: MuseumArtifactCreate,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> MuseumArtifactRead:
    _ensure_relations(db, payload.room_id, payload.painting_id)
    existing = (
        db.query(MuseumArtifact)
        .filter(MuseumArtifact.room_id == payload.room_id, MuseumArtifact.painting_id == payload.painting_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Painting already assigned to this room")
    artifact = MuseumArtifact(
        room_id=payload.room_id,
        painting_id=payload.painting_id,
        sort=payload.sort,
        hotspot=payload.hotspot,
    )
    db.add(artifact)
    db.commit()
    artifact = _artifact_with_painting(db, artifact.id)
    return MuseumArtifactRead.model_validate(artifact)


@router.patch("/{artifact_id}", response_model=MuseumArtifactRead)
def update_artifact(
    artifact_id: int,
    payload: MuseumArtifactUpdate,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> MuseumArtifactRead:
    artifact = _artifact_with_painting(db, artifact_id)

    data = payload.model_dump(exclude_unset=True)
    if "room_id" in data or "painting_id" in data:
        _ensure_relations(db, data.get("room_id", artifact.room_id), data.get("painting_id", artifact.painting_id))
        target_room = data.get("room_id", artifact.room_id)
        target_painting = data.get("painting_id", artifact.painting_id)
        duplicate = (
            db.query(MuseumArtifact)
            .filter(
                MuseumArtifact.room_id == target_room,
                MuseumArtifact.painting_id == target_painting,
                MuseumArtifact.id != artifact.id,
            )
            .first()
        )
        if duplicate:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Painting already assigned to this room")

    for field, value in data.items():
        setattr(artifact, field, value)

    db.commit()
    artifact = _artifact_with_painting(db, artifact.id)
    return MuseumArtifactRead.model_validate(artifact)


@router.delete("/{artifact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_artifact(
    artifact_id: int,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> None:
    artifact = db.get(MuseumArtifact, artifact_id)
    if not artifact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artifact not found")
    db.delete(artifact)
    db.commit()
