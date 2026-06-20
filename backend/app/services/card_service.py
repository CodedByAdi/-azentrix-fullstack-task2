from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.card import Card
from app.models.card_assignment import CardAssignment
from app.models.column import TaskColumn
from app.models.board import Board
from app.models.user import User
from app.schemas.card import CardCreate, CardUpdate


def _verify_card_ownership(db: Session, card: Card, user_id: int) -> None:
    """Ensure the card belongs to a board owned by the given user."""
    col = db.query(TaskColumn).filter(TaskColumn.id == card.column_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Column not found")
    board = db.query(Board).filter(Board.id == col.board_id, Board.owner_id == user_id).first()
    if not board:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this card")


def get_cards_for_column(db: Session, column_id: int):
    cards = db.query(Card).filter(Card.column_id == column_id).order_by(Card.position).all()
    return [_attach_assigned_users(db, card) for card in cards]


def create_card(db: Session, data: CardCreate, user_id: int) -> Card:
    # Determine the next position in the column
    last = db.query(Card).filter(Card.column_id == data.column_id).count()

    card = Card(
        title=data.title,
        description=data.description,
        priority=data.priority,
        due_date=data.due_date,
        column_id=data.column_id,
        created_by=user_id,
        position=last,
    )
    db.add(card)
    db.commit()
    db.refresh(card)

    # Handle assignments
    _sync_assignments(db, card, data.assigned_user_ids or [])

    return _attach_assigned_users(db, card)


def update_card(db: Session, card_id: int, data: CardUpdate, user_id: int) -> Card:
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    _verify_card_ownership(db, card, user_id)

    if data.title is not None:
        card.title = data.title
    if data.description is not None:
        card.description = data.description
    if data.priority is not None:
        card.priority = data.priority
    if data.due_date is not None:
        card.due_date = data.due_date
    if data.column_id is not None:
        card.column_id = data.column_id

    if data.assigned_user_ids is not None:
        _sync_assignments(db, card, data.assigned_user_ids)

    db.commit()
    db.refresh(card)
    return _attach_assigned_users(db, card)


def delete_card(db: Session, card_id: int, user_id: int) -> None:
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    _verify_card_ownership(db, card, user_id)
    db.delete(card)
    db.commit()


def move_card(db: Session, card_id: int, target_column_id: int, new_position: int, user_id: int) -> Card:
    """Move a card to a target column at the given position."""
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    _verify_card_ownership(db, card, user_id)

    source_column_id = card.column_id
    card.column_id = target_column_id
    card.position = new_position
    db.flush()

    # Re-index positions in the target column
    target_cards = (
        db.query(Card)
        .filter(Card.column_id == target_column_id, Card.id != card.id)
        .order_by(Card.position)
        .all()
    )
    target_cards.insert(new_position, card)
    for idx, c in enumerate(target_cards):
        c.position = idx

    # Re-index source column if the card moved between columns
    if source_column_id != target_column_id:
        source_cards = (
            db.query(Card)
            .filter(Card.column_id == source_column_id)
            .order_by(Card.position)
            .all()
        )
        for idx, c in enumerate(source_cards):
            c.position = idx

    db.commit()
    db.refresh(card)
    return _attach_assigned_users(db, card)


def _sync_assignments(db: Session, card: Card, user_ids: list[int]) -> None:
    """Replace existing assignments with the new list of user IDs."""
    db.query(CardAssignment).filter(CardAssignment.card_id == card.id).delete()
    for uid in user_ids:
        user = db.query(User).filter(User.id == uid).first()
        if user:
            db.add(CardAssignment(card_id=card.id, user_id=uid))
    db.commit()


def _attach_assigned_users(db: Session, card: Card) -> Card:
    """Attach a synthetic assigned_users list to the card object for serialization."""
    assignments = db.query(CardAssignment).filter(CardAssignment.card_id == card.id).all()
    card.assigned_users = [
        db.query(User).filter(User.id == a.user_id).first()
        for a in assignments
    ]
    return card
