from google import genai
from google.genai import types
from app.core.config import GEMINI_API_KEY_1
from app.models.chat_models import ChatMessage

client = genai.Client(api_key=GEMINI_API_KEY_1)


def generate_chat_reply(
    raw_text: str, history: list[ChatMessage], new_message: str
) -> str:
    """
    Stateless chat: history comes from frontend
    """

    conversation = ""

    for msg in history:
        conversation += f"{msg.role.upper()}: {msg.content}\n"

    conversation += f"USER: {new_message}\n"

    prompt = f"""
You are an academic AI tutor.

Use ONLY the provided study material to answer.

If the answer is not found in the material, say:
"I cannot find this in the provided notes."

But you are allowed to use your own knowledge to answer questions that are not directly answered in the notes, but you must still use the notes as your primary source of information.

STUDY MATERIAL:
{raw_text}

CONVERSATION SO FAR:
{conversation}

ASSISTANT:
"""

    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)],
        )
    ]

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents,
        config=types.GenerateContentConfig(temperature=0.4),
    )

    return response.text.strip()
