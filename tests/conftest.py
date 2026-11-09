import pytest
import pytest_asyncio
import httpx
import os
import sys
import time
import subprocess
from dotenv import load_dotenv

load_dotenv()

EXPRESS_PORT = int(os.getenv("PORT", "5000"))
AI_SERVICE_PORT = int(os.getenv("AI_SERVICE_PORT", "8000"))

EXPRESS_BASE_URL = f"http://127.0.0.1:{EXPRESS_PORT}"
AI_SERVICE_BASE_URL = f"http://127.0.0.1:{AI_SERVICE_PORT}"

@pytest.fixture(scope="session", autouse=True)
def manage_servers():
    """
    Session fixture that ensures both Express.js and FastAPI servers
    are running during the test suite execution.
    """
    express_proc = None
    ai_proc = None

    # Check if Express is already running
    try:
        r = httpx.get(f"{EXPRESS_BASE_URL}/api/health", timeout=1.0)
        express_running = r.status_code == 200
    except Exception:
        express_running = False

    if not express_running:
        server_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "server"))
        express_proc = subprocess.Popen(
            ["node", "src/server.js"],
            cwd=server_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        # Wait for Express to bind port
        for _ in range(25):
            try:
                r = httpx.get(f"{EXPRESS_BASE_URL}/api/health", timeout=0.5)
                if r.status_code == 200:
                    break
            except Exception:
                time.sleep(0.2)

    # Check if Python AI service is already running
    try:
        r = httpx.get(f"{AI_SERVICE_BASE_URL}/health", timeout=1.0)
        ai_running = r.status_code == 200
    except Exception:
        ai_running = False

    if not ai_running:
        ai_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ai-service"))
        ai_proc = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", str(AI_SERVICE_PORT)],
            cwd=ai_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        # Wait for FastAPI to bind port
        for _ in range(25):
            try:
                r = httpx.get(f"{AI_SERVICE_BASE_URL}/health", timeout=0.5)
                if r.status_code == 200:
                    break
            except Exception:
                time.sleep(0.2)

    yield

    # Teardown processes if spawned by this fixture
    if express_proc:
        express_proc.terminate()
        try:
            express_proc.wait(timeout=2)
        except Exception:
            express_proc.kill()

    if ai_proc:
        ai_proc.terminate()
        try:
            ai_proc.wait(timeout=2)
        except Exception:
            ai_proc.kill()

@pytest_asyncio.fixture
async def express_client():
    """Async HTTP client fixture targeting Express.js Backend."""
    async with httpx.AsyncClient(base_url=EXPRESS_BASE_URL, timeout=10.0) as client:
        yield client

@pytest_asyncio.fixture
async def ai_client():
    """Async HTTP client fixture targeting Python FastAPI Service."""
    async with httpx.AsyncClient(base_url=AI_SERVICE_BASE_URL, timeout=10.0) as client:
        yield client
