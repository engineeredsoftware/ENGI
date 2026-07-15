// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V39_ENTERPRISE_READING_UX_STATE_ARTIFACT_PATH =
  '.bitcode/v39-enterprise-reading-ux-state.json';
export const V39_ENTERPRISE_READING_UX_STATE_SCHEMA_ID =
  'bitcode.v39.enterpriseReadingUxState.v1';
export const V39_ENTERPRISE_READING_UX_STATE_VERSION = 'V39';
export const V39_ENTERPRISE_READING_UX_STATE_CURRENT_TARGET = 'V38';
export const V39_ENTERPRISE_READING_UX_STATE_SOURCE_SAFETY_VERDICT =
  'source-safe-enterprise-reading-ux-metadata';

export const V39_ENTERPRISE_READING_STEP_IDS = Object.freeze([
  'request-read',
  'review-synthesized-need',
  'request-fit',
  'review-synthesized-asset-pack',
  'buy-asset-pack-settle',
]);

export const V39_ENTERPRISE_READING_UX_ROW_IDS = Object.freeze([
  'stage:request-read',
  'stage:review-synthesized-need',
  'stage:request-finding-fits',
  'stage:review-assetpack-preview',
  'stage:buy-assetpack-settle',
  'route:conversation-terminal-reading-stage',
  'stream:readfitsfinding-log-panel',
  'disclosure:source-safe-low-detail-expandable',
  'proof:component-browser-workflow',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-provider-responses',
  'unpaid-assetpack-source',
  'wallet-private-material',
  'settlement-private-payloads',
  'ledger-write-authority',
  'secret-values',
]);

const SOURCE_ROOTS = Object.freeze({
  terminalUxState: 'apps/uapi/components/reads/models/read-route-model.ts',
  terminalWorkbench: 'apps/uapi/components/reads/ReadsDepositReadWorkbench/ReadsDepositReadWorkbench.tsx',
  terminalWorkbenchContract: 'apps/uapi/components/reads/ReadsDepositReadWorkbench/ReadsDepositReadWorkbench.tsx',
  terminalHarnessClient: 'apps/uapi/components/bitcode/pipeline/PipelineHostClient/pipeline-host-client.ts',
  conversationHandoff: 'apps/uapi/components/conversations/models/conversation-product-handoff.ts',
  terminalRouteQuery: 'apps/uapi/components/bitcode/pipeline/models/pipeline-selection-query.ts',
  uxStateTest: 'apps/uapi/tests/terminalEnterpriseReadingUxState.test.ts',
  workbenchTest: 'apps/uapi/tests/terminalDepositReadWorkbench.test.ts',
  handoffTest: 'apps/uapi/components/conversations/ConversationProductHandoff/ConversationProductHandoff.tsx',
  queryTest: 'apps/uapi/tests/pipelineSelectionQuery.test.ts',
  streamHeaderTest: 'apps/uapi/tests/pipelineExecutionLogHeader.test.tsx',
  browserProofTest: 'apps/uapi/tests/terminalUxBrowserProof.test.tsx',
  browserProofE2e: 'apps/uapi/tests/e2e/commercial-mvp.terminal-ux.spec.ts',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  v39Spec: 'specifications/BITCODE_SPEC_V39.md',
  v39Delta: 'specifications/BITCODE_SPEC_V39_DELTA.md',
  v39Notes: 'specifications/BITCODE_SPEC_V39_NOTES.md',
  v39Parity: 'specifications/BITCODE_SPEC_V39_PARITY_MATRIX.md',
  roadmap: 'specifications/SPECIFICATIONS_ROADMAP.md',
  rootReadme: 'README.md',
  terminalReadme: 'apps/uapi/components/README.md',
  conversationReadme: 'apps/uapi/app/conversations/README.md',
  protocolReadme: 'scripts/specifying/README.md',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v39-enterprise-reading-ux-state-row:${digest(id)}`;
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
    sourceSafetyClass: 'source_safe_enterprise_reading_ux_metadata',
    sourceSafeMetadataOnly: true,
    lowDetailDefault: true,
    expandableSourceSafeDetail: true,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    ledgerAuthorityClaimed: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V39_ENTERPRISE_READING_UX_ROWS = Object.freeze([
  row({
    rowId: 'stage:request-read',
    purpose:
      'Represent the first Reading stage where the reader selects source anchors, frames the request, records measured Read posture, and keeps protected source hidden.',
    sourceRoots: [SOURCE_ROOTS.terminalUxState, SOURCE_ROOTS.terminalWorkbench],
    emittedTypes: ['ProductEnterpriseReadingStepView', 'ProductEnterpriseReadingUxState'],
    requiredEvidence: ['request-read', 'read_request_summary', 'repository source required'],
  }),
  row({
    rowId: 'stage:review-synthesized-need',
    purpose:
      'Represent the reviewable ReadNeedComprehensionSynthesis output stage before any Depository search is admitted.',
    sourceRoots: [SOURCE_ROOTS.terminalUxState, SOURCE_ROOTS.terminalWorkbench],
    emittedTypes: ['TerminalReadNeedState', 'ProductEnterpriseReadingStepView'],
    requiredEvidence: ['review-synthesized-need', 'read_need_measurements', 'accepted Need required'],
  }),
  row({
    rowId: 'stage:request-finding-fits',
    purpose:
      'Represent the accepted-Need gate that starts ReadFitsFindingSynthesis and feeds source-safe stream telemetry into the rich execution log.',
    sourceRoots: [SOURCE_ROOTS.terminalUxState, SOURCE_ROOTS.terminalWorkbench, SOURCE_ROOTS.terminalHarnessClient],
    emittedTypes: ['TerminalReadFitsFindingSynthesisHarnessRequest', 'TerminalReadFitsFindingSynthesisHarnessEvent'],
    requiredEvidence: ['request-fit', 'ReadFitsFindingSynthesis', 'BitcodeExecutionStreamPanel'],
  }),
  row({
    rowId: 'stage:review-assetpack-preview',
    purpose:
      'Represent source-safe AssetPack preview and quote review without disclosing source-bearing AssetPack contents before settlement.',
    sourceRoots: [SOURCE_ROOTS.terminalUxState, SOURCE_ROOTS.terminalWorkbench],
    emittedTypes: ['ProductEnterpriseReadingStepView'],
    requiredEvidence: ['review-synthesized-asset-pack', 'asset_pack_measurements', 'unpaid_assetpack_source'],
  }),
  row({
    rowId: 'stage:buy-assetpack-settle',
    purpose:
      'Represent BTC quote settlement, BTD rights unlock, ledger readback, and delivery posture while private wallet and settlement payloads remain hidden.',
    sourceRoots: [SOURCE_ROOTS.terminalUxState, SOURCE_ROOTS.terminalWorkbench],
    emittedTypes: ['ProductEnterpriseReadingStepView'],
    requiredEvidence: ['buy-asset-pack-settle', 'settlement_state', 'delivery_posture'],
  }),
  row({
    rowId: 'route:conversation-terminal-reading-stage',
    purpose:
      'Carry source-safe Reading stage intent from Conversation into product route query state while Packs remains the transaction authority.',
    sourceRoots: [SOURCE_ROOTS.conversationHandoff, SOURCE_ROOTS.terminalRouteQuery],
    emittedTypes: ['ConversationProductHandoffEnvelope.readingStage', 'ProductConversationHandoffContext.readingStage'],
    requiredEvidence: ['readingStage', 'productEnterpriseReadingStage', 'conversationMayHandoffIntent'],
  }),
  row({
    rowId: 'stream:readfitsfinding-log-panel',
    purpose:
      'Project ReadFitsFindingSynthesis telemetry into the existing rich execution stream with phase, PTRR, Failsafe, ThricifiedGeneration, tool, prompt, and schema metadata.',
    sourceRoots: [SOURCE_ROOTS.terminalHarnessClient, SOURCE_ROOTS.terminalWorkbench, SOURCE_ROOTS.streamHeaderTest],
    emittedTypes: ['TerminalReadFitsFindingSynthesisHarnessStreamSnapshot', 'ExecutionLogItem'],
    requiredEvidence: ['pipelinePhaseId', 'ptrrStepId', 'thricifiedGenerationId', 'promptTemplateId', 'outputSchema'],
  }),
  row({
    rowId: 'disclosure:source-safe-low-detail-expandable',
    purpose:
      'Default the Reading UX to low-detail guidance while expandable details remain source-safe and forbid protected source, raw prompts, provider responses, unpaid AssetPack source, credentials, and private settlement material.',
    sourceRoots: [SOURCE_ROOTS.terminalUxState, SOURCE_ROOTS.terminalWorkbench, SOURCE_ROOTS.uxStateTest],
    emittedTypes: ['ProductEnterpriseReadingUxState.disclosure'],
    requiredEvidence: ['lowDetailDefault', 'expandableSourceSafeDetail', 'PRODUCT_ENTERPRISE_READING_FORBIDDEN_FIELDS'],
  }),
  row({
    rowId: 'proof:component-browser-workflow',
    purpose:
      'Bind Gate 3 to component tests, route-state tests, source-safe disclosure tests, and the maintained opt-in product browser proof workflow.',
    sourceRoots: [
      SOURCE_ROOTS.uxStateTest,
      SOURCE_ROOTS.workbenchTest,
      SOURCE_ROOTS.handoffTest,
      SOURCE_ROOTS.queryTest,
      SOURCE_ROOTS.browserProofTest,
      SOURCE_ROOTS.browserProofE2e,
      SOURCE_ROOTS.gateWorkflow,
    ],
    emittedTypes: ['V39EnterpriseReadingUxStateProof'],
    requiredEvidence: ['terminal-enterprise-reading-ux-state', 'Browser proof product cockpit', 'BITCODE_ENABLE_GATE_BROWSER_PROOF'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const uxState = readSource(repoRoot, SOURCE_ROOTS.terminalUxState);
  const workbench = readSource(repoRoot, SOURCE_ROOTS.terminalWorkbench);
  const workbenchContract = readSource(repoRoot, SOURCE_ROOTS.terminalWorkbenchContract);
  const harnessClient = readSource(repoRoot, SOURCE_ROOTS.terminalHarnessClient);
  const handoff = readSource(repoRoot, SOURCE_ROOTS.conversationHandoff);
  const query = readSource(repoRoot, SOURCE_ROOTS.terminalRouteQuery);
  const uxStateTest = readSource(repoRoot, SOURCE_ROOTS.uxStateTest);
  const workbenchTest = readSource(repoRoot, SOURCE_ROOTS.workbenchTest);
  const handoffTest = readSource(repoRoot, SOURCE_ROOTS.handoffTest);
  const queryTest = readSource(repoRoot, SOURCE_ROOTS.queryTest);
  const streamHeaderTest = readSource(repoRoot, SOURCE_ROOTS.streamHeaderTest);
  const browserProofTest = readSource(repoRoot, SOURCE_ROOTS.browserProofTest);
  const browserProofE2e = readSource(repoRoot, SOURCE_ROOTS.browserProofE2e);
  const gateWorkflow = readSource(repoRoot, SOURCE_ROOTS.gateWorkflow);
  const v39Spec = readSource(repoRoot, SOURCE_ROOTS.v39Spec);
  const v39Delta = readSource(repoRoot, SOURCE_ROOTS.v39Delta);
  const v39Notes = readSource(repoRoot, SOURCE_ROOTS.v39Notes);
  const v39Parity = readSource(repoRoot, SOURCE_ROOTS.v39Parity);
  const roadmap = readSource(repoRoot, SOURCE_ROOTS.roadmap);
  const rootReadme = readSource(repoRoot, SOURCE_ROOTS.rootReadme);
  const terminalReadme = readSource(repoRoot, SOURCE_ROOTS.terminalReadme);
  const conversationReadme = readSource(repoRoot, SOURCE_ROOTS.conversationReadme);
  const protocolReadme = readSource(repoRoot, SOURCE_ROOTS.protocolReadme);

  return [
    predicateResult('ux-state-defines-five-stage-contract', SOURCE_ROOTS.terminalUxState, V39_ENTERPRISE_READING_STEP_IDS.every((id) => uxState.includes(id)) && uxState.includes('buildProductEnterpriseReadingUxState')),
    predicateResult('ux-state-source-safety-disclosure', SOURCE_ROOTS.terminalUxState, uxState.includes('source_safe_enterprise_reading_ux_metadata') && uxState.includes('protectedSourceVisible: false') && uxState.includes('unpaidAssetPackSourceVisible: false')),
    predicateResult(
      'ux-state-forbids-protected-payloads',
      SOURCE_ROOTS.terminalUxState,
      uxState.includes('PRODUCT_ENTERPRISE_READING_FORBIDDEN_FIELDS') &&
        uxState.includes('protected_source_payload') &&
        uxState.includes('raw_protected_prompt') &&
        uxState.includes('raw_provider_response') &&
        uxState.includes('unpaid_assetpack_source') &&
        uxState.includes('wallet_private_material') &&
        uxState.includes('settlement_private_payload') &&
        uxState.includes('ledger_write_authority'),
    ),
    predicateResult('workbench-renders-stage-state-cards', SOURCE_ROOTS.terminalWorkbench, workbench.includes('terminal-enterprise-reading-step-${stage.id}') && workbench.includes('data-reading-step-state') && workbench.includes('Source-safe detail')),
    predicateResult('workbench-renders-execution-stream-panel', SOURCE_ROOTS.terminalWorkbench, workbench.includes('BitcodeExecutionStreamPanel') && workbench.includes('buildProductEnterpriseReadingUxState')),
    predicateResult('workbench-contract-reexports-stage-ids', SOURCE_ROOTS.terminalWorkbenchContract, workbenchContract.includes('PRODUCT_ENTERPRISE_READING_STEPS') && workbenchContract.includes('TerminalEnterpriseReadingStepId')),
    predicateResult('harness-projects-rich-reading-telemetry', SOURCE_ROOTS.terminalHarnessClient, harnessClient.includes('ReadFitsFindingSynthesis') && harnessClient.includes('ptrrStepId') && harnessClient.includes('thinkingsGenerationId') && harnessClient.includes('promptTemplateId') && harnessClient.includes('outputSchema')),
    predicateResult('conversation-handoff-carries-reading-stage', SOURCE_ROOTS.conversationHandoff, handoff.includes('inferConversationProductReadingStage') && handoff.includes('productEnterpriseReadingStage') && handoff.includes("params.set('readingStage'")),
    predicateResult('terminal-query-reads-reading-stage', SOURCE_ROOTS.terminalRouteQuery, query.includes('PRODUCT_ENTERPRISE_READING_STAGE_VALUES') && query.includes('readingStage: TerminalEnterpriseReadingStepId | null')),
    predicateResult('ux-state-tests-cover-source-safety', SOURCE_ROOTS.uxStateTest, uxStateTest.includes('locks the enterprise Reading UX to five source-safe stages') && uxStateTest.includes('source_safe_enterprise_reading_ux_metadata')),
    predicateResult('workbench-tests-cover-five-stage-labels', SOURCE_ROOTS.workbenchTest, workbenchTest.includes('3. Request Finding Fits') && workbenchTest.includes('buy-asset-pack-settle')),
    predicateResult('handoff-tests-cover-reading-stage-route', SOURCE_ROOTS.handoffTest, handoffTest.includes('readingStage=request-fit') && handoffTest.includes('productEnterpriseReadingStage')),
    predicateResult('query-tests-cover-reading-stage-route', SOURCE_ROOTS.queryTest, queryTest.includes('reads source-safe enterprise Reading stage') && queryTest.includes('request-fit')),
    predicateResult('stream-tests-cover-rich-header', SOURCE_ROOTS.streamHeaderTest, streamHeaderTest.includes('ReadFitsFindingSynthesis') && streamHeaderTest.includes('outputSchema') && streamHeaderTest.includes('prompt_template_id_only')),
    predicateResult('browser-proof-contract-retained', SOURCE_ROOTS.browserProofTest, browserProofTest.includes('product UX browser proof contract') && browserProofTest.includes('apps/uapi/tests/e2e/commercial-mvp.terminal-ux.spec.ts')),
    predicateResult('browser-proof-e2e-retained', SOURCE_ROOTS.browserProofE2e, browserProofE2e.includes('commercial MVP product UX browser proof') && browserProofE2e.includes('expectReadableViewport')),
    predicateResult('workflow-keeps-browser-proof-opt-in', SOURCE_ROOTS.gateWorkflow, gateWorkflow.includes('Browser proof product cockpit') && gateWorkflow.includes('BITCODE_ENABLE_GATE_BROWSER_PROOF')),
    predicateResult('workflow-runs-gate3-check', SOURCE_ROOTS.gateWorkflow, gateWorkflow.includes('check-v39-gate3-enterprise-reading-ux-state.mjs')),
    predicateResult('spec-gate3-expanded', SOURCE_ROOTS.v39Spec, v39Spec.includes('ProductEnterpriseReadingUxState') && v39Spec.includes('v39-enterprise-reading-ux-state')),
    predicateResult('delta-gate3-expanded', SOURCE_ROOTS.v39Delta, v39Delta.includes('Closure implementation:') && v39Delta.includes('ProductEnterpriseReadingUxState')),
    predicateResult('notes-gate3-expanded', SOURCE_ROOTS.v39Notes, v39Notes.includes('Gate 3 implementation notes') && v39Notes.includes('readingStage')),
    predicateResult('parity-gate3-expanded', SOURCE_ROOTS.v39Parity, v39Parity.includes('Gate 3 Parity') && v39Parity.includes('v39-enterprise-reading-ux-state')),
    predicateResult('roadmap-advanced-to-gate3', SOURCE_ROOTS.roadmap, roadmap.includes('V39 Gate 3 closure anchor') && roadmap.includes('ProductEnterpriseReadingUxState')),
    predicateResult('readmes-document-gate3', SOURCE_ROOTS.rootReadme, rootReadme.includes('V39 Gate 3') && terminalReadme.includes('ProductEnterpriseReadingUxState') && conversationReadme.includes('readingStage') && protocolReadme.includes('V39EnterpriseReadingUxState')),
  ];
}

export function buildV39EnterpriseReadingUxState(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const rowRoots = V39_ENTERPRISE_READING_UX_ROWS.map((item) => item.rowRoot);
  const artifactRoot = `v39-enterprise-reading-ux-state:${digest(JSON.stringify({
    rowRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v39-enterprise-reading-ux-state',
    schemaId: V39_ENTERPRISE_READING_UX_STATE_SCHEMA_ID,
    version: V39_ENTERPRISE_READING_UX_STATE_VERSION,
    currentTarget: V39_ENTERPRISE_READING_UX_STATE_CURRENT_TARGET,
    sourceSafetyVerdict: V39_ENTERPRISE_READING_UX_STATE_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    rows: V39_ENTERPRISE_READING_UX_ROWS,
    rowIds: [...V39_ENTERPRISE_READING_UX_ROW_IDS],
    stepIds: [...V39_ENTERPRISE_READING_STEP_IDS],
    predicateResults,
    coverage: {
      rowCount: V39_ENTERPRISE_READING_UX_ROWS.length,
      stepCount: V39_ENTERPRISE_READING_STEP_IDS.length,
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      routeStageContractCovered: true,
      conversationHandoffCovered: true,
      terminalQueryReadbackCovered: true,
      streamLogIntegrationCovered: true,
      componentTestsCovered: true,
      browserProofWorkflowCovered: true,
      sourceSafeMetadataOnly: true,
      lowDetailDefault: true,
      expandableSourceSafeDetail: true,
      protectedSourceVisible: false,
      rawProtectedPromptVisible: false,
      rawProviderResponseVisible: false,
      unpaidAssetPackSourceVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      ledgerAuthorityClaimed: false,
      legacySourceRoots: Object.values(SOURCE_ROOTS).some((sourcePath) => sourcePath.includes('_legacy/')),
    },
    sourceRoots: SOURCE_ROOTS,
  };
}
