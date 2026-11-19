import React, { useState } from 'react';
import axios from 'axios';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Search,
  BarChart2,
  Database,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { DomainHeader } from '../../components/shared/DomainHeader';
import { SeedDataLoader } from '../../components/shared/SeedDataLoader';

/**
 * Multimodal Lab Report Analyzer Domain Module.
 * Route: /features/reports
 * 
 * Rules Adherence:
 * - Lazy service execution: Zero auto-fetch of biomarker trends on mount.
 * - On-demand seed attachment from /seed/mock_lab_reports.json.
 * - Clean empty state handling.
 */
export function ReportsDomain({ user, language = 'en' }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  // Biomarker Trend State (Lazy, zero auto-fetch on mount)
  const [trendData, setTrendData] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [activeTrendBiomarker, setActiveTrendBiomarker] = useState('Hemoglobin');

  // Handle explicit file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError('');
    }
  };

  // On-demand seed loader attachment from /seed/mock_lab_reports.json
  const handleSeedLoaded = (seedReports) => {
    if (!Array.isArray(seedReports) || seedReports.length === 0) return;
    const sample = seedReports[0];
    setAnalysisResult({
      fileName: sample.fileName || 'seed_cbc_panel.pdf',
      reportType: sample.reportType || 'Complete Blood Count (CBC)',
      extractedBiomarkers: sample.biomarkers || [],
      clinicalInterpretation: sample.clinicalInterpretation || 'Baseline seed biomarkers extracted.',
    });
    setError('');
  };

  // Lazy execution: Upload and run multimodal OCR
  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('report', selectedFile);

    try {
      const token = localStorage.getItem('accessToken');
      const headers = token
        ? { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'multipart/form-data' };

      const res = await axios.post('/api/reports/analyze', formData, { headers });
      if (res.data.success) {
        setAnalysisResult(res.data.report || res.data.analysis);
      } else {
        setError(res.data.error || 'Failed to parse lab report');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Analysis service error. Verify that /server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Lazy execution: Fetch longitudinal trend only when user requests
  const handleFetchBiomarkerTrend = async (biomarkerName) => {
    const target = biomarkerName || activeTrendBiomarker;
    setTrendLoading(true);
    try {
      const res = await axios.get(`/api/reports/trend?name=${target}`);
      if (res.data.success) {
        setTrendData(res.data.history || []);
      }
    } catch (err) {
      console.warn('Biomarker trend fetch failed', err);
    } finally {
      setTrendLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DomainHeader
        title={language === 'en' ? 'Multimodal Lab Report Analyzer' : 'लैब रिपोर्ट विश्लेषक'}
        description={
          language === 'en'
            ? 'Upload CBC, Lipid, or Metabolic panel PDFs/images. Our multimodal engine parses quantitative biomarkers and highlights clinical abnormalities.'
            : 'सीबीसी और ब्लड टेस्ट रिपोर्ट अपलोड करें और बायोमार्कर की जांच करें।'
        }
        tag="Multimodal OCR"
        actions={
          <SeedDataLoader
            domainId="reports"
            seedType="lab_reports"
            label="Load Seed Lab Report (from /seed)"
            onLoadSeed={handleSeedLoaded}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload & Controls */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Diagnostic Document</CardTitle>
              <CardDescription>
                Supports standard laboratory PDF reports and clear mobile captures.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex flex-col items-center justify-center border border-dashed border-zinc-200 rounded-xl p-6 hover:bg-zinc-50 cursor-pointer transition-colors text-center">
                <UploadCloud className="w-8 h-8 text-zinc-400 mb-2" />
                <span className="text-xs font-semibold text-zinc-800">
                  {selectedFile ? selectedFile.name : 'Select or drop lab document'}
                </span>
                <span className="text-[11px] text-zinc-400 mt-0.5">
                  PDF, PNG, JPG (Max 10MB)
                </span>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {error && (
                <p className="text-xs text-rose-600 font-medium">{error}</p>
              )}

              <Button
                variant="accent"
                size="md"
                className="w-full"
                disabled={!selectedFile}
                isLoading={loading}
                onClick={handleUploadAndAnalyze}
                leftIcon={<Search className="w-3.5 h-3.5" strokeWidth={1.5} />}
              >
                {loading ? 'Running Multimodal OCR...' : 'Run OCR & Interpret Report'}
              </Button>
            </CardContent>
          </Card>

          {/* Biomarker Trend Controls (User-Triggered) */}
          <Card>
            <CardHeader>
              <CardTitle>Longitudinal Trend Query</CardTitle>
              <CardDescription>
                Query historical trajectory for specific clinical biomarkers across time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={activeTrendBiomarker}
                  onChange={(e) => setActiveTrendBiomarker(e.target.value)}
                  className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-800 focus:outline-none focus:border-zinc-950"
                >
                  <option value="Hemoglobin">Hemoglobin (Hb)</option>
                  <option value="Fasting Glucose">Fasting Blood Glucose</option>
                  <option value="Total Cholesterol">Total Cholesterol</option>
                  <option value="Platelets">Platelet Count</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  isLoading={trendLoading}
                  onClick={() => handleFetchBiomarkerTrend(activeTrendBiomarker)}
                  leftIcon={<BarChart2 className="w-3.5 h-3.5" />}
                >
                  Plot
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results & Visualizations */}
        <div className="lg:col-span-2 space-y-4">
          {!analysisResult ? (
            <Card className="h-full min-h-[360px] flex items-center justify-center p-6">
              <EmptyState
                icon={<FileText className="w-6 h-6 text-zinc-400" />}
                title="Awaiting Lab Document"
                description="Upload an official lab report on the left or click 'Load Seed Lab Report' above to preview structured biomarker extraction."
              />
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{analysisResult.reportType || 'Laboratory Diagnostic Report'}</CardTitle>
                      <CardDescription>
                        Source: {analysisResult.fileName || 'Uploaded file'}
                      </CardDescription>
                    </div>
                    <Badge variant="accent">OCR VERIFIED</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Biomarkers Table */}
                  {analysisResult.extractedBiomarkers &&
                  analysisResult.extractedBiomarkers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-200 text-zinc-500">
                            <th className="py-2 px-3 font-semibold">Biomarker</th>
                            <th className="py-2 px-3 font-semibold">Observed Value</th>
                            <th className="py-2 px-3 font-semibold">Standard Reference</th>
                            <th className="py-2 px-3 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {analysisResult.extractedBiomarkers.map((b, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/70 transition-colors">
                              <td className="py-2.5 px-3 font-medium text-zinc-900">{b.name}</td>
                              <td className="py-2.5 px-3 font-mono text-zinc-800">
                                {b.value} {b.unit}
                              </td>
                              <td className="py-2.5 px-3 text-zinc-500 font-mono">
                                {b.referenceRange || 'N/A'}
                              </td>
                              <td className="py-2.5 px-3">
                                <Badge
                                  variant={
                                    b.status === 'abnormal' || b.status === 'high'
                                      ? 'danger'
                                      : b.status === 'low'
                                      ? 'warning'
                                      : 'accent'
                                  }
                                >
                                  {b.status?.toUpperCase() || 'NORMAL'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">No tabular biomarkers extracted.</p>
                  )}

                  {/* Clinical Interpretation */}
                  {analysisResult.clinicalInterpretation && (
                    <div className="pt-3 border-t border-zinc-100">
                      <span className="text-xs font-semibold text-zinc-700 block mb-1">
                        Clinical AI Interpretation:
                      </span>
                      <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-200/80">
                        {analysisResult.clinicalInterpretation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Longitudinal Biomarker Trend Chart */}
              {trendData.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Historical Trend: {activeTrendBiomarker}</CardTitle>
                      <Badge variant="neutral">Longitudinal</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-56 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} />
                          <YAxis tick={{ fontSize: 11, fill: '#71717a' }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #e4e4e7',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#059669"
                            strokeWidth={2}
                            dot={{ fill: '#059669', r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportsDomain;
