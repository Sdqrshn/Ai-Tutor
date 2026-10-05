from google import genai
from google.genai import types
import json
from app.core.config import GEMINI_API_KEY_1

client = genai.Client(api_key=GEMINI_API_KEY_1)


def generate_flashcards_from_summary(raw_text: str) -> list:
    """
    Generate flashcards using stored text data
    """

    prompt = f"""
You are an academic flashcard generator.

Based on this text data:

{raw_text}

Generate 6-10 high-quality flashcards.

Return STRICT JSON ONLY in this format:

[
  {{
    "id": "1",
    "front": "Question?",
    "back": "Answer"
  }}
]

Rules:
- Clear conceptual questions
- Concise but complete answers
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
        temperature=0.4,  # slightly creative but stable
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
        result = json.loads(json_str)
    except Exception as e:
        result = {
            "error": str(e),
            "raw_response": full_response.strip(),
        }

    return result
