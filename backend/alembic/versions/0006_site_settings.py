"""Add site_settings table

Revision ID: 0006_site_settings
Revises: 0005_wc_links
Create Date: 2024-12-20 12:00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "0006_site_settings"
down_revision: Union[str, None] = "0005_wc_links"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    if "site_settings" in inspector.get_table_names():
        return

    op.create_table(
        "site_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("social_links", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'{}'::jsonb"), nullable=True),
        sa.Column("theme", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'{}'::jsonb"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    if "site_settings" in inspector.get_table_names():
        op.drop_table("site_settings")
