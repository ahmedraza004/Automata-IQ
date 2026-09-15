import time
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST

# Metrics definitions
HTTP_REQUESTS_TOTAL = Counter(
    "automata_http_requests_total",
    "Total HTTP Requests",
    ["method", "endpoint", "status_code"]
)

HTTP_REQUEST_DURATION_SECONDS = Histogram(
    "automata_http_request_duration_seconds",
    "HTTP Request Latency in Seconds",
    ["method", "endpoint"]
)

AI_DECISIONS_TOTAL = Counter(
    "automata_ai_decisions_total",
    "Total AI Decisions Processed",
    ["domain", "verdict", "model"]
)

AI_CONFIDENCE_SCORE = Histogram(
    "automata_ai_confidence_score",
    "Distribution of AI Confidence Scores",
    buckets=[0, 50, 70, 80, 85, 90, 95, 98, 100]
)

ACTIVE_WORKFLOWS = Gauge(
    "automata_active_workflows",
    "Number of active executing workflows"
)

OPEN_ESCALATIONS = Gauge(
    "automata_open_escalations",
    "Number of currently open escalations",
    ["priority"]
)


def get_prometheus_metrics():
    return generate_latest(), CONTENT_TYPE_LATEST
