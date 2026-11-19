import React, { useState } from 'react';
import axios from 'axios';
import {
  Pill,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Plus,
  Trash2,
  ShieldCheck,
  Utensils,
  BookOpen,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { DomainHeader } from '../../components/shared/DomainHeader';
import { SeedDataLoader } from '../../components/shared/SeedDataLoader';

/**
 * Medicine Intelligence & Drug Safety Domain Module.
 * Route: /features/medicines
 * 
 * Rules Adherence:
 * - Zero inline mock data: Default state is an empty array.
 * - On-demand /seed attachment via SeedDataLoader.
 * - Lazy service execution: /api/medicines/analyze is called only on explicit user click.
 */
export function MedicinesDomain({ user, language = 'en' }) {
  const [medicines, setMedicines] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Add individual medicine
  const handleAddMedicine = (e) => {
    e?.preventDefault();
    const trimmed = currentInput.trim();
    if (!trimmed) return;
    if (medicines.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      setError(`"${trimmed}" is already added to the list.`);
      return;
    }
    setMedicines([...medicines, trimmed]);
    setCurrentInput('');
    setError('');
  };

  // Remove individual medicine
  const handleRemoveMedicine = (indexToRemove) => {
    const updated = medicines.filter((_, idx) => idx !== indexToRemove);
    setMedicines(updated);
    if (updated.length === 0) setResult(null);
  };

  // Attach data from /seed/mock_medicines.json on user action
  const handleSeedLoaded = (seedData) => {
    if (!Array.isArray(seedData)) return;
    // Map brand names from seed
    const brandNames = seedData.map((item) => item.brand).filter(Boolean);
    setMedicines(brandNames);
    setResult(null);
    setError('');
  };

  // Lazy API execution: Only invoked on user click
  const handleAnalyzeSafety = async () => {
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
        setResult(res.data.analysis);
      } else {
        setError(res.data.error || 'Failed to complete safety analysis');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Connection to drug safety engine failed. Ensure /server is active.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DomainHeader
        title={language === 'en' ? 'Medicine Safety & Interaction Engine' : 'दवा सुरक्षा और परस्पर क्रिया विश्लेषण'}
        description={
          language === 'en'
            ? 'Cross-reference multi-drug regimens against OpenFDA and RxNorm registries for dangerous drug-drug interactions, therapeutic duplicates, and food contraindications.'
            : 'दवाओं के बीच परस्पर प्रभाव, डुप्लिकेट दवाएं और भोजन संबंधी चेतावनियों की जांच करें।'
        }
        tag="OpenFDA Grounded"
        actions={
          <SeedDataLoader
            domainId="medicines"
            seedType="medicines"
            label="Load Seed Formulary (from /seed)"
            onLoadSeed={handleSeedLoaded}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Medicine Input & Active List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prescription Regimen</CardTitle>
              <CardDescription>
                Enter the generic or brand name of medications currently prescribed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddMedicine} className="flex gap-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="e.g. Aspirin, Warfarin, Dolo 650"
                  leftIcon={<Pill className="w-3.5 h-3.5" />}
                />
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  disabled={!currentInput.trim()}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add
                </Button>
              </form>

              {error && (
                <p className="text-xs text-rose-600 font-medium">{error}</p>
              )}

              {/* Active Medication List */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-700">
                    Active Medications ({medicines.length})
                  </span>
                  {medicines.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setMedicines([]);
                        setResult(null);
                      }}
                      className="text-[11px] text-zinc-500 hover:text-rose-600 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {medicines.length === 0 ? (
                  <EmptyState
                    title="No medications added"
                    description="Add prescribed drugs above or load the verified clinical formulary from /seed."
                    className="py-6"
                  />
                ) : (
                  <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {medicines.map((med, index) => (
                      <li
                        key={`${med}-${index}`}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-800"
                      >
                        <div className="flex items-center gap-2 font-medium">
                          <Pill className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{med}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(index)}
                          className="text-zinc-400 hover:text-rose-600 transition-colors"
                          title="Remove drug"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Explicit Service Trigger */}
              <Button
                variant="accent"
                size="md"
                className="w-full"
                disabled={medicines.length === 0}
                isLoading={loading}
                onClick={handleAnalyzeSafety}
                leftIcon={<ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />}
              >
                {loading ? 'Evaluating Safety...' : 'Run Interaction & Safety Check'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Clinical Safety Report */}
        <div className="lg:col-span-2">
          {!result ? (
            <Card className="h-full min-h-[380px] flex items-center justify-center p-6">
              <EmptyState
                icon={<Pill className="w-6 h-6 text-zinc-400" />}
                title="Awaiting Safety Analysis"
                description="Populate your medication regimen and click 'Run Interaction & Safety Check' to execute the OpenFDA drug interaction engine."
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Overall Risk Summary Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Drug Safety Evaluation Summary</CardTitle>
                    <Badge
                      variant={
                        result.overallRisk === 'high'
                          ? 'danger'
                          : result.overallRisk === 'moderate'
                          ? 'warning'
                          : 'accent'
                      }
                    >
                      {result.overallRisk?.toUpperCase() || 'SAFE'} RISK PROFILE
                    </Badge>
                  </div>
                  <CardDescription>
                    Analysis completed across {medicines.length} medications against RxNorm and FDA black box warnings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* High Severity Drug-Drug Interactions */}
                  {result.interactions && result.interactions.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Major Drug-Drug Interactions Detected</span>
                      </div>
                      <div className="space-y-2">
                        {result.interactions.map((interaction, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-lg bg-rose-50/60 border border-rose-200 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-semibold text-rose-900">
                              <span>
                                {interaction.drugA} + {interaction.drugB}
                              </span>
                              <Badge variant="danger">{interaction.severity || 'Major'}</Badge>
                            </div>
                            <p className="text-rose-700 leading-relaxed">
                              {interaction.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Zero contraindicating drug-drug interactions detected between selected agents.</span>
                    </div>
                  )}

                  {/* Therapeutic Duplicates */}
                  {result.duplicates && result.duplicates.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-zinc-100">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Therapeutic Duplication Warning</span>
                      </div>
                      <div className="space-y-2">
                        {result.duplicates.map((dup, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1"
                          >
                            <span className="font-semibold">{dup.genericClass} Overlap</span>
                            <p className="text-amber-800 leading-relaxed">{dup.warning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Food & Lifestyle Contraindications */}
                  {result.foodWarnings && result.foodWarnings.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-zinc-100">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
                        <Utensils className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Dietary & Food Warnings</span>
                      </div>
                      <ul className="space-y-1 text-xs text-zinc-600">
                        {result.foodWarnings.map((foodWarn, idx) => (
                          <li
                            key={idx}
                            className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/70"
                          >
                            {foodWarn}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MedicinesDomain;
