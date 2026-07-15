#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const checks = [
  {
    file: 'BITCODE_SPEC_V28.md',
    needles: [
      'Gate 12: Settlement, Rights, Delivery, And Reconciliation',
      'bitcode.asset-pack.settlement-unlock',
      'sourceAvailable=true',
      'read-license id',
      'BTC fee receipt',
    ],
    forbidden: ['commercialSettlementAdmissible', 'ReadFindingFitsSynthesis'],
  },
  {
    file: 'BITCODE_SPEC_V28_PARITY_MATRIX.md',
    needles: [
      'BTC settlement and read-license/right transfer',
      'AssetPack delivery as pull request',
      'bitcode.asset-pack.settlement-unlock',
      'Protected source can become available',
    ],
    forbidden: ['commercialSettlementAdmissible', 'ReadFindingFitsSynthesis'],
  },
  {
    file: 'BITCODE_V28_QA.md',
    needles: [
      'Gate 12 Settlement, Rights, Delivery, And Reconciliation QA',
      'pnpm run check:v28-gate12',
      'ledgerSettlement.protectedSourceUnlock',
      'sourceAvailable=true',
    ],
  },
  {
    file: 'packages/btd/src/settlement.ts',
    needles: [
      "schema: 'bitcode.asset-pack.settlement-unlock'",
      'REQUIRED_ASSET_PACK_SETTLEMENT_READBACK_KEYS',
      'readLicense',
      'btcFeeTransaction',
      'applyAssetPackSettlementUnlockToPreview',
      'sourceAvailable',
    ],
    forbidden: ['commercialSettlementAdmissible'],
  },
  {
    file: 'packages/btd/src/index.ts',
    needles: [
      "export * from './settlement'",
    ],
  },
  {
    file: 'packages/btd/__tests__/btd.test.ts',
    needles: [
      'AssetPack settlement unlock',
      'unlocks protected source only after settlement, readback, license, and delivery agree',
      'keeps protected source withheld when any settlement readback key is missing',
    ],
  },
  {
    file: 'packages/pipeline-hosts/src/asset-pack-host-plan.ts',
    needles: [
      'buildAssetPackSettlementUnlock',
      'applyAssetPackSettlementUnlockToPreview',
      "execution.store('asset-pack/settlement', 'unlock'",
      'protectedSourceUnlock',
      'settledSourceSafePreview',
    ],
  },
  {
    file: 'apps/uapi/app/api/pipeline-host/asset-pack/runner.ts',
    needles: [
      'BITCODE_PIPELINE_BTC_FEE_SATS',
      'protectedSourceUnlock',
      'BITCODE_PIPELINE_DEPOSITOR_WALLET_ID',
      'BITCODE_PIPELINE_READER_WALLET_ID',
    ],
  },
  {
    file: 'apps/uapi/app/terminal/TerminalDepositReadWorkbench.tsx',
    needles: [
      'protectedSourceUnlock',
      'Read license',
      'BTC fee',
      'source available',
    ],
  },
  {
    file: 'apps/uapi/app/terminal/terminal-pipeline-host-client.ts',
    needles: [
      'protectedSourceUnlock',
      'sourceAvailable',
    ],
  },
  {
    file: '.github/workflows/bitcode-gate-quality.yml',
    needles: [
      'check-v28-gate12-settlement-rights-delivery.mjs',
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
  console.error('V28 Gate 12 settlement rights delivery check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('V28 Gate 12 settlement rights delivery check passed.');
