from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.column import ColumnCreate, ColumnUpdate, ColumnOut
from app.schemas.card import CardOut
from app.models.column import TaskColumn
from app.models.board import Board
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.card_service import get_cards_for_column

router = APIRouter(prefix="/columns", tags=["Columns"])


@router.get("/board/{board_id}", response_model=List[ColumnOut])
def get_columns(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all columns for a given board."""
    _verify_board_access(db, board_id, current_user.id)
    return db.query(TaskColumn).filter(TaskColumn.board_id == board_id).order_by(TaskColumn.position).all()


@router.get("/{column_id}/cards", response_model=List[CardOut])
def get_cards_in_column(
    column_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch all cards within a column."""
    col = db.query(TaskColumn).filter(TaskColumn.id == column_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Column not found")
    return get_cards_for_column(db, column_id)


@router.post("/board/{board_id}", response_model=ColumnOut, status_code=201)
def create_column(
    board_id: int,
    data: ColumnCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _verify_board_access(db, board_id, current_user.id)
    col = TaskColumn(name=data.name, position=data.position, board_id=board_id)
    db.add(col)
    db.commit()
    db.refresh(col)
    return col


@router.patch("/{column_id}", response_model=ColumnOut)
def update_column(
    column_id: int,
    data: ColumnUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    col = db.query(TaskColumn).filter(TaskColumn.id == column_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Column not found")
    if data.name is not None:
        col.name = data.name
    if data.position is not None:
        col.position = data.position
    db.commit()
    db.refresh(col)
    return col


@router.delete("/{column_id}", status_code=204)
def delete_column(
    column_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    col = db.query(TaskColumn).filter(TaskColumn.id == column_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Column not found")
    db.delete(col)
    db.commit()


def _verify_board_access(db: Session, board_id: int, user_id: int) -> Board:
    board = db.query(Board).filter(Board.id == board_id, Board.owner_id == user_id).first()
    if not board:
        raise HTTPException(status_code=403, detail="Board not found or access denied")
    return board
