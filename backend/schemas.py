# backend/schemas.py
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


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


class LogUpdate(LogBase):
    date: Optional[datetime] = None


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

    honey_varietal: Optional[str] = None
    nutrient_protocol: Optional[str] = None
    sweetness: Optional[str] = None

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


# --- RECIPE SCHEMAS ---
class IngredientBase(BaseModel):
    name: str
    amount: float
    unit: str
    scalable: bool = True
    notes: Optional[str] = None


class RecipeBase(BaseModel):
    name: str
    source: Optional[str] = None
    total_volume_gal: float = Field(..., description="Total volume of the batch in gallons")
    style: str
    carbonation: Optional[str] = None
    target_og: float
    target_fg_low: float
    target_fg_high: float
    ingredients: List[IngredientBase]
    method_markdown: Optional[str] = None
    notes_markdown: Optional[str] = None


class RecipeCreate(RecipeBase):
    pass


class RecipeUpdate(RecipeBase):
    pass


class RecipeResponse(RecipeBase):
    id: int

    class Config:
        from_attributes = True
