import pytest
from app.services.ai.verification import VerificationValidator
from app.services.ai.confidence import ConfidenceEngine
from app.services.ai.gateway import AIGateway


def test_dunning_verification_guardrails():
    # Test 1: Excessive discount rejection
    input_data = {"amount": 20000, "days_overdue": 45}
    ai_output_bad = {
        "decision": "offer_discount",
        "discount_offered_percent": 25.0,  # exceeds 10% policy limit
        "drafted_message": "We can offer you a 25% discount if paid today."
    }
    passed, violations, details = VerificationValidator.verify_dunning_decision(input_data, ai_output_bad)
    assert not passed
    assert any("exceeds maximum allowed" in v for v in violations)

    # Test 2: Valid dunning notice
    ai_output_good = {
        "decision": "send_reminder",
        "discount_offered_percent": 5.0,
        "drafted_message": "Dear Customer, please settle your overdue balance of $20,000 at your earliest convenience."
    }
    passed, violations, details = VerificationValidator.verify_dunning_decision(input_data, ai_output_good)
    assert passed
    assert len(violations) == 0


def test_confidence_calibration_and_routing():
    # Test high confidence auto-approval
    status, tier = ConfidenceEngine.determine_routing(96.5, verification_passed=True)
    assert status == "auto_approved"
    assert tier == "autonomous"

    # Test medium confidence manager review
    status, tier = ConfidenceEngine.determine_routing(88.0, verification_passed=True)
    assert status == "pending_review"
    assert tier == "manager_queue"

    # Test low confidence human operator queue
    status, tier = ConfidenceEngine.determine_routing(74.0, verification_passed=True)
    assert status == "pending_review"
    assert tier == "human_operator_queue"

    # Test failed verification escalation
    status, tier = ConfidenceEngine.determine_routing(99.0, verification_passed=False)
    assert status == "escalated"


@pytest.mark.asyncio
async def test_ai_simulation_engine():
    res = await AIGateway.generate_structured_decision(
        "dunning",
        {"invoice_number": "TEST-01", "amount": 15000, "days_overdue": 40, "customer_name": "Test Client"}
    )
    assert res is not None
    assert "output" in res
    assert "decision" in res["output"]
    assert "confidence" in res["output"]
