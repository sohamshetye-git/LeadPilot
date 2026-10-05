from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.entities import Lead, Event, FollowUp
from app.schemas.schemas import DashboardStats, LeadResponse, FollowUpResponse


class AnalyticsService:
    @staticmethod
    def get_dashboard_stats(db: Session) -> DashboardStats:
        total_leads = db.query(func.count(Lead.id)).scalar() or 0
        high_priority_count = db.query(func.count(Lead.id)).filter(Lead.priority == "High").scalar() or 0

        now = datetime.utcnow()
        today_start = datetime(now.year, now.month, now.day)
        today_end = datetime(now.year, now.month, now.day, 23, 59, 59)

        follow_ups_due_today = db.query(func.count(Lead.id)).filter(
            Lead.next_follow_up_date >= today_start,
            Lead.next_follow_up_date <= today_end
        ).scalar() or 0

        overdue_follow_ups = db.query(func.count(Lead.id)).filter(
            Lead.next_follow_up_date < today_start,
            Lead.follow_up_status.in_(["Pending", "Follow-up scheduled"])
        ).scalar() or 0

        completed_follow_ups = db.query(func.count(Lead.id)).filter(
            Lead.follow_up_status == "Completed"
        ).scalar() or 0

        avg_score_res = db.query(func.avg(Lead.lead_score)).scalar()
        avg_lead_score = round(float(avg_score_res), 1) if avg_score_res else 0.0

        # Status counts
        status_rows = db.query(Lead.follow_up_status, func.count(Lead.id)).group_by(Lead.follow_up_status).all()
        leads_by_status = {status: count for status, count in status_rows}

        # Priority counts
        priority_rows = db.query(Lead.priority, func.count(Lead.id)).group_by(Lead.priority).all()
        leads_by_priority = {p: count for p, count in priority_rows}

        # Needs your attention leads: top high-priority or upcoming due leads
        attention_leads_records = db.query(Lead).filter(
            Lead.follow_up_status.in_(["Pending", "Follow-up scheduled"])
        ).order_by(Lead.priority == "High", Lead.lead_score.desc(), Lead.next_follow_up_date.asc()).limit(5).all()

        # Upcoming followups
        upcoming_follow_ups_records = db.query(FollowUp).join(Lead).filter(
            FollowUp.status == "Pending"
        ).order_by(FollowUp.due_date.asc()).limit(5).all()

        # Enrich upcoming followups with lead name and company
        upcoming_dto = []
        for fu in upcoming_follow_ups_records:
            dto = FollowUpResponse.model_validate(fu)
            if fu.lead:
                dto.lead_name = fu.lead.name
                dto.lead_company = fu.lead.company
            upcoming_dto.append(dto)

        # Event performance
        events = db.query(Event).all()
        event_performance = []
        for ev in events:
            ev_leads = db.query(Lead).filter(Lead.event_id == ev.id).all()
            ev_lead_count = len(ev_leads)
            ev_high_priority = sum(1 for l in ev_leads if l.priority == "High")
            ev_qualified = sum(1 for l in ev_leads if l.lead_score >= 70)
            ev_completed = sum(1 for l in ev_leads if l.follow_up_status == "Completed")
            event_performance.append({
                "id": ev.id,
                "name": ev.name,
                "date": ev.date.isoformat() if ev.date else None,
                "location": ev.location,
                "leads_count": ev_lead_count,
                "high_priority_count": ev_high_priority,
                "qualified_count": ev_qualified,
                "completed_count": ev_completed
            })

        return DashboardStats(
            total_leads=total_leads,
            high_priority_count=high_priority_count,
            follow_ups_due_today=follow_ups_due_today,
            overdue_follow_ups=overdue_follow_ups,
            completed_follow_ups=completed_follow_ups,
            avg_lead_score=avg_lead_score,
            leads_by_status=leads_by_status,
            leads_by_priority=leads_by_priority,
            attention_leads=[LeadResponse.model_validate(l) for l in attention_leads_records],
            upcoming_follow_ups=upcoming_dto,
            event_performance=event_performance
        )
