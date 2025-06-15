import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from fastapi import HTTPException

@pytest.mark.filterwarnings("ignore:multipart:PendingDeprecationWarning")
@pytest.mark.asyncio
async def test_analyze_code_success():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/analyze-code", json={
            "code": "def factorial(n):\n    if n == 0:\n        return 1\n    else:\n        return n * factorial(n-1)"
        })
    assert response.status_code == 200
    assert "analysis" in response.json()

@pytest.mark.asyncio
async def test_analyze_code_empty_snippet():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/analyze-code", json={
            "code": ""
        })
    assert response.status_code == 200
    response_json = response.json()
    assert response_json.get("analysis") == "It seems like you haven't provided the code yet. Please paste the code you'd like me to analyze, and I'll do my best to:\n\n1. Explain how the code works\n2. Identify potential bugs or areas for improvement\n3. Suggest optimizations to make the code more efficient, readable, or maintainable\n\nPlease paste the code, and I'll get started!"

@pytest.mark.asyncio
async def test_analyze_code_missing_snippet_field():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/analyze-code", json={})
    assert response.status_code == 422  # Unprocessable Entity for validation error

@pytest.mark.asyncio
async def test_analyze_code_empty_snippet_response():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/analyze-code", json={"code": ""})
    assert response.status_code == 200
    assert "analysis" in response.json()
    assert "execution_time" in response.json()
    expected_message_part = "It seems like you haven't provided the code yet."
    assert expected_message_part in response.json()["analysis"]

# You would need to mock the external API call for a true unit test
# For integration testing, you might allow this to hit the actual API (with caution)
# @pytest.mark.asyncio
# async def test_analyze_code_api_error_mocked():
#     # This test would require mocking httpx.post to simulate an API error
#     pass

@pytest.mark.asyncio
async def test_analyze_code_gdpr_compliance():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/analyze-code", json={
            "code": "user_data = {'name': 'John Doe', 'email': 'john.doe@example.com', 'password': 'hardcoded_password'}\n\
print(user_data)"
        })
    assert response.status_code == 200
    analysis = response.json().get("analysis", "").lower()
    assert "gdpr" in analysis or "data privacy" in analysis or "sensitive data" in analysis or "hardcoded" in analysis

@pytest.mark.asyncio
async def test_analyze_code_soc2_iso27001_compliance():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/analyze-code", json={
            "code": "import logging\nlogging.basicConfig(level=logging.DEBUG)\nlogging.debug('User logged in: %s' % username)"
        })
    assert response.status_code == 200
    analysis = response.json().get("analysis", "").lower()
    assert "soc2" in analysis or "iso27001" in analysis or "logging" in analysis or "access control" in analysis or "security controls" in analysis