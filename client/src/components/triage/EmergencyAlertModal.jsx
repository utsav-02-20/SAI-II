import React from 'react';
import { PhoneCall, AlertOctagon, HeartHandshake, X } from 'lucide-react';

export default function EmergencyAlertModal({ isOpen, onClose, emergencyData, language = 'en' }) {
  if (!isOpen || !emergencyData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-red-500 relative overflow-hidden">
        {/* Pulsing Alert Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center animate-bounce shadow-lg shadow-red-600/30">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-black tracking-widest text-red-600 uppercase">
              Immediate Clinical Alert
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {emergencyData.title || 'Emergency Red Flag Triggered'}
            </h3>
          </div>
        </div>

        {/* Action Callout */}
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-sm leading-relaxed mb-6 font-medium">
          {language === 'en'
            ? emergencyData.recommendedAction
            : emergencyData.recommendedActionHi || emergencyData.recommendedAction}
        </div>

        {/* 1-Click Dialing Buttons */}
        <div className="space-y-3 mb-6">
          <a
            href="tel:108"
            className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-base shadow-lg shadow-red-600/30 transition transform hover:-translate-y-0.5"
          >
            <PhoneCall className="w-5 h-5 animate-pulse" />
            <span>Call Ambulance (108) Immediately</span>
          </a>

          <div className="grid grid-cols-2 gap-3">
            <a
              href="tel:112"
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>National SOS (112)</span>
            </a>
            <a
              href="tel:102"
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
            >
              <HeartHandshake className="w-4 h-4 text-red-600" />
              <span>Maternity/Child (102)</span>
            </a>
          </div>
        </div>

        {/* Linked Family Contacts if available */}
        {emergencyData.emergencyContacts && emergencyData.emergencyContacts.length > 0 && (
          <div className="border-t border-slate-100 pt-4 mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Registered Emergency Contacts
            </span>
            <div className="space-y-1.5">
              {emergencyData.emergencyContacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs text-slate-800 border border-slate-200"
                >
                  <span className="font-semibold">
                    {contact.name} ({contact.relationship})
                  </span>
                  <a
                    href={`tel:${contact.phoneNumber}`}
                    className="flex items-center space-x-1 text-emerald-600 font-bold hover:underline"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{contact.phoneNumber}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 py-2 transition"
          >
            Acknowledge & Close Alert
          </button>
        </div>
      </div>
    </div>
  );
}
