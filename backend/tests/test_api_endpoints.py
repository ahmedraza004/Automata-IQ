import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "AutomataIQ"


def test_auth_login():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@automatai.com", "password": "admin123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@automatai.com"


def test_get_dashboard_kpis():
    response = client.get("/api/v1/metrics/dashboard-kpis")
    assert response.status_code == 200
    data = response.json()
    assert "active_workflows" in data
    assert "autonomous_execution_rate" in data


def test_dunning_simulation():
    payload = {
        "invoice_number": "INV-TEST-999",
        "customer_name": "Test Enterprise",
        "customer_email": "test@enterprise.com",
        "amount": 12000.0,
        "days_overdue": 35
    }
    response = client.post("/api/v1/simulation/dunning/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "decision" in data
    assert "confidence" in data
    assert data["verification_passed"] is True
