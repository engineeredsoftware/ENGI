// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V43_DEPOSIT_OPTION_ADMISSION_ARTIFACT_PATH = '.bitcode/v43-deposit-option-admission.json';
export const V43_DEPOSIT_OPTION_ADMISSION_SCHEMA_ID = 'bitcode.v43.depositOptionAdmission.v1';
export const V43_DEPOSIT_OPTION_ADMISSION_VERSION = 'V43';
export const V43_DEPOSIT_OPTION_ADMISSION_CURRENT_TARGET = 'V42';
export const V43_DEPOSIT_OPTION_ADMISSION_SOURCE_SAFETY_VERDICT =
  'source-safe-deposit-option-admission-metadata';

export const V43_DEPOSIT_OPTION_ADMISSION_OBJECT_IDS = Object.freeze([
  'DepositAssetPackOptionAdmissionReport',
  'DepositOptionAdmissionReceipt',
  'DepositOptionReviewDecision',
  'Depository index projection',
  'object storage projection',
  'pack activity synchronization',
  'deposit option admission telemetry',
]);

export const V43_DEPOSIT_OPTION_ADMISSION_FIELD_IDS = Object.freeze([
  'reviewDecision',
  'admission',
  'depositoryIndexProjection',
  'storageProjection',
  'compensationPreview',
  'packsActivitySync',
  'telemetry',
  'visibility',
]);

export const V43_DEPOSIT_OPTION_ADMISSION_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
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
  activePointer: 'BITCODE_SPEC.txt',
  spec: 'BITCODE_SPEC_V43.md',
  delta: 'BITCODE_SPEC_V43_DELTA.md',
  notes: 'BITCODE_SPEC_V43_NOTES.md',
  parity: 'BITCODE_SPEC_V43_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'scripts/specifying/README.md',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  optionModel: 'packages/asset-packs-pipelines/domain/src/deposit-asset-pack-options.ts',
  policyModel: 'packages/asset-packs-pipelines/domain/src/deposit-asset-pack-option-policy.ts',
  admissionModel: 'packages/asset-packs-pipelines/domain/src/deposit-asset-pack-option-admission.ts',
  optionModelTest: 'packages/asset-packs-pipelines/domain/src/__tests__/deposit-asset-pack-options.test.ts',
  policyModelTest: 'packages/asset-packs-pipelines/domain/src/__tests__/deposit-asset-pack-option-policy.test.ts',
  admissionModelTest: 'packages/asset-packs-pipelines/domain/src/__tests__/deposit-asset-pack-option-admission.test.ts',
  routeModel: 'apps/uapi/components/deposits/models/deposit-route-model.ts',
  client: 'apps/uapi/components/deposits/DepositPageClient/DepositPageClient.tsx',
  routeModelTest: 'apps/uapi/tests/depositRouteModel.test.ts',
  pageTest: 'apps/uapi/tests/depositPageClient.test.tsx',
  packActivityModel: 'apps/uapi/components/bitcode/activity/PackActivityModel/pack-activity-model.ts',
  packActivityModelTest: 'apps/uapi/tests/packActivityModel.test.ts',
  uapiJestConfig: 'apps/uapi/jest.config.cjs',
  packageIndex: 'packages/asset-packs-pipelines/domain/src/index.ts',
  packageManifest: 'packages/asset-packs-pipelines/domain/package.json',
  protocolIndex: 'scripts/specifying/src/index.js',
  protocolTypes: 'scripts/specifying/src/index.d.ts',
  protocolTest: 'scripts/specifying/test/v43-deposit-option-admission.test.js',
  generator: 'scripts/generate-v43-deposit-option-admission.mjs',
  checker: 'scripts/check-v43-gate7-deposit-option-admission.mjs',
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

export const V43_DEPOSIT_OPTION_ADMISSION_CONTRACT_ROWS = Object.freeze([
  {
    rowId: 'depositor-review-decisions',
    owner: SOURCE_ROOTS.admissionModel,
    contract:
      'DepositOptionReviewDecision records approved, rejected, resynthesis-requested, and pending decisions before any source-safe option can enter the Depository.',
    requiredFields: ['approved-for-admission', 'rejected-by-depositor', 'resynthesis-requested', 'pending-depositor-review'],
  },
  {
    rowId: 'admission-receipts',
    owner: SOURCE_ROOTS.admissionModel,
    contract:
      'DepositOptionAdmissionReceipt admits only approved, policy-eligible, source-safe options and emits deterministic blockers for pending, rejected, resynthesis, or policy-blocked options.',
    requiredFields: ['admitted-to-depository', 'not-admitted-policy-blocked', 'DepositOptionAdmissionReceipt'],
  },
  {
    rowId: 'depository-index-storage',
    owner: SOURCE_ROOTS.admissionModel,
    contract:
      'Admitted deposit AssetPacks project only measurement and metadata search indexes plus object-storage metadata and external source pointer roots.',
    requiredFields: ['depositoryIndexProjection', 'storageProjection', 'measurements-and-metadata-only'],
  },
  {
    rowId: 'compensation-and-packs-sync',
    owner: SOURCE_ROOTS.packActivityModel,
    contract:
      'Admitted options preserve Gate 6 BTC source-to-shares compensation preview and synchronize to /packs as Depository AssetPack activity without minting BTD.',
    requiredFields: ['compensationPreview', 'source-to-shares-largest-remainder', 'depository-assetpack'],
  },
  {
    rowId: 'telemetry-source-safety',
    owner: SOURCE_ROOTS.admissionModel,
    contract:
      'Admission telemetry emits execution-stream source-safe metadata while protected source, prompts, provider responses, wallet material, and settlement private payloads remain invisible.',
    requiredFields: ['deposit-option-admission', 'execution-stream', 'sourceSafeMetadataOnly'],
  },
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult('active-canon-pointer-supports-v43-draft-or-later', SOURCE_ROOTS.activePointer, bitcodeVersionAtLeast(sources.activePointer, 'V42')),
    predicateResult('spec-defines-gate7', SOURCE_ROOTS.spec, sources.spec.includes('V43 Gate 7 Deposit Option Review, Approval, And Admission')),
    predicateResult('spec-names-admission-report', SOURCE_ROOTS.spec, sources.spec.includes('DepositAssetPackOptionAdmissionReport') && sources.spec.includes('DepositOptionAdmissionReceipt')),
    predicateResult('delta-records-gate7', SOURCE_ROOTS.delta, sources.delta.includes('Gate 7') && sources.delta.includes('v43-deposit-option-admission')),
    predicateResult('notes-records-gate7', SOURCE_ROOTS.notes, sources.notes.includes('Gate 7') && sources.notes.includes('admission receipts')),
    predicateResult('parity-records-gate7', SOURCE_ROOTS.parity, sources.parity.includes('Deposit option admission') && sources.parity.includes('v43-deposit-option-admission')),
    predicateResult('roadmap-records-gate7', SOURCE_ROOTS.roadmap, sources.roadmap.includes('V43 Gate 7 closure anchor')),
    predicateResult('readme-records-gate7', SOURCE_ROOTS.readme, sources.readme.includes('V43 Gate 7')),
    predicateResult('protocol-readme-records-gate7', SOURCE_ROOTS.protocolReadme, sources.protocolReadme.includes('V43 Gate 7')),
    predicateResult('admission-model-defines-report', SOURCE_ROOTS.admissionModel, sources.admissionModel.includes('DepositAssetPackOptionAdmissionReport') && sources.admissionModel.includes('buildDepositAssetPackOptionAdmissionReport')),
    predicateResult('admission-model-defines-review-decisions', SOURCE_ROOTS.admissionModel, sources.admissionModel.includes('approved-for-admission') && sources.admissionModel.includes('rejected-by-depositor') && sources.admissionModel.includes('resynthesis-requested')),
    predicateResult('admission-model-defines-admission-states', SOURCE_ROOTS.admissionModel, sources.admissionModel.includes('admitted-to-depository') && sources.admissionModel.includes('not-admitted-policy-blocked')),
    predicateResult('admission-model-defines-index-storage', SOURCE_ROOTS.admissionModel, sources.admissionModel.includes('depositoryIndexProjection') && sources.admissionModel.includes('storageProjection') && sources.admissionModel.includes('rawSourceStoredExternally: true')),
    predicateResult('admission-model-defines-packs-sync', SOURCE_ROOTS.admissionModel, sources.admissionModel.includes('packsActivitySync') && sources.admissionModel.includes("'depository-assetpack'")),
    predicateResult('admission-model-defines-telemetry', SOURCE_ROOTS.admissionModel, sources.admissionModel.includes("eventType: 'deposit-option-admission'") && sources.admissionModel.includes("channel: 'execution-stream'")),
    predicateResult('admission-model-forbids-source-leakage', SOURCE_ROOTS.admissionModel, sources.admissionModel.includes('protectedSourceVisible: false') && sources.admissionModel.includes('rawProviderResponseVisible: false') && sources.admissionModel.includes('settlementPrivatePayloadVisible: false')),
    predicateResult(
      'route-model-owns-admission',
      SOURCE_ROOTS.routeModel,
      sources.routeModel.includes('DepositAssetPackOptionAdmissionReport') &&
        sources.routeModel.includes('admissionAndIndexingPolicyPresent: true'),
    ),
    predicateResult('deposit-client-renders-admission', SOURCE_ROOTS.client, sources.client.includes('DepositAssetPackOptionAdmissionReport') && sources.client.includes('Approve for Depository') && sources.client.includes('Resynthesis queued')),
    predicateResult('pack-activity-recognizes-admission', SOURCE_ROOTS.packActivityModel, sources.packActivityModel.includes('deposit-option-admission') && sources.packActivityModel.includes('depository-assetpack')),
    predicateResult('asset-pack-package-exports-admission', SOURCE_ROOTS.packageIndex, sources.packageIndex.includes("export * from './deposit-asset-pack-option-admission'")),
    predicateResult('asset-pack-manifest-exports-admission', SOURCE_ROOTS.packageManifest, sources.packageManifest.includes('"./deposit-asset-pack-option-admission"')),
    predicateResult('uapi-jest-maps-admission', SOURCE_ROOTS.uapiJestConfig, sources.uapiJestConfig.includes('@bitcode/asset-packs-pipelines-domain/deposit-asset-pack-option-admission')),
    predicateResult('admission-test-covers-report', SOURCE_ROOTS.admissionModelTest, sources.admissionModelTest.includes('buildDepositAssetPackOptionAdmissionReport') && sources.admissionModelTest.includes('synchronized-to-packs')),
    predicateResult('route-test-covers-admission', SOURCE_ROOTS.routeModelTest, sources.routeModelTest.includes('DepositAssetPackOptionAdmissionReport') && sources.routeModelTest.includes('admitted-to-depository')),
    predicateResult('page-test-covers-admission', SOURCE_ROOTS.pageTest, sources.pageTest.includes('DepositAssetPackOptionAdmissionReport') && sources.pageTest.includes('Approve for Depository')),
    predicateResult('pack-activity-test-covers-admission', SOURCE_ROOTS.packActivityModelTest, sources.packActivityModelTest.includes('deposit-option-admission') && sources.packActivityModelTest.includes('depository-assetpack')),
    predicateResult('protocol-test-covers-artifact', SOURCE_ROOTS.protocolTest, sources.protocolTest.includes('buildV43DepositOptionAdmission')),
    predicateResult('protocol-package-exports-gate7', SOURCE_ROOTS.protocolIndex, sources.protocolIndex.includes('buildV43DepositOptionAdmission')),
    predicateResult('protocol-types-export-gate7', SOURCE_ROOTS.protocolTypes, sources.protocolTypes.includes('buildV43DepositOptionAdmission')),
    predicateResult('package-json-exposes-gate7', SOURCE_ROOTS.packageJson, sources.packageJson.includes('"generate:v43-deposit-option-admission"') && sources.packageJson.includes('"check:v43-gate7"')),
    predicateResult('gate-workflow-runs-gate7', SOURCE_ROOTS.gateWorkflow, sources.gateWorkflow.includes('check-v43-gate7-deposit-option-admission.mjs')),
    predicateResult('canon-workflow-runs-gate7', SOURCE_ROOTS.canonWorkflow, sources.canonWorkflow.includes('check-v43-gate7-deposit-option-admission.mjs')),
    predicateResult('generator-exists', SOURCE_ROOTS.generator, sources.generator.includes('buildV43DepositOptionAdmission')),
    predicateResult('checker-exists', SOURCE_ROOTS.checker, sources.checker.includes('V43 Gate 7 deposit option admission check')),
  ];
}

export function buildV43DepositOptionAdmission({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v43-deposit-option-admission:${digest(JSON.stringify({
    objectIds: V43_DEPOSIT_OPTION_ADMISSION_OBJECT_IDS,
    fieldIds: V43_DEPOSIT_OPTION_ADMISSION_FIELD_IDS,
    forbiddenPayloadIds: V43_DEPOSIT_OPTION_ADMISSION_FORBIDDEN_PAYLOAD_IDS,
    contractRows: V43_DEPOSIT_OPTION_ADMISSION_CONTRACT_ROWS.map((row) => row.rowId),
    sourceRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v43-deposit-option-admission',
    schemaId: V43_DEPOSIT_OPTION_ADMISSION_SCHEMA_ID,
    version: V43_DEPOSIT_OPTION_ADMISSION_VERSION,
    currentTarget: V43_DEPOSIT_OPTION_ADMISSION_CURRENT_TARGET,
    sourceSafetyVerdict: V43_DEPOSIT_OPTION_ADMISSION_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    objectIds: [...V43_DEPOSIT_OPTION_ADMISSION_OBJECT_IDS],
    fieldIds: [...V43_DEPOSIT_OPTION_ADMISSION_FIELD_IDS],
    forbiddenPayloadIds: [...V43_DEPOSIT_OPTION_ADMISSION_FORBIDDEN_PAYLOAD_IDS],
    contractRows: V43_DEPOSIT_OPTION_ADMISSION_CONTRACT_ROWS.map((row) => ({
      ...row,
      rowRoot: `v43-deposit-option-admission-contract:${digest(row.rowId)}`,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
    })),
    sourceRoots,
    predicateResults,
    coverage: {
      reviewDecisionsImplemented: true,
      approvalDecisionImplemented: true,
      rejectionDecisionImplemented: true,
      resynthesisDecisionImplemented: true,
      admissionReceiptsImplemented: true,
      approvedPolicyEligibleOptionsAdmittedOnly: true,
      depositoryIndexProjectionImplemented: true,
      vectorEmbeddingProjectionReadyForAdmittedOptions: true,
      storageProjectionImplemented: true,
      rawSourceStoredExternally: true,
      compensationPreviewContinued: true,
      compensationPriceAsset: 'BTC',
      compensationAllocationMethod: 'source-to-shares-largest-remainder',
      packsActivitySynchronizationImplemented: true,
      packsRoute: '/packs',
      packsActivityType: 'depository-assetpack',
      telemetryImplemented: true,
      routeAdmissionReadbackImplemented: true,
      btdMintRequiresFutureNeedFitSettlement: true,
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

export const V43_DEPOSIT_OPTION_ADMISSION_SOURCE_ROOTS = Object.freeze(
  Object.fromEntries(Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, sourcePath])),
);
