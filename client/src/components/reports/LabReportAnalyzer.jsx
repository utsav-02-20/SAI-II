import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Sparkles,
  BookOpen,
  Apple,
  FileCheck,
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

export default function LabReportAnalyzer({ user, language = 'en' }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [trendData, setTrendData] = useState([]);
  const [activeTrend, setActiveTrend] = useState('Hemoglobin');

  // Load trend data on mount or when activeTrend changes
  useEffect(() => {
    axios
      .get(`/api/reports/trend?name=${activeTrend}`)
      .then((res) => {
        if (res.data.success) {
          setTrendData(res.data.history);
        }
      })
      .catch((err) => console.warn('Trend fetch error:', err));
  }, [activeTrend]);

  const handleFileUpload = async (fileToUpload) => {
    const file = fileToUpload || selectedFile;
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const formData = new FormData();
      formData.append('file', file);
      formData.append('reportTitle', file.name);

      const res = await axios.post('/api/reports/analyze', formData, { headers });

      if (res.data.success) {
        setResult(res.data.analysis);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to analyze lab report.');
    } finally {
      setLoading(false);
    }
  };

  const applyPresetReport = async (presetType) => {
    setLoading(true);
    setError('');

    let mockBiomarkers = [];
    let title = 'Complete Blood Count (CBC)';

    if (presetType === 'cbc') {
      title = 'Complete Blood Count (CBC) with Peripheral Smear';
      mockBiomarkers = [
        { name: 'Hemoglobin', value: 9.2, unit: 'g/dL' },
        { name: 'Total Leukocyte Count (WBC)', value: 13200, unit: '/uL' },
        { name: 'Platelet Count', value: 165000, unit: '/uL' },
        { name: 'RBC', value: 3.6, unit: 'million/uL' },
      ];
      setActiveTrend('Hemoglobin');
    } else if (presetType === 'diabetes') {
      title = 'Comprehensive Glycemic & Diabetic Panel';
      mockBiomarkers = [
        { name: 'Fasting Blood Sugar', value: 148, unit: 'mg/dL' },
        { name: 'Postprandial Blood Sugar', value: 210, unit: 'mg/dL' },
        { name: 'HbA1c', value: 7.4, unit: '%' },
      ];
      setActiveTrend('sugar');
    } else if (presetType === 'lipid') {
      title = 'Comprehensive Lipid & Cardiovascular Panel';
      mockBiomarkers = [
        { name: 'Total Cholesterol', value: 248, unit: 'mg/dL' },
        { name: 'Triglycerides', value: 198, unit: 'mg/dL' },
        { name: 'HDL', value: 36, unit: 'mg/dL' },
        { name: 'LDL', value: 172, unit: 'mg/dL' },
      ];
      setActiveTrend('cholesterol');
    }

    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        '/api/reports/analyze',
        { reportTitle: title, biomarkers: mockBiomarkers },
        { headers }
      );

      if (res.data.success) {
        setResult(res.data.analysis);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to analyze sample report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {language === 'en'
                ? 'Health Report Analyzer & Biomarker OCR'
                : 'हेल्थ रिपोर्ट विश्लेषक और बायोमार्कर ओसीआर'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'en'
                ? 'Upload CBC, Sugar, or Lipid PDFs. AI extracts numerical values, flags out-of-range biomarkers, and explains findings.'
                : 'सीबीसी, शुगर या लिपिड पीडीएफ अपलोड करें। एआई बायोमार्कर निकालता है और सामान्य सीमाओं से तुलना करता है।'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
          <BookOpen className="w-3.5 h-3.5 text-teal-600" />
          <span>LOINC Clinical Pathology Standard</span>
        </div>
      </div>

      {/* Preset Demo Buttons */}
      <div className="py-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Clinical Sample Reports (One-Click Testing):
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => applyPresetReport('cbc')}
            className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold border border-teal-200/60 transition flex items-center space-x-1.5"
          >
            <span>🩸 Sample CBC (Low Hemoglobin 9.2 g/dL & High WBC)</span>
          </button>
          <button
            onClick={() => applyPresetReport('diabetes')}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200/60 transition flex items-center space-x-1.5"
          >
            <span>🍬 Sample Diabetic Panel (FBS 148 mg/dL & HbA1c 7.4%)</span>
          </button>
          <button
            onClick={() => applyPresetReport('lipid')}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold border border-blue-200/60 transition flex items-center space-x-1.5"
          >
            <span>🫀 Sample Lipid Panel (Elevated Cholesterol & LDL)</span>
          </button>
        </div>
      </div>

      {/* File Dropzone Area */}
      <div className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-3xl p-6 text-center transition bg-slate-50/50">
        <input
          type="file"
          id="reportFileInput"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setSelectedFile(e.target.files[0]);
              handleFileUpload(e.target.files[0]);
            }
          }}
          className="hidden"
        />
        <label htmlFor="reportFileInput" className="cursor-pointer block space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-100/60 text-teal-700 flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-slate-800">
            {selectedFile ? selectedFile.name : 'Click to Upload Diagnostic Lab Report (PDF / Image)'}
          </div>
          <p className="text-xs text-slate-500">
            Supports Complete Blood Count (CBC), Fasting Sugar, HbA1c, Lipid Profile, LFT, KFT (up to 10MB)
          </p>
        </label>
      </div>

      {loading && (
        <div className="py-8 text-center text-xs font-semibold text-teal-700 flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span>Multimodal OCR is extracting and contextualizing laboratory biomarkers...</span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="mt-8 space-y-6 animate-fade-in border-t border-slate-100 pt-6">
          {/* Clinical Narrative Summary Banner */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-widest flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI Clinical Pathology Evaluation</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white font-medium">
                {result.abnormalCount} Abnormal Finding(s) Detected
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {result.aiSummary}
            </p>
          </div>

          {/* Interactive Biomarker Cards Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-black tracking-wider text-slate-700 uppercase">
              Extracted Biomarker Analysis ({result.biomarkers.length} Tests)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.biomarkers.map((b, idx) => {
                const isAbnormal = b.status !== 'NORMAL';
                const isCritical = b.status === 'CRITICAL';
                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border text-xs space-y-2 transition ${
                      isCritical
                        ? 'bg-red-50/80 border-red-300'
                        : b.status === 'HIGH'
                        ? 'bg-red-50/50 border-red-200'
                        : b.status === 'LOW'
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-emerald-50/40 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-bold text-sm text-slate-900">{b.name}</h5>
                        <span className="text-[11px] text-slate-500">
                          Normal Range: {b.normalMin} - {b.normalMax} {b.unit}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] flex items-center space-x-1 ${
                          isCritical
                            ? 'bg-red-600 text-white'
                            : b.status === 'HIGH'
                            ? 'bg-red-500 text-white'
                            : b.status === 'LOW'
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {b.status === 'HIGH' && <TrendingUp className="w-3 h-3" />}
                        {b.status === 'LOW' && <TrendingDown className="w-3 h-3" />}
                        {b.status === 'NORMAL' && <CheckCircle2 className="w-3 h-3" />}
                        <span>
                          {b.value} {b.unit} ({b.status})
                        </span>
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed font-medium pt-1">
                      {b.explanation}
                    </p>

                    {b.dietaryTips && (
                      <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200 text-slate-800 text-[11px] flex items-start space-x-1.5">
                        <Apple className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Dietary Action:</strong> {b.dietaryTips}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Trend Chart (Recharts) */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Longitudinal Biomarker Trend Timeline
                </h4>
                <p className="text-xs text-slate-500">
                  Visualizes changes across previous laboratory tests
                </p>
              </div>

              {/* Biomarker Selector */}
              <div className="flex gap-2">
                {['Hemoglobin', 'sugar', 'cholesterol'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTrend(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                      activeTrend === tab
                        ? 'bg-teal-600 text-white'
                        : 'bg-white border text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tab === 'sugar' ? 'Fasting Sugar' : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts SVG Line Chart */}
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0d9488"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#0f766e' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
