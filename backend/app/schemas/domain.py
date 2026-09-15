from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, ConfigDict


# ==============================================================================
# Invoices / Receivables / Dunning Schemas
# ==============================================================================
class InvoiceBase(BaseModel):
    invoice_number: str
    customer_name: str
    customer_email: EmailStr
    amount: float
    currency: str = "USD"
    status: str = "overdue"
    issue_date: datetime
    due_date: datetime
    days_overdue: int = 0
    dunning_stage: int = 0
    payment_terms: str = "Net 30"
    notes: Optional[str] = None


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceRead(InvoiceBase):
    id: str
    tenant_id: Optional[str] = None
    last_reminder_sent_at: Optional[datetime] = None
    recovered_amount: float = 0.0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DunningEvaluationRequest(BaseModel):
    invoice_id: Optional[str] = None
    invoice_number: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    amount: Optional[float] = None
    days_overdue: Optional[int] = None
    previous_reminders_count: Optional[int] = 0
    customer_risk_tier: Optional[str] = "standard"


class DunningEvaluationResponse(BaseModel):
    decision: str
    confidence: float
    severity_level: str
    recommended_action: str
    drafted_message: str
    discount_offered_percent: float = 0.0
    reasoning: str
    verification_passed: bool
    requires_human_approval: bool


# ==============================================================================
# Recruitment Schemas
# ==============================================================================
class CandidateBase(BaseModel):
    candidate_name: str
    candidate_email: EmailStr
    job_title: str
    years_experience: float
    skills: List[str] = []
    resume_text: str


class CandidateCreate(CandidateBase):
    pass


class CandidateRead(CandidateBase):
    id: str
    tenant_id: Optional[str] = None
    overall_score: float
    skills_match_score: float
    risk_level: str
    recommendation: str
    ai_analysis_summary: Optional[str] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeScreeningRequest(BaseModel):
    candidate_name: str
    candidate_email: EmailStr
    job_title: str
    required_skills: List[str] = ["Python", "FastAPI", "React", "PostgreSQL"]
    preferred_skills: List[str] = ["Docker", "Redis", "Next.js", "AI/LLM"]
    min_years_experience: float = 3.0
    resume_text: str


class ResumeScreeningResponse(BaseModel):
    candidate_score: float
    skills_match: float
    skills_found: List[str]
    missing_critical_skills: List[str]
    experience_assessment: str
    risk: str
    recommendation: str
    interview_questions: List[str]
    reasoning: str
    confidence: float
    verification_passed: bool


# ==============================================================================
# Support / SLA Sentinel Schemas
# ==============================================================================
class SupportTicketBase(BaseModel):
    ticket_number: str
    customer_name: str
    customer_email: EmailStr
    subject: str
    body: str
    category: str = "general"
    priority: str = "medium"
    sla_deadline: datetime


class SupportTicketCreate(SupportTicketBase):
    pass


class SupportTicketRead(SupportTicketBase):
    id: str
    tenant_id: Optional[str] = None
    sentiment: str
    status: str
    is_sla_breached: bool
    ai_suggested_reply: Optional[str] = None
    ai_confidence: float = 0.0
    assigned_agent: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SupportTriageRequest(BaseModel):
    ticket_id: Optional[str] = None
    ticket_number: Optional[str] = None
    customer_name: str
    customer_email: EmailStr
    subject: str
    body: str
    account_tier: Optional[str] = "enterprise"


class SupportTriageResponse(BaseModel):
    category: str
    priority: str
    sentiment: str
    urgency_score: float
    confidence: float
    suggested_reply: str
    requires_jira_ticket: bool
    escalation_reason: Optional[str] = None
    verification_passed: bool
