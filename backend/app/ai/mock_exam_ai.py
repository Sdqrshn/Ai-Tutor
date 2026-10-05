from google import genai
from google.genai import types
import json
from app.core.config import GEMINI_API_KEY_1

client = genai.Client(api_key=GEMINI_API_KEY_1)


def generate_mock_exam(raw_text: str) -> dict:
    """
    Generate a mock exam paper from combined notes
    """

    prompt = f"""
You are an academic exam generator.

Based on the following study material:

{raw_text}

Create a MOCK QUESTION PAPER.

Return STRICT JSON ONLY in this format:

{{
  "title": "Mock Exam",
  "sections": [
    {{
      "section": "MCQ",
      "questions": [
        {{
          "id": "1",
          "question": "Question text",
          "options": ["A", "B", "C", "D"],
          "answer": "Correct option"
        }}
      ]
    }},
    {{
      "section": "Short Answer",
      "questions": [
        {{
          "id": "1",
          "question": "Question text"
        }}
      ]
    }},
    {{
      "section": "Long Answer",
      "questions": [
        {{
          "id": "1",
          "question": "Question text"
        }}
      ]
    }}
  ]
}}

Rules:
- 5 MCQs
- 3 short answer questions
- 2 long answer questions
- Questions must test conceptual understanding
- No text outside JSON
"""

    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)],
        )
    ]

    config = types.GenerateContentConfig(
        temperature=0.5,
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
