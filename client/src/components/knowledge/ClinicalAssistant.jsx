import React, { useState } from 'react';
import axios from 'axios';
import {
  BookOpen,
  Search,
  ShieldAlert,
  Salad,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Send,
  HelpCircle,
  Apple,
  FileCheck2,
} from 'lucide-react';

export default function ClinicalAssistant({ language = 'en' }) {
  const [activeTab, setActiveTab] = useState('rag'); // 'rag' | 'myth' | 'nutrition'

  // 1. RAG State
  const [ragQuery, setRagQuery] = useState('');
  const [ragLoading, setRagLoading] = useState(false);
  const [ragResult, setRagResult] = useState(null);

  // 2. Myth Buster State
  const [mythClaim, setMythClaim] = useState('');
  const [mythLoading, setMythLoading] = useState(false);
  const [mythResult, setMythResult] = useState(null);

  // 3. Nutrition Deficiency State
  const [selectedSymptoms, setSelectedSymptoms] = useState(['hair fall', 'fatigue', 'pale skin']);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionResult, setNutritionResult] = useState(null);

  const availableSymptoms = [
    { id: 'hair fall', label: 'Hair Fall / Shedding (बाल झड़ना)' },
    { id: 'fatigue', label: 'Chronic Fatigue & Lethargy (थकान)' },
    { id: 'pale skin', label: 'Pale Skin & Pallor (पीलापन)' },
    { id: 'brittle nails', label: 'Brittle or Spoon Nails (कमजोर नाखून)' },
    { id: 'bone pain', label: 'Deep Bone / Back Ache (हड्डियों में दर्द)' },
    { id: 'muscle cramps', label: 'Muscle Cramps & Spasms (मांसपेशियों में ऐंठन)' },
    { id: 'mouth ulcers', label: 'Frequent Mouth Ulcers (मुंह में छाले)' },
    { id: 'tingling in fingers', label: 'Tingling / Numbness (हाथ-पैरों में झुनझुनी)' },
    { id: 'loss of taste', label: 'Impaired Taste / Smell (स्वाद में कमी)' },
  ];

  // RAG Handler
  const handleAskRAG = async (queryText) => {
    const q = (queryText || ragQuery).trim();
    if (!q) return;

    setRagLoading(true);
    setRagQuery(q);

    try {
      const res = await axios.post('/api/knowledge/ask', { query: q });
      if (res.data.success) {
        setRagResult(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRagLoading(false);
    }
  };

  // Myth Handler
  const handleCheckMyth = async (claimText) => {
    const c = (claimText || mythClaim).trim();
    if (!c) return;

    setMythLoading(true);
    setMythClaim(c);

    try {
      const res = await axios.post('/api/knowledge/check-myth', { claim: c });
      if (res.data.success) {
        setMythResult(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMythLoading(false);
    }
  };

  // Nutrition Handler
  const toggleSymptom = (symId) => {
    if (selectedSymptoms.includes(symId)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symId));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symId]);
    }
  };

  const handleDetectNutrition = async () => {
    if (selectedSymptoms.length === 0) return;
    setNutritionLoading(true);

    try {
      const res = await axios.post('/api/knowledge/detect-deficiency', {
        symptoms: selectedSymptoms,
      });
      if (res.data.success) {
        setNutritionResult(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNutritionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {language === 'en'
                ? 'Clinical Knowledge, Myth Buster & Nutrition Engine'
                : 'प्रमाणित चिकित्सा ज्ञान, गलत सूचना जांच और पोषण इंजन'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'en'
                ? 'Zero-hallucination WHO/CDC citations, viral myth debunking, and micronutrient screening.'
                : 'विश्व स्वास्थ्य संगठन प्रमाणित उत्तर, गलत सूचना जांच और विटामिन कमी की पहचान।'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('rag')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'rag' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📚 Evidence RAG
          </button>
          <button
            onClick={() => setActiveTab('myth')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'myth' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🛡️ Myth Buster
          </button>
          <button
            onClick={() => {
              setActiveTab('nutrition');
              if (!nutritionResult) handleDetectNutrition();
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'nutrition' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🥗 Nutrition Deficiency
          </button>
        </div>
      </div>

      {/* TAB 1: EVIDENCE RAG ASSISTANT */}
      {activeTab === 'rag' && (
        <div className="pt-6 space-y-6 animate-fade-in">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Verified Medical Topic Suggestions:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => handleAskRAG('What is the standard treatment protocol for uncomplicated malaria?')}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold border border-blue-200/60 transition"
              >
                🦟 WHO Malaria Protocol (ACT & Primaquine)
              </button>
              <button
                onClick={() => handleAskRAG('What is the clinical management and fluid protocol for dengue?')}
                className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold border border-teal-200/60 transition"
              >
                💧 Dengue Fluid Protocol & NSAID Warning
              </button>
              <button
                onClick={() => handleAskRAG('What is the first-line pharmacotherapy for Type 2 Diabetes?')}
                className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold border border-purple-200/60 transition"
              >
                🍬 ADA & ICMR Type 2 Diabetes Guidelines
              </button>
            </div>
          </div>

          {/* Search Query Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskRAG()}
                placeholder="Ask clinical question (e.g. hypertension target, pediatric ORS protocol)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => handleAskRAG()}
              disabled={ragLoading || !ragQuery.trim()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition disabled:opacity-50 flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{ragLoading ? 'Retrieving...' : 'Retrieve Evidence'}</span>
            </button>
          </div>

          {/* RAG Results Display */}
          {ragResult && (
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{ragResult.retrievedGuideline.organization} Grounded Guideline</span>
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold">
                  Published {ragResult.retrievedGuideline.year}
                </span>
              </div>

              <h3 className="text-base font-bold text-white leading-snug">
                {ragResult.retrievedGuideline.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {ragResult.retrievedGuideline.summary}
              </p>

              {/* Key Clinical Recommendations */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider block">
                  Key Clinical Highlights:
                </span>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  {ragResult.retrievedGuideline.keyPoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>

              {/* Official Verified Citations */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <span>Official Guideline Document:</span>
                <a
                  href={ragResult.citations[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-semibold underline"
                >
                  <span>View Source Publication</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MYTH BUSTER & MISINFORMATION DETECTOR */}
      {activeTab === 'myth' && (
        <div className="pt-6 space-y-6 animate-fade-in">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              High-Velocity Online Health Claims:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => handleCheckMyth('Can dengue be cured by papaya leaves?')}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold border border-amber-200/60 transition"
              >
                🍃 Papaya Leaves & Dengue Cure
              </button>
              <button
                onClick={() => handleCheckMyth('Can drinking colloidal silver cure viral infections?')}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 font-semibold border border-red-200/60 transition"
              >
                ⚠️ Colloidal Silver for Infection
              </button>
              <button
                onClick={() => handleCheckMyth('Does eating raw garlic cure COVID-19 or flu?')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border border-slate-200 transition"
              >
                🧄 Garlic as Antiviral Cure
              </button>
              <button
                onClick={() => handleCheckMyth('Do childhood vaccines cause autism?')}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 font-semibold border border-red-200/60 transition"
              >
                💉 Vaccines & Autism Myth
              </button>
            </div>
          </div>

          {/* Claim Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={mythClaim}
              onChange={(e) => setMythClaim(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckMyth()}
              placeholder="Paste social media health forward or claim to verify..."
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={() => handleCheckMyth()}
              disabled={mythLoading || !mythClaim.trim()}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm transition disabled:opacity-50"
            >
              {mythLoading ? 'Verifying...' : 'Fact-Check Claim'}
            </button>
          </div>

          {/* Myth Buster Result Card */}
          {mythResult && (
            <div
              className={`p-6 rounded-3xl border-2 space-y-4 animate-fade-in shadow-sm ${
                mythResult.verdictColor === 'red'
                  ? 'bg-red-50/70 border-red-400 text-red-950'
                  : 'bg-amber-50/70 border-amber-400 text-amber-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    mythResult.verdictColor === 'red'
                      ? 'bg-red-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  VERDICT: {mythResult.verdictLabel}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Topic: {mythResult.matchedTopic}
                </span>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed text-slate-800 font-medium">
                {mythResult.detailedAnalysis}
              </p>

              <div className="p-3 rounded-2xl bg-white/80 border border-black/5 text-xs text-slate-800">
                <strong>Scientific Consensus:</strong> {mythResult.scientificConsensus}
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-black/10">
                <span className="font-semibold text-slate-600">
                  Evidence Verified Via: {mythResult.officialSource}
                </span>
                <a
                  href={mythResult.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-indigo-700 hover:underline font-bold"
                >
                  <span>Review Research</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: NUTRITIONAL DEFICIENCY DETECTOR */}
      {activeTab === 'nutrition' && (
        <div className="pt-6 space-y-6 animate-fade-in">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select Current Physical Symptoms (Multi-select):
            </span>
            <div className="flex flex-wrap gap-2">
              {availableSymptoms.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    onClick={() => toggleSymptom(sym.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {sym.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleDetectNutrition}
            disabled={nutritionLoading || selectedSymptoms.length === 0}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Salad className="w-4 h-4" />
            <span>
              {nutritionLoading
                ? 'Evaluating Micronutrient Profiles...'
                : `Analyze Micronutrient Deficiencies (${selectedSymptoms.length} Symptoms Selected)`}
            </span>
          </button>

          {/* Nutrition Results Display */}
          {nutritionResult && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-semibold">
                <span>Top Candidate: {nutritionResult.topCandidate}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-emerald-700 border border-emerald-200">
                  {nutritionResult.identifiedDeficiencies.length} Deficiency Match(es)
                </span>
              </div>

              <div className="space-y-4">
                {nutritionResult.identifiedDeficiencies.map((def, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-xs space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900">
                          {def.deficiencyName}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          Matched Symptoms: {def.matchedSymptoms.join(', ')}
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                        {def.matchScore}% Match ({def.confidenceLevel})
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed font-medium">
                      {def.clinicalExplanation}
                    </p>

                    {/* Food Fixes (Veg & Non-Veg) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                        <span className="font-bold text-emerald-800 text-[11px] flex items-center space-x-1">
                          <Apple className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Vegetarian Food Recommendations:</span>
                        </span>
                        <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5">
                          {def.foodRecommendations.vegetarian.map((food, i) => (
                            <li key={i}>{food}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                        <span className="font-bold text-slate-800 text-[11px] flex items-center space-x-1">
                          <Salad className="w-3.5 h-3.5 text-amber-600" />
                          <span>Non-Vegetarian Options & Supplements:</span>
                        </span>
                        <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5">
                          {def.foodRecommendations.nonVegetarian.map((food, i) => (
                            <li key={i}>{food}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Suggested Blood Tests */}
                    <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] flex items-start space-x-2">
                      <FileCheck2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Recommended Diagnostic Blood Tests:</strong>{' '}
                        {def.suggestedDiagnosticTests.join(', ')}.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
