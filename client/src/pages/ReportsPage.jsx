import React from 'react';
import PageWrapper from './PageWrapper';
import ReportsDomain from '../features/reports/ReportsDomain';

/**
 * Dedicated Multimodal Lab Reports Feature Page.
 * Route: /reports
 */
export function ReportsPage({ user, language = 'en', onNavigateHome }) {
  return (
    <PageWrapper
      domainId="reports"
      title={language === 'en' ? 'Lab Report Analyzer' : 'लैब रिपोर्ट विश्लेषक'}
      tag="Multimodal OCR"
      badgeVariant="accent"
      onNavigateHome={onNavigateHome}
    >
      <ReportsDomain user={user} language={language} />
    </PageWrapper>
  );
}

export default ReportsPage;
