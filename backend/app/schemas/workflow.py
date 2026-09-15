from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class WorkflowBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    workflow_type: str = "custom"
    status: str = "active"
    cron_expression: Optional[str] = None
    config_json: Dict[str, Any] = {}


class WorkflowCreate(WorkflowBase):
    pass


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    cron_expression: Optional[str] = None
    config_json: Optional[Dict[str, Any]] = None


class WorkflowStepRead(BaseModel):
    id: str
    step_number: int
    name: str
    step_type: str
    status: str
    input_data: Dict[str, Any] = {}
    output_data: Dict[str, Any] = {}
    error_details: Optional[str] = None
    duration_ms: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkflowExecutionRead(BaseModel):
    id: str
    workflow_id: str
    trigger_type: str
    status: str
    input_payload: Dict[str, Any] = {}
    output_payload: Dict[str, Any] = {}
    error_message: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    execution_time_ms: float
    steps: List[WorkflowStepRead] = []

    model_config = ConfigDict(from_attributes=True)


class WorkflowRead(WorkflowBase):
    id: str
    tenant_id: Optional[str] = None
    total_runs: int
    success_runs: int
    failed_runs: int
    last_run_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
