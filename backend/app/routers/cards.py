from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.card import CardCreate, CardUpdate, CardMove, CardOut
from app.services import card_service
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/cards", tags=["Cards"])


@router.post("/", response_model=CardOut, status_code=201)
def create_card(
    data: CardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new card in a column."""
    return card_service.create_card(db, data, current_user.id)


@router.get("/{card_id}", response_model=CardOut)
def get_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.card import Card
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card_service._attach_assigned_users(db, card)


@router.patch("/{card_id}", response_model=CardOut)
def update_card(
    card_id: int,
    data: CardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update card fields — also handles moving card to a different column."""
    return card_service.update_card(db, card_id, data, current_user.id)


@router.patch("/{card_id}/move", response_model=CardOut)
def move_card(
    card_id: int,
    data: CardMove,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Move a card to a different column and/or position (drag-and-drop)."""
    return card_service.move_card(db, card_id, data.column_id, data.position, current_user.id)


@router.delete("/{card_id}", status_code=204)
def delete_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    card_service.delete_card(db, card_id, current_user.id)
