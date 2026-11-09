import pytest
import uuid

@pytest.mark.asyncio
async def test_user_registration_success(express_client):
    """Verifies patient registration, password hashing, and token issuance."""
    unique_email = f"patient_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "email": unique_email,
        "password": "Password123!",
        "firstName": "Aditya",
        "lastName": "Kumar",
        "phone": "+919876543210",
        "role": "PATIENT"
    }

    response = await express_client.post("/api/auth/register", json=payload)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    
    data = response.json()
    assert data["success"] is True
    assert "tokens" in data["data"]
    assert "accessToken" in data["data"]["tokens"]
    assert "refreshToken" in data["data"]["tokens"]
    assert data["data"]["user"]["email"] == unique_email.lower()
    assert data["data"]["user"]["role"] == "PATIENT"

@pytest.mark.asyncio
async def test_user_registration_duplicate_email(express_client):
    """Verifies rejection of duplicate email registration."""
    unique_email = f"dup_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "email": unique_email,
        "password": "Password123!",
        "role": "PATIENT"
    }

    # First registration
    res1 = await express_client.post("/api/auth/register", json=payload)
    assert res1.status_code == 201

    # Second registration with same email
    res2 = await express_client.post("/api/auth/register", json=payload)
    assert res2.status_code == 409
    data = res2.json()
    assert data["success"] is False
    assert "already exists" in data["error"]["message"].lower()

@pytest.mark.asyncio
async def test_user_login_success_and_failure(express_client):
    """Verifies login authentication flow with valid and invalid passwords."""
    unique_email = f"login_test_{uuid.uuid4().hex[:8]}@example.com"
    reg_payload = {
        "email": unique_email,
        "password": "CorrectPassword!",
        "role": "PATIENT"
    }
    await express_client.post("/api/auth/register", json=reg_payload)

    # 1. Invalid password
    bad_login = await express_client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

    # 2. Correct password
    good_login = await express_client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "CorrectPassword!"
    })
    assert good_login.status_code == 200
    assert "accessToken" in good_login.json()["data"]["tokens"]

@pytest.mark.asyncio
async def test_protected_patient_profile_crud(express_client):
    """Verifies protected medical profile access, baseline vitals, and allergy updates."""
    # 1. Register & login
    email = f"profile_{uuid.uuid4().hex[:8]}@example.com"
    reg = await express_client.post("/api/auth/register", json={
        "email": email,
        "password": "Password123!",
        "firstName": "Rohan",
        "lastName": "Mehta",
        "role": "PATIENT"
    })
    token = reg.json()["data"]["tokens"]["accessToken"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get baseline profile
    get_res = await express_client.get("/api/patient/profile", headers=headers)
    assert get_res.status_code == 200
    profile = get_res.json()["data"]["profile"]
    assert profile["firstName"] == "Rohan"

    # 3. Update clinical baseline (Allergies + Vitals)
    update_payload = {
        "bloodGroup": "O+",
        "heightCm": 178.0,
        "weightKg": 74.5,
        "allergies": ["Penicillin", "Sulfa drugs"],
        "chronicConditions": ["Hypertension", "Mild Asthma"],
        "emergencyContacts": [
          {"name": "Ananya Mehta", "relationship": "Sister", "phoneNumber": "+919876543999"}
        ]
    }
    put_res = await express_client.put("/api/patient/profile", json=update_payload, headers=headers)
    assert put_res.status_code == 200
    updated_profile = put_res.json()["data"]["profile"]
    assert "Penicillin" in updated_profile["allergies"]
    assert "Hypertension" in updated_profile["chronicConditions"]
    assert updated_profile["bloodGroup"] == "O+"

@pytest.mark.asyncio
async def test_unauthenticated_profile_access_blocked(express_client):
    """Verifies that unauthenticated requests to patient profile return 401."""
    res = await express_client.get("/api/patient/profile")
    assert res.status_code == 401

@pytest.mark.asyncio
async def test_emergency_interceptor_cardiac(express_client):
    """
    Verifies that acute cardiac symptoms instantly trigger the emergency red flag
    with zero chatbot delay.
    """
    res = await express_client.post("/api/emergency/check", json={
        "message": "Doctor please help, I have crushing chest pain radiating to left arm and jaw with cold sweating"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["isEmergency"] is True
    assert data["category"] == "CARDIAC"
    assert "108" in " ".join(data["emergencyHotlines"])

@pytest.mark.asyncio
async def test_emergency_interceptor_stroke_fast(express_client):
    """Verifies detection of acute stroke FAST criteria."""
    res = await express_client.post("/api/emergency/check", json={
        "message": "My father suddenly has facial droop and slurred speech and cannot raise his right arm"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["isEmergency"] is True
    assert data["category"] == "STROKE"

@pytest.mark.asyncio
async def test_emergency_interceptor_anaphylaxis(express_client):
    """Verifies detection of acute anaphylactic allergic shock."""
    res = await express_client.post("/api/emergency/check", json={
        "message": "My throat is closing and lips swelling after eating seafood, gasping for air"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["isEmergency"] is True
    assert data["category"] == "ANAPHYLAXIS"

@pytest.mark.asyncio
async def test_emergency_interceptor_routine_symptom(express_client):
    """Verifies that non-life-threatening symptoms do NOT trigger emergency status."""
    res = await express_client.post("/api/emergency/check", json={
        "message": "I have had a mild dry cough and slight runny nose since yesterday morning."
    })
    assert res.status_code == 200
    data = res.json()
    assert data["isEmergency"] is False
