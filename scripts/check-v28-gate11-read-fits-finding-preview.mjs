#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const checks = [
  {
    file: 'specifications/BITCODE_SPEC_V28.md',
    needles: [
      'Gate 11: Finding Fits And Source-Safe AssetPack Preview',
      'ReadFitsFindingSynthesis',
      'fitDepositAssetIds',
      'source-safe preview',
      'Share-to-Fee',
    ],
    forbidden: ['ReadFindingFitsSynthesis', 'findingFitsAdmission'],
  },
  {
    file: 'specifications/BITCODE_SPEC_V28_PARITY_MATRIX.md',
    needles: [
      'Finding Fits over the depository',
      'AssetPack synthesis and preview',
      'source-safe preview',
      'Share-to-Fee quote',
      'without seeing the protected AssetPack source before payment',
    ],
    forbidden: ['ReadFindingFitsSynthesis', 'findingFitsAdmission'],
  },
  {
    file: 'qa/BITCODE_V28_QA.md',
    needles: [
      'Gate 11',
      'ReadFitsFindingSynthesis',
      'source-safe preview',
      'Share-to-Fee',
    ],
    forbidden: ['ReadFindingFitsSynthesis', 'findingFitsAdmission'],
  },
  {
    file: 'packages/asset-packs-pipelines/domain/src/depository-search.ts',
    needles: [
      'READ_FITS_FINDING_SYNTHESIS_TOOL_IDS',
      'ReadFitsFindingSynthesis.tool.lexical-depository-search',
      'ReadFitsFindingSynthesis.tool.vector-depository-search',
      'fitDepositAssetIds',
      'queryRoot',
      'rankingRoot',
      "execution.store('depository/search', 'toolTelemetry'",
    ],
    forbidden: ['ReadFindingFitsSynthesis', "tool: 'bitcode.depository.search'"],
  },
  {
    file: 'packages/asset-packs-pipelines/domain/src/postprocess.ts',
    needles: [
      'ensureAssetPackSourceSafePreview',
      'buildAssetPackSourceSafePreview',
      "execution.store('asset-pack/preview', 'sourceSafe'",
      'sourceSafePreview',
      'feeQuote',
    ],
    forbidden: ['ReadFindingFitsSynthesis'],
  },
  {
    file: 'packages/asset-packs-pipelines/domain/src/read-need.ts',
    needles: [
      'export interface AssetPackSourceSafePreview',
      'buildAssetPackSourceSafePreview',
      'buildShareToFeePreview',
      'protectedSourceDisclosure',
      'withheldBeforeSettlement',
      'ownershipTruth',
    ],
    forbidden: ['ReadFindingFitsSynthesis'],
  },
  {
    file: 'packages/asset-packs-pipelines/domain/src/__tests__/depository-search.test.ts',
    needles: [
      'discovers every qualifying fit deposit above the configured thresholds for implementation context',
      'ReadFitsFindingSynthesis.tool.lexical-depository-search',
      'ReadFitsFindingSynthesis.tool.vector-depository-search',
      'toolTelemetry',
    ],
  },
  {
    file: 'packages/asset-packs-pipelines/domain/src/__tests__/postprocess.test.ts',
    needles: [
      'derives and stores source-safe preview evidence from an accepted Need and Finding Fits result',
      'sourceSafePreview',
      'feeQuote',
      'diff --git',
    ],
  },
  {
    file: 'apps/uapi/app/ (removed cockpit tree) ProductDepositReadWorkbench.tsx',
    needles: [
      'sourceSafePreview',
      'Source-safe preview and settlement readback',
      'previewFeeQuote',
      'Protected source unlock requires settlement.',
    ],
  },
  {
    file: '.github/workflows/bitcode-gate-quality.yml',
    needles: [
      'check-v28-gate11-read-fits-finding-preview.mjs',
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
  console.error('V28 Gate 11 Finding Fits preview check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('V28 Gate 11 Finding Fits preview check passed.');
