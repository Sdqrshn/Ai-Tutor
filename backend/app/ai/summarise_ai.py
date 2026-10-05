from google import genai
from google.genai import types
import json
from app.core.config import GEMINI_API_KEY_1

client = genai.Client(api_key=GEMINI_API_KEY_1)


def generate_structured_summary(notes_text: str) -> dict:
    """
    Generate structured study summary JSON from notes.
    """

    prompt = f"""
You are an expert academic summarization AI.

Convert the following study notes into a structured JSON summary.

Return STRICT JSON ONLY using this structure:

{{
  "title": "Short topic title",
  "overview": "Clear paragraph overview",
  "keyPoints": [
    "Important point 1",
    "Important point 2"
  ],
  "concepts": [
    {{
      "term": "Concept name",
      "definition": "Clear explanation"
    }}
  ]
}}

Rules:
- Extract the most important ideas only
- Write concise academic language
- Include 5-8 key points
- Include important terms as concepts
- DO NOT return anything outside JSON

Study notes:
\"\"\"{notes_text}\"\"\"
"""

    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)],
        )
    ]

    config = types.GenerateContentConfig(
        temperature=0.3,
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents,
        config=config,
    )

    full_response = response.text if hasattr(response, "text") else ""

    try:
        start = full_response.find("{")
        end = full_response.rfind("}") + 1
        json_str = full_response[start:end]
        result = json.loads(json_str)
    except Exception as e:
        result = {
            "error": str(e),
            "raw_response": full_response.strip(),
        }

    return result
