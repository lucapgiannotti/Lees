# backend/seed.py
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from datetime import datetime, timedelta

def seed_db():
    print("Building database schema...")
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    print("Cleaning up old data...")
    db.query(models.Log).delete()
    db.query(models.Batch).delete()
    db.commit()

    print("Seeding Batches & Logs...")
    
    # --- BATCH 1: Active Primary ---
    batch1 = models.Batch(
        name="Traditional Mead #4",
        style="Traditional",
        recipe="Orange Blossom Honey + Spring Water",
        status="ACTIVE",
        phase="Primary",
        volume_gal=1.0,
        target_og=1.110,
        target_abv=14.5,
        start_date=datetime.utcnow() - timedelta(days=7)
    )
    db.add(batch1)
    db.flush() 

    db.add(models.Log(batch_id=batch1.id, sg=1.110, temp=68, note="Pitched yeast", date=datetime.utcnow() - timedelta(days=7)))
    db.add(models.Log(batch_id=batch1.id, sg=1.085, temp=70, note="Healthy bubbles", date=datetime.utcnow() - timedelta(days=4)))
    db.add(models.Log(batch_id=batch1.id, sg=1.050, temp=69, note="Smells great", date=datetime.utcnow() - timedelta(days=1)))

    # --- BATCH 2: Secondary with Backsweetening (Dilution Test) ---
    batch2 = models.Batch(
        name="Raspberry Melomel",
        style="Fruit Mead",
        recipe="Wildflower Honey + Frozen Raspberries",
        status="ACTIVE",
        phase="Secondary",
        volume_gal=1.0,
        target_og=1.095,
        target_abv=12.5,
        start_date=datetime.utcnow() - timedelta(days=30)
    )
    db.add(batch2)
    db.flush()

    db.add(models.Log(batch_id=batch2.id, sg=1.095, date=datetime.utcnow() - timedelta(days=30)))
    db.add(models.Log(batch_id=batch2.id, sg=1.000, note="Fermented dry", date=datetime.utcnow() - timedelta(days=15)))
    db.add(models.Log(batch_id=batch2.id, added_honey_g=250, note="Backsweetened with honey", date=datetime.utcnow() - timedelta(days=2)))
    db.add(models.Log(batch_id=batch2.id, sg=1.012, note="Post-backsweeten reading", date=datetime.utcnow() - timedelta(days=1)))

    # --- BATCH 3: Bottled (Inventory Test) ---
    batch3 = models.Batch(
        name="Autumn Cyser",
        style="Cyser",
        status="BOTTLED",
        phase="Bottled",
        volume_gal=1.0,
        target_abv=13.0,
        yield_bottles=12,
        remaining_bottles=10,
        start_date=datetime.utcnow() - timedelta(days=120)
    )
    db.add(batch3)
    db.flush()
    
    db.add(models.Log(batch_id=batch3.id, sg=1.08, date=datetime.utcnow() - timedelta(days=30)))
    db.add(models.Log(batch_id=batch3.id, sg=1.000, note="Fermented dry", date=datetime.utcnow() - timedelta(days=15)))
    db.add(models.Log(batch_id=batch3.id, rating=5, note="Incredible clarity, crisp apple notes", date=datetime.utcnow() - timedelta(days=10)))
    db.add(models.Log(batch_id=batch3.id, rating=4, note="Opened for a friend, a bit hot still", date=datetime.utcnow() - timedelta(days=5)))

    db.commit()
    print("✅ Database successfully seeded!")
    db.close()

if __name__ == "__main__":
    seed_db()