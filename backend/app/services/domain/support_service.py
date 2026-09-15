from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.domain_entities import SupportTicket
from app.models.escalation import Escalation
from app.services.engines.decision_engine import DecisionEngine
from app.services.integrations.jira_client import JiraClient


class SupportService:
    """
    Business Domain Service: Customer Support & SLA Sentinel Triage.
    """

    @staticmethod
    async def triage_ticket(db: Session, ticket_data: Dict[str, Any]) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        eval_res = await DecisionEngine.evaluate_and_route(
            db=db,
            domain="support",
            input_data=ticket_data,
            actor_id="support_sentinel"
        )

        ai_out = eval_res["ai_output"]
        priority = ai_out.get("priority", "medium")
        
        # Calculate SLA target
        sla_hours = 1 if priority == "critical" else (4 if priority == "high" else 24)
        sla_deadline = now + timedelta(hours=sla_hours)

        ticket = SupportTicket(
            ticket_number=ticket_data.get("ticket_number") or f"TICK-{now.strftime('%Y%m%d%H%M%S')}",
            customer_name=ticket_data.get("customer_name", "Customer"),
            customer_email=ticket_data.get("customer_email", "customer@example.com"),
            subject=ticket_data.get("subject", "Support Inquiry"),
            body=ticket_data.get("body", ""),
            category=ai_out.get("category", "general"),
            sentiment=ai_out.get("sentiment", "neutral"),
            priority=priority,
            status="ai_drafted" if eval_res["status"] == "pending_review" else "open",
            sla_deadline=sla_deadline,
            ai_suggested_reply=ai_out.get("suggested_reply"),
            ai_confidence=eval_res["confidence_score"]
        )
        db.add(ticket)
        db.flush()

        # If Jira required, auto-create Jira ticket
        if ai_out.get("requires_jira_ticket"):
            jira_res = await JiraClient.create_issue(
                project_key="OPS",
                summary=f"[{priority.upper()}] {ticket.subject}",
                description=f"Customer: {ticket.customer_name} ({ticket.customer_email})\n\nIssue Details:\n{ticket.body}",
                priority="High" if priority != "critical" else "Highest"
            )
            # Create escalation item
            esc = Escalation(
                title=f"Support Incident: {ticket.subject}",
                description=f"Ticket #{ticket.ticket_number} flagged as {priority} priority. Auto-created Jira key: {jira_res.get('key')}",
                source="support_ticket_triage",
                entity_id=ticket.id,
                priority=priority,
                escalation_tier=1 if priority != "critical" else 2,
                sla_deadline=sla_deadline,
                jira_issue_key=jira_res.get("key"),
                assigned_to="Duty Engineer"
            )
            db.add(esc)

        db.commit()
        db.refresh(ticket)

        return {
            "ticket_id": ticket.id,
            "ticket_number": ticket.ticket_number,
            "evaluation": eval_res
        }
