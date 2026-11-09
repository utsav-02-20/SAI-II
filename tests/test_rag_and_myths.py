import pytest

@pytest.mark.asyncio
async def test_rag_malaria_treatment_citations(express_client):
    """
    Verifies that the RAG assistant answers clinical treatment queries
    with explicit inline citations from the World Health Organization (WHO).
    """
    payload = {
        "query": "What is the standard first-line treatment protocol for uncomplicated malaria?"
    }

    response = await express_client.post("/api/knowledge/ask", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    assert data["success"] is True
    rag_data = data["data"]
    
    # Verify clinical evidence and WHO attribution
    assert "Artemisinin" in rag_data["retrievedGuideline"]["summary"]
    assert "World Health Organization" in rag_data["retrievedGuideline"]["organization"]
    assert len(rag_data["citations"]) >= 1
    assert "who.int" in rag_data["citations"][0]["url"].lower()

@pytest.mark.asyncio
async def test_rag_dengue_fluid_and_nsaid_warning(express_client):
    """
    Verifies that querying dengue protocol highlights fluid resuscitation
    and the strict contraindication against NSAIDs / Aspirin.
    """
    payload = {
        "query": "What is the clinical management and fluid protocol for dengue fever?"
    }

    response = await express_client.post("/api/knowledge/ask", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    summary = data["data"]["retrievedGuideline"]["summary"].lower()
    
    assert "fluid" in summary
    assert "contraindicated" in summary or "aspirin" in summary
    assert "who.int" in data["data"]["citations"][0]["url"].lower()

@pytest.mark.asyncio
async def test_myth_buster_papaya_leaf_dengue(express_client):
    """
    Verifies that the myth buster evaluates the viral claim:
    'Can papaya leaves cure dengue?' -> PARTIALLY_TRUE_WITH_CAVEATS.
    """
    payload = {
        "claim": "Can dengue fever be cured by drinking papaya leaf juice?"
    }

    response = await express_client.post("/api/knowledge/check-myth", json=payload)
    assert response.status_code == 200
    
    data = response.json()["data"]
    assert data["verdict"] == "PARTIALLY_TRUE_WITH_CAVEATS"
    assert "platelet" in data["detailedAnalysis"].lower()
    assert "not an antiviral" in data["detailedAnalysis"].lower()
    assert "ncbi.nlm.nih.gov" in data["sourceUrl"]

@pytest.mark.asyncio
async def test_myth_buster_colloidal_silver_dangerous(express_client):
    """
    Verifies that the dangerous claim 'colloidal silver cures viruses'
    is classified as a DANGEROUS_MYTH with organ toxicity warning.
    """
    payload = {
        "claim": "Drinking colloidal silver water cures viral infections completely"
    }

    response = await express_client.post("/api/knowledge/check-myth", json=payload)
    assert response.status_code == 200
    
    data = response.json()["data"]
    assert data["verdict"] == "DANGEROUS_MYTH"
    assert data["isMisinformation"] is True
    assert "fda" in data["officialSource"].lower() or "nih" in data["officialSource"].lower()

@pytest.mark.asyncio
async def test_nutrition_deficiency_iron_detector(express_client):
    """
    Verifies that reporting hair fall, fatigue, and pale skin
    maps to Iron Deficiency Anemia with tailored food & test recommendations.
    """
    payload = {
        "symptoms": ["hair fall", "fatigue", "pale skin", "brittle nails"]
    }

    response = await express_client.post("/api/knowledge/detect-deficiency", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    assert "Iron Deficiency Anemia" in data["topCandidate"]
    
    top_def = data["identifiedDeficiencies"][0]
    assert top_def["matchScore"] >= 60
    assert any("spinach" in food.lower() for food in top_def["foodRecommendations"]["vegetarian"])
    assert any("ferritin" in test.lower() for test in top_def["suggestedDiagnosticTests"])

@pytest.mark.asyncio
async def test_nutrition_deficiency_vitamin_d3(express_client):
    """
    Verifies that reporting deep bone pain, back ache, and muscle cramps
    identifies Vitamin D3 Deficiency and suggests 25(OH)D lab test.
    """
    payload = {
        "symptoms": ["bone pain", "muscle cramps", "back ache"]
    }

    response = await express_client.post("/api/knowledge/detect-deficiency", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    assert "Vitamin D3" in data["topCandidate"]
    
    d3_tests = " ".join(data["identifiedDeficiencies"][0]["suggestedDiagnosticTests"]).lower()
    assert "25-hydroxy" in d3_tests or "vitamin d" in d3_tests
