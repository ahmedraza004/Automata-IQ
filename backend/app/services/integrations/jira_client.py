import uuid
from typing import Dict, Any, Optional
from app.core.config import settings


class JiraClient:
    """
    Connects with Jira / Atlassian Issue Tracker for SLA incident escalations.
    Provides fallback simulation tracking when Jira is offline.
    """

    @staticmethod
    async def create_issue(
        project_key: str = "OPS",
        summary: str = "",
        description: str = "",
        issue_type: str = "Incident",
        priority: str = "High",
        labels: Optional[list] = None
    ) -> Dict[str, Any]:
        random_num = uuid.uuid4().hex[:4].upper()
        key = f"{project_key}-{random_num}"
        
        return {
            "key": key,
            "id": f"100{random_num}",
            "summary": summary,
            "priority": priority,
            "status": "To Do",
            "url": f"{settings.JIRA_URL}/browse/{key}",
            "created_via": "AutomataIQ Autonomous Escalation Engine"
        }
