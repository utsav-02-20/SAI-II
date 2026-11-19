import React from 'react';
import PageWrapper from './PageWrapper';
import AdherenceDomain from '../features/adherence/AdherenceDomain';

/**
 * Dedicated Medication Adherence & Habit Streaks Feature Page.
 * Route: /adherence
 */
export function AdherencePage({ user, language = 'en', onNavigateHome }) {
  return (
    <PageWrapper
      domainId="adherence"
      title={language === 'en' ? 'Medication Adherence Tracker' : 'दवा नियम ट्रैकर'}
      tag="Habit & Streaks"
      badgeVariant="accent"
      onNavigateHome={onNavigateHome}
    >
      <AdherenceDomain user={user} language={language} />
    </PageWrapper>
  );
}

export default AdherencePage;
