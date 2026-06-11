from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.board import BoardCreate, BoardUpdate, BoardOut
from app.models.board import Board
from app.models.column import TaskColumn
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/boards", tags=["Boards"])

# Default columns every new board gets — mirrors a typical Kanban setup
DEFAULT_COLUMNS = ["To Do", "In Progress", "Done"]


@router.get("/", response_model=List[BoardOut])
def get_boards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all boards owned by the current user."""
    # TODO: in a team workspace, return boards shared with the user too
    return db.query(Board).filter(Board.owner_id == current_user.id).all()


@router.post("/", response_model=BoardOut, status_code=201)
def create_board(
    data: BoardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new board and auto-generate default columns."""
    board = Board(
        title=data.title,
        description=data.description,
        color=data.color or "#6366f1",
        owner_id=current_user.id,
    )
    db.add(board)
    db.commit()
    db.refresh(board)

    # Auto-create default columns for new boards
    for idx, col_name in enumerate(DEFAULT_COLUMNS):
        col = TaskColumn(name=col_name, position=idx, board_id=board.id)
        db.add(col)
    db.commit()

    return board


@router.get("/{board_id}", response_model=BoardOut)
def get_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    board = _get_board_or_404(db, board_id, current_user.id)
    return board


@router.patch("/{board_id}", response_model=BoardOut)
def update_board(
    board_id: int,
    data: BoardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    board = _get_board_or_404(db, board_id, current_user.id)

    if data.title is not None:
        board.title = data.title
    if data.description is not None:
        board.description = data.description
    if data.color is not None:
        board.color = data.color

    db.commit()
    db.refresh(board)
    return board


@router.delete("/{board_id}", status_code=204)
def delete_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    board = _get_board_or_404(db, board_id, current_user.id)
    db.delete(board)
    db.commit()


def _get_board_or_404(db: Session, board_id: int, user_id: int) -> Board:
    board = db.query(Board).filter(Board.id == board_id, Board.owner_id == user_id).first()
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    return board
