from fastapi import APIRouter, HTTPException, status

from app.database import users_collection
from app.models.schemas import SignupRequest, LoginRequest, AuthResponse
from app.utils.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


def serialize_user(doc: dict) -> dict:
    uid = doc.get("_id")
    return {"id": str(uid), "name": doc.get("name", ""), "email": doc.get("email", "")}


@router.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest):
    if users_collection.find_one({"email": payload.email}):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    doc = {
        "name": payload.name,
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
    }
    result = users_collection.insert_one(doc)
    print(f"[Smart Travel Planner] User inserted: id={result.inserted_id} email={payload.email}")

    created = users_collection.find_one({"_id": result.inserted_id})
    token = create_access_token(str(result.inserted_id))
    return AuthResponse(access_token=token, user=serialize_user(created))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    user = users_collection.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(str(user["_id"]))
    return AuthResponse(access_token=token, user=serialize_user(user))
