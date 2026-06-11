from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class CardCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"
    due_date: Optional[date] = None
    column_id: int
    assigned_user_ids: Optional[List[int]] = []


class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    column_id: Optional[int] = None
    assigned_user_ids: Optional[List[int]] = None


class AssignedUserOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class CardOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    priority: str
    due_date: Optional[date]
    position: int
    column_id: int
    created_by: int
    created_at: datetime
    assigned_users: Optional[List[AssignedUserOut]] = []

    class Config:
        from_attributes = True
