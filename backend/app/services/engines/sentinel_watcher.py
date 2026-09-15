from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.domain_entities import Invoice, SupportTicket
from app.models.escalation import Escalation
from app.models.audit import AuditLog


class DeadlineSentinelWatcher:
    """
    Engine 1: Periodic Business Rule Watcher.
    Runs periodically or on-demand, queries domain entities, identifies overdue
    invoices, tickets nearing SLA breach, or stalled workflows, and triggers
    autonomous triage or escalations.
    """

    @staticmethod
    def scan_all_deadlines(db: Session) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        results = {
            "scanned_at": now.isoformat(),
            "invoices_flagged": 0,
            "tickets_sla_breached": 0,
            "escalations_created": 0,
            "details": []
        }

        # 1. Check Overdue Invoices
        invoices = db.query(Invoice).filter(Invoice.status.in_(["overdue", "posted"])).all()
        for inv in invoices:
            # calculate actual days overdue
            if inv.due_date:
                # Handle naive vs timezone-aware datetimes
                due = inv.due_date if inv.due_date.tzinfo else inv.due_date.replace(tzinfo=timezone.utc)
                diff_days = (now - due).days
                if diff_days > 0:
                    inv.days_overdue = diff_days
                    inv.status = "overdue"
                    results["invoices_flagged"] += 1
                    
                    # If overdue > 60 days and not escalated, create escalation
                    if diff_days > 60:
                        existing = db.query(Escalation).filter(
                            Escalation.entity_id == inv.id,
                            Escalation.status.in_(["open", "in_progress"])
                        ).first()
                        if not existing:
                            esc = Escalation(
                                title=f"Aging Receivables: Invoice {inv.invoice_number} ({inv.customer_name}) is {diff_days} days overdue",
                                description=f"Amount: ${inv.amount:,.2f}. Current dunning stage: {inv.dunning_stage}. Immediate financial recovery required.",
                                source="invoice_overdue",
                                entity_id=inv.id,
                                priority="high" if inv.amount > 20000 else "medium",
                                escalation_tier=2,
                                sla_deadline=now + timedelta(hours=24),
                                assigned_to="Finance Controller"
                            )
                            db.add(esc)
                            results["escalations_created"] += 1

        # 2. Check Support Tickets SLA
        tickets = db.query(SupportTicket).filter(SupportTicket.status.in_(["open", "ai_drafted", "in_review"])).all()
        for ticket in tickets:
            if ticket.sla_deadline:
                deadline = ticket.sla_deadline if ticket.sla_deadline.tzinfo else ticket.sla_deadline.replace(tzinfo=timezone.utc)
                if now > deadline and not ticket.is_sla_breached:
                    ticket.is_sla_breached = True
                    ticket.priority = "critical"
                    results["tickets_sla_breached"] += 1
                    
                    esc = Escalation(
                        title=f"SLA Breached: Ticket #{ticket.ticket_number} - {ticket.subject}",
                        description=f"Customer: {ticket.customer_name} ({ticket.customer_email}). Sentiment: {ticket.sentiment}. SLA target was {deadline.isoformat()}.",
                        source="sla_breach",
                        entity_id=ticket.id,
                        priority="critical",
                        escalation_tier=2,
                        sla_deadline=now + timedelta(hours=2),
                        assigned_to="Support Duty Lead"
                    )
                    db.add(esc)
                    results["escalations_created"] += 1

        # Log sentinel audit record
        audit = AuditLog(
            action="sentinel.scan_completed",
            actor_type="system",
            actor_id="deadline_watcher_engine",
            entity_type="sentinel",
            payload=results
        )
        db.add(audit)
        db.commit()

        return results
