from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict


class AIDecisionBase(BaseModel):
    domain: str
    entity_id: Optional[str] = None
    model_provider: str = "gemini"
    model_name: str = "gemini-2.5-flash"
    input_data: Dict[str, Any]
    ai_response: Dict[str, Any]
    prompt_used: Optional[str] = None
    reasoning_summary: Optional[str] = None
    confidence_score: float
    verification_passed: bool = False
    verification_details: Dict[str, Any] = {}
    status: str = "pending_review"


class AIDecisionCreate(AIDecisionBase):
    execution_id: Optional[str] = None
    latency_ms: float = 0.0
    token_usage: Dict[str, Any] = {}


class AIDecisionReviewRequest(BaseModel):
    decision: str  # approve, reject, escalate
    review_notes: Optional[str] = None
    override_action_payload: Optional[Dict[str, Any]] = None


class AIDecisionRead(AIDecisionBase):
    id: str
    tenant_id: Optional[str] = None
    execution_id: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    review_notes: Optional[str] = None
    token_usage: Dict[str, Any] = {}
    latency_ms: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PromptTemplateBase(BaseModel):
    name: str
    domain: str
    version: int = 1
    system_prompt: str
    user_prompt_template: str
    json_schema: Dict[str, Any] = {}
    is_active: bool = True


class PromptTemplateCreate(PromptTemplateBase):
    pass


class PromptTemplateRead(PromptTemplateBase):
    id: str
    tenant_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
