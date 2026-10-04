import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.init_db import init_db


@pytest.mark.asyncio
async def test_health_check_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "CONTRAX"
    assert data["status"] == "OPERATIONAL"


@pytest.mark.asyncio
async def test_auth_registration_and_login():
    await init_db()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        reg_payload = {
            "email": "testauditor@contrax.dev",
            "username": "testauditor",
            "password": "SecurePassword123!",
            "full_name": "Test Security Auditor"
        }
        reg_resp = await ac.post("/api/v1/auth/register", json=reg_payload)
        assert reg_resp.status_code in [200, 400]

        login_payload = {
            "username": "testauditor",
            "password": "SecurePassword123!"
        }
        login_resp = await ac.post("/api/v1/auth/login", json=login_payload)
        assert login_resp.status_code == 200
        token_data = login_resp.json()
        assert "access_token" in token_data
