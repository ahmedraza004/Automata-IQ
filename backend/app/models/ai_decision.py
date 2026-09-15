import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, Float, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class AIDecision(Base):
    __tablename__ = "ai_decisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=True)
    execution_id = Column(String(36), ForeignKey("workflow_executions.id"), nullable=True, index=True)
    domain = Column(String(100), nullable=False)  # receivables, recruitment, support, general
    entity_id = Column(String(255), nullable=True)  # ID of the invoice, ticket, resume, etc.
    model_provider = Column(String(50), default="gemini")
    model_name = Column(String(100), default="gemini-2.5-flash")
    
    input_data = Column(JSON, nullable=False)
    prompt_used = Column(Text, nullable=True)
    ai_response = Column(JSON, nullable=False)
    reasoning_summary = Column(Text, nullable=True)
    
    confidence_score = Column(Float, nullable=False)  # 0.0 - 100.0
    verification_passed = Column(Boolean, default=False)
    verification_details = Column(JSON, default=dict)
    
    status = Column(String(50), default="pending_review")
    # auto_approved, pending_review, approved_by_human, rejected_by_human, escalated
    
    reviewed_by = Column(String(255), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    review_notes = Column(Text, nullable=True)
    
    token_usage = Column(JSON, default=dict)
    latency_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    execution = relationship("WorkflowExecution", back_populates="ai_decisions")


class PromptTemplate(Base):
    __tablename__ = "prompt_templates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=True)
    name = Column(String(100), nullable=False, unique=True)
    domain = Column(String(100), nullable=False)
    version = Column(Integer, default=1)
    system_prompt = Column(Text, nullable=False)
    user_prompt_template = Column(Text, nullable=False)
    json_schema = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
