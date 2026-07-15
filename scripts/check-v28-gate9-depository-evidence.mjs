#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const checks = [
  {
    file: 'specifications/BITCODE_SPEC_V28.md',
    needles: [
      'Gate 9: Commercial Depositing And Depository Evidence',
      'source-bound depository evidence',
      'text-embedding-3-small',
      'match_deliverable_vectors',
    ],
  },
  {
    file: 'scripts/specifying/src/bitcode-demo.js',
    needles: [
      'buildDepositoryEvidence',
      'depositorySearchDocumentRoot',
      'lexicalDocumentRoot',
      'vectorDocumentRoot',
      'depositor-owned-before-read-settlement',
      'text-embedding-3-small',
    ],
  },
  {
    file: 'apps/uapi/app/terminal/TerminalDepositComposer.tsx',
    needles: [
      'depositProofRoot',
      'depositMeasurementRoot',
      'depositReconciliationReadbackRoot',
      'depositorySearchDocumentRoot',
      'depositorWalletId',
    ],
  },
  {
    file: 'apps/uapi/app/terminal/terminal-deposit-read-workbench.ts',
    needles: [
      'Source proof roots',
      'Search document roots',
      'Depositor wallet',
      'Depository index',
    ],
  },
  {
    file: 'apps/uapi/app/terminal/terminal-pipeline-host-client.ts',
    needles: [
      'depositProofRoot',
      'depositMeasurementRoot',
      'depositReconciliationReadbackRoot',
    ],
  },
  {
    file: 'supabase/queries/v28_qa_terminal_08_depository_evidence_after_deposit.sql',
    needles: [
      'proof_root',
      'measurement_root',
      'reconciliation_readback_root',
      'depository_search_document_root',
      'text-embedding-3-small',
      'match_deliverable_vectors',
    ],
  },
];

const failures = [];

for (const check of checks) {
  const absolute = path.join(repoRoot, check.file);
  if (!fs.existsSync(absolute)) {
    failures.push(`${check.file}: missing`);
    continue;
  }

  const text = fs.readFileSync(absolute, 'utf8');
  for (const needle of check.needles) {
    if (!text.includes(needle)) {
      failures.push(`${check.file}: missing "${needle}"`);
    }
  }
}

if (failures.length) {
  console.error('V28 Gate 9 depository evidence check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('V28 Gate 9 depository evidence check passed.');
