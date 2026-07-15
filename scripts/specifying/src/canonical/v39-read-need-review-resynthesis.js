// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V39_READ_NEED_REVIEW_RESYNTHESIS_ARTIFACT_PATH =
  '.bitcode/v39-read-need-review-resynthesis.json';
export const V39_READ_NEED_REVIEW_RESYNTHESIS_SCHEMA_ID =
  'bitcode.v39.readNeedReviewResynthesis.v1';
export const V39_READ_NEED_REVIEW_RESYNTHESIS_VERSION = 'V39';
export const V39_READ_NEED_REVIEW_RESYNTHESIS_CURRENT_TARGET = 'V38';
export const V39_READ_NEED_REVIEW_RESYNTHESIS_SOURCE_SAFETY_VERDICT =
  'source-safe-read-need-review-resynthesis-metadata';

export const V39_READ_NEED_REVIEW_RESYNTHESIS_ROW_IDS = Object.freeze([
  'request:read-request-persistence',
  'need:synthesized-need-storage',
  'feedback:resynthesis-lineage',
  'measurement:need-measurement-storage',
  'admission:accepted-need-gates-finding-fits',
  'rejection:rejected-need-posture',
  'telemetry:source-safe-runtime-receipts',
  'route:read-review-actions',
  'proof:tests-artifact-workflow',
]);

const SOURCE_ROOTS = Object.freeze({
  readNeed: 'packages/asset-packs-pipelines/domain/src/read-need.ts',
  readNeedReviewRuntime: 'packages/asset-packs-pipelines/domain/src/read-need-review-resynthesis.ts',
  readingPipelineContract: 'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
  packageIndex: 'packages/asset-packs-pipelines/domain/src/index.ts',
  packageJson: 'packages/asset-packs-pipelines/domain/package.json',
  readNeedTest: 'packages/asset-packs-pipelines/domain/src/__tests__/read-need.test.ts',
  runtimeTest: 'packages/asset-packs-pipelines/domain/src/__tests__/read-need-review-resynthesis.test.ts',
  readingContractTest: 'packages/asset-packs-pipelines/domain/src/__tests__/reading-pipeline-contract.test.ts',
  readReviewRoute: 'apps/uapi/app/api/read-review/route.ts',
  readReviewRouteTest: 'apps/uapi/tests/api/readReviewRoute.test.ts',
  readReviewProtocolParityTest: 'apps/uapi/tests/api/readReviewProtocolParity.test.ts',
  uapiJestConfig: 'apps/uapi/jest.config.cjs',
  uapiNextConfig: 'apps/uapi/next.config.mjs',
  uapiTsConfig: 'apps/uapi/tsconfig.json',
  v39Spec: '.specifications/BITCODE_SPEC_V39.md',
  v39Delta: '.specifications/BITCODE_SPEC_V39_DELTA.md',
  v39Notes: '.specifications/BITCODE_SPEC_V39_NOTES.md',
  v39Parity: '.specifications/BITCODE_SPEC_V39_PARITY_MATRIX.md',
  roadmap: '.specifications/SPECIFICATIONS_ROADMAP.md',
  rootReadme: 'README.md',
  assetPackReadme: 'packages/asset-packs-pipelines/domain/README.md',
  protocolReadme: 'scripts/specifying/README.md',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-provider-responses',
  'unpaid-assetpack-source',
  'wallet-private-material',
  'settlement-private-payloads',
  'secret-values',
]);

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v39-read-need-review-resynthesis-row:${digest(id)}`;
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.rowId),
    sourceSafetyClass: 'source_safe_read_need_review_resynthesis_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    credentialsSerialized: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V39_READ_NEED_REVIEW_RESYNTHESIS_ROWS = Object.freeze([
  row({
    rowId: 'request:read-request-persistence',
    purpose:
      'Persist the source-safe Read Request with prompt, repository, branch, commit, target artifact kinds, closure criteria, failure modes, and previous Need lineage.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.readNeedReviewRuntime, SOURCE_ROOTS.readReviewRoute],
    emittedTypes: ['ReadNeedRequest', 'ReadNeedReviewStorageRecord'],
    requiredEvidence: ['bitcode.read.request', 'read_request', 'requestId'],
  }),
  row({
    rowId: 'need:synthesized-need-storage',
    purpose:
      'Persist reviewable synthesized Need output before Finding Fits, including requirements, target artifacts, source constraints, proof expectations, and review state.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.readNeedReviewRuntime, SOURCE_ROOTS.runtimeTest],
    emittedTypes: ['ReadNeed', 'synthesized_need'],
    requiredEvidence: ['bitcode.read.need', 'needs_acceptance', 'synthesized_need'],
  }),
  row({
    rowId: 'feedback:resynthesis-lineage',
    purpose:
      'Persist feedback history and resynthesis attempts so each new Need remains linked to the previous Need and reviewed feedback.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.readNeedReviewRuntime, SOURCE_ROOTS.readReviewRouteTest],
    emittedTypes: ['resynthesis_attempt', 'feedbackHistory'],
    requiredEvidence: ['previousNeedId', 'resynthesize_read_need', 'resynthesis_attempt'],
  }),
  row({
    rowId: 'measurement:need-measurement-storage',
    purpose:
      'Persist Need measurement roots and pricing measurement inputs that later drive deterministic preview quotes without exposing source.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.readNeedReviewRuntime, SOURCE_ROOTS.readNeedTest],
    emittedTypes: ['ReadNeedMeasurementDimension', 'need_measurement'],
    requiredEvidence: ['measurementRoot', 'pricingMeasurementInputs', 'shareToFeeFormula'],
  }),
  row({
    rowId: 'admission:accepted-need-gates-finding-fits',
    purpose:
      'Persist accepted-Need admission as the only source-safe handoff into ReadFitsFindingSynthesis and block Finding Fits without acceptance.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.readNeedReviewRuntime, SOURCE_ROOTS.readReviewRouteTest],
    emittedTypes: ['ReadFitsFindingAdmission', 'accepted_need_admission'],
    requiredEvidence: ['accept_read_need', 'accepted_need_admission', 'accepted_read_need_missing'],
  }),
  row({
    rowId: 'rejection:rejected-need-posture',
    purpose:
      'Persist rejected-Need posture with rejection root, feedback, blocked Finding Fits stage, and repair/resynthesis next action.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.readNeedReviewRuntime, SOURCE_ROOTS.readReviewRouteTest],
    emittedTypes: ['RejectedReadNeed', 'rejected_need_posture'],
    requiredEvidence: ['rejectReadNeed', 'reject_read_need', 'read_need_rejected'],
  }),
  row({
    rowId: 'telemetry:source-safe-runtime-receipts',
    purpose:
      'Emit source-safe telemetry receipts containing phase, PTRR step, Failsafe, ThricifiedGeneration, prompt-template, output-schema, and proof-root identities.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.readNeedReviewRuntime, SOURCE_ROOTS.readingPipelineContract],
    emittedTypes: ['ReadNeedReviewTelemetryReceipt', 'ReadNeedComprehensionSynthesisInferenceReceipt'],
    requiredEvidence: ['ptrrStepIds', 'failsafeSequenceIds', 'thricifiedGenerationIds', 'promptTemplateIds'],
  }),
  row({
    rowId: 'route:read-review-actions',
    purpose:
      'Expose synthesize, resynthesize, accept, and reject actions through the Read review route with storage projection, runtime summary, and admission readback.',
    sourceRoots: [SOURCE_ROOTS.readReviewRoute, SOURCE_ROOTS.readReviewRouteTest, SOURCE_ROOTS.uapiJestConfig],
    emittedTypes: ['readNeedReviewRuntime', 'storageProjection', 'runtimeSummary'],
    requiredEvidence: ['synthesize_read_need', 'resynthesize_read_need', 'accept_read_need', 'reject_read_need'],
  }),
  row({
    rowId: 'proof:tests-artifact-workflow',
    purpose:
      'Bind Gate 4 closure to package tests, route tests, protocol artifact tests, docs, scripts, and gate/canon workflow checks.',
    sourceRoots: [SOURCE_ROOTS.runtimeTest, SOURCE_ROOTS.readReviewRouteTest, SOURCE_ROOTS.gateWorkflow, SOURCE_ROOTS.canonWorkflow],
    emittedTypes: ['V39ReadNeedReviewResynthesis'],
    requiredEvidence: ['check-v39-gate4-read-need-review-resynthesis.mjs', 'v39-read-need-review-resynthesis'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const readNeed = readSource(repoRoot, SOURCE_ROOTS.readNeed);
  const runtime = readSource(repoRoot, SOURCE_ROOTS.readNeedReviewRuntime);
  const contract = readSource(repoRoot, SOURCE_ROOTS.readingPipelineContract);
  const packageIndex = readSource(repoRoot, SOURCE_ROOTS.packageIndex);
  const packageJson = readSource(repoRoot, SOURCE_ROOTS.packageJson);
  const readNeedTest = readSource(repoRoot, SOURCE_ROOTS.readNeedTest);
  const runtimeTest = readSource(repoRoot, SOURCE_ROOTS.runtimeTest);
  const contractTest = readSource(repoRoot, SOURCE_ROOTS.readingContractTest);
  const route = readSource(repoRoot, SOURCE_ROOTS.readReviewRoute);
  const routeTest = readSource(repoRoot, SOURCE_ROOTS.readReviewRouteTest);
  const protocolParityTest = readSource(repoRoot, SOURCE_ROOTS.readReviewProtocolParityTest);
  const jestConfig = readSource(repoRoot, SOURCE_ROOTS.uapiJestConfig);
  const nextConfig = readSource(repoRoot, SOURCE_ROOTS.uapiNextConfig);
  const tsConfig = readSource(repoRoot, SOURCE_ROOTS.uapiTsConfig);
  const spec = readSource(repoRoot, SOURCE_ROOTS.v39Spec);
  const delta = readSource(repoRoot, SOURCE_ROOTS.v39Delta);
  const notes = readSource(repoRoot, SOURCE_ROOTS.v39Notes);
  const parity = readSource(repoRoot, SOURCE_ROOTS.v39Parity);
  const roadmap = readSource(repoRoot, SOURCE_ROOTS.roadmap);
  const rootReadme = readSource(repoRoot, SOURCE_ROOTS.rootReadme);
  const assetPackReadme = readSource(repoRoot, SOURCE_ROOTS.assetPackReadme);
  const protocolReadme = readSource(repoRoot, SOURCE_ROOTS.protocolReadme);
  const gateWorkflow = readSource(repoRoot, SOURCE_ROOTS.gateWorkflow);
  const canonWorkflow = readSource(repoRoot, SOURCE_ROOTS.canonWorkflow);

  return [
    predicateResult('read-need-defines-review-states', SOURCE_ROOTS.readNeed, readNeed.includes("'needs_acceptance'") && readNeed.includes("'accepted'") && readNeed.includes("'rejected'")),
    predicateResult('read-need-accept-and-reject-actions', SOURCE_ROOTS.readNeed, readNeed.includes('acceptReadNeed') && readNeed.includes('rejectReadNeed') && readNeed.includes('read_need_rejected')),
    predicateResult('runtime-defines-storage-records', SOURCE_ROOTS.readNeedReviewRuntime, runtime.includes('ReadNeedReviewStorageRecord') && runtime.includes('read_request') && runtime.includes('synthesized_need') && runtime.includes('need_measurement')),
    predicateResult('runtime-defines-resynthesis-admission-rejection', SOURCE_ROOTS.readNeedReviewRuntime, runtime.includes('resynthesis_attempt') && runtime.includes('accepted_need_admission') && runtime.includes('rejected_need_posture')),
    predicateResult('runtime-source-safety', SOURCE_ROOTS.readNeedReviewRuntime, runtime.includes('source_safe_read_need_review_resynthesis_metadata') && runtime.includes('protectedSourceVisible: false') && runtime.includes('rawProviderResponseVisible: false')),
    predicateResult('runtime-persists-to-execution-store', SOURCE_ROOTS.readNeedReviewRuntime, runtime.includes('persistReadNeedReviewResynthesisRuntime') && runtime.includes("execution?.store?.('read-need-review'")),
    predicateResult('contract-review-covers-rejection', SOURCE_ROOTS.readingPipelineContract, contract.includes('RejectedReadNeed') && contract.includes('read/need.rejectionRoot')),
    predicateResult('package-exports-runtime', SOURCE_ROOTS.packageIndex, packageIndex.includes("export * from './read-need-review-resynthesis'") && packageJson.includes('./read-need-review-resynthesis')),
    predicateResult('package-tests-cover-runtime', SOURCE_ROOTS.runtimeTest, runtimeTest.includes('ReadNeed review, resynthesis, and admission runtime') && runtimeTest.includes('rejected_need_posture')),
    predicateResult('read-need-tests-cover-inference-receipts', SOURCE_ROOTS.readNeedTest, readNeedTest.includes('inferenceReceipt') && readNeedTest.includes('accepted_read_need_missing')),
    predicateResult('contract-tests-cover-review-output', SOURCE_ROOTS.readingContractTest, contractTest.includes('ReadNeedComprehensionSynthesis') && contractTest.includes('ptrrStepCount: 16')),
    predicateResult('route-exposes-all-review-actions', SOURCE_ROOTS.readReviewRoute, route.includes('synthesize_read_need') && route.includes('resynthesize_read_need') && route.includes('accept_read_need') && route.includes('reject_read_need')),
    predicateResult('route-returns-runtime-projection', SOURCE_ROOTS.readReviewRoute, route.includes('readNeedReviewRuntime') && route.includes('storageProjection') && route.includes('runtimeSummary')),
    predicateResult('route-tests-cover-runtime-and-rejection', SOURCE_ROOTS.readReviewRouteTest, routeTest.includes('readNeedReviewRuntime') && routeTest.includes('reject_read_need') && routeTest.includes('rejected_need_posture')),
    predicateResult('protocol-parity-keeps-finding-fits-blocked', SOURCE_ROOTS.readReviewProtocolParityTest, protocolParityTest.includes('Finding Fits cannot proceed') && protocolParityTest.includes('fitSearchAdmission')),
    predicateResult('uapi-jest-maps-runtime', SOURCE_ROOTS.uapiJestConfig, jestConfig.includes('read-need-review-resynthesis')),
    predicateResult('uapi-runtime-imports-resolve-in-next-build', SOURCE_ROOTS.uapiNextConfig, nextConfig.includes("'@bitcode/asset-packs-pipelines-domain$'") && nextConfig.includes("'@bitcode/asset-packs-pipelines-domain/read-need-review-resynthesis'") && nextConfig.includes("'reading-pipeline-contract.ts'")),
    predicateResult('uapi-ts-maps-runtime', SOURCE_ROOTS.uapiTsConfig, tsConfig.includes('"@bitcode/asset-packs-pipelines-domain/read-need-review-resynthesis"') && tsConfig.includes('../packages/asset-packs-pipelines/domain/src/read-need-review-resynthesis.ts')),
    predicateResult('spec-gate4-expanded', SOURCE_ROOTS.v39Spec, spec.includes('Gate 4') && spec.includes('v39-read-need-review-resynthesis')),
    predicateResult('delta-gate4-expanded', SOURCE_ROOTS.v39Delta, delta.includes('Gate 4') && delta.includes('readNeedReviewRuntime')),
    predicateResult('notes-gate4-expanded', SOURCE_ROOTS.v39Notes, notes.includes('Gate 4 implementation notes') && notes.includes('rejected-Need posture')),
    predicateResult('parity-gate4-expanded', SOURCE_ROOTS.v39Parity, parity.includes('Gate 4 Parity') && parity.includes('implemented')),
    predicateResult('roadmap-advanced-to-gate4', SOURCE_ROOTS.roadmap, roadmap.includes('V39 Gate 4 closure anchor') && roadmap.includes('ReadNeedReviewResynthesisRuntime')),
    predicateResult('readmes-document-gate4', SOURCE_ROOTS.rootReadme, rootReadme.includes('V39 Gate 4') && assetPackReadme.includes('ReadNeed review') && protocolReadme.includes('V39ReadNeedReviewResynthesis')),
    predicateResult('workflows-run-gate4-check', SOURCE_ROOTS.gateWorkflow, gateWorkflow.includes('check-v39-gate4-read-need-review-resynthesis.mjs') && canonWorkflow.includes('check-v39-gate4-read-need-review-resynthesis.mjs')),
  ];
}

export function buildV39ReadNeedReviewResynthesis(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const rowRoots = V39_READ_NEED_REVIEW_RESYNTHESIS_ROWS.map((item) => item.rowRoot);
  const artifactRoot = `v39-read-need-review-resynthesis:${digest(JSON.stringify({
    rowRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v39-read-need-review-resynthesis',
    schemaId: V39_READ_NEED_REVIEW_RESYNTHESIS_SCHEMA_ID,
    version: V39_READ_NEED_REVIEW_RESYNTHESIS_VERSION,
    currentTarget: V39_READ_NEED_REVIEW_RESYNTHESIS_CURRENT_TARGET,
    sourceSafetyVerdict: V39_READ_NEED_REVIEW_RESYNTHESIS_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    rows: V39_READ_NEED_REVIEW_RESYNTHESIS_ROWS,
    rowIds: [...V39_READ_NEED_REVIEW_RESYNTHESIS_ROW_IDS],
    predicateResults,
    coverage: {
      rowCount: V39_READ_NEED_REVIEW_RESYNTHESIS_ROWS.length,
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      pipelineName: 'ReadNeedComprehensionSynthesis',
      nextPipelineName: 'ReadFitsFindingSynthesis',
      actions: ['synthesize_read_need', 'resynthesize_read_need', 'accept_read_need', 'reject_read_need'],
      persistedRecordKinds: [
        'read_request',
        'synthesized_need',
        'feedback',
        'resynthesis_attempt',
        'need_measurement',
        'accepted_need_admission',
        'rejected_need_posture',
        'telemetry_receipt',
      ],
      phaseCount: 4,
      ptrrStepCount: 16,
      thricifiedGenerationCount: 48,
      acceptedNeedRequiredForFindingFits: true,
      rejectedNeedBlocksFindingFits: true,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawProtectedPromptVisible: false,
      rawProviderResponseVisible: false,
      unpaidAssetPackSourceVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      credentialsSerialized: false,
      legacySourceRoots: Object.values(SOURCE_ROOTS).some((sourcePath) => sourcePath.includes('_legacy/')),
    },
    sourceRoots: SOURCE_ROOTS,
  };
}
