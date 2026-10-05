from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.repositories import LeadRepository, InteractionRepository, FollowUpRepository
from app.schemas.schemas import (
    LeadCreate,
    LeadUpdate,
    LeadResponse,
    LeadListResponse,
    DuplicateCheckRequest,
    DuplicateCheckResponse,
    DuplicateMatch,
    InteractionCreate,
    InteractionResponse,
    FollowUpCreate,
    FollowUpResponse
)

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("", response_model=LeadListResponse)
def get_leads(
    search: Optional[str] = Query(None, description="Search across name, company, email, event"),
    event_id: Optional[str] = Query(None),
    follow_up_status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    min_score: Optional[int] = Query(None, ge=0, le=100),
    follow_up_due: Optional[str] = Query(None, regex="^(today|overdue|upcoming)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    leads, total = LeadRepository.list_leads(
        db,
        search=search,
        event_id=event_id,
        follow_up_status=follow_up_status,
        priority=priority,
        min_score=min_score,
        follow_up_due=follow_up_due,
        page=page,
        page_size=page_size
    )
    return LeadListResponse(
        items=[LeadResponse.model_validate(lead) for lead in leads],
        total=total,
        page=page,
        page_size=page_size
    )


@router.post("/check-duplicate", response_model=DuplicateCheckResponse)
def check_duplicate(payload: DuplicateCheckRequest, db: Session = Depends(get_db)):
    duplicates = LeadRepository.find_potential_duplicates(
        db,
        email=payload.email,
        name=payload.name,
        company=payload.company
    )
    matches = []
    for d in duplicates:
        reason = "Exact email match" if d.email.lower() == payload.email.lower() else "Matching name and company"
        matches.append(DuplicateMatch(
            id=d.id,
            name=d.name,
            company=d.company,
            email=d.email,
            match_reason=reason
        ))
    return DuplicateCheckResponse(
        is_duplicate=len(matches) > 0,
        matches=matches
    )


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(lead_in: LeadCreate, db: Session = Depends(get_db)):
    lead = LeadRepository.create_lead(db, lead_in)
    return LeadResponse.model_validate(lead)


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(lead_id: str, db: Session = Depends(get_db)):
    lead = LeadRepository.get_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return LeadResponse.model_validate(lead)


@router.patch("/{lead_id}", response_model=LeadResponse)
def update_lead(lead_id: str, lead_in: LeadUpdate, db: Session = Depends(get_db)):
    lead = LeadRepository.get_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    updated = LeadRepository.update_lead(db, lead, lead_in)
    return LeadResponse.model_validate(updated)


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(lead_id: str, db: Session = Depends(get_db)):
    lead = LeadRepository.get_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    LeadRepository.delete_lead(db, lead)
    return None


@router.post("/{lead_id}/interactions", response_model=InteractionResponse, status_code=status.HTTP_201_CREATED)
def add_interaction(lead_id: str, item_in: InteractionCreate, db: Session = Depends(get_db)):
    lead = LeadRepository.get_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    interaction = InteractionRepository.create_interaction(
        db,
        lead_id=lead_id,
        type=item_in.type,
        summary=item_in.summary,
        details=item_in.details
    )
    return InteractionResponse.model_validate(interaction)


@router.post("/{lead_id}/follow-ups", response_model=FollowUpResponse, status_code=status.HTTP_201_CREATED)
def schedule_follow_up(lead_id: str, item_in: FollowUpCreate, db: Session = Depends(get_db)):
    lead = LeadRepository.get_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    fu = FollowUpRepository.create_follow_up(db, lead_id, item_in)
    # Also update lead next_follow_up_date and status
    if item_in.due_date:
        lead.next_follow_up_date = item_in.due_date
        lead.follow_up_status = "Follow-up scheduled"
        db.commit()
    return FollowUpResponse.model_validate(fu)
