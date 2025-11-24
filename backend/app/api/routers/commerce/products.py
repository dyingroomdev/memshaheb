from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, aliased

from app.api.deps import get_db_session, require_roles
from app.models.painting import Painting
from app.models.user import User, UserRole
from app.models.wc_link import WCLink, WCProductKind
from app.schemas.commerce import CommerceProduct, CommerceProductList

router = APIRouter(prefix="/commerce/products", tags=["commerce"])


@router.get("", response_model=CommerceProductList)
def list_products(
    kind: WCProductKind | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.READER)),
) -> CommerceProductList:
    painting_alias = aliased(Painting)
    query = (
        db.query(WCLink, painting_alias)
        .outerjoin(
            painting_alias,
            (WCLink.kind == WCProductKind.PAINTING) & (WCLink.local_fk == painting_alias.id),
        )
        .order_by(WCLink.updated_at.desc())
    )

    if kind:
        query = query.filter(WCLink.kind == kind)

    if search:
        term = f"%{search.lower()}%"
        if not kind or kind == WCProductKind.PAINTING:
            query = query.filter(func.lower(func.coalesce(painting_alias.title, "")).like(term))
        else:
            query = query.filter(func.lower(func.coalesce(WCLink.notes, "")).like(term))

    items: list[CommerceProduct] = []
    for link, painting in query.all():
        title = painting.title if painting else None
        items.append(
            CommerceProduct(
                wc_product_id=link.wc_product_id,
                kind=link.kind,
                local_id=link.local_fk,
                title=title,
                price=float(link.price) if link.price is not None else None,
                stock_status=link.stock_status,
                stock_quantity=link.stock_quantity,
                sync_state=link.sync_state,
                last_synced_at=link.last_synced_at,
            )
        )

    return CommerceProductList(items=items)
