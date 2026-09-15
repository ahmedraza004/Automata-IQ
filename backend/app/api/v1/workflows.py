from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.workflow import Workflow, WorkflowExecution, WorkflowStep
from app.models.audit import AuditLog
from app.schemas.workflow import WorkflowCreate, WorkflowUpdate, WorkflowRead, WorkflowExecutionRead
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/workflows", tags=["Workflows"])


@router.get("/", response_model=List[WorkflowRead])
def list_workflows(
    status: Optional[str] = None,
    workflow_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Workflow)
    if status:
        query = query.filter(Workflow.status == status)
    if workflow_type:
        query = query.filter(Workflow.workflow_type == workflow_type)
    return [WorkflowRead.model_validate(w) for w in query.order_by(Workflow.created_at.desc()).all()]


@router.post("/", response_model=WorkflowRead)
def create_workflow(
    workflow_in: WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wf = Workflow(
        tenant_id=current_user.tenant_id if current_user else None,
        name=workflow_in.name,
        slug=workflow_in.slug,
        description=workflow_in.description,
        workflow_type=workflow_in.workflow_type,
        status=workflow_in.status,
        cron_expression=workflow_in.cron_expression,
        config_json=workflow_in.config_json
    )
    db.add(wf)
    db.flush()

    audit = AuditLog(
        tenant_id=wf.tenant_id,
        action="workflow.created",
        actor_type="user",
        actor_id=current_user.id if current_user else "admin",
        actor_email=current_user.email if current_user else "admin@automatai.com",
        entity_type="workflow",
        entity_id=wf.id,
        payload={"name": wf.name, "type": wf.workflow_type}
    )
    db.add(audit)
    db.commit()
    db.refresh(wf)
    return WorkflowRead.model_validate(wf)


@router.get("/{workflow_id}", response_model=WorkflowRead)
def get_workflow(workflow_id: str, db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return WorkflowRead.model_validate(wf)


@router.get("/{workflow_id}/executions", response_model=List[WorkflowExecutionRead])
def get_workflow_executions(
    workflow_id: str,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    executions = db.query(WorkflowExecution).filter(
        WorkflowExecution.workflow_id == workflow_id
    ).order_by(WorkflowExecution.started_at.desc()).limit(limit).all()
    return [WorkflowExecutionRead.model_validate(e) for e in executions]
