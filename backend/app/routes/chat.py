from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from openai import OpenAI
import os

from app.database import SessionLocal
from app.core.deps import get_current_user
from app.models.user import User
from app.models.report import Report

router = APIRouter(prefix="/chat", tags=["Chatbot"])

# ⚠️ Move this to .env later (for now keep it to avoid breaking your system)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class TitleRequest(BaseModel):
    description: str

class ChatRequest(BaseModel):
    message: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ================= INTENT DETECTION =================
def detect_admin_intent(msg: str):
    msg = msg.lower()

    if "category" in msg and ("most" in msg or "highest" in msg):
        return "top_category"

    if "how many" in msg and "report" in msg:
        return "total_reports"
    
    if "pending" in msg:
        return "pending_reports"

    if "flagged" in msg and "how many" in msg:
        return "flagged_count"

    if "flagged reports" in msg:
        return "flagged_summary"

    if "location" in msg or "area" in msg:
        return "top_location"

    # 🔥 AI CONFIDENCE (SMART HANDLING)
    if "confidence" in msg:
        explain_words = ["meaning", "mean", "what is", "explain"]

        if any(word in msg for word in explain_words):
            return "ai_confidence_explain"
        else:
            return "ai_confidence"

    return None


# ================= ADMIN QUERY HANDLER =================
def handle_admin_query(intent: str, db: Session):

    # 🔥 AI CONFIDENCE EXPLANATION
    if intent == "ai_confidence_explain":
        return (
            "AI confidence indicates how certain the AI model is about its prediction. "
            "A higher value means the model is more confident in the assigned category."
        )

    # 🔥 TOP CATEGORY
    if intent == "top_category":
        result = (
            db.query(Report.final_category, func.count(Report.id))
            .filter(Report.final_category.isnot(None))
            .group_by(Report.final_category)
            .order_by(func.count(Report.id).desc())
            .first()
        )

        if not result:
            return "No category data available."

        return f"Top category is {result[0]} with {result[1]} reports."

    # 🔥 TOTAL REPORTS
    if intent == "total_reports":
        total = db.query(func.count(Report.id)).scalar()
        return f"There are {total} reports in total."

    # 🔥 FLAGGED COUNT
    if intent == "flagged_count":
        count = db.query(func.count(Report.id)).filter(Report.status == "flagged").scalar()
        return f"There are {count} flagged reports."

    # 🔥 FLAGGED SUMMARY
    if intent == "flagged_summary":
        reports = (
            db.query(Report)
            .filter(Report.status == "flagged")
            .order_by(Report.created_at.desc())
            .limit(5)
            .all()
        )

        if not reports:
            return "No flagged reports."

        text = "Latest flagged reports:\n"
        for r in reports:
            text += f"- {r.title} ({r.location})\n"

        return text

    # 🔥 TOP LOCATION
    if intent == "top_location":
        result = (
            db.query(Report.location, func.count(Report.id))
            .group_by(Report.location)
            .order_by(func.count(Report.id).desc())
            .first()
        )

        if not result:
            return "No location data available."

        return f"Location with most reports is {result[0]} ({result[1]} reports)."

    # 🔥 AI CONFIDENCE
    if intent == "ai_confidence":
        avg = db.query(func.avg(Report.image_confidence)).scalar()
        return f"Average AI confidence is {round(avg or 0, 4)}."

    if intent == "pending_reports":
        count = db.query(func.count(Report.id)).filter(Report.status == "pending").scalar()
        return f"There are {count} pending reports."

    return None


# ================= MAIN CHAT =================
@router.post("/")
def chat(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    msg = req.message.lower()

    # ================= ADMIN MODE =================
    if current_user.role == "admin":
        intent = detect_admin_intent(msg)

        if intent:
            result = handle_admin_query(intent, db)
            if result:
                return {"reply": result}

    # ================= USER REPORT STATUS (UNCHANGED) =================
    if "my reports" in msg or "status" in msg:
        reports = db.query(Report).filter(Report.user_id == current_user.id).all()

        if not reports:
            return {"reply": "You have no reports yet."}

        text = ""
        for r in reports:
            text += f"{r.title} → {r.status}\n"

        return {"reply": text}

    # ================= AI FALLBACK (UNCHANGED) =================
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant for a community reporting system."
            },
            {"role": "user", "content": req.message}
        ]
    )

    return {"reply": response.choices[0].message.content}


# ================= TITLE GENERATOR (UNCHANGED) =================
@router.post("/generate-title")
async def generate_title(req: TitleRequest):
    prompt = f"""
Rewrite this issue into a SHORT, clear report title.

Rules:
- Max 8 words
- No "there is/are"
- No "issue:"
- Professional tone
- No extra explanation

Issue:
{req.description}

Title:
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You generate short report titles."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    title = response.choices[0].message.content.strip()

    return {"title": title}