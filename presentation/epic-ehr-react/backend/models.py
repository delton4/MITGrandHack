from pydantic import BaseModel
from typing import Optional


class CreateOrder(BaseModel):
    order_text: str
    category: str
    priority: str = "routine"


class CreateNote(BaseModel):
    title: str
    note_type: str
    body: str


class UpdateMAR(BaseModel):
    status: str
