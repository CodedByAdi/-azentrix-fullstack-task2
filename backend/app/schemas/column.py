from pydantic import BaseModel
from typing import Optional


class ColumnCreate(BaseModel):
    name: str
    position: Optional[int] = 0


class ColumnUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[int] = None


class ColumnOut(BaseModel):
    id: int
    name: str
    position: int
    board_id: int

    class Config:
        from_attributes = True
