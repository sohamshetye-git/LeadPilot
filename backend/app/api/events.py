from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.entities import Event, Lead
from app.repositories.repositories import EventRepository
from app.schemas.schemas import EventCreate, EventResponse

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=List[EventResponse])
def get_events(db: Session = Depends(get_db)):
    events = EventRepository.list_events(db)
    result = []
    for ev in events:
        count = db.query(func.count(Lead.id)).filter(Lead.event_id == ev.id).scalar() or 0
        dto = EventResponse.model_validate(ev)
        dto.lead_count = count
        result.append(dto)
    return result


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(event_in: EventCreate, db: Session = Depends(get_db)):
    event = EventRepository.create_event(
        db,
        name=event_in.name,
        location=event_in.location,
        date=event_in.date,
        description=event_in.description
    )
    dto = EventResponse.model_validate(event)
    dto.lead_count = 0
    return dto


@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: str, db: Session = Depends(get_db)):
    event = EventRepository.get_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    count = db.query(func.count(Lead.id)).filter(Lead.event_id == event.id).scalar() or 0
    dto = EventResponse.model_validate(event)
    dto.lead_count = count
    return dto
