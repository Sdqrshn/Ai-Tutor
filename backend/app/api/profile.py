from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime

from app.core.dependencies import get_current_user
from app.core.db import notes_collection

router = APIRouter(
    prefix="/profile",
    tags=["profile"],
)


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user


@router.get("/notes-history")
async def get_notes_history(current_user: dict = Depends(get_current_user)):
    notes = await notes_collection.find(
        {"user_id": ObjectId(current_user["id"])}
    ).to_list(length=None)

    for note in notes:
        note["_id"] = str(note["_id"])
        note["user_id"] = str(note["user_id"])

    return notes


@router.delete("/notes/{note_id}")
async def delete_note(note_id: str, current_user: dict = Depends(get_current_user)):
    await notes_collection.delete_one(
        {"_id": ObjectId(note_id), "user_id": ObjectId(current_user["id"])}
    )

    return {"message": "Note deleted successfully"}

@router.patch("/notes/{note_id}")
async def rename_note(
    note_id: str,
    title: str,
    current_user: dict = Depends(get_current_user),
):
    result = await notes_collection.update_one(
        {
            "_id": ObjectId(note_id),
            "user_id": ObjectId(current_user["id"]),
        },
        {
            "$set": {
                "title": title,
                "updated_at": datetime.now(),
            }
        },
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")

    return {"message": "Note renamed successfully"}