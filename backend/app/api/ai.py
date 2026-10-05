from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.ai.service import ai_service
from app.repositories.repositories import LeadRepository
from app.models.entities import AIInsight, Interaction
from app.schemas.schemas import (
    AISummarizeRequest,
    AISummaryResult,
    AIFollowUpRequest,
    AIFollowUpResult,
    AIExtractRequest,
    AIExtractResult,
    AIScoreRequest,
    AIScoreResult,
    AINextActionRequest,
    AINextActionResult,
    AIPreContactBriefRequest,
    AIPreContactBriefResult
)

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/summarize", response_model=AISummaryResult)
def summarize_notes(payload: AISummarizeRequest):
    if not payload.notes or not payload.notes.strip():
        raise HTTPException(status_code=400, detail="Interaction notes cannot be empty")
    return ai_service.summarize(
        notes=payload.notes,
        lead_name=payload.lead_name,
        company=payload.company
    )


@router.post("/follow-up", response_model=AIFollowUpResult)
def generate_followup(payload: AIFollowUpRequest):
    return ai_service.generate_followup(
        lead_name=payload.lead_name,
        company=payload.company,
        event_name=payload.event_name,
        notes=payload.notes,
        tone=payload.tone,
        purpose=payload.purpose
    )


@router.post("/extract", response_model=AIExtractResult)
def extract_lead_from_raw_text(payload: AIExtractRequest):
    if not payload.raw_text or not payload.raw_text.strip():
        raise HTTPException(status_code=400, detail="Raw text cannot be empty")
    return ai_service.extract_lead(raw_text=payload.raw_text)


@router.post("/score", response_model=AIScoreResult)
def score_lead(payload: AIScoreRequest):
    if not payload.notes or not payload.notes.strip():
        raise HTTPException(status_code=400, detail="Notes required to evaluate lead score")
    return ai_service.score_lead(
        notes=payload.notes,
        lead_name=payload.lead_name,
        company=payload.company,
        job_title=payload.job_title
    )


@router.post("/next-action", response_model=AINextActionResult)
def recommend_next_action(payload: AINextActionRequest):
    return ai_service.recommend_next_action(
        lead_name=payload.lead_name,
        company=payload.company,
        notes=payload.notes,
        job_title=payload.job_title
    )


@router.post("/brief", response_model=AIPreContactBriefResult)
def pre_contact_brief(payload: AIPreContactBriefRequest):
    return ai_service.pre_contact_brief(
        lead_name=payload.lead_name,
        company=payload.company,
        event_name=payload.event_name,
        notes=payload.notes
    )
