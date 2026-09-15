from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.workflows import router as workflows_router
from app.api.v1.ai_decisions import router as decisions_router
from app.api.v1.escalations import router as escalations_router
from app.api.v1.audit import router as audit_router
from app.api.v1.metrics import router as metrics_router
from app.api.v1.simulation import router as simulation_router
from app.api.v1.integrations import router as integrations_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(workflows_router)
api_v1_router.include_router(decisions_router)
api_v1_router.include_router(escalations_router)
api_v1_router.include_router(audit_router)
api_v1_router.include_router(metrics_router)
api_v1_router.include_router(simulation_router)
api_v1_router.include_router(integrations_router)
