import React from 'react';
import PageWrapper from './PageWrapper';
import MedicinesDomain from '../features/medicines/MedicinesDomain';

/**
 * Dedicated Medicine Intelligence & Drug Safety Feature Page.
 * Route: /medicines
 */
export function MedicinesPage({ user, language = 'en', onNavigateHome }) {
  return (
    <PageWrapper
      domainId="medicines"
      title={language === 'en' ? 'Medicine Safety & Interactions' : 'दवा सुरक्षा जांच'}
      tag="OpenFDA Grounded"
      badgeVariant="accent"
      onNavigateHome={onNavigateHome}
    >
      <MedicinesDomain user={user} language={language} />
    </PageWrapper>
  );
}

export default MedicinesPage;
