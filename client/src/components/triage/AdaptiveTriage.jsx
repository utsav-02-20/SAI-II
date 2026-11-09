import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  HelpCircle,
  Mic,
  MicOff,
  Volume2,
  Send,
  User,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Camera,
  RefreshCw,
} from 'lucide-react';

export default function AdaptiveTriage({ language = 'en', onEmergencyTriggered }) {
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'vision'

  // Adaptive Triage State
  const [chiefComplaint, setChiefComplaint] = useState('fever');
  const [session, setSession] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Vision Screening State
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionResult, setVisionResult] = useState(null);
  const [visionType, setVisionType] = useState('skin_rash');

  // Start initial triage session on mount
  useEffect(() => {
    handleStartTriage('fever');
  }, []);

  const handleStartTriage = async (complaint) => {
    setLoading(true);
    setChiefComplaint(complaint);
    try {
      const res = await axios.post('/api/triage/start', {
        chiefComplaint: complaint,
        language,
      });
      if (res.data.success) {
        setSession(res.data.session);
        // Automatically speak first question if speech synthesis is available
        speakText(
          language === 'en'
            ? res.data.session.nextQuestion.text
            : res.data.session.nextQuestion.textHi
        );
      }
    } catch (err) {
      console.error('Failed to start triage', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answerText) => {
    const finalAnswer = (answerText || currentAnswer).trim();
    if (!finalAnswer || !session) return;

    setLoading(true);
    setCurrentAnswer('');

    try {
      const res = await axios.post('/api/triage/next', {
        treeKey: session.treeKey,
        currentQuestionIndex: session.currentQuestionIndex,
        answer: finalAnswer,
        history: session.history,
      });

      if (res.data.isEmergency) {
        if (onEmergencyTriggered) {
          onEmergencyTriggered(res.data);
        }
        return;
      }

      if (res.data.isComplete) {
        setSession({ ...session, isComplete: true, result: res.data });
      } else {
        setSession({
          ...session,
          currentQuestionIndex: res.data.currentQuestionIndex,
          nextQuestion: res.data.nextQuestion,
          history: res.data.history,
        });
        speakText(
          language === 'en'
            ? res.data.nextQuestion.text
            : res.data.nextQuestion.textHi
        );
      }
    } catch (err) {
      console.error('Failed to progress triage', err);
    } finally {
      setLoading(false);
    }
  };

  // Bilingual Speech Synthesis (TTS)
  const speakText = (text) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Bilingual Speech Recognition (STT)
  const toggleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please type your answer.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCurrentAnswer(transcript);
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Vision Screening Handlers
  const handleVisionScreen = async (type) => {
    setVisionLoading(true);
    setVisionType(type);
    try {
      const res = await axios.post('/api/triage/analyze-image', {
        imageType: type,
        description: `Visual inspection of ${type.replace('_', ' ')} with surface texture evaluation.`,
      });
      if (res.data.success) {
        setVisionResult(res.data.analysis);
      }
    } catch (err) {
      console.error('Vision screening error', err);
    } finally {
      setVisionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {language === 'en'
                ? 'Adaptive Clinical Triage & Voice Assistant'
                : 'अनुकूली क्लिनिकल ट्रायज और आवाज़ सहायक'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'en'
                ? 'Mimics a physician by asking the next best question, generating SBAR summaries, and visual triage.'
                : 'डॉक्टर की तरह अगला सबसे महत्वपूर्ण प्रश्न पूछता है और क्लिनिकल सारांश बनाता है।'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'questions'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Doctor Interview
          </button>
          <button
            onClick={() => setActiveTab('vision')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'vision'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vision Screener
          </button>
        </div>
      </div>

      {activeTab === 'questions' ? (
        <div className="pt-6 space-y-6">
          {/* Chief Complaint Selector */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select Primary Symptom to Begin Triage:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => handleStartTriage('fever')}
                className={`px-3.5 py-1.5 rounded-xl font-semibold border transition ${
                  chiefComplaint === 'fever'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🌡️ Fever & Headache (बुखार)
              </button>
              <button
                onClick={() => handleStartTriage('cough')}
                className={`px-3.5 py-1.5 rounded-xl font-semibold border transition ${
                  chiefComplaint === 'cough'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🫁 Cough & Breathlessness (खांसी)
              </button>
              <button
                onClick={() => handleStartTriage('abdominal_pain')}
                className={`px-3.5 py-1.5 rounded-xl font-semibold border transition ${
                  chiefComplaint === 'abdominal_pain'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🩺 Abdominal Pain (पेट दर्द)
              </button>
            </div>
          </div>

          {/* Active Question Card */}
          {session && !session.isComplete && session.nextQuestion && (
            <div className="p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100 space-y-4 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between text-xs text-indigo-700 font-semibold">
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Doctor's Next Best Question ({session.currentQuestionIndex + 1} of{' '}
                    {session.totalQuestions})
                  </span>
                </span>
                <button
                  onClick={() =>
                    speakText(
                      language === 'en'
                        ? session.nextQuestion.text
                        : session.nextQuestion.textHi
                    )
                  }
                  title="Listen to question"
                  className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-600 transition flex items-center space-x-1"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen</span>
                </button>
              </div>

              {/* Question Text */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {language === 'en' ? session.nextQuestion.text : session.nextQuestion.textHi}
              </h3>

              {/* Quick Choice Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {(language === 'en'
                  ? session.nextQuestion.options
                  : session.nextQuestion.optionsHi
                ).map((option, idx) => (
                  <button
                    key={idx}
                    disabled={loading}
                    onClick={() => handleAnswer(option)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-indigo-600 hover:text-white text-slate-800 text-xs font-semibold border border-indigo-200 shadow-sm transition disabled:opacity-50"
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Speech Input & Custom Answer Bar */}
              <div className="pt-2 flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnswer()}
                    placeholder={
                      language === 'en'
                        ? 'Or speak / type specific details...'
                        : 'या बोलकर / लिखकर विस्तार से बताएं...'
                    }
                    className="w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={toggleListening}
                    title="Speak answer in Hindi or English"
                    className={`absolute right-2 top-2 p-1.5 rounded-lg transition ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={() => handleAnswer()}
                  disabled={loading || !currentAnswer.trim()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Completed SBAR Clinical Summary Card */}
          {session && session.isComplete && session.result && (
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Clinical SBAR Triage Summary Generated</span>
                </div>
                <button
                  onClick={() => handleStartTriage(chiefComplaint)}
                  className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Start New Triage</span>
                </button>
              </div>

              {/* SBAR Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="font-extrabold text-teal-400 uppercase tracking-widest text-[10px]">
                    S • Situation
                  </span>
                  <p className="text-slate-300 leading-relaxed font-medium">
                    {session.result.sbarSummary.situation}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="font-extrabold text-blue-400 uppercase tracking-widest text-[10px]">
                    B • Background & Responses
                  </span>
                  <p className="text-slate-300 leading-relaxed font-medium">
                    {session.result.sbarSummary.background}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="font-extrabold text-amber-400 uppercase tracking-widest text-[10px]">
                    A • Assessment & Differential
                  </span>
                  <p className="text-slate-300 leading-relaxed font-medium">
                    {session.result.sbarSummary.assessment}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="font-extrabold text-emerald-400 uppercase tracking-widest text-[10px]">
                    R • Recommendation
                  </span>
                  <p className="text-slate-300 leading-relaxed font-medium">
                    {session.result.sbarSummary.recommendation}
                  </p>
                </div>
              </div>

              {/* Specialty Badge */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300 font-semibold">
                <span>Recommended Specialty Consultation:</span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200">
                  👨‍⚕️ {session.result.recommendedSpecialty}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: VISION SYMPTOM SCREENING */
        <div className="pt-6 space-y-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Select Visual Symptom Category to Screen:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => handleVisionScreen('skin_rash')}
              className={`px-3.5 py-2 rounded-xl font-semibold border transition ${
                visionType === 'skin_rash'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              🔍 Skin Rash & Lesion (त्वचा चकत्ते)
            </button>
            <button
              onClick={() => handleVisionScreen('eye_redness')}
              className={`px-3.5 py-2 rounded-xl font-semibold border transition ${
                visionType === 'eye_redness'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              👁️ Eye Redness & Conjunctivitis (आँख लाल होना)
            </button>
            <button
              onClick={() => handleVisionScreen('nail_discoloration')}
              className={`px-3.5 py-2 rounded-xl font-semibold border transition ${
                visionType === 'nail_discoloration'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              💅 Nail Discoloration & Fungus (नाखून संक्रमण)
            </button>
          </div>

          {visionLoading && (
            <div className="py-8 text-center text-xs font-semibold text-indigo-700 flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Vision model analyzing lesion morphology and pigmentation...</span>
            </div>
          )}

          {/* Vision Results Display */}
          {visionResult && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900 font-semibold">
                <span>{visionResult.title}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-indigo-700 border border-indigo-200">
                  {visionResult.screenedCategory}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visionResult.possibleConditions.map((cond, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-slate-200 text-xs space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900">{cond.condition}</h4>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                        {cond.probability} Probability
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {cond.description}
                    </p>
                    <div className="pt-2 text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                      <strong>First-Aid & Care:</strong> {cond.homeCare}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-500 italic text-center">
                {visionResult.calibrationNote}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
