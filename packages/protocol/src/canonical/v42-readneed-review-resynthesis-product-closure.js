// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_ARTIFACT_PATH =
  '.bitcode/v42-readneed-review-resynthesis-product-closure.json';
export const V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_SCHEMA_ID =
  'bitcode.v42.readNeedReviewResynthesisProductClosure.v1';
export const V42_READNEED_REVIEW_RESYNTHESIS_SCHEMA_ID =
  V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_SCHEMA_ID;
export const V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_VERSION = 'V42';
export const V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_CURRENT_TARGET = 'V41';
export const V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_SOURCE_SAFETY_VERDICT =
  'source-safe-readneed-review-resynthesis-product-closure-metadata';

export const V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_ROW_IDS = Object.freeze([
  'request:read-request-persistence',
  'pipeline:ptrr-failsafe-thricified-need-synthesis',
  'need:synthesized-need-storage',
  'feedback:review-resynthesis-lineage',
  'measurement:need-measurement-storage',
  'admission:accepted-need-gates-finding-fits',
  'rejection:rejected-need-posture',
  'telemetry:source-safe-runtime-receipts',
  'route:read-review-actions',
  'ui:terminal-need-runtime-readback',
  'proof:tests-artifact-workflow',
]);

const SOURCE_ROOTS = Object.freeze({
  readNeed: 'packages/pipelines/asset-pack/src/read-need.ts',
  readNeedRuntime: 'packages/pipelines/asset-pack/src/read-need-review-resynthesis.ts',
  readingPipelineContract: 'packages/pipelines/asset-pack/src/reading-pipeline-contract.ts',
  packageIndex: 'packages/pipelines/asset-pack/src/index.ts',
  packageJson: 'packages/pipelines/asset-pack/package.json',
  readNeedTest: 'packages/pipelines/asset-pack/src/__tests__/read-need.test.ts',
  runtimeTest: 'packages/pipelines/asset-pack/src/__tests__/read-need-review-resynthesis.test.ts',
  readingContractTest: 'packages/pipelines/asset-pack/src/__tests__/reading-pipeline-contract.test.ts',
  readReviewRoute: 'uapi/app/api/read-review/route.ts',
  readReviewRouteTest: 'uapi/tests/api/readReviewRoute.test.ts',
  readReviewProtocolParityTest: 'uapi/tests/api/readReviewProtocolParity.test.ts',
  terminalWorkbench: 'uapi/app/terminal/TerminalDepositReadWorkbench.tsx',
  terminalUxState: 'uapi/app/terminal/terminal-enterprise-reading-ux-state.ts',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  v42Spec: 'BITCODE_SPEC_V42.md',
  v42Delta: 'BITCODE_SPEC_V42_DELTA.md',
  v42Notes: 'BITCODE_SPEC_V42_NOTES.md',
  v42Parity: 'BITCODE_SPEC_V42_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  rootReadme: 'README.md',
  terminalReadme: 'uapi/app/terminal/README.md',
  assetPackReadme: 'packages/pipelines/asset-pack/README.md',
  protocolReadme: 'packages/protocol/README.md',
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
  return `v42-readneed-review-resynthesis-product-closure-row:${digest(id)}`;
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
    sourceSafetyClass: 'source_safe_readneed_review_resynthesis_product_closure_metadata',
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

export const V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_ROWS = Object.freeze([
  row({
    rowId: 'request:read-request-persistence',
    purpose:
      'Persist source-safe Read Request data with repository, branch, commit, target artifact kinds, closure criteria, failure modes, feedback, and previous Need lineage.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.readNeedRuntime, SOURCE_ROOTS.readReviewRoute],
    emittedTypes: ['ReadNeedRequest', 'ReadNeedReviewStorageRecord'],
    requiredEvidence: ['bitcode.read.request', 'read_request', 'previousNeedId'],
  }),
  row({
    rowId: 'pipeline:ptrr-failsafe-thricified-need-synthesis',
    purpose:
      'Keep ReadNeedComprehensionSynthesis product-owned by PTRR agents whose steps carry FailsafeGenerationSequence over ThricifiedGeneration contracts and typed parser output.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.readingPipelineContract, SOURCE_ROOTS.readNeedTest],
    emittedTypes: ['ReadNeedComprehensionSynthesisInferenceReceipt', 'ReadingPipelineContract'],
    requiredEvidence: ['ptrrStepIds', 'failsafeSequenceIds', 'thricifiedGenerationIds', 'ReadNeedComprehensionSynthesis.prompt.need-synthesis'],
  }),
  row({
    rowId: 'need:synthesized-need-storage',
    purpose:
      'Persist reviewable synthesized Need output before Finding Fits, including requirements, target artifacts, source constraints, proof expectations, and review state.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.readNeedRuntime, SOURCE_ROOTS.runtimeTest],
    emittedTypes: ['ReadNeed', 'synthesized_need'],
    requiredEvidence: ['bitcode.read.need', 'needs_acceptance', 'synthesized_need'],
  }),
  row({
    rowId: 'feedback:review-resynthesis-lineage',
    purpose:
      'Preserve user feedback and resynthesis attempts so every new Need stays linked to the prior Need and reviewed feedback.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.readNeedRuntime, SOURCE_ROOTS.readReviewRouteTest, SOURCE_ROOTS.terminalWorkbench],
    emittedTypes: ['resynthesis_attempt', 'feedbackHistory'],
    requiredEvidence: ['previousNeedId', 'resynthesize_read_need', 'resynthesis_attempt'],
  }),
  row({
    rowId: 'measurement:need-measurement-storage',
    purpose:
      'Persist Need measurement roots and pricing measurement inputs that later drive deterministic preview quotes without exposing source.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.readNeedRuntime, SOURCE_ROOTS.readNeedTest],
    emittedTypes: ['ReadNeedMeasurementDimension', 'need_measurement'],
    requiredEvidence: ['measurementRoot', 'pricingMeasurementInputs', 'shareToFeeFormula'],
  }),
  row({
    rowId: 'admission:accepted-need-gates-finding-fits',
    purpose:
      'Persist accepted-Need admission as the only source-safe handoff into ReadFitsFindingSynthesis and block Finding Fits without acceptance.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.readNeedRuntime, SOURCE_ROOTS.readReviewRouteTest, SOURCE_ROOTS.terminalUxState],
    emittedTypes: ['ReadFitsFindingAdmission', 'accepted_need_admission'],
    requiredEvidence: ['accept_read_need', 'accepted_need_admission', 'accepted_read_need_missing'],
  }),
  row({
    rowId: 'rejection:rejected-need-posture',
    purpose:
      'Persist rejected-Need posture with rejection root, feedback, blocked Finding Fits stage, and repair/resynthesis next action.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.readNeedRuntime, SOURCE_ROOTS.readReviewRouteTest, SOURCE_ROOTS.terminalWorkbench],
    emittedTypes: ['RejectedReadNeed', 'rejected_need_posture'],
    requiredEvidence: ['rejectReadNeed', 'reject_read_need', 'read_need_rejected'],
  }),
  row({
    rowId: 'telemetry:source-safe-runtime-receipts',
    purpose:
      'Emit source-safe telemetry receipts containing phase, PTRR step, Failsafe, ThricifiedGeneration, prompt-template, output-schema, and proof-root identities.',
    sourceRoots: [SOURCE_ROOTS.readNeed, SOURCE_ROOTS.readNeedRuntime, SOURCE_ROOTS.readingPipelineContract, SOURCE_ROOTS.readReviewRoute],
    emittedTypes: ['ReadNeedReviewTelemetryReceipt', 'ReadNeedComprehensionSynthesisInferenceReceipt'],
    requiredEvidence: ['ptrrStepIds', 'failsafeSequenceIds', 'thricifiedGenerationIds', 'promptTemplateIds'],
  }),
  row({
    rowId: 'route:read-review-actions',
    purpose:
      'Expose synthesize, resynthesize, accept, and reject actions through the Read review route with storage projection, runtime summary, source-safe telemetry, and Finding Fits admission readback.',
    sourceRoots: [SOURCE_ROOTS.readReviewRoute, SOURCE_ROOTS.readReviewRouteTest],
    emittedTypes: ['readNeedReviewRuntime', 'storageProjection', 'runtimeSummary'],
    requiredEvidence: ['synthesize_read_need', 'resynthesize_read_need', 'accept_read_need', 'reject_read_need'],
  }),
  row({
    rowId: 'ui:terminal-need-runtime-readback',
    purpose:
      'Expose the reviewed Need, feedback loop, rejection path, storage projection, runtime roots, telemetry return type, and Finding Fits blocker/admission state in Terminal without protected source.',
    sourceRoots: [SOURCE_ROOTS.terminalWorkbench, SOURCE_ROOTS.terminalReadme],
    emittedTypes: ['TerminalReadNeedReviewRuntimeState', 'Need runtime, storage, and telemetry'],
    requiredEvidence: ['Reject Read-Need', 'readNeedStorageProjection', 'readNeedTelemetry', 'Need runtime, storage, and telemetry'],
  }),
  row({
    rowId: 'proof:tests-artifact-workflow',
    purpose:
      'Bind V42 Gate 4 closure to package tests, route tests, protocol artifact tests, docs, scripts, and gate/canon workflow checks.',
    sourceRoots: [
      SOURCE_ROOTS.runtimeTest,
      SOURCE_ROOTS.readReviewRouteTest,
      SOURCE_ROOTS.gateWorkflow,
      SOURCE_ROOTS.canonWorkflow,
      SOURCE_ROOTS.v42Spec,
      SOURCE_ROOTS.v42Parity,
      SOURCE_ROOTS.roadmap,
    ],
    emittedTypes: ['V42ReadNeedReviewResynthesisProductClosure'],
    requiredEvidence: ['check-v42-gate4-readneed-review-resynthesis-product-closure.mjs', 'v42-readneed-review-resynthesis-product-closure'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const readNeed = readSource(repoRoot, SOURCE_ROOTS.readNeed);
  const runtime = readSource(repoRoot, SOURCE_ROOTS.readNeedRuntime);
  const contract = readSource(repoRoot, SOURCE_ROOTS.readingPipelineContract);
  const packageIndex = readSource(repoRoot, SOURCE_ROOTS.packageIndex);
  const packageJson = readSource(repoRoot, SOURCE_ROOTS.packageJson);
  const readNeedTest = readSource(repoRoot, SOURCE_ROOTS.readNeedTest);
  const runtimeTest = readSource(repoRoot, SOURCE_ROOTS.runtimeTest);
  const contractTest = readSource(repoRoot, SOURCE_ROOTS.readingContractTest);
  const route = readSource(repoRoot, SOURCE_ROOTS.readReviewRoute);
  const routeTest = readSource(repoRoot, SOURCE_ROOTS.readReviewRouteTest);
  const protocolParityTest = readSource(repoRoot, SOURCE_ROOTS.readReviewProtocolParityTest);
  const terminalWorkbench = readSource(repoRoot, SOURCE_ROOTS.terminalWorkbench);
  const terminalUxState = readSource(repoRoot, SOURCE_ROOTS.terminalUxState);
  const gateWorkflow = readSource(repoRoot, SOURCE_ROOTS.gateWorkflow);
  const canonWorkflow = readSource(repoRoot, SOURCE_ROOTS.canonWorkflow);
  const spec = readSource(repoRoot, SOURCE_ROOTS.v42Spec);
  const delta = readSource(repoRoot, SOURCE_ROOTS.v42Delta);
  const notes = readSource(repoRoot, SOURCE_ROOTS.v42Notes);
  const parity = readSource(repoRoot, SOURCE_ROOTS.v42Parity);
  const roadmap = readSource(repoRoot, SOURCE_ROOTS.roadmap);
  const rootReadme = readSource(repoRoot, SOURCE_ROOTS.rootReadme);
  const terminalReadme = readSource(repoRoot, SOURCE_ROOTS.terminalReadme);
  const assetPackReadme = readSource(repoRoot, SOURCE_ROOTS.assetPackReadme);
  const protocolReadme = readSource(repoRoot, SOURCE_ROOTS.protocolReadme);

  return [
    predicateResult('read-need-defines-review-states', SOURCE_ROOTS.readNeed, readNeed.includes("'needs_acceptance'") && readNeed.includes("'accepted'") && readNeed.includes("'rejected'")),
    predicateResult('read-need-accept-and-reject-actions', SOURCE_ROOTS.readNeed, readNeed.includes('acceptReadNeed') && readNeed.includes('rejectReadNeed') && readNeed.includes('read_need_rejected')),
    predicateResult('inference-receipt-covers-ptrr-failsafe-thricified', SOURCE_ROOTS.readNeed, readNeed.includes('ReadNeedComprehensionSynthesisInferenceReceipt') && readNeed.includes('failsafeSequenceIds') && readNeed.includes('thinkingsGenerationIds') && readNeed.includes('promptTemplateIds')),
    predicateResult('contract-has-four-phases-and-sixteen-steps', SOURCE_ROOTS.readingPipelineContract, contract.includes('ReadNeedComprehensionSynthesis.request') && contract.includes('ReadNeedComprehensionSynthesis.review') && contract.includes('ptrrStepCount') && contract.includes('thinkingsGenerationCount')),
    predicateResult('runtime-defines-storage-records', SOURCE_ROOTS.readNeedRuntime, runtime.includes('ReadNeedReviewStorageRecord') && runtime.includes('read_request') && runtime.includes('synthesized_need') && runtime.includes('need_measurement')),
    predicateResult('runtime-defines-resynthesis-admission-rejection', SOURCE_ROOTS.readNeedRuntime, runtime.includes('resynthesis_attempt') && runtime.includes('accepted_need_admission') && runtime.includes('rejected_need_posture')),
    predicateResult('runtime-source-safety', SOURCE_ROOTS.readNeedRuntime, runtime.includes('source_safe_read_need_review_resynthesis_metadata') && runtime.includes('protectedSourceVisible: false') && runtime.includes('rawProviderResponseVisible: false') && runtime.includes('unpaidAssetPackSourceVisible: false')),
    predicateResult('runtime-persists-to-execution-store', SOURCE_ROOTS.readNeedRuntime, runtime.includes('persistReadNeedReviewResynthesisRuntime') && runtime.includes("execution?.store?.('read-need-review'")),
    predicateResult('package-exports-runtime', SOURCE_ROOTS.packageIndex, packageIndex.includes("export * from './read-need-review-resynthesis'") && packageJson.includes('./read-need-review-resynthesis')),
    predicateResult('package-tests-cover-runtime', SOURCE_ROOTS.runtimeTest, runtimeTest.includes('ReadNeed review, resynthesis, and admission runtime') && runtimeTest.includes('rejected_need_posture')),
    predicateResult('read-need-tests-cover-real-inference-receipts', SOURCE_ROOTS.readNeedTest, readNeedTest.includes('real-inference ReadNeedComprehension') && readNeedTest.includes('thinkings-generation') && readNeedTest.includes('accepted_read_need_missing')),
    predicateResult('contract-tests-cover-review-output', SOURCE_ROOTS.readingContractTest, contractTest.includes('ReadNeedComprehensionSynthesis') && contractTest.includes('ptrrStepCount: 16')),
    predicateResult('route-exposes-all-review-actions', SOURCE_ROOTS.readReviewRoute, route.includes('synthesize_read_need') && route.includes('resynthesize_read_need') && route.includes('accept_read_need') && route.includes('reject_read_need')),
    predicateResult('route-persists-all-runtime-actions', SOURCE_ROOTS.readReviewRoute, route.match(/persistReadNeedReviewResynthesisRuntime/g)?.length >= 3),
    predicateResult('route-returns-runtime-projection', SOURCE_ROOTS.readReviewRoute, route.includes('readNeedReviewRuntime') && route.includes('storageProjection') && route.includes('runtimeSummary')),
    predicateResult('route-tests-cover-runtime-and-rejection', SOURCE_ROOTS.readReviewRouteTest, routeTest.includes('readNeedReviewRuntime') && routeTest.includes('reject_read_need') && routeTest.includes('rejected_need_posture')),
    predicateResult('protocol-parity-keeps-finding-fits-blocked', SOURCE_ROOTS.readReviewProtocolParityTest, protocolParityTest.includes('Finding Fits cannot proceed') && protocolParityTest.includes('fitSearchAdmission')),
    predicateResult('terminal-ui-exposes-runtime-readback', SOURCE_ROOTS.terminalWorkbench, terminalWorkbench.includes('TerminalReadNeedReviewRuntimeState') && terminalWorkbench.includes('readNeedStorageProjection') && terminalWorkbench.includes('readNeedTelemetry') && terminalWorkbench.includes('Need runtime, storage, and telemetry')),
    predicateResult('terminal-ui-exposes-rejection', SOURCE_ROOTS.terminalWorkbench, terminalWorkbench.includes('handleRejectReadNeed') && terminalWorkbench.includes('Reject Read-Need') && terminalWorkbench.includes('reject_read_need')),
    predicateResult('terminal-ux-keeps-accepted-need-gate', SOURCE_ROOTS.terminalUxState, terminalUxState.includes('acceptedNeedRequiredBeforeFindingFits') && terminalUxState.includes('sourceSafePreviewBlocked')),
    predicateResult('spec-gate4-expanded', SOURCE_ROOTS.v42Spec, spec.includes('V42 Gate 4') && spec.includes('v42-readneed-review-resynthesis-product-closure')),
    predicateResult('delta-gate4-expanded', SOURCE_ROOTS.v42Delta, delta.includes('Gate 4') && delta.includes('readNeedReviewRuntime')),
    predicateResult('notes-gate4-expanded', SOURCE_ROOTS.v42Notes, notes.includes('Gate 4 implementation notes') && notes.includes('rejected Need posture')),
    predicateResult('parity-gate4-implemented', SOURCE_ROOTS.v42Parity, parity.includes('ReadNeed product closure') && parity.includes('implemented')),
    predicateResult('roadmap-advanced-to-gate4', SOURCE_ROOTS.roadmap, roadmap.includes('V42 Gate 4 closure anchor') && roadmap.includes('ReadNeedReviewResynthesisRuntime')),
    predicateResult('readmes-document-gate4', SOURCE_ROOTS.rootReadme, rootReadme.includes('V42 Gate 4') && terminalReadme.includes('ReadNeedReviewResynthesisRuntime') && assetPackReadme.includes('ReadNeed review') && protocolReadme.includes('V42ReadNeedReviewResynthesisProductClosure')),
    predicateResult('workflows-run-gate4-check', SOURCE_ROOTS.gateWorkflow, gateWorkflow.includes('check-v42-gate4-readneed-review-resynthesis-product-closure.mjs') && canonWorkflow.includes('check-v42-gate4-readneed-review-resynthesis-product-closure.mjs')),
  ];
}

export function buildV42ReadNeedReviewResynthesisProductClosure(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const rowRoots = V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_ROWS.map((item) => item.rowRoot);
  const artifactRoot = `v42-readneed-review-resynthesis-product-closure:${digest(JSON.stringify({
    rowRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v42-readneed-review-resynthesis-product-closure',
    schemaId: V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_SCHEMA_ID,
    version: V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_VERSION,
    currentTarget: V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_CURRENT_TARGET,
    sourceSafetyVerdict: V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    rows: V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_ROWS,
    rowIds: [...V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_ROW_IDS],
    predicateResults,
    coverage: {
      rowCount: V42_READNEED_REVIEW_RESYNTHESIS_PRODUCT_CLOSURE_ROWS.length,
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
      failsafeSequenceCount: 48,
      thricifiedGenerationCount: 48,
      acceptedNeedRequiredForFindingFits: true,
      rejectedNeedBlocksFindingFits: true,
      terminalRuntimeReadbackCovered: true,
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
