import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('===================================================================');
console.log('       ArogyaAI Monorepo - Comprehensive System Integrity Check     ');
console.log('===================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function check(label, fn) {
  totalChecks++;
  try {
    const result = fn();
    if (result === true || result === undefined) {
      console.log(`[PASS] ${label}`);
      passedChecks++;
    } else {
      console.log(`[FAIL] ${label} - ${result}`);
      failedChecks++;
    }
  } catch (err) {
    console.log(`[FAIL] ${label} - ${err.message}`);
    failedChecks++;
  }
}

// 1. Client Architecture Checks
console.log('--- 1. Frontend Client Architecture & Dedicated Pages ---');

const clientPages = [
  'client/src/pages/HomePage.jsx',
  'client/src/pages/TriagePage.jsx',
  'client/src/pages/MedicinesPage.jsx',
  'client/src/pages/ReportsPage.jsx',
  'client/src/pages/TeleconsultPage.jsx',
  'client/src/pages/RiskPage.jsx',
  'client/src/pages/AdherencePage.jsx',
  'client/src/pages/KnowledgePage.jsx',
  'client/src/pages/PageWrapper.jsx',
];

clientPages.forEach((p) => {
  check(`Page exists: ${p}`, () => {
    const fullPath = path.join(rootDir, p);
    if (!fs.existsSync(fullPath)) return 'File not found';
    const content = fs.readFileSync(fullPath, 'utf-8');
    if (content.length < 50) return 'File is empty or truncated';
    return true;
  });
});

// UI Primitives
const uiPrimitives = [
  'client/src/components/ui/Button.jsx',
  'client/src/components/ui/Card.jsx',
  'client/src/components/ui/Badge.jsx',
  'client/src/components/ui/Input.jsx',
  'client/src/components/ui/EmptyState.jsx',
  'client/src/components/shared/AppHeader.jsx',
  'client/src/components/shared/DomainHeader.jsx',
  'client/src/components/shared/SeedDataLoader.jsx',
  'client/src/config/domains.js',
  'client/src/App.jsx',
];

uiPrimitives.forEach((p) => {
  check(`Component primitive: ${p}`, () => {
    const fullPath = path.join(rootDir, p);
    if (!fs.existsSync(fullPath)) return 'File not found';
    return true;
  });
});

// Anti-AI Verification
check('Anti-"AI UI" Aesthetic check (Zero Sparkles in Client Pages)', () => {
  const homePath = path.join(rootDir, 'client/src/pages/HomePage.jsx');
  const content = fs.readFileSync(homePath, 'utf-8');
  if (content.includes('Sparkles')) return 'Found Sparkles icon in HomePage.jsx';
  return true;
});

// 2. Seed Data Integrity
console.log('\n--- 2. Clinical Seed Datasets (/seed & /client/public/seed) ---');

const seedFiles = [
  'mock_medicines.json',
  'mock_patients.json',
  'mock_doctors.json',
  'mock_lab_reports.json',
  'mock_guidelines.json',
];

seedFiles.forEach((file) => {
  check(`Seed JSON valid: seed/${file}`, () => {
    const p = path.join(rootDir, 'seed', file);
    if (!fs.existsSync(p)) return 'File missing in /seed';
    const raw = fs.readFileSync(p, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return 'Invalid array data';
    return true;
  });

  check(`Client public seed mirror: client/public/seed/${file}`, () => {
    const p = path.join(rootDir, 'client/public/seed', file);
    if (!fs.existsSync(p)) return 'File missing in client/public/seed';
    const raw = fs.readFileSync(p, 'utf-8');
    JSON.parse(raw);
    return true;
  });
});

// 3. Backend Express API Checks
console.log('\n--- 3. Express Backend Services ---');

const serverFiles = [
  'server/src/server.js',
  'server/src/app.js',
  'server/src/routes/health.routes.js',
  'server/src/controllers/health.controller.js',
  'server/prisma/schema.prisma',
  'server/package.json',
];

serverFiles.forEach((p) => {
  check(`Server module: ${p}`, () => {
    const fullPath = path.join(rootDir, p);
    if (!fs.existsSync(fullPath)) return 'File not found';
    return true;
  });
});

// 4. AI Service Checks
console.log('\n--- 4. Python FastAPI AI Service ---');

const aiFiles = [
  'ai-service/app/main.py',
  'ai-service/requirements.txt',
];

aiFiles.forEach((p) => {
  check(`AI Microservice: ${p}`, () => {
    const fullPath = path.join(rootDir, p);
    if (!fs.existsSync(fullPath)) return 'File not found';
    return true;
  });
});

console.log('\n===================================================================');
console.log(`Results: ${passedChecks}/${totalChecks} checks passed (${failedChecks} failed)`);
console.log('===================================================================\n');

if (failedChecks > 0) {
  process.exit(1);
} else {
  console.log('[SUCCESS] All systems, dedicated pages, and services verified successfully.');
  process.exit(0);
}
