# backend/models.py
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    status = Column(String, default="ACTIVE")  # ACTIVE, BULK AGING, BOTTLED, ARCHIVED
    phase = Column(String, default="Primary")
    style = Column(String)
    recipe = Column(String, nullable=True)
    yeast = Column(String, nullable=True)

    # Formulated targets
    volume_gal = Column(Float)
    target_og = Column(Float, nullable=True)
    target_abv = Column(Float, nullable=True)

    start_date = Column(DateTime, default=datetime.utcnow)

    # Relationship to link logs to this specific batch
    logs = relationship("Log", back_populates="batch", cascade="all, delete-orphan")

    yield_bottles = Column(Integer, default=0)
    remaining_bottles = Column(Integer, default=0)


class Log(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"))
    date = Column(DateTime, default=datetime.utcnow)

    sg = Column(Float, nullable=True)
    temp = Column(Float, nullable=True)
    note = Column(String, nullable=True)
    rating = Column(Integer, nullable=True)

    added_honey_g = Column(Float, nullable=True)

    batch = relationship("Batch", back_populates="logs")


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    source = Column(String, nullable=True)
    total_volume = Column(Float, nullable=False)
    style = Column(String, nullable=False)
    carbonation = Column(String, nullable=False)
    target_og = Column(Float, nullable=False)
    target_fg_low = Column(Float, nullable=False)
    target_fg_high = Column(Float, nullable=False)

    ingredients = Column(JSON, nullable=False)

    method_markdown = Column(Text, nullable=False)
    notes_markdown = Column(Text, nullable=True)
