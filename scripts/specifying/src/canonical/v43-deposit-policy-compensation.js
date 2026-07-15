// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V43_DEPOSIT_POLICY_COMPENSATION_ARTIFACT_PATH = '.bitcode/v43-deposit-policy-compensation.json';
export const V43_DEPOSIT_POLICY_COMPENSATION_SCHEMA_ID = 'bitcode.v43.depositPolicyCompensation.v1';
export const V43_DEPOSIT_POLICY_COMPENSATION_VERSION = 'V43';
export const V43_DEPOSIT_POLICY_COMPENSATION_CURRENT_TARGET = 'V42';
export const V43_DEPOSIT_POLICY_COMPENSATION_SOURCE_SAFETY_VERDICT =
  'source-safe-deposit-policy-compensation-metadata';

export const V43_DEPOSIT_POLICY_OBJECT_IDS = Object.freeze([
  'DepositAssetPackOptionPolicy',
  'DepositAssetPackOptionPolicyReport',
  'DepositAssetPackOptionPolicyEvaluation',
  'source criticality posture',
  'likely demand posture',
  'ROI posture',
  'BTD potential estimate',
  'BTC source-to-shares compensation route',
  'future Gate 7 admission boundary',
]);

export const V43_DEPOSIT_POLICY_FIELD_IDS = Object.freeze([
  'sourceCriticality',
  'demand',
  'roi',
  'btdPotential',
  'compensation',
  'policyDecision',
  'admissionBoundary',
  'policy roots',
]);

export const V43_DEPOSIT_POLICY_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
  'protected_source_payload',
  'raw_source_text',
  'unpaid_assetpack_source',
  'raw_protected_prompt',
  'interpolated_prompt',
  'raw_provider_response',
  'wallet_private_material',
  'settlement_private_payload',
]);

const SOURCE_ROOTS = Object.freeze({
  activePointer: 'specifications/BITCODE_SPEC.txt',
  spec: 'specifications/BITCODE_SPEC_V43.md',
  delta: 'specifications/BITCODE_SPEC_V43_DELTA.md',
  notes: 'specifications/BITCODE_SPEC_V43_NOTES.md',
  parity: 'specifications/BITCODE_SPEC_V43_PARITY_MATRIX.md',
  roadmap: 'specifications/SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'scripts/specifying/README.md',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  optionModel: 'packages/asset-packs-pipelines/domain/src/deposit-asset-pack-options.ts',
  policyModel: 'packages/asset-packs-pipelines/domain/src/deposit-asset-pack-option-policy.ts',
  optionModelTest: 'packages/asset-packs-pipelines/domain/src/__tests__/deposit-asset-pack-options.test.ts',
  policyModelTest: 'packages/asset-packs-pipelines/domain/src/__tests__/deposit-asset-pack-option-policy.test.ts',
  routeModel: 'apps/uapi/components/deposits/models/deposit-route-model.ts',
  client: 'apps/uapi/components/deposits/DepositPageClient/DepositPageClient.tsx',
  routeModelTest: 'apps/uapi/tests/depositRouteModel.test.ts',
  pageTest: 'apps/uapi/tests/depositPageClient.test.tsx',
  packageIndex: 'packages/asset-packs-pipelines/domain/src/index.ts',
  packageManifest: 'packages/asset-packs-pipelines/domain/package.json',
  protocolIndex: 'scripts/specifying/src/index.js',
  protocolTypes: 'scripts/specifying/src/index.d.ts',
  protocolTest: 'scripts/specifying/test/v43-deposit-policy-compensation.test.js',
  generator: 'scripts/generate-v43-deposit-policy-compensation.mjs',
  checker: 'scripts/check-v43-gate6-deposit-policy-compensation.mjs',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function includesWithWhitespace(source, phrase) {
  const pattern = phrase
    .trim()
    .split(/\s+/u)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'))
    .join('\\s+');
  return new RegExp(pattern, 'u').test(source);
}

export const V43_DEPOSIT_POLICY_COMPENSATION_CONTRACT_ROWS = Object.freeze([
  {
    rowId: 'criticality-policy',
    owner: SOURCE_ROOTS.policyModel,
    contract:
      'DepositAssetPackOptionPolicy evaluates source criticality from source-safe criticality signals and blocks critical IP before Gate 7 admission.',
    requiredFields: ['sourceCriticality', 'blocked-critical-source', 'critical_source_policy_block'],
  },
  {
    rowId: 'demand-roi-policy',
    owner: SOURCE_ROOTS.policyModel,
    contract:
      'Policy evaluates likely demand and ROI deterministically from source-safe option measurements, demand confidence, estimated settlement, and development cost.',
    requiredFields: ['demand', 'roi', 'positive-expected-value', 'negative-expected-value'],
  },
  {
    rowId: 'btd-compensation-policy',
    owner: SOURCE_ROOTS.policyModel,
    contract:
      'Policy exposes BTD potential as estimate-only and previews future-reader BTC source-to-shares compensation without minting BTD or transferring rights.',
    requiredFields: ['btdPotential', 'compensation', 'source-to-shares-largest-remainder', 'BTC'],
  },
  {
    rowId: 'route-policy-readback',
    owner: SOURCE_ROOTS.client,
    contract:
      '/deposit renders policy readback for criticality, demand, ROI, BTD potential, and compensation while admission/indexing remain owned by Gate 7.',
    requiredFields: ['DepositAssetPackOptionPolicy', 'BTC source-to-shares preview', 'future-gate7-deposit-option-review'],
  },
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult('active-canon-pointer-supports-v43-draft-or-later', SOURCE_ROOTS.activePointer, bitcodeVersionAtLeast(sources.activePointer, 'V42')),
    predicateResult('spec-defines-gate6', SOURCE_ROOTS.spec, sources.spec.includes('V43 Gate 6 Source Criticality, Demand, ROI, And Compensation Policy')),
    predicateResult('spec-names-policy-objects', SOURCE_ROOTS.spec, sources.spec.includes('DepositAssetPackOptionPolicy') && sources.spec.includes('BTD potential')),
    predicateResult('delta-records-gate6', SOURCE_ROOTS.delta, sources.delta.includes('Gate 6') && sources.delta.includes('v43-deposit-policy-compensation')),
    predicateResult('notes-records-gate6', SOURCE_ROOTS.notes, sources.notes.includes('Gate 6') && sources.notes.includes('criticality, demand, ROI')),
    predicateResult('parity-records-gate6', SOURCE_ROOTS.parity, sources.parity.includes('Criticality/ROI policy') && sources.parity.includes('v43-deposit-policy-compensation')),
    predicateResult('roadmap-records-gate6', SOURCE_ROOTS.roadmap, sources.roadmap.includes('V43 Gate 6 closure anchor')),
    predicateResult('readme-records-gate6', SOURCE_ROOTS.readme, sources.readme.includes('V43 Gate 6')),
    predicateResult('protocol-readme-records-gate6', SOURCE_ROOTS.protocolReadme, sources.protocolReadme.includes('V43 Gate 6')),
    predicateResult('policy-model-defines-report', SOURCE_ROOTS.policyModel, sources.policyModel.includes('DepositAssetPackOptionPolicyReport') && sources.policyModel.includes('buildDepositAssetPackOptionPolicyReport')),
    predicateResult('policy-model-defines-criticality', SOURCE_ROOTS.policyModel, sources.policyModel.includes('blocked-critical-source') && sources.policyModel.includes('sourceCriticality')),
    predicateResult('policy-model-defines-demand-roi', SOURCE_ROOTS.policyModel, sources.policyModel.includes('weighted-depository-reading-and-existing-supply-signals') && sources.policyModel.includes('deterministic-estimated-gross-minus-development-cost')),
    predicateResult('policy-model-defines-btd-compensation', SOURCE_ROOTS.policyModel, sources.policyModel.includes('not-minted-until-future-need-fit-settlement') && sources.policyModel.includes('source-to-shares-largest-remainder')),
    predicateResult('policy-model-defers-gate7-admission', SOURCE_ROOTS.policyModel, sources.policyModel.includes('future-gate7-deposit-option-review') && sources.policyModel.includes('admissionAndIndexingOwnedBy')),
    predicateResult('policy-model-forbids-source-leakage', SOURCE_ROOTS.policyModel, sources.policyModel.includes('rawSourceTextVisible: false') && sources.policyModel.includes('settlementPrivatePayloadVisible: false') && sources.policyModel.includes('walletPrivateMaterialVisible: false')),
    predicateResult(
      'route-model-owns-policy',
      SOURCE_ROOTS.routeModel,
      sources.routeModel.includes('DepositAssetPackOptionPolicyReport') &&
        sources.routeModel.includes('sourceCriticalityDemandRoiPolicyPresent: true') &&
        sources.routeModel.includes('sourceCriticalityDemandRoiPolicySourceSafe: true'),
    ),
    predicateResult('deposit-client-renders-policy', SOURCE_ROOTS.client, sources.client.includes('DepositAssetPackOptionPolicy') && includesWithWhitespace(sources.client, 'BTC source-to-shares preview')),
    predicateResult('asset-pack-package-exports-policy', SOURCE_ROOTS.packageIndex, sources.packageIndex.includes("export * from './deposit-asset-pack-option-policy'")),
    predicateResult('asset-pack-manifest-exports-policy', SOURCE_ROOTS.packageManifest, sources.packageManifest.includes('"./deposit-asset-pack-option-policy"')),
    predicateResult('policy-test-covers-report', SOURCE_ROOTS.policyModelTest, sources.policyModelTest.includes('buildDepositAssetPackOptionPolicyReport') && sources.policyModelTest.includes('blocked-before-admission')),
    predicateResult('route-test-covers-policy', SOURCE_ROOTS.routeModelTest, sources.routeModelTest.includes('DepositAssetPackOptionPolicy') && sources.routeModelTest.includes('blockedCount')),
    predicateResult('page-test-covers-policy', SOURCE_ROOTS.pageTest, sources.pageTest.includes('DepositAssetPackOptionPolicy') && sources.pageTest.includes('BTC source-to-shares preview')),
    predicateResult('protocol-test-covers-artifact', SOURCE_ROOTS.protocolTest, sources.protocolTest.includes('buildV43DepositPolicyCompensation')),
    predicateResult('protocol-package-exports-gate6', SOURCE_ROOTS.protocolIndex, sources.protocolIndex.includes('buildV43DepositPolicyCompensation')),
    predicateResult('protocol-types-export-gate6', SOURCE_ROOTS.protocolTypes, sources.protocolTypes.includes('buildV43DepositPolicyCompensation')),
    predicateResult('package-json-exposes-gate6', SOURCE_ROOTS.packageJson, sources.packageJson.includes('"generate:v43-deposit-policy-compensation"') && sources.packageJson.includes('"check:v43-gate6"')),
    predicateResult('gate-workflow-runs-gate6', SOURCE_ROOTS.gateWorkflow, sources.gateWorkflow.includes('check-v43-gate6-deposit-policy-compensation.mjs')),
    predicateResult('canon-workflow-runs-gate6', SOURCE_ROOTS.canonWorkflow, sources.canonWorkflow.includes('check-v43-gate6-deposit-policy-compensation.mjs')),
    predicateResult('generator-exists', SOURCE_ROOTS.generator, sources.generator.includes('buildV43DepositPolicyCompensation')),
    predicateResult('checker-exists', SOURCE_ROOTS.checker, sources.checker.includes('V43 Gate 6 deposit policy compensation check')),
  ];
}

export function buildV43DepositPolicyCompensation({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v43-deposit-policy-compensation:${digest(JSON.stringify({
    objectIds: V43_DEPOSIT_POLICY_OBJECT_IDS,
    fieldIds: V43_DEPOSIT_POLICY_FIELD_IDS,
    forbiddenPayloadIds: V43_DEPOSIT_POLICY_FORBIDDEN_PAYLOAD_IDS,
    contractRows: V43_DEPOSIT_POLICY_COMPENSATION_CONTRACT_ROWS.map((row) => row.rowId),
    sourceRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v43-deposit-policy-compensation',
    schemaId: V43_DEPOSIT_POLICY_COMPENSATION_SCHEMA_ID,
    version: V43_DEPOSIT_POLICY_COMPENSATION_VERSION,
    currentTarget: V43_DEPOSIT_POLICY_COMPENSATION_CURRENT_TARGET,
    sourceSafetyVerdict: V43_DEPOSIT_POLICY_COMPENSATION_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    objectIds: [...V43_DEPOSIT_POLICY_OBJECT_IDS],
    fieldIds: [...V43_DEPOSIT_POLICY_FIELD_IDS],
    forbiddenPayloadIds: [...V43_DEPOSIT_POLICY_FORBIDDEN_PAYLOAD_IDS],
    contractRows: V43_DEPOSIT_POLICY_COMPENSATION_CONTRACT_ROWS.map((row) => ({
      ...row,
      rowRoot: `v43-deposit-policy-contract:${digest(row.rowId)}`,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
    })),
    sourceRoots,
    predicateResults,
    coverage: {
      depositPolicyImplemented: true,
      criticalityPolicyImplemented: true,
      criticalSourceBlockedBeforeAdmission: true,
      demandPolicyImplemented: true,
      roiPolicyImplemented: true,
      btdPotentialEstimateOnly: true,
      compensationPolicyImplemented: true,
      compensationPriceAsset: 'BTC',
      compensationAllocationMethod: 'source-to-shares-largest-remainder',
      btdMintRequiresFutureNeedFitSettlement: true,
      admissionAndIndexingDeferredToGate7: true,
      routePolicyReadbackImplemented: true,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
    },
  };
}

export const V43_DEPOSIT_POLICY_COMPENSATION_SOURCE_ROOTS = Object.freeze(
  Object.fromEntries(Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, sourcePath])),
);
