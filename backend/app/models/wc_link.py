import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class WCProductKind(str, enum.Enum):
    BOOK = "BOOK"
    PAINTING = "PAINTING"


class WCSyncState(str, enum.Enum):
    PENDING = "PENDING"
    SYNCED = "SYNCED"
    ERROR = "ERROR"


class WCLink(Base):
    __tablename__ = "wc_links"
    __table_args__ = (UniqueConstraint("wc_product_id", name="uq_wc_links_wc_product_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    wc_product_id: Mapped[int | None] = mapped_column(Integer, index=True)
    kind: Mapped[WCProductKind] = mapped_column(Enum(WCProductKind, name="wc_product_kind"), nullable=False)
    local_fk: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    sync_state: Mapped[WCSyncState] = mapped_column(
        Enum(WCSyncState, name="wc_sync_state"), default=WCSyncState.PENDING, nullable=False
    )
    price: Mapped[float | None] = mapped_column(Numeric(10, 2))
    stock_status: Mapped[str | None] = mapped_column(String(50))
    stock_quantity: Mapped[int | None] = mapped_column(Integer)
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    local_table: Mapped[str | None] = mapped_column(String(100))
    notes: Mapped[str | None] = mapped_column(String(255))
