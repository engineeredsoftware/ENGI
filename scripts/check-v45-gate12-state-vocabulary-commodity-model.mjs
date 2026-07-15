#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');

const assetPackStates = [
  'deposit-option-synthesized',
  'deposit-option-reviewed',
  'depository-assetpack-admitted',
  'fit-candidates-recalled',
  'fit-set-selected',
  'need-fit-assetpack-synthesized',
  'need-fit-assetpack-quoted',
  'settlement-observed',
  'btd-settled-rights-transferred',
  'source-unlocked-delivery',
  'compensated-and-reconciled',
  'repair-required',
];

const btdStates = [
  'btd-not-applicable',
  'btd-potential-measured',
  'need-fit-measurements-admitted',
  'measurement-weight-policy-locked',
  'weighted-scalar-volume-computed',
  'btd-quantized',
  'measuremint-applied',
  'btd-range-assigned',
  'btd-quote-bound',
  'btd-rights-pending',
  'btd-rights-transferred',
  'btd-source-to-shares-allocated',
  'btd-repair-required',
];

const btcStates = [
  'btc-not-quoteable',
  'btc-quote-issued',
  'btc-quote-accepted',
  'btc-quote-inactive',
  'btc-wallet-ready',
  'btc-psbt-prepared',
  'btc-psbt-signed',
  'btc-broadcast-submitted',
  'btc-payment-observed',
  'btc-payment-mismatch-repair-required',
  'btc-finality-confirmed',
  'btc-replaced-reorged-or-failed',
  'btc-settlement-finalized',
  'btc-contributor-compensation-routable',
  'btc-refund-or-escalation-required',
  'btc-settlement-repair-required',
];

const disclosureBoundaries = [
  'before-settlement',
  'after-preview',
  'after-quote',
  'after-payment-observation',
  'after-finality',
  'after-btd-rights-transfer',
  'after-repository-delivery',
];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function run(root, args) {
  return execFileSync(process.execPath, args, { cwd: root, encoding: 'utf8' }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = { repoRoot: defaultRepoRoot, skipBranchCheck: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v45-gate12-state-vocabulary-commodity-model.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks the V45 Gate 12 package-owned AssetPack commodity state vocabulary and /packs projection binding.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function assertLiterals(failures, content, literals, label, location) {
  for (const literal of literals) {
    assertCheck(failures, content.includes(`'${literal}'`) || content.includes(`\`${literal}\``), `${location} must include ${label}: ${literal}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const root = args.repoRoot;
  const failures = [];
  const pointer = read(root, 'specifications/BITCODE_SPEC.txt').trim();

  assertCheck(failures, pointer === 'V44', `BITCODE_SPEC.txt must remain V44 during V45 Gate 12 work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v45' || /^v45\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V45 work must occur on version/v45 or v45/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'specifications/BITCODE_SPEC_V45.md',
    'specifications/BITCODE_SPEC_V45_PARITY_MATRIX.md',
    'specifications/BITCODE_SPEC.txt',
    'package.json',
    'packages/asset-packs-pipelines/domain/package.json',
    'packages/asset-packs-pipelines/domain/src/index.ts',
    'packages/asset-packs-pipelines/domain/src/asset-pack-commodity-state.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-commodity-state.test.ts',
    'apps/uapi/components/bitcode/activity/pack-activity-model.ts',
    'apps/uapi/tests/packActivityModel.test.ts',
    'apps/uapi/jest.config.cjs',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, exists(root, relativePath), `Missing required V45 Gate 12 file: ${relativePath}`);
  }

  const commodityState = read(root, 'packages/asset-packs-pipelines/domain/src/asset-pack-commodity-state.ts');
  const commodityStateTest = read(root, 'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-commodity-state.test.ts');
  const packActivityModel = read(root, 'apps/uapi/components/bitcode/activity/pack-activity-model.ts');
  const packActivityTest = read(root, 'apps/uapi/tests/packActivityModel.test.ts');
  const assetPackPackageJson = read(root, 'packages/asset-packs-pipelines/domain/package.json');
  const assetPackIndex = read(root, 'packages/asset-packs-pipelines/domain/src/index.ts');
  const uapiJestConfig = read(root, 'apps/uapi/jest.config.cjs');
  const packageJson = read(root, 'package.json');
  const parity = read(root, 'specifications/BITCODE_SPEC_V45_PARITY_MATRIX.md');

  assertLiterals(failures, commodityState, assetPackStates, 'AssetPack lifecycle state', 'asset-pack-commodity-state.ts');
  assertLiterals(failures, commodityState, btdStates, 'BTD scalar-volume state', 'asset-pack-commodity-state.ts');
  assertLiterals(failures, commodityState, btcStates, 'BTC settlement state', 'asset-pack-commodity-state.ts');
  assertLiterals(failures, commodityState, disclosureBoundaries, 'disclosure boundary', 'asset-pack-commodity-state.ts');

  assertLiterals(failures, commodityStateTest, assetPackStates, 'tested AssetPack lifecycle state', 'asset-pack-commodity-state.test.ts');
  assertLiterals(failures, commodityStateTest, btdStates, 'tested BTD scalar-volume state', 'asset-pack-commodity-state.test.ts');
  assertLiterals(failures, commodityStateTest, btcStates, 'tested BTC settlement state', 'asset-pack-commodity-state.test.ts');

  for (const symbol of [
    'ASSET_PACK_LIFECYCLE_STATES',
    'BTD_SCALAR_VOLUME_STATES',
    'BTC_SETTLEMENT_STATES',
    'ASSET_PACK_DISCLOSURE_BOUNDARIES',
    'buildAssetPackCommodityStateProjection',
    'projectAssetPackCommodityStateForPayload',
    'assertAssetPackCommodityStateProjection',
    'toSourceSafeAssetPackCommodityStateDisplay',
  ]) {
    assertCheck(failures, commodityState.includes(symbol), `asset-pack-commodity-state.ts must define ${symbol}.`);
  }

  for (const blocker of [
    'source_unlock_without_btd_rights_transfer',
    'rights_or_delivery_without_btc_finality',
    'btc_quote_collapsed_with_payment_observation',
    'btc_payment_observation_collapsed_with_finality',
    'assetpack_quote_collapsed_with_settlement_observation',
    'settlement_observation_collapsed_with_rights_transfer',
    'protected_source_visibility_before_settlement',
  ]) {
    assertCheck(failures, commodityState.includes(blocker), `asset-pack-commodity-state.ts must reject unsafe/collapsed state: ${blocker}.`);
    assertCheck(failures, commodityStateTest.includes(blocker), `asset-pack-commodity-state.test.ts must cover unsafe/collapsed state: ${blocker}.`);
  }

  for (const phrase of [
    'sourceSafeMetadataOnly: true',
    'protectedSourceVisible: false',
    'unpaidAssetPackSourceVisible: false',
    'rawPromptVisible: false',
    'rawProviderResponseVisible: false',
    'walletPrivateMaterialVisible: false',
    'credentialsSerialized: false',
  ]) {
    assertCheck(failures, commodityState.includes(phrase), `commodity state source-safety projection must include ${phrase}.`);
  }

  for (const phrase of [
    'AssetPackCommodityStateDisplay',
    'projectAssetPackCommodityStateForPayload',
    'assertAssetPackCommodityStateProjection',
    'toSourceSafeAssetPackCommodityStateDisplay',
    'commodityState',
    'commodityState.assetPackState',
    'commodityState.btdState',
    'commodityState.btcState',
    'commodityState.disclosureBoundary',
  ]) {
    assertCheck(failures, packActivityModel.includes(phrase), `/packs activity model must bind commodity projection phrase: ${phrase}`);
  }

  for (const phrase of [
    'commodityState',
    'need-fit-assetpack-quoted',
    'btd-quote-bound',
    'btc-quote-issued',
    'disclosureBoundary',
    'protectedSourceVisible',
  ]) {
    assertCheck(failures, packActivityTest.includes(phrase), `packActivityModel test must assert commodity display phrase: ${phrase}`);
  }

  assertCheck(
    failures,
    assetPackPackageJson.includes('"./asset-pack-commodity-state": "./src/asset-pack-commodity-state.ts"'),
    '@bitcode/asset-packs-pipelines-domain package must export ./asset-pack-commodity-state.',
  );
  assertCheck(
    failures,
    assetPackIndex.includes("export * from './asset-pack-commodity-state';"),
    '@bitcode/asset-packs-pipelines-domain root index must export asset-pack-commodity-state.',
  );
  assertCheck(
    failures,
    uapiJestConfig.includes('^@bitcode/asset-packs-pipelines-domain/asset-pack-commodity-state$'),
    'uapi Jest config must resolve @bitcode/asset-packs-pipelines-domain/asset-pack-commodity-state.',
  );
  assertCheck(
    failures,
    packageJson.includes('"check:v45-gate12": "node scripts/check-v45-gate12-state-vocabulary-commodity-model.mjs"'),
    'package.json must expose check:v45-gate12.',
  );

  for (const phrase of [
    'Gate 12 implementation readback',
    'packages/asset-packs-pipelines/domain/src/asset-pack-commodity-state.ts',
    'apps/uapi/components/bitcode/activity/pack-activity-model.ts',
    'check:v45-gate12',
  ]) {
    assertCheck(failures, parity.includes(phrase), `V45 parity matrix must include Gate 12 readback phrase: ${phrase}`);
  }

  try {
    const output = run(root, [
      'scripts/check-bitcode-spec-family.mjs',
      '--version',
      'V45',
      '--mode',
      'draft',
      '--current-target',
      'V44',
    ]);
    assertCheck(failures, output.includes('Bitcode spec family ok for V45'), 'V45 draft spec-family check did not report success.');
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    failures.push(`V45 draft spec-family check failed: ${detail}`);
  }

  if (failures.length > 0) {
    process.stderr.write('V45 Gate 12 state vocabulary and commodity model check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V45 Gate 12 state vocabulary and commodity model check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
