from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.integrations.odoo_client import OdooClient
from app.services.integrations.slack_client import SlackClient
from app.services.integrations.jira_client import JiraClient
from app.models.domain_entities import Invoice

router = APIRouter(prefix="/integrations", tags=["External Integrations & Connectors"])


@router.get("/odoo/overdue-invoices")
async def get_odoo_overdue_invoices(db: Session = Depends(get_db)):
    invoices = await OdooClient.fetch_overdue_invoices()
    return {"status": "success", "count": len(invoices), "invoices": invoices}


@router.post("/slack/send-approval-request")
async def post_slack_approval(payload: Dict[str, Any] = Body(...)):
    res = await SlackClient.send_approval_request(
        title=payload.get("title", "Action Pending Approval"),
        details=payload.get("details", {}),
        decision_id=payload.get("decision_id", "mock-id")
    )
    return res


@router.post("/jira/create-urgent-ticket")
async def post_jira_ticket(payload: Dict[str, Any] = Body(...)):
    res = await JiraClient.create_issue(
        project_key="OPS",
        summary=payload.get("summary", "Urgent SLA Incident"),
        description=payload.get("description", ""),
        priority="High"
    )
    return res


@router.post("/email/send-dunning")
async def send_dunning_email(payload: Dict[str, Any] = Body(...)):
    return {
        "status": "delivered",
        "recipient": payload.get("customer_email", "debtor@example.com"),
        "subject": f"Notice regarding invoice {payload.get('invoice_number', '')}",
        "message_id": "smtp-mock-msg-99214"
    }


@router.post("/email/send-auto-reply")
async def send_support_reply(payload: Dict[str, Any] = Body(...)):
    return {
        "status": "delivered",
        "recipient": payload.get("customer_email", "user@example.com"),
        "subject": "Update on your support ticket",
        "message_id": "smtp-mock-reply-88412"
    }
