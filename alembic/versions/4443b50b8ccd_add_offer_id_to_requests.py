"""add offer_id to requests

Revision ID: 4443b50b8ccd
Revises: ae4d24849dda
Create Date: 2025-07-23 17:38:14.976041

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4443b50b8ccd'
down_revision: Union[str, None] = 'ae4d24849dda'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('requests', sa.Column('offer_id', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('requests', 'offer_id')
