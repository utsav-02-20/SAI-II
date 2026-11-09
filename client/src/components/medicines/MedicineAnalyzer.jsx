import React, { useState } from 'react';
import axios from 'axios';
import {
  Pill,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Plus,
  X,
  BookOpen,
  Info,
  Utensils,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function MedicineAnalyzer({ user, language = 'en' }) {
  const [medicines, setMedicines] = useState(['Aspirin', 'Warfarin']);
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const addMedicine = (name) => {
    const trimmed = (name || currentInput).trim();
    if (trimmed && !medicines.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      setMedicines([...medicines, trimmed]);
      setCurrentInput('');
    }
  };

  const removeMedicine = (index) => {
    const updated = medicines.filter((_, i) => i !== index);
    setMedicines(updated);
    if (updated.length === 0) setResult(null);
  };

  const handleAnalyze = async () => {
    if (medicines.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        '/api/medicines/analyze',
        { medicines },
        { headers }
      );

      if (res.data.success) {
        setResult(res.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to analyze medicines.');
    } finally {
      setLoading(false);
    }
  };

  // One-click clinical demonstration presets
  const applyPreset = (presetArray) => {
    setMedicines(presetArray);
    setResult(null);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {language === 'en'
                ? 'Medicine Explanation & Safety Engine'
                : 'दवाओं की जांच और सुरक्षा इंजन'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'en'
                ? 'Checks Drug-Drug Interactions, Duplicate Ingredients, Side Effects & Food Warnings.'
                : 'दवा परस्पर क्रिया, डुप्लीकेट तत्व और साइड इफेक्ट्स की जांच करता है।'}
            </p>
          </div>
        </div>

        {/* Verified Source Badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          <span>RxNorm & OpenFDA Verified</span>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="py-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Clinical Demonstration Presets:
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => applyPreset(['Aspirin', 'Warfarin'])}
            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold border border-red-200/60 transition"
          >
            🔴 Aspirin + Warfarin (Severe Bleeding Hazard)
          </button>
          <button
            onClick={() => applyPreset(['Dolo 650', 'Combiflam'])}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200/60 transition"
          >
            ⚠️ Dolo 650 + Combiflam (Duplicate Paracetamol Overdose)
          </button>
          <button
            onClick={() => applyPreset(['Atorvastatin', 'Amlodipine'])}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200/60 transition"
          >
            🍇 Atorvastatin (Grapefruit Food Interaction)
          </button>
          <button
            onClick={() => applyPreset(['Augmentin 625'])}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold border border-purple-200/60 transition"
          >
            🛡️ Augmentin (Penicillin Allergy Check)
          </button>
        </div>
      </div>

      {/* Input Bar & Current Pills */}
      <div className="space-y-3 pt-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Pill className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMedicine())}
              placeholder="Enter medicine name (e.g. Dolo 650, Warfarin, Metformin) and press Add"
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="button"
            onClick={() => addMedicine()}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm flex items-center space-x-1 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        {/* Medicine Pills list */}
        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-slate-50 rounded-2xl border border-slate-100 items-center">
          {medicines.map((med, index) => (
            <span
              key={index}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-800 text-xs font-bold border border-slate-200 shadow-sm"
            >
              <span>{med}</span>
              <button
                type="button"
                onClick={() => removeMedicine(index)}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          {medicines.length === 0 && (
            <span className="text-xs text-slate-400 italic px-2">
              No medicines entered yet. Add one or click a preset above.
            </span>
          )}
        </div>

        {/* Patient Allergy Guardrail Context */}
        {user && user.profile?.allergies?.length > 0 && (
          <div className="flex items-center space-x-2 text-xs text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200/60">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Active Patient Guardrail:</strong> Cross-checking against your recorded allergies:{' '}
              {user.profile.allergies.join(', ')}.
            </span>
          </div>
        )}

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || medicines.length === 0}
          className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Consulting Medical Databases...' : 'Analyze Medicine Combination'}</span>
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Analysis Results Display */}
      {result && (
        <div className="mt-8 space-y-6 animate-fade-in border-t border-slate-100 pt-6">
          {/* Summary Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between text-sm ${
              result.summary.hasHighRiskWarnings
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              {result.summary.hasHighRiskWarnings ? (
                <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              )}
              <span className="font-bold">
                {result.summary.hasHighRiskWarnings
                  ? 'High-Risk Pharmacological Warnings Identified!'
                  : 'No Critical Interactions Detected.'}
              </span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/60">
              {result.summary.totalMedicinesAnalyzed} Medicines Checked
            </span>
          </div>

          {/* 1. DUPLICATE ACTIVE INGREDIENTS WARNINGS */}
          {result.duplicateWarnings && result.duplicateWarnings.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-black tracking-wider text-red-700 uppercase flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Duplicate Active Ingredients & Overdose Hazards</span>
              </h4>
              {result.duplicateWarnings.map((dup, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-400 text-amber-950 text-xs space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-red-700">
                      🚨 Duplicate: {dup.ingredient}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                      OVERDOSE RISK
                    </span>
                  </div>
                  <p className="leading-relaxed font-medium">{dup.warning}</p>
                  <div className="pt-1 text-[11px] font-bold text-red-800">
                    Recommended Action: {dup.action}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. PATIENT ALLERGY CONTRAINDICATIONS */}
          {result.allergyWarnings && result.allergyWarnings.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-black tracking-wider text-red-700 uppercase flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Patient Allergy Contraindications</span>
              </h4>
              {result.allergyWarnings.map((allg, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-red-50 border-2 border-red-500 text-red-950 text-xs space-y-1 shadow-sm"
                >
                  <span className="font-extrabold text-sm text-red-700 block">
                    ⛔ {allg.medicine} ({allg.allergyMatch})
                  </span>
                  <p className="leading-relaxed font-medium">{allg.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* 3. DRUG-DRUG INTERACTIONS */}
          {result.detectedInteractions && result.detectedInteractions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-black tracking-wider text-slate-700 uppercase">
                Drug-to-Drug Interactions ({result.detectedInteractions.length})
              </h4>
              {result.detectedInteractions.map((inter, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-xs space-y-2 shadow-sm ${
                    inter.severity === 'HIGH'
                      ? 'bg-red-50/70 border-red-300 text-red-950'
                      : 'bg-amber-50/70 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm">
                      {inter.pair.join(' + ')}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        inter.severity === 'HIGH'
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {inter.severity} SEVERITY
                    </span>
                  </div>
                  <h5 className="font-bold text-xs">{inter.title}</h5>
                  <p className="leading-relaxed text-slate-700">{inter.mechanism}</p>
                  <div className="pt-1 text-[11px] font-semibold text-slate-900 bg-white/70 p-2 rounded-xl border border-black/5">
                    <strong>Clinical Advice:</strong> {inter.recommendation}
                  </div>
                  <div className="text-[10px] text-slate-500 italic pt-1">
                    Source: {inter.verifiedSource}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 4. INDIVIDUAL MEDICINE DETAILS (Side effects, Food interactions, Timing) */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black tracking-wider text-slate-700 uppercase">
              Individual Pharmacological Profiles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.individualMedicines.map((med, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-3"
                >
                  <div className="flex items-start justify-between border-b border-slate-200 pb-2">
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">{med.brand}</h5>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Generic: {med.generic}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {med.therapeuticClass}
                    </span>
                  </div>

                  {/* Food & Beverage Warnings */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-amber-800 text-[11px]">
                      <Utensils className="w-3.5 h-3.5" />
                      <span>Food & Dietary Considerations:</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
                      {med.foodInteractions.map((food, i) => (
                        <li key={i}>{food}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Timing */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-slate-800 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Administration Timing:</span>
                    </div>
                    <p className="text-slate-600 pl-1">{med.timingInstructions}</p>
                  </div>

                  {/* Side Effects */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-slate-800 text-[11px]">
                      <Info className="w-3.5 h-3.5 text-blue-600" />
                      <span>Common Side Effects to Monitor:</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pl-1">
                      {med.sideEffects.map((effect, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px]"
                        >
                          {effect}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-200/60">
                    Source: {med.verifiedSource}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-500 italic text-center">
            {result.clinicalDisclaimer}
          </div>
        </div>
      )}
    </div>
  );
}
