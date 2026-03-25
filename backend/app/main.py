from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.trips import router as trips_router
from app.routes.itinerary import router as itinerary_router
from app.routes.expenses import router as expenses_router
from app.routes.documents import router as documents_router

app = FastAPI(title="Smart Travel Planner API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(trips_router)
app.include_router(itinerary_router)
app.include_router(expenses_router)
app.include_router(documents_router)


@app.get("/")
def health():
    return {"status": "ok", "service": "Smart Travel Planner API"}
