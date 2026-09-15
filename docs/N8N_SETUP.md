# AutomataIQ - n8n Workflow Setup & Integration

All ready-to-import workflow templates are stored in the `/workflows` directory.

## Exported Workflows
1. `workflows/receivables_dunning.json`: Hourly schedule polling Odoo -> AI Evaluation -> Auto Email / Slack approval.
2. `workflows/recruitment_screening.json`: Webhook ingestion -> Resume parsing -> Score check -> Slack candidate shortlist.
3. `workflows/support_sla_sentinel.json`: Incoming ticket -> Sentiment triage -> Critical check -> Jira ticket dispatch.
4. `workflows/deadline_watcher.json`: 15-min Sentinel heartbeat scanning SLA deadlines.

---

## How to Import into n8n

1. Open your n8n web dashboard (e.g. `http://localhost:5678`).
2. Navigate to **Workflows** in the sidebar.
3. Click **Add Workflow** -> **Import from File...**
4. Select any of the JSON files from the `workflows/` folder.
5. Update your AutomataIQ API endpoint URL (default is `http://localhost:8000`).
6. Click **Activate Workflow** to start receiving events.
