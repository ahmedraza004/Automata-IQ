import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)  # e.g., ai_decision.evaluated, workflow.executed, decision.approved
    actor_type = Column(String(50), default="system")  # system, ai_agent, user, webhook
    actor_id = Column(String(255), default="system")
    actor_email = Column(String(255), nullable=True)
    
    entity_type = Column(String(100), nullable=False, index=True)  # invoice, ticket, candidate, workflow, ai_decision
    entity_id = Column(String(255), nullable=True, index=True)
    
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    
    before_state = Column(JSON, nullable=True)
    after_state = Column(JSON, nullable=True)
    payload = Column(JSON, default=dict)
    
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
