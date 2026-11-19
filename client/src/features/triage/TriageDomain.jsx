import React, { useState } from 'react';
import axios from 'axios';
import {
  AlertTriangle,
  Send,
  HelpCircle,
  Stethoscope,
  Volume2,
  RefreshCw,
  Eye,
  Camera,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { DomainHeader } from '../../components/shared/DomainHeader';
import EmergencyAlertModal from '../../components/triage/EmergencyAlertModal';

// Config-driven chief complaints and test triggers
const CLINICAL_SCENARIOS = [
  { id: 'chest_pain', label: 'Acute Chest Pain', labelHi: 'सीने में तेज़ दर्द', query: 'crushing chest pain radiating to left arm and jaw with cold sweats' },
  { id: 'stroke', label: 'Stroke FAST Signs', labelHi: 'स्ट्रोक के लक्षण', query: 'sudden facial droop, right arm weakness, and slurred speech' },
  { id: 'anaphylaxis', label: 'Anaphylaxis', labelHi: 'गंभीर एलर्जी', query: 'swelling of lips and throat with audible wheezing after peanut ingestion' },
  { id: 'fever', label: 'Prolonged High Fever', labelHi: 'तेज़ बुखार', query: 'high continuous fever for 5 days with severe headache' },
];

/**
 * Emergency & Adaptive Clinical Triage Domain Module.
 * Route: /features/triage
 * 
 * Rules Adherence:
 * - Lazy service execution: Zero auto-start on mount.
 * - Emergency checks and adaptive sessions execute only when user clicks.
 * - Anti-AI design: Restrained monochrome, sharp borders, zero gradient noise.
 */
export function TriageDomain({ language = 'en' }) {
  // Mode: 'redflag' | 'adaptive' | 'vision'
  const [activeTab, setActiveTab] = useState('redflag');

  // Red-Flag Scanner State
  const [symptomInput, setSymptomInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [emergencyResult, setEmergencyResult] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);

  // Adaptive Triage State (Lazy, zero auto-poll on mount)
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [session, setSession] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [triageLoading, setTriageLoading] = useState(false);

  // Vision Screening State
  const [visionType, setVisionType] = useState('skin_rash');
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionResult, setVisionResult] = useState(null);

  // 1. Red-Flag Emergency Heuristic Scan
  const handleCheckEmergency = async (e, customQuery) => {
    e?.preventDefault();
    const query = (customQuery || symptomInput).trim();
    if (!query) return;

    setScanning(true);
    setScanMessage(null);
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
        setIsAlertOpen(true);
      } else {
        setScanMessage({
          type: 'safe',
          text:
            language === 'en'
              ? '✓ No acute life-threatening emergency indicators detected in this symptom description.'
              : '✓ इस लक्षण विवरण में कोई तीव्र जानलेवा आपातकालीन संकेत नहीं पाया गया।',
        });
      }
    } catch (err) {
      setScanMessage({
        type: 'error',
        text: 'Emergency service unreachable. Ensure /server is running.',
      });
    } finally {
      setScanning(false);
    }
  };

  // 2. Start Adaptive Triage Session (Lazy User Trigger)
  const handleStartAdaptiveSession = async (complaint) => {
    const targetComplaint = complaint || chiefComplaint || 'fever';
    setTriageLoading(true);
    setChiefComplaint(targetComplaint);
    try {
      const res = await axios.post('/api/triage/start', {
        chiefComplaint: targetComplaint,
        language,
      });

      if (res.data.success) {
        setSession(res.data.session);
      }
    } catch (err) {
      console.error('Failed to initiate triage session', err);
    } finally {
      setTriageLoading(false);
    }
  };

  // 3. Submit Answer to Next Discriminator Question
  const handleAnswerQuestion = async (answer) => {
    const answerText = answer || currentAnswer;
    if (!answerText.trim() || !session) return;

    setTriageLoading(true);
    try {
      const res = await axios.post('/api/triage/answer', {
        sessionId: session.id,
        answer: answerText,
        language,
      });

      if (res.data.success) {
        setSession(res.data.session);
        setCurrentAnswer('');
        if (res.data.session.emergencyAlert) {
          setEmergencyResult(res.data.session.emergencyAlert);
          setIsAlertOpen(true);
        }
      }
    } catch (err) {
      console.error('Failed to submit response', err);
    } finally {
      setTriageLoading(false);
    }
  };

  // 4. Vision Screening Trigger
  const handleRunVision = async (type) => {
    setVisionLoading(true);
    try {
      const res = await axios.post('/api/triage/vision/simulate', {
        type: type || visionType,
        language,
      });
      if (res.data.success) {
        setVisionResult(res.data.analysis);
      }
    } catch (err) {
      console.error('Vision analysis error', err);
    } finally {
      setVisionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DomainHeader
        title={language === 'en' ? 'Emergency Scanner & Clinical Triage' : 'आपातकालीन स्कैनर एवं ट्राइएज'}
        description={
          language === 'en'
            ? 'Real-time heuristic evaluation for acute coronary syndrome, stroke FAST criteria, anaphylaxis, and adaptive physician differential inquiry.'
            : 'दिल का दौरा, स्ट्रोक और आपातकालीन लक्षणों की तुरंत जांच करें।'
        }
        tag="Life-Safety Critical"
        badgeVariant="danger"
        actions={
          <div className="flex items-center gap-1 p-0.5 bg-zinc-100 rounded-xs border border-zinc-200 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('redflag')}
              className={`px-2 py-1 rounded-xs transition-colors ${
                activeTab === 'redflag'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Emergency Scanner
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('adaptive')}
              className={`px-2 py-1 rounded-xs transition-colors ${
                activeTab === 'adaptive'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Adaptive Intake
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vision')}
              className={`px-2 py-1 rounded-xs transition-colors ${
                activeTab === 'vision'
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Vision Screening
            </button>
          </div>
        }
      />

      {/* Mode 1: Emergency Red-Flag Scanner */}
      {activeTab === 'redflag' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <CardTitle>Instant Heuristic Red-Flag Diagnostic</CardTitle>
                </div>
                <CardDescription>
                  Evaluates high-acuity keywords against validated emergency triage protocols. Executes without chatbot latency.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleCheckEmergency} className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={symptomInput}
                      onChange={(e) => setSymptomInput(e.target.value)}
                      placeholder='Describe acute symptoms (e.g. "sudden chest tightness radiating to left arm")'
                      leftIcon={<AlertTriangle className="w-3.5 h-3.5 text-zinc-400" />}
                    />
                    <Button
                      type="submit"
                      variant="danger"
                      isLoading={scanning}
                      disabled={!symptomInput.trim()}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      {scanning ? 'Scanning...' : 'Scan Red Flags'}
                    </Button>
                  </div>
                </form>

                {scanMessage && (
                  <div
                    className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                      scanMessage.type === 'safe'
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50/70 border-rose-200 text-rose-800'
                    }`}
                  >
                    {scanMessage.type === 'safe' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{scanMessage.text}</span>
                  </div>
                )}

                {/* Clinical Test Scenarios Driven by Config */}
                <div className="pt-4 border-t border-zinc-100">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                    Or Test Validated Clinical Emergency Profiles:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CLINICAL_SCENARIOS.map((scen) => (
                      <button
                        key={scen.id}
                        type="button"
                        onClick={(e) => {
                          setSymptomInput(scen.query);
                          handleCheckEmergency(e, scen.query);
                        }}
                        className="text-left p-2.5 rounded-lg border border-zinc-200/80 bg-zinc-50/60 hover:bg-zinc-100 hover:border-zinc-300 text-xs text-zinc-800 transition-colors"
                      >
                        <span className="font-semibold block text-zinc-900">
                          {language === 'en' ? scen.label : scen.labelHi}
                        </span>
                        <span className="text-[11px] text-zinc-500 line-clamp-1">
                          "{scen.query}"
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Direct Emergency Helplines</CardTitle>
                <CardDescription>
                  For immediate, life-threatening symptoms, dial local emergency services directly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href="tel:108"
                  className="flex items-center justify-between p-3 rounded-lg border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-900 transition-colors"
                >
                  <div>
                    <span className="text-xs font-bold block">108 - National Emergency Ambulance</span>
                    <span className="text-[11px] text-rose-700">All-India Free Dispatch</span>
                  </div>
                  <Badge variant="danger">24x7</Badge>
                </a>
                <a
                  href="tel:102"
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 transition-colors"
                >
                  <div>
                    <span className="text-xs font-bold block">102 - Maternity & Child Health</span>
                    <span className="text-[11px] text-zinc-500">Government Support</span>
                  </div>
                  <Badge variant="neutral">Direct</Badge>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Mode 2: Adaptive Differential Inquiry (Lazy Initialization) */}
      {activeTab === 'adaptive' && (
        <div className="space-y-4">
          {!session ? (
            <Card className="p-6">
              <EmptyState
                icon={<Stethoscope className="w-6 h-6 text-zinc-500" />}
                title="Physician-Guided Adaptive Intake"
                description="Simulates clinical differential diagnosis by iteratively asking the next most discriminating diagnostic question."
                actionLabel="Start Clinical Intake Session"
                onAction={() => handleStartAdaptiveSession('fever')}
              />
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    <CardTitle>Active Intake Session: {session.chiefComplaint}</CardTitle>
                  </div>
                  <Badge variant="neutral">
                    Question {session.history?.length ? session.history.length + 1 : 1}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Discriminating Question */}
                {session.nextQuestion && (
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Next Best Discriminator Question:
                    </span>
                    <p className="text-sm sm:text-base font-semibold text-zinc-900">
                      {language === 'en'
                        ? session.nextQuestion.text
                        : session.nextQuestion.textHi || session.nextQuestion.text}
                    </p>

                    {/* Pre-formatted options if available */}
                    {session.nextQuestion.options && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {session.nextQuestion.options.map((opt, i) => (
                          <Button
                            key={i}
                            size="sm"
                            variant="outline"
                            onClick={() => handleAnswerQuestion(opt)}
                            disabled={triageLoading}
                          >
                            {opt}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Free-text response input */}
                <div className="flex gap-2">
                  <Input
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your response or select an option above..."
                  />
                  <Button
                    variant="primary"
                    isLoading={triageLoading}
                    disabled={!currentAnswer.trim()}
                    onClick={() => handleAnswerQuestion(currentAnswer)}
                  >
                    Submit
                  </Button>
                </div>

                {/* Differential Diagnosis Possibilities */}
                {session.differentials && session.differentials.length > 0 && (
                  <div className="pt-4 border-t border-zinc-100 space-y-2">
                    <span className="text-xs font-semibold text-zinc-700">
                      Active Differential Possibilities:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {session.differentials.map((diff, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg border border-zinc-200/80 bg-white text-xs"
                        >
                          <div className="flex items-center justify-between font-semibold text-zinc-900">
                            <span>{diff.name}</span>
                            <Badge variant="neutral">{diff.probability || 'Plausible'}</Badge>
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-1">{diff.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Mode 3: Vision Screening (Dermatology / Rash) */}
      {activeTab === 'vision' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              <CardTitle>Multimodal Vision & Dermatology Triage</CardTitle>
            </div>
            <CardDescription>
              Screen acute dermatological rashes, localized erythema, and cellulitis signs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-zinc-600">Select Screening Type:</span>
              {['skin_rash', 'eye_redness', 'wound_infection'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setVisionType(t)}
                  className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                    visionType === t
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {t.replace('_', ' ').toUpperCase()}
                </button>
              ))}
              <Button
                variant="accent"
                size="sm"
                onClick={() => handleRunVision(visionType)}
                isLoading={visionLoading}
                leftIcon={<Camera className="w-3.5 h-3.5" />}
              >
                Simulate Vision OCR Screen
              </Button>
            </div>

            {visionResult && (
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/70 space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-zinc-900">
                  <span>Vision Analysis Result</span>
                  <Badge variant="accent">{visionResult.severity || 'Non-Critical'}</Badge>
                </div>
                <p className="text-zinc-600 leading-relaxed">{visionResult.description}</p>
                {visionResult.recommendation && (
                  <p className="text-emerald-700 font-medium">
                    Recommendation: {visionResult.recommendation}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Emergency Alert Modal (Reused) */}
      <EmergencyAlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        emergencyData={emergencyResult}
        language={language}
      />
    </div>
  );
}

export default TriageDomain;
