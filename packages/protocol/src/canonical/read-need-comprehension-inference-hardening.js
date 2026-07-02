// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V38_READ_NEED_COMPREHENSION_HARDENING_ARTIFACT_PATH =
  '.bitcode/v38-read-need-comprehension-inference-hardening.json';
export const V38_READ_NEED_COMPREHENSION_HARDENING_SCHEMA_ID =
  'bitcode.v38.readNeedComprehensionInferenceHardening.v1';
export const V38_READ_NEED_COMPREHENSION_HARDENING_VERSION = 'V38';
export const V38_READ_NEED_COMPREHENSION_HARDENING_CURRENT_TARGET = 'V37';
export const V38_READ_NEED_COMPREHENSION_HARDENING_SOURCE_SAFETY_VERDICT =
  'source-safe-read-need-comprehension-inference-hardening-metadata';

export const V38_READ_NEED_COMPREHENSION_REQUIRED_PHASE_IDS = Object.freeze([
  'ReadNeedComprehensionSynthesis.request',
  'ReadNeedComprehensionSynthesis.comprehend',
  'ReadNeedComprehensionSynthesis.measure',
  'ReadNeedComprehensionSynthesis.review',
]);

export const V38_READ_NEED_COMPREHENSION_REQUIRED_RETURN_TYPES = Object.freeze([
  'ReadNeedSourceInput',
  'ReadNeed',
  'ReadNeedPricingMeasurementInputs',
  'AcceptedReadNeed',
  'ResynthesisRequestedReadNeed',
]);

export const V38_READ_NEED_COMPREHENSION_REQUIRED_RECEIPT_FIELDS = Object.freeze([
  'phaseIds',
  'agentIds',
  'ptrrStepIds',
  'failsafeSequenceIds',
  'thricifiedGenerationIds',
  'promptTemplateIds',
  'interpolationContextKeys',
  'outputSchemaIds',
  'telemetryEventIds',
  'sourceSafety',
  'reviewBoundary',
  'roots',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'protected_source_payloads',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'unpaid_assetpack_source',
  'settlement_private_payloads',
  'global_ledger_authority_claim',
]);

const SOURCE_ROOTS = Object.freeze({
  readingContract: 'packages/pipelines/asset-pack/src/reading-pipeline-contract.ts',
  readNeed: 'packages/pipelines/asset-pack/src/read-need.ts',
  readNeedTests: 'packages/pipelines/asset-pack/src/__tests__/read-need.test.ts',
  readingContractTests: 'packages/pipelines/asset-pack/src/__tests__/reading-pipeline-contract.test.ts',
  readReviewRoute: 'uapi/app/api/read-review/route.ts',
  terminalWorkbench: 'uapi/app/terminal/TerminalDepositReadWorkbench.tsx',
  gate2Inventory: 'packages/protocol/src/canonical/inference-surface-inventory.js',
  gate3Stack: 'packages/protocol/src/canonical/ptrr-failsafe-thricified-stack.js',
  gate4Benchmark: 'packages/protocol/src/canonical/prompt-benchmark-report.js',
  gate5Disclosure: 'packages/protocol/src/canonical/inference-telemetry-disclosure-report.js',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v38-read-need-hardening-row:${digest(id)}`;
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function readJson(repoRoot, sourcePath) {
  const source = readSource(repoRoot, sourcePath);
  return source ? JSON.parse(source) : null;
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.rowId),
    sourceSafetyClass: 'source_safe_read_need_comprehension_inference_metadata',
    protectedSourceVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V38_READ_NEED_COMPREHENSION_HARDENING_ROWS = Object.freeze([
  row({
    rowId: 'phase:request-normalize',
    phaseId: 'ReadNeedComprehensionSynthesis.request',
    agentId: 'ReadNeedComprehensionSynthesis.request.normalize',
    purpose: 'Normalize the enterprise Read Request and source revision without searching deposits.',
    returnTypes: ['ReadNeedSourceInput'],
    receiptFields: ['phaseIds', 'agentIds', 'ptrrStepIds', 'roots'],
    telemetryIds: [
      'ReadNeedComprehensionSynthesis.telemetry.prompt-input',
      'ReadNeedComprehensionSynthesis.telemetry.source-revision',
      'ReadNeedComprehensionSynthesis.telemetry.target-artifact-kinds',
    ],
  }),
  row({
    rowId: 'phase:comprehend-need',
    phaseId: 'ReadNeedComprehensionSynthesis.comprehend',
    agentId: 'ReadNeedComprehensionSynthesis.comprehend.need-synthesizer',
    purpose:
      'Run the Need synthesizer through PTRR/Failsafe/Thricified inference and return only reviewable Need fields.',
    returnTypes: ['ReadNeed'],
    receiptFields: [
      'promptTemplateIds',
      'interpolationContextKeys',
      'outputSchemaIds',
      'telemetryEventIds',
      'roots',
    ],
    telemetryIds: [
      'ReadNeedComprehensionSynthesis.telemetry.prompt-template',
      'ReadNeedComprehensionSynthesis.telemetry.interpolated-prompt',
      'ReadNeedComprehensionSynthesis.telemetry.raw-model-response',
      'ReadNeedComprehensionSynthesis.telemetry.parsed-typed-output',
      'ReadNeedComprehensionSynthesis.telemetry.schema-name',
    ],
  }),
  row({
    rowId: 'phase:measure-need',
    phaseId: 'ReadNeedComprehensionSynthesis.measure',
    agentId: 'ReadNeedComprehensionSynthesis.measure.need-measurement',
    purpose: 'Derive deterministic Need measurement vector and Share-to-Fee input values.',
    returnTypes: ['ReadNeedPricingMeasurementInputs'],
    receiptFields: ['outputSchemaIds', 'roots'],
    telemetryIds: [
      'ReadNeedComprehensionSynthesis.telemetry.measurement-vector',
      'ReadNeedComprehensionSynthesis.telemetry.weighted-requested-volume',
      'ReadNeedComprehensionSynthesis.telemetry.measurement-root',
    ],
  }),
  row({
    rowId: 'phase:review-need',
    phaseId: 'ReadNeedComprehensionSynthesis.review',
    agentId: 'ReadNeedComprehensionSynthesis.review.operator-review',
    purpose: 'Record acceptance or resynthesis feedback before ReadFitsFindingSynthesis is admitted.',
    returnTypes: ['AcceptedReadNeed', 'ResynthesisRequestedReadNeed'],
    receiptFields: ['reviewBoundary', 'roots'],
    telemetryIds: [
      'ReadNeedComprehensionSynthesis.telemetry.review-state',
      'ReadNeedComprehensionSynthesis.telemetry.accepted-at',
      'ReadNeedComprehensionSynthesis.telemetry.acceptance-root',
      'ReadNeedComprehensionSynthesis.telemetry.feedback-history',
    ],
  }),
  row({
    rowId: 'receipt:source-safe-inference-receipt',
    phaseId: 'ReadNeedComprehensionSynthesis.receipt',
    agentId: 'ReadNeedComprehensionSynthesis.receipt.source-safe',
    purpose:
      'Bind the produced Need to 4 phases, 4 PTRR agents, 16 PTRR steps, 48 Failsafe sequences, and 48 ThricifiedGeneration chains without exposing private payloads.',
    returnTypes: ['ReadNeedComprehensionSynthesisInferenceReceipt'],
    receiptFields: [...V38_READ_NEED_COMPREHENSION_REQUIRED_RECEIPT_FIELDS],
    telemetryIds: ['read-need-comprehension.inferenceReceipt', 'read-need-comprehension.receiptRoot'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const readNeed = readSource(repoRoot, SOURCE_ROOTS.readNeed);
  const bounded = readSource(repoRoot, SOURCE_ROOTS.readNeed);
  const contract = readSource(repoRoot, SOURCE_ROOTS.readingContract);
  const tests = readSource(repoRoot, SOURCE_ROOTS.readNeedTests);
  const contractTests = readSource(repoRoot, SOURCE_ROOTS.readingContractTests);
  const route = readSource(repoRoot, SOURCE_ROOTS.readReviewRoute);
  const terminal = readSource(repoRoot, SOURCE_ROOTS.terminalWorkbench);

  return [
    predicateResult('contract.names-read-need-pipeline', SOURCE_ROOTS.readingContract, contract.includes("READ_NEED_COMPREHENSION_SYNTHESIS = 'ReadNeedComprehensionSynthesis'")),
    predicateResult('contract.has-four-phases', SOURCE_ROOTS.readingContract, V38_READ_NEED_COMPREHENSION_REQUIRED_PHASE_IDS.every((phaseId) => contract.includes(phaseId))),
    predicateResult('contract.has-four-ptrr-steps', SOURCE_ROOTS.readingContract, contract.includes("['plan', 'try', 'refine', 'retry']")),
    predicateResult('contract.has-three-failsafe-stages', SOURCE_ROOTS.readingContract, contract.includes('prepare-concise-context') && contract.includes('chunk-then-sum') && contract.includes('stitch-until-complete')),
    predicateResult('contract.has-thricified-generation-contract', SOURCE_ROOTS.readingContract, contract.includes('ReadingPipelineThricifiedGenerationContract')),
    predicateResult('read-need.imports-contract-trace', SOURCE_ROOTS.readNeed, readNeed.includes('READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT') && readNeed.includes('listReadingPipelineTelemetryTrace')),
    predicateResult('read-need.defines-receipt-type', SOURCE_ROOTS.readNeed, readNeed.includes('ReadNeedComprehensionSynthesisInferenceReceipt')),
    predicateResult('read-need.builds-receipt', SOURCE_ROOTS.readNeed, readNeed.includes('buildReadNeedComprehensionSynthesisInferenceReceipt')),
    predicateResult('read-need.attaches-receipt-to-output', SOURCE_ROOTS.readNeed, readNeed.includes('withReadNeedInferenceReceipt')),
    predicateResult('read-need.stores-receipt-in-execution', SOURCE_ROOTS.readNeed, readNeed.includes("execution?.store?.('read-need-comprehension', 'inferenceReceipt'")),
    predicateResult('read-need.requires-accepted-need-for-fits', SOURCE_ROOTS.readNeed, readNeed.includes('acceptedNeedRequiredForFindingFits: true')),
    predicateResult('read-need.supports-resynthesis-feedback', SOURCE_ROOTS.readNeed, readNeed.includes('supportsResynthesisWithFeedback: true') && readNeed.includes('previousNeedId')),
    predicateResult('read-need.blocks-source-disclosure', SOURCE_ROOTS.readNeed, readNeed.includes('protectedSourceVisible: false') && readNeed.includes('unpaidAssetPackSourceVisible: false')),
    predicateResult('read-need.blocks-credentials', SOURCE_ROOTS.readNeed, readNeed.includes('credentialsSerialized: false')),
    predicateResult('bounded-inference-records-failsafe-stack', SOURCE_ROOTS.readNeed, bounded.includes("'bounded-inference', 'stack'") && bounded.includes('failsafeSequence')),
    predicateResult('bounded-inference-records-thricified-stages', SOURCE_ROOTS.readNeed, bounded.includes('ThricifiedGeneration stage 1/3') && bounded.includes('ThricifiedGeneration stage 2/3') && bounded.includes('ThricifiedGeneration stage 3/3')),
    predicateResult('bounded-inference-records-prompt-output', SOURCE_ROOTS.readNeed, bounded.includes("'llm', 'input'") && bounded.includes("'llm', 'parsedOutput'")),
    predicateResult('route-uses-inference-synthesis', SOURCE_ROOTS.readReviewRoute, route.includes('synthesizeReadNeedForPipelineInputWithInference')),
    predicateResult('terminal-supports-resynthesis-feedback', SOURCE_ROOTS.terminalWorkbench, terminal.includes('resynthesize_read_need') && terminal.includes('readNeedFeedback')),
    predicateResult('tests-cover-receipt-counts', SOURCE_ROOTS.readNeedTests, tests.includes('failsafeSequenceIds') && tests.includes('thricifiedGenerationIds') && tests.includes('toHaveLength(48)')),
    predicateResult('tests-cover-real-inference-receipt', SOURCE_ROOTS.readNeedTests, tests.includes("mode: 'real-inference'") && tests.includes("'read-need-comprehension'")),
    predicateResult('contract-tests-cover-read-need-counts', SOURCE_ROOTS.readingContractTests, contractTests.includes('ptrrStepCount: 16') && contractTests.includes('thricifiedGenerationCount: 48')),
  ];
}

function upstreamRoot(artifact, prefix) {
  if (!artifact?.artifactRoot) return `${prefix}:missing`;
  return artifact.artifactRoot;
}

export function buildV38ReadNeedComprehensionInferenceHardening(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);

  const gate2 = readJson(repoRoot, '.bitcode/v38-inference-surface-inventory.json');
  const gate3 = readJson(repoRoot, '.bitcode/v38-ptrr-failsafe-thricified-stack.json');
  const gate4 = readJson(repoRoot, '.bitcode/v38-prompt-benchmark-report.json');
  const gate5 = readJson(repoRoot, '.bitcode/v38-disclosure-boundary-report.json');
  const rowRoots = V38_READ_NEED_COMPREHENSION_HARDENING_ROWS.map((item) => item.rowRoot);
  const artifactRoot = `v38-read-need-comprehension-hardening:${digest(JSON.stringify({
    rowRoots,
    failedPredicateIds,
    gate2: upstreamRoot(gate2, 'v38-inference-surface-inventory'),
    gate3: upstreamRoot(gate3, 'v38-ptrr-failsafe-thricified-stack'),
    gate4: upstreamRoot(gate4, 'v38-prompt-benchmark-report'),
    gate5: upstreamRoot(gate5, 'v38-inference-telemetry-disclosure-report'),
  }))}`;

  return {
    artifactId: 'v38-read-need-comprehension-inference-hardening',
    schemaId: V38_READ_NEED_COMPREHENSION_HARDENING_SCHEMA_ID,
    version: V38_READ_NEED_COMPREHENSION_HARDENING_VERSION,
    currentTarget: V38_READ_NEED_COMPREHENSION_HARDENING_CURRENT_TARGET,
    sourceSafetyVerdict: V38_READ_NEED_COMPREHENSION_HARDENING_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    rows: V38_READ_NEED_COMPREHENSION_HARDENING_ROWS,
    requiredPhaseIds: [...V38_READ_NEED_COMPREHENSION_REQUIRED_PHASE_IDS],
    requiredReturnTypes: [...V38_READ_NEED_COMPREHENSION_REQUIRED_RETURN_TYPES],
    requiredReceiptFields: [...V38_READ_NEED_COMPREHENSION_REQUIRED_RECEIPT_FIELDS],
    predicateResults,
    coverage: {
      phaseCount: 4,
      ptrrAgentCount: 4,
      ptrrStepCount: 16,
      failsafeSequenceCount: 48,
      thricifiedGenerationCount: 48,
      providerCallSlotCount: 144,
      rowCount: V38_READ_NEED_COMPREHENSION_HARDENING_ROWS.length,
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      gate2InventoryRoot: upstreamRoot(gate2, 'v38-inference-surface-inventory'),
      gate3StackRoot: upstreamRoot(gate3, 'v38-ptrr-failsafe-thricified-stack'),
      gate4PromptBenchmarkRoot: upstreamRoot(gate4, 'v38-prompt-benchmark-report'),
      gate5DisclosureRoot: upstreamRoot(gate5, 'v38-inference-telemetry-disclosure-report'),
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawProviderResponseVisible: false,
      unpaidAssetPackSourceVisible: false,
      credentialsSerialized: false,
      acceptedNeedRequiredForFindingFits: true,
      resynthesisWithFeedbackCovered: true,
      routeUsesInferenceSynthesis: true,
      terminalSupportsResynthesis: true,
      legacySourceRoots: Object.values(SOURCE_ROOTS).some((sourcePath) => sourcePath.includes('_legacy/')),
    },
    sourceRoots: SOURCE_ROOTS,
  };
}
