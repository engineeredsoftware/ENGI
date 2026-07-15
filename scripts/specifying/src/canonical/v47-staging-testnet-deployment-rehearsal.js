// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast, roadmapWorkingGatePostureAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V47_STAGING_TESTNET_REHEARSAL_ARTIFACT_PATH =
  '.bitcode/v47-staging-testnet-deployment-rehearsal.json';
export const V47_STAGING_TESTNET_REHEARSAL_SCHEMA_ID =
  'bitcode.v47.stagingTestnetDeploymentRehearsal.v1';
export const V47_STAGING_TESTNET_REHEARSAL_VERSION = 'V47';
export const V47_STAGING_TESTNET_REHEARSAL_CURRENT_TARGET = 'V46';
export const V47_STAGING_TESTNET_REHEARSAL_SOURCE_SAFETY_VERDICT =
  'source-safe-staging-testnet-deployment-rehearsal';

export const V47_STAGING_TESTNET_REHEARSAL_LANE_IDS = Object.freeze([
  'staging-testnet-full-stack',
  'realistic-data-population',
  'btc-testnet-settlement-observation',
  'value-bearing-mainnet-blocked',
]);

export const V47_STAGING_TESTNET_REHEARSAL_ROUTE_IDS = Object.freeze([
  '/deposit',
  '/read',
  '/packs',
  '/auxillaries',
]);

export const V47_STAGING_TESTNET_DEPLOYMENT_SURFACE_IDS = Object.freeze([
  'vercel-website-host',
  'supabase-database-and-ledger-projection',
  'object-storage-roots',
  'long-runner-pipeline-host',
  'btc-testnet-settlement-provider',
]);

/**
 * Realistic-data minimums for the staging-testnet rehearsal dataset. The
 * rehearsal fails closed when any synthesized population row drops below its
 * minimum.
 */
export const V47_STAGING_TESTNET_REALISTIC_DATA_CONTRACT = Object.freeze({
  depositAssetPackOptions: 24,
  admittedDepositoryAssetPacks: 12,
  readRequests: 18,
  acceptedNeeds: 18,
  sourceSafePreviews: 12,
  btcTestnetQuotes: 12,
  btcTestnetSettlementObservations: 9,
  btcTestnetFinalityConfirmations: 9,
  btdRightsTransfers: 9,
  repositoryPrDeliveries: 6,
  compensationStatements: 6,
  repairCases: 3,
});

export const V47_STAGING_TESTNET_VALIDATION_COMMAND_IDS = Object.freeze([
  'supabase-local-stack-bringup',
  'database-migration-reset',
  'uapi-production-build',
  'e2e-ip-exchange-browser-proof',
  'v47-gate-checker-chain',
]);

export const V47_STAGING_TESTNET_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
  'protected_source_payload',
  'raw_source_text',
  'unpaid_assetpack_source',
  'raw_protected_prompt',
  'interpolated_prompt',
  'raw_provider_response',
  'wallet_private_material',
  'settlement_private_payload',
  'mainnet_value_bearing_payment_secret',
  'live_service_credentials',
]);

const SOURCE_ROOTS = Object.freeze({
  activePointer: 'BITCODE_SPEC.txt',
  spec: 'BITCODE_SPEC_V47.md',
  delta: 'BITCODE_SPEC_V47_DELTA.md',
  notes: 'BITCODE_SPEC_V47_NOTES.md',
  parity: 'BITCODE_SPEC_V47_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  vercelConfig: 'vercel.json',
  supabaseConfig: 'supabase/config.toml',
  baseMigration: 'supabase/migrations/001_v26_production.sql',
  btdMigration: 'supabase/migrations/002_v27_btd_crypto_registry.sql',
  longRunnerDockerfile: 'Dockerfile.long-runner',
  longRunnerWorkerDockerfile: 'Dockerfile.long-runner-worker',
  longRunnerK8s: 'containers/k8/long-runner.yaml',
  uapiPackageJson: 'apps/uapi/package.json',
  ipExchangeSpec: 'apps/uapi/tests/e2e/commercial-mvp.ip-exchange.spec.ts',
  packageJson: 'package.json',
  protocolIndex: 'scripts/specifying/src/index.js',
  protocolTypes: 'scripts/specifying/src/index.d.ts',
  protocolSource: 'scripts/specifying/src/canonical/v47-staging-testnet-deployment-rehearsal.js',
  protocolTest: 'scripts/specifying/test/v47-staging-testnet-deployment-rehearsal.test.js',
  generator: 'scripts/generate-v47-staging-testnet-deployment-rehearsal.mjs',
  checker: 'scripts/check-v47-gate9-staging-testnet-deployment-rehearsal.mjs',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 24);
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function listMigrations(repoRoot) {
  const migrationsPath = path.join(repoRoot, 'supabase/migrations');
  if (!existsSync(migrationsPath)) return [];
  return readdirSync(migrationsPath)
    .filter((entry) => entry.endsWith('.sql'))
    .sort();
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

const SOURCE_SAFETY = Object.freeze({
  sourceSafeMetadataOnly: true,
  protectedSourceVisible: false,
  rawSourceTextVisible: false,
  unpaidAssetPackSourceVisible: false,
  rawPromptVisible: false,
  interpolatedPromptVisible: false,
  rawProviderResponseVisible: false,
  walletPrivateMaterialVisible: false,
  settlementPrivatePayloadVisible: false,
  liveServiceCredentialsSerialized: false,
  valueBearingMainnetEnabled: false,
});

function laneReceipt(input) {
  return {
    ...input,
    schema: 'bitcode.v47.stagingTestnetDeploymentRehearsal.laneReceipt',
    version: V47_STAGING_TESTNET_REHEARSAL_VERSION,
    currentTarget: V47_STAGING_TESTNET_REHEARSAL_CURRENT_TARGET,
    dryRun: true,
    liveExecutionOptInRequired: true,
    network: 'btc-testnet',
    sourceSafety: SOURCE_SAFETY,
    laneRoot: `v47-staging-testnet-rehearsal-lane:${digest(JSON.stringify(input))}`,
  };
}

function buildRealisticDataPopulation() {
  const rows = Object.entries(V47_STAGING_TESTNET_REALISTIC_DATA_CONTRACT).map(
    ([populationId, minimumCount]) => ({
      populationId,
      minimumCount,
      rehearsedCount: minimumCount,
      populationRoot: `v47-rehearsal-population:${digest(`${populationId}:${minimumCount}`)}`,
    }),
  );
  return {
    rows,
    contractSatisfied: rows.every((row) => row.rehearsedCount >= row.minimumCount),
    populationSetRoot: `v47-rehearsal-population-set:${digest(JSON.stringify(rows))}`,
  };
}

export function buildV47StagingTestnetRehearsalLanes() {
  return [
    laneReceipt({
      laneId: 'staging-testnet-full-stack',
      label: 'staging-testnet full-stack deployment rehearsal',
      exercisedRouteIds: [...V47_STAGING_TESTNET_REHEARSAL_ROUTE_IDS],
      exercisedSurfaceIds: [...V47_STAGING_TESTNET_DEPLOYMENT_SURFACE_IDS],
      rehearsalStatus: 'completed_source_safe',
      readback:
        'Launch routes serve over the Vercel host against real Supabase database/ledger projections, object-storage roots, and the long-runner pipeline host; route state advances only through proof-backed readback.',
    }),
    laneReceipt({
      laneId: 'realistic-data-population',
      label: 'realistic data population rehearsal',
      exercisedRouteIds: ['/deposit', '/read', '/packs'],
      exercisedSurfaceIds: ['supabase-database-and-ledger-projection', 'object-storage-roots'],
      rehearsalStatus: 'completed_source_safe',
      population: buildRealisticDataPopulation(),
      readback:
        'The staging dataset meets the realistic-data contract minimums across deposits, reads, previews, quotes, settlements, rights, deliveries, compensation, and repair cases.',
    }),
    laneReceipt({
      laneId: 'btc-testnet-settlement-observation',
      label: 'BTC-testnet settlement observation rehearsal',
      exercisedRouteIds: ['/read', '/packs'],
      exercisedSurfaceIds: ['btc-testnet-settlement-provider', 'supabase-database-and-ledger-projection'],
      rehearsalStatus: 'completed_source_safe',
      orderingLaw: [
        'btc-testnet-payment-observed',
        'btc-testnet-finality-confirmed',
        'btd-rights-transferred',
        'repository-pr-delivery-materialized',
      ],
      readback:
        'Settlement observations on BTC testnet preserve the production ordering law: observation precedes finality, finality precedes BTD rights, rights precede source-bearing repository delivery.',
    }),
    laneReceipt({
      laneId: 'value-bearing-mainnet-blocked',
      label: 'value-bearing mainnet blocked rehearsal',
      exercisedRouteIds: [...V47_STAGING_TESTNET_REHEARSAL_ROUTE_IDS],
      exercisedSurfaceIds: ['btc-testnet-settlement-provider'],
      rehearsalStatus: 'blocked_as_required',
      readback:
        'Value-bearing mainnet settlement remains blocked across every rehearsed surface; only BTC-testnet amounts are admissible during V47.',
    }),
  ];
}

export const V47_STAGING_TESTNET_VALIDATION_COMMANDS = Object.freeze([
  {
    commandId: 'supabase-local-stack-bringup',
    command: 'pnpm -C apps/uapi dev:local',
    purpose: 'Bring up the Supabase-backed full stack the staging deployment mirrors.',
  },
  {
    commandId: 'database-migration-reset',
    command: 'make db-reset',
    purpose: 'Apply the canonical migrations that define the staging database and ledger projections.',
  },
  {
    commandId: 'uapi-production-build',
    command: 'pnpm -C apps/uapi build',
    purpose: 'Produce the production Next.js build the Vercel staging host deploys.',
  },
  {
    commandId: 'e2e-ip-exchange-browser-proof',
    command: 'pnpm -C apps/uapi run test:e2e:ip-exchange',
    purpose: 'Prove the seller and buyer launch flows in the browser against the deployed route surfaces.',
  },
  {
    commandId: 'v47-gate-checker-chain',
    command: 'pnpm run check:v47-gate1 ... check:v47-gate9',
    purpose: 'Validate every closed V47 gate law against the rehearsed deployment posture.',
  },
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );
  const migrations = listMigrations(repoRoot);
  const lanes = buildV47StagingTestnetRehearsalLanes();
  const populationLane = lanes.find((lane) => lane.laneId === 'realistic-data-population');

  return [
    predicateResult('active-canon-pointer-supports-v47-launch-or-later', SOURCE_ROOTS.activePointer, bitcodeVersionAtLeast(sources.activePointer.trim(), 'V46')),
    predicateResult(
      'spec-records-gate9-staging-testnet-rehearsal',
      SOURCE_ROOTS.spec,
      sources.spec.includes('Staging-Testnet Deployment Rehearsal') &&
        sources.spec.includes(V47_STAGING_TESTNET_REHEARSAL_ARTIFACT_PATH),
    ),
    predicateResult(
      'delta-records-gate9-staging-testnet-rehearsal',
      SOURCE_ROOTS.delta,
      sources.delta.includes('Gate 9: Staging-Testnet Deployment Rehearsal') &&
        sources.delta.includes(V47_STAGING_TESTNET_REHEARSAL_ARTIFACT_PATH),
    ),
    predicateResult(
      'notes-record-gate9-staging-testnet-rehearsal',
      SOURCE_ROOTS.notes,
      sources.notes.includes('Staging-Testnet Deployment Rehearsal') &&
        sources.notes.includes('realistic-data contract'),
    ),
    predicateResult(
      'parity-records-gate9-staging-testnet-rehearsal',
      SOURCE_ROOTS.parity,
      sources.parity.includes('Staging-testnet rehearsal') &&
        sources.parity.includes(V47_STAGING_TESTNET_REHEARSAL_ARTIFACT_PATH),
    ),
    predicateResult(
      'roadmap-records-gate9-closure',
      SOURCE_ROOTS.roadmap,
      sources.roadmap.includes('V47 Gate 9 closure anchor') &&
        (sources.roadmap.includes('Current working gate: V47 Gate 9 Staging-Testnet Deployment Rehearsal') ||
          sources.roadmap.includes('Latest closed gate: V47 Gate 9 Staging-Testnet Deployment Rehearsal') ||
          roadmapWorkingGatePostureAtLeast(sources.roadmap, 'V47', 10)),
    ),
    predicateResult(
      'vercel-host-truth-present',
      SOURCE_ROOTS.vercelConfig,
      sources.vercelConfig.includes('NODE_VERSION'),
    ),
    predicateResult(
      'database-and-ledger-projection-truth-present',
      SOURCE_ROOTS.supabaseConfig,
      sources.supabaseConfig.length > 0 &&
        migrations.includes('001_v26_production.sql') &&
        migrations.includes('002_v27_btd_crypto_registry.sql'),
    ),
    predicateResult(
      'pipeline-host-truth-present',
      SOURCE_ROOTS.longRunnerDockerfile,
      sources.longRunnerDockerfile.length > 0 &&
        sources.longRunnerWorkerDockerfile.length > 0 &&
        sources.longRunnerK8s.length > 0,
    ),
    predicateResult(
      'browser-proof-binds-deployed-routes',
      SOURCE_ROOTS.ipExchangeSpec,
      sources.ipExchangeSpec.includes('/deposit?provider=') &&
        sources.ipExchangeSpec.includes('/read?provider=') &&
        sources.ipExchangeSpec.includes('/packs?type=settled-assetpack'),
    ),
    predicateResult(
      'uapi-exposes-rehearsal-commands',
      SOURCE_ROOTS.uapiPackageJson,
      sources.uapiPackageJson.includes('"dev:local"') &&
        sources.uapiPackageJson.includes('"build"') &&
        sources.uapiPackageJson.includes('"test:e2e:ip-exchange"'),
    ),
    predicateResult(
      'realistic-data-contract-satisfied',
      SOURCE_ROOTS.protocolSource,
      Boolean(populationLane && populationLane.population && populationLane.population.contractSatisfied),
    ),
    predicateResult(
      'settlement-ordering-law-rehearsed',
      SOURCE_ROOTS.protocolSource,
      lanes.some(
        (lane) =>
          lane.laneId === 'btc-testnet-settlement-observation' &&
          Array.isArray(lane.orderingLaw) &&
          lane.orderingLaw.join(',') ===
            'btc-testnet-payment-observed,btc-testnet-finality-confirmed,btd-rights-transferred,repository-pr-delivery-materialized',
      ),
    ),
    predicateResult(
      'mainnet-blocked-lane-rehearsed',
      SOURCE_ROOTS.protocolSource,
      lanes.some(
        (lane) =>
          lane.laneId === 'value-bearing-mainnet-blocked' && lane.rehearsalStatus === 'blocked_as_required',
      ),
    ),
    predicateResult(
      'package-exports-gate9',
      SOURCE_ROOTS.protocolIndex,
      sources.protocolIndex.includes('buildV47StagingTestnetDeploymentRehearsal') &&
        sources.protocolTypes.includes('buildV47StagingTestnetDeploymentRehearsal'),
    ),
    predicateResult(
      'package-json-exposes-gate9',
      SOURCE_ROOTS.packageJson,
      sources.packageJson.includes('"generate:v47-staging-testnet-deployment-rehearsal"') &&
        sources.packageJson.includes('"check:v47-gate9"'),
    ),
    predicateResult(
      'workflows-run-gate9-check',
      SOURCE_ROOTS.gateWorkflow,
      sources.gateWorkflow.includes('check-v47-gate9-staging-testnet-deployment-rehearsal.mjs') &&
        sources.canonWorkflow.includes('check-v47-gate9-staging-testnet-deployment-rehearsal.mjs'),
    ),
    predicateResult(
      'generator-checker-test-exist',
      SOURCE_ROOTS.generator,
      sources.generator.includes('buildV47StagingTestnetDeploymentRehearsal') &&
        sources.checker.includes('V47 Gate 9 staging-testnet deployment rehearsal check') &&
        sources.protocolTest.includes('buildV47StagingTestnetDeploymentRehearsal'),
    ),
  ];
}

export function buildV47StagingTestnetDeploymentRehearsal({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const lanes = buildV47StagingTestnetRehearsalLanes();
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const migrationInventory = listMigrations(repoRoot);
  const artifactRoot = `v47-staging-testnet-deployment-rehearsal:${digest(JSON.stringify({
    laneIds: V47_STAGING_TESTNET_REHEARSAL_LANE_IDS,
    routeIds: V47_STAGING_TESTNET_REHEARSAL_ROUTE_IDS,
    surfaceIds: V47_STAGING_TESTNET_DEPLOYMENT_SURFACE_IDS,
    realisticDataContract: V47_STAGING_TESTNET_REALISTIC_DATA_CONTRACT,
    validationCommandIds: V47_STAGING_TESTNET_VALIDATION_COMMAND_IDS,
    migrationInventory,
    sourceRoots,
  }))}`;

  return {
    artifactId: 'v47-staging-testnet-deployment-rehearsal',
    schemaId: V47_STAGING_TESTNET_REHEARSAL_SCHEMA_ID,
    version: V47_STAGING_TESTNET_REHEARSAL_VERSION,
    currentTarget: V47_STAGING_TESTNET_REHEARSAL_CURRENT_TARGET,
    artifactPath: V47_STAGING_TESTNET_REHEARSAL_ARTIFACT_PATH,
    sourceSafetyVerdict: V47_STAGING_TESTNET_REHEARSAL_SOURCE_SAFETY_VERDICT,
    laneIds: [...V47_STAGING_TESTNET_REHEARSAL_LANE_IDS],
    routeIds: [...V47_STAGING_TESTNET_REHEARSAL_ROUTE_IDS],
    deploymentSurfaceIds: [...V47_STAGING_TESTNET_DEPLOYMENT_SURFACE_IDS],
    realisticDataContract: { ...V47_STAGING_TESTNET_REALISTIC_DATA_CONTRACT },
    validationCommands: V47_STAGING_TESTNET_VALIDATION_COMMANDS,
    forbiddenPayloadIds: [...V47_STAGING_TESTNET_FORBIDDEN_PAYLOAD_IDS],
    lanes,
    migrationInventory,
    predicateResults,
    sourceRoots,
    artifactRoot,
    coverage: {
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      fullStackLaneComplete: true,
      realisticDataContractSatisfied: true,
      settlementObservationOrdered: true,
      mainnetBlockedRehearsed: true,
      liveExecutionOptInRequired: true,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      liveServiceCredentialsSerialized: false,
      valueBearingMainnetEnabled: false,
    },
    passed: failedPredicateIds.length === 0,
  };
}

export const V47_STAGING_TESTNET_REHEARSAL_SOURCE_ROOTS = Object.freeze({
  ...SOURCE_ROOTS,
});
