from datetime import datetime, timezone
from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.ai_decision import AIDecision
from app.models.audit import AuditLog
from app.models.workflow import WorkflowExecution, WorkflowStep
from app.services.ai.gateway import AIGateway
from app.services.ai.verification import VerificationValidator
from app.services.ai.confidence import ConfidenceEngine
from app.services.integrations.slack_client import SlackClient


class DecisionEngine:
    """
    Engine 3: Orchestrates AI reasoning, deterministic verification,
    confidence-based routing (Autonomous vs Manager vs Human Operator),
    action execution, and audit logging.
    """

    @staticmethod
    async def evaluate_and_route(
        db: Session,
        domain: str,
        input_data: Dict[str, Any],
        entity_id: str = None,
        execution_id: str = None,
        tenant_id: str = None,
        actor_id: str = "system"
    ) -> Dict[str, Any]:
        # Step 1: AI Reasoning Generation
        ai_res = await AIGateway.generate_structured_decision(domain, input_data)
        ai_output = ai_res["output"]
        raw_confidence = float(ai_output.get("confidence", 90.0))
        reasoning = ai_output.get("reasoning", "")

        # Step 2: Deterministic Verification Validation
        if domain in ["dunning", "receivables"]:
            passed, violations, details = VerificationValidator.verify_dunning_decision(input_data, ai_output)
            risk_factors = {"amount": input_data.get("amount", 0)}
        elif domain in ["recruitment", "screening"]:
            passed, violations, details = VerificationValidator.verify_recruitment_decision(input_data, ai_output)
            risk_factors = {"risk": ai_output.get("risk", "low")}
        elif domain in ["support", "sla"]:
            passed, violations, details = VerificationValidator.verify_support_decision(input_data, ai_output)
            risk_factors = {"sentiment": ai_output.get("sentiment", "neutral")}
        else:
            passed, violations, details = True, [], {"passed": True}
            risk_factors = {}

        # Step 3: Confidence Calibration & Routing Determination
        calibrated_confidence = ConfidenceEngine.calibrate_confidence(raw_confidence, domain, risk_factors)
        decision_status, routing_tier = ConfidenceEngine.determine_routing(calibrated_confidence, passed)

        # Step 4: Persist AIDecision Record
        decision_record = AIDecision(
            tenant_id=tenant_id,
            execution_id=execution_id,
            domain=domain,
            entity_id=entity_id,
            model_provider=ai_res["provider"],
            model_name=ai_res["model"],
            input_data=input_data,
            prompt_used=ai_res.get("prompt_used"),
            ai_response=ai_output,
            reasoning_summary=reasoning,
            confidence_score=calibrated_confidence,
            verification_passed=passed,
            verification_details=details,
            status=decision_status,
            token_usage=ai_res.get("token_usage", {}),
            latency_ms=ai_res.get("latency_ms", 0.0)
        )
        db.add(decision_record)
        db.flush()

        # Step 5: Execution vs Human Review Routing
        action_result = {}
        if decision_status == "auto_approved":
            action_result = {"status": "executed_autonomously", "routing": "direct_execution"}
        elif decision_status == "pending_review":
            # Send interactive Slack block kit for manager review
            slack_res = await SlackClient.send_approval_request(
                title=f"{domain.title()} Action Decision (Score {calibrated_confidence}%)",
                details={
                    "confidence": calibrated_confidence,
                    "domain": domain,
                    "recommended_action": ai_output.get("recommended_action") or str(ai_output.get("decision", "Review"))
                },
                decision_id=decision_record.id
            )
            action_result = {"status": "queued_for_approval", "routing": routing_tier, "slack_alert": slack_res}
        else:
            action_result = {"status": "escalated_due_to_violations", "violations": violations}

        # Step 6: Immutable Structured Audit Log
        audit_log = AuditLog(
            tenant_id=tenant_id,
            action=f"ai_decision.{domain}.evaluated",
            actor_type="ai_agent",
            actor_id=actor_id,
            entity_type="ai_decision",
            entity_id=decision_record.id,
            payload={
                "domain": domain,
                "confidence_score": calibrated_confidence,
                "verification_passed": passed,
                "decision_status": decision_status,
                "routing_tier": routing_tier,
                "action_result": action_result
            }
        )
        db.add(audit_log)
        db.commit()
        db.refresh(decision_record)

        return {
            "decision_id": decision_record.id,
            "domain": domain,
            "status": decision_status,
            "routing_tier": routing_tier,
            "confidence_score": calibrated_confidence,
            "verification_passed": passed,
            "verification_details": details,
            "ai_output": ai_output,
            "action_result": action_result,
            "latency_ms": decision_record.latency_ms
        }
