# backend/main.py
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

import models
import schemas
from database import engine, get_db

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lees API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DASHBOARD ENDPOINTS ---


@app.patch("/api/batches/{batch_id}", response_model=schemas.BatchResponse)
def update_batch(batch_id: int, batch_update: dict, db: Session = Depends(get_db)):
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    # Dynamically update only the fields sent from React
    for key, value in batch_update.items():
        if hasattr(batch, key):
            setattr(batch, key, value)

    db.commit()
    db.refresh(batch)
    return batch


@app.get("/api/dashboard/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    # Calculate Total Active Gallons
    total_gallons = (
        db.query(func.sum(models.Batch.volume_gal))
        .filter(models.Batch.status.in_(["ACTIVE", "BULK AGING"]))
        .scalar()
        or 0.0
    )

    # Calculate Average Temp of latest logs
    avg_temp = db.query(func.avg(models.Log.temp)).scalar() or 0.0

    return {
        "total_active_gallons": round(total_gallons, 1),
        "avg_fermentation_temp": round(avg_temp, 1),
        "inventory_alerts": 0,  # Hardcoded for now until we build Inventory
    }


# --- BATCH ENDPOINTS ---


@app.delete("/api/batches/{batch_id}")
def delete_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    db.delete(batch)
    db.commit()
    return {"message": "Batch deleted successfully"}


@app.post("/api/batches", response_model=schemas.BatchResponse)
def create_batch(batch: schemas.BatchCreate, db: Session = Depends(get_db)):
    db_batch = models.Batch(**batch.model_dump())
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch


@app.get("/api/batches", response_model=list[schemas.BatchResponse])
def get_batches(status: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Batch)
    if status:
        query = query.filter(models.Batch.status == status)
    return query.all()


@app.get("/api/batches/{batch_id}", response_model=schemas.BatchResponse)
def get_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch


# --- LOG ENDPOINTS ---
@app.post("/api/batches/{batch_id}/logs", response_model=schemas.LogResponse)
def add_log(batch_id: int, log: schemas.LogCreate, db: Session = Depends(get_db)):
    # Verify batch exists
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    db_log = models.Log(**log.model_dump(), batch_id=batch_id)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


@app.delete("/api/logs/{log_id}")
def delete_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(models.Log).filter(models.Log.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    db.delete(log)
    db.commit()
    return {"message": "Log deleted"}


@app.patch("/api/logs/{log_id}", response_model=schemas.LogResponse)
def update_log(log_id: int, log_update: schemas.LogUpdate, db: Session = Depends(get_db)):
    log = db.query(models.Log).filter(models.Log.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    update_data = log_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(log, key, value)

    db.commit()
    db.refresh(log)
    return log


# --- RECIPE ENDPOINTS ---


@app.get("/api/recipes", response_model=list[schemas.RecipeResponse])
def get_recipes(db: Session = Depends(get_db)):
    """
    Fetch all available recipes for the Cookbook master view.
    """
    recipes = db.query(models.Recipe).all()
    return recipes


@app.get("/api/recipes/{recipe_id}", response_model=schemas.RecipeResponse)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """
    Fetch a specific recipe by ID.
    """
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@app.post("/api/recipes", response_model=schemas.RecipeResponse)
def create_recipe(recipe: schemas.RecipeCreate, db: Session = Depends(get_db)):
    """
    Create a new recipe formulation.
    """
    db_recipe = models.Recipe(**recipe.model_dump())
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe


@app.delete("/api/recipes/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """
    Delete a recipe from the Cookbook.
    """
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    db.delete(recipe)
    db.commit()
    return {"message": "Recipe deleted successfully"}


@app.patch("/api/recipes/{recipe_id}", response_model=schemas.RecipeResponse)
def update_recipe(
    recipe_id: int, recipe_update: schemas.RecipeUpdate, db: Session = Depends(get_db)
):
    """
    Update an existing recipe.
    """
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    update_data = recipe_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(recipe, key):
            setattr(recipe, key, value)

    db.commit()
    db.refresh(recipe)
    return recipe
