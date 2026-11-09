import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header.jsx';
import FeatureGrid from './components/FeatureGrid.jsx';
import { ShieldCheck, Heart, Sparkles, Terminal } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState('en');
  const [apiData, setApiData] = useState(null);
  const [apiStatus, setApiStatus] = useState('connecting');

  useEffect(() => {
    // Check Express API health check endpoint
    axios
      .get('/api/health')
      .then((res) => {
        setApiData(res.data);
        setApiStatus('online');
      })
      .catch((err) => {
        console.warn('API connection check failed, retrying directly on 5000:', err.message);
        axios
          .get('http://localhost:5000/api/health')
          .then((res) => {
            setApiData(res.data);
            setApiStatus('online');
          })
          .catch(() => setApiStatus('offline'));
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-50 flex flex-col">
      <Header language={language} setLanguage={setLanguage} apiStatus={apiStatus} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-12 shadow-xl shadow-emerald-950/10 mb-10">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 0 Initialized • Clean JavaScript Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {language === 'en'
                ? 'Your AI-Powered Clinical Health Companion'
                : 'आपका एआई-संचालित स्वास्थ्य साथी'}
            </h1>
            <p className="mt-4 text-emerald-100 text-base sm:text-lg leading-relaxed">
              {language === 'en'
                ? 'Personalized medicine safety checks, lab report OCR, dynamic differential diagnosis, and evidence-grounded medical guidance.'
                : 'दवा सुरक्षा जांच, लैब रिपोर्ट विश्लेषण, सटीक रोग जोखिम भविष्यवाणी और प्रमाणित स्वास्थ्य मार्गदर्शन।'}
            </p>

            {/* Quick Status Bar */}
            <div className="mt-8 flex flex-wrap gap-4 text-xs font-medium">
              <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Express + MongoDB Prisma Ready</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <Terminal className="w-4 h-4 text-teal-400" />
                <span>Python Test & Seed Harness Active</span>
              </div>
            </div>
          </div>

          {/* Decorative background glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Live Express API Connection Banner */}
        {apiData && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-sm text-emerald-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-ping" />
              <span className="font-semibold">Backend Live:</span>
              <span>{apiData.service}</span>
              <span className="text-xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md font-mono">
                {apiData.runtime}
              </span>
            </div>
            <span className="text-xs text-emerald-600 font-mono hidden sm:inline">
              Uptime: {apiData.uptimeSeconds}s
            </span>
          </div>
        )}

        {/* Feature Matrix */}
        <FeatureGrid language={language} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ArogyaAI Clinical Platform • For decision-support & education only</span>
          <span className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> in pure JavaScript + Python
          </span>
        </div>
      </footer>
    </div>
  );
}
