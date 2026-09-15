from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.domain import (
    DunningEvaluationRequest, DunningEvaluationResponse,
    ResumeScreeningRequest, ResumeScreeningResponse,
    SupportTriageRequest, SupportTriageResponse
)
from app.services.engines.decision_engine import DecisionEngine
from app.services.engines.sentinel_watcher import DeadlineSentinelWatcher
from app.services.domain.dunning_service import DunningService
from app.services.domain.hr_service import HRService
from app.services.domain.support_service import SupportService
from app.api.websocket import ws_manager

router = APIRouter(prefix="/simulation", tags=["Live Scenario Simulation Studio"])


@router.post("/dunning/evaluate", response_model=DunningEvaluationResponse)
async def simulate_dunning_evaluation(req: DunningEvaluationRequest, db: Session = Depends(get_db)):
    input_data = {
        "invoice_number": req.invoice_number or "INV-SIM-2026",
        "customer_name": req.customer_name or "Acme Industrial Corp",
        "customer_email": req.customer_email or "ap@acme.com",
        "amount": req.amount or 15400.00,
        "days_overdue": req.days_overdue or 45,
        "customer_risk_tier": req.customer_risk_tier or "standard"
    }

    result = await DecisionEngine.evaluate_and_route(
        db=db,
        domain="dunning",
        input_data=input_data,
        actor_id="simulation_studio"
    )

    ai_out = result["ai_output"]
    
    # Broadcast live event via WebSocket
    await ws_manager.broadcast({
        "event": "SIMULATION_DUNNING_COMPLETED",
        "decision_id": result["decision_id"],
        "confidence": result["confidence_score"],
        "status": result["status"],
        "recommended_action": ai_out.get("recommended_action")
    })

    return DunningEvaluationResponse(
        decision=ai_out.get("decision", "send_reminder"),
        confidence=result["confidence_score"],
        severity_level=ai_out.get("severity_level", "firm"),
        recommended_action=ai_out.get("recommended_action", "Send reminder"),
        drafted_message=ai_out.get("drafted_message", ""),
        discount_offered_percent=float(ai_out.get("discount_offered_percent", 0.0)),
        reasoning=ai_out.get("reasoning", ""),
        verification_passed=result["verification_passed"],
        requires_human_approval=(result["status"] != "auto_approved")
    )


@router.post("/recruitment/screen", response_model=ResumeScreeningResponse)
async def simulate_resume_screening(req: ResumeScreeningRequest, db: Session = Depends(get_db)):
    res = await HRService.screen_candidate(db, req.model_dump())
    eval_res = res["evaluation"]
    ai_out = eval_res["ai_output"]

    # Broadcast live event via WebSocket
    await ws_manager.broadcast({
        "event": "SIMULATION_RECRUITMENT_COMPLETED",
        "candidate_id": res["candidate_id"],
        "candidate_name": res["candidate_name"],
        "score": ai_out.get("candidate_score", 0),
        "recommendation": ai_out.get("recommendation", "review")
    })

    return ResumeScreeningResponse(
        candidate_score=ai_out.get("candidate_score", 0),
        skills_match=ai_out.get("skills_match", 0),
        skills_found=ai_out.get("skills_found", []),
        missing_critical_skills=ai_out.get("missing_critical_skills", []),
        experience_assessment=ai_out.get("experience_assessment", ""),
        risk=ai_out.get("risk", "low"),
        recommendation=ai_out.get("recommendation", "review"),
        interview_questions=ai_out.get("interview_questions", []),
        reasoning=ai_out.get("reasoning", ""),
        confidence=eval_res["confidence_score"],
        verification_passed=eval_res["verification_passed"]
    )


@router.post("/support/triage", response_model=SupportTriageResponse)
async def simulate_support_triage(req: SupportTriageRequest, db: Session = Depends(get_db)):
    res = await SupportService.triage_ticket(db, req.model_dump())
    eval_res = res["evaluation"]
    ai_out = eval_res["ai_output"]

    # Broadcast live event via WebSocket
    await ws_manager.broadcast({
        "event": "SIMULATION_SUPPORT_COMPLETED",
        "ticket_id": res["ticket_id"],
        "ticket_number": res["ticket_number"],
        "priority": ai_out.get("priority", "medium"),
        "sentiment": ai_out.get("sentiment", "neutral")
    })

    return SupportTriageResponse(
        category=ai_out.get("category", "general"),
        priority=ai_out.get("priority", "medium"),
        sentiment=ai_out.get("sentiment", "neutral"),
        urgency_score=ai_out.get("urgency_score", 50.0),
        confidence=eval_res["confidence_score"],
        suggested_reply=ai_out.get("suggested_reply", ""),
        requires_jira_ticket=ai_out.get("requires_jira_ticket", False),
        escalation_reason=ai_out.get("escalation_reason"),
        verification_passed=eval_res["verification_passed"]
    )


@router.post("/sentinel/scan-deadlines")
def trigger_sentinel_scan(db: Session = Depends(get_db)):
    res = DeadlineSentinelWatcher.scan_all_deadlines(db)
    return res
