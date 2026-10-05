import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.db.session import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Event(Base):
    __tablename__ = "events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    location = Column(String(255), nullable=True)
    date = Column(DateTime, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    leads = relationship("Lead", back_populates="event", cascade="all, delete-orphan")


class Lead(Base):
    __tablename__ = "leads"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    job_title = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    lead_source = Column(String(100), default="Event Booth", nullable=False)
    
    event_id = Column(String(36), ForeignKey("events.id", ondelete="SET NULL"), nullable=True, index=True)
    event_name = Column(String(255), nullable=True)  # Snapshot/fallback if unlinked
    
    notes = Column(Text, nullable=True)
    
    # Priority & Status
    priority = Column(String(50), default="Medium", nullable=False)  # High, Medium, Low
    lead_score = Column(Integer, default=50, nullable=False)          # 0-100
    follow_up_status = Column(String(50), default="Pending", nullable=False)  # Pending, Contacted, Follow-up scheduled, Completed, Not interested
    next_follow_up_date = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    event = relationship("Event", back_populates="leads")
    interactions = relationship("Interaction", back_populates="lead", cascade="all, delete-orphan", order_by="desc(Interaction.created_at)")
    follow_ups = relationship("FollowUp", back_populates="lead", cascade="all, delete-orphan", order_by="desc(FollowUp.created_at)")
    ai_insights = relationship("AIInsight", back_populates="lead", cascade="all, delete-orphan", order_by="desc(AIInsight.created_at)")

    __table_args__ = (
        Index("idx_lead_company_name", "company", "name"),
        Index("idx_lead_status_priority", "follow_up_status", "priority"),
    )


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lead_id = Column(String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # Note, Meeting, Call, Email, AI Generated
    summary = Column(Text, nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    lead = relationship("Lead", back_populates="interactions")


class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lead_id = Column(String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    due_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="Pending", nullable=False)  # Pending, Completed, Cancelled
    action_type = Column(String(100), default="Email", nullable=False) # Email, Demo, Call, LinkedIn
    notes = Column(Text, nullable=True)
    generated_subject = Column(String(255), nullable=True)
    generated_body = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    lead = relationship("Lead", back_populates="follow_ups")


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lead_id = Column(String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    insight_type = Column(String(50), nullable=False)  # summary, score, next_action, brief
    content = Column(Text, nullable=False)             # Structured JSON or text representation
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    lead = relationship("Lead", back_populates="ai_insights")
