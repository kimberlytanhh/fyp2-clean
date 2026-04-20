from sentence_transformers import SentenceTransformer, util

# Load once (important for performance)
model = SentenceTransformer("all-MiniLM-L6-v2")

INTENTS = {
    "most_category": [
        "which category has the most reports",
        "most common incident",
        "which incident type appears most"
    ],
    "pending_reports": [
        "how many reports are pending",
        "reports waiting for review",
        "pending incidents"
    ],
    "resolved_reports": [
        "how many reports are resolved",
        "resolved incidents",
        "closed reports"
    ]
}

# Precompute embeddings
intent_embeddings = {
    k: model.encode(v, convert_to_tensor=True)
    for k, v in INTENTS.items()
}

def detect_admin_intent(msg: str):
    msg = msg.lower()

    # 🔥 MOST SPECIFIC FIRST
    if "flagged" in msg:
        return "flagged_count"

    if "pending" in msg:
        return "pending_reports"

    if "highest" in msg and "category" in msg:
        return "top_category"

    if "category" in msg and "most" in msg:
        return "top_category"

    if "location" in msg or "area" in msg:
        return "top_location"

    # 🔥 GENERAL LAST
    if "how many" in msg and "report" in msg:
        return "total_reports"

    return None

    return best_intent
