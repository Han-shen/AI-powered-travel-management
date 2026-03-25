from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.database import expenses_collection, trips_collection
from app.deps import get_current_user
from app.models.schemas import ExpenseCreate, ExpenseUpdate

router = APIRouter(prefix="/expenses", tags=["expenses"])


def serialize_expense(expense: dict) -> dict:
    expense["id"] = str(expense.pop("_id"))
    expense["trip_id"] = str(expense["trip_id"])
    expense["user_id"] = str(expense["user_id"])
    return expense


@router.get("/{trip_id}")
def list_expenses(trip_id: str, current_user=Depends(get_current_user)):
    expenses = expenses_collection.find(
        {"trip_id": ObjectId(trip_id), "user_id": ObjectId(current_user["id"])}
    ).sort("date", -1)
    return [serialize_expense(e) for e in expenses]


@router.post("")
def add_expense(payload: ExpenseCreate, current_user=Depends(get_current_user)):
    trip = trips_collection.find_one({"_id": ObjectId(payload.trip_id), "user_id": ObjectId(current_user["id"])})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    data = payload.model_dump()
    # PyMongo can't encode `datetime.date` directly; store as ISO strings.
    if hasattr(data.get("date"), "isoformat"):
        data["date"] = data["date"].isoformat()
    data["trip_id"] = ObjectId(payload.trip_id)
    data["user_id"] = ObjectId(current_user["id"])
    data["created_at"] = datetime.now(timezone.utc)
    result = expenses_collection.insert_one(data)
    created = expenses_collection.find_one({"_id": result.inserted_id})
    return serialize_expense(created)


@router.put("/{expense_id}")
def update_expense(expense_id: str, payload: ExpenseUpdate, current_user=Depends(get_current_user)):
    expense = expenses_collection.find_one(
        {"_id": ObjectId(expense_id), "user_id": ObjectId(current_user["id"])}
    )
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if "date" in update_data and hasattr(update_data["date"], "isoformat"):
        update_data["date"] = update_data["date"].isoformat()
    if update_data:
        expenses_collection.update_one({"_id": ObjectId(expense_id)}, {"$set": update_data})
    updated = expenses_collection.find_one({"_id": ObjectId(expense_id)})
    return serialize_expense(updated)


@router.delete("/{expense_id}")
def delete_expense(expense_id: str, current_user=Depends(get_current_user)):
    result = expenses_collection.delete_one(
        {"_id": ObjectId(expense_id), "user_id": ObjectId(current_user["id"])}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"success": True}
