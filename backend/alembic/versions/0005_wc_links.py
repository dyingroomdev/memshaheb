"""Add WooCommerce link table

Revision ID: 0005_wc_links
Revises: 0004_blog_posts
Create Date: 2024-05-04 05:00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "0005_wc_links"
down_revision: Union[str, None] = "0004_blog_posts"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    bind.execute(
        sa.text(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wc_product_kind') THEN
                    CREATE TYPE wc_product_kind AS ENUM ('BOOK', 'PAINTING');
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wc_sync_state') THEN
                    CREATE TYPE wc_sync_state AS ENUM ('PENDING', 'SYNCED', 'ERROR');
                END IF;
            END
            $$;
            """
        )
    )

    wc_product_kind = postgresql.ENUM(name="wc_product_kind", create_type=False)
    wc_sync_state = postgresql.ENUM(name="wc_sync_state", create_type=False)

    op.create_table(
        "wc_links",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("wc_product_id", sa.Integer(), nullable=True),
        sa.Column("kind", wc_product_kind, nullable=False),
        sa.Column("local_fk", sa.Integer(), nullable=True),
        sa.Column("sync_state", wc_sync_state, nullable=False, server_default="PENDING"),
        sa.Column("price", sa.Numeric(10, 2), nullable=True),
        sa.Column("stock_status", sa.String(length=50), nullable=True),
        sa.Column("stock_quantity", sa.Integer(), nullable=True),
        sa.Column("last_synced_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("local_table", sa.String(length=100), nullable=True),
        sa.Column("notes", sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("wc_product_id", name="uq_wc_links_wc_product_id"),
    )
    op.create_index("ix_wc_links_wc_product_id", "wc_links", ["wc_product_id"], unique=False)
    op.create_index("ix_wc_links_local_fk", "wc_links", ["local_fk"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_wc_links_local_fk", table_name="wc_links")
    op.drop_index("ix_wc_links_wc_product_id", table_name="wc_links")
    op.drop_table("wc_links")
    op.execute(sa.text("DROP TYPE IF EXISTS wc_product_kind CASCADE"))
    op.execute(sa.text("DROP TYPE IF EXISTS wc_sync_state CASCADE"))
