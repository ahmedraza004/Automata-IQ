import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
from app.models.user import Tenant, User
from app.models.workflow import Workflow, WorkflowExecution, WorkflowStep
from app.models.ai_decision import AIDecision, PromptTemplate
from app.models.escalation import Escalation, SLAPolicy
from app.models.audit import AuditLog
from app.models.domain_entities import Invoice, SupportTicket, CandidateApplication


def seed_database():
    print("[Seed] Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Tenant
        tenant = db.query(Tenant).filter(Tenant.slug == "apex-enterprise").first()
        if not tenant:
            tenant = Tenant(
                name="Apex Global Enterprise",
                slug="apex-enterprise",
                tier="enterprise"
            )
            db.add(tenant)
            db.flush()
            print("[Seed] Created default tenant: Apex Global Enterprise")

        # 2. Users
        users_data = [
            ("admin@automatai.com", "Alexander Vance (Executive Admin)", "admin", "admin123"),
            ("manager@automatai.com", "Sarah Chen (Operations Manager)", "manager", "manager123"),
            ("operator@automatai.com", "Marcus Brody (Triage Operator)", "operator", "operator123"),
            ("auditor@automatai.com", "Elena Rostova (Compliance Auditor)", "auditor", "auditor123"),
        ]

        for email, name, role, pwd in users_data:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    tenant_id=tenant.id,
                    email=email,
                    full_name=name,
                    role=role,
                    hashed_password=get_password_hash(pwd),
                    avatar_url=f"https://api.dicebear.com/7.x/bottts/svg?seed={role}"
                )
                db.add(user)
                print(f"[Seed] Created user: {email} (role: {role})")
        db.flush()

        now = datetime.now(timezone.utc)

        # 3. Workflows
        workflows_data = [
            {
                "name": "Accounts Receivable & Dunning Sentinel",
                "slug": "receivables-dunning-sentinel",
                "description": "Monitors Odoo overdue invoices, calculates aging risk, drafts personalized collection notices, and escalates accounts exceeding 60 days.",
                "workflow_type": "dunning",
                "cron_expression": "0 * * * *",
                "total_runs": 1420,
                "success_runs": 1398,
                "failed_runs": 22
            },
            {
                "name": "AI Candidate Screening & Talent Evaluator",
                "slug": "recruitment-screening-evaluator",
                "description": "Parses incoming candidate resumes against job requisitions, generates skill match matrix, and shortlists candidates.",
                "workflow_type": "recruitment",
                "cron_expression": "*/15 * * * *",
                "total_runs": 890,
                "success_runs": 875,
                "failed_runs": 15
            },
            {
                "name": "Customer Support SLA & Incident Sentinel",
                "slug": "support-sla-incident-sentinel",
                "description": "Performs sentiment & urgency triage on incoming support tickets, synthesizes verified draft replies, and escalates outages to Jira.",
                "workflow_type": "support",
                "cron_expression": "*/5 * * * *",
                "total_runs": 3210,
                "success_runs": 3190,
                "failed_runs": 20
            },
            {
                "name": "Global Business Rules & Deadline Watcher",
                "slug": "global-deadline-watcher",
                "description": "Engine 1 background heartbeat checking SLA timers, pending approvals, and stalled tasks.",
                "workflow_type": "sentinel",
                "cron_expression": "*/10 * * * *",
                "total_runs": 4500,
                "success_runs": 4495,
                "failed_runs": 5
            }
        ]

        created_workflows = []
        for wf_info in workflows_data:
            wf = db.query(Workflow).filter(Workflow.slug == wf_info["slug"]).first()
            if not wf:
                wf = Workflow(
                    tenant_id=tenant.id,
                    name=wf_info["name"],
                    slug=wf_info["slug"],
                    description=wf_info["description"],
                    workflow_type=wf_info["workflow_type"],
                    status="active",
                    cron_expression=wf_info["cron_expression"],
                    total_runs=wf_info["total_runs"],
                    success_runs=wf_info["success_runs"],
                    failed_runs=wf_info["failed_runs"],
                    last_run_at=now - timedelta(minutes=12)
                )
                db.add(wf)
                created_workflows.append(wf)
        db.flush()

        # 4. Invoices
        invoices_data = [
            ("INV-2026-001", "Vortex Media Holdings", "finance@vortexmedia.com", 45000.00, 75, 2, 0.0),
            ("INV-2026-002", "Cyberdyne Systems LLC", "billing@cyberdyne.io", 12500.00, 32, 1, 12500.00),
            ("INV-2026-003", "Starlight Aerospace Corp", "ap@starlightcorp.com", 89400.00, 94, 3, 0.0),
            ("INV-2026-004", "Quantum Logistics Group", "accounting@quantumlogistics.net", 6200.00, 18, 0, 6200.00),
            ("INV-2026-005", "Helios Energy Solutions", "payables@heliosenergy.com", 28300.00, 48, 1, 0.0),
            ("INV-2026-006", "OmniCorp International", "disbursements@omnicorp.org", 112000.00, 105, 3, 0.0),
        ]

        for inv_num, cust, email, amount, overdue, stage, rec in invoices_data:
            inv = db.query(Invoice).filter(Invoice.invoice_number == inv_num).first()
            if not inv:
                inv = Invoice(
                    tenant_id=tenant.id,
                    invoice_number=inv_num,
                    customer_name=cust,
                    customer_email=email,
                    amount=amount,
                    days_overdue=overdue,
                    dunning_stage=stage,
                    status="overdue" if rec == 0 else "paid",
                    recovered_amount=rec,
                    issue_date=now - timedelta(days=overdue + 30),
                    due_date=now - timedelta(days=overdue),
                    last_reminder_sent_at=now - timedelta(days=5) if stage > 0 else None
                )
                db.add(inv)
        db.flush()

        # 5. Support Tickets
        tickets_data = [
            ("TICK-1082", "Emma Watson", "emma@acme.com", "Production Payment Gateway API 500 error", "Billing system returning 500 error code on client checkout flow since 20 mins ago.", "outage", "furious", "critical", -15),
            ("TICK-1083", "David Kim", "david@fintech.io", "Requesting volume tier discount setup", "We are scaling to 500k monthly events and would like to review enterprise pricing.", "billing", "positive", "medium", 120),
            ("TICK-1084", "Liam O'Connor", "liam@cloudmesh.com", "OAuth SSO token refresh intermittent timeout", "Users logging in via Okta occasionally experience a 10-second hang.", "technical", "negative", "high", 45),
        ]

        for t_num, cust, email, sub, body, cat, sent, prio, sla_mins in tickets_data:
            tick = db.query(SupportTicket).filter(SupportTicket.ticket_number == t_num).first()
            if not tick:
                tick = SupportTicket(
                    tenant_id=tenant.id,
                    ticket_number=t_num,
                    customer_name=cust,
                    customer_email=email,
                    subject=sub,
                    body=body,
                    category=cat,
                    sentiment=sent,
                    priority=prio,
                    status="open",
                    sla_deadline=now + timedelta(minutes=sla_mins),
                    is_sla_breached=(sla_mins < 0),
                    ai_suggested_reply=f"Dear {cust}, our incident engineering team has acknowledged the issue and is deploying a hotfix.",
                    ai_confidence=94.0
                )
                db.add(tick)
        db.flush()

        # 6. Candidate Applications
        candidates_data = [
            ("Elena Rostova", "elena@devtalent.com", "Senior Backend Platform Architect", 8.5, ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis", "Distributed Systems"], 96.0, 95.0, "low", "fast_track"),
            ("Marcus Thorne", "marcus@codehub.io", "Fullstack AI Engineer", 5.0, ["Python", "React", "Next.js", "LangChain", "FastAPI"], 88.5, 90.0, "low", "interview"),
            ("Devon Riley", "devon@techhire.org", "Junior Backend Developer", 1.5, ["Python", "Flask", "SQLite"], 62.0, 55.0, "medium", "review"),
        ]

        for name, email, title, exp, skills, score, match, risk, rec in candidates_data:
            cand = db.query(CandidateApplication).filter(CandidateApplication.candidate_name == name).first()
            if not cand:
                cand = CandidateApplication(
                    tenant_id=tenant.id,
                    candidate_name=name,
                    candidate_email=email,
                    job_title=title,
                    years_experience=exp,
                    skills=skills,
                    resume_text=f"Experienced {title} with over {exp} years building resilient software architectures.",
                    overall_score=score,
                    skills_match_score=match,
                    risk_level=risk,
                    recommendation=rec,
                    ai_analysis_summary=f"Strong match for {title}. Candidate demonstrates mastery in {', '.join(skills[:3])}.",
                    status="screened"
                )
                db.add(cand)
        db.flush()

        # 7. AI Decisions
        decisions_data = [
            {
                "domain": "dunning",
                "entity_id": "INV-2026-001",
                "confidence_score": 84.5,
                "status": "pending_review",
                "input_data": {"invoice_number": "INV-2026-001", "amount": 45000.00, "days_overdue": 75},
                "ai_response": {
                    "decision": "send_reminder",
                    "severity_level": "final_demand",
                    "recommended_action": "Issue formal overdue notice and account hold warning",
                    "reasoning": "Aged receivables exceeding 75 days. Requires manager authorization before dispatching notice."
                },
                "verification_passed": True,
                "reasoning_summary": "High-value invoice ($45k) at 75 days overdue requires manager verification."
            },
            {
                "domain": "support",
                "entity_id": "TICK-1082",
                "confidence_score": 96.2,
                "status": "auto_approved",
                "input_data": {"ticket_number": "TICK-1082", "subject": "Payment API 500 error", "priority": "critical"},
                "ai_response": {
                    "decision": "trigger_jira_incident",
                    "priority": "critical",
                    "sentiment": "furious",
                    "recommended_action": "Trigger P1 Jira Incident and page on-call lead",
                    "reasoning": "Detected production outage keywords impacting payment processing flow."
                },
                "verification_passed": True,
                "reasoning_summary": "Autonomous action triggered: P1 Incident escalated immediately to on-call duty."
            },
            {
                "domain": "recruitment",
                "entity_id": "Elena Rostova",
                "confidence_score": 98.0,
                "status": "auto_approved",
                "input_data": {"candidate_name": "Elena Rostova", "score": 96.0},
                "ai_response": {
                    "decision": "fast_track_interview",
                    "recommendation": "fast_track",
                    "reasoning": "Exceptional skill match and 8.5 years senior platform experience."
                },
                "verification_passed": True,
                "reasoning_summary": "Autonomous candidate shortlist approved."
            }
        ]

        for d in decisions_data:
            existing = db.query(AIDecision).filter(AIDecision.entity_id == d["entity_id"]).first()
            if not existing:
                dec = AIDecision(
                    tenant_id=tenant.id,
                    domain=d["domain"],
                    entity_id=d["entity_id"],
                    model_provider="automata-gateway",
                    model_name="gemini-2.5-flash",
                    input_data=d["input_data"],
                    ai_response=d["ai_response"],
                    confidence_score=d["confidence_score"],
                    status=d["status"],
                    verification_passed=d["verification_passed"],
                    reasoning_summary=d["reasoning_summary"],
                    latency_ms=124.5
                )
                db.add(dec)
        db.flush()

        # 8. Escalations
        escalations_data = [
            ("SLA Breach: Ticket #TICK-1082 (Payment API Outage)", "Payment API returning 500 errors. Breached 15m response target.", "sla_breach", "critical", "open", 2, "OPS-8912", "On-Call Engineering Lead"),
            ("Aging Overdue: Invoice INV-2026-006 OmniCorp ($112,000)", "Overdue by 105 days. Legal escalation tier recommended.", "invoice_overdue", "critical", "in_progress", 3, "OPS-7721", "Finance Controller"),
            ("AI Confidence Threshold Alert: Contract Review", "Model confidence scored 72% due to ambiguous indemnification clause.", "ai_low_confidence", "medium", "open", 1, None, "Legal Counsel"),
        ]

        for title, desc, src, prio, st, tier, jira, assignee in escalations_data:
            esc = db.query(Escalation).filter(Escalation.title == title).first()
            if not esc:
                esc = Escalation(
                    tenant_id=tenant.id,
                    title=title,
                    description=desc,
                    source=src,
                    priority=prio,
                    status=st,
                    escalation_tier=tier,
                    jira_issue_key=jira,
                    assigned_to=assignee,
                    sla_deadline=now + timedelta(hours=2)
                )
                db.add(esc)
        db.flush()

        # 9. Audit Logs
        audit_events = [
            ("workflow.executed", "system", "dunning_watcher", "workflow", "wf-01", {"status": "success", "processed_records": 12}),
            ("ai_decision.evaluated", "ai_agent", "gemini-2.5-flash", "ai_decision", "dec-01", {"confidence": 96.2, "action": "auto_approved"}),
            ("escalation.created", "system", "sentinel_watcher", "escalation", "esc-01", {"priority": "critical", "tier": 2}),
            ("user.login", "user", "admin@automatai.com", "user", "usr-admin", {"ip": "127.0.0.1", "status": "authenticated"}),
        ]

        for act, act_type, act_id, ent_type, ent_id, payload in audit_events:
            audit = AuditLog(
                tenant_id=tenant.id,
                action=act,
                actor_type=act_type,
                actor_id=act_id,
                entity_type=ent_type,
                entity_id=ent_id,
                payload=payload,
                ip_address="127.0.0.1"
            )
            db.add(audit)

        db.commit()
        print("[Seed] ✅ Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"[Seed] ❌ Seeding error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
