# backend/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas
from database import engine, get_db

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lees API")

# Setup CORS so your React frontend (port 5173) can talk to this API (port 8000)
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
    total_gallons = db.query(func.sum(models.Batch.volume_gal)).filter(
        models.Batch.status.in_(["ACTIVE", "BULK AGING"])
    ).scalar() or 0.0

    # Calculate Average Temp of latest logs
    avg_temp = db.query(func.avg(models.Log.temp)).scalar() or 0.0

    return {
        "total_active_gallons": round(total_gallons, 1),
        "avg_fermentation_temp": round(avg_temp, 1),
        "inventory_alerts": 0 # Hardcoded for now until we build Inventory
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