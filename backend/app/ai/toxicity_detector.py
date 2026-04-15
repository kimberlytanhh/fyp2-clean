from detoxify import Detoxify

# Load model once
model = None

def get_model():
    global model
    if model is None:
        model = Detoxify('original')
    return model

def check_toxicity(text: str):
    result = model.predict(text)

    toxicity_score = max(
        result["toxicity"],
        result["insult"],
        result["obscene"],
        result["threat"]
    )

    text_lower = text.lower()

    # 🔥 KEYWORD LIST (VERY IMPORTANT)
    bad_words = [
        "stupid", "idiot", "dumb", "useless",
        "hate", "annoying", "trash", "garbage",
        "shut up", "nonsense"
    ]

    keyword_flag = any(word in text_lower for word in bad_words)

    is_toxic = toxicity_score > 0.3 or keyword_flag

    return {
        "toxicity_score": float(toxicity_score),
        "is_toxic": is_toxic
    }