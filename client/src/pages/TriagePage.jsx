import React from 'react';
import PageWrapper from './PageWrapper';
import TriageDomain from '../features/triage/TriageDomain';

/**
 * Dedicated Emergency & Adaptive Triage Feature Page.
 * Route: /triage
 */
export function TriagePage({ language = 'en', onNavigateHome }) {
  return (
    <PageWrapper
      domainId="triage"
      title={language === 'en' ? 'Emergency & Clinical Triage' : 'आपातकालीन एवं ट्राइएज'}
      tag="Life-Safety Critical"
      badgeVariant="danger"
      onNavigateHome={onNavigateHome}
    >
      <TriageDomain language={language} />
    </PageWrapper>
  );
}

export default TriagePage;
