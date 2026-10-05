from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.entities import FollowUp, Lead
from app.repositories.repositories import FollowUpRepository
from app.schemas.schemas import FollowUpResponse, FollowUpUpdate

router = APIRouter(prefix="/follow-ups", tags=["follow-ups"])


@router.get("", response_model=List[FollowUpResponse])
def get_follow_ups(status: Optional[str] = Query(None), db: Session = Depends(get_db)):
    records = FollowUpRepository.list_follow_ups(db, status=status)
    result = []
    for fu in records:
        dto = FollowUpResponse.model_validate(fu)
        if fu.lead:
            dto.lead_name = fu.lead.name
            dto.lead_company = fu.lead.company
        result.append(dto)
    return result


@router.patch("/{follow_up_id}", response_model=FollowUpResponse)
def update_follow_up(follow_up_id: str, item_in: FollowUpUpdate, db: Session = Depends(get_db)):
    fu = db.query(FollowUp).filter(FollowUp.id == follow_up_id).first()
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    
    updated = FollowUpRepository.update_follow_up(db, fu, item_in)
    
    # If completed, update lead follow_up_status
    if updated.status == "Completed" and updated.lead:
        updated.lead.follow_up_status = "Completed"
        db.commit()

    dto = FollowUpResponse.model_validate(updated)
    if updated.lead:
        dto.lead_name = updated.lead.name
        dto.lead_company = updated.lead.company
    return dto
