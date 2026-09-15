from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.domain_entities import Invoice
from app.models.audit import AuditLog
from app.services.engines.decision_engine import DecisionEngine


class DunningService:
    """
    Business Domain Service: Accounts Receivable & Dunning Automation.
    """

    @staticmethod
    async def process_invoice_dunning(db: Session, invoice_id: str) -> Dict[str, Any]:
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice:
            raise ValueError(f"Invoice {invoice_id} not found")

        input_data = {
            "invoice_number": invoice.invoice_number,
            "customer_name": invoice.customer_name,
            "customer_email": invoice.customer_email,
            "amount": invoice.amount,
            "currency": invoice.currency,
            "days_overdue": invoice.days_overdue,
            "dunning_stage": invoice.dunning_stage,
            "payment_terms": invoice.payment_terms
        }

        eval_res = await DecisionEngine.evaluate_and_route(
            db=db,
            domain="dunning",
            input_data=input_data,
            entity_id=invoice.id,
            tenant_id=invoice.tenant_id,
            actor_id="dunning_service"
        )

        ai_out = eval_res["ai_output"]
        status = eval_res["status"]

        if status == "auto_approved":
            invoice.last_reminder_sent_at = datetime.now(timezone.utc)
            invoice.dunning_stage += 1
            if invoice.dunning_stage > 3:
                invoice.status = "escalated"

        db.commit()
        return {
            "invoice_id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "evaluation": eval_res
        }
