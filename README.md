# Lees

Lees is an open source cider and mead batch tracker built for homebrewers.

It helps you manage fermentation batches, track gravity and temperature logs, and monitor dashboard metrics from a single web app.

## Tech Stack

- Frontend: React 19, Vite, React Router, Tailwind CSS 4
- Backend: FastAPI, SQLAlchemy, Pydantic
- Database: SQLite

## Repository Layout

```text
Lees/
  backend/     # FastAPI API + SQLAlchemy models + SQLite database file
  frontend/    # React/Vite single-page app
  DESIGN.md    # Product/design system notes
```

## Features

- Create, view, update, and delete fermentation batches
- Record batch logs (specific gravity, temperature, notes, ratings, honey additions)
- Filter batches by status
- Dashboard metrics endpoint for active gallons and average fermentation temperature
- CORS-enabled local dev setup between frontend and backend

## Quick Start (Local Development)

### Prerequisites

- Python 3.11+
- Node.js 20+
- npm 10+

### 1) Run the backend

From the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install fastapi uvicorn sqlalchemy pydantic
uvicorn main:app --reload
```

Backend is available at:

- API root: http://127.0.0.1:8000
- Interactive docs (Swagger UI): http://127.0.0.1:8000/docs

### 2) Run the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend is available at:

- App: http://localhost:5173

## API Overview

Base URL: `http://127.0.0.1:8000`

- `GET /api/dashboard/metrics` - dashboard summary metrics
- `POST /api/batches` - create a new batch
- `GET /api/batches` - list all batches (optional `?status=ACTIVE` filter)
- `GET /api/batches/{batch_id}` - get one batch
- `PATCH /api/batches/{batch_id}` - partially update a batch
- `DELETE /api/batches/{batch_id}` - delete a batch
- `POST /api/batches/{batch_id}/logs` - add a log entry to a batch

## Data Notes

- SQLite DB file is stored at `backend/lees_tracker.db`.
- Tables are created automatically when the backend starts.
- Local CORS is preconfigured for `http://localhost:5173` and `http://127.0.0.1:5173`.

## Contributing

1. Fork the repository.a
2. Create a feature branch.
3. Make changes with tests or manual verification notes.
4. Open a pull request with a clear summary and screenshots for UI changes.

## License

No project license file is currently included.

If you intend Lees to be publicly reusable as open source, add a `LICENSE` file (for example MIT, Apache-2.0, or GPL-3.0).
