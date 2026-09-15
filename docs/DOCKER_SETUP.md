# Deploying AutomataIQ with Docker & Docker Compose

The complete multi-service enterprise infrastructure can be deployed on any server, VM, or local workstation using Docker Compose.

---

## 🏗️ Services in the Docker Stack

| Service | Container Name | Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | `automata_frontend` | `3000` | Next.js 14 Production Dashboard |
| **Backend** | `automata_backend` | `8000` | FastAPI Core API, Schedulers & WebSockets |
| **PostgreSQL** | `automata_postgres` | `5432` | Relational Data Store |
| **Redis** | `automata_redis` | `6379` | Fast In-Memory Queue & Cache |
| **n8n** | `automata_n8n` | `5678` | Low-Code Automation Workflow Engine |
| **Odoo ERP** | `automata_odoo` | `8069` | Enterprise ERP (Invoicing & Accounting) |
| **Odoo DB** | `automata_odoo_db` | (internal) | PostgreSQL database for Odoo |
| **Prometheus** | `automata_prometheus` | `9090` | Metrics Collection & Telemetry Scraper |
| **Grafana** | `automata_grafana` | `3001` | Visual Operational Dashboards |

---

## 🚀 1-Command Startup

```bash
# 1. Clone repository & copy environment configuration
cp .env.example .env

# 2. Build and launch all services in detached mode
docker compose up -d --build
```

---

## 🔍 Health Checks & Monitoring

- Check status of running containers:
  ```bash
  docker compose ps
  ```
- View live aggregated logs:
  ```bash
  docker compose logs -f backend
  ```
- Access endpoints:
  - **Dashboard**: [http://localhost:3000](http://localhost:3000)
  - **FastAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
  - **n8n Webhook Engine**: [http://localhost:5678](http://localhost:5678) (`admin` / `admin`)
  - **Odoo ERP**: [http://localhost:8069](http://localhost:8069)
  - **Grafana**: [http://localhost:3001](http://localhost:3001) (`admin` / `admin`)
  - **Prometheus**: [http://localhost:9090](http://localhost:9090)

---

## 🛑 Stopping the Stack

```bash
# Stop all containers (persisting database data in Docker volumes)
docker compose down

# Stop and wipe all persistent volumes (fresh start)
docker compose down -v
```
