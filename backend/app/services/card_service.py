from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.card import Card
from app.models.card_assignment import CardAssignment
from app.models.user import User
from app.schemas.card import CardCreate, CardUpdate


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


def delete_card(db: Session, card_id: int) -> None:
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    db.delete(card)
    db.commit()


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
