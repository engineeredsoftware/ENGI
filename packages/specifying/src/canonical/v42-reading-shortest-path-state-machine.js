// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V42_READING_SHORTEST_PATH_STATE_MACHINE_ARTIFACT_PATH =
  '.bitcode/v42-reading-shortest-path-state-machine.json';
export const V42_READING_SHORTEST_PATH_STATE_MACHINE_SCHEMA_ID =
  'bitcode.v42.readingShortestPathStateMachine.v1';
export const V42_READING_SHORTEST_PATH_SCHEMA_ID =
  V42_READING_SHORTEST_PATH_STATE_MACHINE_SCHEMA_ID;
export const V42_READING_SHORTEST_PATH_STATE_MACHINE_VERSION = 'V42';
export const V42_READING_SHORTEST_PATH_STATE_MACHINE_CURRENT_TARGET = 'V41';
export const V42_READING_SHORTEST_PATH_STATE_MACHINE_SOURCE_SAFETY_VERDICT =
  'source-safe-reading-shortest-path-state-machine-metadata';

export const V42_READING_SHORTEST_PATH_STEP_IDS = Object.freeze([
  'request-read',
  'review-synthesized-need',
  'request-fit',
  'review-synthesized-asset-pack',
  'buy-asset-pack-settle',
]);

export const V42_READING_SHORTEST_PATH_ROW_IDS = Object.freeze([
  'state:five-step-shortest-path',
  'route:transaction-stage-persistence',
  'transition:accepted-need-before-finding-fits',
  'retry:restart-and-failure-repair',
  'ui:low-detail-proof-on-expand',
  'stream:rich-reading-pipeline-telemetry',
  'activity:history-and-workbench-readback',
  'tests:route-state-contracts',
  'spec:v42-gate3-closure',
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
  terminalPageClient: 'apps/uapi/components/reads/ReadPageClient/ReadPageClient.tsx',
  terminalWorkbenchContract: 'apps/uapi/components/reads/ReadsDepositReadWorkbench/ReadsDepositReadWorkbench.tsx',
  terminalRouteQuery: 'apps/uapi/components/bitcode/pipeline/models/pipeline-selection-query.ts',
  terminalActivityHistory: 'apps/uapi/components/bitcode/pipeline/models/pipeline-activity-history.ts',
  terminalHarnessClient: 'apps/uapi/components/bitcode/pipeline/PipelineHostClient/pipeline-host-client.ts',
  conversationHandoff: 'apps/uapi/components/conversations/models/conversation-product-handoff.ts',
  uxStateTest: 'apps/uapi/tests/terminalEnterpriseReadingUxState.test.ts',
  workbenchTest: 'apps/uapi/tests/terminalDepositReadWorkbench.test.ts',
  handoffTest: 'apps/uapi/components/conversations/ConversationProductHandoff/ConversationProductHandoff.tsx',
  queryTest: 'apps/uapi/tests/pipelineSelectionQuery.test.ts',
  streamHeaderTest: 'apps/uapi/tests/pipelineExecutionLogHeader.test.tsx',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  v42Spec: 'BITCODE_SPEC_V42.md',
  v42Delta: 'BITCODE_SPEC_V42_DELTA.md',
  v42Notes: 'BITCODE_SPEC_V42_NOTES.md',
  v42Parity: 'BITCODE_SPEC_V42_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  rootReadme: 'README.md',
  terminalReadme: 'apps/uapi/components/README.md',
  protocolReadme: 'packages/specifying/README.md',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v42-reading-shortest-path-state-machine-row:${digest(id)}`;
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
    sourceSafetyClass: 'source_safe_reading_shortest_path_state_machine_metadata',
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

export const V42_READING_SHORTEST_PATH_ROWS = Object.freeze([
  row({
    rowId: 'state:five-step-shortest-path',
    purpose:
      'Preserve exactly five enterprise Reading steps from Read Request through Need review, Finding Fits, AssetPack preview, and settlement delivery.',
    sourceRoots: [SOURCE_ROOTS.terminalUxState, SOURCE_ROOTS.terminalWorkbench],
    emittedTypes: ['TerminalEnterpriseReadingUxState', 'TerminalEnterpriseReadingStepView'],
    requiredEvidence: V42_READING_SHORTEST_PATH_STEP_IDS,
  }),
  row({
    rowId: 'route:transaction-stage-persistence',
    purpose:
      'Bind Reading state to recoverable transaction ids and readingStage route state so refresh, restart, and route handoff preserve the active stage.',
    sourceRoots: [
      SOURCE_ROOTS.terminalUxState,
      SOURCE_ROOTS.terminalRouteQuery,
      SOURCE_ROOTS.terminalPageClient,
      SOURCE_ROOTS.terminalWorkbench,
    ],
    emittedTypes: ['TerminalEnterpriseReadingRouteState', 'TerminalConversationHandoffContext.readingStage'],
    requiredEvidence: ['transactionIdRequiredForRecovery', 'readingStageQueryParam', 'activeStageHydratedFromRoute'],
  }),
  row({
    rowId: 'transition:accepted-need-before-finding-fits',
    purpose:
      'Make accepted Need the hard transition before Finding Fits, preview, settlement, or delivery can proceed.',
    sourceRoots: [SOURCE_ROOTS.terminalUxState, SOURCE_ROOTS.terminalWorkbench, SOURCE_ROOTS.conversationHandoff],
    emittedTypes: ['acceptedNeedRequiredBeforeFindingFits', 'TerminalReadNeedState'],
    requiredEvidence: ['accepted Need required', 'ReadNeedComprehensionSynthesis', 'ReadFitsFindingSynthesis'],
  }),
  row({
    rowId: 'retry:restart-and-failure-repair',
    purpose:
      'Represent retry, restart, and failure repair posture as source-safe state metadata without exposing protected source, prompts, provider responses, wallet material, or settlement payloads.',
    sourceRoots: [SOURCE_ROOTS.terminalUxState, SOURCE_ROOTS.uxStateTest, SOURCE_ROOTS.terminalWorkbench],
    emittedTypes: ['TerminalEnterpriseReadingFailureKind', 'TerminalEnterpriseReadingRouteState.failureRepairActions'],
    requiredEvidence: ['retryPreservesNeedLineage', 'restartRestoresActiveStage', 'failureRepairActions'],
  }),
  row({
    rowId: 'ui:low-detail-proof-on-expand',
    purpose:
      'Keep the default Reading view guided and low-detail while details expand to source-safe proof roots, measurements, blockers, and visible field ids.',
    sourceRoots: [SOURCE_ROOTS.terminalUxState, SOURCE_ROOTS.terminalWorkbench, SOURCE_ROOTS.terminalReadme],
    emittedTypes: ['TerminalEnterpriseReadingUxState.disclosure'],
    requiredEvidence: ['lowDetailDefault', 'expandableSourceSafeDetail', 'Source-safe detail'],
  }),
  row({
    rowId: 'stream:rich-reading-pipeline-telemetry',
    purpose:
      'Keep Reading pipeline progress inspectable through rich execution stream rows for phase, PTRR step, ThricifiedGeneration, tool, prompt-template id, output schema, and parsed-result posture.',
    sourceRoots: [SOURCE_ROOTS.terminalHarnessClient, SOURCE_ROOTS.streamHeaderTest, SOURCE_ROOTS.terminalWorkbench],
    emittedTypes: ['TerminalReadFitsFindingSynthesisHarnessEvent', 'ExecutionLogItem'],
    requiredEvidence: ['pipelinePhaseId', 'ptrrStepId', 'thricifiedGenerationId', 'promptTemplateId', 'outputSchema'],
  }),
  row({
    rowId: 'activity:history-and-workbench-readback',
    purpose:
      'Project Reading state through activity history and workbench readback so transaction detail, proof roots, and compensation/settlement posture remain recoverable.',
    sourceRoots: [SOURCE_ROOTS.terminalActivityHistory, SOURCE_ROOTS.terminalWorkbench, SOURCE_ROOTS.terminalWorkbenchContract],
    emittedTypes: ['WorkspaceRun', 'TerminalDepositReadWorkbench'],
    requiredEvidence: ['assetPackCompletion', 'TerminalDepositedSourceRevision', 'sourceRevision'],
  }),
  row({
    rowId: 'tests:route-state-contracts',
    purpose:
      'Prove the state machine through route-state tests, component state tests, Conversation handoff tests, workbench tests, and stream-header tests.',
    sourceRoots: [
      SOURCE_ROOTS.uxStateTest,
      SOURCE_ROOTS.workbenchTest,
      SOURCE_ROOTS.handoffTest,
      SOURCE_ROOTS.queryTest,
      SOURCE_ROOTS.streamHeaderTest,
      SOURCE_ROOTS.gateWorkflow,
    ],
    emittedTypes: ['V42ReadingShortestPathStateMachineReport'],
    requiredEvidence: ['terminal-enterprise-reading-ux-state', 'readingStage=request-fit', 'Browser proof Terminal cockpit'],
  }),
  row({
    rowId: 'spec:v42-gate3-closure',
    purpose:
      'Bind V42 Gate 3 to SPEC, DELTA, NOTES, PARITY, roadmap, README, workflow, generated artifact, and checker closure.',
    sourceRoots: [
      SOURCE_ROOTS.v42Spec,
      SOURCE_ROOTS.v42Delta,
      SOURCE_ROOTS.v42Notes,
      SOURCE_ROOTS.v42Parity,
      SOURCE_ROOTS.roadmap,
      SOURCE_ROOTS.rootReadme,
      SOURCE_ROOTS.protocolReadme,
    ],
    emittedTypes: ['V42ReadingShortestPathStateMachineReport'],
    requiredEvidence: ['V42 Gate 3', 'reading shortest path state machine', 'check:v42-gate3'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const uxState = readSource(repoRoot, SOURCE_ROOTS.terminalUxState);
  const pageClient = readSource(repoRoot, SOURCE_ROOTS.terminalPageClient);
  const workbench = readSource(repoRoot, SOURCE_ROOTS.terminalWorkbench);
  const workbenchContract = readSource(repoRoot, SOURCE_ROOTS.terminalWorkbenchContract);
  const query = readSource(repoRoot, SOURCE_ROOTS.terminalRouteQuery);
  const activity = readSource(repoRoot, SOURCE_ROOTS.terminalActivityHistory);
  const harness = readSource(repoRoot, SOURCE_ROOTS.terminalHarnessClient);
  const handoff = readSource(repoRoot, SOURCE_ROOTS.conversationHandoff);
  const uxStateTest = readSource(repoRoot, SOURCE_ROOTS.uxStateTest);
  const workbenchTest = readSource(repoRoot, SOURCE_ROOTS.workbenchTest);
  const handoffTest = readSource(repoRoot, SOURCE_ROOTS.handoffTest);
  const queryTest = readSource(repoRoot, SOURCE_ROOTS.queryTest);
  const streamHeaderTest = readSource(repoRoot, SOURCE_ROOTS.streamHeaderTest);
  const gateWorkflow = readSource(repoRoot, SOURCE_ROOTS.gateWorkflow);
  const spec = readSource(repoRoot, SOURCE_ROOTS.v42Spec);
  const delta = readSource(repoRoot, SOURCE_ROOTS.v42Delta);
  const notes = readSource(repoRoot, SOURCE_ROOTS.v42Notes);
  const parity = readSource(repoRoot, SOURCE_ROOTS.v42Parity);
  const roadmap = readSource(repoRoot, SOURCE_ROOTS.roadmap);
  const rootReadme = readSource(repoRoot, SOURCE_ROOTS.rootReadme);
  const terminalReadme = readSource(repoRoot, SOURCE_ROOTS.terminalReadme);
  const protocolReadme = readSource(repoRoot, SOURCE_ROOTS.protocolReadme);

  return [
    predicateResult('ux-state-keeps-five-step-path', SOURCE_ROOTS.terminalUxState, V42_READING_SHORTEST_PATH_STEP_IDS.every((id) => uxState.includes(id)) && uxState.includes('stageCount: 5')),
    predicateResult('ux-state-defines-route-state', SOURCE_ROOTS.terminalUxState, uxState.includes('TerminalEnterpriseReadingRouteState') && uxState.includes('transactionIdRequiredForRecovery') && uxState.includes("readingStageQueryParam: 'readingStage'")),
    predicateResult('ux-state-defines-retry-failure-source-safety', SOURCE_ROOTS.terminalUxState, uxState.includes('TerminalEnterpriseReadingFailureKind') && uxState.includes('retryPreservesNeedLineage') && uxState.includes('failureRepairActions') && uxState.includes('failureStateSourceSafe')),
    predicateResult('ux-state-forbids-protected-payloads', SOURCE_ROOTS.terminalUxState, uxState.includes('protected_source_payload') && uxState.includes('raw_protected_prompt') && uxState.includes('raw_provider_response') && uxState.includes('unpaid_assetpack_source') && uxState.includes('wallet_private_material') && uxState.includes('settlement_private_payload')),
    predicateResult('terminal-page-passes-reading-stage', SOURCE_ROOTS.terminalPageClient, pageClient.includes('routeReadingStage={conversationHandoffContext.readingStage}')),
    predicateResult('workbench-projects-route-state', SOURCE_ROOTS.terminalWorkbench, workbench.includes('transactionId: recordedAdmittedReadActivityId') && workbench.includes('routeReadingStage') && workbench.includes('data-reading-transaction-present') && workbench.includes('data-reading-failure-kind')),
    predicateResult('workbench-keeps-low-detail-expandable-cards', SOURCE_ROOTS.terminalWorkbench, workbench.includes('terminal-enterprise-reading-step-${stage.id}') && workbench.includes('data-reading-step-state') && workbench.includes('Source-safe detail')),
    predicateResult('workbench-contract-reexports-stage-ids', SOURCE_ROOTS.terminalWorkbenchContract, workbenchContract.includes('TERMINAL_ENTERPRISE_READING_STEPS') && workbenchContract.includes('TerminalEnterpriseReadingStepId')),
    predicateResult('terminal-query-reads-reading-stage', SOURCE_ROOTS.terminalRouteQuery, query.includes('readingStage') && query.includes('TERMINAL_ENTERPRISE_READING_STAGE_VALUES') && query.includes('readTerminalTransactionId')),
    predicateResult('activity-history-keeps-reading-readback', SOURCE_ROOTS.terminalActivityHistory, activity.includes('assetPackCompletion') && activity.includes('sourceRevision')),
    predicateResult('harness-projects-rich-reading-telemetry', SOURCE_ROOTS.terminalHarnessClient, harness.includes('ReadFitsFindingSynthesis') && harness.includes('ptrrStepId') && harness.includes('thinkingsGenerationId') && harness.includes('promptTemplateId') && harness.includes('outputSchema')),
    predicateResult('conversation-handoff-preserves-reading-stage', SOURCE_ROOTS.conversationHandoff, handoff.includes('inferConversationTerminalReadingStage') && handoff.includes('productEnterpriseReadingStage') && handoff.includes("params.set('readingStage'")),
    predicateResult('ux-state-tests-cover-route-retry-failure', SOURCE_ROOTS.uxStateTest, uxStateTest.includes('hydrates later route stages') && uxStateTest.includes('repair-settlement-readback')),
    predicateResult('workbench-tests-cover-five-stage-labels', SOURCE_ROOTS.workbenchTest, workbenchTest.includes('3. Request Finding Fits') && workbenchTest.includes('buy-asset-pack-settle')),
    predicateResult('handoff-tests-cover-reading-stage-route', SOURCE_ROOTS.handoffTest, handoffTest.includes('readingStage=request-fit') && handoffTest.includes('productEnterpriseReadingStage')),
    predicateResult('query-tests-cover-reading-stage-route', SOURCE_ROOTS.queryTest, queryTest.includes('reads source-safe enterprise Reading stage') && queryTest.includes('request-fit')),
    predicateResult('stream-tests-cover-rich-header', SOURCE_ROOTS.streamHeaderTest, streamHeaderTest.includes('ReadFitsFindingSynthesis') && streamHeaderTest.includes('outputSchema') && streamHeaderTest.includes('prompt_template_id_only')),
    predicateResult('workflow-wires-gate3-check', SOURCE_ROOTS.gateWorkflow, gateWorkflow.includes('check-v42-gate3-reading-shortest-path-state-machine.mjs')),
    predicateResult('v42-spec-gate3-expanded', SOURCE_ROOTS.v42Spec, spec.includes('V42 Gate 3') && spec.includes('reading shortest path state machine')),
    predicateResult('v42-delta-gate3-expanded', SOURCE_ROOTS.v42Delta, delta.includes('Gate 3') && delta.includes('route-owned Reading state')),
    predicateResult('v42-notes-gate3-expanded', SOURCE_ROOTS.v42Notes, notes.includes('Gate 3') && notes.includes('transaction id')),
    predicateResult('v42-parity-gate3-implemented', SOURCE_ROOTS.v42Parity, parity.includes('Reading state machine') && parity.includes('implemented')),
    predicateResult(
      'roadmap-records-gate3-closure',
      SOURCE_ROOTS.roadmap,
      roadmap.includes('V42 Gate 3 closure anchor') &&
        (roadmap.includes('Current working gate: V42 Gate') ||
          roadmap.includes('Latest closed version: V42 Reliable MVP Experience') ||
          roadmap.includes('Recent V42 canonical promotion anchor') ||
          roadmap.includes('Current working gate: V43 Gate')),
    ),
    predicateResult('readmes-document-gate3', SOURCE_ROOTS.rootReadme, rootReadme.includes('V42 Gate 3') && terminalReadme.includes('TerminalEnterpriseReadingUxState') && protocolReadme.includes('V42 Reading shortest path')),
  ];
}

export function buildV42ReadingShortestPathStateMachine(options = {}) {
  const repoRoot = options.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults
    .filter((predicate) => !predicate.passed)
    .map((predicate) => predicate.id);
  const rowRoots = V42_READING_SHORTEST_PATH_ROWS.map((item) => item.rowRoot);
  const artifactRoot = `v42-reading-shortest-path-state-machine:${digest(JSON.stringify({
    rowRoots,
    failedPredicateIds,
  }))}`;

  return {
    artifactId: 'v42-reading-shortest-path-state-machine',
    schemaId: V42_READING_SHORTEST_PATH_STATE_MACHINE_SCHEMA_ID,
    version: V42_READING_SHORTEST_PATH_STATE_MACHINE_VERSION,
    currentTarget: V42_READING_SHORTEST_PATH_STATE_MACHINE_CURRENT_TARGET,
    sourceSafetyVerdict: V42_READING_SHORTEST_PATH_STATE_MACHINE_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: failedPredicateIds.length === 0,
    rows: V42_READING_SHORTEST_PATH_ROWS,
    rowIds: [...V42_READING_SHORTEST_PATH_ROW_IDS],
    stepIds: [...V42_READING_SHORTEST_PATH_STEP_IDS],
    predicateResults,
    coverage: {
      rowCount: V42_READING_SHORTEST_PATH_ROWS.length,
      stepCount: V42_READING_SHORTEST_PATH_STEP_IDS.length,
      acceptedUserPath: [
        'request-read',
        'review-synthesized-need',
        'request-finding-fits',
        'review-source-safe-assetpack-preview',
        'buy-settle-and-deliver-assetpack',
      ],
      requiredPredicateCount: predicateResults.length,
      passedPredicateCount: predicateResults.length - failedPredicateIds.length,
      failedPredicateIds,
      routePersistenceCovered: true,
      transactionIdRecoveryCovered: true,
      restartRetryFailureCovered: true,
      acceptedNeedGateCovered: true,
      streamLogIntegrationCovered: true,
      componentRouteTestsCovered: true,
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
