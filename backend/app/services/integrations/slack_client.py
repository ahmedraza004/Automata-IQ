import httpx
from typing import Dict, Any, Optional
from app.core.config import settings


class SlackClient:
    """
    Dispatches interactive Block Kit messages to Slack channels for human approval,
    SLA escalations, and recruitment alerts.
    """

    @staticmethod
    async def send_approval_request(title: str, details: Dict[str, Any], decision_id: str) -> Dict[str, Any]:
        blocks = [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": f"⚡ [AutomataIQ Review] {title}", "emoji": True}
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Confidence Score:*\n`{details.get('confidence', 0)}%`"},
                    {"type": "mrkdwn", "text": f"*Domain:*\n`{details.get('domain', 'Operations')}`"}
                ]
            },
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"*AI Recommendation:*\n{details.get('recommended_action', 'Review required')}"}
            },
            {
                "type": "actions",
                "block_id": f"decision_action_{decision_id}",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "✅ Approve & Execute"},
                        "style": "primary",
                        "value": f"approve_{decision_id}"
                    },
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "❌ Reject"},
                        "style": "danger",
                        "value": f"reject_{decision_id}"
                    },
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "🔍 Open in AutomataIQ"},
                        "url": f"http://localhost:3000/decisions"
                    }
                ]
            }
        ]

        if settings.SLACK_WEBHOOK_URL and "http" in settings.SLACK_WEBHOOK_URL and "MOCK" not in settings.SLACK_WEBHOOK_URL:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.post(settings.SLACK_WEBHOOK_URL, json={"blocks": blocks})
                    return {"status": "sent", "http_status": res.status_code, "channel": settings.SLACK_CHANNEL}
            except Exception as e:
                print(f"[SlackClient] Error posting to Slack: {e}")

        # Simulated response
        return {
            "status": "simulated_sent",
            "channel": settings.SLACK_CHANNEL,
            "message_ts": "1710500000.123456",
            "blocks_count": len(blocks)
        }

    @staticmethod
    async def post_escalation_alert(title: str, severity: str, entity_id: str, summary: str) -> Dict[str, Any]:
        return {
            "status": "simulated_sent",
            "channel": settings.SLACK_CHANNEL,
            "alert_type": "sla_escalation",
            "severity": severity,
            "title": title
        }
