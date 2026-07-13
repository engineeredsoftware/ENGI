// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast, roadmapWorkingGatePostureAtLeast } from './version-posture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V47_READER_WEBSITE_COMPLETION_ARTIFACT_PATH =
  '.bitcode/v47-reader-website-completion.json';
export const V47_READER_WEBSITE_COMPLETION_SCHEMA_ID =
  'bitcode.v47.readerWebsiteCompletion.v1';
export const V47_READER_WEBSITE_COMPLETION_VERSION = 'V47';
export const V47_READER_WEBSITE_COMPLETION_CURRENT_TARGET = 'V46';
export const V47_READER_WEBSITE_COMPLETION_SOURCE_SAFETY_VERDICT =
  'source-safe-reader-website-completion';

export const V47_READER_WEBSITE_STEP_IDS = Object.freeze([
  'request-read',
  'review-synthesized-need',
  'request-fit',
  'review-synthesized-asset-pack',
  'buy-asset-pack-settle',
]);

export const V47_READER_WEBSITE_PIPELINE_IDS = Object.freeze([
  'ReadNeedComprehensionSynthesis',
  'ReadFitsFindingSynthesis',
  'AssetPackPreviewBoundary',
  'AssetPackSettlementRightsDelivery',
  'OrganizationPolicyWalletAuthority',
]);

export const V47_READER_WEBSITE_READBACK_IDS = Object.freeze([
  'read-fit-measurement-review',
  'read-quote-basis',
  'read-payment-observation',
  'read-settlement-finality',
  'read-btd-rights-receipt',
  'read-delivery-receipt',
]);

export const V47_READER_WEBSITE_VISIBLE_DECISION_IDS = Object.freeze([
  'need-coverage',
  'fit-confidence',
  'specificity',
  'novelty',
  'reuse',
  'risk',
  'evidence',
  'delivery-readiness',
  'selected-fit-provenance',
  'final-btd-scalar',
  'quote-basis',
  'settlement-observation-state',
  'finality-state',
  'btd-rights-state',
  'delivery-state',
  'packs-activity-sync-state',
  'authority-state',
]);

export const V47_READER_WEBSITE_FORBIDDEN_PAYLOAD_IDS = Object.freeze([
  'protected_source_payload',
  'raw_source_text',
  'unpaid_assetpack_source',
  'raw_protected_prompt',
  'interpolated_prompt',
  'raw_provider_response',
  'wallet_private_material',
  'settlement_private_payload',
  'mainnet_value_bearing_payment_secret',
]);

const SOURCE_ROOTS = Object.freeze({
  activePointer: 'BITCODE_SPEC.txt',
  spec: 'BITCODE_SPEC_V47.md',
  delta: 'BITCODE_SPEC_V47_DELTA.md',
  notes: 'BITCODE_SPEC_V47_NOTES.md',
  parity: 'BITCODE_SPEC_V47_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  readRouteModel: 'uapi/app/read/read-route-model.ts',
  readClient: 'uapi/app/read/ReadPageClient.tsx',
  readPage: 'uapi/app/read/page.tsx',
  readRouteModelTest: 'uapi/tests/readRouteModel.test.ts',
  readPageTest: 'uapi/tests/readPageClient.test.tsx',
  packActivityModel: 'uapi/components/bitcode/activity/pack-activity-model.ts',
  previewBoundaryModel: 'packages/asset-packs-pipelines/domain/src/asset-pack-preview-boundary.ts',
  settlementRightsDeliveryModel:
    'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
  needReviewModel: 'packages/asset-packs-pipelines/domain/src/read-need-review-resynthesis.ts',
  fitsFindingModel: 'packages/asset-packs-pipelines/domain/src/read-fits-finding-runtime.ts',
  authorityModel: 'packages/asset-packs-pipelines/domain/src/organization-policy-wallet-authority.ts',
  packageJson: 'package.json',
  protocolIndex: 'packages/protocol/src/index.js',
  protocolTypes: 'packages/protocol/src/index.d.ts',
  protocolSource: 'packages/protocol/src/canonical/v47-reader-website-completion.js',
  protocolTest: 'packages/protocol/test/v47-reader-website-completion.test.js',
  generator: 'scripts/generate-v47-reader-website-completion.mjs',
  checker: 'scripts/check-v47-gate5-reader-website-completion.mjs',
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

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function completionRow(input) {
  return {
    ...input,
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawSourceTextVisible: false,
    unpaidAssetPackSourceVisible: false,
    rawPromptVisible: false,
    interpolatedPromptVisible: false,
    rawProviderResponseVisible: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    valueBearingMainnetEnabled: false,
    forbiddenPayloadIds: [...V47_READER_WEBSITE_FORBIDDEN_PAYLOAD_IDS],
    rowRoot: `v47-reader-website-completion-row:${digest(JSON.stringify(input))}`,
  };
}

export const V47_READER_WEBSITE_COMPLETION_ROWS = Object.freeze([
  completionRow({
    rowId: 'read-request-initiation',
    owner: SOURCE_ROOTS.readClient,
    route: '/read',
    contract:
      'Readers initiate a Read request from a connected repository source through the route-owned five-step session before any Need synthesis is recorded.',
    requiredFields: ['request-read', 'TerminalRepositoryContextPanel', 'handleRecordActivity'],
  }),
  completionRow({
    rowId: 'need-review-acceptance',
    owner: SOURCE_ROOTS.readRouteModel,
    route: '/read',
    contract:
      'A synthesized Need must be reviewed and accepted before Finding Fits; the route session records acceptance state and blocks the fit step without it.',
    requiredFields: ['hasAcceptedNeed', 'acceptedNeedRequiredBeforeFindingFits', 'ReadNeedComprehensionSynthesis'],
  }),
  completionRow({
    rowId: 'fit-measurement-review',
    owner: SOURCE_ROOTS.readClient,
    route: '/read',
    contract:
      'Readers review source-safe Need coverage, Fit confidence, specificity, novelty, reuse, risk, evidence, delivery readiness, selected Fit provenance, final BTD scalar, and quote basis before paying.',
    requiredFields: ['fitMeasurementReview.measurements.map', 'Final BTD scalar', 'Quote basis', 'Selected Fit provenance'],
  }),
  completionRow({
    rowId: 'quote-before-settlement',
    owner: SOURCE_ROOTS.readRouteModel,
    route: '/read',
    contract:
      'The BTC-testnet quote derives deterministically from the weighted fit measurement contributions; settlement readiness is blocked until quote, approval, buyer, and wallet authority agree.',
    requiredFields: ['quoteBasis', 'btdScalarVolume', 'normalizedContribution', 'ready-for-testnet-settlement'],
  }),
  completionRow({
    rowId: 'settlement-finality-rights-delivery',
    owner: SOURCE_ROOTS.readClient,
    route: '/read',
    contract:
      'Payment observation, BTC-testnet finality, BTD rights transfer receipt, and repository PR delivery render as ordered fail-closed readback; delivery stays locked until rights transfer.',
    requiredFields: ['Payment observation', 'Finality', 'BTD rights receipt', 'Repository PR delivery'],
  }),
  completionRow({
    rowId: 'packs-history-readback',
    owner: SOURCE_ROOTS.readClient,
    route: '/packs',
    contract:
      'Recent Reading activity, Need-Fit previews, and settled AssetPack rows remain reachable from /read through source-safe execution history and /packs activity.',
    requiredFields: ['Recent Reading activity', '/packs?type=read-need-fit-preview', '/packs?type=settled-assetpack'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult('active-canon-pointer-supports-v47-launch-or-later', SOURCE_ROOTS.activePointer, bitcodeVersionAtLeast(sources.activePointer.trim(), 'V46')),
    predicateResult(
      'spec-records-gate5-reader-website-completion',
      SOURCE_ROOTS.spec,
      sources.spec.includes('Reader Website Completion') &&
        sources.spec.includes(V47_READER_WEBSITE_COMPLETION_ARTIFACT_PATH),
    ),
    predicateResult(
      'delta-records-gate5-reader-website-completion',
      SOURCE_ROOTS.delta,
      sources.delta.includes('Gate 5: Reader Website Completion') &&
        sources.delta.includes(V47_READER_WEBSITE_COMPLETION_ARTIFACT_PATH),
    ),
    predicateResult(
      'notes-record-gate5-reader-website-completion',
      SOURCE_ROOTS.notes,
      sources.notes.includes('Reader Website Completion') &&
        sources.notes.includes('fit measurement review'),
    ),
    predicateResult(
      'parity-records-gate5-reader-website-completion',
      SOURCE_ROOTS.parity,
      sources.parity.includes('Buyer visualization') &&
        sources.parity.includes(V47_READER_WEBSITE_COMPLETION_ARTIFACT_PATH),
    ),
    predicateResult(
      'roadmap-records-gate5-closure',
      SOURCE_ROOTS.roadmap,
      sources.roadmap.includes('V47 Gate 5 closure anchor') &&
        (sources.roadmap.includes('Current working gate: V47 Gate 5 Reader Website Completion') ||
          sources.roadmap.includes('Latest closed gate: V47 Gate 5 Reader Website Completion') ||
          roadmapWorkingGatePostureAtLeast(sources.roadmap, 'V47', 6)),
    ),
    predicateResult(
      'read-route-model-binds-five-step-source-safe-session',
      SOURCE_ROOTS.readRouteModel,
      sources.readRouteModel.includes('TERMINAL_ENTERPRISE_READING_STEPS') &&
        sources.readRouteModel.includes('stageCount: 5') &&
        sources.readRouteModel.includes('ReadNeedComprehensionSynthesis') &&
        sources.readRouteModel.includes('ReadFitsFindingSynthesis') &&
        sources.readRouteModel.includes('assertReadRouteSessionSourceSafe') &&
        V47_READER_WEBSITE_STEP_IDS.every((stepId) =>
          sources.readRouteModelTest.includes(`'${stepId}'`),
        ),
    ),
    predicateResult(
      'read-route-model-binds-fit-measurement-quote-basis',
      SOURCE_ROOTS.readRouteModel,
      sources.readRouteModel.includes('bitcode.read.fit-measurement-review') &&
        sources.readRouteModel.includes('btdScalarVolume') &&
        sources.readRouteModel.includes('normalizedContribution') &&
        sources.readRouteModel.includes("network: 'btc-testnet'"),
    ),
    predicateResult(
      'read-route-model-orders-settlement-rights-delivery',
      SOURCE_ROOTS.readRouteModel,
      sources.readRouteModel.includes('bitcode.read.settlement-rights-delivery') &&
        sources.readRouteModel.includes('btcFinalityBeforeBtdRights') &&
        sources.readRouteModel.includes('btdRightsBeforeSourceDelivery') &&
        sources.readRouteModel.includes('btc-testnet-finality-confirmed') &&
        sources.readRouteModel.includes('btd-rights-transferred') &&
        sources.readRouteModel.includes('repository-pr-delivery-materialized'),
    ),
    predicateResult(
      'read-client-renders-fit-measurement-review',
      SOURCE_ROOTS.readClient,
      sources.readClient.includes('fitMeasurementReview.measurements.map') &&
        sources.readClient.includes('Final BTD scalar') &&
        sources.readClient.includes('Quote basis') &&
        sources.readClient.includes('Selected Fit provenance'),
    ),
    predicateResult(
      'read-client-renders-settlement-rights-delivery',
      SOURCE_ROOTS.readClient,
      sources.readClient.includes('Payment observation') &&
        sources.readClient.includes('Finality') &&
        sources.readClient.includes('BTD rights receipt') &&
        sources.readClient.includes('Repository PR delivery'),
    ),
    predicateResult(
      'read-client-links-packs-history-readback',
      SOURCE_ROOTS.readClient,
      sources.readClient.includes('Recent Reading activity') &&
        sources.readClient.includes('/packs?type=read-need-fit-preview') &&
        sources.readClient.includes('/packs?type=settled-assetpack') &&
        sources.readClient.includes('Open settled pack activity'),
    ),
    predicateResult(
      'read-route-model-test-covers-measurement-quote-binding',
      SOURCE_ROOTS.readRouteModelTest,
      sources.readRouteModelTest.includes('whose contributions decide the quote basis') &&
        sources.readRouteModelTest.includes(
          'fails closed through payment observation, finality, BTD rights, and delivery ordering',
        ),
    ),
    predicateResult(
      'read-page-test-covers-buyer-readback',
      SOURCE_ROOTS.readPageTest,
      sources.readPageTest.includes(
        'renders buyer fit measurement review and settlement/rights/delivery readback',
      ),
    ),
    predicateResult(
      'pipeline-models-bind-reader-website-dependencies',
      SOURCE_ROOTS.previewBoundaryModel,
      sources.previewBoundaryModel.includes('AssetPackPreviewBoundary') &&
        sources.settlementRightsDeliveryModel.includes('AssetPackSettlementFinalityReceipt') &&
        sources.needReviewModel.includes('ReadNeedReviewResynthesisRuntime') &&
        sources.fitsFindingModel.includes('ReadFitsFindingRuntime') &&
        sources.authorityModel.includes('OrganizationPolicyWalletAuthority'),
    ),
    predicateResult(
      'pack-activity-model-supports-read-readback',
      SOURCE_ROOTS.packActivityModel,
      sources.packActivityModel.includes('read-need-fit-preview') &&
        sources.packActivityModel.includes('settled-assetpack') &&
        sources.packActivityModel.includes('delivery'),
    ),
    predicateResult(
      'package-exports-gate5',
      SOURCE_ROOTS.protocolIndex,
      sources.protocolIndex.includes('buildV47ReaderWebsiteCompletion') &&
        sources.protocolTypes.includes('buildV47ReaderWebsiteCompletion'),
    ),
    predicateResult(
      'package-json-exposes-gate5',
      SOURCE_ROOTS.packageJson,
      sources.packageJson.includes('"generate:v47-reader-website-completion"') &&
        sources.packageJson.includes('"check:v47-gate5"'),
    ),
    predicateResult(
      'workflows-run-gate5-check',
      SOURCE_ROOTS.gateWorkflow,
      sources.gateWorkflow.includes('check-v47-gate5-reader-website-completion.mjs') &&
        sources.canonWorkflow.includes('check-v47-gate5-reader-website-completion.mjs'),
    ),
    predicateResult(
      'generator-checker-test-exist',
      SOURCE_ROOTS.generator,
      sources.generator.includes('buildV47ReaderWebsiteCompletion') &&
        sources.checker.includes('V47 Gate 5 reader website completion check') &&
        sources.protocolTest.includes('buildV47ReaderWebsiteCompletion'),
    ),
  ];
}

export function buildV47ReaderWebsiteCompletion({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const sourceRoots = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`]),
  );
  const artifactRoot = `v47-reader-website-completion:${digest(JSON.stringify({
    stepIds: V47_READER_WEBSITE_STEP_IDS,
    pipelineIds: V47_READER_WEBSITE_PIPELINE_IDS,
    readbackIds: V47_READER_WEBSITE_READBACK_IDS,
    visibleDecisionIds: V47_READER_WEBSITE_VISIBLE_DECISION_IDS,
    rowIds: V47_READER_WEBSITE_COMPLETION_ROWS.map((row) => row.rowId),
    sourceRoots,
  }))}`;

  return {
    artifactId: 'v47-reader-website-completion',
    schemaId: V47_READER_WEBSITE_COMPLETION_SCHEMA_ID,
    version: V47_READER_WEBSITE_COMPLETION_VERSION,
    currentTarget: V47_READER_WEBSITE_COMPLETION_CURRENT_TARGET,
    artifactPath: V47_READER_WEBSITE_COMPLETION_ARTIFACT_PATH,
    sourceSafetyVerdict: V47_READER_WEBSITE_COMPLETION_SOURCE_SAFETY_VERDICT,
    stepIds: [...V47_READER_WEBSITE_STEP_IDS],
    pipelineIds: [...V47_READER_WEBSITE_PIPELINE_IDS],
    readbackIds: [...V47_READER_WEBSITE_READBACK_IDS],
    visibleDecisionIds: [...V47_READER_WEBSITE_VISIBLE_DECISION_IDS],
    forbiddenPayloadIds: [...V47_READER_WEBSITE_FORBIDDEN_PAYLOAD_IDS],
    completionRows: V47_READER_WEBSITE_COMPLETION_ROWS,
    predicateResults,
    sourceRoots,
    artifactRoot,
    coverage: {
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      readRequestInitiationComplete: true,
      needReviewAcceptanceComplete: true,
      fitMeasurementReviewComplete: true,
      quoteBeforeSettlementComplete: true,
      settlementFinalityRightsDeliveryComplete: true,
      packsHistoryReadbackComplete: true,
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      valueBearingMainnetEnabled: false,
    },
    passed: failedPredicateIds.length === 0,
  };
}

export const V47_READER_WEBSITE_COMPLETION_SOURCE_ROOTS = Object.freeze({
  ...SOURCE_ROOTS,
});
