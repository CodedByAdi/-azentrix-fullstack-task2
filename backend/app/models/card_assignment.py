from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class CardAssignment(Base):
    """
    Many-to-many join table between cards and users.
    A card can be assigned to multiple users.
    Current implementation assumes single workspace — no team scoping yet.
    """
    __tablename__ = "card_assignments"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    card = relationship("Card", back_populates="assignments")
    user = relationship("User", back_populates="card_assignments")
