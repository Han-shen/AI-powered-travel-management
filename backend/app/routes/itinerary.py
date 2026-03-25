from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.database import itinerary_collection, trips_collection
from app.deps import get_current_user
from app.models.schemas import ItineraryCreate, ItineraryUpdate

router = APIRouter(prefix="/itinerary", tags=["itinerary"])


def serialize_item(item: dict) -> dict:
    item["id"] = str(item.pop("_id"))
    item["trip_id"] = str(item["trip_id"])
    item["user_id"] = str(item["user_id"])
    return item


@router.get("/{trip_id}")
def list_itinerary(trip_id: str, current_user=Depends(get_current_user)):
    items = itinerary_collection.find(
        {"trip_id": ObjectId(trip_id), "user_id": ObjectId(current_user["id"])}
    ).sort([("day", 1), ("time", 1)])
    return [serialize_item(i) for i in items]


@router.post("")
def add_item(payload: ItineraryCreate, current_user=Depends(get_current_user)):
    trip = trips_collection.find_one({"_id": ObjectId(payload.trip_id), "user_id": ObjectId(current_user["id"])})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    data = payload.model_dump()
    data["trip_id"] = ObjectId(payload.trip_id)
    data["user_id"] = ObjectId(current_user["id"])
    data["created_at"] = datetime.now(timezone.utc)
    result = itinerary_collection.insert_one(data)
    created = itinerary_collection.find_one({"_id": result.inserted_id})
    return serialize_item(created)


@router.put("/{item_id}")
def update_item(item_id: str, payload: ItineraryUpdate, current_user=Depends(get_current_user)):
    item = itinerary_collection.find_one({"_id": ObjectId(item_id), "user_id": ObjectId(current_user["id"])})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if update_data:
        itinerary_collection.update_one({"_id": ObjectId(item_id)}, {"$set": update_data})
    updated = itinerary_collection.find_one({"_id": ObjectId(item_id)})
    return serialize_item(updated)


@router.delete("/{item_id}")
def delete_item(item_id: str, current_user=Depends(get_current_user)):
    result = itinerary_collection.delete_one({"_id": ObjectId(item_id), "user_id": ObjectId(current_user["id"])})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"success": True}
