import React, { useState, useEffect, Suspense, lazy } from 'react';
import axios from 'axios';
import { DOMAINS, DEFAULT_DOMAIN_ID } from './config/domains';
import AppHeader from './components/shared/AppHeader';
import AuthModal from './components/auth/AuthModal';
import DisclaimerModal from './components/compliance/DisclaimerModal';
import ProfileCard from './components/patient/ProfileCard';
import { Loader2 } from 'lucide-react';

// Dedicated Page Modules (Lazy loaded with code splitting)
const HomePage = lazy(() => import('./pages/HomePage'));
const TriagePage = lazy(() => import('./pages/TriagePage'));
const MedicinesPage = lazy(() => import('./pages/MedicinesPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const TeleconsultPage = lazy(() => import('./pages/TeleconsultPage'));
const RiskPage = lazy(() => import('./pages/RiskPage'));
const AdherencePage = lazy(() => import('./pages/AdherencePage'));
const KnowledgePage = lazy(() => import('./pages/KnowledgePage'));

/**
 * Parses the current URL hash into a valid page/domain identifier.
 */
function getRouteFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  const validDomains = DOMAINS.map((d) => d.id);
  return validDomains.includes(hash) ? hash : 'home';
}

/**
 * Root Application Container.
 * 
 * Architectural Highlights:
 * - Central Homescreen connecting to each distinct feature.
 * - Separate, dedicated page wrapper for each feature with breadcrumbs.
 * - Hash-based URL routing: Supports browser back/forward and deep linking.
 * - Anti-AI Aesthetic: Crisp typography, zinc monochromes, hairline borders.
 * - Lazy Service Execution: Zero auto-polling on initial mount.
 */
export default function App() {
  const [activeDomain, setActiveDomain] = useState(() => getRouteFromHash());
  const [language, setLanguage] = useState('en');
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Synchronize active domain with browser URL hash
  useEffect(() => {
    const handleHashChange = () => {
      setActiveDomain(getRouteFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when user changes route programmatically
  const navigateTo = (domainId) => {
    const target = domainId === 'home' ? '' : domainId;
    window.location.hash = `#/${target}`;
    setActiveDomain(domainId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Restore authenticated session from localStorage if present
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      axios
        .get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          if (res.data?.success) {
            setUser(res.data.data.user);
          }
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        });
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  // Render the dedicated page component
  const renderActivePage = () => {
    switch (activeDomain) {
      case 'home':
        return (
          <HomePage
            language={language}
            onNavigate={navigateTo}
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        );
      case 'triage':
        return (
          <TriagePage
            language={language}
            onNavigateHome={() => navigateTo('home')}
          />
        );
      case 'medicines':
        return (
          <MedicinesPage
            user={user}
            language={language}
            onNavigateHome={() => navigateTo('home')}
          />
        );
      case 'reports':
        return (
          <ReportsPage
            user={user}
            language={language}
            onNavigateHome={() => navigateTo('home')}
          />
        );
      case 'teleconsult':
        return (
          <TeleconsultPage
            user={user}
            language={language}
            onNavigateHome={() => navigateTo('home')}
          />
        );
      case 'risk':
        return (
          <RiskPage
            language={language}
            onNavigateHome={() => navigateTo('home')}
          />
        );
      case 'adherence':
        return (
          <AdherencePage
            user={user}
            language={language}
            onNavigateHome={() => navigateTo('home')}
          />
        );
      case 'knowledge':
        return (
          <KnowledgePage
            language={language}
            onNavigateHome={() => navigateTo('home')}
          />
        );
      default:
        return (
          <HomePage
            language={language}
            onNavigate={navigateTo}
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-950 flex flex-col font-sans">
      {/* Human-Crafted Minimalist Navigation Header */}
      <AppHeader
        activeDomain={activeDomain}
        setActiveDomain={navigateTo}
        language={language}
        setLanguage={setLanguage}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Page View Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Suspense
          fallback={
            <div className="min-h-[400px] flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            </div>
          }
        >
          {renderActivePage()}
        </Suspense>

        {/* Authenticated Patient Profile Baseline (if signed in) */}
        {user && activeDomain !== 'home' && (
          <div className="mt-12 pt-8 border-t border-zinc-200/80">
            <ProfileCard
              user={user}
              onProfileUpdated={(updated) =>
                setUser((prev) => ({ ...prev, profile: updated }))
              }
            />
          </div>
        )}
      </main>

      {/* Modals & Overlays */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(authUser) => setUser(authUser)}
      />

      <DisclaimerModal language={language} />

      {/* Slim Editorial Footer */}
      <footer className="border-t border-zinc-200 bg-white py-3.5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800">ArogyaAI</span>
            <span className="text-zinc-300">•</span>
            <span>Domain-Driven Clinical Platform</span>
          </div>
          <span className="font-mono text-[11px] text-zinc-500">
            Dedicated Feature Pages • Zero Monolith • Production Ready
          </span>
        </div>
      </footer>
    </div>
  );
}
