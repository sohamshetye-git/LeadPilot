# LeadPilot

> **Turn event conversations into actionable opportunities.**  
> An AI-powered event lead management platform built for B2B revenue and engineering teams.

---

## 📌 Problem

At conferences and trade shows, revenue teams have dozens of high-value conversations. In practice, these interactions frequently devolve into scattered notes, forgotten business cards, or generic CRM dumps. Critical context—such as decision-maker timelines, specific pain points, and promised follow-ups—is lost, delaying outreach and hurting conversion rates.

---

## 💡 Solution

**LeadPilot** bridges the gap between fast-paced event encounters and timely pipeline conversion. It provides structured intake for event interactions, uses Google Gemini AI to analyze conversation context and highlight intent signals, scores leads with transparent reasoning, recommends immediate next best actions, and drafts personalized follow-up correspondence tailored by tone and objective.

---

## 🌐 Live Demo

- **Frontend**: [To be deployed on Vercel]
- **Backend API**: [To be deployed on Render]
- **API Documentation**: [Render URL]/docs
- **GitHub**: [https://github.com/sohamshetye-git/LeadPilot](https://github.com/sohamshetye-git/LeadPilot)

---

## 📸 Product Screenshots

Screenshots illustrating key workflows can be added to [`docs/screenshots/`](docs/screenshots/):

- `docs/screenshots/dashboard.png` — Executive pipeline overview with KPI cards and upcoming follow-ups.
- `docs/screenshots/leads.png` — Lead directory with instant search, multi-filter toolbar, and duplicate warning modal.
- `docs/screenshots/lead-intelligence.png` — Lead detail view featuring AI Summary, Intent Score breakdown, and Pre-Contact Brief.
- `docs/screenshots/follow-up.png` — Context-aware follow-up email composer with tone and purpose controls.
- `docs/screenshots/analytics.png` — Event performance metrics and conversion quality comparison.

---

## ✨ Key Features

- **Lead Lifecycle Management**: Full CRUD operations with detailed fields (name, company, email, job title, phone, LinkedIn, event, priority, lead score, notes, and follow-up timeline).
- **Proactive Duplicate Detection**: Evaluates incoming records for duplicate emails or matching Name + Company combinations prior to saving.
- **Search & Multi-Filter Toolbar**: Debounced search across leads with combinable filters for event, status, priority, and due timeframe (Today, Overdue, Upcoming).
- **Event Organization**: Multi-event tracking with location and date mapping.
- **Interaction Audit History**: Chronological log of conversations, updates, and touchpoints for each prospect.
- **AI Conversation Summarization**: Synthesizes notes into key interests, pain points, buying signals, and recommended next steps.
- **AI Lead Scoring & Prioritization**: 0–100 score calculation and High/Medium/Low priority mapping accompanied by decision-maker rationale.
- **Next Best Action Engine**: Recommends the single highest-leverage immediate step and timing to advance the opportunity.
- **30-Second Pre-Contact Brief**: Generates concise executive briefs to prep sales reps in under a minute before a call.
- **Personalized Follow-Up Generator**: Drafts context-aware emails with selectable tone (Professional, Friendly, Concise) and purpose (Demo, Pricing, Info, Reconnect).
- **Structured Lead Intake Extraction**: Extracts lead attributes from unstructured conversational notes or transcripts into editable fields for human review.
- **Event Performance Analytics**: Aggregates total captured leads, qualified opportunities (score ≥ 70), high-priority leads, and outreach completion across conferences.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, Uvicorn.
- **Database**: PostgreSQL (Production) / SQLite (Zero-config local development).
- **AI Engine**: Google Gemini API (`gemini-2.5-flash` via official `google-genai` SDK) with deterministic heuristic fallbacks.
- **Testing**: Pytest with in-memory SQLite and mock AI coverage.
- **Deployment Targets**: Vercel (Frontend), Render / Google Cloud Run (Backend), Neon / Supabase (PostgreSQL).

---

## 🏗️ Architecture

```text
Next.js (App Router + Tailwind CSS)
            │
            ▼ (REST / JSON)
FastAPI Modular Monolith
    ├── API Routers (/leads, /events, /follow-ups, /dashboard, /ai)
    ├── Services & Repositories
    │       ├── LeadRepository / EventRepository / FollowUpRepository
    │       └── AnalyticsService
    │               │
    │               ▼
    │         Database Layer (SQLAlchemy 2.0 -> PostgreSQL / SQLite)
    │
    └── AIService Layer (Isolated Provider Abstraction)
            │
            ▼ (Structured JSON Requests)
      Gemini Client (google-genai SDK)
            │
            ▼
      Validation & Fallback Engine
```

### AI Isolation & Safety Principle
All AI logic is strictly quarantined on the backend inside `AIService` and `GeminiClient`. The frontend has zero knowledge of API keys and never calls Gemini directly. Responses are requested in structured JSON format, validated against Pydantic schemas, and presented in the UI for **human review prior to saving**. If the AI provider is offline or unconfigured, the application falls back gracefully to deterministic rule-based heuristics without interrupting user workflows.

---

## 🗄️ Database Design

The data model uses 5 core relational entities managed via SQLAlchemy 2.0 and Alembic:

- **`Event`**: Represents a conference or trade show (`name`, `location`, `date`, `description`).
- **`Lead`**: The core prospect record linked to an `Event` (`name`, `company`, `email`, `job_title`, `phone`, `linkedin_url`, `notes`, `priority`, `lead_score`, `follow_up_status`, `next_follow_up_date`).
- **`Interaction`**: Chronological log items belonging to a `Lead` (`type`, `summary`, `details`, `created_at`).
- **`FollowUp`**: Actionable tasks tied to a `Lead` (`due_date`, `status`, `action_type`, `notes`, `generated_subject`, `generated_body`, `completed_at`).
- **`AIInsight`**: Audit history of AI evaluations for a `Lead` (`insight_type`, `content`, `created_at`).

---

## 🔌 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/leads` | List leads with debounced search, filtering, and pagination |
| `POST` | `/api/leads` | Create a new lead |
| `GET` | `/api/leads/{id}` | Retrieve lead details with interactions and follow-ups |
| `PATCH` | `/api/leads/{id}` | Update lead fields, score, priority, or status |
| `DELETE` | `/api/leads/{id}` | Remove a lead and cascade related records |
| `POST` | `/api/leads/check-duplicate` | Check for existing email or Name + Company matches |
| `GET` | `/api/events` | List all tracked events with lead counts |
| `POST` | `/api/events` | Create a new event |
| `GET` | `/api/follow-ups` | List upcoming, overdue, or completed follow-up items |
| `PATCH` | `/api/follow-ups/{id}` | Update follow-up task status or completion timestamp |
| `GET` | `/api/dashboard/stats` | Pipeline KPI metrics, attention leads, and event performance |
| `POST` | `/api/ai/summarize` | AI conversation notes synthesis |
| `POST` | `/api/ai/follow-up` | Generate personalized email draft with custom tone & purpose |
| `POST` | `/api/ai/score` | AI decision-maker intent scoring (0–100) and rationale |
| `POST` | `/api/ai/extract` | Extract structured lead fields from raw conversation notes |
| `POST` | `/api/ai/next-action` | Recommend highest-leverage next step |
| `POST` | `/api/ai/brief` | 30-second executive pre-contact preparation briefing |
| `GET` | `/health` | Service health check |

---

## 🤖 AI Integration & Reliability

- **Centralized Prompts**: All prompts are isolated in [`backend/app/services/ai/prompts.py`](backend/app/services/ai/prompts.py) with explicit boundary instructions instructing the model to rely strictly on provided text.
- **Structured JSON Validation**: Clean parsing of responses using `client.models.generate_content` with `response_mime_type="application/json"` and markdown code fence cleaning.
- **Decision Support, Not Ground Truth**: AI scoring is presented as an AI-assisted prioritization signal, not an absolute truth.
- **Zero Silent DB Mutation**: AI extraction populates editable form inputs so users verify contact details before writing to the database.
- **Offline & Rate-Limit Resilience**: Deterministic heuristic fallbacks provide standard templates and regex extractions if the Gemini API is unreachable.

---

## 🏛️ Key Technical Decisions

1. **FastAPI for High-Performance Typed API**: Pydantic v2 validation ensures strict request/response contracts and auto-generates interactive OpenAPI documentation.
2. **Relational Database Design over NoSQL**: Lead statuses, follow-up dates, and event associations have clear relational constraints; PostgreSQL provides transactional integrity and ACID compliance.
3. **Clean Repository & Service Separation**: Route handlers remain thin, delegating database operations to repositories and business logic to services.
4. **Backend-Only AI Gateway**: Protects credentials and centralizes prompt engineering, rate-limiting, and error handling away from the client browser.
5. **Next.js 16 App Router & Tailwind CSS**: Provides fast component rendering, strict TypeScript safety, and a responsive, restrained B2B user experience.
6. **Dual Database Support**: Seamlessly defaults to local SQLite for zero-config evaluation, with production PostgreSQL switching via `DATABASE_URL`.

---

## ⚖️ Trade-offs & Deliberate Exclusions

- **PostgreSQL instead of Document/NoSQL**: Chosen because event-lead-interaction relationships are structured and benefit from relational integrity.
- **Modular Monolith instead of Microservices**: Avoids unnecessary network overhead, distributed tracing complexity, and operational burdens for a focused B2B solution.
- **Direct Gemini API over Self-Hosted LLMs**: Maximizes response quality and context handling while keeping operational complexity and cloud hosting costs low.
- **No Heavy Vector Database**: In-memory relational queries and indexed filters deliver sub-10ms response times for thousands of leads without vector database upkeep.
- **Copy-to-Clipboard Email instead of Direct SMTP Sending**: Prevents accidental spam during testing and lets sales reps review emails in their native email clients.

---

## 🚀 Local Setup & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0+
- **Python**: 3.12+ (tested on Python 3.12.4)
- **Git**

### 2. Backend Setup
In a terminal:

```powershell
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\activate
# (macOS/Linux: source venv/bin/activate)

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example to .env and add your Gemini API key:
cp .env.example .env

# Run database migrations
alembic upgrade head

# Seed realistic demo data
python -m app.db.seed

# Run backend tests
python -m pytest

# Start FastAPI backend
python -m uvicorn app.main:app --port 8000 --reload
```

- API Base: `http://127.0.0.1:8000`
- Interactive API Docs: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
In a second terminal:

```powershell
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

## 🔑 Environment Variables

### Backend (`backend/.env`)
Documented in [`backend/.env.example`](backend/.env.example):

```env
# Database connection string (defaults to local SQLite; use postgresql://... for PostgreSQL)
DATABASE_URL=sqlite:///./event_leads.db

# Google Gemini API key from https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here

# Model identifier
GEMINI_MODEL=gemini-2.5-flash
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

---

## 🧪 Testing Results

Unit and integration tests verify health endpoints, lead CRUD, duplicate detection, search filtering, and AI fallback resilience:

```powershell
cd backend
python -m pytest
```

**Test Output:**
```text
tests\test_api.py ......                                                 [100%]
======================== 6 passed in 1.42s ========================
```

---

## ☁️ Deployment

### Frontend
**Vercel**

- **Root Directory**: `frontend`
- **Environment Variable**:
  ```env
  NEXT_PUBLIC_API_URL=https://<render-backend-url>
  ```

### Backend
**Render**

- **Root Directory**: `backend`
- **Build Command**:
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command**:
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```
- **Required Environment Variables**:
  - `DATABASE_URL`: Managed PostgreSQL connection string (from Neon)
  - `GEMINI_API_KEY`: Google AI Studio API key
  - `GEMINI_MODEL`: `gemini-2.5-flash`
  - `CORS_ORIGINS`: Your Vercel frontend URL (e.g., `https://leadpilot.vercel.app`)

### Database
**Neon PostgreSQL**

- **Migration**:
  ```bash
  alembic upgrade head
  ```

---

## 📄 License
MIT
