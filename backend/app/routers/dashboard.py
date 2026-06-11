from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.board import Board
from app.models.card import Card
from app.models.column import TaskColumn

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns aggregate statistics for the dashboard view.
    Currently scoped to boards owned by the current user.
    TODO: extend to include team boards when multi-workspace is added.
    """
    # Get all board IDs owned by user
    board_ids = [b.id for b in db.query(Board.id).filter(Board.owner_id == current_user.id).all()]
    total_boards = len(board_ids)

    if not board_ids:
        return {
            "total_boards": 0,
            "total_cards": 0,
            "cards_by_status": {"To Do": 0, "In Progress": 0, "Done": 0},
            "cards_by_priority": {"low": 0, "medium": 0, "high": 0},
        }

    # Get all column IDs for those boards
    column_ids = [
        c.id
        for c in db.query(TaskColumn.id).filter(TaskColumn.board_id.in_(board_ids)).all()
    ]

    total_cards = db.query(Card).filter(Card.column_id.in_(column_ids)).count()

    # Cards grouped by column name (status)
    status_counts = {"To Do": 0, "In Progress": 0, "Done": 0}
    for col in db.query(TaskColumn).filter(TaskColumn.board_id.in_(board_ids)).all():
        count = db.query(Card).filter(Card.column_id == col.id).count()
        if col.name in status_counts:
            status_counts[col.name] += count

    # Cards grouped by priority
    priority_counts = {}
    for priority in ["low", "medium", "high"]:
        priority_counts[priority] = db.query(Card).filter(
            Card.column_id.in_(column_ids),
            Card.priority == priority,
        ).count()

    # Recent boards (last 5)
    recent_boards = (
        db.query(Board)
        .filter(Board.owner_id == current_user.id)
        .order_by(Board.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total_boards": total_boards,
        "total_cards": total_cards,
        "cards_by_status": status_counts,
        "cards_by_priority": priority_counts,
        "recent_boards": [
            {"id": b.id, "title": b.title, "color": b.color, "created_at": str(b.created_at)}
            for b in recent_boards
        ],
    }
