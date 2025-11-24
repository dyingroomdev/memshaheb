from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams, get_db_session, get_pagination, require_roles
from app.models.hero_slide import HeroSlide
from app.models.user import User, UserRole
from app.schemas.hero_slide import HeroSlideCreate, HeroSlideListResponse, HeroSlideRead, HeroSlideUpdate

router = APIRouter(prefix="/hero-slides", tags=["hero-slides"])


def _sort_clause(sort: str, direction: str):
    sort_map: dict[str, Any] = {
        "sort": HeroSlide.sort,
        "created_at": HeroSlide.created_at,
        "updated_at": HeroSlide.updated_at,
        "title": HeroSlide.title,
    }
    column = sort_map.get(sort, HeroSlide.sort)
    direction_normalized = direction.lower()
    if direction_normalized not in {"asc", "desc"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid sort direction")
    return column.desc() if direction_normalized == "desc" else column.asc()


@router.get(
    "",
    response_model=HeroSlideListResponse,
)
def list_hero_slides(
    pagination: PaginationParams = Depends(get_pagination),
    sort: str = Query("sort"),
    direction: str = Query("asc"),
    db: Session = Depends(get_db_session),
) -> HeroSlideListResponse:
    sort_clause = _sort_clause(sort, direction)
    base_query = db.query(HeroSlide)
    total = base_query.count()
    items = (
        base_query.order_by(sort_clause)
        .offset(pagination.offset)
        .limit(pagination.page_size)
        .all()
    )
    return HeroSlideListResponse(
        items=[HeroSlideRead.model_validate(item) for item in items],
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
    )


@router.post(
    "",
    response_model=HeroSlideRead,
    status_code=status.HTTP_201_CREATED,
)
def create_hero_slide(
    payload: HeroSlideCreate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> HeroSlideRead:
    max_sort = db.query(HeroSlide).order_by(HeroSlide.sort.desc()).first()
    sort_value = payload.sort if payload.sort is not None else (max_sort.sort + 1 if max_sort else 0)

    slide = HeroSlide(
        image_url=payload.image_url,
        title=payload.title,
        subtitle=payload.subtitle,
        cta_label=payload.cta_label,
        cta_href=payload.cta_href,
        sort=sort_value,
        created_by_id=current_user.id,
        updated_by_id=current_user.id,
    )
    db.add(slide)
    db.commit()
    db.refresh(slide)
    return HeroSlideRead.model_validate(slide)


@router.patch(
    "/{slide_id}",
    response_model=HeroSlideRead,
)
def update_hero_slide(
    slide_id: int,
    payload: HeroSlideUpdate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> HeroSlideRead:
    slide = db.get(HeroSlide, slide_id)
    if not slide:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slide not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(slide, field, value)
    slide.updated_by_id = current_user.id
    db.commit()
    db.refresh(slide)
    return HeroSlideRead.model_validate(slide)


@router.delete(
    "/{slide_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_hero_slide(
    slide_id: int,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> None:
    slide = db.get(HeroSlide, slide_id)
    if not slide:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slide not found")
    db.delete(slide)
    db.commit()
