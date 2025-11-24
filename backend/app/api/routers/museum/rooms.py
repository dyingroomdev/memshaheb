from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_roles
from app.models.museum_room import MuseumRoom
from app.models.user import User, UserRole
from app.schemas.museum import MuseumRoomCreate, MuseumRoomRead, MuseumRoomUpdate
from app.utils.slugify import slugify

router = APIRouter(prefix="/museum/rooms", tags=["museum-rooms"])


def _ensure_unique_slug(db: Session, base_slug: str, exclude_id: int | None = None) -> str:
    slug = slugify(base_slug) or "room"
    stmt = select(MuseumRoom.id).where(MuseumRoom.slug == slug)
    if exclude_id:
        stmt = stmt.where(MuseumRoom.id != exclude_id)
    exists = db.execute(stmt).scalar_one_or_none()
    if not exists:
        return slug
    index = 2
    while True:
        candidate = f"{slug}-{index}"
        stmt = select(MuseumRoom.id).where(MuseumRoom.slug == candidate)
        if exclude_id:
            stmt = stmt.where(MuseumRoom.id != exclude_id)
        exists = db.execute(stmt).scalar_one_or_none()
        if not exists:
            return candidate
        index += 1


@router.get("", response_model=list[MuseumRoomRead])
def list_rooms(
    db: Session = Depends(get_db_session),
) -> list[MuseumRoomRead]:
    rooms = db.query(MuseumRoom).order_by(MuseumRoom.sort.asc(), MuseumRoom.id.asc()).all()
    return [MuseumRoomRead.model_validate(room) for room in rooms]


@router.post("", response_model=MuseumRoomRead, status_code=status.HTTP_201_CREATED)
def create_room(
    payload: MuseumRoomCreate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> MuseumRoomRead:
    base_slug = payload.slug or payload.title
    if not base_slug:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title or slug required")
    slug = _ensure_unique_slug(db, base_slug)

    room = MuseumRoom(
        title=payload.title,
        slug=slug,
        intro=payload.intro,
        sort=payload.sort,
        created_by_id=current_user.id,
        updated_by_id=current_user.id,
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return MuseumRoomRead.model_validate(room)


@router.patch("/{room_id}", response_model=MuseumRoomRead)
def update_room(
    room_id: int,
    payload: MuseumRoomUpdate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> MuseumRoomRead:
    room = db.get(MuseumRoom, room_id)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    data = payload.model_dump(exclude_unset=True)
    if "title" in data or "slug" in data:
        base_slug = data.get("slug") or data.get("title") or room.title
        room.slug = _ensure_unique_slug(db, base_slug, exclude_id=room.id)

    for field, value in data.items():
        if field == "slug":
            continue
        setattr(room, field, value)

    room.updated_by_id = current_user.id

    db.commit()
    db.refresh(room)
    return MuseumRoomRead.model_validate(room)


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(
    room_id: int,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> None:
    room = db.get(MuseumRoom, room_id)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    db.delete(room)
    db.commit()
