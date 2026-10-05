from google import genai
from google.genai import types
import json
import random
from app.core.config import GEMINI_API_KEY_1

client = genai.Client(api_key=GEMINI_API_KEY_1)


def generate_quiz_from_summary(raw_text: str) -> list:
    """
    Generate multiple choice quiz from raw text.
    Returns stable JSON with correctIndex calculated in backend.
    """

    prompt = f"""
You are an academic quiz generator.

Based on this study material:

{raw_text}

Generate 5-8 high-quality multiple choice questions.

Return STRICT JSON ONLY in this format:

[
  {{
    "id": "1",
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Exact correct option text"
  }}
]

Rules:
- Exactly 4 options per question
- correctAnswer MUST exactly match one of the options
- Shuffle options logically (do not always put correct answer first)
- Sequential string IDs starting from "1"
- No extra text outside JSON
"""

    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)],
        )
    ]

    config = types.GenerateContentConfig(
        temperature=0.5,  # slightly higher to avoid position bias
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents,
        config=config,
    )

    full_response = response.text if hasattr(response, "text") else ""

    try:
        start = full_response.find("[")
        end = full_response.rfind("]") + 1
        json_str = full_response[start:end]
        data = json.loads(json_str)

        # 🔥 Convert correctAnswer → correctIndex safely
        for item in data:
            correct_answer = item.get("correctAnswer")

            if not correct_answer or correct_answer not in item.get("options", []):
                # fallback safety
                item["correctIndex"] = 0
            else:
                # Randomize options to remove positional bias
                random.shuffle(item["options"])
                item["correctIndex"] = item["options"].index(correct_answer)

            # Remove correctAnswer from final response
            item.pop("correctAnswer", None)

        return data

    except Exception as e:
        return {
            "error": str(e),
            "raw_response": full_response.strip(),
        }
