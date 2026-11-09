import pytest

@pytest.mark.asyncio
async def test_start_triage_fever_first_question(express_client):
    """
    Verifies initialization of adaptive clinical triage for fever & headache.
    System must return the first next best discriminator question in English & Hindi.
    """
    payload = {
        "chiefComplaint": "I have had fever and severe headache since yesterday",
        "language": "en"
    }

    response = await express_client.post("/api/triage/start", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    assert data["success"] is True
    session = data["session"]
    
    assert session["treeKey"] == "fever"
    assert session["currentQuestionIndex"] == 0
    assert "nextQuestion" in session
    assert "text" in session["nextQuestion"]
    assert "textHi" in session["nextQuestion"]
    assert len(session["nextQuestion"]["options"]) >= 2
    
    # Differential candidates list must be populated
    assert len(session["differentialCandidates"]) >= 3
    candidate_names = [c["name"] for c in session["differentialCandidates"]]
    assert any("Dengue" in name for name in candidate_names)
    assert any("Malaria" in name for name in candidate_names)

@pytest.mark.asyncio
async def test_multi_turn_triage_progression(express_client):
    """
    Verifies that providing an answer advances the triage interview to the
    subsequent discriminator question.
    """
    # 1. Start session
    start_res = await express_client.post("/api/triage/start", json={"chiefComplaint": "fever"})
    assert start_res.status_code == 200
    session = start_res.json()["session"]

    # 2. Answer question 1
    next_payload = {
        "treeKey": session["treeKey"],
        "currentQuestionIndex": 0,
        "answer": "Yes, periodic intense shivering chills",
        "history": []
    }
    next_res = await express_client.post("/api/triage/next", json=next_payload)
    assert next_res.status_code == 200
    
    data = next_res.json()
    assert data["success"] is True
    assert data["currentQuestionIndex"] == 1
    assert "nextQuestion" in data
    assert len(data["history"]) == 1

@pytest.mark.asyncio
async def test_triage_completion_and_sbar_generation(express_client):
    """
    Verifies that completing all targeted questions produces a structured
    clinical SBAR summary and specialty recommendation.
    """
    # Simulate final question in the fever tree
    final_payload = {
        "treeKey": "fever",
        "currentQuestionIndex": 3,  # last question
        "answer": "Yes, mild sore throat and sneezing",
        "history": [
            {"questionId": "q_chills", "question": "Chills?", "answer": "No"},
            {"questionId": "q_retro_orbital", "question": "Eye pain?", "answer": "Mild"},
            {"questionId": "q_neck_stiffness", "question": "Neck stiffness?", "answer": "No"}
        ]
    }

    response = await express_client.post("/api/triage/next", json=final_payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    assert data["isComplete"] is True
    assert "sbarSummary" in data
    
    sbar = data["sbarSummary"]
    assert "situation" in sbar
    assert "background" in sbar
    assert "assessment" in sbar
    assert "recommendation" in sbar
    assert "recommendedSpecialty" in data
    assert "Physician" in data["recommendedSpecialty"]

@pytest.mark.asyncio
async def test_triage_emergency_escalation_neck_stiffness(express_client):
    """
    Verifies that answering affirmative to acute meningitis neck stiffness
    immediately aborts routine triage and triggers the Emergency Red-Flag alert.
    """
    emergency_trigger_payload = {
        "treeKey": "fever",
        "currentQuestionIndex": 2,  # q_neck_stiffness
        "answer": "Yes, severe neck stiffness cannot touch chin to chest",
        "history": []
    }

    response = await express_client.post("/api/triage/next", json=emergency_trigger_payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["isEmergency"] is True
    assert data["category"] == "CRITICAL_TRIAGE_ESCALATION"
    assert "Meningitis" in data["title"]
    assert "108" in " ".join(data["emergencyHotlines"])

@pytest.mark.asyncio
async def test_vision_symptom_screening_skin_rash(express_client):
    """
    Verifies image-based visual symptom analysis for dermatological lesions.
    """
    payload = {
        "imageType": "skin_rash",
        "description": "Red itchy circular rash on forearm with raised edges"
    }

    response = await express_client.post("/api/triage/analyze-image", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    analysis = data["analysis"]
    
    assert analysis["screenedCategory"] == "DERMATOLOGY"
    assert len(analysis["possibleConditions"]) >= 2
    assert "Dermatologist" in analysis["recommendedSpecialty"]
    assert "calibrationNote" in analysis

@pytest.mark.asyncio
async def test_vision_symptom_screening_eye_redness(express_client):
    """
    Verifies visual screening for ophthalmological conjunctival conditions.
    """
    payload = {
        "imageType": "eye_redness",
        "description": "Right eye conjunctival redness with watery discharge"
    }

    response = await express_client.post("/api/triage/analyze-image", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    analysis = data["analysis"]
    assert analysis["screenedCategory"] == "OPHTHALMOLOGY"
    assert any("Conjunctivitis" in c["condition"] for c in analysis["possibleConditions"])
    assert "Ophthalmologist" in analysis["recommendedSpecialty"]
