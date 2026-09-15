# AutomataIQ - Autonomous AI Operations & Decision Verification Platform

AutomataIQ is an enterprise-grade autonomous operations and verification platform that transforms manual business operations into continuous, audited, AI-driven pipelines.

---

## 🌟 Key Features

1. **Continuous Business Process Monitoring**:
   - Background **Sentinel Watchers** continuously monitor Accounts Receivable aging, incoming customer tickets, stalled contracts, and recruitment candidates.
2. **Multi-Model AI Reasoning**:
   - Unified Gateway supporting **Google Gemini (gemini-2.5-flash)**, **OpenAI (GPT-4o)**, and **Anthropic (Claude 3.5)** with a built-in neural simulation fallback.
3. **Deterministic Verification Layer**:
   - Enforces hard enterprise policies and compliance guardrails that no LLM can hallucinate past (e.g. maximum discount rules, prohibited language, mandatory outage escalation).
4. **Three-Tier Autonomy & Human-in-the-Loop Routing**:
   - **Score $\ge 95\%$**: Auto-approved and executed autonomously.
   - **Score $80\text{--}94\%$**: Interactive Block Kit cards routed to Manager Slack queue.
   - **Score $< 80\%$**: Mandatory Human Operator Triage.
5. **Zero-Miss Multi-Tier SLA Escalations**:
   - Automatic promotion from **Tier 1 (Operator)** to **Tier 2 (Manager / Jira Incident)** and **Tier 3 (VP / Executive Alert)**.
6. **Immutable Cryptographic Audit Trail**:
   - Full append-only ledger recording all actor actions, AI prompts, decision confidence, before/after diffs, and downloadable as CSV.
7. **Flagship Domain Modules**:
   - **Accounts Receivable / Dunning**: Odoo invoice sync, aging classification, personalized collection notices.
   - **Recruitment & Talent Intelligence**: Resume text extraction, skills matrix matching, candidate risk scoring, and interview question synthesis.
   - **Customer Support SLA Sentinel**: Omnichannel ticket sentiment & urgency triage, verified auto-replies, and Jira incident synchronization.
8. **Interactive Live Simulation Studio**:
   - Sandbox to trigger sample business scenarios and watch the live pipeline execute, verify, and broadcast events via WebSockets in real time.

---

## 🚀 Quickstart Guide

### 1. Launch Backend API
```powershell
# In project root
$env:PYTHONPATH="backend"
python -m uvicorn backend.app.main:app --reload --port 8000
```
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Launch Frontend Dashboard
```powershell
cd frontend
npm run dev
```
- **Dashboard UI**: [http://localhost:3000](http://localhost:3000)
- **Default Credentials**:
  - `admin@automatai.com` / `admin123` (Executive Admin)
  - `manager@automatai.com` / `manager123` (Operations Manager)

### 3. Run Test Suite
```powershell
$env:PYTHONPATH="backend"
python -m pytest backend/tests -v
```

---

## 📦 Deployment Options

### 1. Docker Compose (1-Click Full Stack)
Deploy all containers (PostgreSQL, Redis, FastAPI, Next.js, n8n, Odoo, Prometheus, Grafana):
```bash
docker compose up -d --build
```
👉 Detailed guide: [docs/DOCKER_SETUP.md](docs/DOCKER_SETUP.md)

### 2. Vercel + Cloud Backend (Production SaaS)
- **Frontend on Vercel**: Connect GitHub repository with root `frontend` or root `vercel.json`.
- **Backend on Railway / Render**: Deploy `backend` container / FastAPI service.
👉 Detailed guide: [docs/VERCEL_SETUP.md](docs/VERCEL_SETUP.md)

---

## 📁 Repository Structure

```plaintext
business-automation/
├── backend/                  # FastAPI Application, SQLAlchemy Models, AI Services, Engines
├── frontend/                 # Next.js 14, TypeScript, Tailwind CSS, Recharts Dashboard
├── workflows/                # Reusable n8n JSON Workflow Blueprints
├── infrastructure/           # Prometheus, Grafana, and Nginx configurations
├── docs/                     # ARCHITECTURE.md, API_REFERENCE.md, N8N_SETUP.md, DEPLOYMENT.md, VERCEL_SETUP.md, DOCKER_SETUP.md
├── docker-compose.yml        # Full enterprise stack orchestration
├── vercel.json               # Vercel deployment configuration
├── .env.example              # Environment variables template
└── README.md                 # Project overview and instructions
```
