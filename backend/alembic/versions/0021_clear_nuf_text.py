"""Remove legacy Nuf references

Revision ID: 0021_clear_nuf_text
Revises: 0020_contact_fields
Create Date: 2025-11-24
"""
from alembic import op
import sqlalchemy as sa

revision = '0021_clear_nuf_text'
down_revision = '0020_contact_fields'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    # Update biography name/tagline if they still carry the old placeholder
    conn.execute(sa.text("UPDATE biography SET name = 'Memshaheb' WHERE name ILIKE 'nuf%'"))
    conn.execute(sa.text("UPDATE biography SET tagline = 'Night-mode magazine for women' WHERE tagline ILIKE 'nuf%'"))
    # Clear any stray site_title/site_tagline using old branding
    conn.execute(
        sa.text(
            "UPDATE site_settings "
            "SET site_title = 'Memshaheb', site_tagline = 'Night-mode magazine for women' "
            "WHERE site_title ILIKE 'nuf%'"
        )
    )


def downgrade():
    # No-op rollback; data cleanup only
    pass
