from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BoardCreate(BaseModel):
    title: str
    description: Optional[str] = None
    color: Optional[str] = "#6366f1"


class BoardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None


class BoardOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    color: str
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True
