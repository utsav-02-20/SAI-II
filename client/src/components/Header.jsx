import React from 'react';
import { Activity, PhoneCall, Globe2, User, LogOut } from 'lucide-react';

export default function Header({
  language,
  setLanguage,
  apiStatus,
  user,
  onOpenAuth,
  onSignOut,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-800 bg-clip-text text-transparent">
              ArogyaAI
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
              Clinical v1.0
            </span>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* API Health Pill */}
          <div className="hidden md:flex items-center space-x-2 text-xs px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-slate-600 font-medium">
              API: {apiStatus === 'online' ? 'Express Online' : 'Connecting...'}
            </span>
          </div>

          {/* Bilingual Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'en' ? 'हिंदी' : 'EN'}</span>
          </button>

          {/* User Auth Pill / Button */}
          {user ? (
            <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1">
              <span className="text-xs font-bold text-emerald-800">
                {user.profile?.firstName || user.email.split('@')[0]}
              </span>
              <button
                onClick={onSignOut}
                title="Sign out"
                className="text-slate-400 hover:text-red-600 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sign In</span>
            </button>
          )}

          {/* Emergency Red-Flag SOS Shortcut */}
          <a
            href="tel:108"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-500/20 transition"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-bold">108</span>
          </a>
        </div>
      </div>
    </header>
  );
}
