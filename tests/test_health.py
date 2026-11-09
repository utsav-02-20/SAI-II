import pytest

@pytest.mark.asyncio
async def test_express_health_check(express_client):
    """
    Validates Express.js API health check endpoint.
    Verifies that pure JavaScript Express server is running, responsive,
    and reporting status: ok.
    """
    response = await express_client.get("/api/health")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "arogya-ai-express-api"
    assert "runtime" in data
    assert "timestamp" in data
    assert "uptimeSeconds" in data

@pytest.mark.asyncio
async def test_express_root_endpoint(express_client):
    """Validates the root introductory message on the Express API."""
    response = await express_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data

@pytest.mark.asyncio
async def test_fastapi_health_check(ai_client):
    """
    Validates Python FastAPI microservice health check endpoint.
    Verifies that the AI engine is online and reporting expected capabilities.
    """
    response = await ai_client.get("/health")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "online"
    assert data["service"] == "arogya-ai-python-service"
    assert "capabilities" in data
    assert isinstance(data["capabilities"], list)
    assert "xgboost_risk_prediction" in data["capabilities"]
