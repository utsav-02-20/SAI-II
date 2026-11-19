import React from 'react';
import PageWrapper from './PageWrapper';
import KnowledgeDomain from '../features/knowledge/KnowledgeDomain';

/**
 * Dedicated Clinical Evidence RAG & Myth Buster Feature Page.
 * Route: /knowledge
 */
export function KnowledgePage({ language = 'en', onNavigateHome }) {
  return (
    <PageWrapper
      domainId="knowledge"
      title={language === 'en' ? 'Clinical Evidence Intelligence' : 'चिकित्सा ज्ञान सहायक'}
      tag="Grounded RAG"
      badgeVariant="accent"
      onNavigateHome={onNavigateHome}
    >
      <KnowledgeDomain language={language} />
    </PageWrapper>
  );
}

export default KnowledgePage;
