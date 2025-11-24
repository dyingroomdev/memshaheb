"""Add paintings and museum layout tables

Revision ID: 0003_paintings_and_museum
Revises: 0002_cms_primitives
Create Date: 2024-05-04 03:00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "0003_paintings_and_museum"
down_revision: Union[str, None] = "0002_cms_primitives"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "paintings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("year", sa.Integer(), nullable=True),
        sa.Column("medium", sa.String(length=255), nullable=True),
        sa.Column("dimensions", sa.String(length=255), nullable=True),
        sa.Column("image_url", sa.String(length=1024), nullable=True),
        sa.Column("lqip_data", sa.Text(), nullable=True),
        sa.Column("tags", postgresql.ARRAY(sa.String(length=64)), nullable=True),
        sa.Column("wc_product_id", sa.Integer(), nullable=True),
        sa.Column("is_featured", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_paintings_slug"),
    )
    op.create_index("ix_paintings_slug", "paintings", ["slug"], unique=False)
    op.create_index("ix_paintings_published_at", "paintings", ["published_at"], unique=False)
    op.create_index("ix_paintings_is_featured", "paintings", ["is_featured"], unique=False)

    op.create_table(
        "museum_rooms",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("intro", sa.Text(), nullable=True),
        sa.Column("sort", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_museum_rooms_slug"),
    )
    op.create_index("ix_museum_rooms_slug", "museum_rooms", ["slug"], unique=False)
    op.create_index("ix_museum_rooms_sort", "museum_rooms", ["sort"], unique=False)

    op.create_table(
        "museum_artifacts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("room_id", sa.Integer(), nullable=False),
        sa.Column("painting_id", sa.Integer(), nullable=False),
        sa.Column("sort", sa.Integer(), server_default="0", nullable=False),
        sa.Column("hotspot", postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default=sa.text("'{}'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["painting_id"], ["paintings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["room_id"], ["museum_rooms.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_museum_artifacts_room_id", "museum_artifacts", ["room_id"], unique=False)
    op.create_index("ix_museum_artifacts_painting_id", "museum_artifacts", ["painting_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_museum_artifacts_painting_id", table_name="museum_artifacts")
    op.drop_index("ix_museum_artifacts_room_id", table_name="museum_artifacts")
    op.drop_table("museum_artifacts")
    op.drop_index("ix_museum_rooms_sort", table_name="museum_rooms")
    op.drop_index("ix_museum_rooms_slug", table_name="museum_rooms")
    op.drop_table("museum_rooms")
    op.drop_index("ix_paintings_is_featured", table_name="paintings")
    op.drop_index("ix_paintings_published_at", table_name="paintings")
    op.drop_index("ix_paintings_slug", table_name="paintings")
    op.drop_table("paintings")
