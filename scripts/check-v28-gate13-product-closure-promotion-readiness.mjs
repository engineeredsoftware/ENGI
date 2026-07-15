#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const checks = [
  {
    file: 'specifications/BITCODE_SPEC_V28.md',
    needles: [
      'Gate 13: Commercial Product Closure And Promotion Readiness',
      'full `protocol-demonstration` proof suite',
      'staging-testnet readback verifier',
      'tkpyosihuouusyaxtbau.supabase.co',
      'version/v28 promotion pull request',
    ],
    forbidden: ['ReadFindingFitsSynthesis', 'commercialSettlementAdmissible'],
  },
  {
    file: 'specifications/BITCODE_SPEC_V28_PARITY_MATRIX.md',
    needles: [
      'Gate 13 closure closes the two final carryforward rows',
      'full `protocol-demonstration` suite',
      'staging-testnet readback verifier',
      'promotion workflow',
    ],
    forbidden: ['ReadFindingFitsSynthesis', 'commercialSettlementAdmissible'],
  },
  {
    file: 'BITCODE_V28_QA.md',
    needles: [
      'Gate 13 Commercial Product Closure And Promotion Readiness QA',
      'pnpm run check:v28-gate13',
      'npm --prefix protocol-demonstration test',
      'pnpm test:qa:v28:pipeline-readback',
      '--readback-source rest',
      'DB readback is a stricter',
      'tkpyosihuouusyaxtbau.supabase.co',
    ],
  },
  {
    file: 'package.json',
    needles: [
      '"check:v28-gate13": "node scripts/check-v28-gate13-product-closure-promotion-readiness.mjs"',
      '"test:qa:v28:pipeline-readback"',
    ],
  },
  {
    file: '.github/workflows/bitcode-gate-quality.yml',
    needles: [
      'check-v28-gate13-product-closure-promotion-readiness.mjs',
      'pnpm test:qa:v28:pipeline-readback',
      'npm --prefix protocol-demonstration test',
      'npm --prefix protocol-demonstration run test:v28-mvp-qa',
    ],
  },
  {
    file: '.github/workflows/v28-canon-promotion.yml',
    needles: [
      'check-v28-gate13-product-closure-promotion-readiness.mjs',
      'pnpm test:qa:v28:pipeline-readback',
      'pnpm --filter @bitcode/btd typecheck',
      'pnpm --filter @bitcode/btd test',
      'npm --prefix protocol-demonstration test',
      'Promote V28 canon files',
    ],
  },
  {
    file: 'scripts/promote-bitcode-canon.mjs',
    needles: [
      'check-v28-gate13-product-closure-promotion-readiness.mjs',
      "['pnpm', ['test:qa:v28:pipeline-readback']]",
      "['pnpm', ['--filter', '@bitcode/btd', 'typecheck']]",
      "['npm', ['--prefix', 'protocol-demonstration', 'test']]",
    ],
  },
  {
    file: 'protocol-demonstration/src/canonical/enums.js',
    needles: [
      "DEPOSIT_TO_READ_FIT: 'deposit-to-read-fit'",
    ],
    forbidden: ['DEPOSIT_TO_NEED_FIT'],
  },
  {
    file: 'protocol-demonstration/test/proof-member-matrix.test.js',
    needles: [
      'assert.equal(matrix.cellCount, 736)',
      'assert.equal(matrix.passedCellCount, 736)',
      "familyCounts.get('settlement-source-to-shares'), 128",
    ],
  },
  {
    file: 'protocol-demonstration/test/theorem-evidence-matrix.test.js',
    needles: [
      'assert.equal(matrix.cellCount, 928)',
      'assert.equal(matrix.passedCellCount, 928)',
      "familyCounts.get('settlement-source-to-shares'), 128",
    ],
  },
  {
    file: 'protocol-demonstration/src/canonical/run-artifacts.js',
    needles: [
      'proofMemberSemantic: 736',
      'theoremEvidence: 928',
      'total: 1864',
    ],
  },
  {
    file: 'protocol-demonstration/test/proven-generator.test.js',
    needles: [
      'without overstating superseded promotion readiness',
      "ACTIVE_CANON_VERSION !== 'V26'",
      'promotionReady, false',
      "generated.markdown.includes('- promotionReady: `false`')",
    ],
  },
  {
    file: 'scripts/verify-v28-pipeline-readback.test.mjs',
    needles: [
      'ready when all required recent readback counts are present',
      'uses one bounded database client for DB readback counts and health',
      'blocks missing ledger rows',
      'blocks missing tool execution rows',
    ],
  },
  {
    file: 'scripts/verify-v28-pipeline-readback.mjs',
    needles: [
      'const DEFAULT_DB_TIMEOUT_MS = 8000',
      'connectionTimeoutMillis: DEFAULT_DB_TIMEOUT_MS',
      'query_timeout: DEFAULT_DB_TIMEOUT_MS',
      'statement_timeout: DEFAULT_DB_TIMEOUT_MS',
      'readDbCountsAndHealth',
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
  for (const forbidden of check.forbidden || []) {
    if (text.includes(forbidden)) {
      failures.push(`${check.file}: forbidden "${forbidden}"`);
    }
  }
}

if (failures.length) {
  console.error('V28 Gate 13 product closure promotion readiness check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('V28 Gate 13 product closure promotion readiness check passed.');
