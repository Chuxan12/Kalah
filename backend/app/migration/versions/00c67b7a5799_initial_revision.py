"""Initial revision

Revision ID: 00c67b7a5799
Revises: 
Create Date: 2024-10-29 14:13:28.078542

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '00c67b7a5799'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Создаём таблицу roles
    op.create_table(
        'roles',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=50), unique=True, nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False)
    )

    # Вставляем роли
    op.bulk_insert(
        sa.table(
            'roles',
            sa.column('name', sa.String),
            sa.column('created_at', sa.TIMESTAMP),
            sa.column('updated_at', sa.TIMESTAMP),
        ),
        [
            {"name": "User"},
            {"name": "Moderator"},
            {"name": "Admin"},
            {"name": "SuperAdmin"}
        ]
    )

    # Создаём таблицу users после roles
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column('phone_number', sa.String(), unique=True, nullable=False),
        sa.Column('first_name', sa.String(), nullable=False),
        sa.Column('last_name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), unique=True, nullable=False),
        sa.Column('password', sa.String(), nullable=False),
        sa.Column('role_id', sa.Integer(), sa.ForeignKey('roles.id'), server_default=sa.text('1'), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False)
    )


def downgrade() -> None:
    # Удаляем таблицы в обратном порядке
    op.drop_table('users')
    op.drop_table('roles')
