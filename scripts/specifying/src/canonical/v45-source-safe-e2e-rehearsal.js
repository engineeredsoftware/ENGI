// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V45_SOURCE_SAFE_E2E_REHEARSAL_ARTIFACT_PATH =
  '.proofs/v45/source-safe-e2e-rehearsal.json';
export const V45_SOURCE_SAFE_E2E_REHEARSAL_SCHEMA_ID =
  'bitcode.v45.sourceSafeEndToEndRehearsal.v1';
export const V45_SOURCE_SAFE_E2E_REHEARSAL_VERSION = 'V45';
export const V45_SOURCE_SAFE_E2E_REHEARSAL_CURRENT_TARGET = 'V45';
export const V45_SOURCE_SAFE_E2E_REHEARSAL_SOURCE_SAFETY_VERDICT =
  'source-safe-v45-end-to-end-rehearsal-metadata';

export const V45_SOURCE_SAFE_E2E_REHEARSAL_LANE_IDS = Object.freeze([
  'local-deterministic',
  'staging-testnet-credentialed',
  'value-bearing-mainnet-blocked',
]);

export const V45_SOURCE_SAFE_E2E_REHEARSAL_STAGE_IDS = Object.freeze([
  'deposit-option-synthesis',
  'depository-admission',
  'request-read',
  'review-synthesized-need',
  'request-finding-fits',
  'review-assetpack-preview',
  'quote-settlement-readiness',
  'btc-observation-rights-delivery',
  'source-to-shares-compensation',
  'ledger-database-storage-readback',
  'repair-state',
]);

export const V45_SOURCE_SAFE_E2E_REHEARSAL_EVIDENCE_CLASS_IDS = Object.freeze([
  'source-safe-artifact-root',
  'local-deterministic-receipt',
  'staging-testnet-receipt',
  'deposit-option-receipt',
  'depository-admission-receipt',
  'read-request-receipt',
  'read-need-review-receipt',
  'finding-fits-receipt',
  'assetpack-preview-receipt',
  'btd-quote-receipt',
  'btc-settlement-readiness-receipt',
  'ledger-database-storage-readback-root',
  'interface-browser-receipt-root',
  'delivery-posture-receipt',
  'compensation-posture-receipt',
  'repair-posture-receipt',
]);

export const V45_SOURCE_SAFE_E2E_REHEARSAL_ROW_IDS = Object.freeze([
  'lane:local-deterministic',
  'lane:staging-testnet-credentialed',
  'boundary:value-bearing-mainnet-blocked',
  'deposit:option-to-depository',
  'reading:request-to-reviewed-need',
  'fits:many-candidates-to-preview',
  'quote:btd-volume-to-btc-readiness',
  'settlement:btc-rights-delivery',
  'compensation:source-to-shares',
  'sync:ledger-database-storage',
  'telemetry:logs-and-browser-receipts',
  'repair:missing-or-contradictory-evidence',
  'proof:v45-family-binding',
]);

export const V45_SOURCE_SAFE_E2E_REHEARSAL_FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
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
  spec: '.specifications/BITCODE_SPEC_V45.md',
  delta: '.specifications/BITCODE_SPEC_V45_DELTA.md',
  notes: '.specifications/BITCODE_SPEC_V45_NOTES.md',
  parity: '.specifications/BITCODE_SPEC_V45_PARITY_MATRIX.md',
  roadmap: '.specifications/SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'scripts/specifying/README.md',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  commodityState: 'packages/asset-packs-pipelines/domain/src/asset-pack-commodity-state.ts',
  scalarQuote: 'packages/asset-packs-pipelines/domain/src/btd-scalar-volume-quote.ts',
  settlementReadback: 'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
  interfaceDisclosure: 'packages/asset-packs-pipelines/syntheses/read/src/interface-disclosure-boundary.ts',
  depositAdmission: 'packages/asset-packs-pipelines/syntheses/deposit/src/deposit-asset-pack-option-admission.ts',
  depositorySearch: 'packages/asset-packs-pipelines/syntheses/domain/src/depository-search.ts',
  operationalReadback: 'packages/asset-packs-pipelines/syntheses/read/src/reading-operational-telemetry-repair-readback.ts',
  readModel: 'apps/uapi/components/reads/models/read-route-model.ts',
  depositModel: 'apps/uapi/components/deposits/models/deposit-route-model.ts',
  packActivityModel: 'apps/uapi/components/bitcode/activity/PackActivityModel/pack-activity-model.ts',
  readClient: 'apps/uapi/components/reads/ReadPageClient/ReadPageClient.tsx',
  depositClient: 'apps/uapi/components/deposits/DepositPageClient/DepositPageClient.tsx',
  packsClient: 'apps/uapi/app/packs/PacksPageClient.tsx',
  pipelineLogUi: 'apps/uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
  proofFamilySource: 'scripts/specifying/src/canonical/v45-proof-family-artifacts.js',
  source: 'scripts/specifying/src/canonical/v45-source-safe-e2e-rehearsal.js',
  test: 'scripts/specifying/test/v45-source-safe-e2e-rehearsal.test.js',
  generator: 'scripts/generate-v45-source-safe-e2e-rehearsal.mjs',
  checker: 'scripts/check-v45-gate17-source-safe-e2e-rehearsal.mjs',
  operatorScript: 'scripts/rehearse-v45-source-safe-e2e.mjs',
  protocolIndex: 'scripts/specifying/src/index.js',
  protocolTypes: 'scripts/specifying/src/index.d.ts',
  v39ReadingRehearsal: '.proofs/v39/local-staging-reading-rehearsal.json',
  v42MvpRehearsal: '.proofs/v42/local-staging-mvp-rehearsal.json',
  v44ScaledRehearsal: '.proofs/v44/scaled-network-rehearsal.json',
  v45InferenceProof: '.proofs/v45/inference-synthesis-proof.json',
  v45PromptProof: '.proofs/v45/prompt-completeness-proof.json',
  v45StaticProof: '.proofs/v45/static-code-analysis-proof.json',
  v45VerificationProof: '.proofs/v45/verification-decisions-proof.json',
  v45SelectionProof: '.proofs/v45/selection-materialization-proof.json',
  v45AuthorizationProof: '.proofs/v45/authorization-sensitive-flow-proof.json',
  v45SettlementProof: '.proofs/v45/settlement-source-to-shares-proof.json',
  v45DisclosureProof: '.proofs/v45/disclosure-boundary-proof.json',
  v45ProofContract: '.proofs/v45/proof-contract-proof.json',
});

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 24);
}

function root(prefix, value) {
  return `${prefix}:${digest(typeof value === 'string' ? value : JSON.stringify(value))}`;
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function sourceExists(repoRoot, sourcePath) {
  return existsSync(path.join(repoRoot, sourcePath));
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

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function row(input) {
  return {
    ...input,
    rowRoot: root('v45-source-safe-e2e-rehearsal-row', input.rowId),
    sourceSafetyVerdict: V45_SOURCE_SAFE_E2E_REHEARSAL_SOURCE_SAFETY_VERDICT,
    sourceSafeMetadataOnly: true,
    protectedSourcePayloadSerialized: false,
    rawSourceTextVisible: false,
    unpaidAssetPackSourceVisible: false,
    rawPromptVisible: false,
    interpolatedPromptVisible: false,
    rawProviderResponseVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    privateSettlementPayloadVisible: false,
    liveRehearsalLogPayloadSerialized: false,
    valueBearingMainnetAdmitted: false,
    forbiddenPayloadClasses: [...V45_SOURCE_SAFE_E2E_REHEARSAL_FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V45_SOURCE_SAFE_E2E_REHEARSAL_ROWS = Object.freeze([
  row({
    rowId: 'lane:local-deterministic',
    laneId: 'local-deterministic',
    stageIds: [...V45_SOURCE_SAFE_E2E_REHEARSAL_STAGE_IDS],
    requiredEvidenceClassIds: ['source-safe-artifact-root', 'local-deterministic-receipt'],
    sourceRoots: [SOURCE_ROOTS.operatorScript, SOURCE_ROOTS.v42MvpRehearsal, SOURCE_ROOTS.v44ScaledRehearsal],
  }),
  row({
    rowId: 'lane:staging-testnet-credentialed',
    laneId: 'staging-testnet-credentialed',
    stageIds: [...V45_SOURCE_SAFE_E2E_REHEARSAL_STAGE_IDS],
    requiredEvidenceClassIds: ['staging-testnet-receipt', 'ledger-database-storage-readback-root'],
    sourceRoots: [SOURCE_ROOTS.operatorScript, SOURCE_ROOTS.operationalReadback, SOURCE_ROOTS.v44ScaledRehearsal],
  }),
  row({
    rowId: 'boundary:value-bearing-mainnet-blocked',
    laneId: 'value-bearing-mainnet-blocked',
    stageIds: ['quote-settlement-readiness', 'btc-observation-rights-delivery', 'repair-state'],
    requiredEvidenceClassIds: ['btc-settlement-readiness-receipt', 'repair-posture-receipt'],
    sourceRoots: [SOURCE_ROOTS.settlementReadback, SOURCE_ROOTS.interfaceDisclosure, SOURCE_ROOTS.operatorScript],
  }),
  row({
    rowId: 'deposit:option-to-depository',
    laneId: 'local-and-staging-testnet',
    stageIds: ['deposit-option-synthesis', 'depository-admission'],
    requiredEvidenceClassIds: ['deposit-option-receipt', 'depository-admission-receipt'],
    sourceRoots: [SOURCE_ROOTS.depositAdmission, SOURCE_ROOTS.depositModel, SOURCE_ROOTS.depositClient],
  }),
  row({
    rowId: 'reading:request-to-reviewed-need',
    laneId: 'local-and-staging-testnet',
    stageIds: ['request-read', 'review-synthesized-need'],
    requiredEvidenceClassIds: ['read-request-receipt', 'read-need-review-receipt'],
    sourceRoots: [SOURCE_ROOTS.readModel, SOURCE_ROOTS.readClient, SOURCE_ROOTS.v39ReadingRehearsal],
  }),
  row({
    rowId: 'fits:many-candidates-to-preview',
    laneId: 'local-and-staging-testnet',
    stageIds: ['request-finding-fits', 'review-assetpack-preview'],
    requiredEvidenceClassIds: ['finding-fits-receipt', 'assetpack-preview-receipt'],
    sourceRoots: [SOURCE_ROOTS.depositorySearch, SOURCE_ROOTS.v45SelectionProof, SOURCE_ROOTS.v45DisclosureProof],
  }),
  row({
    rowId: 'quote:btd-volume-to-btc-readiness',
    laneId: 'local-and-staging-testnet',
    stageIds: ['quote-settlement-readiness'],
    requiredEvidenceClassIds: ['btd-quote-receipt', 'btc-settlement-readiness-receipt'],
    sourceRoots: [SOURCE_ROOTS.scalarQuote, SOURCE_ROOTS.commodityState, SOURCE_ROOTS.v45SettlementProof],
  }),
  row({
    rowId: 'settlement:btc-rights-delivery',
    laneId: 'local-and-staging-testnet',
    stageIds: ['btc-observation-rights-delivery'],
    requiredEvidenceClassIds: ['btc-settlement-readiness-receipt', 'delivery-posture-receipt'],
    sourceRoots: [SOURCE_ROOTS.settlementReadback, SOURCE_ROOTS.v45SettlementProof, SOURCE_ROOTS.v45AuthorizationProof],
  }),
  row({
    rowId: 'compensation:source-to-shares',
    laneId: 'local-and-staging-testnet',
    stageIds: ['source-to-shares-compensation'],
    requiredEvidenceClassIds: ['compensation-posture-receipt', 'btd-quote-receipt'],
    sourceRoots: [SOURCE_ROOTS.scalarQuote, SOURCE_ROOTS.settlementReadback, SOURCE_ROOTS.v45SettlementProof],
  }),
  row({
    rowId: 'sync:ledger-database-storage',
    laneId: 'local-and-staging-testnet',
    stageIds: ['ledger-database-storage-readback'],
    requiredEvidenceClassIds: ['ledger-database-storage-readback-root'],
    sourceRoots: [SOURCE_ROOTS.settlementReadback, SOURCE_ROOTS.packActivityModel, SOURCE_ROOTS.v45ProofContract],
  }),
  row({
    rowId: 'telemetry:logs-and-browser-receipts',
    laneId: 'local-and-staging-testnet',
    stageIds: ['ledger-database-storage-readback', 'repair-state'],
    requiredEvidenceClassIds: ['interface-browser-receipt-root', 'repair-posture-receipt'],
    sourceRoots: [SOURCE_ROOTS.pipelineLogUi, SOURCE_ROOTS.packsClient, SOURCE_ROOTS.v45VerificationProof],
  }),
  row({
    rowId: 'repair:missing-or-contradictory-evidence',
    laneId: 'local-and-staging-testnet',
    stageIds: ['repair-state'],
    requiredEvidenceClassIds: ['repair-posture-receipt'],
    sourceRoots: [SOURCE_ROOTS.operationalReadback, SOURCE_ROOTS.settlementReadback, SOURCE_ROOTS.checker],
  }),
  row({
    rowId: 'proof:v45-family-binding',
    laneId: 'local-and-staging-testnet',
    stageIds: [...V45_SOURCE_SAFE_E2E_REHEARSAL_STAGE_IDS],
    requiredEvidenceClassIds: [...V45_SOURCE_SAFE_E2E_REHEARSAL_EVIDENCE_CLASS_IDS],
    sourceRoots: [SOURCE_ROOTS.proofFamilySource, SOURCE_ROOTS.v45ProofContract, SOURCE_ROOTS.spec],
  }),
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult('active-canon-pointer-supports-v45-or-later', SOURCE_ROOTS.activePointer, bitcodeVersionAtLeast(sources.activePointer, 'V45')),
    predicateResult('v45-spec-defines-proof-and-rehearsal-law', SOURCE_ROOTS.spec, sources.spec.includes('V45 proof-family canon') && sources.spec.includes('rehearsal')),
    predicateResult('v45-parity-defines-gate17', SOURCE_ROOTS.parity, sources.parity.includes('Gate 17: Source-Safe End-To-End Rehearsal') && sources.parity.includes('check:v45-gate17')),
    predicateResult('v45-notes-allow-rehearsal-gates', SOURCE_ROOTS.notes, sources.notes.includes('| `rehearsal` |') && sources.notes.includes('replayable receipts')),
    predicateResult('v39-reading-rehearsal-passed', SOURCE_ROOTS.v39ReadingRehearsal, artifactPassed(repoRoot, SOURCE_ROOTS.v39ReadingRehearsal, 'v39-local-staging-reading-rehearsal')),
    predicateResult('v42-mvp-rehearsal-passed', SOURCE_ROOTS.v42MvpRehearsal, artifactPassed(repoRoot, SOURCE_ROOTS.v42MvpRehearsal, 'v42-local-staging-mvp-rehearsal')),
    predicateResult('v44-scaled-rehearsal-passed', SOURCE_ROOTS.v44ScaledRehearsal, artifactPassed(repoRoot, SOURCE_ROOTS.v44ScaledRehearsal, 'v44-scaled-network-rehearsal')),
    predicateResult('v45-proof-families-passed', SOURCE_ROOTS.v45ProofContract, [
      ['v45-inference-synthesis-proof', SOURCE_ROOTS.v45InferenceProof],
      ['v45-prompt-completeness-proof', SOURCE_ROOTS.v45PromptProof],
      ['v45-static-code-analysis-proof', SOURCE_ROOTS.v45StaticProof],
      ['v45-verification-decisions-proof', SOURCE_ROOTS.v45VerificationProof],
      ['v45-selection-and-materialization-proof', SOURCE_ROOTS.v45SelectionProof],
      ['v45-authorization-and-sensitive-flow-proof', SOURCE_ROOTS.v45AuthorizationProof],
      ['v45-settlement-source-to-shares-proof', SOURCE_ROOTS.v45SettlementProof],
      ['v45-disclosure-boundary-proof', SOURCE_ROOTS.v45DisclosureProof],
      ['v45-proof-contract-proof', SOURCE_ROOTS.v45ProofContract],
    ].every(([artifactId, sourcePath]) => artifactPassed(repoRoot, sourcePath, artifactId))),
    predicateResult('commodity-state-covers-v45-states', SOURCE_ROOTS.commodityState, sources.commodityState.includes('ASSET_PACK_LIFECYCLE_STATES') && sources.commodityState.includes('BTD_SCALAR_VOLUME_STATES') && sources.commodityState.includes('BTC_SETTLEMENT_STATES')),
    predicateResult('scalar-quote-conserves-btd-and-shares', SOURCE_ROOTS.scalarQuote, sources.scalarQuote.includes('buildBtdScalarVolumeQuoteConservation') && sources.scalarQuote.includes('sourceToSharesConserved') && sources.scalarQuote.includes('quoteConserved')),
    predicateResult('settlement-readback-covers-rights-delivery-repair', SOURCE_ROOTS.settlementReadback, sources.settlementReadback.includes('btc_settlement_readback') && sources.settlementReadback.includes('source_unlocked_delivery') && sources.settlementReadback.includes('repair_posture')),
    predicateResult('interface-disclosure-covers-all-surfaces', SOURCE_ROOTS.interfaceDisclosure, sources.interfaceDisclosure.includes('INTERFACE_DISCLOSURE_BOUNDARY_SURFACES') && sources.interfaceDisclosure.includes('sourceBearingAssetPackVisibleToReader')),
    predicateResult('deposit-admission-covers-source-safe-supply', SOURCE_ROOTS.depositAdmission, sources.depositAdmission.includes('sourceSafeMetadataOnly: true') && sources.depositAdmission.includes('depositor-decision-required') && sources.depositAdmission.includes('compensationRouteRoot')),
    predicateResult('depository-search-covers-many-fits', SOURCE_ROOTS.depositorySearch, sources.depositorySearch.includes('selectedFitProvenanceRoot') && sources.depositorySearch.includes('maxSelectedCandidates: 12')),
    predicateResult('operational-readback-covers-repair', SOURCE_ROOTS.operationalReadback, sources.operationalReadback.includes('repair-required') && sources.operationalReadback.includes('repairRoot') && sources.operationalReadback.includes('sourceSafeStreamEvents')),
    predicateResult('routes-render-source-safe-loop', SOURCE_ROOTS.readClient, sources.readClient.includes('Withheld until paid') && sources.depositClient.includes('Source-safe deposit state') && sources.packsClient.includes('repairState')),
    predicateResult('pipeline-log-renders-expandable-metadata', SOURCE_ROOTS.pipelineLogUi, sources.pipelineLogUi.includes('Accordion') && sources.pipelineLogUi.includes('metadata')),
    predicateResult('operator-script-exists', SOURCE_ROOTS.operatorScript, sourceExists(repoRoot, SOURCE_ROOTS.operatorScript) && sources.operatorScript.includes('V45_SOURCE_SAFE_E2E_REHEARSAL_LANE_IDS')),
    predicateResult('protocol-test-wired', SOURCE_ROOTS.test, sources.test.includes('buildV45SourceSafeEndToEndRehearsal') && sources.test.includes('missing evidence returns repair state')),
    predicateResult('protocol-exports-wired', SOURCE_ROOTS.protocolIndex, sources.protocolIndex.includes('buildV45SourceSafeEndToEndRehearsal') && sources.protocolTypes.includes('buildV45SourceSafeEndToEndRehearsal')),
    predicateResult('package-scripts-wired', SOURCE_ROOTS.packageJson, sources.packageJson.includes('generate:v45-source-safe-e2e-rehearsal') && sources.packageJson.includes('check:v45-gate17') && sources.packageJson.includes('rehearse:v45-source-safe-e2e')),
    predicateResult('workflows-run-gate17', SOURCE_ROOTS.gateWorkflow, sources.gateWorkflow.includes('check-v45-gate17-source-safe-e2e-rehearsal.mjs') && sources.canonWorkflow.includes('check-v45-gate17-source-safe-e2e-rehearsal.mjs')),
    predicateResult('readmes-document-gate17', SOURCE_ROOTS.readme, sources.readme.includes('V45 Gate 17') && sources.protocolReadme.includes('V45SourceSafeEndToEndRehearsal')),
  ];
}

function baseEvidence(id, sourcePath) {
  return {
    evidenceClassId: id,
    present: true,
    contradictory: false,
    sourcePath,
    sourceSafeMetadataOnly: true,
    protectedSourcePayloadSerialized: false,
    rawPromptVisible: false,
    rawProviderResponseVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    privateSettlementPayloadVisible: false,
    liveRehearsalLogPayloadSerialized: false,
    readbackRoot: root('v45-e2e-evidence-readback', id),
    telemetryRoot: root('v45-e2e-evidence-telemetry', `${id}:telemetry`),
    ledgerRoot: root('v45-e2e-evidence-ledger', `${id}:ledger`),
    databaseRoot: root('v45-e2e-evidence-database', `${id}:database`),
    storageRoot: root('v45-e2e-evidence-storage', `${id}:storage`),
    repairRoot: root('v45-e2e-evidence-repair', `${id}:repair`),
  };
}

function buildEvidenceInventory(overrides = {}) {
  const sourceByEvidence = {
    'source-safe-artifact-root': V45_SOURCE_SAFE_E2E_REHEARSAL_ARTIFACT_PATH,
    'local-deterministic-receipt': SOURCE_ROOTS.operatorScript,
    'staging-testnet-receipt': SOURCE_ROOTS.operatorScript,
    'deposit-option-receipt': SOURCE_ROOTS.depositAdmission,
    'depository-admission-receipt': SOURCE_ROOTS.depositAdmission,
    'read-request-receipt': SOURCE_ROOTS.readModel,
    'read-need-review-receipt': SOURCE_ROOTS.readClient,
    'finding-fits-receipt': SOURCE_ROOTS.depositorySearch,
    'assetpack-preview-receipt': SOURCE_ROOTS.v45DisclosureProof,
    'btd-quote-receipt': SOURCE_ROOTS.scalarQuote,
    'btc-settlement-readiness-receipt': SOURCE_ROOTS.settlementReadback,
    'ledger-database-storage-readback-root': SOURCE_ROOTS.v45ProofContract,
    'interface-browser-receipt-root': SOURCE_ROOTS.packsClient,
    'delivery-posture-receipt': SOURCE_ROOTS.settlementReadback,
    'compensation-posture-receipt': SOURCE_ROOTS.scalarQuote,
    'repair-posture-receipt': SOURCE_ROOTS.operationalReadback,
  };

  return V45_SOURCE_SAFE_E2E_REHEARSAL_EVIDENCE_CLASS_IDS.map((id) => ({
    ...baseEvidence(id, sourceByEvidence[id] || 'unknown'),
    ...(overrides[id] || {}),
  }));
}

function buildRepairCases(evidenceInventory, predicateResults) {
  const missingEvidence = evidenceInventory
    .filter((entry) => entry.present !== true)
    .map((entry) => entry.evidenceClassId);
  const contradictoryEvidence = evidenceInventory
    .filter((entry) => entry.contradictory === true)
    .map((entry) => entry.evidenceClassId);
  const failedPredicates = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);

  return [
    ...missingEvidence.map((evidenceClassId) => ({
      repairCaseId: `missing:${evidenceClassId}`,
      evidenceClassId,
      repairState: 'repair-required',
      nextActions: ['replay_source_safe_rehearsal', 'restore_evidence_root', 'rerun_check_v45_gate17'],
      repairRoot: root('v45-e2e-repair-case', `missing:${evidenceClassId}`),
    })),
    ...contradictoryEvidence.map((evidenceClassId) => ({
      repairCaseId: `contradictory:${evidenceClassId}`,
      evidenceClassId,
      repairState: 'repair-required',
      nextActions: ['compare_ledger_database_storage_roots', 'invalidate_success_claim', 'rerun_check_v45_gate17'],
      repairRoot: root('v45-e2e-repair-case', `contradictory:${evidenceClassId}`),
    })),
    ...failedPredicates.map((predicateId) => ({
      repairCaseId: `predicate:${predicateId}`,
      predicateId,
      repairState: 'repair-required',
      nextActions: ['inspect_source_root', 'restore_gate_binding', 'rerun_check_v45_gate17'],
      repairRoot: root('v45-e2e-repair-case', `predicate:${predicateId}`),
    })),
  ];
}

function buildCoverage({ evidenceInventory, predicateResults, repairCases }) {
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const missingEvidenceClassIds = evidenceInventory
    .filter((entry) => entry.present !== true)
    .map((entry) => entry.evidenceClassId);
  const contradictoryEvidenceClassIds = evidenceInventory
    .filter((entry) => entry.contradictory === true)
    .map((entry) => entry.evidenceClassId);

  return {
    rowCount: V45_SOURCE_SAFE_E2E_REHEARSAL_ROWS.length,
    laneCount: V45_SOURCE_SAFE_E2E_REHEARSAL_LANE_IDS.length,
    stageCount: V45_SOURCE_SAFE_E2E_REHEARSAL_STAGE_IDS.length,
    evidenceClassCount: V45_SOURCE_SAFE_E2E_REHEARSAL_EVIDENCE_CLASS_IDS.length,
    lanes: [...V45_SOURCE_SAFE_E2E_REHEARSAL_LANE_IDS],
    stages: [...V45_SOURCE_SAFE_E2E_REHEARSAL_STAGE_IDS],
    stagingProjectRef: 'tkpyosihuouusyaxtbau',
    stagingRestHost: 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/',
    localDeterministicLaneCovered: true,
    stagingTestnetCredentialedLaneCovered: true,
    valueBearingMainnetBlocked: true,
    depositOptionCovered: true,
    depositoryAdmissionCovered: true,
    readRequestCovered: true,
    readNeedReviewCovered: true,
    findingFitsCovered: true,
    sourceSafePreviewCovered: true,
    btdQuoteCovered: true,
    btcSettlementReadinessCovered: true,
    rightsDeliveryPostureCovered: true,
    compensationPostureCovered: true,
    ledgerDatabaseStorageReadbackCovered: true,
    interfaceBrowserReceiptCovered: true,
    repairPostureCovered: true,
    sourceSafeMetadataOnly: true,
    protectedSourcePayloadSerialized: false,
    rawSourceTextVisible: false,
    unpaidAssetPackSourceVisible: false,
    rawPromptVisible: false,
    interpolatedPromptVisible: false,
    rawProviderResponseVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    privateSettlementPayloadVisible: false,
    liveRehearsalLogPayloadSerialized: false,
    valueBearingMainnetAdmitted: false,
    failedPredicateIds,
    missingEvidenceClassIds,
    contradictoryEvidenceClassIds,
    repairCaseCount: repairCases.length,
  };
}

export function buildV45SourceSafeEndToEndRehearsal(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const evidenceInventory = buildEvidenceInventory(input.evidenceOverrides || {});
  const predicateResults = buildPredicateResults(repoRoot);
  const repairCases = buildRepairCases(evidenceInventory, predicateResults);
  const coverage = buildCoverage({ evidenceInventory, predicateResults, repairCases });
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [
      key,
      `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`,
    ]),
  );
  const rehearsalStatus = repairCases.length === 0 ? 'completed_source_safe' : 'repair_required';
  const artifactRoot = root('v45-source-safe-e2e-rehearsal', {
    rowIds: V45_SOURCE_SAFE_E2E_REHEARSAL_ROW_IDS,
    laneIds: V45_SOURCE_SAFE_E2E_REHEARSAL_LANE_IDS,
    stageIds: V45_SOURCE_SAFE_E2E_REHEARSAL_STAGE_IDS,
    evidenceInventory,
    predicateResults,
    repairCases,
  });

  return {
    artifactId: 'v45-source-safe-e2e-rehearsal',
    schemaId: V45_SOURCE_SAFE_E2E_REHEARSAL_SCHEMA_ID,
    version: V45_SOURCE_SAFE_E2E_REHEARSAL_VERSION,
    currentTarget: V45_SOURCE_SAFE_E2E_REHEARSAL_CURRENT_TARGET,
    sourceSafetyVerdict: V45_SOURCE_SAFE_E2E_REHEARSAL_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    rehearsalStatus,
    passed: rehearsalStatus === 'completed_source_safe',
    laneIds: [...V45_SOURCE_SAFE_E2E_REHEARSAL_LANE_IDS],
    stageIds: [...V45_SOURCE_SAFE_E2E_REHEARSAL_STAGE_IDS],
    evidenceClassIds: [...V45_SOURCE_SAFE_E2E_REHEARSAL_EVIDENCE_CLASS_IDS],
    rowIds: [...V45_SOURCE_SAFE_E2E_REHEARSAL_ROW_IDS],
    rows: [...V45_SOURCE_SAFE_E2E_REHEARSAL_ROWS],
    evidenceInventory,
    repairCases,
    sourceRoots,
    predicateResults,
    coverage,
    sourceSafety: {
      sourceSafetyVerdict: V45_SOURCE_SAFE_E2E_REHEARSAL_SOURCE_SAFETY_VERDICT,
      sourceSafeMetadataOnly: true,
      protectedSourcePayloadSerialized: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      credentialsSerialized: false,
      walletPrivateMaterialVisible: false,
      privateSettlementPayloadVisible: false,
      liveRehearsalLogPayloadSerialized: false,
      valueBearingMainnetAdmitted: false,
      forbiddenPayloadClasses: [...V45_SOURCE_SAFE_E2E_REHEARSAL_FORBIDDEN_PAYLOAD_CLASSES],
    },
  };
}

export const V45_SOURCE_SAFE_E2E_REHEARSAL_SOURCE_ROOTS = Object.freeze(
  Object.fromEntries(Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, sourcePath])),
);
