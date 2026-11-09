import pytest
import uuid

@pytest.mark.asyncio
async def test_duplicate_medication_detection(express_client):
    """
    Verifies that entering multiple medicines sharing the same active ingredient
    (e.g. Dolo 650 and Combiflam both containing Paracetamol) triggers an active
    overdose/hepatotoxicity warning.
    """
    payload = {
        "medicines": ["Dolo 650", "Combiflam"]
    }
    response = await express_client.post("/api/medicines/analyze", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    assert data["success"] is True
    assert data["summary"]["hasHighRiskWarnings"] is True
    assert data["summary"]["duplicateCount"] >= 1
    
    # Verify duplicate ingredient details
    duplicate = data["duplicateWarnings"][0]
    assert "Paracetamol" in duplicate["ingredient"]
    assert duplicate["severity"] == "HIGH_TOXICITY_RISK"
    assert any("Dolo" in m for m in duplicate["involvedMedicines"])
    assert any("Combiflam" in m for m in duplicate["involvedMedicines"])
    assert duplicate["totalStrengthMg"] > 650

@pytest.mark.asyncio
async def test_severe_drug_interaction_aspirin_warfarin(express_client):
    """
    Verifies that the high-risk bleeding interaction between Aspirin and Warfarin
    is detected with verified source attribution (OpenFDA / RxNav).
    """
    payload = {
        "medicines": ["Aspirin", "Warfarin"]
    }
    response = await express_client.post("/api/medicines/analyze", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    assert data["summary"]["interactionCount"] >= 1
    
    # Verify interaction severity and evidence
    interaction = data["detectedInteractions"][0]
    assert interaction["severity"] == "HIGH"
    assert "Bleeding" in interaction["title"] or "Hemorrhage" in interaction["title"]
    assert any("Aspirin" in p for p in interaction["pair"])
    assert any("Warfarin" in p for p in interaction["pair"])
    assert "verifiedSource" in interaction

@pytest.mark.asyncio
async def test_patient_allergy_contraindication_crosscheck(express_client):
    """
    Verifies that when an authenticated patient with a recorded Penicillin allergy
    enters Augmentin (Amoxicillin + Clavulanate), the engine cross-references their
    profile and raises a critical allergy contraindication alert.
    """
    # 1. Register patient with Penicillin allergy
    email = f"allergy_test_{uuid.uuid4().hex[:8]}@example.com"
    reg = await express_client.post("/api/auth/register", json={
        "email": email,
        "password": "Password123!",
        "firstName": "Sneha",
        "lastName": "Rao",
        "role": "PATIENT"
    })
    token = reg.json()["data"]["tokens"]["accessToken"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Record allergy in clinical profile
    await express_client.put("/api/patient/profile", json={
        "allergies": ["Penicillin"]
    }, headers=headers)

    # 3. Analyze Augmentin 625 (Penicillin class)
    res = await express_client.post("/api/medicines/analyze", json={
        "medicines": ["Augmentin 625"]
    }, headers=headers)
    assert res.status_code == 200
    
    data = res.json()
    assert data["summary"]["allergyWarningCount"] >= 1
    
    warning = data["allergyWarnings"][0]
    assert warning["severity"] == "CRITICAL_ALLERGY_CONTRAINDICATION"
    assert "Penicillin" in warning["allergyMatch"]
    assert "anaphylaxis" in warning["message"].lower()

@pytest.mark.asyncio
async def test_food_interaction_atorvastatin_grapefruit(express_client):
    """
    Verifies that Atorvastatin returns the clinically critical Grapefruit juice
    food-drug interaction warning.
    """
    payload = {
        "medicines": ["Atorvastatin"]
    }
    response = await express_client.post("/api/medicines/analyze", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    med_profile = data["individualMedicines"][0]
    assert "Atorvastatin" in med_profile["brand"]
    
    # Check food interaction text
    food_text = " ".join(med_profile["foodInteractions"]).lower()
    assert "grapefruit" in food_text
    assert "timingInstructions" in med_profile

@pytest.mark.asyncio
async def test_safe_drug_combination_no_false_positives(express_client):
    """
    Verifies that a safe, standard clinical combination (Metformin + Atorvastatin)
    does not trigger false positive high-risk warnings or duplicate alarms.
    """
    payload = {
        "medicines": ["Metformin", "Atorvastatin"]
    }
    response = await express_client.post("/api/medicines/analyze", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["summary"]["hasHighRiskWarnings"] is False
    assert len(data["duplicateWarnings"]) == 0

@pytest.mark.asyncio
async def test_medicine_search_autocomplete(express_client):
    """Verifies medicine catalog search and autocomplete functionality."""
    response = await express_client.get("/api/medicines/search?q=dolo")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] >= 1
    assert any("Dolo" in r["brand"] for r in data["results"])
