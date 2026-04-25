# backend/schemas.py
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


# --- LOG SCHEMAS ---
class LogBase(BaseModel):
    sg: Optional[float] = None
    temp: Optional[float] = None
    note: Optional[str] = None
    rating: Optional[int] = None
    # NEW: Track backsweetening & step-feeding
    added_honey_g: Optional[float] = None


class LogCreate(LogBase):
    pass


class LogResponse(LogBase):
    id: int
    batch_id: int
    date: datetime

    class Config:
        from_attributes = True


# --- BATCH SCHEMAS ---
class BatchBase(BaseModel):
    name: str
    style: str
    recipe: Optional[str] = None
    yeast: Optional[str] = None
    volume_gal: float
    target_og: Optional[float] = None
    target_abv: Optional[float] = None
    yield_bottles: Optional[int] = 0
    remaining_bottles: Optional[int] = 0


class BatchCreate(BatchBase):
    pass


class BatchResponse(BatchBase):
    id: int
    status: str
    phase: str
    start_date: datetime
    logs: List[LogResponse] = []

    class Config:
        from_attributes = True
