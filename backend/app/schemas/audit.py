from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict


class AuditLogBase(BaseModel):
    action: str
    actor_type: str = "system"
    actor_id: str = "system"
    actor_email: Optional[str] = None
    entity_type: str
    entity_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    before_state: Optional[Dict[str, Any]] = None
    after_state: Optional[Dict[str, Any]] = None
    payload: Dict[str, Any] = {}


class AuditLogCreate(AuditLogBase):
    tenant_id: Optional[str] = None


class AuditLogRead(AuditLogBase):
    id: str
    tenant_id: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditLogFilter(BaseModel):
    action: Optional[str] = None
    actor_id: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: int = 50
    offset: int = 0
