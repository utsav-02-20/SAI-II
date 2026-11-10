import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Video,
  FileSpreadsheet,
  AlertTriangle,
  UserCheck,
  Stethoscope,
  Clock,
  ShieldAlert,
  Mic,
  MicOff,
  VideoOff,
  CheckCircle2,
  TrendingUp,
  FileText,
  Send,
  PhoneCall,
  Activity,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function TeleconsultationPortal({ user, language = 'en' }) {
  const [replayData, setReplayData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [preTriage, setPreTriage] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [finalSummary, setFinalSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const patientId = user?.id || 'default-patient';

  useEffect(() => {
    // 1. Fetch Longitudinal Replay
    axios
      .get(`/api/teleconsult/trends/replay?patientId=${patientId}`)
      .then((res) => setReplayData(res.data))
      .catch(console.error);

    // 2. Fetch Doctors
    axios
      .get('/api/teleconsult/doctors')
      .then((res) => setDoctors(res.data.doctors || []))
      .catch(console.error);

    // 3. Fetch Pre-Triage Handover Packet
    axios
      .get(`/api/teleconsult/pre-triage/${patientId}`)
      .then((res) => setPreTriage(res.data.packet))
      .catch(console.error);
  }, [user]);

  const handleLaunchRoom = async (doctorId) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/teleconsult/room/create', {
        patientId,
        doctorId: doctorId || 'doc-1',
      });
      setActiveRoom(res.data);
      setInCall(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEndCall = async () => {
    if (!activeRoom) return;
    try {
      const res = await axios.post('/api/teleconsult/room/finalize', {
        appointmentId: activeRoom.appointmentId,
        clinicalImpression: 'Acute Viral Pyrexia with reactive leukocytosis',
        icd10Code: 'R50.9',
        notes: 'Hydration advised. Prescribed Paracetamol 650mg TDS PRN. Follow-up after Dengue NS1 & CBC results.',
        doctorName: activeRoom.assignedDoctor?.fullName || 'Dr. Ananya Sharma, MD',
        followUpDays: 3,
      });
      setFinalSummary(res.data);
      setInCall(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 p-6 sm:p-8 text-white relative">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-3">
              <Video className="w-3.5 h-3.5" />
              <span>Phase 7 • Longitudinal Replay, SBAR Pre-Triage & WebRTC Teleconsultation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {language === 'en'
                ? 'Longitudinal Symptom Replay & Doctor Teleconsultation'
                : 'दीर्घकालिक लक्षण ट्रैकर एवं डॉक्टर वीडियो परामर्श'}
            </h2>
            <p className="mt-1 text-indigo-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {language === 'en'
                ? 'Month-over-month symptom trajectory analysis, automated clinical SBAR pre-triage handover packets, and instant WebRTC video consultation rooms.'
                : 'लक्षणों के मासिक बदलाव का विश्लेषण, डॉक्टर के लिए एसबीएआर सारांश एवं सीधा वीडियो परामर्श।'}
            </p>
          </div>

          {/* Quick Consultation Launch Pill */}
          {!inCall && (
            <button
              onClick={() => handleLaunchRoom('doc-1')}
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center space-x-2 transition disabled:opacity-50"
            >
              <Video className="w-4 h-4" />
              <span>Launch Teleconsultation Room</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* 1. Longitudinal Symptom Frequency Replay */}
        {replayData && (
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Longitudinal Symptom Frequency Replay (Aug - Nov)
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {replayData.analysisSummary?.alertNarrative}
                </h3>
              </div>

              {replayData.escalationDecision?.requiresDoctorEscalation && (
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 flex items-center space-x-1.5 self-start">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Clinical Escalation Triggered (+140% Surge)</span>
                </span>
              )}
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-64 w-full bg-white p-4 rounded-2xl border border-slate-200/80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={replayData.timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="fever" fill="#f43f5e" name="Fever Episodes" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cough" fill="#0ea5e9" name="Cough Episodes" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="headache" fill="#8b5cf6" name="Headache" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 2. WebRTC Live Video Consultation Session */}
        {inCall && activeRoom && (
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Live WebRTC Teleconsultation ({activeRoom.meetingRoomId})
                </span>
              </div>
              <span className="text-xs text-slate-300">
                Connected: {activeRoom.assignedDoctor?.fullName} ({activeRoom.assignedDoctor?.specialty})
              </span>
            </div>

            {/* Simulated WebRTC Video Screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-56 rounded-2xl bg-slate-800 border border-slate-700 relative overflow-hidden flex items-center justify-center">
                <div className="text-center space-y-1">
                  <div className="w-14 h-14 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md">
                    Dr. AS
                  </div>
                  <span className="text-xs font-bold block">{activeRoom.assignedDoctor?.fullName}</span>
                  <span className="text-[10px] text-emerald-400 block">✓ ICE STUN Connected</span>
                </div>
                <span className="absolute bottom-3 left-3 text-[10px] bg-black/60 px-2 py-0.5 rounded text-white font-semibold">
                  Attending Physician
                </span>
              </div>

              <div className="h-56 rounded-2xl bg-slate-800 border border-slate-700 relative overflow-hidden flex items-center justify-center">
                <div className="text-center space-y-1">
                  <div className="w-14 h-14 rounded-full bg-teal-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md">
                    You
                  </div>
                  <span className="text-xs font-bold block">Patient Video Stream</span>
                  <span className="text-[10px] text-slate-400 block">720p HD • WebRTC Unified Plan</span>
                </div>
                <span className="absolute bottom-3 left-3 text-[10px] bg-black/60 px-2 py-0.5 rounded text-white font-semibold">
                  Patient (Self)
                </span>
              </div>
            </div>

            {/* Video Controls Bar */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`p-3 rounded-full border transition ${
                  isMicMuted ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white/10 border-white/20 text-white'
                }`}
              >
                {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                className={`p-3 rounded-full border transition ${
                  isVideoMuted ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white/10 border-white/20 text-white'
                }`}
              >
                {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>
              <button
                onClick={handleEndCall}
                className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-lg"
              >
                <PhoneCall className="w-4 h-4" />
                <span>End Call & Generate E-Prescription</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. Post-Consultation Digital E-Prescription Summary */}
        {finalSummary && (
          <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold">Consultation Finalized & Digital E-Prescription Issued</h3>
              </div>
              <span className="text-xs font-mono text-emerald-800 font-semibold">
                ID: {finalSummary.ePrescription?.prescriptionId}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-600 block">Doctor Clinical Impression:</span>
                <p className="font-semibold text-emerald-900">{finalSummary.consultationNotes?.clinicalImpression}</p>
                <span className="text-[11px] text-slate-500">ICD-10: {finalSummary.consultationNotes?.icd10Code}</span>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-600 block">Attending Physician:</span>
                <p className="font-semibold text-emerald-900">{finalSummary.ePrescription?.issuedBy}</p>
                <span className="text-[10px] font-mono text-slate-500 block truncate">
                  Digital Sign: {finalSummary.ePrescription?.digitalSignatureHash}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-bold text-slate-700 block mb-2">Prescribed Medication Regimen:</span>
              <div className="space-y-1.5">
                {finalSummary.ePrescription?.medicinesPrescribed?.map((m, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white border border-emerald-200 text-xs flex justify-between">
                    <span className="font-bold text-slate-800">{m.drugName}</span>
                    <span className="text-slate-600">{m.frequency} ({m.duration})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Automated SBAR Pre-Triage Handover Packet for Doctors */}
        {preTriage?.sbarHandover && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Attending Doctor Pre-Triage Handover Packet (SBAR Protocol)
                </span>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Metformin Adherence: {preTriage.adherenceSnapshot?.adherenceRatePercent}% ({preTriage.adherenceSnapshot?.consecutiveStreakDays}-day streak)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-indigo-700 uppercase tracking-wider block text-[11px]">
                  S — Situation
                </span>
                <p className="text-slate-700 leading-relaxed">{preTriage.sbarHandover.situation}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-indigo-700 uppercase tracking-wider block text-[11px]">
                  B — Background
                </span>
                <p className="text-slate-700 leading-relaxed">{preTriage.sbarHandover.background}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-indigo-700 uppercase tracking-wider block text-[11px]">
                  A — Assessment
                </span>
                <p className="text-slate-700 leading-relaxed">{preTriage.sbarHandover.assessment}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-indigo-700 uppercase tracking-wider block text-[11px]">
                  R — Recommendation
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {preTriage.sbarHandover.recommendation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
