# ArogyaAI (आरोग्य AI) 🏥
**Next-Generation Clinical Healthcare, Diagnostics & Intelligent Triage Platform**

A production-ready digital health companion built with **Express.js (Pure JavaScript ES Modules)**, **MongoDB Atlas + Prisma ORM**, **Cloudinary Document Storage**, **React (Vite + Tailwind CSS)**, and a **Python FastAPI Clinical Intelligence Microservice**.

---

## 📑 Table of Contents
1. [Key Features & Capabilities](#key-features--capabilities)
2. [Architecture & System Design](#architecture--system-design)
3. [Prerequisites](#prerequisites)
4. [Environment Setup](#environment-setup)
5. [How to Run the Platform (Step-by-Step)](#how-to-run-the-platform-step-by-step)
   - [A. Running the Express Backend](#a-running-the-express-backend)
   - [B. Running the React Frontend](#b-running-the-react-frontend)
   - [C. Running the Python AI Microservice](#c-running-the-python-ai-microservice)
6. [Database Seeding (Decoupled in Python)](#database-seeding-decoupled-in-python)
7. [Running the Python Test Suite](#running-the-python-test-suite)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Clinical Safety & Disclaimers](#clinical-safety--disclaimers)

---

## 🌟 Key Features & Capabilities

- 💊 **Medicine Intelligence & Safety Engine:** Checks drug-drug interactions via OpenFDA & RxNorm, duplicate active ingredients (e.g. Paracetamol overdose across Dolo 650 + Combiflam), and food restrictions (e.g. Grapefruit with Atorvastatin).
- 🩸 **Health Report Analyzer (OCR & Context):** Ingests PDF/Image lab reports (CBC, Blood Sugar, Lipid Profile, LFT, KFT), extracts values, compares against normal reference ranges (`LOW`, `NORMAL`, `HIGH`, `CRITICAL`), and plots historical trends in Recharts.
- 🚨 **Real-Time Emergency Red-Flag Interceptor:** Deterministic high-speed scanner checking for cardiac arrest (crushing chest pain), stroke (FAST criteria), and anaphylaxis with zero LLM delay and 1-click **108 / 112** ambulance dialing.
- 🩺 **Adaptive Clinical Triage:** Mimics an attending physician's clinical reasoning by asking the single next-best discriminator question to narrow the differential diagnosis, generating structured **SBAR** summaries.
- 🗣️ **Bilingual Voice Engine (Hindi + English):** Hands-free speech recognition (STT) and neural text-to-speech (TTS) in both English (`en-IN`) and Hindi (`hi-IN`).
- 👁️ **Vision Symptom Screening:** Visual triage for skin rashes (Urticaria/Dermatitis/Tinea), eye redness (Conjunctivitis), and nail discoloration (Onychomycosis).
- 📚 **Evidence-Grounded RAG Assistant:** Zero-hallucination medical guidance directly citing the World Health Organization (WHO), CDC, and ICMR.
- 🛡️ **Medical Misinformation & Myth Buster:** Fact-checks viral social media health claims (e.g. papaya leaves for dengue, colloidal silver) against peer-reviewed clinical evidence.
- 🥗 **Nutritional Deficiency Detector:** Maps non-specific physical symptoms (hair fall, fatigue, pale skin, bone aches, mouth ulcers) to candidate micronutrient deficiencies (Iron, Vitamin D3, B12, Zinc).
- 🧬 **10-Year Chronic Disease Risk Engine (ML):** ADA-calibrated Type 2 Diabetes score, AHA/ACC Pooled Cohort ASCVD Cardiovascular risk, and multifactorial Hypertension models.
- ⏳ **Biological Health Age Calculator:** Quantifies allostatic wear vs chronological age based on sleep debt, smoking, BMI, and physical activity.
- 📋 **Personalized 4-Pillar Prevention Roadmap:** Evidence-based daily prescription calculating exact hydration targets ($kg \times 0.033 + \text{workout bonus}$), sodium restrictions, MET-minutes, and circadian protocols.
- 💊 **Medication Adherence Tracker & Habit Streaks:** Tracks scheduled doses, logs actions (`TAKEN`, `SKIPPED`, `SNOOZED`), calculates running consecutive streaks, unlocks milestone badges (3-Day Pioneer, 7-Day Champion), and simulates multi-channel reminder notifications.
- 📈 **Longitudinal Symptom Replay & Flare-Up Detection:** Month-over-month symptom frequency comparison (+140% fever surge detection), automated clinical escalation triggers, and interactive time-series timeline graphs.
- 👨‍⚕️ **Doctor Teleconsultation & Pre-Triage Handover:** Attending doctor portal with automated clinical SBAR handover packets, WebRTC virtual consultation rooms with STUN configuration, and digital e-prescription signing.
- 🔒 **HIPAA & Indian DPDP Regulatory Hardening:** AES-256-GCM encryption at rest for sensitive PHI, automated HIPAA Safe Harbor PII scrubbing before AI queries, and mandatory clinical disclaimer acknowledgement modal.
- 🐳 **Production Docker Containerization:** Multi-stage container images for Express, Vite/Nginx, and Python FastAPI microservice orchestrated via `docker-compose.yml`.

---

## 🏛️ Architecture & System Design

```plaintext
SAI II/
├── server/                    # Express.js Backend (Pure JavaScript ES Modules)
│   ├── src/
│   │   ├── config/            # Prisma Client, DB In-Memory Fallback, Environment
│   │   ├── controllers/       # Auth, Patient, Emergency, Medicine, Report, Triage, Knowledge
│   │   ├── middlewares/       # Auth JWT verification, Error handlers
│   │   ├── routes/            # REST API Routes
│   │   ├── services/          # Clinical Ontologies, RAG Store, Drug Matrices
│   │   └── server.js          # Express app entrypoint (Port 5000)
│   ├── prisma/
│   │   └── schema.prisma      # MongoDB Prisma Schema
│   └── package.json
│
├── client/                    # React Frontend (Vite + Tailwind CSS + Lucide Icons)
│   ├── src/
│   │   ├── components/        # Header, AuthModal, ProfileCard, EmergencyAlertModal,
│   │   │                      # MedicineAnalyzer, LabReportAnalyzer, AdaptiveTriage,
│   │   │                      # ClinicalAssistant, RiskCalculator, AdherenceTracker,
│   │   │                      # TeleconsultationPortal, FeatureGrid
│   │   ├── App.jsx            # Main unified dashboard view
│   │   └── main.jsx
│   ├── vite.config.js         # Configured with proxy to http://localhost:5000
│   └── package.json
│
├── ai-service/                # Python FastAPI Microservice (Port 8000)
│   ├── app/
│   │   ├── api/               # Health, Risk, Adherence & Longitudinal Trend endpoints
│   │   ├── core/              # Config & Gemini client
│   │   ├── models/            # XGBoost/Statistical Risk & Health Age models
│   │   └── main.py            # FastAPI entrypoint
│   └── requirements.txt
│
├── seed/                      # Standalone Python Seeder (Decoupled from Express)
│   ├── seed_database.py       # Seeds MongoDB directly via PyMongo
│   ├── mock_patients.json     # Mock clinical baseline profiles
│   ├── mock_doctors.json      # Specialist profiles
│   ├── mock_medicines.json    # Drug reference catalog
│   ├── mock_lab_reports.json  # Reference lab panels
│   └── requirements.txt
│
├── tests/                     # Unified Python Test Suite (Pytest + HTTPX)
│   ├── conftest.py            # Automatic server management fixtures
│   ├── test_health.py         # Baseline health check tests
│   ├── test_auth_and_emergency.py # Auth, Profiles & Red-Flag tests
│   ├── test_medicine_safety.py    # OpenFDA / RxNorm interaction tests
│   ├── test_lab_analyzer.py       # Lab report OCR & biomarker tests
│   ├── test_adaptive_triage.py    # Multi-turn triage & vision tests
│   ├── test_rag_and_myths.py      # WHO RAG & Myth Buster tests
│   ├── test_ml_risk_models.py     # Chronic Disease ML Risk & Health Age tests
│   ├── test_adherence_and_teleconsult.py # Adherence streaks & Doctor Tele-Triage tests
│   └── requirements.txt
│
├── .env.example               # Environment template
└── package.json               # Root workspace script aggregator
```

---

## ⚙️ Prerequisites

Before running the project, ensure you have the following installed on your machine:
- **Node.js**: Version `v18.0.0` or higher (Tested on `v24.15.0`)
- **npm**: Version `9.0.0` or higher (Tested on `12.1.0`)
- **Python**: Version `3.10` or higher (Tested on `3.14.5`) with `pip`

---

## 🔑 Environment Setup

1. Copy the `.env.example` file to create your local `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure your environment variables in `.env`:
   ```ini
   # Database (MongoDB Atlas connection string or local MongoDB)
   # Note: If left as template, the server gracefully uses an in-memory fallback store for zero-friction development!
   DATABASE_URL="mongodb://localhost:27017/arogya_db"

   # Express Backend Server
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=super_secret_jwt_access_key_change_in_production
   JWT_REFRESH_SECRET=super_secret_jwt_refresh_key_change_in_production
   CORS_ORIGIN=http://localhost:5173

   # Python AI Microservice
   AI_SERVICE_URL=http://localhost:8000
   GEMINI_API_KEY=your_gemini_api_key_here

   # Cloudinary (Optional for cloud file storage)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

---

## 🚀 How to Run the Platform (Step-by-Step)

You can run each service in separate terminal windows, or use the convenient root npm scripts.

### A. Running the Express Backend (Port 5000)

1. Open a terminal and navigate to `server`:
   ```bash
   cd server
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Generate the Prisma Client:
   ```bash
   npx prisma generate
   ```
4. Start the Express development server with live auto-reload:
   ```bash
   npm run dev
   ```
   *The Express API will be running at:* `http://localhost:5000`  
   *Health check endpoint:* `http://localhost:5000/api/health`

---

### B. Running the React Frontend (Port 5173)

1. Open a new terminal and navigate to `client`:
   ```bash
   cd client
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:  
   👉 **`http://localhost:5173`**

---

### C. Running the Python AI Microservice (Port 8000)

1. Open a new terminal and install Python dependencies:
   ```bash
   pip install -r ai-service/requirements.txt
   ```
2. Start the FastAPI microservice:
   ```bash
   python ai-service/app/main.py
   ```
   *The AI service will be running at:* `http://localhost:8000`  
   *Interactive API Docs (Swagger):* `http://localhost:8000/docs`  
   *Health check:* `http://localhost:8000/health`

---

### Quick Shortcut: Running via Root Workspace

From the root directory (`SAI II/`), you can trigger tasks directly:
```bash
# Start Express Backend
npm run dev:server

# Start React Frontend
npm run dev:client

# Start Python AI Service
npm run dev:ai
```

---

## 🧪 Database Seeding (Decoupled in Python)

Database seeding is kept **strictly separated from the Express backend** and is powered by a standalone Python utility using `pymongo`.

To seed mock patients, doctor profiles, and clinical records directly into MongoDB:

```bash
# 1. Install seeding requirements
pip install -r seed/requirements.txt

# 2. Seed all entities (Patients + Doctors + Mock records)
python seed/seed_database.py --all

# Or seed patients only:
python seed/seed_database.py --patients

# Or clear previous test data:
python seed/seed_database.py --clear
```

---

## 🔬 Running the Python Test Suite

The test suite is written **exclusively in Python** using `pytest` and `httpx.AsyncClient`. It tests the entire platform over HTTP with zero testing frameworks bloat in the Express backend.

```bash
# 1. Install test requirements
pip install -r tests/requirements.txt

# 2. Run the full test suite
pytest tests/ -v
```

> **Note:** The test harness automatically starts and manages the Express and FastAPI servers during testing!

### Current Test Coverage (49 Passing Tests):
- `tests/test_health.py` (3 tests): Express health, Root welcome, FastAPI health.
- `tests/test_auth_and_emergency.py` (9 tests): User registration, duplicate email handling, login, patient profile CRUD, and real-time emergency red-flag triggers (cardiac, stroke, anaphylaxis).
- `tests/test_medicine_safety.py` (6 tests): Duplicate active ingredient overdose, severe drug-drug interactions (Aspirin + Warfarin), allergy contraindication cross-checking, and food interactions (Atorvastatin + Grapefruit).
- `tests/test_lab_analyzer.py` (6 tests): CBC abnormal detection (low hemoglobin & high WBC), diabetic panels (HbA1c & fasting glucose), lipid profiles, normal clearance, and time-series trends.
- `tests/test_adaptive_triage.py` (6 tests): Multi-turn differential diagnosis questions, SBAR clinical summary generation, emergency escalation, and vision symptom screening (skin rash, eye redness).
- `tests/test_rag_and_myths.py` (6 tests): Grounded WHO citations, dengue fluid management, papaya leaf myth classification, colloidal silver toxicity warnings, and micronutrient deficiency inference.
- `tests/test_ml_risk_models.py` (6 tests): High-risk metabolic scoring (>60% Diabetes, elevated Health Age), marathon runner longevity profile (<42y biological age, low risks), ASCVD smoking/BP drivers, hydration/lifestyle prevention formulas, and FastAPI ML microservice endpoints.
- `tests/test_adherence_and_teleconsult.py` (6 tests): Medication schedule creation, dose logging & 7-day streak badges, longitudinal symptom replay (+140% fever spike), doctor directory & SBAR pre-triage handover packet, WebRTC room launcher with STUN configuration, and FastAPI dose lapse predictor.
- `tests/test_e2e_patient_journey.py` (1 test): Comprehensive 10-step full patient lifecycle integration test (Auth, Profile, Drug safety, Lab OCR, Triage, ML Risk, Adherence, Symptom replay, Teleconsultation, and AES-256/PII scrubbing).

---

## 🐳 Docker Containerization & Local Staging

You can launch all platform tiers (Express API, React Frontend via Nginx, Python AI Microservice, and MongoDB) with a single command:

```bash
# Build and run all services in the background
docker compose up --build -d

# View service logs
docker compose logs -f

# Teardown services
docker compose down
```

- **React Client:** `http://localhost:3000`
- **Express Backend:** `http://localhost:5000`
- **Python FastAPI Service:** `http://localhost:8000`

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Express server health check & runtime status |
| `POST` | `/api/auth/register` | Register a new user (`PATIENT` or `DOCTOR`) |
| `POST` | `/api/auth/login` | Login and receive JWT access & refresh tokens |
| `GET` | `/api/auth/me` | Fetch authenticated user data & clinical profile |
| `GET` | `/api/patient/profile` | Fetch patient medical baseline (allergies, vitals) |
| `PUT` | `/api/patient/profile` | Update drug allergies, conditions, and emergency contacts |
| `POST` | `/api/emergency/check` | Real-time deterministic scan for acute emergencies |
| `POST` | `/api/medicines/analyze` | Multi-medicine interaction, duplicate, & allergy check |
| `GET` | `/api/medicines/search?q=` | Medicine autocomplete search |
| `POST` | `/api/reports/analyze` | Upload lab report PDF/Image or analyze JSON biomarkers |
| `GET` | `/api/reports` | List patient's analyzed historical lab reports |
| `GET` | `/api/reports/trend?name=` | Retrieve time-series biomarker trend for charting |
| `POST` | `/api/triage/start` | Start adaptive differential diagnosis interview |
| `POST` | `/api/triage/next` | Advance triage session & generate SBAR summary |
| `POST` | `/api/triage/analyze-image` | Visual symptom screening for skin, eye, and nails |
| `POST` | `/api/knowledge/ask` | Evidence-based RAG query with official WHO/CDC citations |
| `POST` | `/api/knowledge/check-myth` | Fact-check viral medical claim with scientific verdict |
| `POST` | `/api/knowledge/detect-deficiency` | Map physical symptoms to candidate micronutrient deficiencies |
| `POST` | `/api/risk/evaluate` | Comprehensive 10-yr disease risk, Health Age & Prevention Plan |
| `POST` | `/api/risk/health-age` | Compute biological health age vs chronological age |
| `POST` | `/api/risk/prevention-plan` | Generate personalized 4-pillar prevention roadmap |
| `GET` | `/api/adherence/schedule` | Retrieve active prescribed medication schedule |
| `POST` | `/api/adherence/schedule` | Add or update prescribed medication schedule |
| `POST` | `/api/adherence/log` | Record dose action (`TAKEN`, `SKIPPED`, `SNOOZED`) & update streak |
| `GET` | `/api/adherence/stats` | Adherence rate (%), consecutive streak days, and milestone badges |
| `POST` | `/api/adherence/simulate-reminder` | Simulate multi-channel Web Push / SMS medication alert |
| `GET` | `/api/teleconsult/trends/replay` | Longitudinal symptom trajectory & MoM comparison (+140% alert) |
| `GET` | `/api/teleconsult/doctors` | Verified doctor directory with specialties and consultation fees |
| `GET` | `/api/teleconsult/pre-triage/:id` | Automated clinical SBAR pre-triage handover packet |
| `POST` | `/api/teleconsult/room/create` | Launch WebRTC consultation room with STUN configuration |
| `POST` | `/api/teleconsult/room/finalize` | Finalize consultation, record notes & issue signed e-prescription |
| `POST` | `/api/compliance/encrypt-phi` | Encrypt sensitive health data using AES-256-GCM |
| `POST` | `/api/compliance/decrypt-phi` | Decrypt authorized health data |
| `POST` | `/api/compliance/scrub-pii` | De-identify text per HIPAA Safe Harbor § 164.514(b) |
| `GET` | `/api/compliance/status` | Current HIPAA, Indian DPDP, and ABDM regulatory audit status |

---

## ⚠️ Clinical Safety & Disclaimers

> [!IMPORTANT]
> **ArogyaAI is an assistive clinical decision-support and health education tool.**  
> - It does **NOT** provide a definitive medical diagnosis.
> - It does **NOT** replace an in-person clinical evaluation by a licensed physician.
> - In case of acute severe symptoms (crushing chest pain, sudden numbness, difficulty breathing), use the **Emergency SOS button (108 / 112 / 911)** immediately.
