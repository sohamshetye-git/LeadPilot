# LeadPilot

Turn event conversations into actionable B2B opportunities.

LeadPilot is an AI-assisted event lead management platform built for revenue and engineering teams. It bridges the gap between fast-paced conference interactions and timely pipeline conversion by capturing discussion notes, synthesizing intent signals, suggesting next best actions, and generating personalized follow-up correspondence.

## Live Demo

- **Frontend**: https://leadpilot-agentai.vercel.app
- **Backend API**: https://leadpilot-fima.onrender.com
- **Swagger Docs**: https://leadpilot-fima.onrender.com/docs
- **GitHub**: https://github.com/sohamshetye-git/LeadPilot

---

## Problem

At conferences and trade shows, revenue teams have dozens of high-value discussions. In practice, these interactions frequently become scattered notes, forgotten business cards, or generic CRM dumps. Critical context—such as decision-maker timelines, specific pain points, and promised follow-ups—is lost, delaying outreach and lowering conversion rates.

## Solution

LeadPilot captures event conversations into structured lead records and provides AI-driven intelligence:
- **Intake & Qualification**: Captures structured lead information and detects duplicate prospects.
- **Context Synthesis**: Summarizes conversational notes into key interests, pain points, and buying signals.
- **Prioritization**: Generates AI-assisted lead scoring with decision-maker rationale.
- **Actionable Execution**: Recommends highest-leverage next actions and drafts personalized follow-up emails.

---

## Key Features

- **Lead Lifecycle Management**: Full CRUD operations with detailed fields (name, company, email, job title, phone, LinkedIn, event, priority, score, notes, and follow-up timeline).
- **Proactive Duplicate Detection**: Checks for existing emails or matching Name + Company combinations prior to saving.
- **Search & Multi-Filter Toolbar**: Debounced search across leads with filters for event, status, priority, and due timeframe (Today, Overdue, Upcoming).
- **Interaction History**: Chronological audit log of conversations, notes, and updates for each prospect.
- **Follow-up Tracking**: Scheduled outreach tasks with status management (Pending, Contacted, Scheduled, Completed).
- **AI Note Summarization**: Synthesizes notes into key interests, pain points, buying signals, and recommended next steps.
- **AI Lead Scoring**: Transparent 0–100 score and High/Medium/Low priority based on authority, urgency, and budget signals.
- **Next Best Action**: Recommends the single highest-leverage immediate step and timing window.
- **Pre-Contact Brief**: 30-second executive talking points to prepare sales reps before follow-up calls.
- **Follow-up Email Generation**: Context-aware email drafts with tone (Professional, Friendly, Concise) and purpose (Demo, Pricing, Info, Reconnect) controls.
- **Structured Lead Intake Extraction**: Extracts lead fields from raw conversation notes into editable inputs for human review.
- **Event Performance Analytics**: Tracks total leads, qualified prospects, high-priority accounts, and outreach completion per event.

---

## AI Integration

LeadPilot uses Google Gemini (`gemini-2.5-flash`) via the official `google-genai` SDK:
- **Backend-Only AI Gateway**: Direct calls to Gemini exist strictly in `AIService` and `GeminiClient`. API keys never reach the client browser.
- **Structured JSON Validation**: Responses enforce JSON schemas (`response_mime_type="application/json"`), stripped of markdown fences, and validated with Pydantic.
- **Human-in-the-Loop Review**: AI extractions populate editable form fields—no untrusted AI output is written directly to the database without user confirmation.
- **Decision-Support Framing**: Lead scores and recommendations serve as prioritized signals rather than objective truth.
- **Deterministic Heuristic Fallbacks**: If the Gemini API is unconfigured or rate-limited, the application falls back to rule-based heuristics and templates so user workflows remain uninterrupted.

---

## Architecture

```text
Next.js (App Router + Tailwind CSS)
            |
        REST / JSON
            |
FastAPI (Modular Monolith)
    |-- API Routers (/leads, /events, /follow-ups, /dashboard, /ai)
    |-- Repositories & Services (LeadRepository, AnalyticsService)
    |       |
    |       +--> PostgreSQL (Neon) / SQLite (Local) via SQLAlchemy 2.0
    |
    +-- AIService Layer (Provider Abstraction)
            |
            +--> Google Gemini 2.5 Flash
```

---

## Database Design

Managed with SQLAlchemy 2.0 and Alembic migrations:
- **`Event`**: Conference details (`name`, `location`, `date`, `description`).
- **`Lead`**: Core prospect record linked to an `Event` (`name`, `company`, `email`, `job_title`, `phone`, `linkedin_url`, `notes`, `priority`, `lead_score`, `follow_up_status`, `next_follow_up_date`).
- **`Interaction`**: Chronological log items belonging to a `Lead` (`type`, `summary`, `details`, `created_at`).
- **`FollowUp`**: Actionable tasks tied to a `Lead` (`due_date`, `status`, `action_type`, `notes`, `generated_subject`, `generated_body`, `completed_at`).
- **`AIInsight`**: History of AI evaluations for a `Lead` (`insight_type`, `content`, `created_at`).

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI, Python 3.12, Pydantic v2, SQLAlchemy 2.0, Alembic, Uvicorn.
- **Database**: Neon PostgreSQL (Production) / SQLite (Local zero-config development).
- **AI**: Google Gemini 2.5 Flash (`google-genai` SDK).
- **Testing**: Pytest with in-memory SQLite and mock AI coverage.
- **Deployment**: Vercel (Frontend) + Render (Backend) + Neon (PostgreSQL).

---

## Key Technical Decisions

1. **FastAPI + Pydantic v2**: Provides strict typed request/response contracts, validation, and auto-generated OpenAPI documentation.
2. **PostgreSQL Relational Schema**: Enforces relational data integrity across events, leads, and follow-up tasks.
3. **Repository & Service Layer Separation**: Keeps API route handlers thin, isolating business logic and database queries for testability.
4. **Backend-Only AI Gateway**: Protects credentials and centralizes prompt engineering, schema validation, and fallback logic.
5. **Modular Monolith**: Avoids distributed tracing overhead and microservice network complexity while keeping deployment simple.

---

## Trade-offs

- **PostgreSQL over NoSQL**: Relational constraints and foreign keys ensure consistent lead and event associations, which outweighs document schema flexibility.
- **Modular Monolith over Microservices**: Single deployable service minimizes operational overhead and network latency.
- **Gemini API over Self-Hosted LLMs**: Reduces cloud hosting costs and infrastructure complexity while providing strong reasoning quality.
- **Copy-to-Clipboard Email over Automated SMTP**: Prevents accidental spam during testing and lets representatives review emails in their native clients.

---

## Local Setup

### 1. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows PowerShell:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run database migrations
alembic upgrade head

# Seed realistic demo data
python -m app.db.seed

# Run tests
python -m pytest

# Start FastAPI backend
python -m uvicorn app.main:app --port 8000 --reload
```

- API Base: `http://127.0.0.1:8000`
- Swagger Docs: `http://127.0.0.1:8000/docs`

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Build check
npm run build

# Start Next.js development server
npm run dev
```

- Web Application: `http://localhost:3000`

---

## Environment Variables

### Backend (`backend/.env`)
Documented in `backend/.env.example`:
```env
DATABASE_URL=sqlite:///./event_leads.db
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
CORS_ORIGINS=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
`NEXT_PUBLIC_API_URL` is browser-facing and contains no secret:
```env
# Local:
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api

# Production:
NEXT_PUBLIC_API_URL=https://leadpilot-fima.onrender.com/api
```

---

## Testing

```bash
cd backend
python -m pytest
```

Verified test suite:
- **6 passed**
- Coverage includes: `/health` endpoint, lead CRUD, duplicate detection, search/filtering, and deterministic AI fallback logic. External AI calls are mocked for fast and reliable execution.

---

## Deployment

### Frontend (Vercel)
- **Root Directory**: `frontend`
- **Environment Variable**: `NEXT_PUBLIC_API_URL=https://leadpilot-fima.onrender.com/api`

### Backend (Render)
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**: `DATABASE_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `CORS_ORIGINS`

### Database (Neon)
- **Type**: Managed PostgreSQL
- **Migration**: `alembic upgrade head`
