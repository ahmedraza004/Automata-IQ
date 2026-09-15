import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.core.telemetry import HTTP_REQUESTS_TOTAL, HTTP_REQUEST_DURATION_SECONDS
from app.api.v1 import api_v1_router
from app.api.websocket import ws_manager
from app.seed import seed_database
from app.services.engines.sentinel_watcher import DeadlineSentinelWatcher

scheduler = BackgroundScheduler()


def run_scheduled_sentinel_job():
    try:
        db = SessionLocal()
        DeadlineSentinelWatcher.scan_all_deadlines(db)
        db.close()
    except Exception as e:
        print(f"[Scheduler] Sentinel scan job error: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"[AutomataIQ] Starting {settings.APP_NAME} v{settings.APP_VERSION}...")
    # Initialize DB schema & seed default enterprise dataset
    try:
        seed_database()
    except Exception as e:
        print(f"[AutomataIQ] Seed initialization notice: {e}")

    # Start background scheduler (Sentinel runs every 10 minutes)
    try:
        scheduler.add_job(run_scheduled_sentinel_job, "interval", minutes=10, id="sentinel_watcher_job")
        scheduler.start()
        print("[AutomataIQ] Background Sentinel Scheduler started.")
    except Exception as e:
        print(f"[AutomataIQ] Scheduler start notice: {e}")

    yield

    # Shutdown
    if scheduler.running:
        scheduler.shutdown()
    print("[AutomataIQ] Engine shutdown complete.")


app = FastAPI(
    title=f"{settings.APP_NAME} - Autonomous Operations & AI Decision Verification Platform",
    description="Enterprise API for continuous business process monitoring, multi-model AI reasoning, deterministic verification guardrails, and human-in-the-loop governance.",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open in dev for smooth client connectivity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def telemetry_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time

    # Record Prometheus metrics
    try:
        endpoint = request.url.path
        HTTP_REQUESTS_TOTAL.labels(
            method=request.method,
            endpoint=endpoint,
            status_code=response.status_code
        ).inc()
        HTTP_REQUEST_DURATION_SECONDS.labels(
            method=request.method,
            endpoint=endpoint
        ).observe(duration)
    except Exception:
        pass

    return response


# WebSocket real-time endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Echo or heartbeat
            data = await websocket.receive_text()
            await websocket.send_text(f'{{"type": "PONG", "received": "{data}"}}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


# Mount API Routers
app.include_router(api_v1_router)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "active_ws_clients": len(ws_manager.active_connections)
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} Autonomous AI Operations Platform",
        "documentation": "/docs",
        "health": "/health",
        "api_v1": "/api/v1"
    }
