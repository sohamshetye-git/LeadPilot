from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, func
from datetime import datetime, date
from app.models.entities import Lead, Event, Interaction, FollowUp, AIInsight
from app.schemas.schemas import LeadCreate, LeadUpdate, FollowUpCreate, FollowUpUpdate, InteractionCreate


class LeadRepository:
    @staticmethod
    def get_by_id(db: Session, lead_id: str) -> Optional[Lead]:
        return db.query(Lead).filter(Lead.id == lead_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[Lead]:
        return db.query(Lead).filter(func.lower(Lead.email) == email.lower().strip()).first()

    @staticmethod
    def find_potential_duplicates(db: Session, email: str, name: Optional[str] = None, company: Optional[str] = None) -> List[Lead]:
        query = db.query(Lead)
        conditions = [func.lower(Lead.email) == email.lower().strip()]
        if name and company:
            conditions.append(
                and_(
                    func.lower(Lead.name) == name.lower().strip(),
                    func.lower(Lead.company) == company.lower().strip()
                )
            )
        return query.filter(or_(*conditions)).all()

    @staticmethod
    def list_leads(
        db: Session,
        search: Optional[str] = None,
        event_id: Optional[str] = None,
        follow_up_status: Optional[str] = None,
        priority: Optional[str] = None,
        min_score: Optional[int] = None,
        follow_up_due: Optional[str] = None,  # today, overdue, upcoming
        page: int = 1,
        page_size: int = 50
    ) -> tuple[List[Lead], int]:
        query = db.query(Lead)

        if search:
            search_term = f"%{search.strip().lower()}%"
            query = query.filter(
                or_(
                    func.lower(Lead.name).like(search_term),
                    func.lower(Lead.company).like(search_term),
                    func.lower(Lead.email).like(search_term),
                    func.lower(Lead.event_name).like(search_term)
                )
            )

        if event_id:
            query = query.filter(Lead.event_id == event_id)

        if follow_up_status:
            query = query.filter(Lead.follow_up_status == follow_up_status)

        if priority:
            query = query.filter(Lead.priority == priority)

        if min_score is not None:
            query = query.filter(Lead.lead_score >= min_score)

        now = datetime.utcnow()
        today_start = datetime(now.year, now.month, now.day)
        today_end = datetime(now.year, now.month, now.day, 23, 59, 59)

        if follow_up_due == "today":
            query = query.filter(
                Lead.next_follow_up_date >= today_start,
                Lead.next_follow_up_date <= today_end
            )
        elif follow_up_due == "overdue":
            query = query.filter(
                Lead.next_follow_up_date < today_start,
                Lead.follow_up_status.in_(["Pending", "Follow-up scheduled"])
            )
        elif follow_up_due == "upcoming":
            query = query.filter(Lead.next_follow_up_date > today_end)

        total = query.count()
        leads = query.order_by(desc(Lead.created_at)).offset((page - 1) * page_size).limit(page_size).all()
        return leads, total

    @staticmethod
    def create_lead(db: Session, lead_in: LeadCreate) -> Lead:
        event_name = lead_in.event_name
        if lead_in.event_id:
            event = db.query(Event).filter(Event.id == lead_in.event_id).first()
            if event:
                event_name = event.name

        lead_data = lead_in.model_dump()
        lead_data["event_name"] = event_name
        lead = Lead(**lead_data)
        db.add(lead)
        db.commit()
        db.refresh(lead)

        # Record initial creation interaction
        interaction = Interaction(
            lead_id=lead.id,
            type="Lead Captured",
            summary=f"Lead recorded from event: {event_name or 'General Event'}",
            details=lead.notes
        )
        db.add(interaction)
        db.commit()
        db.refresh(lead)
        return lead

    @staticmethod
    def update_lead(db: Session, lead: Lead, lead_in: LeadUpdate) -> Lead:
        update_data = lead_in.model_dump(exclude_unset=True)
        if "event_id" in update_data and update_data["event_id"]:
            event = db.query(Event).filter(Event.id == update_data["event_id"]).first()
            if event:
                update_data["event_name"] = event.name

        for key, value in update_data.items():
            setattr(lead, key, value)
        
        lead.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(lead)
        return lead

    @staticmethod
    def delete_lead(db: Session, lead: Lead) -> None:
        db.delete(lead)
        db.commit()


class EventRepository:
    @staticmethod
    def get_by_id(db: Session, event_id: str) -> Optional[Event]:
        return db.query(Event).filter(Event.id == event_id).first()

    @staticmethod
    def list_events(db: Session) -> List[Event]:
        return db.query(Event).order_by(desc(Event.date)).all()

    @staticmethod
    def create_event(db: Session, name: str, location: Optional[str] = None, date: Optional[datetime] = None, description: Optional[str] = None) -> Event:
        event = Event(name=name, location=location, date=date, description=description)
        db.add(event)
        db.commit()
        db.refresh(event)
        return event


class InteractionRepository:
    @staticmethod
    def create_interaction(db: Session, lead_id: str, type: str, summary: str, details: Optional[str] = None) -> Interaction:
        interaction = Interaction(lead_id=lead_id, type=type, summary=summary, details=details)
        db.add(interaction)
        db.commit()
        db.refresh(interaction)
        return interaction

    @staticmethod
    def list_by_lead(db: Session, lead_id: str) -> List[Interaction]:
        return db.query(Interaction).filter(Interaction.lead_id == lead_id).order_by(desc(Interaction.created_at)).all()


class FollowUpRepository:
    @staticmethod
    def create_follow_up(db: Session, lead_id: str, follow_up_in: FollowUpCreate) -> FollowUp:
        follow_up = FollowUp(lead_id=lead_id, **follow_up_in.model_dump())
        db.add(follow_up)
        db.commit()
        db.refresh(follow_up)
        return follow_up

    @staticmethod
    def update_follow_up(db: Session, follow_up: FollowUp, follow_up_in: FollowUpUpdate) -> FollowUp:
        update_data = follow_up_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(follow_up, key, value)
        
        if follow_up.status == "Completed" and not follow_up.completed_at:
            follow_up.completed_at = datetime.utcnow()
            
        follow_up.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(follow_up)
        return follow_up

    @staticmethod
    def list_follow_ups(db: Session, status: Optional[str] = None) -> List[FollowUp]:
        query = db.query(FollowUp)
        if status:
            query = query.filter(FollowUp.status == status)
        return query.order_by(FollowUp.due_date.asc()).all()
