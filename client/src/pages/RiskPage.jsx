import React from 'react';
import PageWrapper from './PageWrapper';
import RiskDomain from '../features/risk/RiskDomain';

/**
 * Dedicated Disease Risk & Biological Health Age Feature Page.
 * Route: /risk
 */
export function RiskPage({ language = 'en', onNavigateHome }) {
  return (
    <PageWrapper
      domainId="risk"
      title={language === 'en' ? 'Disease Risk & Health Age' : 'स्वास्थ्य जोखिम विश्लेषण'}
      tag="Gemini LLM"
      badgeVariant="accent"
      onNavigateHome={onNavigateHome}
    >
      <RiskDomain language={language} />
    </PageWrapper>
  );
}

export default RiskPage;
