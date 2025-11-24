"""Create users and site_settings tables

Revision ID: 0001_initial
Revises: 
Create Date: 2024-05-04 00:00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.Enum("ADMIN", "EDITOR", "READER", name="user_role"), nullable=False, server_default=sa.text("'READER'")),
        sa.Column("display_name", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_id", "users", ["id"], unique=False)
    op.create_unique_constraint("uq_users_email", "users", ["email"])
    op.create_table(
        "site_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("social_links", postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default=sa.text("'{}'::jsonb")),
        sa.Column("theme", postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default=sa.text("'{}'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("site_settings")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS user_role")
