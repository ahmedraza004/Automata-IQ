from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.ai_decision import AIDecision, PromptTemplate
from app.models.audit import AuditLog
from app.schemas.ai_decision import (
    AIDecisionRead, AIDecisionReviewRequest, PromptTemplateRead, PromptTemplateCreate
)
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/decisions", tags=["AI Decisions & Human Review"])


@router.get("/", response_model=List[AIDecisionRead])
def list_ai_decisions(
    domain: Optional[str] = None,
    status: Optional[str] = None,
    min_confidence: Optional[float] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(AIDecision)
    if domain:
        query = query.filter(AIDecision.domain == domain)
    if status:
        query = query.filter(AIDecision.status == status)
    if min_confidence is not None:
        query = query.filter(AIDecision.confidence_score >= min_confidence)
    
    decisions = query.order_by(AIDecision.created_at.desc()).offset(offset).limit(limit).all()
    return [AIDecisionRead.model_validate(d) for d in decisions]


@router.get("/{decision_id}", response_model=AIDecisionRead)
def get_ai_decision(decision_id: str, db: Session = Depends(get_db)):
    decision = db.query(AIDecision).filter(AIDecision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="AI Decision not found")
    return AIDecisionRead.model_validate(decision)


@router.post("/{decision_id}/review", response_model=AIDecisionRead)
def review_ai_decision(
    decision_id: str,
    review_in: AIDecisionReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    decision = db.query(AIDecision).filter(AIDecision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="AI Decision not found")

    before_state = {"status": decision.status, "reviewed_by": decision.reviewed_by}

    now = datetime.now(timezone.utc)
    decision.reviewed_by = current_user.email if current_user else "admin@automatai.com"
    decision.reviewed_at = now
    decision.review_notes = review_in.review_notes

    if review_in.decision == "approve":
        decision.status = "approved_by_human"
    elif review_in.decision == "reject":
        decision.status = "rejected_by_human"
    elif review_in.decision == "escalate":
        decision.status = "escalated"

    after_state = {"status": decision.status, "reviewed_by": decision.reviewed_by, "notes": decision.review_notes}

    # Audit log
    audit = AuditLog(
        tenant_id=decision.tenant_id,
        action=f"ai_decision.reviewed.{review_in.decision}",
        actor_type="user",
        actor_id=current_user.id if current_user else "admin",
        actor_email=current_user.email if current_user else "admin@automatai.com",
        entity_type="ai_decision",
        entity_id=decision.id,
        before_state=before_state,
        after_state=after_state,
        payload={"review_action": review_in.decision, "notes": review_in.review_notes}
    )
    db.add(audit)
    db.commit()
    db.refresh(decision)

    return AIDecisionRead.model_validate(decision)


@router.get("/prompts/list", response_model=List[PromptTemplateRead])
def list_prompt_templates(db: Session = Depends(get_db)):
    templates = db.query(PromptTemplate).all()
    return [PromptTemplateRead.model_validate(t) for t in templates]
