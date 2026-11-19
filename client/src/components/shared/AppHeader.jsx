import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PhoneCall,
  Globe2,
  User,
  LogOut,
  RefreshCw,
  Home,
  AlertTriangle,
  Pill,
  FileText,
  Video,
  Activity,
  CalendarCheck,
  BookOpen,
} from 'lucide-react';
import { DOMAINS } from '../../config/domains';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

/**
 * Editorial Clinical Application Header & Navigation Bar.
 * 
 * Strict Anti-"AI UI" Design Principles:
 * - High-contrast minimal palette: white background (#FFFFFF), 1px hairline borders (#E5E5E5).
 * - Disciplined typography: clean sans-serif UI paired with tabular monospace for ports and telemetry.
 * - Single restrained crimson accent reserved strictly for emergency/108 SOS.
 */
export function AppHeader({
  activeDomain,
  setActiveDomain,
  language = 'en',
  setLanguage,
  user,
  onOpenAuth,
  onSignOut,
}) {
  // Telemetry status: 'idle' | 'checking' | 'online' | 'offline'
  const [telemetryState, setTelemetryState] = useState('checking');
  const [telemetryData, setTelemetryData] = useState(null);

  // Proactive & on-demand system telemetry check
  const handleCheckApi = async () => {
    setTelemetryState('checking');
    try {
      const res = await axios.get('/api/health');
      if (res.data?.status === 'ok' || res.status === 200) {
        setTelemetryState('online');
        setTelemetryData({
          express: res.data?.services?.express || 'online',
          ai: res.data?.services?.ai || 'online',
          mongo: res.data?.services?.mongo || 'online',
          uptime: res.data?.uptimeSeconds || 0,
        });
      } else {
        setTelemetryState('offline');
      }
    } catch {
      setTelemetryState('offline');
      setTelemetryData({
        express: 'offline',
        ai: 'offline',
        mongo: 'offline',
      });
    }
  };

  useEffect(() => {
    handleCheckApi();
  }, []);

  const navItems = [
    {
      id: 'home',
      label: 'Homescreen',
      labelHi: 'होमस्क्रीन',
      icon: Home,
    },
    ...DOMAINS.map((d) => ({
      id: d.id,
      label: d.label,
      labelHi: d.labelHi,
      icon: d.icon,
    })),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-12 flex items-center justify-between gap-4">
          {/* Brand Identity & Version */}
          <div
            onClick={() => setActiveDomain('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            title="Return to Homescreen"
          >
            <div className="w-6 h-6 rounded-xs bg-zinc-950 text-white flex items-center justify-center font-bold text-xs tracking-tight group-hover:bg-zinc-800 transition-colors">
              A
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold tracking-tight text-zinc-950 group-hover:text-zinc-700 transition-colors">
                ArogyaAI
              </span>
              <span className="font-mono text-[10px] text-zinc-400 border border-zinc-200 px-1 py-0.2 rounded-xs">
                v1.0-prod
              </span>
            </div>
          </div>

          {/* Center: System Status / Live Telemetry Trigger */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={handleCheckApi}
              disabled={telemetryState === 'checking'}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-mono text-[11px] transition-colors"
              title="Ping backend microservices on demand"
            >
              {telemetryState === 'checking' ? (
                <RefreshCw className="w-3 h-3 animate-spin text-zinc-500" strokeWidth={1.5} />
              ) : (
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    telemetryState === 'online' && 'bg-emerald-600',
                    telemetryState === 'offline' && 'bg-red-600',
                    telemetryState === 'idle' && 'bg-zinc-400'
                  )}
                />
              )}
              <span>Check API</span>
            </button>

            {/* Live Service Indicators */}
            <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums text-zinc-500">
              <span className="flex items-center gap-1">
                <span
                  className={cn(
                    'w-1 h-1 rounded-full',
                    (telemetryData?.express === 'online' || telemetryState === 'online') ? 'bg-emerald-600' : 'bg-zinc-300'
                  )}
                />
                Express API (5000)
              </span>
              <span className="text-zinc-300">/</span>
              <span className="flex items-center gap-1">
                <span
                  className={cn(
                    'w-1 h-1 rounded-full',
                    (telemetryData?.ai === 'online' || telemetryState === 'online') ? 'bg-emerald-600' : 'bg-zinc-300'
                  )}
                />
                FastAPI AI (8000)
              </span>
              <span className="text-zinc-300">/</span>
              <span className="flex items-center gap-1">
                <span
                  className={cn(
                    'w-1 h-1 rounded-full',
                    (telemetryData?.mongo === 'online' || telemetryState === 'online') ? 'bg-emerald-600' : 'bg-zinc-300'
                  )}
                />
                MongoDB (27017)
              </span>
            </div>
          </div>

          {/* Right Tools: Language, Auth, 108 SOS */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 rounded-xs transition-colors"
              title="Toggle language"
            >
              <Globe2 className="w-3.2 h-3.2 text-zinc-500" strokeWidth={1.5} />
              <span className="font-sans">{language === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Auth Action */}
            {user ? (
              <div className="flex items-center gap-2 px-2 py-0.5 rounded-xs bg-zinc-50 border border-zinc-200 text-xs">
                <span className="font-semibold text-zinc-900 truncate max-w-[100px]">
                  {user.profile?.firstName || user.email?.split('@')[0]}
                </span>
                <button
                  type="button"
                  onClick={onSignOut}
                  title="Sign out"
                  className="text-zinc-400 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-3 h-3" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <Button
                size="xs"
                variant="outline"
                onClick={onOpenAuth}
                leftIcon={<User className="w-3 h-3 text-zinc-600" strokeWidth={1.5} />}
                className="font-medium"
              >
                Sign In
              </Button>
            )}

            {/* Restrained Clinical Crimson 108 SOS */}
            <a
              href="tel:108"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold tracking-tight transition-colors"
              title="National Emergency Medical Dispatch (108)"
            >
              <PhoneCall className="w-3 h-3 text-white" strokeWidth={1.75} />
              <span>108 SOS</span>
            </a>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Bar: Clean Horizontal Tab Bar */}
      <div className="border-t border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 -mb-px"
            aria-label="Clinical Feature Navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeDomain === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveDomain(item.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 text-xs whitespace-nowrap transition-colors border-b-2',
                    isActive
                      ? 'border-zinc-950 text-zinc-950 font-semibold bg-zinc-50/60'
                      : 'border-transparent text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 font-medium'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-3.5 h-3.5',
                      isActive ? 'text-zinc-950' : 'text-zinc-400'
                    )}
                    strokeWidth={1.5}
                  />
                  <span>{language === 'en' ? item.label : item.labelHi}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
