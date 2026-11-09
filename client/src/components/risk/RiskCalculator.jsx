import React, { useState } from 'react';
import axios from 'axios';
import {
  Activity,
  Heart,
  Flame,
  Moon,
  Droplets,
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Dumbbell,
  Apple,
  Clock,
  Printer,
  RotateCcw
} from 'lucide-react';

export default function RiskCalculator({ language = 'en' }) {
  // Input form state
  const [formData, setFormData] = useState({
    age: 35,
    gender: 'male',
    heightCm: 172,
    weightKg: 78,
    systolicBp: 128,
    diastolicBp: 82,
    totalCholesterol: 195,
    hdlCholesterol: 48,
    fastingGlucose: 98,
    hba1c: 5.5,
    sleepHoursPerNight: 6.5,
    exerciseMinutesPerWeek: 90,
    dietQuality: 'moderate',
    stressLevel: 'moderate',
    saltIntake: 'moderate',
    alcoholDrinksPerWeek: 2,
    isSmoker: false,
    familyHistoryDiabetes: false,
    familyHistoryHeartDisease: false,
    familyHistoryHypertension: false,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Live BMI calculation
  const computedBmi = Number(
    (formData.weightKg / Math.pow(formData.heightCm / 100, 2)).toFixed(1)
  );

  const getBmiBadge = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'bg-blue-100 text-blue-700' };
    if (bmi < 25.0) return { label: 'Normal Weight', color: 'bg-emerald-100 text-emerald-700' };
    if (bmi < 30.0) return { label: 'Overweight', color: 'bg-amber-100 text-amber-700' };
    return { label: 'Obese', color: 'bg-rose-100 text-rose-700' };
  };

  const handlePresetHighRisk = () => {
    setFormData({
      age: 42,
      gender: 'male',
      heightCm: 170,
      weightKg: 94,
      systolicBp: 145,
      diastolicBp: 92,
      totalCholesterol: 235,
      hdlCholesterol: 36,
      fastingGlucose: 115,
      hba1c: 6.2,
      sleepHoursPerNight: 5.0,
      exerciseMinutesPerWeek: 30,
      dietQuality: 'poor',
      stressLevel: 'high',
      saltIntake: 'high',
      alcoholDrinksPerWeek: 8,
      isSmoker: true,
      familyHistoryDiabetes: true,
      familyHistoryHeartDisease: true,
      familyHistoryHypertension: true,
    });
  };

  const handlePresetOptimalRunner = () => {
    setFormData({
      age: 45,
      gender: 'female',
      heightCm: 168,
      weightKg: 58,
      systolicBp: 112,
      diastolicBp: 72,
      totalCholesterol: 170,
      hdlCholesterol: 66,
      fastingGlucose: 88,
      hba1c: 5.1,
      sleepHoursPerNight: 8.0,
      exerciseMinutesPerWeek: 320,
      dietQuality: 'anti_inflammatory',
      stressLevel: 'low',
      saltIntake: 'low',
      alcoholDrinksPerWeek: 0,
      isSmoker: false,
      familyHistoryDiabetes: false,
      familyHistoryHeartDisease: false,
      familyHistoryHypertension: false,
    });
  };

  const handleEvaluate = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/api/risk/evaluate', formData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to calculate clinical risk profile');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (cat) => {
    switch (cat) {
      case 'CRITICAL':
        return 'text-rose-700 bg-rose-50 border-rose-300';
      case 'HIGH':
        return 'text-red-700 bg-red-50 border-red-300';
      case 'MODERATE':
        return 'text-amber-700 bg-amber-50 border-amber-300';
      default:
        return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white relative">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold mb-3">
            <Activity className="w-3.5 h-3.5" />
            <span>Phase 6 • Disease Risk Models (ML), Health Age & Prevention Roadmap</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === 'en'
              ? 'Biological Health Age & 10-Year Chronic Disease Risk Engine'
              : 'जैविक स्वास्थ्य आयु एवं 10-वर्षीय क्रोनिक रोग जोखिम कैलकुलेटर'}
          </h2>
          <p className="mt-2 text-teal-100 text-xs sm:text-sm max-w-3xl leading-relaxed">
            {language === 'en'
              ? 'Calculates 10-year risk for Type 2 Diabetes, ASCVD Cardiovascular Disease, and Hypertension using AHA/ACC Pooled Cohort models & ADA clinical algorithms. Estimates biological allostatic wear versus calendar age.'
              : 'हृदय रोग, मधुमेह और उच्च रक्तचाप के 10-वर्षीय जोखिम का वैज्ञानिक विश्लेषण और जैविक आयु निर्धारण।'}
          </p>

          {/* Quick Preset Buttons */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <span className="text-xs text-slate-300 font-medium">Quick Clinical Presets:</span>
            <button
              type="button"
              onClick={handlePresetHighRisk}
              className="text-xs px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 font-medium transition flex items-center space-x-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>High-Risk Metabolic Patient (42y)</span>
            </button>
            <button
              type="button"
              onClick={handlePresetOptimalRunner}
              className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 font-medium transition flex items-center space-x-1"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Marathon Athlete Longevity (45y)</span>
            </button>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Form Inputs Grid */}
        <form onSubmit={handleEvaluate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Age & Gender */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                Demographics
              </span>
              <div>
                <label className="text-xs text-slate-500 block mb-1">
                  Age: <span className="font-bold text-slate-800">{formData.age} years</span>
                </label>
                <input
                  type="range"
                  min="18"
                  max="90"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Biological Sex</label>
                <div className="grid grid-cols-2 gap-2">
                  {['male', 'female'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: g })}
                      className={`text-xs py-1.5 rounded-xl font-medium capitalize border transition ${
                        formData.gender === g
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Body Metrics & BMI */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  Body Anthropometrics
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getBmiBadge(computedBmi).color}`}>
                  BMI {computedBmi} • {getBmiBadge(computedBmi).label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Diet Quality Pattern</label>
                <select
                  value={formData.dietQuality}
                  onChange={(e) => setFormData({ ...formData, dietQuality: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="anti_inflammatory">Anti-inflammatory / Whole-Food (Optimal)</option>
                  <option value="healthy">Balanced Mediterranean Diet</option>
                  <option value="moderate">Average Standard Diet</option>
                  <option value="poor">High Ultra-Processed / High Glycemic</option>
                </select>
              </div>
            </div>

            {/* Lifestyle Factors: Sleep & Exercise */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-600" />
                Sleep & Exercise Rhythm
              </span>
              <div>
                <label className="text-xs text-slate-500 block mb-1">
                  Sleep: <span className="font-bold text-indigo-700">{formData.sleepHoursPerNight} hrs / night</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="11"
                  step="0.5"
                  value={formData.sleepHoursPerNight}
                  onChange={(e) => setFormData({ ...formData, sleepHoursPerNight: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">
                  Cardio Activity:{' '}
                  <span className="font-bold text-teal-700">{formData.exerciseMinutesPerWeek} mins / week</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="420"
                  step="15"
                  value={formData.exerciseMinutesPerWeek}
                  onChange={(e) => setFormData({ ...formData, exerciseMinutesPerWeek: Number(e.target.value) })}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Clinical Vitals & Lab Biomarkers */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-600" />
                Vascular & Metabolic Labs
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">BP (mmHg)</label>
                  <input
                    type="text"
                    value={`${formData.systolicBp}/${formData.diastolicBp}`}
                    onChange={(e) => {
                      const parts = e.target.value.split('/');
                      if (parts.length >= 2) {
                        setFormData({
                          ...formData,
                          systolicBp: Number(parts[0]) || 120,
                          diastolicBp: Number(parts[1]) || 80,
                        });
                      }
                    }}
                    placeholder="120/80"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Cholesterol (mg/dL)</label>
                  <input
                    type="number"
                    value={formData.totalCholesterol}
                    onChange={(e) => setFormData({ ...formData, totalCholesterol: Number(e.target.value) })}
                    placeholder="Total"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">HDL (mg/dL)</label>
                  <input
                    type="number"
                    value={formData.hdlCholesterol}
                    onChange={(e) => setFormData({ ...formData, hdlCholesterol: Number(e.target.value) })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">HbA1c (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.hba1c}
                    onChange={(e) => setFormData({ ...formData, hba1c: Number(e.target.value) })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Checkboxes */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isSmoker}
                onChange={(e) => setFormData({ ...formData, isSmoker: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span className="text-slate-700 font-medium">Active Cigarette Smoker</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.familyHistoryDiabetes}
                onChange={(e) => setFormData({ ...formData, familyHistoryDiabetes: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span className="text-slate-700 font-medium">Family History of Diabetes</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.familyHistoryHeartDisease}
                onChange={(e) => setFormData({ ...formData, familyHistoryHeartDisease: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span className="text-slate-700 font-medium">Family History Heart Disease</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.familyHistoryHypertension}
                onChange={(e) => setFormData({ ...formData, familyHistoryHypertension: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span className="text-slate-700 font-medium">Family History Hypertension</span>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-teal-700/20 flex items-center space-x-2 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Executing ML Risk Engine...' : 'Calculate Disease Risk & Health Age'}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-8 animate-fadeIn">
            {/* 1. Biological Health Age Showcase Dial */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="space-y-3 text-center lg:text-left">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 border border-white/10 text-xs font-semibold">
                    <Award className="w-3.5 h-3.5" />
                    <span>Longevity & Allostatic Balance</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black">
                    {result.healthAge.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                    Based on your sleep architecture, cardiovascular biomarkers, metabolic BMI, and exercise frequency.
                  </p>
                </div>

                {/* Age Comparison Box */}
                <div className="flex items-center gap-6 bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md">
                  <div className="text-center">
                    <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Calendar Age</span>
                    <span className="text-3xl sm:text-4xl font-black text-slate-200">
                      {result.healthAge.chronologicalAge}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Years Old</span>
                  </div>

                  <ArrowRight className="w-6 h-6 text-slate-500" />

                  <div className="text-center">
                    <span className="text-xs text-teal-400 block uppercase tracking-wider font-semibold">Biological Age</span>
                    <span
                      className={`text-3xl sm:text-4xl font-black ${
                        result.healthAge.longevityDeltaYears <= 0
                          ? 'text-emerald-400'
                          : result.healthAge.longevityDeltaYears > 4
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {result.healthAge.biologicalHealthAge}
                    </span>
                    <span className="text-[10px] text-teal-200 block mt-0.5">
                      {result.healthAge.longevityDeltaYears > 0 ? `+${result.healthAge.longevityDeltaYears} Yrs Wear` : `${result.healthAge.longevityDeltaYears} Yrs Youth`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Factor Breakdown Chips */}
              <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                <span className="text-xs font-semibold text-slate-400 block">Biological Factor Impact Breakdown:</span>
                <div className="flex flex-wrap gap-2">
                  {result.healthAge.factorBreakdown?.map((item, idx) => (
                    <div
                      key={idx}
                      className={`text-xs px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 ${
                        item.type === 'bonus'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                      }`}
                      title={item.explanation}
                    >
                      <span>{item.type === 'bonus' ? '✓' : '⚠'}</span>
                      <span className="font-semibold">{item.factor}:</span>
                      <span className="font-bold">
                        {item.impactYears > 0 ? `+${item.impactYears}` : item.impactYears} yrs
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. 10-Year Chronic Disease Risk Cards */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Flame className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  10-Year Clinical Chronic Disease Probabilities
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Diabetes Card */}
                {result.diseaseRisks?.diabetes && (
                  <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">Type 2 Diabetes</span>
                      <span
                        className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${getRiskColor(
                          result.diseaseRisks.diabetes.riskCategory
                        )}`}
                      >
                        {result.diseaseRisks.diabetes.riskCategory} RISK
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-slate-900">
                          {result.diseaseRisks.diabetes.riskPercentage}%
                        </span>
                        <span className="text-[11px] text-slate-500">10-Year ADA Probability</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${result.diseaseRisks.diabetes.riskPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <span className="font-bold text-slate-700 block">Top Contributing Drivers:</span>
                      <ul className="space-y-1 text-slate-600 list-disc list-inside">
                        {result.diseaseRisks.diabetes.primaryDrivers?.slice(0, 2).map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* ASCVD Cardiovascular Card */}
                {result.diseaseRisks?.cardiovascular && (
                  <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">Cardiovascular (ASCVD)</span>
                      <span
                        className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${getRiskColor(
                          result.diseaseRisks.cardiovascular.riskCategory
                        )}`}
                      >
                        {result.diseaseRisks.cardiovascular.riskCategory} RISK
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-slate-900">
                          {result.diseaseRisks.cardiovascular.riskPercentage}%
                        </span>
                        <span className="text-[11px] text-slate-500">AHA/ACC 10-Yr Heart/Stroke</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${result.diseaseRisks.cardiovascular.riskPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <span className="font-bold text-slate-700 block">Primary Arterial Drivers:</span>
                      <ul className="space-y-1 text-slate-600 list-disc list-inside">
                        {result.diseaseRisks.cardiovascular.primaryDrivers?.slice(0, 2).map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Hypertension Card */}
                {result.diseaseRisks?.hypertension && (
                  <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">Hypertension</span>
                      <span
                        className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${getRiskColor(
                          result.diseaseRisks.hypertension.riskCategory
                        )}`}
                      >
                        {result.diseaseRisks.hypertension.riskCategory} RISK
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-slate-900">
                          {result.diseaseRisks.hypertension.riskPercentage}%
                        </span>
                        <span className="text-[11px] text-slate-500">Vascular Resistance Risk</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${result.diseaseRisks.hypertension.riskPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <span className="font-bold text-slate-700 block">Etiological Contributors:</span>
                      <ul className="space-y-1 text-slate-600 list-disc list-inside">
                        {result.diseaseRisks.hypertension.primaryDrivers?.slice(0, 2).map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Evidence-Based 4-Pillar Personalized Prevention Roadmap */}
            {result.preventionPlan && (
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-5 h-5 text-teal-600" />
                    <h3 className="text-base font-bold text-slate-900">
                      Personalized 4-Pillar Prevention Prescription
                    </h3>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium flex items-center space-x-1.5 transition shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Protocol</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Hydration & Diet */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-4">
                    <div className="flex items-center space-x-2 text-teal-700 font-bold text-sm">
                      <Droplets className="w-4 h-4 text-cyan-600" />
                      <span>Daily Hydration Target: {result.preventionPlan.dailyHydration?.targetLiters} Liters</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {result.preventionPlan.dailyHydration?.schedule}
                    </p>

                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Apple className="w-4 h-4 text-emerald-600" />
                          Dietary Protocol
                        </span>
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Sodium &lt; {result.preventionPlan.dietaryProtocol?.sodiumCeilingMg} mg/day
                        </span>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                        {result.preventionPlan.dietaryProtocol?.guidelines?.map((g, i) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Exercise & Sleep */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-4">
                    <div className="flex items-center space-x-2 text-indigo-700 font-bold text-sm">
                      <Dumbbell className="w-4 h-4 text-indigo-600" />
                      <span>Exercise: {result.preventionPlan.exercisePrescription?.dailyStepGoal?.toLocaleString()} Steps / Day</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {result.preventionPlan.exercisePrescription?.aerobicRecommendation}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Resistance: {result.preventionPlan.exercisePrescription?.resistanceTraining}
                    </p>

                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-purple-600" />
                        Circadian Sleep Architecture ({result.preventionPlan.sleepArchitecture?.targetDurationHours})
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                        {result.preventionPlan.sleepArchitecture?.circadianGuidelines?.slice(0, 2).map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Clinical Lab Monitoring Schedule */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Recommended Clinical Lab Diagnostics:</span>
                  <div className="flex flex-wrap gap-2">
                    {result.preventionPlan.clinicalMonitoring?.map((m, i) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                      >
                        ✓ {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
