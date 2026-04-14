from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.report import Report

router = APIRouter(prefix="/public", tags=["Public"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/count")
def get_report_count(db: Session = Depends(get_db)):
    approved_count = (
        db.query(Report)
        .filter(Report.status == "approved")
        .count()
    )
    return {"count": approved_count}