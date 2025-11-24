"""Set default publish timestamp for paintings

Revision ID: 0009_painting_publish_default
Revises: 0008_philosophy_structured
Create Date: 2024-11-07 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0009_painting_publish_default"
down_revision = "0008_philosophy_structured"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("UPDATE paintings SET published_at = now() WHERE published_at IS NULL")
    op.alter_column(
        "paintings",
        "published_at",
        existing_type=sa.DateTime(timezone=True),
        server_default=sa.text("now()"),
    )


def downgrade() -> None:
    op.alter_column(
        "paintings",
        "published_at",
        existing_type=sa.DateTime(timezone=True),
        server_default=None,
    )
