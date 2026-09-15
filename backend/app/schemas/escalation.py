from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class EscalationBase(BaseModel):
    title: str
    description: Optional[str] = None
    source: str
    entity_id: Optional[str] = None
    priority: str = "medium"  # low, medium, high, critical
    status: str = "open"  # open, acknowledged, in_progress, resolved, closed
    escalation_tier: int = 1
    sla_deadline: Optional[datetime] = None
    assigned_to: Optional[str] = None
    assigned_email: Optional[str] = None
    meta_payload: Dict[str, Any] = {}


class EscalationCreate(EscalationBase):
    pass


class EscalationUpdate(BaseModel):
    priority: Optional[str] = None
    status: Optional[str] = None
    escalation_tier: Optional[int] = None
    assigned_to: Optional[str] = None
    assigned_email: Optional[str] = None
    resolution_summary: Optional[str] = None


class EscalationRead(EscalationBase):
    id: str
    tenant_id: Optional[str] = None
    is_breached: bool
    jira_issue_key: Optional[str] = None
    slack_channel: Optional[str] = None
    slack_ts: Optional[str] = None
    resolution_summary: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
