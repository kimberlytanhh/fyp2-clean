from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
import shutil
import os
import uuid
import json
from pathlib import Path
from app.ai.toxicity_detector import check_toxicity
from app.database import SessionLocal
from app.models.report import Report
from app.models.user import User
from app.schemas.report import ReportCreate, ReportResponse, AdminCategoryUpdate, ReportStatusUpdate
from app.core.deps import get_current_user, require_admin
from app.ai.image_classifier import classify_image

router = APIRouter(prefix="/reports", tags=["Reports"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create report
@router.post("/", response_model=ReportResponse)
def create_report(
    title: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    longitude: float = Form(...),
    latitude: float = Form(...),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    image_path = None
    image_category = None
    image_confidence = None
    final_category = None

    # Run toxicity detection
    combined_text = f"{title} {description}"
    toxicity_result = check_toxicity(combined_text)

    toxicity_score = toxicity_result["toxicity_score"]

    if toxicity_result["is_toxic"]:
        status = "flagged"
    else:
        status = "approved"

    if image:
        os.makedirs("uploads", exist_ok=True)

        file_ext = os.path.splitext(image.filename)[1].lower()
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        image_path = os.path.join("uploads", unique_filename)

        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        result = classify_image(image_path)
        image_category = result["image_category"]
        image_confidence = result["image_confidence"]
        final_category = image_category

    new_report = Report(
        title=title,
        description=description,
        location=location,
        latitude=latitude,
        longitude=longitude,
        image_path=image_path,
        user_id=current_user.id,

        text_category=None,
        text_confidence=None,
        image_category=image_category,
        image_confidence=image_confidence,
        final_category=final_category,

        status=status
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return new_report


# Public reports list
@router.get("/public")
def public_reports(
    db: Session = Depends(get_db),
    status: str | None = None,
    sort: str = "newest"
):

    q = db.query(Report).join(User).filter(Report.status == "approved")

    if status:
        q = q.filter(Report.status == status)

    if sort == "oldest":
        q = q.order_by(Report.created_at.asc())
    else:
        q = q.order_by(Report.created_at.desc())

    reports = q.all()

    return [
        {
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "location": r.location,
            "latitude": r.latitude,     
            "longitude": r.longitude, 
            "status": r.status,
            "created_at": r.created_at,
            "image_path": r.image_path,
            "username": r.user.name,
        }
        for r in reports
    ]


# Public report detail
@router.get("/public/{report_id}")
def public_report_detail(
    report_id: int,
    db: Session = Depends(get_db)
):

    report = (
        db.query(Report)
        .join(User)
        .filter(Report.id == report_id)
        .first()
    )

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return {
        "id": report.id,
        "title": report.title,
        "description": report.description,
        "location": report.location,
        "status": report.status,
        "created_at": report.created_at,
        "image_path": report.image_path,
        "username": report.user.name,
    }


# View own reports
@router.get("/me", response_model=list[ReportResponse])
def get_my_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    return (
        db.query(Report)
        .filter(Report.user_id == current_user.id)
        .all()
    )


# Map reports
@router.get("/map")
def get_reports_for_map(db: Session = Depends(get_db)):

    reports = db.query(Report).all()

    return [
        {
            "id": r.id,
            "title": r.title,
            "status": r.status,
            "category": r.final_category,
            "latitude": r.latitude,
            "longitude": r.longitude,
        }
        for r in reports
    ]





# Update report
@router.put("/{report_id}", response_model=ReportResponse)
def update_report(
    report_id: int,
    title: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    report.title = title
    report.description = description
    report.location = location

    if image:
        os.makedirs("uploads", exist_ok=True)

        file_ext = os.path.splitext(image.filename)[1].lower()
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        image_path = os.path.join("uploads", unique_filename)

        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        result = classify_image(image_path)

        report.image_path = image_path
        report.image_category = result["image_category"]
        report.image_confidence = result["image_confidence"]
        report.final_category = result["image_category"]

    db.commit()
    db.refresh(report)

    return report


# Delete report
@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    if report.image_path and os.path.exists(report.image_path):
        os.remove(report.image_path)

    db.delete(report)
    db.commit()

    return {"detail": "Report deleted"}

@router.get("/admin/all")
def get_all_reports_for_admin(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return db.query(Report).order_by(Report.created_at.desc()).all()


@router.get("/admin/stats")
def get_admin_dashboard_stats(db: Session = Depends(get_db)):

    total = db.query(Report).count()
    pending = db.query(Report).filter(Report.status == "flagged").count()
    resolved = db.query(Report).filter(Report.status == "resolved").count()

    return {
        "total_reports": total,
        "pending_review": pending,
        "resolved": resolved
    }


@router.get("/admin/analytics/categories")
def analytics_by_category(db: Session = Depends(get_db)):

    category_expr = func.coalesce(
        Report.final_category,
        Report.predicted_category,
        Report.image_category
    )

    results = (
        db.query(
            category_expr.label("category"),
            func.count(Report.id)
        )
        .filter(category_expr.isnot(None))   # ✅ THIS LINE FIXES IT
        .group_by(category_expr)
        .all()
    )

    return {
        "labels": [r[0] for r in results],
        "counts": [r[1] for r in results]
    }


@router.get("/admin/flagged")
def get_flagged_reports(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return (
        db.query(Report)
        .filter(Report.status == "flagged")
        .order_by(Report.created_at.desc())
        .all()
    )

@router.get("/admin/approved")
def get_approved_reports(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return (
        db.query(Report)
        .filter(Report.status == "approved")
        .order_by(Report.created_at.desc())
        .all()
    )


# Admin: view all reports
@router.get("/", response_model=list[ReportResponse])
def get_all_reports(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):

    return db.query(Report).all()


# Admin: update report status
@router.patch("/{report_id}/status", response_model=ReportResponse)
def update_report_status(
    report_id: int,
    payload: ReportStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):

    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = payload.status

    db.commit()
    db.refresh(report)

    return report


# Admin dashboard summary
@router.get("/admin/summary")
def admin_dashboard_summary(db: Session = Depends(get_db)):

    total_reports = db.query(Report).count()

    pending_review = (
    db.query(Report)
    .filter(Report.status == "flagged")
    .count()
)

    status_counts = (
        db.query(Report.status, func.count(Report.id))
        .group_by(Report.status)
        .all()
    )

    return {
        "total_reports": total_reports,
        "pending_review": pending_review,
        "status_counts": {
            status: count for status, count in status_counts
        }
    }


# Admin update category
@router.patch("/{report_id}/category", response_model=ReportResponse)
def admin_update_category(
    report_id: int,
    payload: AdminCategoryUpdate,
    db: Session = Depends(get_db),
):

    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.final_category = payload.final_category

    db.commit()
    db.refresh(report)

    return report


# Get specific report
@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    return report

@router.get("/admin/image-classifier-metrics")
def get_image_classifier_metrics():
    metrics_path = Path("app/ai/training_metrics.json")

    if not metrics_path.exists():
        return {"message": "No training metrics found."}

    with open(metrics_path, "r") as f:
        return json.load(f)
    
@router.get("/admin/analytics/ai-confidence")
def get_ai_confidence(db: Session = Depends(get_db)):
    avg_conf = db.query(func.avg(Report.image_confidence)).scalar()

    return {
        "average_confidence": round(avg_conf or 0, 4)
    }

@router.get("/admin/analytics/trend")
def report_trend(db: Session = Depends(get_db)):
    results = (
        db.query(
            func.date(Report.created_at),
            func.count(Report.id)
        )
        .group_by(func.date(Report.created_at))
        .all()
    )

    return {
        "dates": [str(r[0]) for r in results],
        "counts": [r[1] for r in results]
    }

@router.get("/analytics/top-location")
def top_location(db: Session = Depends(get_db)):
    results = (
        db.query(Report.location, func.count(Report.id))
        .group_by(Report.location)
        .order_by(func.count(Report.id).desc())
        .first()
    )

    if not results:
        return {"location": None, "count": 0}

    return {"location": results[0], "count": results[1]}

@router.get("/analytics/top-category")
def top_category(db: Session = Depends(get_db)):
    results = (
        db.query(Report.final_category, func.count(Report.id))
        .filter(Report.final_category.isnot(None))
        .group_by(Report.final_category)
        .order_by(func.count(Report.id).desc())
        .first()
    )

    if not results:
        return {"category": None, "count": 0}

    return {"category": results[0], "count": results[1]}

