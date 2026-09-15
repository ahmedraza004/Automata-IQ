# AutomataIQ - Complete Deployment Guide

This document summarizes the deployment strategies available for AutomataIQ.

---

## Deployment Options Overview

| Deployment Mode | Best For | Prerequisites | Guide |
| :--- | :--- | :--- | :--- |
| **1. Local Standalone Dev** | Rapid development & testing | Python 3.11+, Node 18+ | [Local Setup](#1-local-standalone-mode) |
| **2. Full Docker Compose** | Self-hosted, On-premise, Single VM | Docker & Docker Compose | [DOCKER_SETUP.md](./DOCKER_SETUP.md) |
| **3. Cloud Hybrid (Vercel + Railway/Render)** | Scalable SaaS Production | Vercel & Cloud backend account | [VERCEL_SETUP.md](./VERCEL_SETUP.md) |

---

## 1. Local Standalone Mode

### Backend API
```powershell
# In project root
$env:PYTHONPATH="backend"
python -m uvicorn backend.app.main:app --reload --port 8000
```
- Swagger Docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

### Frontend UI
```powershell
cd frontend
npm run dev
```
- Dashboard: `http://localhost:3000`

---

## 2. Docker Compose Multi-Container Stack

```bash
docker compose up -d --build
```
Deploying:
- **Frontend** (`:3000`)
- **FastAPI** (`:8000`)
- **n8n** (`:5678`)
- **Odoo** (`:8069`)
- **PostgreSQL** (`:5432`)
- **Redis** (`:6379`)
- **Prometheus** (`:9090`)
- **Grafana** (`:3001`)

For full details, see [DOCKER_SETUP.md](./DOCKER_SETUP.md).

---

## 3. Vercel + Cloud Backend

- **Frontend**: Connect GitHub repo to [Vercel](https://vercel.com) with root directory `frontend` and env `NEXT_PUBLIC_API_URL`.
- **Backend**: Connect GitHub repo to [Railway](https://railway.app) or [Render](https://render.com) with root directory `backend`.

For full details, see [VERCEL_SETUP.md](./VERCEL_SETUP.md).
