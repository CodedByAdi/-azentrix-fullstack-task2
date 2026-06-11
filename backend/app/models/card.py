from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Card(Base):
    """
    A task card on the Kanban board.
    Cards belong to a column and can be assigned to a user.
    Priority is low/medium/high — kept simple for now.
    """
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(Enum("low", "medium", "high"), default="medium", nullable=False)
    due_date = Column(Date, nullable=True)
    position = Column(Integer, default=0)
    column_id = Column(Integer, ForeignKey("task_columns.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    column = relationship("TaskColumn", back_populates="cards")
    creator = relationship("User", foreign_keys=[created_by])
    assignments = relationship("CardAssignment", back_populates="card", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Card id={self.id} title={self.title} priority={self.priority}>"
