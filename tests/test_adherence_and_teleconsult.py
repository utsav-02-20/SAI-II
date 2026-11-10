"""
Tests for Phase 7: Medication Adherence Tracker, Longitudinal Health Chat Replay & Doctor Teleconsultation
Validates:
1. Medication schedule creation and retrieval.
2. Dose logging (TAKEN, SKIPPED, SNOOZED), streak tracking, and perfect adherence badges.
3. Longitudinal symptom frequency replay (Month-over-Month flare-up comparison e.g. +140% fever surge).
4. Automated SBAR clinical pre-triage handover packet generation.
5. WebRTC virtual consultation room generation with STUN ICE servers and digital e-prescription finalization.
6. FastAPI microservice dose lapse predictor and time-series anomaly detection.
"""

import pytest
import httpx

@pytest.mark.asyncio
async def test_medication_schedule_retrieval_and_creation(express_client: httpx.AsyncClient):
    """
    Validates patient medication schedule creation and retrieval.
    """
    new_schedule = {
        "patientId": "test-patient-p7",
        "diagnosis": "Type 2 Diabetes Mellitus",
        "prescribedBy": "Dr. Ananya Sharma, MD",
        "medicines": [
          {
            "brandName": "Glycomet 500 SR",
            "genericName": "Metformin HCl",
            "dosage": "500mg",
            "frequency": "Twice Daily",
            "timings": ["08:00 AM", "08:00 PM"],
            "instructions": "Take after meals",
            "durationDays": 60
          }
        ]
    }

    res_post = await express_client.post("/api/adherence/schedule", json=new_schedule)
    assert res_post.status_code == 201
    post_data = res_post.json()
    assert post_data["success"] is True
    assert post_data["prescription"]["diagnosis"] == "Type 2 Diabetes Mellitus"

    # Retrieve schedule
    res_get = await express_client.get("/api/adherence/schedule?patientId=test-patient-p7")
    assert res_get.status_code == 200
    get_data = res_get.json()
    assert get_data["success"] is True
    assert len(get_data["schedule"]) > 0


@pytest.mark.asyncio
async def test_medication_dose_logging_and_streak_progression(express_client: httpx.AsyncClient):
    """
    Validates logging of dose actions, consecutive streak tracking, and badge rewards.
    """
    patient_id = "test-patient-streak-p7"

    # Log 7 consecutive TAKEN doses
    for i in range(7):
        log_res = await express_client.post("/api/adherence/log", json={
            "patientId": patient_id,
            "medicineName": "Metformin 500mg",
            "status": "TAKEN",
            "scheduledTime": f"2026-11-0{i+1}T08:00:00Z"
        })
        assert log_res.status_code == 200

    # Fetch stats
    stats_res = await express_client.get(f"/api/adherence/stats?patientId={patient_id}")
    assert stats_res.status_code == 200
    stats = stats_res.json()["stats"]

    assert stats["takenDoses"] >= 7
    assert stats["adherenceRatePercent"] >= 90
    assert stats["consecutiveStreakDays"] >= 7

    # Check that 7-Day Perfect Adherence Champion badge is unlocked
    badge_names = [b["name"] for b in stats["badges"] if b["unlocked"]]
    assert any("7-Day Perfect Adherence" in b for b in badge_names)


@pytest.mark.asyncio
async def test_longitudinal_symptom_replay_and_escalation(express_client: httpx.AsyncClient):
    """
    Validates longitudinal symptom frequency tracking, month-over-month comparison
    (e.g. Fever 5 in Oct vs 12 in Nov), and automated clinical escalation trigger.
    """
    patient_id = "test-patient-replay-p7"

    res = await express_client.get(f"/api/teleconsult/trends/replay?patientId={patient_id}")
    assert res.status_code == 200
    data = res.json()

    assert data["status"] == "success"
    analysis = data["analysisSummary"]

    # Verify MoM comparison values
    assert analysis["previousPeriodCount"] == 5
    assert analysis["currentPeriodCount"] == 12
    assert analysis["percentageIncrease"] >= 100
    assert "140% increase" in analysis["alertNarrative"] or "increase" in analysis["alertNarrative"]

    # Check escalation decision
    decision = data["escalationDecision"]
    assert decision["requiresDoctorEscalation"] is True
    assert "Doctor Teleconsultation" in decision["escalationReason"] or "Escalating" in decision["escalationReason"]
    assert decision["urgency"] == "URGENT"


@pytest.mark.asyncio
async def test_doctor_queue_and_sbar_pretriage_packet(express_client: httpx.AsyncClient):
    """
    Validates verified doctor directory listing and automated SBAR pre-triage package generation.
    """
    # 1. Doctor directory
    doc_res = await express_client.get("/api/teleconsult/doctors")
    assert doc_res.status_code == 200
    docs = doc_res.json()["doctors"]
    assert len(docs) >= 3
    assert any(d["specialty"] == "Internal Medicine" for d in docs)

    # 2. SBAR Pre-Triage Handover Packet
    packet_res = await express_client.get("/api/teleconsult/pre-triage/default-patient")
    assert packet_res.status_code == 200
    packet = packet_res.json()["packet"]

    sbar = packet["sbarHandover"]
    assert "situation" in sbar
    assert "background" in sbar
    assert "assessment" in sbar
    assert "recommendation" in sbar

    # Verify content reflects adherence rate and allergies in background
    assert "adherence" in sbar["background"].lower()
    assert "Penicillin" in sbar["background"] or len(packet["patientDemographics"]["allergies"]) > 0


@pytest.mark.asyncio
async def test_webrtc_teleconsultation_room_launch_and_completion(express_client: httpx.AsyncClient):
    """
    Validates WebRTC room creation with STUN configuration, signaling tokens,
    and consultation finalization with digital e-prescription.
    """
    # 1. Create WebRTC Room
    create_res = await express_client.post("/api/teleconsult/room/create", json={
        "patientId": "patient-webrtc-p7",
        "doctorId": "doc-1"
    })
    assert create_res.status_code == 201
    room = create_res.json()

    assert room["status"] == "created"
    assert "meetingRoomId" in room
    assert len(room["webrtcConfiguration"]["iceServers"]) >= 1
    assert "stun:" in room["webrtcConfiguration"]["iceServers"][0]["urls"]
    assert "doctorJoinUrl" in room["roomUrls"]
    assert "patientJoinUrl" in room["roomUrls"]

    # 2. Finalize Consultation & Issue E-Prescription
    finalize_res = await express_client.post("/api/teleconsult/room/finalize", json={
        "appointmentId": room["appointmentId"],
        "clinicalImpression": "Acute Viral Pyrexia",
        "icd10Code": "R50.9",
        "notes": "Hydration, paracetamol as needed, review in 3 days",
        "doctorName": "Dr. Ananya Sharma, MD",
        "followUpDays": 3
    })
    assert finalize_res.status_code == 200
    summary = finalize_res.json()

    assert summary["status"] == "completed"
    assert summary["consultationNotes"]["icd10Code"] == "R50.9"
    assert "ePrescription" in summary
    assert "digitalSignatureHash" in summary["ePrescription"]
    assert "Paracetamol" in summary["ePrescription"]["medicinesPrescribed"][0]["drugName"]


@pytest.mark.asyncio
async def test_fastapi_adherence_and_trend_microservice(ai_client: httpx.AsyncClient):
    """
    Directly tests Python FastAPI endpoints for dose lapse probability and longitudinal trend anomaly detection.
    """
    # 1. Dose omission risk predictor
    lapse_res = await ai_client.post("/api/adherence/predict-lapse", json={
        "patient_id": "fastapi-p7",
        "current_streak_days": 10,
        "scheduled_hour": 8,
        "is_weekend": False,
        "regimen_medication_count": 2,
        "past_adherence_rate": 95.0
    })
    assert lapse_res.status_code == 200
    lapse_data = lapse_res.json()
    assert lapse_data["status"] == "success"
    assert lapse_data["risk_tier"] == "LOW"
    assert lapse_data["dose_omission_risk_percentage"] < 25.0

    # 2. Longitudinal symptom trend anomaly detection
    trend_res = await ai_client.post("/api/adherence/analyze-trend", json={
        "symptom_name": "Fever",
        "previous_month_count": 5,
        "current_month_count": 12,
        "associated_symptoms": ["Headache", "Fatigue"]
    })
    assert trend_res.status_code == 200
    trend_data = trend_res.json()
    assert trend_data["status"] == "success"
    assert trend_data["percentage_increase"] == 140.0
    assert trend_data["requires_clinical_escalation"] is True
    assert trend_data["urgency_level"] == "URGENT"
