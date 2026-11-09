import React from 'react';
import {
  Pill,
  FileText,
  Mic,
  HeartPulse,
  Apple,
  Search,
  HelpCircle,
  Eye,
  Clock,
  CheckCircle2,
  Salad,
  ShieldAlert,
  History,
  CalendarCheck,
} from 'lucide-react';

const features = [
  {
    id: 'medicine',
    title: 'Medicine Explanation',
    titleHi: 'दवाओं की जानकारी और जांच',
    desc: 'Interactions, duplicate medications, and side-effects via OpenFDA & RxNorm.',
    icon: Pill,
    phase: 'Phase 2',
    color: 'emerald',
  },
  {
    id: 'reports',
    title: 'Health Report Analyzer',
    titleHi: 'हेल्थ रिपोर्ट विश्लेषक',
    desc: 'Upload CBC, Sugar, Lipid PDFs. Multimodal OCR extracts and explains biomarkers.',
    icon: FileText,
    phase: 'Phase 3',
    color: 'teal',
  },
  {
    id: 'voice',
    title: 'Voice Assistant',
    titleHi: 'आवाज़ सहायक (हिंदी + English)',
    desc: 'Hands-free voice consultation supporting bilingual Hindi and English speech.',
    icon: Mic,
    phase: 'Phase 4',
    color: 'sky',
  },
  {
    id: 'triage',
    title: 'Adaptive Missing Symptoms',
    titleHi: 'अनुकूली लक्षण जांच',
    desc: 'Physician-like differential diagnosis asking the next best discriminator question.',
    icon: HelpCircle,
    phase: 'Phase 4',
    color: 'indigo',
  },
  {
    id: 'rag',
    title: 'Clinical RAG Assistant',
    titleHi: 'प्रमाणित चिकित्सा सहायक',
    desc: 'Zero-hallucination Q&A with strict citations from WHO, CDC & PubMed Central.',
    icon: Search,
    phase: 'Phase 5',
    color: 'blue',
  },
  {
    id: 'myths',
    title: 'Medical Myth Buster',
    titleHi: 'चिकित्सा गलत सूचना जांच',
    desc: 'Detects fake cures, WhatsApp forwards, and verifies claims against evidence.',
    icon: ShieldAlert,
    phase: 'Phase 5',
    color: 'amber',
  },
  {
    id: 'risk',
    title: 'Disease Risk Score',
    titleHi: 'भविष्य रोग जोखिम स्कोर',
    desc: 'XGBoost 10-year probability for Diabetes, Heart Disease, and Hypertension.',
    icon: HeartPulse,
    phase: 'Phase 6',
    color: 'rose',
  },
  {
    id: 'health-age',
    title: 'Biological Health Age',
    titleHi: 'जैविक स्वास्थ्य आयु',
    desc: 'Measures biological wear against real age with longevity penalty breakdowns.',
    icon: Clock,
    phase: 'Phase 6',
    color: 'purple',
  },
  {
    id: 'prevention',
    title: 'Personalized Prevention',
    titleHi: 'व्यक्तिगत रोकथाम योजना',
    desc: 'Prescribed nutrition, zone-2 exercise, sleep hygiene, and hydration goals.',
    icon: Apple,
    phase: 'Phase 6',
    color: 'green',
  },
  {
    id: 'adherence',
    title: 'Medication Adherence',
    titleHi: 'दवा ट्रैकर और सूचनाएं',
    desc: 'Automated dose schedules, WhatsApp/Push notifications, streaks, and adherence %.',
    icon: CheckCircle2,
    phase: 'Phase 7',
    color: 'cyan',
  },
  {
    id: 'nutrition',
    title: 'Nutrition Deficiency',
    titleHi: 'पोषण की कमी पहचान',
    desc: 'Maps symptoms like hair loss and fatigue to Iron, D3, or B12 deficiencies.',
    icon: Salad,
    phase: 'Phase 5',
    color: 'lime',
  },
  {
    id: 'vision',
    title: 'Vision Symptom Screening',
    titleHi: 'छवि-आधारित लक्षण जांच',
    desc: 'AI visual triage for skin rashes, eye redness, and nail discoloration.',
    icon: Eye,
    phase: 'Phase 4',
    color: 'violet',
  },
  {
    id: 'replay',
    title: 'Health Chat Replay',
    titleHi: 'लक्षण इतिहास और तुलना',
    desc: 'Longitudinal timeline comparing month-over-month symptom frequencies.',
    icon: History,
    phase: 'Phase 7',
    color: 'orange',
  },
  {
    id: 'appointments',
    title: 'Doctor Tele-Consultation',
    titleHi: 'डॉक्टर टेली-परामर्श',
    desc: 'Pre-triage SBAR summary handover and WebRTC live video consultation.',
    icon: CalendarCheck,
    phase: 'Phase 7',
    color: 'emerald',
  },
];

export default function FeatureGrid({ language }) {
  return (
    <div className="py-10">
      <div className="text-center max-w-3xl mx-auto mb-10 px-4">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          {language === 'en'
            ? 'Complete Intelligent Health Platform'
            : 'संपूर्ण बुद्धिमत्तापूर्ण स्वास्थ्य मंच'}
        </h2>
        <p className="mt-3 text-base sm:text-lg text-slate-600">
          {language === 'en'
            ? '14 clinical modules powered by Express.js, MongoDB Prisma, Cloudinary, and verified Medical AI.'
            : '14 क्लिनिकल मॉड्यूल जो एक्सप्रेस, मोंगोडीबी, क्लाउडिनरी और प्रमाणित एआई से संचालित हैं।'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {feat.phase}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {language === 'en' ? feat.title : feat.titleHi}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
