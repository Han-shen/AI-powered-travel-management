from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError

from .config import DATABASE_NAME, MONGODB_URL

print(f"[Smart Travel Planner] MongoDB URL: {MONGODB_URL}")

client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=8000)
try:
    client.admin.command("ping")
    print(f"[Smart Travel Planner] MongoDB connected, database={DATABASE_NAME}")
except ServerSelectionTimeoutError as e:
    print(f"[Smart Travel Planner] MongoDB connection warning: {e}")

db = client[DATABASE_NAME]

users_collection = db["users"]
trips_collection = db["trips"]
itinerary_collection = db["itinerary_items"]
expenses_collection = db["expenses"]
documents_collection = db["documents"]

# Materialize database + users collection in Compass before first signup (unique email index).
try:
    users_collection.create_index("email", unique=True)
    print("[Smart Travel Planner] users.email unique index ensured (database visible after refresh)")
except Exception as e:
    print(f"[Smart Travel Planner] users index warning: {e}")
