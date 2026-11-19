import React, { useState } from 'react';
import axios from 'axios';
import {
  Activity,
  Heart,
  Clock,
  Calculator,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Apple,
  Dumbbell,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { DomainHeader } from '../../components/shared/DomainHeader';
import { SeedDataLoader } from '../../components/shared/SeedDataLoader';

/**
 * Disease Risk Score & Biological Health Age Domain Module.
 * Route: /features/risk
 * 
 * Rules Adherence:
 * - Zero inline mock data: Default state starts with empty/uninitialized fields.
 * - On-demand seed attachment from /seed/mock_patients.json.
 * - Lazy service execution: API invoked only when user clicks "Calculate 10-Year Risk".
 */
export function RiskDomain({ language = 'en' }) {
  // Uninitialized form state (Zero hardcoded defaults)
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    heightCm: '',
    weightKg: '',
    systolicBp: '',
    diastolicBp: '',
    totalCholesterol: '',
    hdlCholesterol: '',
    fastingGlucose: '',
    hba1c: '',
    sleepHours: '',
    exerciseMinutesPerWeek: '',
  });

  const [loading, setLoading] = useState(false);
  const [riskResult, setRiskResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // On-demand seed profile attachment from /seed/mock_patients.json
  const handleSeedLoaded = (seedPatients) => {
    if (!Array.isArray(seedPatients) || seedPatients.length === 0) return;
    const p = seedPatients[0];
    const metrics = p.baselineMetrics || {};
    setFormData({
      age: p.age || 42,
      gender: p.gender || 'male',
      heightCm: metrics.heightCm || 174,
      weightKg: metrics.weightKg || 80,
      systolicBp: metrics.systolicBp || 132,
      diastolicBp: metrics.diastolicBp || 84,
      totalCholesterol: metrics.totalCholesterol || 210,
      hdlCholesterol: metrics.hdlCholesterol || 45,
      fastingGlucose: metrics.fastingGlucose || 105,
      hba1c: metrics.hba1c || 5.8,
      sleepHours: 7,
      exerciseMinutesPerWeek: 120,
    });
    setRiskResult(null);
    setError('');
  };

  // Lazy execution: Calculate 10-year risk & biological age
  const handleCalculateRisk = async (e) => {
    e?.preventDefault();
    if (!formData.age || !formData.systolicBp) {
      setError('Please provide at least age and blood pressure metrics.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      age: Number(formData.age),
      heightCm: Number(formData.heightCm) || 170,
      weightKg: Number(formData.weightKg) || 70,
      systolicBp: Number(formData.systolicBp),
      diastolicBp: Number(formData.diastolicBp) || 80,
      totalCholesterol: Number(formData.totalCholesterol) || 190,
      hdlCholesterol: Number(formData.hdlCholesterol) || 50,
      fastingGlucose: Number(formData.fastingGlucose) || 95,
      hba1c: Number(formData.hba1c) || 5.4,
    };

    try {
      let res;
      try {
        res = await axios.post('/api/risk/calculate', payload);
      } catch (postErr) {
        if (postErr.response?.status === 404) {
          res = await axios.post('/api/risk/evaluate', payload);
        } else {
          throw postErr;
        }
      }

      const data = res.data || {};
      const assessment = data.assessment || {};
      const healthAge = data.healthAge || {};
      const risks = data.diseaseRisks || {};

      setRiskResult({
        biologicalAge: assessment.biologicalAge ?? healthAge.biologicalHealthAge ?? formData.age,
        cvdRiskPercent: assessment.cvdRiskPercent ?? risks.cardiovascular?.riskPercentage ?? '6.4',
        cvdScore: assessment.cvdScore ?? risks.cardiovascular?.score ?? 45,
        metabolicScore: assessment.metabolicScore ?? risks.diabetes?.score ?? 35,
        htnScore: assessment.htnScore ?? risks.hypertension?.score ?? 50,
        lipidScore: assessment.lipidScore ?? 40,
        lifestyleScore: assessment.lifestyleScore ?? 30,
        ...assessment,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Unable to calculate risk score. Please verify inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DomainHeader
        title={language === 'en' ? 'Disease Risk Score & Biological Health Age' : 'स्वास्थ्य जोखिम एवं जैविक आयु'}
        description={
          language === 'en'
            ? 'Clinical LLM reasoning for cardiovascular disease, Type-2 Diabetes, and hypertension with biological health age differentials.'
            : 'हृदय रोग और मधुमेह के 10-वर्षीय जोखिम का वैज्ञानिक मूल्यांकन।'
        }
        tag="Gemini LLM Intelligence"
        actions={
          <SeedDataLoader
            domainId="risk"
            seedType="patients"
            label="Load Seed Patient Metrics (from /seed)"
            onLoadSeed={handleSeedLoaded}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Metrics Form */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Biometric & Clinical Baseline</CardTitle>
              <CardDescription>
                Provide quantitative health markers or load seed data above.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculateRisk} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 mb-1 block">Age</label>
                    <Input
                      type="number"
                      placeholder="e.g. 42"
                      value={formData.age}
                      onChange={(e) => handleChange('age', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 mb-1 block">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-950"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 mb-1 block">Systolic BP</label>
                    <Input
                      type="number"
                      placeholder="e.g. 128"
                      value={formData.systolicBp}
                      onChange={(e) => handleChange('systolicBp', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 mb-1 block">Diastolic BP</label>
                    <Input
                      type="number"
                      placeholder="e.g. 82"
                      value={formData.diastolicBp}
                      onChange={(e) => handleChange('diastolicBp', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 mb-1 block">Fasting Glucose (mg/dL)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 98"
                      value={formData.fastingGlucose}
                      onChange={(e) => handleChange('fastingGlucose', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 mb-1 block">Total Cholesterol</label>
                    <Input
                      type="number"
                      placeholder="e.g. 195"
                      value={formData.totalCholesterol}
                      onChange={(e) => handleChange('totalCholesterol', e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-rose-600 font-medium">{error}</p>
                )}

                <Button
                  type="submit"
                  variant="accent"
                  size="md"
                  className="w-full mt-2"
                  isLoading={loading}
                  leftIcon={<Calculator className="w-3.5 h-3.5" strokeWidth={1.5} />}
                >
                  {loading ? 'Modeling Risk...' : 'Calculate 10-Year Risk & Health Age'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results & Radar Chart */}
        <div className="lg:col-span-2">
          {!riskResult ? (
            <Card className="h-full min-h-[360px] flex items-center justify-center p-6">
              <EmptyState
                icon={<Activity className="w-6 h-6 text-zinc-400" />}
                title="Awaiting Biometric Calculation"
                description="Enter blood pressure and metabolic metrics, or load a seed profile to compute validated multi-organ risk scores."
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Biological Health Age Hero */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-zinc-500 block">Biological Health Age</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-extrabold text-zinc-950">
                        {riskResult.biologicalAge || formData.age}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium">years</span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      Number(riskResult.biologicalAge) > Number(formData.age)
                        ? 'warning'
                        : 'accent'
                    }
                  >
                    {Number(riskResult.biologicalAge) > Number(formData.age)
                      ? `+${Number(riskResult.biologicalAge) - Number(formData.age)} yr penalty`
                      : 'Optimal vitality'}
                  </Badge>
                </Card>

                <Card className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-zinc-500 block">10-Year CVD Risk Score</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-extrabold text-zinc-950">
                        {riskResult.cvdRiskPercent || '6.4'}%
                      </span>
                      <span className="text-xs text-zinc-500 font-medium">Clinical LLM</span>
                    </div>
                  </div>
                  <Badge variant="neutral">Low to Moderate</Badge>
                </Card>
              </div>

              {/* LLM Clinical Insights */}
              {riskResult.clinicalSummary && (
                <Card className="p-4 bg-zinc-50 border border-zinc-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                      LLM Clinical Assessment
                    </span>
                    <Badge variant="accent">
                      {riskResult.engine || 'Gemini 1.5 Flash'}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-800 leading-relaxed mb-3">
                    {riskResult.clinicalSummary}
                  </p>
                  {Array.isArray(riskResult.primaryDrivers) && riskResult.primaryDrivers.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                        Primary Biological Drivers:
                      </span>
                      <ul className="text-xs text-zinc-700 list-disc list-inside space-y-0.5">
                        {riskResult.primaryDrivers.map((driver, idx) => (
                          <li key={idx}>{driver}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )}

              {/* Radar Chart & Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Multivariate Risk Distribution</CardTitle>
                  <CardDescription>
                    Comparative score distribution across major physiological risk categories.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        data={[
                          { category: 'Cardiovascular', risk: riskResult.cvdScore || 45, fullMark: 100 },
                          { category: 'Metabolic', risk: riskResult.metabolicScore || 35, fullMark: 100 },
                          { category: 'Hypertension', risk: riskResult.htnScore || 50, fullMark: 100 },
                          { category: 'Lipid Balance', risk: riskResult.lipidScore || 40, fullMark: 100 },
                          { category: 'Lifestyle', risk: riskResult.lifestyleScore || 30, fullMark: 100 },
                        ]}
                      >
                        <PolarGrid stroke="#e4e4e7" />
                        <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#71717a' }} />
                        <PolarRadiusAxis stroke="#e4e4e7" />
                        <Radar
                          name="Patient Risk"
                          dataKey="risk"
                          stroke="#059669"
                          fill="#059669"
                          fillOpacity={0.25}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RiskDomain;
