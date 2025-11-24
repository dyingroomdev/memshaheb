from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_roles
from app.core.config import settings
from app.models.painting import Painting
from app.models.user import User, UserRole
from app.models.wc_link import WCLink, WCProductKind, WCSyncState
from app.schemas.wc import SyncResponse
from app.services.woocommerce import (
    WooCommerceAPIError,
    WooCommerceConfigurationError,
    SyncResult,
    sync_painting,
    verify_webhook_signature,
)

router = APIRouter(prefix="/integrations/wc", tags=["integrations:woocommerce"])


def _get_or_create_link(db: Session, kind: WCProductKind, local_fk: int | None) -> WCLink:
    link = (
        db.query(WCLink)
        .filter(WCLink.kind == kind)
        .filter(WCLink.local_fk == local_fk)
        .first()
    )
    if link:
        return link
    link = WCLink(kind=kind, local_fk=local_fk, sync_state=WCSyncState.PENDING)
    db.add(link)
    db.flush()
    return link


@router.post(
    "/sync/{local_id}",
    response_model=SyncResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def trigger_sync(
    local_id: int,
    kind: WCProductKind = Query(..., description="Product kind to sync."),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> SyncResponse:
    try:
        if kind == WCProductKind.PAINTING:
            painting = db.get(Painting, local_id)
            if not painting:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Painting not found")
            link = _get_or_create_link(db, kind, painting.id)
            result = _sync_painting(db, painting, link)
        else:
            raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Book sync not yet implemented")
    except WooCommerceConfigurationError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except WooCommerceAPIError as exc:
        if kind == WCProductKind.PAINTING:
            link = _get_or_create_link(db, kind, local_id)
            link.sync_state = WCSyncState.ERROR
            link.notes = f"Error {exc.status_code}"
            link.last_synced_at = datetime.now(timezone.utc)
            db.commit()
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=exc.detail) from exc

    return SyncResponse(status="ok", wc_product_id=result.wc_product_id, sync_state=result.sync_state)


def _sync_painting(db: Session, painting: Painting, link: WCLink) -> SyncResult:
    result = sync_painting(painting, link)
    painting.wc_product_id = result.wc_product_id
    link.wc_product_id = result.wc_product_id
    link.sync_state = result.sync_state
    link.last_synced_at = datetime.now(timezone.utc)
    link.local_table = "paintings"
    link.notes = "Synced painting"
    db.commit()
    return result


async def _verify_request_signature(request: Request) -> dict[str, Any]:
    if not settings.WC_WEBHOOK_SECRET:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Webhook secret not configured")
    raw_body = await request.body()
    signature = request.headers.get("x-wc-webhook-signature")
    if not verify_webhook_signature(raw_body, signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid webhook signature")
    try:
        return await request.json()
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON payload") from exc


@router.post("/webhooks/product", status_code=status.HTTP_202_ACCEPTED)
async def product_webhook(
    request: Request,
    db: Session = Depends(get_db_session),
) -> dict[str, str]:
    payload = await _verify_request_signature(request)
    product_id = payload.get("id")
    if not product_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing product id")

    link = db.query(WCLink).filter(WCLink.wc_product_id == product_id).first()
    if not link:
        link = WCLink(
            wc_product_id=product_id,
            kind=WCProductKind.PAINTING,
            sync_state=WCSyncState.PENDING,
            notes="Unmapped product",
        )
        db.add(link)

    link.price = _to_float(payload.get("price"))
    link.stock_status = payload.get("stock_status")
    stock_quantity = payload.get("stock_quantity")
    link.stock_quantity = int(stock_quantity) if stock_quantity is not None else None
    link.sync_state = WCSyncState.SYNCED
    link.last_synced_at = datetime.now(timezone.utc)
    link.notes = "Product webhook update"

    if link.kind == WCProductKind.PAINTING and link.local_fk:
        painting = db.get(Painting, link.local_fk)
        if painting and not painting.wc_product_id:
            painting.wc_product_id = product_id

    db.commit()
    return {"status": "accepted"}


@router.post("/webhooks/order", status_code=status.HTTP_202_ACCEPTED)
async def order_webhook(
    request: Request,
    db: Session = Depends(get_db_session),
) -> dict[str, str]:
    payload = await _verify_request_signature(request)
    order_id = payload.get("id")
    if not order_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing order id")

    line_items = payload.get("line_items", [])
    now = datetime.now(timezone.utc)
    for item in line_items:
        product_id = item.get("product_id")
        if not product_id:
            continue
        link = db.query(WCLink).filter(WCLink.wc_product_id == product_id).first()
        if link:
            link.notes = f"Updated by order #{order_id}"
            link.last_synced_at = now
    db.commit()
    return {"status": "accepted"}


def _to_float(value: Any) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None
