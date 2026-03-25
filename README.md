# Smart Travel Planner

Minimal, AI-powered travel planner to organize trips, itineraries, budgets, and documents in one workspace.

## Stack

- Frontend: React (Vite), Tailwind CSS, Framer Motion
- Backend: FastAPI
- Database: MongoDB

## Run Backend

1. Copy `backend/.env.example` to `backend/.env`
2. Start MongoDB locally
3. Install backend dependencies:
   - `cd backend`
   - `python -m venv .venv`
   - `.venv\Scripts\activate`
   - `pip install -r requirements.txt`
4. Start API:
   - `uvicorn app.main:app --reload`

## Run Frontend

1. Copy `frontend/.env.example` to `frontend/.env`
2. Install dependencies:
   - `cd frontend`
   - `npm install`
3. Start app:
   - `npm run dev`

## API Modules

- `POST /auth/signup`, `POST /auth/login`
- `GET/POST/PUT/DELETE /trips`
- `POST /trips/generate-itinerary`
- `GET/POST/PUT/DELETE /itinerary`
- `GET/POST/PUT/DELETE /expenses`
- `GET/POST/DELETE /documents` and `GET /documents/download/{doc_id}`
