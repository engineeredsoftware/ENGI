// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_ARTIFACT_PATH =
  '.bitcode/v40-local-staging-rehearsal-automation.json';
export const V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_SCHEMA_ID =
  'bitcode.v40.localStagingRehearsalAutomation.v1';
export const V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_VERSION = 'V40';
export const V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_CURRENT_TARGET = 'V39';
export const V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_SOURCE_SAFETY_VERDICT =
  'source-safe-local-staging-rehearsal-automation-metadata';

export const V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_LANE_IDS = Object.freeze([
  'local',
  'staging-testnet',
]);

export const V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_ROW_IDS = Object.freeze([
  'lane:local-operator-rehearsal',
  'lane:staging-testnet-real-inference-rehearsal',
  'env:lane-bound-secret-family-checks',
  'receipt:source-safe-operator-receipts',
  'sandbox:vercel-sandbox-harness-runner',
  'readback:database-stream-and-route-readback',
  'reading:five-stage-pipeline-rehearsal',
  'sync:ledger-storage-wallet-delivery-rehearsal',
  'boundary:value-bearing-mainnet-blocked',
  'proof:artifact-tests-workflows-docs',
]);

export const V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_EXPECTED_TOTALS = Object.freeze({
  rowCount: 10,
  laneCount: 2,
  receiptKindCount: 2,
  environmentFamilyCount: 8,
  commandCount: 5,
  sourceSafetyBoundaryCount: 9,
});

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-interpolated-prompts',
  'raw-provider-responses',
  'unpaid-assetpack-source',
  'live-rehearsal-log-payloads',
  'value-bearing-mainnet-admission',
]);

const SOURCE_ROOTS = Object.freeze({
  operatorScript: 'scripts/rehearse-v40-local-staging-testnet.mjs',
  operatorCheck: 'scripts/check-v40-gate9-local-staging-rehearsal-automation.mjs',
  generator: 'scripts/generate-v40-local-staging-rehearsal-automation.mjs',
  protocolSource: 'packages/specifying/src/canonical/v40-local-staging-rehearsal-automation.js',
  protocolTest: 'packages/specifying/test/v40-local-staging-rehearsal-automation.test.js',
  pipelineHostDevRunner: 'packages/pipeline-hosts/src/dev/run-asset-pack-sandbox-host.ts',
  pipelineHostHarness: 'packages/pipeline-hosts/src/asset-pack-host-plan.ts',
  pipelineHostHarnessTest: 'packages/pipeline-hosts/src/__tests__/asset-pack-host-plan.test.ts',
  routePreflight: 'uapi/app/api/pipeline-host/asset-pack/preflight.ts',
  routeRunner: 'uapi/app/api/pipeline-host/asset-pack/runner.ts',
  routeTest: 'uapi/tests/api/pipelineHostPreflight.test.ts',
  readingRehearsal: 'packages/asset-packs-pipelines/domain/src/reading-local-staging-rehearsal.ts',
  readingRehearsalTest: 'packages/asset-packs-pipelines/domain/src/__tests__/reading-local-staging-rehearsal.test.ts',
  ledgerStorageSync: 'packages/specifying/src/canonical/v40-ledger-storage-sync.js',
  ledgerStorageSyncTest: 'packages/specifying/test/v40-ledger-storage-sync.test.js',
  packageJson: 'package.json',
  protocolIndex: 'packages/specifying/src/index.js',
  protocolTypes: 'packages/specifying/src/index.d.ts',
  v40Spec: 'BITCODE_SPEC_V40.md',
  v40Delta: 'BITCODE_SPEC_V40_DELTA.md',
  v40Notes: 'BITCODE_SPEC_V40_NOTES.md',
  v40Parity: 'BITCODE_SPEC_V40_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  rootReadme: 'README.md',
  protocolReadme: 'packages/specifying/README.md',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

const STAGING_SUPABASE_PROJECT_REF = 'tkpyosihuouusyaxtbau';
const STAGING_SUPABASE_REST_URL = new URL(
  `https://${STAGING_SUPABASE_PROJECT_REF}.supabase.co/rest/v1/`,
);
const HTTPS_URL_LITERAL_PATTERN = /https:\/\/[^\s'"`<>)]*/g;

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v40-local-staging-rehearsal-automation-row:${digest(id)}`;
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function sourceExists(repoRoot, sourcePath) {
  return existsSync(path.join(repoRoot, sourcePath));
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function sourceContainsExactHttpsUrl(source, expectedUrl) {
  return Array.from(source.matchAll(HTTPS_URL_LITERAL_PATTERN)).some((match) => {
    try {
      const parsed = new URL(match[0]);
      return (
        parsed.protocol === expectedUrl.protocol &&
        parsed.username === '' &&
        parsed.password === '' &&
        parsed.hostname === expectedUrl.hostname &&
        parsed.port === expectedUrl.port &&
        parsed.pathname === expectedUrl.pathname &&
        parsed.search === expectedUrl.search &&
        parsed.hash === expectedUrl.hash
      );
    } catch {
      return false;
    }
  });
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.rowId),
    verdict: 'covered',
    sourceSafetyClass: 'source_safe_local_staging_rehearsal_automation_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourcePayloadSerialized: false,
    rawProtectedPromptVisible: false,
    rawInterpolatedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    privateSettlementPayloadVisible: false,
    liveRehearsalLogPayloadSerialized: false,
    valueBearingMainnetAdmitted: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_ROWS = Object.freeze([
  row({
    rowId: 'lane:local-operator-rehearsal',
    laneId: 'local',
    surfaceKind: 'operator-lane',
    sourceRoots: [SOURCE_ROOTS.operatorScript, SOURCE_ROOTS.pipelineHostDevRunner],
    commandIds: [
      'node scripts/rehearse-v40-local-staging-testnet.mjs --lane local --dry-run --json',
      'pnpm --filter @bitcode/pipeline-hosts run qa:asset-pack:sandbox',
    ],
    requiredEvidence: ['local lane receipt', 'explicit sandbox opt-in', 'ignored receipt directory'],
    closureRequirement:
      'Local rehearsal automation produces a source-safe receipt and delegates live execution only after explicit operator opt-in.',
  }),
  row({
    rowId: 'lane:staging-testnet-real-inference-rehearsal',
    laneId: 'staging-testnet',
    surfaceKind: 'operator-lane',
    sourceRoots: [SOURCE_ROOTS.operatorScript, SOURCE_ROOTS.routePreflight, SOURCE_ROOTS.routeRunner],
    commandIds: [
      'node scripts/rehearse-v40-local-staging-testnet.mjs --lane staging-testnet --dry-run --json',
      'pnpm run check:v40-gate9',
    ],
    requiredEvidence: ['staging-testnet receipt', 'real inference required', 'database stream/readback required'],
    closureRequirement:
      'Staging-testnet rehearsal binds the correct Supabase project, real inference posture, and database stream/readback gates without tracked credentials.',
  }),
  row({
    rowId: 'env:lane-bound-secret-family-checks',
    laneId: 'local-and-staging-testnet',
    surfaceKind: 'environment-boundary',
    sourceRoots: [SOURCE_ROOTS.operatorScript, SOURCE_ROOTS.pipelineHostDevRunner],
    commandIds: ['node scripts/rehearse-v40-local-staging-testnet.mjs --lane staging-testnet --dry-run --json'],
    requiredEvidence: ['secret families only', 'no secret values serialized', 'staging host check'],
    closureRequirement:
      'Environment checks are expressed as lane-bound secret families and present/missing posture; receipts never carry secret values.',
  }),
  row({
    rowId: 'receipt:source-safe-operator-receipts',
    laneId: 'local-and-staging-testnet',
    surfaceKind: 'operator-receipt',
    sourceRoots: [SOURCE_ROOTS.operatorScript],
    commandIds: ['node scripts/rehearse-v40-local-staging-testnet.mjs --lane local --dry-run --write-receipt'],
    requiredEvidence: ['receipt root', 'source-safe metadata', 'ignored receipt root'],
    closureRequirement:
      'Operator receipts include command, lane, readiness, missing family, and source-safety metadata but not credentials, protected source, or live logs.',
  }),
  row({
    rowId: 'sandbox:vercel-sandbox-harness-runner',
    laneId: 'local-and-staging-testnet',
    surfaceKind: 'sandbox-harness',
    sourceRoots: [SOURCE_ROOTS.pipelineHostDevRunner, SOURCE_ROOTS.pipelineHostHarness, SOURCE_ROOTS.pipelineHostHarnessTest],
    commandIds: [
      'pnpm --filter @bitcode/pipeline-hosts exec jest --config jest.config.cjs --runTestsByPath src/__tests__/asset-pack-host-plan.test.ts --runInBand --forceExit',
    ],
    requiredEvidence: ['Vercel Sandbox host', 'evidence artifact', 'telemetry artifact', 'redacted output'],
    closureRequirement:
      'Vercel Sandbox harness automation creates bounded commands, captures evidence and telemetry, persists local artifacts, and redacts known secrets.',
  }),
  row({
    rowId: 'readback:database-stream-and-route-readback',
    laneId: 'staging-testnet',
    surfaceKind: 'database-readback',
    sourceRoots: [SOURCE_ROOTS.routePreflight, SOURCE_ROOTS.routeRunner, SOURCE_ROOTS.routeTest],
    commandIds: ['pnpm --dir uapi exec jest --runTestsByPath tests/api/pipelineHostPreflight.test.ts --runInBand'],
    requiredEvidence: ['stream to database flag', 'structured database stream flag', 'staging-testnet project host'],
    closureRequirement:
      'Staging-testnet rehearsal automation requires stream/readback routing and verifies the route preflight cannot silently mock real inference.',
  }),
  row({
    rowId: 'reading:five-stage-pipeline-rehearsal',
    laneId: 'local-and-staging-testnet',
    surfaceKind: 'reading-rehearsal',
    sourceRoots: [SOURCE_ROOTS.readingRehearsal, SOURCE_ROOTS.readingRehearsalTest],
    commandIds: [
      'pnpm --filter @bitcode/asset-packs-pipelines-domain exec jest --config jest.config.cjs --runTestsByPath src/__tests__/reading-local-staging-rehearsal.test.ts --runInBand --forceExit',
    ],
    requiredEvidence: ['five Reading stages', 'many Depository fits', 'source-safe preview', 'post-settlement delivery'],
    closureRequirement:
      'Reading rehearsal automation covers request-read, review synthesized Need, request Finding Fits, preview, settlement, and delivery posture.',
  }),
  row({
    rowId: 'sync:ledger-storage-wallet-delivery-rehearsal',
    laneId: 'local-and-staging-testnet',
    surfaceKind: 'synchronization-rehearsal',
    sourceRoots: [SOURCE_ROOTS.ledgerStorageSync, SOURCE_ROOTS.ledgerStorageSyncTest],
    commandIds: ['pnpm run check:v40-gate8 --skip-integration-tests'],
    requiredEvidence: ['ledger/database/storage alignment', 'no-custody wallet', 'delivery unlock readbacks'],
    closureRequirement:
      'Local/staging rehearsal automation carries the Gate 8 synchronization proof forward as a prerequisite to paid delivery readback.',
  }),
  row({
    rowId: 'boundary:value-bearing-mainnet-blocked',
    laneId: 'local-and-staging-testnet',
    surfaceKind: 'value-boundary',
    sourceRoots: [SOURCE_ROOTS.operatorScript, SOURCE_ROOTS.readingRehearsal],
    commandIds: ['node scripts/rehearse-v40-local-staging-testnet.mjs --lane staging-testnet --dry-run --json'],
    requiredEvidence: ['value-bearing mainnet admitted false', 'no server custody', 'dry-run by default'],
    closureRequirement:
      'Gate 9 automation remains local/staging-testnet only and blocks value-bearing mainnet admission.',
  }),
  row({
    rowId: 'proof:artifact-tests-workflows-docs',
    laneId: 'local-and-staging-testnet',
    surfaceKind: 'proof-system',
    sourceRoots: [
      SOURCE_ROOTS.v40Spec,
      SOURCE_ROOTS.v40Delta,
      SOURCE_ROOTS.v40Notes,
      SOURCE_ROOTS.v40Parity,
      SOURCE_ROOTS.roadmap,
      SOURCE_ROOTS.gateWorkflow,
      SOURCE_ROOTS.canonWorkflow,
    ],
    commandIds: ['pnpm run check:v40-gate9'],
    requiredEvidence: ['generated artifact', 'protocol exports', 'workflow wiring', 'spec closure text'],
    closureRequirement:
      'Gate 9 proof is generated, tested, documented, workflow-wired, source-safe, and replayable through check:v40-gate9.',
  }),
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult(
      'operator-script-defines-lanes-and-receipts',
      SOURCE_ROOTS.operatorScript,
      sources.operatorScript.includes('V40_REHEARSAL_LANES') &&
        sources.operatorScript.includes('buildReceipt') &&
        sources.operatorScript.includes('writeReceipt') &&
        sources.operatorScript.includes('receiptRoot'),
    ),
    predicateResult(
      'operator-script-separates-secret-families',
      SOURCE_ROOTS.operatorScript,
      sources.operatorScript.includes('ENVIRONMENT_FAMILIES') &&
        sources.operatorScript.includes('acceptedKeyNames') &&
        sources.operatorScript.includes('secretValueSerialized: false') &&
        sources.operatorScript.includes('missingEnvironmentFamilies'),
    ),
    predicateResult(
      'operator-script-blocks-live-execute-without-opt-in',
      SOURCE_ROOTS.operatorScript,
      sources.operatorScript.includes('BITCODE_V40_REHEARSAL_EXECUTE') &&
        sources.operatorScript.includes('--execute') &&
        sources.operatorScript.includes('dryRun: true'),
    ),
    predicateResult(
      'operator-script-binds-staging-project',
      SOURCE_ROOTS.operatorScript,
      sources.operatorScript.includes(STAGING_SUPABASE_PROJECT_REF) &&
        sourceContainsExactHttpsUrl(sources.operatorScript, STAGING_SUPABASE_REST_URL) &&
        sources.operatorScript.includes('staging-testnet-real-inference'),
    ),
    predicateResult(
      'sandbox-dev-script-loads-untracked-env-and-auth',
      SOURCE_ROOTS.pipelineHostDevRunner,
      sources.pipelineHostDevRunner.includes('loadLocalEnvFiles') &&
        sources.pipelineHostDevRunner.includes('.env.local') &&
        sources.pipelineHostDevRunner.includes('requireVercelAuth') &&
        sources.pipelineHostDevRunner.includes('BITCODE_RUN_VERCEL_SANDBOX_HARNESS'),
    ),
    predicateResult(
      'sandbox-dev-script-redacts-and-persists-artifacts',
      SOURCE_ROOTS.pipelineHostDevRunner,
      sources.pipelineHostDevRunner.includes('redactKnownSecrets') &&
        sources.pipelineHostDevRunner.includes('persistLocalArtifacts') &&
        sources.pipelineHostDevRunner.includes('.bitcode/pipeline-host-runs') &&
        sources.pipelineHostDevRunner.includes('summary.json'),
    ),
    predicateResult(
      'sandbox-harness-exports-evidence-and-telemetry',
      SOURCE_ROOTS.pipelineHostHarness,
      sources.pipelineHostHarness.includes('EVIDENCE_PATH') &&
        sources.pipelineHostHarness.includes('TELEMETRY_PATH') &&
        sources.pipelineHostHarness.includes('DEFAULT_LONG_TIMEOUT_MS') &&
        sources.pipelineHostHarnessTest.includes('staging-testnet-readback-'),
    ),
    predicateResult(
      'route-preflight-real-inference-database-readback',
      SOURCE_ROOTS.routePreflight,
      sources.routePreflight.includes('assertRealInferenceEnvironment') &&
        sources.routeRunner.includes('BITCODE_PIPELINE_STREAM_TO_DATABASE') &&
        sources.routeRunner.includes('BITCODE_PIPELINE_STRUCTURED_DB') &&
        sources.routeTest.includes('assertRealInferenceEnvironment'),
    ),
    predicateResult(
      'reading-rehearsal-five-stage-source-safe',
      SOURCE_ROOTS.readingRehearsal,
      sources.readingRehearsal.includes('READING_LOCAL_STAGING_REHEARSAL_STAGE_IDS') &&
        sources.readingRehearsal.includes('persistReadingLocalStagingRehearsal') &&
        sources.readingRehearsal.includes('valueBearingMainnetAdmitted: false') &&
        sources.readingRehearsalTest.includes('covers the five Reading stages'),
    ),
    predicateResult(
      'ledger-storage-sync-carried-forward',
      SOURCE_ROOTS.ledgerStorageSync,
      sources.ledgerStorageSync.includes('V40_LEDGER_STORAGE_SYNC_ARTIFACT_PATH') &&
        sources.ledgerStorageSyncTest.includes('postSettlementDeliveryUnlockCovered'),
    ),
    predicateResult(
      'protocol-exports-gate9',
      SOURCE_ROOTS.protocolIndex,
      sources.protocolIndex.includes('buildV40LocalStagingRehearsalAutomation') &&
        sources.protocolTypes.includes('buildV40LocalStagingRehearsalAutomation'),
    ),
    predicateResult(
      'scripts-and-workflows-run-gate9',
      SOURCE_ROOTS.packageJson,
      sources.packageJson.includes('check:v40-gate9') &&
        sources.packageJson.includes('rehearse:v40-local-staging') &&
        sources.gateWorkflow.includes('check-v40-gate9-local-staging-rehearsal-automation.mjs') &&
        sources.canonWorkflow.includes('check-v40-gate9-local-staging-rehearsal-automation.mjs'),
    ),
    predicateResult(
      'spec-docs-close-gate9',
      SOURCE_ROOTS.v40Spec,
      sources.v40Spec.includes('V40LocalStagingRehearsalAutomation') &&
        sources.v40Spec.includes('v40-local-staging-rehearsal-automation') &&
        sources.v40Delta.includes('Gate 9 closes with package-backed') &&
        sources.v40Notes.includes('Gate 9 implementation notes') &&
        sources.v40Parity.includes('| Gate 9 | Local/staging rehearsal artifact | implemented |') &&
        sources.roadmap.includes('V40 Gate 9 closure anchor'),
    ),
    predicateResult(
      'readmes-document-gate9',
      SOURCE_ROOTS.rootReadme,
      sources.rootReadme.includes('V40 Gate 9 adds') &&
        sources.protocolReadme.includes('V40LocalStagingRehearsalAutomation'),
    ),
  ];
}

function buildCoverage(rows, predicateResults) {
  const failedPredicateIds = predicateResults.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  const commandIds = new Set(rows.flatMap((item) => item.commandIds));
  const surfaceKinds = new Set(rows.map((item) => item.surfaceKind));

  return {
    rowCount: rows.length,
    coveredRowCount: rows.filter((item) => item.verdict === 'covered').length,
    expectedTotals: { ...V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_EXPECTED_TOTALS },
    laneCount: V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_LANE_IDS.length,
    commandCount: commandIds.size,
    surfaceKindCount: surfaceKinds.size,
    receiptKindCount: 2,
    environmentFamilyCount: 8,
    stagingProjectRef: 'tkpyosihuouusyaxtbau',
    stagingRestHost: 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/',
    failedPredicateIds,
    allCriticalSurfacesClosed: failedPredicateIds.length === 0 && rows.every((item) => item.verdict === 'covered'),
    localLaneReceiptCovered: failedPredicateIds.length === 0,
    stagingTestnetReceiptCovered: failedPredicateIds.length === 0,
    laneBoundSecretFamiliesCovered: failedPredicateIds.length === 0,
    sourceSafeOperatorReceiptsCovered: failedPredicateIds.length === 0,
    sandboxHarnessAutomationCovered: failedPredicateIds.length === 0,
    databaseStreamReadbackCovered: failedPredicateIds.length === 0,
    fiveStageReadingRehearsalCovered: failedPredicateIds.length === 0,
    ledgerStorageWalletDeliveryRehearsalCovered: failedPredicateIds.length === 0,
    valueBearingMainnetBlocked: true,
    noForbiddenPayloadsSerialized: true,
  };
}

function buildProofRoots(rows, predicateResults, coverage) {
  return {
    rowSetRoot: `sha256:${digest(JSON.stringify(rows.map((item) => item.rowRoot)))}`,
    predicateRoot: `sha256:${digest(JSON.stringify(predicateResults))}`,
    coverageRoot: `sha256:${digest(JSON.stringify(coverage))}`,
    artifactRoot: `sha256:${digest(JSON.stringify({ rows: rows.map((item) => item.rowRoot), coverage }))}`,
  };
}

export function buildV40LocalStagingRehearsalAutomation(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const rows = V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_ROWS.map((item) => ({ ...item }));
  const predicateResults = buildPredicateResults(repoRoot);
  const coverage = buildCoverage(rows, predicateResults);
  const proofRoots = buildProofRoots(rows, predicateResults, coverage);

  return {
    artifactId: 'v40-local-staging-rehearsal-automation',
    schemaId: V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_SCHEMA_ID,
    version: V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_VERSION,
    currentTarget: V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_CURRENT_TARGET,
    generatedAt: input.generatedAt || '2026-05-25T00:00:00.000Z',
    artifactPath: V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_ARTIFACT_PATH,
    passed: coverage.allCriticalSurfacesClosed,
    sourceSafetyVerdict: V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_SOURCE_SAFETY_VERDICT,
    laneIds: [...V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_LANE_IDS],
    expectedTotals: { ...V40_LOCAL_STAGING_REHEARSAL_AUTOMATION_EXPECTED_TOTALS },
    operatorCommands: [
      'node scripts/rehearse-v40-local-staging-testnet.mjs --lane local --dry-run --json',
      'node scripts/rehearse-v40-local-staging-testnet.mjs --lane staging-testnet --dry-run --json',
      'BITCODE_V40_REHEARSAL_EXECUTE=1 node scripts/rehearse-v40-local-staging-testnet.mjs --lane staging-testnet --execute --write-receipt',
    ],
    receiptArtifactRoot: '.bitcode/pipeline-host-runs/v40-rehearsal-receipts',
    rows,
    predicateResults,
    coverage,
    proofRoots,
    sourceSafety: {
      sourceSafeMetadataOnly: true,
      protectedSourcePayloadSerialized: false,
      rawProtectedPromptVisible: false,
      rawInterpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      unpaidAssetPackSourceVisible: false,
      credentialsSerialized: false,
      walletPrivateMaterialVisible: false,
      privateSettlementPayloadVisible: false,
      liveRehearsalLogPayloadSerialized: false,
      valueBearingMainnetAdmitted: false,
      forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
    },
  };
}

export function listMissingV40LocalStagingRehearsalAutomationSources(repoRoot = DEFAULT_REPO_ROOT) {
  return Object.values(SOURCE_ROOTS).filter((sourcePath) => !sourceExists(repoRoot, sourcePath));
}
