import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, Float, JSON
from app.core.database import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=True)
    invoice_number = Column(String(100), nullable=False, unique=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    status = Column(String(50), default="overdue")  # draft, posted, paid, overdue, escalated
    issue_date = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=False)
    days_overdue = Column(Integer, default=0)
    dunning_stage = Column(Integer, default=0)  # 0: None, 1: Gentle Reminder, 2: Firm Notice, 3: Final Demand, 4: Legal
    last_reminder_sent_at = Column(DateTime, nullable=True)
    recovered_amount = Column(Float, default=0.0)
    payment_terms = Column(String(100), default="Net 30")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=True)
    ticket_number = Column(String(100), nullable=False, unique=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    category = Column(String(100), default="general")  # billing, technical, outage, refund, general
    sentiment = Column(String(50), default="neutral")  # positive, neutral, negative, furious
    priority = Column(String(50), default="medium")  # low, medium, high, critical
    status = Column(String(50), default="open")  # open, ai_drafted, in_review, resolved, escalated
    sla_deadline = Column(DateTime, nullable=False)
    is_sla_breached = Column(Boolean, default=False)
    ai_suggested_reply = Column(Text, nullable=True)
    ai_confidence = Column(Float, default=0.0)
    assigned_agent = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class CandidateApplication(Base):
    __tablename__ = "candidate_applications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=True)
    candidate_name = Column(String(255), nullable=False)
    candidate_email = Column(String(255), nullable=False)
    job_title = Column(String(255), nullable=False)
    years_experience = Column(Float, default=0.0)
    skills = Column(JSON, default=list)  # list of strings
    resume_text = Column(Text, nullable=False)
    overall_score = Column(Float, default=0.0)  # 0 - 100
    skills_match_score = Column(Float, default=0.0)
    risk_level = Column(String(50), default="low")  # low, medium, high
    recommendation = Column(String(50), default="review")  # fast_track, interview, review, reject
    ai_analysis_summary = Column(Text, nullable=True)
    status = Column(String(50), default="applied")  # applied, screened, shortlisted, interview_scheduled, rejected
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
