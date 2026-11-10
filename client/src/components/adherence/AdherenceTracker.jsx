import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Pill,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  Award,
  Bell,
  Sparkles,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Send,
  Plus
} from 'lucide-react';

export default function AdherenceTracker({ user, language = 'en' }) {
  const [schedule, setSchedule] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reminderSim, setReminderSim] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const patientId = user?.id || 'default-patient';

  const fetchData = async () => {
    try {
      const [schedRes, statsRes] = await Promise.all([
        axios.get(`/api/adherence/schedule?patientId=${patientId}`),
        axios.get(`/api/adherence/stats?patientId=${patientId}`),
      ]);
      if (schedRes.data.schedule) setSchedule(schedRes.data.schedule);
      if (statsRes.data.stats) setStats(statsRes.data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleLogDose = async (medicineName, status) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await axios.post('/api/adherence/log', {
        patientId,
        medicineName,
        status,
        scheduledTime: new Date().toISOString(),
      });
      setFeedback({
        type: status === 'TAKEN' ? 'success' : 'warning',
        message:
          status === 'TAKEN'
            ? `✓ Dose recorded! Current streak: ${res.data.currentStreakDays} days.`
            : `Dose marked as ${status}. Consistency protects long-term health.`,
      });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateReminder = async (medName) => {
    try {
      const res = await axios.post('/api/adherence/simulate-reminder', {
        patientId,
        medicineName: medName || 'Glycomet 500 SR',
      });
      setReminderSim(res.data.reminder);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 sm:p-8 text-white relative">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-3">
              <Pill className="w-3.5 h-3.5" />
              <span>Phase 7 • Medication Adherence Engine & Habit Streak Tracker</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {language === 'en'
                ? 'Smart Medication Adherence & Streak Tracker'
                : 'स्मार्ट दवा ट्रैकर एवं स्ट्रीक रिकॉर्डर'}
            </h2>
            <p className="mt-1 text-emerald-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {language === 'en'
                ? 'Automated scheduled dose logging, multi-channel reminder simulator, consecutive day adherence streaks, and habit milestone badges.'
                : 'समय पर दवा लेने का रिकॉर्ड, दैनिक अनुस्मारक एवं नियमितता पुरस्कार।'}
            </p>
          </div>

          {/* Running Streak Badge */}
          {stats && (
            <div className="bg-white/10 border border-white/20 p-4 rounded-2xl backdrop-blur-md flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-900/40">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-200 uppercase tracking-wider font-bold block">
                  Active Habit Streak
                </span>
                <span className="text-2xl font-black text-white">
                  {stats.consecutiveStreakDays} Days
                </span>
                <span className="text-[10px] text-emerald-300 block">
                  {stats.adherenceRatePercent}% Overall Adherence
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border border-amber-200 text-amber-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Reminder Simulation Banner */}
        {reminderSim && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold">{reminderSim.payload.title}</span>
              </div>
              <span className="text-[10px] bg-indigo-200/60 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                {reminderSim.channel}
              </span>
            </div>
            <p className="text-xs text-indigo-700 leading-relaxed">{reminderSim.payload.body}</p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  handleLogDose('Glycomet 500 SR', 'TAKEN');
                  setReminderSim(null);
                }}
                className="text-xs px-3 py-1 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
              >
                Mark as Taken
              </button>
              <button
                onClick={() => setReminderSim(null)}
                className="text-xs px-3 py-1 rounded-xl bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Milestone Badges */}
        {stats?.badges && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Award className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Adherence Milestone Badges
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-2xl border flex items-center space-x-3 transition ${
                    badge.unlocked
                      ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 text-emerald-900 shadow-sm'
                      : 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      badge.unlocked ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {badge.unlocked ? <Award className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block leading-tight">{badge.name}</span>
                    <span className="text-[10px] font-semibold block text-slate-500 mt-0.5">
                      {badge.unlocked ? 'Unlocked Champion' : 'Locked Goal'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Medication Schedule Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Today's Prescribed Doses & Verification
            </span>
            <button
              onClick={() => handleSimulateReminder('Glycomet 500 SR')}
              className="text-xs px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold flex items-center space-x-1.5 transition"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Simulate Web Push Reminder</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedule.flatMap((rx) =>
              rx.medicines.map((med, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900">{med.brandName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        {med.dosage} • {med.frequency}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium block">{med.genericName}</span>
                    <p className="text-xs text-slate-600 mt-1">Instructions: {med.instructions}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {med.timings?.map((t, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 flex items-center space-x-1"
                        >
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{t}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">Record Today's Action:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLogDose(med.brandName, 'TAKEN')}
                        disabled={loading}
                        className="text-xs px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-1 transition disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Taken</span>
                      </button>
                      <button
                        onClick={() => handleLogDose(med.brandName, 'SKIPPED')}
                        disabled={loading}
                        className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center space-x-1 transition disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5 text-slate-500" />
                        <span>Skip</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
