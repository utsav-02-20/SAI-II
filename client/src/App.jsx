import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header.jsx';
import FeatureGrid from './components/FeatureGrid.jsx';
import AuthModal from './components/auth/AuthModal.jsx';
import ProfileCard from './components/patient/ProfileCard.jsx';
import EmergencyAlertModal from './components/triage/EmergencyAlertModal.jsx';
import AdaptiveTriage from './components/triage/AdaptiveTriage.jsx';
import MedicineAnalyzer from './components/medicines/MedicineAnalyzer.jsx';
import LabReportAnalyzer from './components/reports/LabReportAnalyzer.jsx';
import ClinicalAssistant from './components/knowledge/ClinicalAssistant.jsx';
import RiskCalculator from './components/risk/RiskCalculator.jsx';
import AdherenceTracker from './components/adherence/AdherenceTracker.jsx';
import TeleconsultationPortal from './components/teleconsult/TeleconsultationPortal.jsx';
import { ShieldCheck, Heart, Sparkles, AlertTriangle, Send, Pill, FileText, Stethoscope, BookOpen, Activity, Video } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState('en');
  const [apiData, setApiData] = useState(null);
  const [apiStatus, setApiStatus] = useState('connecting');
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Emergency scanner state
  const [symptomInput, setSymptomInput] = useState('');
  const [checkingEmergency, setCheckingEmergency] = useState(false);
  const [emergencyResult, setEmergencyResult] = useState(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  useEffect(() => {
    // 1. Health check
    axios
      .get('/api/health')
      .then((res) => {
        setApiData(res.data);
        setApiStatus('online');
      })
      .catch(() => setApiStatus('offline'));

    // 2. Check stored JWT token
    const token = localStorage.getItem('accessToken');
    if (token) {
      axios
        .get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          if (res.data.success) {
            setUser(res.data.data.user);
          }
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        });
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const handleCheckEmergency = async (e) => {
    e?.preventDefault();
    if (!symptomInput.trim()) return;

    setCheckingEmergency(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        '/api/emergency/check',
        { message: symptomInput },
        { headers }
      );

      if (res.data.isEmergency) {
        setEmergencyResult(res.data);
        setIsEmergencyModalOpen(true);
      } else {
        alert(
          language === 'en'
            ? '✓ No acute life-threatening red flags detected in this symptom query.'
            : '✓ इस लक्षण प्रश्न में कोई तीव्र जानलेवा आपातकालीन संकेत नहीं पाया गया।'
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingEmergency(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-50 flex flex-col">
      <Header
        language={language}
        setLanguage={setLanguage}
        apiStatus={apiStatus}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-12 shadow-xl shadow-emerald-950/10">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 7 Live • Adherence Tracker, Longitudinal Replay & Teleconsultation</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {language === 'en'
                ? 'Your AI-Powered Clinical Health Companion'
                : 'आपका एआई-संचालित स्वास्थ्य साथी'}
            </h1>
            <p className="mt-4 text-emerald-100 text-base sm:text-lg leading-relaxed">
              {language === 'en'
                ? 'Medication habit streaks, longitudinal symptom replay (+140% fever flare-up detection), WebRTC doctor tele-triage, ML risk models, and lab OCR.'
                : 'दवा स्ट्रीक ट्रैकर, दीर्घकालिक लक्षण बदलाव विश्लेषण, डॉक्टर वीडियो परामर्श एवं स्वास्थ्य रिपोर्ट विश्लेषण।'}
            </p>

            {/* Quick Status Bar */}
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium">
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                <Pill className="w-4 h-4 text-emerald-400" />
                <span>Adherence & Streaks Active</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                <Video className="w-4 h-4 text-cyan-400" />
                <span>Doctor Tele-Triage & SBAR</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                <Activity className="w-4 h-4 text-teal-400" />
                <span>ML Disease Risk & Health Age</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>WHO & CDC Grounded RAG</span>
              </div>
            </div>
          </div>

          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Phase 1: Interactive Emergency Red-Flag Triage Simulator */}
        <div className="p-6 bg-white rounded-3xl border border-red-200 shadow-sm">
          <div className="flex items-center space-x-2 text-red-600 font-bold text-sm mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>
              {language === 'en'
                ? 'Real-Time Emergency Red-Flag Diagnostic Scanner'
                : 'रीयल-टाइम आपातकालीन रेड-फ्लैग स्कैनर'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            {language === 'en'
              ? 'Tests acute coronary syndrome, stroke FAST criteria, anaphylaxis, or psychiatric crisis. Instant heuristic scan with zero chatbot delay.'
              : 'दिल का दौरा, स्ट्रोक या गंभीर एलर्जी के लक्षणों की तुरंत पहचान करता है।'}
          </p>
          <form onSubmit={handleCheckEmergency} className="flex gap-2">
            <input
              type="text"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'Try: "crushing chest pain radiating to left arm" or "facial droop and slurred speech"'
                  : 'उदाहरण: "crushing chest pain radiating to left arm"'
              }
              className="flex-1 text-xs sm:text-sm px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              disabled={checkingEmergency || !symptomInput.trim()}
              className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <span>{checkingEmergency ? 'Scanning...' : 'Test Red Flag'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Phase 7: Medication Adherence & Habit Streak Tracker */}
        <AdherenceTracker user={user} language={language} />

        {/* Phase 7: Longitudinal Symptom Replay & Doctor Teleconsultation */}
        <TeleconsultationPortal user={user} language={language} />

        {/* Phase 6: Disease Risk Score (ML), Biological Health Age & Prevention Roadmap */}
        <RiskCalculator language={language} />

        {/* Phase 5: Clinical Assistant (RAG, Myth Buster & Nutrition) */}
        <ClinicalAssistant language={language} />

        {/* Phase 4: Adaptive Clinical Triage, Voice Assistant & Vision Screening */}
        <AdaptiveTriage
          language={language}
          onEmergencyTriggered={(emergData) => {
            setEmergencyResult(emergData);
            setIsEmergencyModalOpen(true);
          }}
        />

        {/* Phase 3: Multimodal Health Report Analyzer */}
        <LabReportAnalyzer user={user} language={language} />

        {/* Phase 2: Medicine Intelligence & Drug Safety Engine */}
        <MedicineAnalyzer user={user} language={language} />

        {/* Authenticated Patient Medical Profile Baseline */}
        {user ? (
          <ProfileCard
            user={user}
            onProfileUpdated={(updated) => setUser({ ...user, profile: updated })}
          />
        ) : (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-emerald-900">
                {language === 'en' ? 'Manage Your Clinical Baseline' : 'अपनी स्वास्थ्य प्रोफ़ाइल प्रबंधित करें'}
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                {language === 'en'
                  ? 'Sign in to record your known drug allergies, chronic conditions, and emergency contacts.'
                  : 'दवा एलर्जी और आपातकालीन संपर्क रिकॉर्ड करने के लिए साइन इन करें।'}
              </p>
            </div>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition whitespace-nowrap shadow-sm shadow-emerald-600/20"
            >
              {language === 'en' ? 'Sign In / Register' : 'साइन इन करें'}
            </button>
          </div>
        )}

        {/* Feature Grid */}
        <FeatureGrid language={language} />
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(authUser) => setUser(authUser)}
      />

      {/* Emergency Alert Modal */}
      <EmergencyAlertModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        emergencyData={emergencyResult}
        language={language}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ArogyaAI Clinical Platform • For decision-support & education only</span>
          <span className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> in pure JavaScript + Python
          </span>
        </div>
      </footer>
    </div>
  );
}
