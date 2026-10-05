import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.db.session import Base, get_db
from app.services.ai.service import AIService

# Test SQLite in-memory database shared across threads
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all schema tables on the test engine
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_create_and_get_lead():
    payload = {
        "name": "Sarah Connor",
        "company": "Cyberdyne Systems",
        "email": "sconnor@cyberdyne.org",
        "job_title": "Security Lead",
        "notes": "Discussed network security defense and automated alerts.",
        "priority": "High",
        "lead_score": 85,
        "follow_up_status": "Pending"
    }
    response = client.post("/api/leads", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Sarah Connor"
    assert data["company"] == "Cyberdyne Systems"
    lead_id = data["id"]

    # Retrieve lead
    get_res = client.get(f"/api/leads/{lead_id}")
    assert get_res.status_code == 200
    assert get_res.json()["email"] == "sconnor@cyberdyne.org"


def test_duplicate_detection():
    # Duplicate check for the lead created above
    dup_res = client.post("/api/leads/check-duplicate", json={
        "email": "sconnor@cyberdyne.org",
        "name": "Sarah Connor",
        "company": "Cyberdyne Systems"
    })
    assert dup_res.status_code == 200
    dup_data = dup_res.json()
    assert dup_data["is_duplicate"] is True
    assert len(dup_data["matches"]) > 0


def test_update_and_delete_lead():
    # Create
    create_res = client.post("/api/leads", json={
        "name": "John Matrix",
        "company": "Val Verde Corp",
        "email": "jmatrix@valverde.com",
        "notes": "Special ops logistics inquiry"
    })
    lead_id = create_res.json()["id"]

    # Update
    patch_res = client.patch(f"/api/leads/{lead_id}", json={
        "priority": "High",
        "lead_score": 90
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["priority"] == "High"
    assert patch_res.json()["lead_score"] == 90

    # Delete
    del_res = client.delete(f"/api/leads/{lead_id}")
    assert del_res.status_code == 204

    # Verify deleted
    verify_res = client.get(f"/api/leads/{lead_id}")
    assert verify_res.status_code == 404


def test_ai_fallback_services_without_api_key(monkeypatch):
    from app.services.ai.client import gemini_client
    # Explicitly mock gemini_client.generate_json to return None to test heuristic fallbacks
    monkeypatch.setattr(gemini_client, "generate_json", lambda prompt: None)

    notes = "Met Rajesh at DevCon. He leads a team of 20 and requested pricing by next Friday."
    summary = AIService.summarize(notes, lead_name="Rajesh", company="TechCorp")
    assert summary.summary is not None
    assert len(summary.key_interests) > 0

    follow_up = AIService.generate_followup("Rajesh", "TechCorp", notes=notes)
    assert follow_up.subject is not None
    assert "Rajesh" in follow_up.body

    score_result = AIService.score_lead(notes=notes, lead_name="Rajesh", company="TechCorp")
    assert 0 <= score_result.score <= 100
    assert score_result.priority in ["High", "Medium", "Low"]


def test_search_and_filters():
    # Verify search query filtering works
    res_search = client.get("/api/leads?search=Cyberdyne")
    assert res_search.status_code == 200
    items = res_search.json()["items"]
    assert any("Cyberdyne" in item["company"] for item in items)
