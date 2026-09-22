import os
os.environ["DEMO_MODE"] = "true"
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


def test_ask_demo_mode():
    response = client.post("/api/ask", json={"question":"What is caching?","role":"helpful_tutor","style":"beginner","use_few_shot":True})
    assert response.status_code == 200
    assert response.json()["mode"] == "demo"
