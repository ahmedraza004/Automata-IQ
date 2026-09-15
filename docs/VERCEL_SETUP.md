# Deploying AutomataIQ Frontend to Vercel

AutomataIQ's Next.js frontend is pre-configured for seamless 1-click deployment to [Vercel](https://vercel.com).

---

## 🚀 Option 1: Direct GitHub Repository Import (Recommended)

1. Push your repository to **GitHub**.
2. Log in to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
3. Select your `business-automation` repository.
4. Configure the project settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend` (or leave default if deploying monorepo root — `vercel.json` will handle it automatically)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Under **Environment Variables**, add:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://your-backend-url.com` | URL of your deployed FastAPI backend (e.g. on Railway, Render, Fly.io, or AWS) |
   | `NEXT_PUBLIC_WS_URL` | `wss://your-backend-url.com` | Secure WebSocket endpoint for live broadcasting |

6. Click **Deploy**.

---

## ⚡ Option 2: Deploying via Vercel CLI

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Navigate to frontend directory
cd frontend

# 3. Deploy
vercel
```

---

## 🌐 Deploying the FastAPI Backend to Cloud (Railway / Render / Fly.io)

Since Vercel is designed for Node/Frontend/Serverless, the continuous Python FastAPI backend (with WebSocket streaming & APScheduler Sentinel) can be deployed to:

### A. Railway (1-Click)
1. In Railway, click **"New Project"** -> **"Deploy from GitHub repo"**.
2. Set Root Directory to `backend`.
3. Railway automatically detects `requirements.txt` and `Dockerfile`.
4. Add environment variables from `.env.example`.

### B. Render
1. Create a **New Web Service**.
2. Connect your repo and set Root Directory to `backend`.
3. Set Build Command to `pip install -r requirements.txt`.
4. Set Start Command to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
