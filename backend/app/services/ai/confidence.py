from typing import Dict, Any, Tuple
from app.core.config import settings


class ConfidenceEngine:
    """
    Evaluates raw AI confidence, adjusts for domain complexity, historical reliability,
    and returns routing action: auto_execute, manager_review, human_operator_approval.
    """

    @staticmethod
    def calibrate_confidence(raw_confidence: float, domain: str, risk_factors: Dict[str, Any]) -> float:
        # Base confidence from AI
        adjusted = raw_confidence

        # Apply domain risk multipliers
        if domain == "dunning":
            amount = risk_factors.get("amount", 0)
            if amount > 50000:
                adjusted -= 10.0  # High-value invoices demand human eyes
            elif amount > 10000:
                adjusted -= 5.0
        elif domain == "support":
            sentiment = risk_factors.get("sentiment", "neutral")
            if sentiment == "furious":
                adjusted -= 15.0  # Angry VIPs need human touch
            elif sentiment == "negative":
                adjusted -= 5.0
        elif domain == "recruitment":
            risk = risk_factors.get("risk", "low")
            if risk == "high":
                adjusted -= 12.0

        return max(0.0, min(100.0, round(adjusted, 1)))

    @staticmethod
    def determine_routing(confidence_score: float, verification_passed: bool) -> Tuple[str, str]:
        """
        Returns: (status, routing_tier)
        status: auto_approved | pending_review | escalated
        routing_tier: autonomous | manager_queue | human_operator_queue | legal_escalation
        """
        if not verification_passed:
            return "escalated", "human_operator_queue"

        if confidence_score >= settings.CONFIDENCE_AUTO_EXECUTE_THRESHOLD:
            return "auto_approved", "autonomous"
        elif confidence_score >= settings.CONFIDENCE_MANAGER_REVIEW_THRESHOLD:
            return "pending_review", "manager_queue"
        else:
            return "pending_review", "human_operator_queue"
