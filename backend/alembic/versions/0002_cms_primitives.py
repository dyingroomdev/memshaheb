"""Add CMS primitives tables

Revision ID: 0002_cms_primitives
Revises: 0001_initial
Create Date: 2024-05-04 02:00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "0002_cms_primitives"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "hero_slides",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("image_url", sa.String(length=1024), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("subtitle", sa.Text(), nullable=True),
        sa.Column("cta_label", sa.String(length=255), nullable=True),
        sa.Column("cta_href", sa.String(length=512), nullable=True),
        sa.Column("sort", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_hero_slides_sort", "hero_slides", ["sort"], unique=False)

    op.create_table(
        "biography",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("rich_text", sa.Text(), nullable=True),
        sa.Column("portrait_url", sa.Text(), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "philosophy",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("vision_rich_text", sa.Text(), nullable=True),
        sa.Column("manifesto_rich_text", sa.Text(), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "media",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("url", sa.String(length=1024), nullable=False),
        sa.Column("alt", sa.String(length=512), nullable=True),
        sa.Column("meta", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'{}'::jsonb"), nullable=True),
        sa.Column("owner_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_media_owner_id", "media", ["owner_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_media_owner_id", table_name="media")
    op.drop_table("media")
    op.drop_table("philosophy")
    op.drop_table("biography")
    op.drop_index("ix_hero_slides_sort", table_name="hero_slides")
    op.drop_table("hero_slides")
