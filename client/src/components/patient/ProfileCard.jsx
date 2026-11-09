import React, { useState } from 'react';
import axios from 'axios';
import { User, AlertTriangle, ShieldCheck, Heart, Plus, Edit2, Phone, Save } from 'lucide-react';

export default function ProfileCard({ user, onProfileUpdated }) {
  const profile = user?.profile || {};
  const [isEditing, setIsEditing] = useState(false);
  const [allergiesText, setAllergiesText] = useState((profile.allergies || []).join(', '));
  const [chronicText, setChronicText] = useState((profile.chronicConditions || []).join(', '));
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup || 'B+');
  const [heightCm, setHeightCm] = useState(profile.heightCm || 172);
  const [weightKg, setWeightKg] = useState(profile.weightKg || 70);
  const [emergencyPhone, setEmergencyPhone] = useState(
    profile.emergencyContacts?.[0]?.phoneNumber || '+919876543210'
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const payload = {
        allergies: allergiesText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        chronicConditions: chronicText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        bloodGroup,
        heightCm: parseFloat(heightCm),
        weightKg: parseFloat(weightKg),
        emergencyContacts: [
          {
            name: 'Primary Contact',
            relationship: 'Family',
            phoneNumber: emergencyPhone,
          },
        ],
      };

      const res = await axios.put('/api/patient/profile', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setIsEditing(false);
        if (onProfileUpdated) onProfileUpdated(res.data.data.profile);
      }
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-emerald-500/20">
            {profile.firstName?.[0] || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {profile.firstName} {profile.lastName}
            </h2>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
              <span>{user.email}</span>
              <span>•</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-semibold">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={saving}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 text-emerald-600" />
              <span>{saving ? 'Saving...' : 'Save Baseline'}</span>
            </>
          ) : (
            <>
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Baseline</span>
            </>
          )}
        </button>
      </div>

      {/* Baseline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {/* Vitals & Metrics */}
        <div className="space-y-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Biometric Vitals
          </span>
          {isEditing ? (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-slate-500">Blood Group</label>
                <input
                  type="text"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-xs text-slate-400 block">Blood</span>
                <span className="text-base font-bold text-slate-800">{bloodGroup}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-xs text-slate-400 block">Height</span>
                <span className="text-base font-bold text-slate-800">{heightCm} cm</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-xs text-slate-400 block">Weight</span>
                <span className="text-base font-bold text-slate-800">{weightKg} kg</span>
              </div>
            </div>
          )}
        </div>

        {/* Known Allergies (Safety Guardrail) */}
        <div className="space-y-3">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-red-600 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Drug & Food Allergies</span>
          </div>
          {isEditing ? (
            <textarea
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              placeholder="e.g. Penicillin, Sulfa drugs, Peanuts (comma separated)"
              className="w-full text-xs p-2.5 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:outline-none"
              rows={2}
            />
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {(profile.allergies || []).length > 0 ? (
                profile.allergies.map((allergy, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200/60"
                  >
                    ⚠️ {allergy}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No known drug allergies recorded.</span>
              )}
            </div>
          )}
        </div>

        {/* Chronic Conditions & Emergency Contact */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Chronic Conditions
          </span>
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={chronicText}
                onChange={(e) => setChronicText(e.target.value)}
                placeholder="e.g. Hypertension, Asthma"
                className="w-full text-xs p-2 border rounded-lg"
              />
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="Emergency Contact Phone"
                className="w-full text-xs p-2 border rounded-lg"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {(profile.chronicConditions || []).length > 0 ? (
                  profile.chronicConditions.map((cond, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60"
                    >
                      {cond}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">None recorded.</span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600 pt-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>SOS Contact: {emergencyPhone}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
