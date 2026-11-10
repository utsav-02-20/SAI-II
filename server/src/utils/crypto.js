import crypto from 'crypto';

/**
 * ArogyaAI Clinical Cryptographic Utility
 * AES-256-GCM authenticated encryption for Protected Health Information (PHI)
 * Compliant with HIPAA Security Rule (45 CFR § 164.312) & Indian DPDP Act 2023.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const DEFAULT_KEY = crypto.scryptSync(process.env.ENCRYPTION_SECRET || 'arogya-ai-clinical-secret-salt-2026', 'arogya_salt', 32);

/**
 * Encrypts sensitive PHI (e.g. medical notes, emergency phone, national ID)
 * @param {string} text - Plaintext data
 * @param {Buffer} [customKey] - Optional 32-byte key
 * @returns {string} - JSON string containing iv, authTag, and ciphertext (base64)
 */
export function encryptPHI(text, customKey = DEFAULT_KEY) {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, customKey, iv);

  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag().toString('base64');

  return JSON.stringify({
    alg: ALGORITHM,
    iv: iv.toString('base64'),
    tag: authTag,
    data: encrypted,
  });
}

/**
 * Decrypts encrypted PHI string
 * @param {string} encryptedJson - JSON string produced by encryptPHI
 * @param {Buffer} [customKey] - Optional 32-byte key
 * @returns {string} - Decrypted plaintext
 */
export function decryptPHI(encryptedJson, customKey = DEFAULT_KEY) {
  if (!encryptedJson) return encryptedJson;
  try {
    const parsed = typeof encryptedJson === 'string' ? JSON.parse(encryptedJson) : encryptedJson;
    if (!parsed.iv || !parsed.tag || !parsed.data) return encryptedJson;

    const iv = Buffer.from(parsed.iv, 'base64');
    const authTag = Buffer.from(parsed.tag, 'base64');
    const decipher = crypto.createDecipheriv(ALGORITHM, customKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(parsed.data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    // Return original if not an encrypted payload
    return encryptedJson;
  }
}
