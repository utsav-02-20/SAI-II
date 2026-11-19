import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AlertTriangle,
  Send,
  ArrowRight,
  Activity,
  CheckCircle2,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { DOMAINS } from '../config/domains';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import EmergencyAlertModal from '../components/triage/EmergencyAlertModal';

/**
 * Editorial Clinical Homescreen.
 * 
 * Strict Anti-"AI UI" Design:
 * - Zero pastel boxes, zero glow orbs, zero sparkle icons.
 * - Disciplined typography: clean sans for prose + tabular monospace for ports and telemetry.
 * - Hairline 1px borders, high-density structured layout, clinical crimson reserved exclusively for emergencies.
 */
export function HomePage({
  language = 'en',
  onNavigate,
  user,
  onOpenAuth,
}) {
  // Emergency Scanner State
  const [symptomInput, setSymptomInput] = useState('');
  const [checkingEmergency, setCheckingEmergency] = useState(false);
  const [emergencyResult, setEmergencyResult] = useState(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyFeedback, setEmergencyFeedback] = useState(null);

  // System Telemetry State
  const [telemetryChecking, setTelemetryChecking] = useState(false);
  const [telemetryStatus, setTelemetryStatus] = useState(null);

  const handleCheckEmergency = async (e) => {
    e?.preventDefault();
    const query = symptomInput.trim();
    if (!query) return;

    setCheckingEmergency(true);
    setEmergencyFeedback(null);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        '/api/emergency/check',
        { message: query },
        { headers }
      );

      if (res.data?.isEmergency) {
        setEmergencyResult(res.data);
        setIsEmergencyModalOpen(true);
      } else {
        setEmergencyFeedback({
          type: 'safe',
          text:
            language === 'en'
              ? 'No acute life-threatening emergency flags detected in query heuristic.'
              : 'कोई तीव्र जानलेवा आपातकालीन संकेत नहीं पाया गया।',
        });
      }
    } catch {
      setEmergencyFeedback({
        type: 'error',
        text: 'Emergency service unreachable. Ensure /server is active.',
      });
    } finally {
      setCheckingEmergency(false);
    }
  };

  const handlePingTelemetry = async () => {
    setTelemetryChecking(true);
    try {
      const res = await axios.get('/api/health').catch(() => null);
      if (res?.status === 200) {
        setTelemetryStatus({
          server: 'online',
          ai: 'online',
          mongo: 'online',
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        setTelemetryStatus({
          server: 'offline',
          ai: 'offline',
          mongo: 'offline',
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    } finally {
      setTelemetryChecking(false);
    }
  };

  useEffect(() => {
    handlePingTelemetry();
  }, []);

  return (
    <div className="space-y-8">
      {/* 1. Concise Clinical Header & System Strip */}
      <section className="space-y-3 pb-6 border-b border-zinc-200">
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
            {language === 'en'
              ? 'Clinical Decision Support & Telemedicine Platform'
              : 'क्लिनिकल निर्णय सहायता एवं टेलीमेडिसिन प्लेटफॉर्म'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-4xl">
            {language === 'en'
              ? 'Real-time emergency red-flag triage, OpenFDA multi-drug safety, multimodal lab OCR, WebRTC doctor tele-triage, and WHO/CDC clinical guidelines.'
              : 'आपातकालीन ट्राइएज, दवा सुरक्षा, लैब रिपोर्ट विश्लेषण और डॉक्टर टेली-परामर्श के लिए एकीकृत स्वास्थ्य प्लेटफॉर्म।'}
          </p>
        </div>

        {/* Inline, Low-Noise System Telemetry Bar */}
        <div className="pt-1 flex flex-wrap items-center gap-3 text-xs">
          <button
            type="button"
            onClick={handlePingTelemetry}
            disabled={telemetryChecking}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-mono text-[11px] transition-colors"
            title="Ping backend services"
          >
            {telemetryChecking ? (
              <RefreshCw className="w-3 h-3 animate-spin text-zinc-500" strokeWidth={1.5} />
            ) : (
              <Activity className="w-3 h-3 text-zinc-500" strokeWidth={1.5} />
            )}
            <span>Check System Telemetry</span>
          </button>

          <div className="flex items-center gap-2 font-mono text-[11px] tabular-nums text-zinc-600">
            <span className="flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  telemetryStatus?.server === 'online' ? 'bg-emerald-600' : 'bg-zinc-400'
                }`}
              />
              Express API (5000)
            </span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  telemetryStatus?.ai === 'online' ? 'bg-emerald-600' : 'bg-zinc-400'
                }`}
              />
              FastAPI AI (8000)
            </span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  telemetryStatus?.mongo === 'online' ? 'bg-emerald-600' : 'bg-zinc-400'
                }`}
              />
              MongoDB (27017)
            </span>
            {telemetryStatus?.timestamp && (
              <span className="text-zinc-400 text-[10px]">
                [Synced: {telemetryStatus.timestamp}]
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 2. Red-Flag Triage Quick-Check Bar */}
      <section className="border border-zinc-200 bg-white p-4 rounded-sm space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900">
            <span className="font-mono text-[10px] uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-1 py-0.2 rounded-xs">
              CRITICAL
            </span>
            <span>Red-Flag Triage Quick-Check</span>
          </div>
          <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
            HEURISTIC ENGINE • ZERO LATENCY
          </span>
        </div>

        <p className="text-xs text-zinc-600 leading-normal">
          Acute coronary syndrome, FAST stroke, severe anaphylaxis, or respiratory failure screening. Instant heuristic analysis with zero delay.
        </p>

        <form onSubmit={handleCheckEmergency} className="flex gap-2 pt-0.5">
          <Input
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
            placeholder='Try: "crushing chest pain radiating to left arm" or "sudden facial droop"'
            leftIcon={<AlertTriangle className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />}
            className="flex-1"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={checkingEmergency || !symptomInput.trim()}
            isLoading={checkingEmergency}
            rightIcon={<Send className="w-3 h-3" strokeWidth={1.5} />}
            className="shrink-0 font-medium"
          >
            {checkingEmergency ? 'Scanning...' : 'Test Red Flag'}
          </Button>
        </form>

        {emergencyFeedback && (
          <div
            className={`p-2.5 rounded-xs border text-xs flex items-center gap-2 font-mono ${
              emergencyFeedback.type === 'safe'
                ? 'bg-zinc-50 border-zinc-200 text-zinc-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {emergencyFeedback.type === 'safe' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600 shrink-0" strokeWidth={1.5} />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" strokeWidth={1.5} />
            )}
            <span>{emergencyFeedback.text}</span>
          </div>
        )}
      </section>

      {/* 3. Clinical Capabilities & Modules (7 Dedicated Feature Pages) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-zinc-900 uppercase">
              Clinical Capabilities & Modules
            </h2>
            <p className="text-xs text-zinc-500">
              Select any capability below to launch its dedicated full-width feature module.
            </p>
          </div>
          <span className="font-mono text-[11px] text-zinc-500">
            {DOMAINS.length} DEDICATED MODULES
          </span>
        </div>

        {/* 3-Column Clean Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {DOMAINS.map((domain) => {
            const Icon = domain.icon;
            return (
              <div
                key={domain.id}
                onClick={() => onNavigate(domain.id)}
                className="group border border-zinc-200 bg-white p-4 rounded-sm hover:border-zinc-400 transition-colors cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-xs bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 group-hover:bg-zinc-950 group-hover:text-white transition-colors">
                      <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 rounded-xs">
                      {domain.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 group-hover:text-zinc-950 transition-colors">
                      {language === 'en' ? domain.label : domain.labelHi}
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed mt-1 line-clamp-2">
                      {domain.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-800 group-hover:text-zinc-950">
                  <span>Open Feature Page</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Clinical Profile & Baselines Strip */}
      <section className="border border-zinc-200 bg-white p-4 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
            <UserCheck className="w-3.5 h-3.5 text-zinc-600" strokeWidth={1.5} />
            <span>Clinical Profile & Baselines</span>
          </div>
          <p className="text-xs text-zinc-500 leading-normal">
            Record verified drug allergies, chronic conditions, and emergency dispatch contacts.
          </p>
        </div>

        {!user ? (
          <Button
            size="sm"
            variant="primary"
            onClick={onOpenAuth}
            className="shrink-0 text-xs"
          >
            Sign In / Register
          </Button>
        ) : (
          <span className="font-mono text-xs text-zinc-600 border border-zinc-200 bg-zinc-50 px-2 py-1 rounded-xs">
            Profile Active: {user.profile?.firstName || user.email?.split('@')[0]}
          </span>
        )}
      </section>

      {/* Emergency Alert Modal */}
      <EmergencyAlertModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        emergencyData={emergencyResult}
        language={language}
      />
    </div>
  );
}

export default HomePage;
