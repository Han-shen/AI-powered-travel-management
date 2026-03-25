import os
import uuid
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.config import UPLOAD_DIR
from app.database import documents_collection, trips_collection
from app.deps import get_current_user

router = APIRouter(prefix="/documents", tags=["documents"])
os.makedirs(UPLOAD_DIR, exist_ok=True)


def serialize_document(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    doc["trip_id"] = str(doc["trip_id"])
    doc["user_id"] = str(doc["user_id"])
    return doc


@router.get("/{trip_id}")
def list_documents(trip_id: str, current_user=Depends(get_current_user)):
    docs = documents_collection.find({"trip_id": ObjectId(trip_id), "user_id": ObjectId(current_user["id"])})
    return [serialize_document(d) for d in docs]


@router.post("")
async def upload_document(
    trip_id: str = Form(...),
    tag: str = Form(...),
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    trip = trips_collection.find_one({"_id": ObjectId(trip_id), "user_id": ObjectId(current_user["id"])})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    content = await file.read()
    with open(path, "wb") as out:
        out.write(content)

    doc = {
        "trip_id": ObjectId(trip_id),
        "user_id": ObjectId(current_user["id"]),
        "tag": tag,
        "filename": filename,
        "original_name": file.filename,
        "uploaded_at": datetime.now(timezone.utc),
    }
    result = documents_collection.insert_one(doc)
    created = documents_collection.find_one({"_id": result.inserted_id})
    return serialize_document(created)


@router.get("/download/{doc_id}")
def download_document(doc_id: str, current_user=Depends(get_current_user)):
    doc = documents_collection.find_one({"_id": ObjectId(doc_id), "user_id": ObjectId(current_user["id"])})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    path = os.path.join(UPLOAD_DIR, doc["filename"])
    return FileResponse(path, filename=doc["original_name"])


@router.delete("/{doc_id}")
def delete_document(doc_id: str, current_user=Depends(get_current_user)):
    doc = documents_collection.find_one({"_id": ObjectId(doc_id), "user_id": ObjectId(current_user["id"])})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    path = os.path.join(UPLOAD_DIR, doc["filename"])
    if os.path.exists(path):
        os.remove(path)
    documents_collection.delete_one({"_id": ObjectId(doc_id)})
    return {"success": True}
