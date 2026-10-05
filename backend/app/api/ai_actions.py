from typing import List
import hashlib

from fastapi import HTTPException
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel
from app.ai.chat_ai import generate_chat_reply
from app.ai.mock_exam_ai import generate_mock_exam
from app.core.pdf_extractor import extract_pdf_text
from app.ai.summarise_ai import generate_structured_summary
from app.core.db import notes_collection
from app.core.dependencies import get_current_user
from bson import ObjectId
from datetime import datetime
from app.ai.flashcard_ai import generate_flashcards_from_summary
from app.ai.quizz_ai import generate_quiz_from_summary
from app.models.chat_models import ChatRequest, ChatResponse
from app.models.mock_exam_request_model import MockExamRequest

router = APIRouter(
    prefix="/ai",
    tags=["ai"],
)


@router.post("/generate-summary")
async def generate_summary_route(
    text: str = Form(None),
    file: UploadFile = File(None),
    current_user: dict = Depends(get_current_user),
):
    if not text and not file:
        return {"error": "Provide either text or PDF"}

    file_hash = None

    if file:
        file_content = await file.read()
        file_hash = hashlib.sha256(file_content).hexdigest()
        await file.seek(0)  

        text = await extract_pdf_text(file)

    if file_hash:
        existing_note = await notes_collection.find_one({
        "user_id": ObjectId(current_user["id"]),
        "file_hash": file_hash,
    })

        if existing_note:
            return {
                "note_id": str(existing_note["_id"]),
                "summary": existing_note["summary"],
            }

    elif text:
        existing_note = await notes_collection.find_one({
            "user_id": ObjectId(current_user["id"]),
            "source_type": "text",
            "raw_text": text,
        })

        if existing_note:
            return {
                "note_id": str(existing_note["_id"]),
                "summary": existing_note["summary"],
            }

    # Generate summary
    try:
        summary_data = generate_structured_summary(text)
    except Exception as e:
        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            raise HTTPException(
                status_code=429,
                detail="Gemini API quota exceeded. Please try again later."
            )
        raise
    
    # Store in DB
    note_doc = {
        "user_id": ObjectId(current_user["id"]),
        "title": summary_data.get("title"),
        "raw_text": text,
        "source_type": "pdf" if file else "text",
        "file_hash": file_hash,
        "summary": summary_data,
        "flashcards": [],
        "quiz": [],
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    }

    result = await notes_collection.insert_one(note_doc)

    return {
        "note_id": str(result.inserted_id),
        "summary": summary_data,
    }


@router.post("/{note_id}/flashcards")
async def generate_flashcards(
    note_id: str, current_user: dict = Depends(get_current_user)
):
    note = await notes_collection.find_one(
        {"_id": ObjectId(note_id), "user_id": ObjectId(current_user["id"])}
    )

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    if not note.get("raw_text"):
        raise HTTPException(
            status_code=400, detail="Raw text not available for flashcard generation"
        )

    # Generate flashcards from summary
    flashcards = generate_flashcards_from_summary(note["raw_text"])

    # Store in DB
    await notes_collection.update_one(
        {"_id": ObjectId(note_id)}, {"$set": {"flashcards": flashcards}}
    )

    return flashcards


@router.post("/{note_id}/quiz")
async def generate_quiz(note_id: str, current_user: dict = Depends(get_current_user)):
    note = await notes_collection.find_one(
        {"_id": ObjectId(note_id), "user_id": ObjectId(current_user["id"])}
    )

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    if not note.get("raw_text"):
        raise HTTPException(
            status_code=400, detail="Raw text not available for quiz generation"
        )

    quiz = generate_quiz_from_summary(note["raw_text"])

    # Store in DB
    await notes_collection.update_one(
        {"_id": ObjectId(note_id)},
        {
            "$set": {"quiz": quiz},
        },
    )

    return quiz


@router.post("/{note_id}/chat", response_model=ChatResponse)
async def chat_with_ai(
    payload: ChatRequest, current_user: dict = Depends(get_current_user)
):

    note = await notes_collection.find_one(
        {"_id": ObjectId(payload.note_id), "user_id": ObjectId(current_user["id"])}
    )

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    if not note.get("raw_text"):
        raise HTTPException(
            status_code=400, detail="Raw text not available for chat generation"
        )

    reply = generate_chat_reply(
        raw_text=note["raw_text"],
        history=payload.messages,
        new_message=payload.new_message,
    )

    return ChatResponse(reply=reply)


@router.post("/generate-mock-exam")
async def generate_mock_exam_route(
    payload: MockExamRequest,
    current_user: dict = Depends(get_current_user),
):

    if not payload.note_ids:
        raise HTTPException(status_code=400, detail="No notes selected")

    object_ids = [ObjectId(note_id) for note_id in payload.note_ids]

    notes = await notes_collection.find(
        {
            "_id": {"$in": object_ids},
            "user_id": ObjectId(current_user["id"]),
        }
    ).to_list(length=None)

    if not notes:
        raise HTTPException(status_code=404, detail="Notes not found")

    # Combine raw text
    combined_text = "\n\n".join([note.get("raw_text", "") for note in notes])

    if not combined_text.strip():
        raise HTTPException(status_code=400, detail="No raw text available")

    mock_exam = generate_mock_exam(combined_text)

    return mock_exam
