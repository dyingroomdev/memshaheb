from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.wc_link import WCProductKind, WCSyncState


class WCLinkRead(BaseModel):
    id: int
    wc_product_id: Optional[int]
    kind: WCProductKind
    local_fk: Optional[int]
    sync_state: WCSyncState
    price: Optional[float]
    stock_status: Optional[str]
    stock_quantity: Optional[int]
    last_synced_at: Optional[datetime]

    class Config:
        from_attributes = True


class SyncResponse(BaseModel):
    status: str
    wc_product_id: Optional[int] = None
    sync_state: WCSyncState
