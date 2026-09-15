from typing import Dict, Any, List, Tuple


class VerificationValidator:
    """
    Deterministic Verification Layer that enforces hard enterprise constraints
    which NO LLM output is permitted to violate.
    """

    @staticmethod
    def verify_dunning_decision(input_data: Dict[str, Any], ai_output: Dict[str, Any]) -> Tuple[bool, List[str], Dict[str, Any]]:
        checks = []
        violations = []
        
        amount = float(input_data.get("amount", 0))
        days_overdue = int(input_data.get("days_overdue", 0))
        discount = float(ai_output.get("discount_offered_percent", 0.0))
        decision = ai_output.get("decision", "")

        # Guardrail 1: Max discount policy (Max 10% discount allowed without executive approval)
        if discount > 10.0:
            violations.append(f"Proposed discount of {discount}% exceeds maximum allowed autonomous limit (10.0%)")
            checks.append({"rule": "max_discount_guard", "passed": False})
        else:
            checks.append({"rule": "max_discount_guard", "passed": True})

        # Guardrail 2: Legal escalation threshold
        if days_overdue > 90 and decision == "do_nothing":
            violations.append(f"Invoice overdue by {days_overdue} days cannot have 'do_nothing' action")
            checks.append({"rule": "aged_debt_action_required", "passed": False})
        else:
            checks.append({"rule": "aged_debt_action_required", "passed": True})

        # Guardrail 3: Safe language and non-empty communication
        draft = ai_output.get("drafted_message", "")
        if decision in ["send_reminder", "offer_discount"] and (not draft or len(draft) < 20):
            violations.append("Drafted notice is suspiciously short or missing")
            checks.append({"rule": "draft_completeness_check", "passed": False})
        else:
            checks.append({"rule": "draft_completeness_check", "passed": True})

        # Guardrail 4: Prohibited aggressive phrases check
        forbidden_terms = ["sue you immediately", "ruin your credit forever", "court jail", "fraudulent scammer"]
        if any(term in draft.lower() for term in forbidden_terms):
            violations.append("Drafted notice contains illegal or aggressive coercive terminology")
            checks.append({"rule": "compliance_language_safety", "passed": False})
        else:
            checks.append({"rule": "compliance_language_safety", "passed": True})

        passed = len(violations) == 0
        details = {
            "checks": checks,
            "violations": violations,
            "passed": passed
        }
        return passed, violations, details

    @staticmethod
    def verify_recruitment_decision(input_data: Dict[str, Any], ai_output: Dict[str, Any]) -> Tuple[bool, List[str], Dict[str, Any]]:
        checks = []
        violations = []

        candidate_score = float(ai_output.get("candidate_score", 0.0))
        recommendation = ai_output.get("recommendation", "")
        missing_skills = ai_output.get("missing_critical_skills", [])

        # Guardrail: Consistency check
        if candidate_score >= 90 and recommendation == "reject":
            violations.append(f"Inconsistent AI decision: Score is {candidate_score} but recommendation is 'reject'")
            checks.append({"rule": "score_recommendation_consistency", "passed": False})
        elif candidate_score < 40 and recommendation == "fast_track":
            violations.append(f"Inconsistent AI decision: Score is {candidate_score} but recommendation is 'fast_track'")
            checks.append({"rule": "score_recommendation_consistency", "passed": False})
        else:
            checks.append({"rule": "score_recommendation_consistency", "passed": True})

        # Guardrail: Critical skills enforcement
        if len(missing_skills) >= 3 and recommendation in ["fast_track", "interview"]:
            violations.append(f"Candidate lacks {len(missing_skills)} critical requirements; cannot fast-track")
            checks.append({"rule": "critical_skills_gate", "passed": False})
        else:
            checks.append({"rule": "critical_skills_gate", "passed": True})

        passed = len(violations) == 0
        details = {
            "checks": checks,
            "violations": violations,
            "passed": passed
        }
        return passed, violations, details

    @staticmethod
    def verify_support_decision(input_data: Dict[str, Any], ai_output: Dict[str, Any]) -> Tuple[bool, List[str], Dict[str, Any]]:
        checks = []
        violations = []

        category = ai_output.get("category", "")
        priority = ai_output.get("priority", "")
        requires_jira = ai_output.get("requires_jira_ticket", False)

        # Guardrail: Outage must always trigger Jira incident
        if category == "outage" and not requires_jira:
            violations.append("Outage category tickets MUST require Jira escalation ticket")
            checks.append({"rule": "outage_incident_escalation_enforced", "passed": False})
        else:
            checks.append({"rule": "outage_incident_escalation_enforced", "passed": True})

        # Guardrail: Critical priority requires SLA monitoring
        if priority == "critical" and not requires_jira:
            violations.append("Critical priority issues must be tracked in issue tracker")
            checks.append({"rule": "critical_ticket_tracking_enforced", "passed": False})
        else:
            checks.append({"rule": "critical_ticket_tracking_enforced", "passed": True})

        passed = len(violations) == 0
        details = {
            "checks": checks,
            "violations": violations,
            "passed": passed
        }
        return passed, violations, details
