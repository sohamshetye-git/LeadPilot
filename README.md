# LeadPilot

> **Turn event conversations into actionable opportunities.**  
> An AI-powered event lead management platform built for B2B revenue and engineering teams.

---

## 📌 Overview

**LeadPilot** bridges the gap between busy conference encounters and timely pipeline conversion. Instead of letting booth interactions disappear into spreadsheets or generic CRM dumps, LeadPilot captures the nuances of every discussion, provides AI-driven qualification signals, suggests immediate next actions, drafts personalized follow-up correspondence, and surfaces event-level ROI metrics.

---

## 🏗️ Architecture

```mermaid
graph TD
    User([User / Event Rep]) -->|Browser UI| Frontend[Next.js App Router + TypeScript + Tailwind CSS]
    Frontend -->|REST APIs| Backend[FastAPI Modular Monolith]
    
    subgraph Backend Services
        Backend --> LeadsRouter[Leads API / Router]
        Backend --> EventsRouter[Events API / Router]
        Backend --> FollowUpsRouter[Follow-ups API / Router]
        Backend --> AnalyticsRouter[Analytics API / Router]
        Backend --> AIRouter[AI Intelligence Router]
    end

    AIRouter --> AIService[AI Service & Fallback Engine]
    AIService -->|Structured JSON Requests| GeminiAPI[Google Gemini API]
    
    subgraph Data Layer
        LeadsRouter --> Repositories[SQLAlchemy Repositories]
        EventsRouter --> Repositories
        FollowUpsRouter --> Repositories
        AnalyticsRouter --> Repositories
        Repositories --> Database[(PostgreSQL / SQLite via Alembic)]
    end
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Fetch API.
- **Backend**: Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, Uvicorn.
- **Database**: PostgreSQL (Production ready on Neon / Supabase / Render), SQLite (Zero-config local development).
- **AI Engine**: Google Gemini API (`gemini-2.5-flash`) with structured schema enforcement and rule-based heuristic fallbacks.
- **Testing**: Pytest with in-memory SQLite and mock AI coverage.

---

## ✨ Features

1. **Lead Management (CRUD)**:
   - Full Create, Read, Update, Delete with confirmation modals.
   - Rich fields: Name, Company, Email, Job Title, Phone, LinkedIn URL, Event, Notes, Priority, Lead Score (0–100), Follow-up status, Next follow-up date.
2. **Duplicate Detection**:
   - Warns users when entering matching email or identical Name + Company combinations before creating duplicates.
3. **Responsive Search & Filter Toolbar**:
   - Instant search across Name, Company, Email, and Event.
   - Multi-parameter filters: Event, Status, Priority, and Follow-up timeframe (Due Today, Overdue, Upcoming).
4. **AI Sales Intelligence**:
   - **Note Summarization**: Extracts key interests, pain points, buying signals, and recommended next steps.
   - **Lead Intake Extraction**: Pastes unstructured messy notes or voice transcripts and automatically auto-fills structured fields.
   - **AI Intent Scoring**: Calculates 0–100 score and assigns High/Medium/Low priority based on decision-maker seniority and urgency.
   - **Next Best Action**: Recommends the single highest-leverage next step and justification.
   - **AI 30-Sec Pre-Contact Brief**: Gives sales reps a quick executive brief before placing a call.
   - **Personalized Follow-Up Generator**: Generates customized post-event emails with configurable Tone (Professional, Friendly, Concise) and Purpose (Demo, Pricing, Info, Reconnect).
5. **Interaction Timeline**:
   - Full chronological audit log of meetings, captured notes, and updates for every lead.
6. **Conference & Event Analytics**:
   - Real-time aggregation of qualified leads (Score $\ge$ 70), high-priority leads, and completed outreach across all conferences.

---

## 🚀 Running Locally

### 1. Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment (optional but recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Set your Gemini API key in backend/.env:
# GEMINI_API_KEY=your_key_here

# Seed initial realistic B2B conference data
python -m app.db.seed

# Run automated tests
python -m pytest tests/test_api.py -v

# Start FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend API is available at `http://127.0.0.1:8000`  
API Docs (Swagger UI): `http://127.0.0.1:8000/docs`

### 3. Frontend Setup

In a new terminal:

```bash
cd frontend

# Install packages
npm install

# Build check
npm run build

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL=sqlite:///./event_leads.db
# For PostgreSQL:
# DATABASE_URL=postgresql://user:password@host:5432/event_leads

GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

---

## 🏛️ Key Technical Decisions

1. **Modular Monolith over Microservices**:
   - For an early-stage SaaS product, microservices add network latency, distributed transaction complexity, and deployment overhead without customer benefit. A modular monolith provides clean domain separation with shared memory speed and straightforward deployment.
2. **Dual Database Architecture (SQLite & PostgreSQL)**:
   - Configured via SQLAlchemy engine settings so that evaluators can clone and run the application instantly without configuring a local PostgreSQL daemon, while supporting cloud PostgreSQL (Neon/Supabase) via a single environment variable swap.
3. **Robust AI Fallback Engine**:
   - If the Gemini API key is omitted, rate-limited, or network-blocked, the app **never crashes**. The `AIService` falls back to deterministic heuristic parsing and high-signal template generation, preserving 100% of user productivity.
4. **Structured JSON Output & Pre-Save Human Review**:
   - AI outputs are requested strictly as JSON, cleansed of Markdown backticks, and presented in UI review forms *before* persistence. AI assists the user—it never silently writes untrusted data.

---

## ⚖️ Trade-offs & Deliberate Exclusions

- **No Third-Party Email Delivery Service**: We intentionally generate email subjects and bodies with copy-to-clipboard functionality rather than silently sending real emails, avoiding accidental spam and third-party SMTP lock-in during testing.
- **No Heavy Vector Database**: Lead counts in event scenarios range in the thousands per season. Relational search and indexed filters provide millisecond response times without the operational cost of vector embedding pipelines.
