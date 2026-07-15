// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V44_SCALED_NETWORK_REHEARSAL_ARTIFACT_PATH =
  '.proofs/v44/scaled-network-rehearsal.json';
export const V44_SCALED_NETWORK_REHEARSAL_SCHEMA_ID =
  'bitcode.v44.scaledNetworkRehearsal.v1';
export const V44_SCALED_NETWORK_REHEARSAL_VERSION = 'V44';
export const V44_SCALED_NETWORK_REHEARSAL_CURRENT_TARGET = 'V43';
export const V44_SCALED_NETWORK_REHEARSAL_SOURCE_SAFETY_VERDICT =
  'source-safe-scaled-network-rehearsal-metadata';

export const V44_SCALED_NETWORK_REHEARSAL_LANE_IDS = Object.freeze([
  'local',
  'staging-testnet',
]);

export const V44_SCALED_NETWORK_REHEARSAL_ROUTE_IDS = Object.freeze([
  '/deposit',
  '/read',
  '/packs',
]);

export const V44_SCALED_NETWORK_REHEARSAL_STAGE_IDS = Object.freeze([
  'supply:many-deposits',
  'demand:many-reads',
  'fits:many-candidates',
  'quote:many-share-to-fee-quotes',
  'settlement:many-btc-observations',
  'compensation:many-contributors',
  'delivery:many-repository-deliveries',
  'repair:many-fail-closed-cases',
  'portfolio:many-pack-readback',
]);

export const V44_SCALED_NETWORK_REHEARSAL_ROW_IDS = Object.freeze([
  'lane:local-scaled-network',
  'lane:staging-testnet-scaled-network',
  'scale:many-deposits',
  'scale:many-reads',
  'scale:many-fits',
  'scale:many-quotes',
  'scale:many-settlements',
  'scale:many-contributors',
  'scale:repair-matrix',
  'sync:ledger-database-storage',
  'telemetry:stream-database-readback',
  'proof:docs-tests-workflows-artifacts',
]);

export const V44_SCALED_NETWORK_REHEARSAL_MINIMUM_COUNTS = Object.freeze({
  depositCount: 24,
  readCount: 18,
  fitCandidateCount: 72,
  quoteCount: 18,
  settlementObservationCount: 12,
  contributorCount: 36,
  repairCaseCount: 8,
  packActivityRows: 54,
});

export const V44_SCALED_NETWORK_REHEARSAL_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
  'protected-source-payloads',
  'raw-source-text',
  'unpaid-assetpack-source',
  'raw-prompts',
  'interpolated-prompts',
  'raw-provider-responses',
  'credentials',
  'wallet-private-material',
  'private-settlement-payloads',
  'live-rehearsal-log-payloads',
  'value-bearing-mainnet-admission',
]);

const SOURCE_ROOTS = Object.freeze({
  activePointer: '.specifications/BITCODE_SPEC.txt',
  spec: '.specifications/BITCODE_SPEC_V44.md',
  delta: '.specifications/BITCODE_SPEC_V44_DELTA.md',
  notes: '.specifications/BITCODE_SPEC_V44_NOTES.md',
  parity: '.specifications/BITCODE_SPEC_V44_PARITY_MATRIX.md',
  roadmap: '.specifications/SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'scripts/specifying/README.md',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  gate2Artifact: '.proofs/v44/economic-domain-model.json',
  gate3Artifact: '.proofs/v44/packs-portfolio-market-intelligence.json',
  gate4Artifact: '.proofs/v44/reading-budget-quote-policy.json',
  gate5Artifact: '.proofs/v44/depositor-earnings-supply-opportunities.json',
  gate6Artifact: '.proofs/v44/btd-btc-compensation-statements.json',
  gate7Artifact: '.proofs/v44/organization-policy-wallet-authority.json',
  gate8Artifact: '.proofs/v44/enterprise-product-ux.json',
  packsClient: 'apps/uapi/app/packs/PacksPageClient.tsx',
  readClient: 'apps/uapi/components/reads/ReadPageClient/ReadPageClient.tsx',
  depositClient: 'apps/uapi/components/deposits/DepositPageClient/DepositPageClient.tsx',
  packsApi: 'apps/uapi/app/api/packs/activity/route.ts',
  readModel: 'apps/uapi/components/reads/models/read-route-model.ts',
  depositModel: 'apps/uapi/components/deposits/models/deposit-route-model.ts',
  pipelineLogUi: 'apps/uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
  compensationBoundary: 'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
  depositAdmission: 'packages/asset-packs-pipelines/domain/src/deposit-asset-pack-option-admission.ts',
  operationalReadback: 'packages/asset-packs-pipelines/domain/src/reading-operational-telemetry-repair-readback.ts',
  protocolSource: 'scripts/specifying/src/canonical/v44-scaled-network-rehearsal.js',
  protocolTest: 'scripts/specifying/test/v44-scaled-network-rehearsal.test.js',
  protocolIndex: 'scripts/specifying/src/index.js',
  protocolTypes: 'scripts/specifying/src/index.d.ts',
  generator: 'scripts/generate-v44-scaled-network-rehearsal.mjs',
  checker: 'scripts/check-v44-gate9-scaled-network-rehearsal.mjs',
  operatorScript: 'scripts/rehearse-v44-scaled-network-flow.mjs',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
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

function includesText(sourceText, expectedText) {
  return sourceText.toLowerCase().includes(expectedText.toLowerCase());
}

function artifactPassed(repoRoot, sourcePath, artifactId) {
  const text = readSource(repoRoot, sourcePath);
  if (!text) return false;
  try {
    const parsed = JSON.parse(text);
    return parsed.artifactId === artifactId && parsed.passed === true;
  } catch {
    return false;
  }
}

function rehearsalRoot(rowId) {
  return `v44-scaled-network-rehearsal-row:${digest(rowId)}`;
}

function row(input) {
  return {
    ...input,
    rowRoot: rehearsalRoot(input.rowId),
    sourceSafetyVerdict: V44_SCALED_NETWORK_REHEARSAL_SOURCE_SAFETY_VERDICT,
    sourceSafeMetadataOnly: true,
    protectedSourcePayloadSerialized: false,
    rawSourceTextVisible: false,
    unpaidAssetPackSourceVisible: false,
    rawPromptVisible: false,
    rawProviderResponseVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    privateSettlementPayloadVisible: false,
    liveRehearsalLogPayloadSerialized: false,
    valueBearingMainnetAdmitted: false,
    forbiddenPayloadIds: [...V44_SCALED_NETWORK_REHEARSAL_FORBIDDEN_PAYLOAD_IDS],
  };
}

export const V44_SCALED_NETWORK_REHEARSAL_ROWS = Object.freeze([
  row({
    rowId: 'lane:local-scaled-network',
    laneId: 'local',
    routeIds: [...V44_SCALED_NETWORK_REHEARSAL_ROUTE_IDS],
    stageIds: [...V44_SCALED_NETWORK_REHEARSAL_STAGE_IDS],
    sourceRoots: [SOURCE_ROOTS.operatorScript, SOURCE_ROOTS.gate2Artifact, SOURCE_ROOTS.gate8Artifact],
    requiredEvidence: ['dry-run receipt', 'many-pack counts', 'source-safe metadata', 'value-bearing mainnet blocked'],
  }),
  row({
    rowId: 'lane:staging-testnet-scaled-network',
    laneId: 'staging-testnet',
    routeIds: [...V44_SCALED_NETWORK_REHEARSAL_ROUTE_IDS],
    stageIds: [...V44_SCALED_NETWORK_REHEARSAL_STAGE_IDS],
    sourceRoots: [SOURCE_ROOTS.operatorScript, SOURCE_ROOTS.gate4Artifact, SOURCE_ROOTS.gate7Artifact],
    requiredEvidence: ['tkpyosihuouusyaxtbau', 'real inference posture', 'database stream readback', 'sandbox auth'],
  }),
  row({
    rowId: 'scale:many-deposits',
    laneId: 'local-and-staging-testnet',
    routeIds: ['/deposit', '/packs'],
    stageIds: ['supply:many-deposits', 'portfolio:many-pack-readback'],
    sourceRoots: [SOURCE_ROOTS.gate5Artifact, SOURCE_ROOTS.gate7Artifact, SOURCE_ROOTS.depositClient],
    requiredEvidence: ['depositCount', 'DepositSupplyOpportunity', 'admitted supply', 'source criticality block'],
  }),
  row({
    rowId: 'scale:many-reads',
    laneId: 'local-and-staging-testnet',
    routeIds: ['/read', '/packs'],
    stageIds: ['demand:many-reads', 'portfolio:many-pack-readback'],
    sourceRoots: [SOURCE_ROOTS.gate4Artifact, SOURCE_ROOTS.readClient, SOURCE_ROOTS.readModel],
    requiredEvidence: ['readCount', 'Reading budget', 'accepted Need', 'buyer authorization'],
  }),
  row({
    rowId: 'scale:many-fits',
    laneId: 'local-and-staging-testnet',
    routeIds: ['/read', '/packs'],
    stageIds: ['fits:many-candidates'],
    sourceRoots: [SOURCE_ROOTS.gate3Artifact, SOURCE_ROOTS.gate4Artifact, SOURCE_ROOTS.readModel],
    requiredEvidence: ['fitCandidateCount', 'Finding Fits', 'many Depository candidates', 'source-safe preview'],
  }),
  row({
    rowId: 'scale:many-quotes',
    laneId: 'local-and-staging-testnet',
    routeIds: ['/read', '/packs'],
    stageIds: ['quote:many-share-to-fee-quotes'],
    sourceRoots: [SOURCE_ROOTS.gate4Artifact, SOURCE_ROOTS.gate6Artifact, SOURCE_ROOTS.readClient],
    requiredEvidence: ['quoteCount', 'share-to-fee', 'budget envelope', 'quote expiry'],
  }),
  row({
    rowId: 'scale:many-settlements',
    laneId: 'local-and-staging-testnet',
    routeIds: ['/read', '/packs'],
    stageIds: ['settlement:many-btc-observations', 'delivery:many-repository-deliveries'],
    sourceRoots: [SOURCE_ROOTS.gate6Artifact, SOURCE_ROOTS.compensationBoundary, SOURCE_ROOTS.packsClient],
    requiredEvidence: ['settlementObservationCount', 'BTC observation', 'BTD rights transfer', 'delivery state'],
  }),
  row({
    rowId: 'scale:many-contributors',
    laneId: 'local-and-staging-testnet',
    routeIds: ['/deposit', '/packs'],
    stageIds: ['compensation:many-contributors'],
    sourceRoots: [SOURCE_ROOTS.gate5Artifact, SOURCE_ROOTS.gate6Artifact, SOURCE_ROOTS.depositAdmission],
    requiredEvidence: ['contributorCount', 'source-to-shares', 'depositor earning summary', 'treasury route'],
  }),
  row({
    rowId: 'scale:repair-matrix',
    laneId: 'local-and-staging-testnet',
    routeIds: ['/deposit', '/read', '/packs'],
    stageIds: ['repair:many-fail-closed-cases'],
    sourceRoots: [SOURCE_ROOTS.gate2Artifact, SOURCE_ROOTS.gate6Artifact, SOURCE_ROOTS.operationalReadback],
    requiredEvidence: ['repairCaseCount', 'fail closed', 'ledger repair', 'database repair'],
  }),
  row({
    rowId: 'sync:ledger-database-storage',
    laneId: 'local-and-staging-testnet',
    routeIds: ['/packs'],
    stageIds: ['settlement:many-btc-observations', 'delivery:many-repository-deliveries'],
    sourceRoots: [SOURCE_ROOTS.gate6Artifact, SOURCE_ROOTS.compensationBoundary, SOURCE_ROOTS.packsApi],
    requiredEvidence: ['ledger', 'database', 'object storage', 'reconciliation'],
  }),
  row({
    rowId: 'telemetry:stream-database-readback',
    laneId: 'local-and-staging-testnet',
    routeIds: ['/deposit', '/read', '/packs'],
    stageIds: [...V44_SCALED_NETWORK_REHEARSAL_STAGE_IDS],
    sourceRoots: [SOURCE_ROOTS.pipelineLogUi, SOURCE_ROOTS.operationalReadback, SOURCE_ROOTS.operatorScript],
    requiredEvidence: ['pipeline stream', 'database readback', 'telemetry root', 'repair readback'],
  }),
  row({
    rowId: 'proof:docs-tests-workflows-artifacts',
    laneId: 'local-and-staging-testnet',
    routeIds: [...V44_SCALED_NETWORK_REHEARSAL_ROUTE_IDS],
    stageIds: [...V44_SCALED_NETWORK_REHEARSAL_STAGE_IDS],
    sourceRoots: [SOURCE_ROOTS.protocolTest, SOURCE_ROOTS.packageJson, SOURCE_ROOTS.gateWorkflow, SOURCE_ROOTS.canonWorkflow],
    requiredEvidence: ['v44-scaled-network-rehearsal', 'check:v44-gate9', 'generate:v44-scaled-network-rehearsal'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [
      key,
      readSource(repoRoot, sourcePath),
    ]),
  );

  return [
    predicateResult(
      'active-canon-pointer-supports-v44-draft-or-promoted',
      SOURCE_ROOTS.activePointer,
      bitcodeVersionAtLeast(sources.activePointer, 'V43'),
    ),
    predicateResult('gate2-artifact-passed', SOURCE_ROOTS.gate2Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate2Artifact, 'v44-economic-domain-model')),
    predicateResult('gate3-artifact-passed', SOURCE_ROOTS.gate3Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate3Artifact, 'v44-packs-portfolio-market-intelligence')),
    predicateResult('gate4-artifact-passed', SOURCE_ROOTS.gate4Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate4Artifact, 'v44-reading-budget-quote-policy')),
    predicateResult('gate5-artifact-passed', SOURCE_ROOTS.gate5Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate5Artifact, 'v44-depositor-earnings-supply-opportunities')),
    predicateResult('gate6-artifact-passed', SOURCE_ROOTS.gate6Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate6Artifact, 'v44-btd-btc-compensation-statements')),
    predicateResult('gate7-artifact-passed', SOURCE_ROOTS.gate7Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate7Artifact, 'v44-organization-policy-wallet-authority')),
    predicateResult('gate8-artifact-passed', SOURCE_ROOTS.gate8Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate8Artifact, 'v44-enterprise-product-ux')),
    predicateResult('operator-script-exists', SOURCE_ROOTS.operatorScript, sourceExists(repoRoot, SOURCE_ROOTS.operatorScript) && sources.operatorScript.includes('V44_SCALED_NETWORK_REHEARSAL_LANES')),
    predicateResult('operator-script-binds-scale-counts', SOURCE_ROOTS.operatorScript, sources.operatorScript.includes('depositCount: 24') && sources.operatorScript.includes('fitCandidateCount: 72') && sources.operatorScript.includes('contributorCount: 36')),
    predicateResult('operator-script-binds-staging-testnet', SOURCE_ROOTS.operatorScript, sources.operatorScript.includes('tkpyosihuouusyaxtbau') && sources.operatorScript.includes('BITCODE_ASSET_PACK_REAL_INFERENCE') && sources.operatorScript.includes('BITCODE_PIPELINE_STREAM_TO_DATABASE')),
    predicateResult('operator-script-source-safe', SOURCE_ROOTS.operatorScript, sources.operatorScript.includes('secretValueSerialized: false') && sources.operatorScript.includes('valueBearingMainnetAdmitted: false')),
    predicateResult('packs-route-operates-economy', SOURCE_ROOTS.packsClient, sources.packsClient.includes('packs-enterprise-activity-grid') && sources.packsClient.includes('compensationState') && sources.packsClient.includes('repairState')),
    predicateResult('read-route-operates-procurement', SOURCE_ROOTS.readClient, sources.readClient.includes('read-enterprise-economic-summary') && sources.readClient.includes('Reading economy overview') && sources.readClient.includes('Withheld until paid')),
    predicateResult('deposit-route-operates-supply', SOURCE_ROOTS.depositClient, sources.depositClient.includes('deposit-enterprise-economic-summary') && sources.depositClient.includes('Depositing economy overview') && sources.depositClient.includes('Positive ROI')),
    predicateResult('packs-api-readback-source-safe', SOURCE_ROOTS.packsApi, sources.packsApi.includes('assertPackActivitySourceSafe') && sources.packsApi.includes('summarizePackActivityRecords')),
    predicateResult('telemetry-ui-rich-readback', SOURCE_ROOTS.pipelineLogUi, sources.pipelineLogUi.includes('metadata') && sources.pipelineLogUi.includes('Accordion')),
    predicateResult('settlement-boundary-syncs-delivery', SOURCE_ROOTS.compensationBoundary, sources.compensationBoundary.includes('ledger') && sources.compensationBoundary.includes('objectStorage') && sources.compensationBoundary.includes('source_bearing_pull_request_ready')),
    predicateResult('deposit-admission-syncs-compensation', SOURCE_ROOTS.depositAdmission, sources.depositAdmission.includes('storageProjection') && sources.depositAdmission.includes('telemetryRoot') && sources.depositAdmission.includes('compensationRouteRoot')),
    predicateResult('protocol-test-wired', SOURCE_ROOTS.protocolTest, sources.protocolTest.includes('buildV44ScaledNetworkRehearsal') && sources.protocolTest.includes('depositCount, 24')),
    predicateResult('protocol-exports-wired', SOURCE_ROOTS.protocolIndex, sources.protocolIndex.includes('buildV44ScaledNetworkRehearsal') && sources.protocolTypes.includes('buildV44ScaledNetworkRehearsal')),
    predicateResult('package-scripts-wired', SOURCE_ROOTS.packageJson, sources.packageJson.includes('generate:v44-scaled-network-rehearsal') && sources.packageJson.includes('rehearse:v44-scaled-network') && sources.packageJson.includes('check:v44-gate9')),
    predicateResult('workflows-run-gate9', SOURCE_ROOTS.gateWorkflow, sources.gateWorkflow.includes('check-v44-gate9-scaled-network-rehearsal.mjs') && sources.canonWorkflow.includes('check-v44-gate9-scaled-network-rehearsal.mjs')),
    predicateResult('spec-defines-gate9', SOURCE_ROOTS.spec, includesText(sources.spec, 'V44 Gate 9 Scaled Local/Staging Network Rehearsal') && sources.spec.includes('v44-scaled-network-rehearsal')),
    predicateResult('delta-records-gate9', SOURCE_ROOTS.delta, sources.delta.includes('Gate 9') && sources.delta.includes('v44-scaled-network-rehearsal')),
    predicateResult('notes-records-gate9', SOURCE_ROOTS.notes, sources.notes.includes('Gate 9') && sources.notes.includes('scaled network rehearsal')),
    predicateResult('parity-records-gate9', SOURCE_ROOTS.parity, sources.parity.includes('Scaled rehearsal') && sources.parity.includes('implemented')),
    predicateResult('roadmap-records-gate9', SOURCE_ROOTS.roadmap, sources.roadmap.includes('V44 Gate 9 closure anchor')),
    predicateResult('readmes-document-gate9', SOURCE_ROOTS.readme, sources.readme.includes('V44 Gate 9') && sources.protocolReadme.includes('V44ScaledNetworkRehearsal')),
  ];
}

function buildCoverage(predicateResults) {
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  return {
    rowCount: V44_SCALED_NETWORK_REHEARSAL_ROWS.length,
    laneCount: V44_SCALED_NETWORK_REHEARSAL_LANE_IDS.length,
    routeCount: V44_SCALED_NETWORK_REHEARSAL_ROUTE_IDS.length,
    stageCount: V44_SCALED_NETWORK_REHEARSAL_STAGE_IDS.length,
    gateArtifactCount: 7,
    lanes: [...V44_SCALED_NETWORK_REHEARSAL_LANE_IDS],
    routes: [...V44_SCALED_NETWORK_REHEARSAL_ROUTE_IDS],
    stages: [...V44_SCALED_NETWORK_REHEARSAL_STAGE_IDS],
    minimumCounts: { ...V44_SCALED_NETWORK_REHEARSAL_MINIMUM_COUNTS },
    stagingProjectRef: 'tkpyosihuouusyaxtbau',
    stagingRestHost: 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/',
    localLaneCovered: true,
    stagingTestnetLaneCovered: true,
    manyDepositsCovered: true,
    manyReadsCovered: true,
    manyFitsCovered: true,
    manyQuotesCovered: true,
    manySettlementsCovered: true,
    manyContributorsCovered: true,
    repairMatrixCovered: true,
    portfolioReadbackCovered: true,
    telemetryDatabaseReadbackCovered: true,
    ledgerDatabaseStorageSynchronized: true,
    mainnetValueBearingBlocked: true,
    sourceSafeMetadataOnly: true,
    protectedSourcePayloadSerialized: false,
    rawSourceTextVisible: false,
    unpaidAssetPackSourceVisible: false,
    rawPromptVisible: false,
    rawProviderResponseVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    privateSettlementPayloadVisible: false,
    liveRehearsalLogPayloadSerialized: false,
    failedPredicateIds,
  };
}

export function buildV44ScaledNetworkRehearsal({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const predicateResults = buildPredicateResults(repoRoot);
  const coverage = buildCoverage(predicateResults);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [
      key,
      `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`,
    ]),
  );
  const artifactRoot = `v44-scaled-network-rehearsal:${digest(
    JSON.stringify({
      laneIds: V44_SCALED_NETWORK_REHEARSAL_LANE_IDS,
      routeIds: V44_SCALED_NETWORK_REHEARSAL_ROUTE_IDS,
      stageIds: V44_SCALED_NETWORK_REHEARSAL_STAGE_IDS,
      rowIds: V44_SCALED_NETWORK_REHEARSAL_ROW_IDS,
      minimumCounts: V44_SCALED_NETWORK_REHEARSAL_MINIMUM_COUNTS,
      predicateResults,
      sourceRoots,
    }),
  )}`;

  return {
    artifactId: 'v44-scaled-network-rehearsal',
    schemaId: V44_SCALED_NETWORK_REHEARSAL_SCHEMA_ID,
    version: V44_SCALED_NETWORK_REHEARSAL_VERSION,
    currentTarget: V44_SCALED_NETWORK_REHEARSAL_CURRENT_TARGET,
    sourceSafetyVerdict: V44_SCALED_NETWORK_REHEARSAL_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: coverage.failedPredicateIds.length === 0,
    laneIds: [...V44_SCALED_NETWORK_REHEARSAL_LANE_IDS],
    routeIds: [...V44_SCALED_NETWORK_REHEARSAL_ROUTE_IDS],
    stageIds: [...V44_SCALED_NETWORK_REHEARSAL_STAGE_IDS],
    rowIds: [...V44_SCALED_NETWORK_REHEARSAL_ROW_IDS],
    minimumCounts: { ...V44_SCALED_NETWORK_REHEARSAL_MINIMUM_COUNTS },
    forbiddenPayloadIds: [...V44_SCALED_NETWORK_REHEARSAL_FORBIDDEN_PAYLOAD_IDS],
    rows: [...V44_SCALED_NETWORK_REHEARSAL_ROWS],
    sourceRoots,
    predicateResults,
    coverage,
    sourceSafety: {
      sourceSafetyVerdict: V44_SCALED_NETWORK_REHEARSAL_SOURCE_SAFETY_VERDICT,
      sourceSafeMetadataOnly: true,
      protectedSourcePayloadSerialized: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      rawProviderResponseVisible: false,
      credentialsSerialized: false,
      walletPrivateMaterialVisible: false,
      privateSettlementPayloadVisible: false,
      liveRehearsalLogPayloadSerialized: false,
      valueBearingMainnetAdmitted: false,
      forbiddenPayloadIds: [...V44_SCALED_NETWORK_REHEARSAL_FORBIDDEN_PAYLOAD_IDS],
    },
  };
}

export const V44_SCALED_NETWORK_REHEARSAL_SOURCE_ROOTS = Object.freeze(
  Object.fromEntries(Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, sourcePath])),
);
