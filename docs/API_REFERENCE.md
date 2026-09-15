# AutomataIQ - REST & WebSocket API Reference

The backend exposes a full OpenAPI / Swagger documentation suite accessible at `http://localhost:8000/docs`.

## Base URL
- Development: `http://localhost:8000/api/v1`
- WebSocket Endpoint: `ws://localhost:8000/ws`

---

## Key Endpoint Groups

### 1. Authentication (`/api/v1/auth`)
- `POST /register`: Create a new user with tenant association.
- `POST /login`: Authenticate and receive JWT access & refresh tokens.
- `POST /refresh`: Refresh access token.
- `GET /me`: Fetch authenticated user profile.

### 2. Workflows (`/api/v1/workflows`)
- `GET /`: List all workflows and execution stats.
- `POST /`: Create custom workflow.
- `GET /{id}`: Retrieve workflow details.
- `GET /{id}/executions`: List recent run executions with duration and step logs.

### 3. AI Decisions & Verification (`/api/v1/decisions`)
- `GET /`: Query AI decisions with filters (`domain`, `status`, `min_confidence`).
- `GET /{id}`: Detailed view of prompt used, reasoning trace, and verification checks.
- `POST /{id}/review`: Human-in-the-Loop review (`approve`, `reject`, `escalate`).
- `GET /prompts/list`: Retrieve prompt templates and active versions.

### 4. SLA Escalations (`/api/v1/escalations`)
- `GET /`: List active escalations filtered by priority and tier.
- `PATCH /{id}`: Update status, reassignment, or resolution summary.
- `POST /process-sla-breaches`: Manually trigger SLA breach watchdog.

### 5. Audit & Compliance (`/api/v1/audit`)
- `GET /`: Filter audit log ledger by action, actor, entity, date range.
- `GET /export/csv`: Stream download full audit ledger in CSV format.

### 6. Live Simulation Studio (`/api/v1/simulation`)
- `POST /dunning/evaluate`: Run instant aging risk evaluation on an invoice.
- `POST /recruitment/screen`: Run AI candidate screening and skill matrix parsing.
- `POST /support/triage`: Triage support ticket, sentiment, and draft resolution.
- `POST /sentinel/scan-deadlines`: Execute global Sentinel business rule scan.

### 7. Telemetry & Metrics (`/api/v1/metrics`)
- `GET /dashboard-kpis`: Aggregated live KPIs for dashboard cards.
- `GET /charts-data`: 7-day throughput, confidence tiering, and recovery trends.
- `GET /prometheus`: Standard Prometheus metrics scraping endpoint.
