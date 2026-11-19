import React from 'react';
import { PhoneCall, AlertOctagon, HeartHandshake, X } from 'lucide-react';

export default function EmergencyAlertModal({ isOpen, onClose, emergencyData, language = 'en' }) {
  if (!isOpen || !emergencyData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-xs max-w-lg w-full p-6 shadow-xl border border-red-600 relative space-y-5">
        {/* Urgent Alert Header */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xs bg-[#DC2626] text-white flex items-center justify-center shrink-0 mt-0.5">
              <AlertOctagon className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold tracking-widest text-[#DC2626] uppercase block">
                [CRITICAL EMERGENCY DISPATCH ALERT]
              </span>
              <h3 className="text-base sm:text-lg font-bold text-zinc-950 leading-tight">
                {emergencyData.title || 'Emergency Red Flag Triggered'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 transition-colors p-1"
            title="Close"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Recommended Action */}
        <div className="p-3.5 rounded-xs bg-red-50 border border-red-200 text-red-950 text-xs leading-relaxed font-medium">
          {language === 'en'
            ? emergencyData.recommendedAction
            : emergencyData.recommendedActionHi || emergencyData.recommendedAction}
        </div>

        {/* Direct Action Dialing */}
        <div className="space-y-2">
          <a
            href="tel:108"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xs bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-sm tracking-tight transition-colors shadow-xs"
          >
            <PhoneCall className="w-4 h-4" strokeWidth={1.75} />
            <span>Call Ambulance (108) Immediately</span>
          </a>

          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:112"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xs bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>National SOS (112)</span>
            </a>
            <a
              href="tel:102"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xs border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 font-semibold text-xs transition-colors"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-zinc-700" strokeWidth={1.5} />
              <span>Maternity/Child (102)</span>
            </a>
          </div>
        </div>

        {/* Linked Family Contacts */}
        {emergencyData.emergencyContacts && emergencyData.emergencyContacts.length > 0 && (
          <div className="border-t border-zinc-100 pt-3 space-y-1.5">
            <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
              Registered Emergency Contacts
            </span>
            <div className="space-y-1">
              {emergencyData.emergencyContacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xs bg-zinc-50 text-xs text-zinc-800 border border-zinc-200"
                >
                  <span className="font-medium">
                    {contact.name} ({contact.relationship})
                  </span>
                  <a
                    href={`tel:${contact.phoneNumber}`}
                    className="flex items-center gap-1 font-mono text-zinc-900 font-bold hover:underline"
                  >
                    <PhoneCall className="w-3 h-3 text-zinc-600" strokeWidth={1.5} />
                    <span>{contact.phoneNumber}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pt-1 border-t border-zinc-100">
          <button
            onClick={onClose}
            className="text-xs font-mono text-zinc-400 hover:text-zinc-700 transition-colors py-1"
          >
            [Acknowledge & Close Alert]
          </button>
        </div>
      </div>
    </div>
  );
}
