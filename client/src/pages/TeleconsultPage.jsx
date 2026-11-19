import React from 'react';
import PageWrapper from './PageWrapper';
import TeleconsultDomain from '../features/teleconsult/TeleconsultDomain';

/**
 * Dedicated Clinician Teleconsultation Feature Page.
 * Route: /teleconsult
 */
export function TeleconsultPage({ user, language = 'en', onNavigateHome }) {
  return (
    <PageWrapper
      domainId="teleconsult"
      title={language === 'en' ? 'Teleconsultation Portal' : 'टेली-परामर्श पोर्टल'}
      tag="WebRTC & SBAR"
      badgeVariant="accent"
      onNavigateHome={onNavigateHome}
    >
      <TeleconsultDomain user={user} language={language} />
    </PageWrapper>
  );
}

export default TeleconsultPage;
