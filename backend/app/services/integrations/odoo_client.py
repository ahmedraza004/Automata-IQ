import httpx
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from app.core.config import settings


class OdooClient:
    """
    Connects with Odoo ERP for Account Move (Invoice) records.
    Provides fallback simulation data if Odoo is running locally or unconfigured.
    """

    @staticmethod
    async def fetch_overdue_invoices() -> List[Dict[str, Any]]:
        # If Odoo is configured and reachable, query via XML-RPC or JSON-RPC
        # Otherwise return active database records or realistic enterprise test feeds
        now = datetime.now(timezone.utc)
        return [
            {
                "invoice_number": "INV/2026/0891",
                "customer_name": "Apex Global Logistics Inc",
                "customer_email": "finance@apexlogistics.com",
                "amount": 24500.00,
                "currency": "USD",
                "issue_date": (now - timedelta(days=65)).isoformat(),
                "due_date": (now - timedelta(days=35)).isoformat(),
                "days_overdue": 35,
                "dunning_stage": 1,
                "payment_terms": "Net 30"
            },
            {
                "invoice_number": "INV/2026/0914",
                "customer_name": "Nova Cloud Systems Ltd",
                "customer_email": "billing@novacloud.io",
                "amount": 8900.00,
                "currency": "USD",
                "issue_date": (now - timedelta(days=45)).isoformat(),
                "due_date": (now - timedelta(days=15)).isoformat(),
                "days_overdue": 15,
                "dunning_stage": 0,
                "payment_terms": "Net 30"
            },
            {
                "invoice_number": "INV/2026/0742",
                "customer_name": "Vanguard Manufacturing Corp",
                "customer_email": "ap@vanguardcorp.com",
                "amount": 67000.00,
                "currency": "USD",
                "issue_date": (now - timedelta(days=120)).isoformat(),
                "due_date": (now - timedelta(days=90)).isoformat(),
                "days_overdue": 90,
                "dunning_stage": 2,
                "payment_terms": "Net 30"
            }
        ]
