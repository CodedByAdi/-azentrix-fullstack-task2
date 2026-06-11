"""Initial schema — users, boards, columns, cards, card_assignments

Revision ID: 001
Revises: 
Create Date: 2024-01-15 10:00:00
"""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(150), unique=True, nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('role', sa.Enum('admin', 'member'), nullable=False, server_default='member'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Boards
    op.create_table(
        'boards',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('color', sa.String(7), server_default='#6366f1'),
        sa.Column('owner_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    # Task Columns
    op.create_table(
        'task_columns',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('position', sa.Integer(), server_default='0'),
        sa.Column('board_id', sa.Integer(), sa.ForeignKey('boards.id', ondelete='CASCADE'), nullable=False),
    )

    # Cards
    op.create_table(
        'cards',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('priority', sa.Enum('low', 'medium', 'high'), nullable=False, server_default='medium'),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('position', sa.Integer(), server_default='0'),
        sa.Column('column_id', sa.Integer(), sa.ForeignKey('task_columns.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    # Card Assignments (many-to-many)
    op.create_table(
        'card_assignments',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('card_id', sa.Integer(), sa.ForeignKey('cards.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('assigned_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('card_assignments')
    op.drop_table('cards')
    op.drop_table('task_columns')
    op.drop_table('boards')
    op.drop_table('users')
