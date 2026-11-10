"""
Phase 8: Comprehensive End-to-End Clinical Patient Journey & Compliance Integration Test
Validates the complete lifecycle:
1. Patient account registration & JWT authentication.
2. Clinical baseline profile configuration (Allergies & Demographics).
3. Medicine intelligence safety cross-checking (Drug interactions).
4. Diagnostic lab report ingestion & abnormal biomarker evaluation.
5. Adaptive triage diagnostic progression & SBAR generation.
6. Machine learning chronic disease risk evaluation & Biological Health Age.
7. Medication adherence tracking, dose actions & streak progression.
8. Longitudinal symptom frequency replay & clinical escalation triggers.
9. WebRTC doctor teleconsultation room generation & digital e-prescription signing.
10. AES-256-GCM PHI encryption, decryption & HIPAA Safe Harbor de-identification.
"""

import pytest
import httpx
import time

@pytest.mark.asyncio
async def test_full_clinical_e2e_patient_journey(express_client: httpx.AsyncClient):
    """
    Executes a complete 10-step end-to-end clinical patient journey across all ArogyaAI modules.
    """
    # -------------------------------------------------------------
    # Step 1: User Registration & JWT Authentication
    # -------------------------------------------------------------
    unique_email = f"e2e.patient.{int(time.time())}@example.com"
    reg_res = await express_client.post("/api/auth/register", json={
        "email": unique_email,
        "password": "SecurePassword123!",
        "role": "PATIENT",
        "firstName": "Aarav",
        "lastName": "Mehta",
        "dateOfBirth": "1988-06-15",
        "gender": "MALE"
    })
    assert reg_res.status_code == 201
    auth_data = reg_res.json()["data"]
    access_token = auth_data["tokens"]["accessToken"]
    user_id = auth_data["user"]["id"]
    headers = {"Authorization": f"Bearer {access_token}"}

    # -------------------------------------------------------------
    # Step 2: Patient Clinical Baseline Profile Setup
    # -------------------------------------------------------------
    profile_update = {
        "allergies": ["Penicillin", "NSAIDs"],
        "chronicConditions": ["Type 2 Diabetes", "Hypertension"],
        "bloodGroup": "B+",
        "heightCm": 174.0,
        "weightKg": 82.0,
        "emergencyContacts": [
            {"name": "Pooja Mehta", "relationship": "Spouse", "phoneNumber": "+91 9876543210"}
        ]
    }
    prof_res = await express_client.put("/api/patient/profile", json=profile_update, headers=headers)
    assert prof_res.status_code == 200
    updated_prof = prof_res.json()["data"]["profile"]
    assert "Penicillin" in updated_prof["allergies"]

    # -------------------------------------------------------------
    # Step 3: Medicine Intelligence & Drug Safety Check
    # -------------------------------------------------------------
    med_res = await express_client.post("/api/medicines/analyze", json={
        "medicines": ["Dolo 650", "Combiflam", "Augmentin 625"]
    }, headers=headers)
    assert med_res.status_code == 200
    med_data = med_res.json()
    assert len(med_data["duplicateWarnings"]) >= 1
    assert len(med_data["allergyWarnings"]) >= 1

    # -------------------------------------------------------------
    # Step 4: Diagnostic Lab Report Biomarker Analysis
    # -------------------------------------------------------------
    lab_res = await express_client.post("/api/reports/analyze", json={
        "reportTitle": "E2E Routine Blood Panel",
        "biomarkers": [
            {"name": "Hemoglobin", "value": 10.2, "unit": "g/dL"},
            {"name": "Total Leukocyte Count (WBC)", "value": 13500, "unit": "/uL"}
        ]
    })
    assert lab_res.status_code == 200
    lab_data = lab_res.json()
    assert lab_data["analysis"]["abnormalCount"] >= 1

    # -------------------------------------------------------------
    # Step 5: Adaptive Triage & Discriminator Question
    # -------------------------------------------------------------
    triage_res = await express_client.post("/api/triage/start", json={
        "chiefComplaint": "Fever, high chills and headache for 3 days"
    })
    assert triage_res.status_code == 200
    triage_data = triage_res.json()
    assert triage_data["session"]["treeKey"] == "fever"

    next_q_res = await express_client.post("/api/triage/next", json={
        "treeKey": "fever",
        "currentQuestionIndex": 3,
        "answer": "Yes, retro-orbital eye pain and severe muscle pain",
        "history": [
            {"questionId": "q_chills", "question": "Chills?", "answer": "Yes"},
            {"questionId": "q_retro_orbital", "question": "Eye pain?", "answer": "Severe"},
            {"questionId": "q_neck_stiffness", "question": "Neck stiffness?", "answer": "No"}
        ]
    })
    assert next_q_res.status_code == 200
    next_data = next_q_res.json()
    assert next_data["isComplete"] is True
    assert "sbarSummary" in next_data

    # -------------------------------------------------------------
    # Step 6: ML Disease Risk & Biological Health Age
    # -------------------------------------------------------------
    risk_res = await express_client.post("/api/risk/evaluate", json={
        "age": 36,
        "gender": "male",
        "weightKg": 82.0,
        "heightCm": 174.0,
        "sleepHoursPerNight": 5.5,
        "exerciseMinutesPerWeek": 45,
        "familyHistoryDiabetes": True,
        "isSmoker": False
    })
    assert risk_res.status_code == 200
    risk_data = risk_res.json()
    assert risk_data["diseaseRisks"]["diabetes"]["riskCategory"] in ["MODERATE", "HIGH", "CRITICAL"]
    assert risk_data["healthAge"]["biologicalHealthAge"] > 36.0

    # -------------------------------------------------------------
    # Step 7: Medication Adherence & Streak Progression
    # -------------------------------------------------------------
    adh_res = await express_client.post("/api/adherence/log", json={
        "patientId": user_id,
        "medicineName": "Metformin 500mg",
        "status": "TAKEN"
    })
    assert adh_res.status_code == 200
    adh_data = adh_res.json()
    assert adh_data["currentStreakDays"] >= 1

    # -------------------------------------------------------------
    # Step 8: Longitudinal Symptom Replay & MoM Flare-up Alert
    # -------------------------------------------------------------
    replay_res = await express_client.get(f"/api/teleconsult/trends/replay?patientId={user_id}")
    assert replay_res.status_code == 200
    replay_data = replay_res.json()
    assert replay_data["escalationDecision"]["requiresDoctorEscalation"] is True
    assert replay_data["analysisSummary"]["percentageIncrease"] >= 100

    # -------------------------------------------------------------
    # Step 9: WebRTC Teleconsultation Room & Digital E-Prescription
    # -------------------------------------------------------------
    room_res = await express_client.post("/api/teleconsult/room/create", json={
        "patientId": user_id,
        "doctorId": "doc-1"
    })
    assert room_res.status_code == 201
    room_data = room_res.json()
    assert "meetingRoomId" in room_data

    finalize_res = await express_client.post("/api/teleconsult/room/finalize", json={
        "appointmentId": room_data["appointmentId"],
        "clinicalImpression": "Acute Dengue Fever (Non-severe)",
        "icd10Code": "A90",
        "notes": "Hydration, paracetamol as needed, review after lab work",
        "doctorName": "Dr. Ananya Sharma, MD",
        "followUpDays": 2
    })
    assert finalize_res.status_code == 200
    final_data = finalize_res.json()
    assert "ePrescription" in final_data
    assert "digitalSignatureHash" in final_data["ePrescription"]

    # -------------------------------------------------------------
    # Step 10: AES-256-GCM PHI Encryption & PII De-identification
    # -------------------------------------------------------------
    secret_note = "Patient emergency phone +91 9876543210 and Aadhaar 4321-8765-1092"
    enc_res = await express_client.post("/api/compliance/encrypt-phi", json={"plaintext": secret_note})
    assert enc_res.status_code == 200
    enc_payload = enc_res.json()["encrypted"]
    assert "aes-256-gcm" in enc_payload

    dec_res = await express_client.post("/api/compliance/decrypt-phi", json={"encrypted": enc_payload})
    assert dec_res.status_code == 200
    assert dec_res.json()["decrypted"] == secret_note

    scrub_res = await express_client.post("/api/compliance/scrub-pii", json={
        "text": "Please contact patient Aarav Mehta at aarav.mehta@example.com or +91 9876543210."
    })
    assert scrub_res.status_code == 200
    scrubbed = scrub_res.json()
    assert "[EMAIL_REDACTED]" in scrubbed["scrubbedText"]
    assert "[PHONE_REDACTED]" in scrubbed["scrubbedText"]
    assert scrubbed["hasRedactions"] is True
