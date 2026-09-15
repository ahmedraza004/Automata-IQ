from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.escalation import Escalation
from app.models.audit import AuditLog
from app.services.integrations.slack_client import SlackClient
from app.services.integrations.jira_client import JiraClient


class EscalationEngine:
    """
    Engine 2: Multi-Tier Escalation & SLA Enforcement Engine.
    Ensures nothing is neglected or falls through cracks.
    Promotes issues through Tier 1 (Operator) -> Tier 2 (Manager) -> Tier 3 (Executive),
    synchronizes with Jira, and broadcasts Slack alerts.
    """

    @staticmethod
    async def process_sla_breaches(db: Session) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        open_escalations = db.query(Escalation).filter(Escalation.status.in_(["open", "acknowledged"])).all()
        
        escalated_count = 0
        notified_count = 0
        details = []

        for esc in open_escalations:
            # Check if SLA deadline is exceeded
            if esc.sla_deadline:
                deadline = esc.sla_deadline if esc.sla_deadline.tzinfo else esc.sla_deadline.replace(tzinfo=timezone.utc)
                if now > deadline and not esc.is_breached:
                    esc.is_breached = True
                    # Escalate Tier
                    if esc.escalation_tier == 1:
                        esc.escalation_tier = 2
                        esc.priority = "high"
                        esc.assigned_to = "Operations Manager"
                    elif esc.escalation_tier == 2:
                        esc.escalation_tier = 3
                        esc.priority = "critical"
                        esc.assigned_to = "VP of Operations"
                    
                    escalated_count += 1
                    
                    # Create Jira Incident if not present
                    if not esc.jira_issue_key:
                        jira_res = await JiraClient.create_issue(
                            project_key="OPS",
                            summary=f"[ESCALATION TIER {esc.escalation_tier}] {esc.title}",
                            description=esc.description or "",
                            priority="High" if esc.priority != "critical" else "Highest"
                        )
                        esc.jira_issue_key = jira_res.get("key")

                    # Dispatch Slack Alert
                    await SlackClient.post_escalation_alert(
                        title=f"🚨 Tier {esc.escalation_tier} SLA Breach: {esc.title}",
                        severity=esc.priority,
                        entity_id=esc.id,
                        summary=esc.description or ""
                    )
                    notified_count += 1

                    details.append({
                        "escalation_id": esc.id,
                        "title": esc.title,
                        "new_tier": esc.escalation_tier,
                        "jira_key": esc.jira_issue_key
                    })

        db.commit()
        return {
            "processed_at": now.isoformat(),
            "escalations_promoted": escalated_count,
            "slack_notifications_sent": notified_count,
            "details": details
        }
