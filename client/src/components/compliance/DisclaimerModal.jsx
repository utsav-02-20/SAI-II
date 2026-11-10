import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  FileCheck,
  CheckCircle2,
  X,
  ExternalLink
} from 'lucide-react';

export default function DisclaimerModal({ language = 'en' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('arogya_clinical_disclaimer_accepted');
    if (!accepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('arogya_clinical_disclaimer_accepted', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        {/* Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 text-white flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">
              {language === 'en'
                ? 'Clinical Decision-Support & Regulatory Notice'
                : 'चिकित्सीय निर्णय सहायता एवं कानूनी अस्वीकरण'}
            </h3>
            <span className="text-[11px] text-teal-200">
              HIPAA Security Rule • DPDP Act 2023 • ABDM Guidelines
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4 text-xs leading-relaxed text-slate-600">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-xs">Not a Substitute for Licensed Clinical Care</span>
              <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800">
                ArogyaAI is designed strictly as an assistive educational and clinical decision-support platform. It does
                not render formal medical diagnoses or replace an evaluation by a qualified medical professional.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-800 block text-xs">By proceeding, you acknowledge:</span>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600">
              <li>
                <strong className="text-slate-800">Emergency Protocol:</strong> If you or someone nearby is experiencing
                crushing chest pain, severe breathlessness, stroke signs, or anaphylaxis, dial emergency services (108 / 112 /
                911) immediately.
              </li>
              <li>
                <strong className="text-slate-800">Data Encryption:</strong> Personal Health Information (PHI) is encrypted
                at rest using AES-256-GCM. Personal identifiers are de-identified before AI processing.
              </li>
              <li>
                <strong className="text-slate-800">Clinical Verification:</strong> Treatment protocols and drug-drug
                interactions are derived from official clinical ontologies (WHO, CDC, OpenFDA, RxNorm).
              </li>
            </ul>
          </div>

          {showDetails && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-[11px] text-slate-600">
              <span className="font-bold text-slate-800 block">Regulatory Compliance Summary:</span>
              <p>• <strong>HIPAA 45 CFR § 164.312:</strong> Cryptographic integrity, zero LLM retention.</p>
              <p>• <strong>Indian DPDP Act 2023:</strong> Explicit digital consent and purpose-bound inference.</p>
              <p>• <strong>FHIR R4 Alignment:</strong> Interoperable LOINC and RxNorm biomarker representation.</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold underline"
            >
              {showDetails ? 'Hide Compliance Specs' : 'View Full Compliance Specs'}
            </button>
          </div>
        </div>

        {/* Footer Accept Button */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={handleAccept}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I Understand & Accept Clinical Terms</span>
          </button>
        </div>
      </div>
    </div>
  );
}
