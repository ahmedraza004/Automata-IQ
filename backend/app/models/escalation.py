import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, Float, JSON
from app.core.database import Base


class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    source = Column(String(100), nullable=False)  # invoice_overdue, sla_breach, ai_low_confidence, manual
    entity_id = Column(String(255), nullable=True)
    
    priority = Column(String(50), default="medium")  # low, medium, high, critical
    status = Column(String(50), default="open")  # open, acknowledged, in_progress, resolved, closed
    escalation_tier = Column(Integer, default=1)  # 1 (Operator), 2 (Manager), 3 (VP/Executive)
    
    sla_deadline = Column(DateTime, nullable=True)
    is_breached = Column(Boolean, default=False)
    
    assigned_to = Column(String(255), nullable=True)
    assigned_email = Column(String(255), nullable=True)
    
    jira_issue_key = Column(String(100), nullable=True)
    slack_channel = Column(String(100), nullable=True)
    slack_ts = Column(String(100), nullable=True)
    
    resolution_summary = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    meta_payload = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class SLAPolicy(Base):
    __tablename__ = "sla_policies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    domain = Column(String(100), nullable=False)  # dunning, support, recruitment
    priority = Column(String(50), nullable=False)
    target_response_minutes = Column(Integer, default=60)
    target_resolution_minutes = Column(Integer, default=240)
    auto_escalate_after_minutes = Column(Integer, default=120)
    is_active = Column(Boolean, default=True)
