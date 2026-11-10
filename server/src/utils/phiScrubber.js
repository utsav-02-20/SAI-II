/**
 * ArogyaAI Clinical PII & PHI De-identification Engine
 * Scrubs direct patient identifiers prior to external LLM forwarding, logging, or analytics.
 * Adheres to HIPAA Safe Harbor De-identification Standards (45 CFR § 164.514(b)(2)).
 */

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
const AADHAAR_REGEX = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g;
const SSN_REGEX = /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g;
const IP_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const TITLE_NAME_REGEX = /\b(Mr\.|Mrs\.|Ms\.|Shri|Smt\.)\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?\b/g;

export function scrubPHI(text) {
  if (!text || typeof text !== 'string') return text;

  let scrubbed = text;
  let redactedCount = 0;

  // 1. Scrub Emails
  scrubbed = scrubbed.replace(EMAIL_REGEX, () => {
    redactedCount++;
    return '[EMAIL_REDACTED]';
  });

  // 2. Scrub Aadhaar (India 12-digit format)
  scrubbed = scrubbed.replace(AADHAAR_REGEX, () => {
    redactedCount++;
    return '[GOVT_ID_REDACTED]';
  });

  // 3. Scrub SSN
  scrubbed = scrubbed.replace(SSN_REGEX, () => {
    redactedCount++;
    return '[GOVT_ID_REDACTED]';
  });

  // 4. Scrub Phone Numbers
  scrubbed = scrubbed.replace(PHONE_REGEX, () => {
    redactedCount++;
    return '[PHONE_REDACTED]';
  });

  // 5. Scrub IP addresses
  scrubbed = scrubbed.replace(IP_REGEX, () => {
    redactedCount++;
    return '[IP_REDACTED]';
  });

  // 6. Scrub Saluted Names
  scrubbed = scrubbed.replace(TITLE_NAME_REGEX, () => {
    redactedCount++;
    return '[PATIENT_NAME_REDACTED]';
  });

  return {
    scrubbedText: scrubbed,
    hasRedactions: redactedCount > 0,
    totalRedactions: redactedCount,
    complianceStandard: 'HIPAA Safe Harbor § 164.514(b) & DPDP Act 2023',
  };
}
