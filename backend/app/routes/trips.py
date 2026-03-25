from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.database import trips_collection
from app.deps import get_current_user
from app.models.schemas import TripCreate, TripUpdate, AIGenerateRequest
from app.services.ai import generate_mock_itinerary

router = APIRouter(prefix="/trips", tags=["trips"])


def serialize_trip(trip: dict) -> dict:
    trip["id"] = str(trip.pop("_id"))
    trip["user_id"] = str(trip["user_id"])
    return trip


@router.get("")
def list_trips(current_user=Depends(get_current_user)):
    trips = trips_collection.find({"user_id": ObjectId(current_user["id"])}).sort("start_date", 1)
    return [serialize_trip(t) for t in trips]


@router.post("")
def create_trip(payload: TripCreate, current_user=Depends(get_current_user)):
    data = payload.model_dump()
    # PyMongo can't encode `datetime.date` directly; store as ISO strings.
    if hasattr(data.get("start_date"), "isoformat"):
        data["start_date"] = data["start_date"].isoformat()
    if hasattr(data.get("end_date"), "isoformat"):
        data["end_date"] = data["end_date"].isoformat()
    data.update({"user_id": ObjectId(current_user["id"]), "created_at": datetime.now(timezone.utc)})
    result = trips_collection.insert_one(data)
    created = trips_collection.find_one({"_id": result.inserted_id})
    return serialize_trip(created)


@router.put("/{trip_id}")
def update_trip(trip_id: str, payload: TripUpdate, current_user=Depends(get_current_user)):
    trip = trips_collection.find_one({"_id": ObjectId(trip_id), "user_id": ObjectId(current_user["id"])})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if "start_date" in update_data and hasattr(update_data["start_date"], "isoformat"):
        update_data["start_date"] = update_data["start_date"].isoformat()
    if "end_date" in update_data and hasattr(update_data["end_date"], "isoformat"):
        update_data["end_date"] = update_data["end_date"].isoformat()
    if update_data:
        trips_collection.update_one({"_id": ObjectId(trip_id)}, {"$set": update_data})
    updated = trips_collection.find_one({"_id": ObjectId(trip_id)})
    return serialize_trip(updated)


@router.delete("/{trip_id}")
def delete_trip(trip_id: str, current_user=Depends(get_current_user)):
    result = trips_collection.delete_one({"_id": ObjectId(trip_id), "user_id": ObjectId(current_user["id"])})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"success": True}


@router.post("/generate-itinerary")
def generate_itinerary(payload: AIGenerateRequest, current_user=Depends(get_current_user)):
    return {
        "destination": payload.destination,
        "days": payload.days,
        "interests": payload.interests,
        "plan": generate_mock_itinerary(payload.destination, payload.days, payload.interests),
    }
