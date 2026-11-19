import React, { useState } from 'react';
import axios from 'axios';
import {
  BookOpen,
  Search,
  ShieldAlert,
  Salad,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Send,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { DomainHeader } from '../../components/shared/DomainHeader';
import { SeedDataLoader } from '../../components/shared/SeedDataLoader';

const SYMPTOM_OPTIONS = [
  { id: 'hair fall', label: 'Hair Fall / Shedding (बाल झड़ना)' },
  { id: 'fatigue', label: 'Chronic Fatigue & Lethargy (थकान)' },
  { id: 'pale skin', label: 'Pale Skin & Pallor (पीलापन)' },
  { id: 'brittle nails', label: 'Brittle or Spoon Nails (कमजोर नाखून)' },
  { id: 'bone pain', label: 'Deep Bone / Back Ache (हड्डियों में दर्द)' },
  { id: 'muscle cramps', label: 'Muscle Cramps & Spasms (मांसपेशियों में ऐंठन)' },
];

/**
 * Clinical Intelligence Domain Module (RAG, Myth Buster, Nutrition).
 * Route: /features/knowledge
 * 
 * Rules Adherence:
 * - Zero inline mock data: Default empty state.
 * - On-demand seed loader for clinical guideline references.
 * - Lazy service execution: RAG, Myth, and Nutrition queries run strictly on user submit.
 */
export function KnowledgeDomain({ language = 'en' }) {
  // 'rag' | 'myth' | 'nutrition'
  const [activeTab, setActiveTab] = useState('rag');

  // RAG State
  const [ragQuery, setRagQuery] = useState('');
  const [ragLoading, setRagLoading] = useState(false);
  const [ragResult, setRagResult] = useState(null);

  // Myth Buster State
  const [mythClaim, setMythClaim] = useState('');
  const [mythLoading, setMythLoading] = useState(false);
  const [mythResult, setMythResult] = useState(null);

  // Nutrition State
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionResult, setNutritionResult] = useState(null);

  // On-demand seed loader from /seed/mock_guidelines.json
  const handleSeedLoaded = (seedGuidelines) => {
    if (!Array.isArray(seedGuidelines) || seedGuidelines.length === 0) return;
    const sample = seedGuidelines[0];
    setRagQuery(sample.topic || 'Dengue management fluid protocol');
  };

  // 1. Lazy RAG Query
  const handleAskRAG = async (e) => {
    e?.preventDefault();
    const q = ragQuery.trim();
    if (!q) return;

    setRagLoading(true);
    try {
      const res = await axios.post('/api/knowledge/ask', {
        query: q,
        language,
      });
      if (res.data.success) {
        setRagResult(res.data.answer);
      }
    } catch (err) {
      console.warn('RAG query failed', err);
    } finally {
      setRagLoading(false);
    }
  };

  // 2. Lazy Myth Buster Check
  const handleVerifyMyth = async (e) => {
    e?.preventDefault();
    const claim = mythClaim.trim();
    if (!claim) return;

    setMythLoading(true);
    try {
      const res = await axios.post('/api/knowledge/myth/verify', {
        claim,
        language,
      });
      if (res.data.success) {
        setMythResult(res.data.verification);
      }
    } catch (err) {
      console.warn('Myth verification failed', err);
    } finally {
      setMythLoading(false);
    }
  };

  // 3. Lazy Nutrition Deficiency Screen
  const handleCheckNutrition = async () => {
    if (selectedSymptoms.length === 0) return;
    setNutritionLoading(true);
    try {
      const res = await axios.post('/api/knowledge/deficiency/check', {
        symptoms: selectedSymptoms,
        language,
      });
      if (res.data.success) {
        setNutritionResult(res.data.analysis);
      }
    } catch (err) {
      console.warn('Nutrition check failed', err);
    } finally {
      setNutritionLoading(false);
    }
  };

  const toggleSymptom = (symId) => {
    if (selectedSymptoms.includes(symId)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symId));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symId]);
    }
  };

  return (
    <div className="space-y-6">
      <DomainHeader
        title={language === 'en' ? 'Clinical Intelligence & Evidence Engine' : 'चिकित्सा ज्ञान एवं साक्ष्य सहायक'}
        description={
          language === 'en'
            ? 'Peer-reviewed evidence retrieval from WHO, CDC, and Indian Health Guidelines with automated medical misinformation detection.'
            : 'प्रमाणित चिकित्सा दिशा-निर्देशों से उत्तर प्राप्त करें और स्वास्थ्य भ्रांतियों की जांच करें।'
        }
        tag="Peer-Reviewed RAG"
        actions={
          <div className="flex items-center gap-2">
            <SeedDataLoader
              domainId="knowledge"
              seedType="guidelines"
              label="Load Seed Guidelines (from /seed)"
              onLoadSeed={handleSeedLoaded}
            />
            <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg border border-zinc-200">
              <button
                type="button"
                onClick={() => setActiveTab('rag')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'rag' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Grounded RAG
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('myth')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'myth' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Myth Buster
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('nutrition')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'nutrition' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Deficiency Finder
              </button>
            </div>
          </div>
        }
      />

      {/* Tab 1: Grounded Clinical RAG */}
      {activeTab === 'rag' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evidence-Grounded Clinical Inquiries</CardTitle>
              <CardDescription>
                Ask clinical treatment guidelines or diagnostic queries. Answers are constrained strictly to peer-reviewed sources.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAskRAG} className="flex gap-2">
                <Input
                  value={ragQuery}
                  onChange={(e) => setRagQuery(e.target.value)}
                  placeholder='e.g. "WHO management protocol for Dengue fever fluid resuscitation"'
                  leftIcon={<Search className="w-3.5 h-3.5 text-zinc-400" />}
                />
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={ragLoading}
                  disabled={!ragQuery.trim()}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Query Guidelines
                </Button>
              </form>

              {ragResult ? (
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900">Clinical Recommendation</span>
                    <Badge variant="accent">Citations Verified</Badge>
                  </div>
                  <p className="text-zinc-700 leading-relaxed whitespace-pre-line">
                    {ragResult.text || ragResult}
                  </p>
                </div>
              ) : (
                <EmptyState
                  title="No Evidence Query Run"
                  description="Submit a question above or load guideline seed prompts to execute the RAG search."
                  className="py-6"
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Medical Myth Buster */}
      {activeTab === 'myth' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <CardTitle>Medical Misinformation & Forward Verifier</CardTitle>
            </div>
            <CardDescription>
              Verify viral health claims, alternative "cures", and forwarded WhatsApp advice against published medical literature.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleVerifyMyth} className="flex gap-2">
              <Input
                value={mythClaim}
                onChange={(e) => setMythClaim(e.target.value)}
                placeholder='e.g. "Drinking boiled papaya leaf extract cures low platelets in dengue within 2 hours"'
              />
              <Button
                type="submit"
                variant="accent"
                isLoading={mythLoading}
                disabled={!mythClaim.trim()}
              >
                Verify Claim
              </Button>
            </form>

            {mythResult ? (
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900">Scientific Consensus Verdict</span>
                  <Badge variant={mythResult.verdict === 'False' ? 'danger' : 'warning'}>
                    {mythResult.verdict?.toUpperCase() || 'MISLEADING'}
                  </Badge>
                </div>
                <p className="text-zinc-600 leading-relaxed">{mythResult.explanation}</p>
              </div>
            ) : (
              <EmptyState
                title="Awaiting Health Claim"
                description="Enter a suspected medical rumor or dietary claim to evaluate scientific consensus."
                className="py-6"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Micronutrient Deficiency Finder */}
      {activeTab === 'nutrition' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Salad className="w-4 h-4 text-emerald-600" />
              <CardTitle>Micronutrient Deficiency Indicator</CardTitle>
            </div>
            <CardDescription>
              Select observed physical signs to map likely vitamin or mineral insufficiencies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => toggleSymptom(sym.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-zinc-950 text-white border-zinc-950'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {sym.label}
                  </button>
                );
              })}
            </div>

            <Button
              variant="primary"
              size="sm"
              disabled={selectedSymptoms.length === 0}
              isLoading={nutritionLoading}
              onClick={handleCheckNutrition}
            >
              Analyze Deficiencies ({selectedSymptoms.length} selected)
            </Button>

            {nutritionResult && (
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
                <span className="font-bold text-zinc-900 block">Identified Micronutrient Targets:</span>
                <p className="text-zinc-600 leading-relaxed">{nutritionResult.summary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default KnowledgeDomain;
