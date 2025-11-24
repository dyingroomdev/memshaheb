"""Add contact phone/email to site settings

Revision ID: 0020_contact_fields
Revises: 0019_biography_instagram
Create Date: 2025-11-24
"""
from alembic import op
import sqlalchemy as sa

revision = '0020_contact_fields'
down_revision = '0019_biography_instagram'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('site_settings', sa.Column('contact_phone', sa.String(), nullable=True))
    op.add_column('site_settings', sa.Column('contact_email', sa.String(), nullable=True))


def downgrade():
    op.drop_column('site_settings', 'contact_email')
    op.drop_column('site_settings', 'contact_phone')
