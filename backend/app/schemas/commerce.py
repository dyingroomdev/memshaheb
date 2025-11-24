from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.wc_link import WCProductKind, WCSyncState


class CommerceProduct(BaseModel):
    wc_product_id: Optional[int]
    kind: WCProductKind
    local_id: Optional[int]
    title: Optional[str]
    price: Optional[float]
    stock_status: Optional[str]
    stock_quantity: Optional[int]
    sync_state: WCSyncState
    last_synced_at: Optional[datetime]


class CommerceProductList(BaseModel):
    items: list[CommerceProduct]
