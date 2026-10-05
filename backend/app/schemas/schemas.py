from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


# --- Event Schemas ---
class EventBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    location: Optional[str] = None
    date: Optional[datetime] = None
    description: Optional[str] = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    location: Optional[str] = None
    date: Optional[datetime] = None
    description: Optional[str] = None


class EventResponse(EventBase):
    id: str
    created_at: datetime
    updated_at: datetime
    lead_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


# --- Interaction Schemas ---
class InteractionBase(BaseModel):
    type: str = Field(..., max_length=50)
    summary: str
    details: Optional[str] = None


class InteractionCreate(InteractionBase):
    pass


class InteractionResponse(InteractionBase):
    id: str
    lead_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- FollowUp Schemas ---
class FollowUpBase(BaseModel):
    due_date: Optional[datetime] = None
    status: str = "Pending"
    action_type: str = "Email"
    notes: Optional[str] = None
    generated_subject: Optional[str] = None
    generated_body: Optional[str] = None


class FollowUpCreate(FollowUpBase):
    pass


class FollowUpUpdate(BaseModel):
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    action_type: Optional[str] = None
    notes: Optional[str] = None
    generated_subject: Optional[str] = None
    generated_body: Optional[str] = None
    completed_at: Optional[datetime] = None


class FollowUpResponse(FollowUpBase):
    id: str
    lead_id: str
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    lead_name: Optional[str] = None
    lead_company: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# --- AI Insight Schemas ---
class AIInsightResponse(BaseModel):
    id: str
    lead_id: str
    insight_type: str
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Lead Schemas ---
class LeadBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    company: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    job_title: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    lead_source: str = "Event Booth"
    event_id: Optional[str] = None
    event_name: Optional[str] = None
    notes: Optional[str] = None
    priority: str = "Medium"
    lead_score: int = Field(50, ge=0, le=100)
    follow_up_status: str = "Pending"
    next_follow_up_date: Optional[datetime] = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    company: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    job_title: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    lead_source: Optional[str] = None
    event_id: Optional[str] = None
    event_name: Optional[str] = None
    notes: Optional[str] = None
    priority: Optional[str] = None
    lead_score: Optional[int] = Field(None, ge=0, le=100)
    follow_up_status: Optional[str] = None
    next_follow_up_date: Optional[datetime] = None


class LeadResponse(LeadBase):
    id: str
    created_at: datetime
    updated_at: datetime
    interactions: List[InteractionResponse] = []
    follow_ups: List[FollowUpResponse] = []
    ai_insights: List[AIInsightResponse] = []

    model_config = ConfigDict(from_attributes=True)


class LeadListResponse(BaseModel):
    items: List[LeadResponse]
    total: int
    page: int
    page_size: int


# --- Duplicate Check Schemas ---
class DuplicateCheckRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    company: Optional[str] = None


class DuplicateMatch(BaseModel):
    id: str
    name: str
    company: str
    email: str
    match_reason: str


class DuplicateCheckResponse(BaseModel):
    is_duplicate: bool
    matches: List[DuplicateMatch]


# --- AI Service Schemas ---
class AISummarizeRequest(BaseModel):
    notes: str
    lead_name: Optional[str] = None
    company: Optional[str] = None


class AISummaryResult(BaseModel):
    summary: str
    key_interests: List[str]
    pain_points: List[str]
    buying_signals: List[str]
    suggested_next_step: str


class AIFollowUpRequest(BaseModel):
    lead_name: str
    company: str
    event_name: Optional[str] = None
    notes: Optional[str] = None
    tone: str = "Professional"  # Professional, Friendly, Concise
    purpose: str = "Schedule demo" # General follow-up, Schedule demo, Send information, Reconnect, Pricing discussion


class AIFollowUpResult(BaseModel):
    subject: str
    body: str


class AIExtractRequest(BaseModel):
    raw_text: str


class AIExtractResult(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None
    event: Optional[str] = None
    interest: Optional[str] = None
    potential_follow_up_timing: Optional[str] = None
    confidence_notes: Optional[str] = None


class AIScoreRequest(BaseModel):
    notes: str
    lead_name: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None


class AIScoreResult(BaseModel):
    score: int = Field(..., ge=0, le=100)
    priority: str  # High, Medium, Low
    reasoning: List[str]
    buying_signals: List[str]


class AINextActionRequest(BaseModel):
    lead_name: str
    company: str
    notes: Optional[str] = None
    job_title: Optional[str] = None


class AINextActionResult(BaseModel):
    recommended_action: str
    reason: str
    suggested_timing: str


class AIPreContactBriefRequest(BaseModel):
    lead_id: Optional[str] = None
    lead_name: str
    company: str
    notes: Optional[str] = None
    event_name: Optional[str] = None


class AIPreContactBriefResult(BaseModel):
    who_is_this: str
    what_they_care_about: str
    core_problem: str
    key_discussion_points: List[str]
    what_to_mention: List[str]
    next_step: str


# --- Analytics Schemas ---
class DashboardStats(BaseModel):
    total_leads: int
    high_priority_count: int
    follow_ups_due_today: int
    overdue_follow_ups: int
    completed_follow_ups: int
    avg_lead_score: float
    leads_by_status: dict
    leads_by_priority: dict
    attention_leads: List[LeadResponse]
    upcoming_follow_ups: List[FollowUpResponse]
    event_performance: List[dict]
