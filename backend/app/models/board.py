from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Board(Base):
    __tablename__ = "boards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    # Using a hex color code to let users personalize board color
    color = Column(String(7), default="#6366f1")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="boards")
    columns = relationship("TaskColumn", back_populates="board", cascade="all, delete-orphan", order_by="TaskColumn.position")

    def __repr__(self):
        return f"<Board id={self.id} title={self.title}>"
