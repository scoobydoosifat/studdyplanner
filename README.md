# MahinPorteBosh

A calm, personal study planner made for Mahin. It uses a React/Vite frontend, a simple layered Spring Boot API, and MongoDB Atlas for persistence.

## What it includes

- Animated landing page with dedicated Planner, Progress, and Inspiration views
- November and December 2026 calendar with task counts and completion states
- Create, read, edit, complete/uncomplete, and delete study tasks
- English, Bangla, and General Knowledge study cards with date, time, duration, priority, and optional notes
- Weekly and monthly progress summaries, focus time, completion rate, and streaks
- Warm light/dark themes, animated cards, responsive navigation, and a playful interactive study cat
- Rotating motivational quotes and animated inspiration content
- A branded full-screen loader for every CRUD action
- Confirmation before permanent deletion
- Backend service unit tests and frontend interaction tests
- Render Docker/Blueprint configuration and Vercel SPA configuration

## Structure

```text
React dashboard (frontend/)
        ↓ JSON API
StudyTaskController
        ↓
StudyTaskService
        ↓
StudyTaskRepository
        ↓
MongoDB Atlas (study_tasks collection)
```

This follows the useful controller → service → repository → MongoDB structure of the neighboring Train Ticket Booking System, without its authentication and server-rendered templates.

## Run locally

Requirements: Java 21+, Maven 3.9+, Node 18+, and either MongoDB locally or an Atlas connection string.

Backend:

```bash
mvn spring-boot:run
```

Frontend (in a second terminal):

```bash
cd frontend
npm install
npm run dev
```

The frontend opens at <http://localhost:5173> and the API runs at <http://localhost:9091>. Opening <http://localhost:9091> redirects to the frontend when Vite is running.

## Test and build

```bash
mvn test
mvn clean package

cd frontend
npm test
npm run build
```

## Deploy

### Backend on Render

1. Create a new Blueprint from this repository; Render will read `render.yaml` and `Dockerfile`.
2. Add `MONGODB_URI` as a secret using your full Atlas URI.
3. Set `ALLOWED_ORIGINS` to the final Vercel URL (multiple origins can be comma-separated).
4. In MongoDB Atlas Network Access, allow Render to connect. For a simple demo this is often `0.0.0.0/0`; use tighter restrictions when available.
5. Confirm `https://YOUR-RENDER-SERVICE.onrender.com/api/health` returns `status: up`.

### Frontend on Vercel

1. Import this repository and set the Root Directory to `frontend`.
2. Vercel will detect Vite; use build command `npm run build` and output directory `dist`.
3. Add `VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com`.
4. Redeploy after changing any `VITE_*` variable because Vite embeds it at build time.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/tasks?start=YYYY-MM-DD&end=YYYY-MM-DD` | Read tasks in a date range |
| `GET` | `/api/tasks/{id}` | Read one task |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/{id}` | Edit a task |
| `PATCH` | `/api/tasks/{id}/completion` | Complete or uncomplete a task |
| `DELETE` | `/api/tasks/{id}` | Delete a task |
| `GET` | `/api/tasks/summary?start=...&end=...` | Weekly/monthly summary |
| `GET` | `/api/health` | Render health check |

## Security note

The checked-in fallback connects to a local MongoDB instance and contains no credentials. For MongoDB Atlas or Render, put the complete connection string in the ignored local `.env` file or the hosting provider's `MONGODB_URI` secret. Never commit production credentials.
