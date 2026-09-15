# AutomataIQ - System Architecture & Technical Specification

## 1. Overview
AutomataIQ is an enterprise autonomous operations platform designed to eliminate repetitive operational deadlocks across **Accounts Receivable / Dunning**, **Recruitment Applicant Screening**, and **Customer Support SLA Sentinel Triage**.

The platform is constructed on a 5-step operational pattern:
1. **Continuous Business Process Monitoring**: Background Sentinel Cron (Engine 1) queries ERP, CRM, and Helpdesk data streams.
2. **Problem Detection & Anomaly Classification**: Identifies aging receivables (>30/60/90 days), tickets nearing SLA breach (<15m), and pending tasks.
3. **Multi-Model AI Reasoning**: Model Gateway dispatches domain context to Google Gemini 2.5, OpenAI GPT-4o, Anthropic Claude, or local mock engines.
4. **Deterministic Verification Layer**: Enforces non-negotiable enterprise constraints (discount limits, prohibited language, compliance policies, mandatory outage escalations).
5. **Calibrated Action Execution & Multi-Tier Escalation**: Autonomous execution for confidence $\ge 95\%$, Manager review queue for $80\text{--}94\%$, and mandatory operator triage for $<80\%$.

---

## 2. Core Automation Engines

### Engine 1: Deadline Sentinel & Business Rules Watcher
- Periodically polls database models (Invoices, Support Tickets, Workflows).
- Classifies aging severity and triggers proactive alerts before customer SLA penalties.

### Engine 2: Multi-Tier Escalation Manager
- Enforces an automated progression matrix:
  - **Tier 1 (Operator)**: Handled within 60 minutes.
  - **Tier 2 (Manager)**: Auto-creates Jira issue and posts interactive Block Kit card to Slack.
  - **Tier 3 (Executive / VP)**: Direct paging for critical outages.

### Engine 3: Autonomous AI Decision & Verification Coordinator
- Ties together the AI reasoner, deterministic validator, confidence scoring matrix, execution router, and immutable audit logger.

---

## 3. Database Schema Design

- `users` & `tenants`: Multi-tenant organization boundaries and RBAC (`admin`, `manager`, `operator`, `auditor`, `viewer`).
- `workflows`, `workflow_executions`, `workflow_steps`: Execution tree and latency metrics.
- `ai_decisions`: Stores input payload, AI output, reasoning trace, confidence score, verification checks, and human review status.
- `audit_logs`: Append-only, tamper-evident ledger tracking every actor, action, and payload diff.
- `escalations`: Source, priority (`critical`, `high`, `medium`, `low`), tier, SLA deadline, and Jira/Slack references.
- `invoices`, `support_tickets`, `candidate_applications`: Specialized business entities.
