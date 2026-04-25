# backend/database.py
import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Check if we are running inside a Docker container
IS_DOCKER = os.path.exists("/.dockerenv")

if IS_DOCKER:
    SQLALCHEMY_DATABASE_URL = "sqlite:////app/data/lees_tracker.db"
else:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./lees_tracker.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency to get the database session in our routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
