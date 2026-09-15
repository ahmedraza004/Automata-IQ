from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.escalation import Escalation
from app.models.audit import AuditLog
from app.schemas.escalation import EscalationRead, EscalationCreate, EscalationUpdate
from app.services.engines.escalation_engine import EscalationEngine
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/escalations", tags=["SLA Escalations & Triage"])


@router.get("/", response_model=List[EscalationRead])
def list_escalations(
    priority: Optional[str] = None,
    status: Optional[str] = None,
    tier: Optional[int] = None,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Escalation)
    if priority:
        query = query.filter(Escalation.priority == priority)
    if status:
        query = query.filter(Escalation.status == status)
    if tier:
        query = query.filter(Escalation.escalation_tier == tier)
    
    return [EscalationRead.model_validate(e) for e in query.order_by(Escalation.created_at.desc()).limit(limit).all()]


@router.get("/{escalation_id}", response_model=EscalationRead)
def get_escalation(escalation_id: str, db: Session = Depends(get_db)):
    esc = db.query(Escalation).filter(Escalation.id == escalation_id).first()
    if not esc:
        raise HTTPException(status_code=404, detail="Escalation not found")
    return EscalationRead.model_validate(esc)


@router.patch("/{escalation_id}", response_model=EscalationRead)
def update_escalation(
    escalation_id: str,
    esc_in: EscalationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    esc = db.query(Escalation).filter(Escalation.id == escalation_id).first()
    if not esc:
        raise HTTPException(status_code=404, detail="Escalation not found")

    if esc_in.status:
        esc.status = esc_in.status
        if esc_in.status == "resolved":
            esc.resolved_at = datetime.now(timezone.utc)
    if esc_in.priority:
        esc.priority = esc_in.priority
    if esc_in.escalation_tier:
        esc.escalation_tier = esc_in.escalation_tier
    if esc_in.assigned_to:
        esc.assigned_to = esc_in.assigned_to
    if esc_in.resolution_summary:
        esc.resolution_summary = esc_in.resolution_summary

    audit = AuditLog(
        tenant_id=esc.tenant_id,
        action="escalation.updated",
        actor_type="user",
        actor_id=current_user.id if current_user else "admin",
        actor_email=current_user.email if current_user else "admin@automatai.com",
        entity_type="escalation",
        entity_id=esc.id,
        payload=esc_in.model_dump(exclude_unset=True)
    )
    db.add(audit)
    db.commit()
    db.refresh(esc)
    return EscalationRead.model_validate(esc)


@router.post("/process-sla-breaches")
async def trigger_sla_breach_check(db: Session = Depends(get_db)):
    result = await EscalationEngine.process_sla_breaches(db)
    return result
