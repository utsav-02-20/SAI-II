import pytest

@pytest.mark.asyncio
async def test_cbc_report_abnormal_biomarkers(express_client):
    """
    Verifies that CBC report biomarkers are evaluated against clinical standards.
    Hemoglobin 9.2 g/dL must be flagged as LOW (anemia), and WBC 13,400 must be HIGH.
    """
    payload = {
        "reportTitle": "Routine CBC Blood Test",
        "biomarkers": [
            {"name": "Hemoglobin", "value": 9.2, "unit": "g/dL"},
            {"name": "Total Leukocyte Count (WBC)", "value": 13400, "unit": "/uL"},
            {"name": "Platelet Count", "value": 210000, "unit": "/uL"}
        ]
    }

    response = await express_client.post("/api/reports/analyze", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    assert data["success"] is True
    analysis = data["analysis"]
    
    assert analysis["totalTests"] == 3
    assert analysis["abnormalCount"] >= 2
    
    # Check Hemoglobin status
    hb = next(b for b in analysis["biomarkers"] if "Hemoglobin" in b["name"])
    assert hb["status"] == "LOW"
    assert "below normal" in hb["explanation"].lower()
    assert hb["dietaryTips"] is not None

    # Check WBC status
    wbc = next(b for b in analysis["biomarkers"] if "Leukocyte" in b["name"] or "WBC" in b["name"])
    assert wbc["status"] == "HIGH"

    # Check Platelets status
    plt = next(b for b in analysis["biomarkers"] if "Platelet" in b["name"])
    assert plt["status"] == "NORMAL"

@pytest.mark.asyncio
async def test_diabetic_report_hba1c_and_fbs(express_client):
    """
    Verifies that Fasting Blood Sugar (148 mg/dL) and HbA1c (7.4%)
    are flagged as HIGH with diabetic risk narrative.
    """
    payload = {
        "reportTitle": "Quarterly Glycemic Panel",
        "biomarkers": [
            {"name": "Fasting Blood Sugar", "value": 148, "unit": "mg/dL"},
            {"name": "HbA1c", "value": 7.4, "unit": "%"}
        ]
    }

    response = await express_client.post("/api/reports/analyze", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    analysis = data["analysis"]
    assert analysis["abnormalCount"] == 2

    fbs = next(b for b in analysis["biomarkers"] if "Fasting Blood Sugar" in b["name"])
    assert fbs["status"] == "HIGH"

    hba1c = next(b for b in analysis["biomarkers"] if "HbA1c" in b["name"])
    assert hba1c["status"] == "HIGH"
    assert "diabetes" in hba1c["explanation"].lower()

@pytest.mark.asyncio
async def test_lipid_panel_evaluation(express_client):
    """
    Verifies that Total Cholesterol (245 mg/dL) and LDL (170 mg/dL) are HIGH,
    and HDL (35 mg/dL) is flagged as LOW.
    """
    payload = {
        "reportTitle": "Lipid Profile",
        "biomarkers": [
            {"name": "Total Cholesterol", "value": 245, "unit": "mg/dL"},
            {"name": "HDL", "value": 35, "unit": "mg/dL"},
            {"name": "LDL", "value": 170, "unit": "mg/dL"}
        ]
    }

    response = await express_client.post("/api/reports/analyze", json=payload)
    assert response.status_code == 200
    
    analysis = response.json()["analysis"]
    assert analysis["abnormalCount"] == 3

    hdl = next(b for b in analysis["biomarkers"] if "HDL" in b["name"])
    assert hdl["status"] == "LOW"

@pytest.mark.asyncio
async def test_normal_metabolic_panel_all_clear(express_client):
    """
    Verifies that a fully normal lab panel triggers zero false alarms
    and provides a positive health summary.
    """
    payload = {
        "reportTitle": "Annual Executive Health Check",
        "biomarkers": [
            {"name": "Hemoglobin", "value": 14.8, "unit": "g/dL"},
            {"name": "Fasting Blood Sugar", "value": 88, "unit": "mg/dL"},
            {"name": "Serum Creatinine", "value": 0.9, "unit": "mg/dL"}
        ]
    }

    response = await express_client.post("/api/reports/analyze", json=payload)
    assert response.status_code == 200
    
    analysis = response.json()["analysis"]
    assert analysis["abnormalCount"] == 0
    assert "within normal physiological" in analysis["aiSummary"].lower()

@pytest.mark.asyncio
async def test_biomarker_historical_trend(express_client):
    """Verifies retrieval of historical biomarker trend timeline for charting."""
    response = await express_client.get("/api/reports/trend?name=Hemoglobin")
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    assert "history" in data
    assert len(data["history"]) >= 3
    assert "value" in data["history"][0]
    assert "date" in data["history"][0]

@pytest.mark.asyncio
async def test_multipart_file_upload(express_client):
    """Verifies multipart/form-data PDF report upload and parsing."""
    files = {
        "file": ("cbc_blood_report.pdf", b"%PDF-1.4 Mock Clinical Blood Report Data", "application/pdf")
    }
    response = await express_client.post("/api/reports/analyze", files=files)
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    assert data["analysis"]["totalTests"] >= 3
