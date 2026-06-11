from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class TaskColumn(Base):
    """
    Represents a column on a Kanban board (e.g., To Do, In Progress, Done).
    Position field allows ordering — currently fixed at 3 columns per board.
    TODO: allow custom columns in a future version
    """
    __tablename__ = "task_columns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    position = Column(Integer, default=0)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False)

    # Relationships
    board = relationship("Board", back_populates="columns")
    cards = relationship("Card", back_populates="column", cascade="all, delete-orphan", order_by="Card.position")

    def __repr__(self):
        return f"<TaskColumn id={self.id} name={self.name}>"
