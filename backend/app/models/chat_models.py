from pydantic import BaseModel
from typing import List


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    note_id: str
    messages: List[ChatMessage]
    new_message: str


class ChatResponse(BaseModel):
    reply: str
