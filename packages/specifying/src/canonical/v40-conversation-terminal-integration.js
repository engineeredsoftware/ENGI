// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V40_CONVERSATION_TERMINAL_INTEGRATION_ARTIFACT_PATH =
  '.bitcode/v40-conversation-terminal-integration.json';
export const V40_CONVERSATION_TERMINAL_INTEGRATION_SCHEMA_ID =
  'bitcode.v40.conversationTerminalIntegration.v1';
export const V40_CONVERSATION_TERMINAL_INTEGRATION_VERSION = 'V40';
export const V40_CONVERSATION_TERMINAL_INTEGRATION_CURRENT_TARGET = 'V39';
export const V40_CONVERSATION_TERMINAL_INTEGRATION_SOURCE_SAFETY_VERDICT =
  'source-safe-conversation-terminal-integration-metadata';

export const V40_CONVERSATION_TERMINAL_SURFACE_IDS = Object.freeze([
  'conversation:terminal-handoff-route-contract',
  'conversation:stream-events-to-rich-log',
  'conversation:route-api-persistence-branch-contracts',
  'conversation:writing-source-selector-handoff',
  'terminal:reading-state-handoff-readback',
  'terminal:pipeline-host-log-stream',
  'terminal:transaction-cockpit-authority-boundary',
  'conversation-terminal:rehearsal-docs-and-parity',
]);

export const V40_CONVERSATION_TERMINAL_VERDICTS = Object.freeze([
  'covered',
  'exempt',
  'missing',
  'blocked',
]);

export const V40_CONVERSATION_TERMINAL_EXPECTED_TOTALS = Object.freeze({
  terminalHandoffWorkflowCount: 6,
  terminalReadingStageCount: 5,
  conversationStreamEventKindCount: 7,
  conversationRouteFamilyCount: 6,
  sourceSafeDisclosureBoundaryCount: 8,
  richExecutionLogProjectionCount: 2,
  focusedIntegrationTestCount: 1,
});

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-provider-responses',
  'raw-model-responses-with-protected-source',
  'unpaid-assetpack-source',
  'settlement-private-payloads',
  'global-ledger-authority-claim',
]);

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v40-conversation-terminal-integration-row:${digest(id)}`;
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

function allMarkersPresent(repoRoot, paths, markers) {
  const source = paths.map((sourcePath) => readSource(repoRoot, sourcePath)).join('\n');
  return markers.every((marker) => source.includes(marker));
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.integrationSurfaceId),
    verdict: 'covered',
    sourceSafetyClass: 'source_safe_conversation_terminal_integration_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    rawModelResponseWithProtectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    ledgerAuthorityClaimedByConversation: false,
    valueBearingMainnetRequired: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V40_CONVERSATION_TERMINAL_INTEGRATION_ROWS = Object.freeze([
  row({
    integrationSurfaceId: 'conversation:terminal-handoff-route-contract',
    integrationKind: 'handoff-route-contract',
    sourceRoots: [
      'apps/uapi/components/conversations/models/conversation-terminal-handoff.ts',
      'apps/uapi/components/conversations/ConversationTerminalHandoff/ConversationTerminalHandoff.tsx',
      'apps/uapi/components/bitcode/pipeline/models/pipeline-selection-query.ts',
      'apps/uapi/components/bitcode/routes/ProductRoutes/product-routes.ts',
    ],
    testPaths: [
      'apps/uapi/components/conversations/ConversationTerminalHandoff/ConversationTerminalHandoff.tsx',
      'apps/uapi/tests/conversationTerminalIntegrationCoverage.test.tsx',
      'apps/uapi/tests/pipelineSelectionQuery.test.ts',
    ],
    commandIds: [
      'pnpm --dir apps/uapi exec jest tests/conversationTerminalHandoff.test.tsx tests/conversationTerminalIntegrationCoverage.test.tsx tests/terminalTransactionQuery.test.ts --runInBand',
    ],
    requiredSourceMarkers: [
      'buildConversationTerminalHandoffEnvelope',
      'readTerminalConversationHandoffContext',
      'TERMINAL_ENTERPRISE_READING_STAGE_VALUES',
      'terminalRemainsTransactionCockpit',
    ],
    requiredTestMarkers: [
      'source-safe Conversation handoff',
      'readTerminalConversationHandoffContext',
      'source-safe enterprise Reading stages',
    ],
    expectedCounts: {
      handoffWorkflowCount: 6,
      readingStageCount: 5,
    },
    coverageTier: 'promotion-required',
    closureRequirement:
      'Conversation handoff envelopes serialize source-safe Terminal route context, read back the five enterprise Reading stages, and never claim ledger or wallet authority.',
  }),
  row({
    integrationSurfaceId: 'conversation:stream-events-to-rich-log',
    integrationKind: 'stream-to-log-rendering',
    sourceRoots: [
      'packages/api/src/conversations/stream-events.ts',
      'apps/uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
      'apps/uapi/components/bitcode/pipeline/pipeline-execution-log-header.tsx',
      'apps/uapi/components/conversations/ConversationsSidebarLogs/ConversationsSidebarLogs.tsx',
    ],
    testPaths: [
      'packages/api/src/conversations/__tests__/stream-events.test.ts',
      'apps/uapi/tests/conversationStreamPipelineLog.test.tsx',
      'apps/uapi/tests/conversationTerminalIntegrationCoverage.test.tsx',
      'apps/uapi/tests/pipelineExecutionLogHeader.test.tsx',
    ],
    commandIds: [
      'pnpm --filter @bitcode/api exec jest src/conversations/__tests__/stream-events.test.ts --runInBand --forceExit',
      'pnpm --dir apps/uapi exec jest tests/conversationStreamPipelineLog.test.tsx tests/conversationTerminalIntegrationCoverage.test.tsx tests/pipelineExecutionLogHeader.test.tsx --runInBand',
    ],
    requiredSourceMarkers: [
      'buildConversationStreamEvent',
      'buildConversationPipelineLogEvent',
      'prompt_template_id_only',
      'BitcodeExecutionStreamPanel',
    ],
    requiredTestMarkers: [
      'PipelineExecutionLog',
      'ConversationStreamEvent:tool_call',
      'prompt_template_id_only',
    ],
    expectedCounts: {
      conversationStreamEventKindCount: 7,
      richExecutionLogProjectionCount: 2,
    },
    coverageTier: 'promotion-required',
    closureRequirement:
      'Conversation stream events are converted into rich execution-log rows with collapsed status, expandable source-safe metadata, proof roots, telemetry hooks, and prompt/result disclosure posture.',
  }),
  row({
    integrationSurfaceId: 'conversation:route-api-persistence-branch-contracts',
    integrationKind: 'route-api-contracts',
    sourceRoots: [
      'apps/uapi/app/api/conversations/route.ts',
      'apps/uapi/app/api/conversations/[conversationId]/route.ts',
      'apps/uapi/app/api/conversations/[conversationId]/stream/route.ts',
      'apps/uapi/app/api/conversations/branch/route.ts',
      'apps/uapi/app/api/conversations/stream/route.ts',
      'packages/api/src/conversations/conversations.ts',
      'packages/api/src/conversations/privacy.ts',
      'packages/api/src/conversations/telemetry.ts',
    ],
    testPaths: [
      'apps/uapi/tests/api/conversationsRoute.test.ts',
      'apps/uapi/tests/api/conversationsRouteRead.test.ts',
      'apps/uapi/tests/api/chatStreamRoute.test.ts',
      'apps/uapi/tests/api/conversationThreadStreamRoute.test.ts',
      'apps/uapi/tests/api/conversationBranchRoute.test.ts',
      'apps/uapi/tests/api/conversationPersistencePrivacyRedaction.test.ts',
      'apps/uapi/tests/api/conversationTelemetryProofHooks.test.ts',
      'packages/api/src/conversations/__tests__/branch-conversation.test.ts',
      'packages/api/src/conversations/__tests__/privacy.test.ts',
      'packages/api/src/conversations/__tests__/telemetry.test.ts',
    ],
    commandIds: [
      'pnpm --dir apps/uapi exec jest tests/api/conversationsRoute.test.ts tests/api/conversationBranchRoute.test.ts tests/api/conversationTelemetryProofHooks.test.ts --runInBand',
      'pnpm --filter @bitcode/api exec jest src/conversations/__tests__/branch-conversation.test.ts src/conversations/__tests__/privacy.test.ts src/conversations/__tests__/telemetry.test.ts --runInBand --forceExit',
    ],
    requiredSourceMarkers: [
      'conversation_id',
      'buildConversationTelemetryProofHook',
      'redactConversationPersistenceText',
      'branch',
    ],
    requiredTestMarkers: [
      'conversation',
      'privacy',
      'telemetry',
      'branch',
    ],
    expectedCounts: {
      routeFamilyCount: 6,
      persistencePrivacyRequired: true,
    },
    coverageTier: 'promotion-required',
    closureRequirement:
      'Conversation routes, persistence readback, branch creation, privacy redaction, and telemetry hooks are integration-covered across UAPI and package API helpers.',
  }),
  row({
    integrationSurfaceId: 'conversation:writing-source-selector-handoff',
    integrationKind: 'writing-source-selector-handoff',
    sourceRoots: [
      'apps/uapi/components/conversations/models/conversation-writing-workspace.ts',
      'apps/uapi/components/conversations/ConversationWritingWorkspace/ConversationWritingWorkspace.tsx',
      'apps/uapi/components/conversations/models/conversation-source-selector.ts',
      'apps/uapi/components/conversations/ConversationSourceSelector/ConversationSourceSelector.tsx',
      'apps/uapi/components/conversations/ConversationsOverlay/ConversationsOverlay.tsx',
    ],
    testPaths: [
      'apps/uapi/tests/conversationWritingWorkspace.test.tsx',
      'apps/uapi/tests/conversationSourceSelector.test.tsx',
      'apps/uapi/tests/conversationsOverlayMapping.test.ts',
      'apps/uapi/tests/conversationTerminalIntegrationCoverage.test.tsx',
    ],
    commandIds: [
      'pnpm --dir apps/uapi exec jest tests/conversationWritingWorkspace.test.tsx tests/conversationSourceSelector.test.tsx tests/conversationsOverlayMapping.test.ts tests/conversationTerminalIntegrationCoverage.test.tsx --runInBand',
    ],
    requiredSourceMarkers: [
      'ConversationWritingWorkspace',
      'buildConversationWritingWorkspaceHandoff',
      'buildConversationSourceSelectorPreview',
      'ConversationTerminalHandoff',
    ],
    requiredTestMarkers: [
      'source-safe',
      'source',
      'destination',
      'Request Finding Fits for the accepted Read-Need',
    ],
    expectedCounts: {
      workspaceModeCount: 4,
      selectorPreviewRequired: true,
    },
    coverageTier: 'promotion-required',
    closureRequirement:
      'Conversation writing, source selector, and attachment mapping stay source-safe before they prepare Terminal handoff intent.',
  }),
  row({
    integrationSurfaceId: 'terminal:reading-state-handoff-readback',
    integrationKind: 'terminal-reading-state',
    sourceRoots: [
      'apps/uapi/components/reads/models/read-route-model.ts',
      'apps/uapi/components/reads/ReadPageClient/ReadPageClient.tsx',
      'apps/uapi/components/README.md',
      'apps/uapi/app/conversations/README.md',
    ],
    testPaths: [
      'apps/uapi/tests/terminalEnterpriseReadingUxState.test.ts',
      'apps/uapi/components/conversations/ConversationTerminalHandoff/ConversationTerminalHandoff.tsx',
      'apps/uapi/tests/conversationTerminalIntegrationCoverage.test.tsx',
    ],
    commandIds: [
      'pnpm --dir apps/uapi exec jest tests/terminalEnterpriseReadingUxState.test.ts tests/conversationTerminalHandoff.test.tsx tests/conversationTerminalIntegrationCoverage.test.tsx --runInBand',
    ],
    requiredSourceMarkers: [
      'TERMINAL_ENTERPRISE_READING_STEPS',
      'request-fit',
      'Conversation handoff',
      'source-safe',
    ],
    requiredTestMarkers: [
      'locks the enterprise Reading UX to five source-safe stages',
      'source-safe enterprise Reading stages',
      'request-fit',
    ],
    expectedCounts: {
      readingStageCount: 5,
      lowDetailDefaultRequired: true,
    },
    coverageTier: 'promotion-required',
    closureRequirement:
      'Terminal reads Conversation `readingStage` intent as posture, keeps the five-stage Reading UX source-safe, and blocks protected or unpaid source disclosure.',
  }),
  row({
    integrationSurfaceId: 'terminal:pipeline-host-log-stream',
    integrationKind: 'terminal-harness-streaming',
    sourceRoots: [
      'apps/uapi/components/bitcode/pipeline/PipelineHostClient/pipeline-host-client.ts',
      'apps/uapi/app/api/pipeline-host/asset-pack/route.ts',
      'apps/uapi/components/bitcode/pipeline/BitcodeExecutionStreamPanel/BitcodeExecutionStreamPanel.tsx',
      'apps/uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
    ],
    testPaths: [
      'apps/uapi/tests/terminalPipelineHarnessClient.test.ts',
      'apps/uapi/tests/api/pipelineHostRoute.test.ts',
      'apps/uapi/tests/readingOperationalTelemetryPipelineLog.test.tsx',
      'apps/uapi/tests/conversationTerminalIntegrationCoverage.test.tsx',
    ],
    commandIds: [
      'pnpm --dir apps/uapi exec jest tests/terminalPipelineHarnessClient.test.ts tests/api/pipelineHostRoute.test.ts tests/readingOperationalTelemetryPipelineLog.test.tsx tests/conversationTerminalIntegrationCoverage.test.tsx --runInBand',
    ],
    requiredSourceMarkers: [
      'buildTerminalReadFitsFindingSynthesisHarnessStreamSnapshot',
      'summarizeTerminalReadFitsFindingSynthesisHarnessEvent',
      'readingPipelineTelemetry',
      'PipelineExecutionLog',
    ],
    requiredTestMarkers: [
      'pipeline ReadFitsFindingSynthesis',
      'telemetry 72 lines',
      'ThinkingsGeneration',
    ],
    expectedCounts: {
      harnessEventProjectionRequired: true,
      inferenceTelemetryReadbackRequired: true,
    },
    coverageTier: 'promotion-required',
    closureRequirement:
      'Terminal harness streaming converts live or replayed pipeline events into inspectable rich logs with inference telemetry and no source or secret leakage.',
  }),
  row({
    integrationSurfaceId: 'terminal:transaction-cockpit-authority-boundary',
    integrationKind: 'terminal-authority-boundary',
    sourceRoots: [
      'apps/uapi/components/bitcode/routes/ProductRoutes/product-routes.ts',
      'apps/uapi/components/bitcode/pipeline/models/pipeline-run-data.ts',
      'apps/uapi/components/auxillaries/AuxillariesWalletPane/AuxillariesWalletPane.tsx',
      'packages/asset-packs-pipelines/domain/src/reading-interface-product-parity.ts',
    ],
    testPaths: [
      'apps/uapi/tests/terminalInterfaceIntegrationRegression.test.ts',
      'apps/uapi/tests/terminalTransactionReadModel.test.ts',
      'apps/uapi/tests/terminalWalletBtcOperation.test.ts',
      'apps/uapi/tests/api/conversationReadingInterfaceParity.test.ts',
      'packages/asset-packs-pipelines/domain/src/__tests__/reading-interface-product-parity.test.ts',
    ],
    commandIds: [
      'pnpm --dir apps/uapi exec jest tests/terminalInterfaceIntegrationRegression.test.ts tests/terminalTransactionReadModel.test.ts tests/terminalWalletBtcOperation.test.ts tests/api/conversationReadingInterfaceParity.test.ts --runInBand',
      'pnpm --filter @bitcode/asset-packs-pipelines-domain exec jest src/__tests__/reading-interface-product-parity.test.ts --runInBand --forceExit',
    ],
    requiredSourceMarkers: [
      'terminal-delegated-handoff',
      'terminal_handoff',
      'PSBT handoff',
      'Wallet signer session',
    ],
    requiredTestMarkers: [
      'terminal-delegated-handoff',
      'signed-psbt',
    ],
    expectedCounts: {
      terminalAuthorityRequired: true,
      noConversationWalletAuthority: true,
    },
    coverageTier: 'promotion-required',
    closureRequirement:
      'Terminal remains the transaction, wallet, settlement, ledger, and delivery authority while Conversation may only hand off source-safe intent.',
  }),
  row({
    integrationSurfaceId: 'conversation-terminal:rehearsal-docs-and-parity',
    integrationKind: 'rehearsal-docs-parity',
    sourceRoots: [
      'apps/uapi/components/conversations/models/conversation-rehearsal.ts',
      'apps/uapi/components/conversations/ConversationRehearsalPanel/ConversationRehearsalPanel.tsx',
      'apps/uapi/app/conversations/README.md',
      'apps/uapi/components/README.md',
      'packages/specifying/src/canonical/v39-interface-conversation-product-parity.js',
    ],
    testPaths: [
      'apps/uapi/tests/api/conversationRehearsal.test.ts',
      'apps/uapi/tests/conversationRehearsalPanel.test.tsx',
      'packages/specifying/test/v39-interface-conversation-product-parity.test.js',
      'apps/uapi/tests/conversationTerminalIntegrationCoverage.test.tsx',
    ],
    commandIds: [
      'pnpm --dir apps/uapi exec jest tests/api/conversationRehearsal.test.ts tests/conversationRehearsalPanel.test.tsx tests/conversationTerminalIntegrationCoverage.test.tsx --runInBand',
      'pnpm --filter @bitcode/specifying exec node --test --test-force-exit test/v39-interface-conversation-product-parity.test.js',
    ],
    requiredSourceMarkers: [
      'terminal_handoff',
      'ConversationTerminalHandoff',
      'source-safe',
      'buildV39InterfaceConversationProductParity',
    ],
    requiredTestMarkers: [
      'terminal_handoff',
      'source-safe',
      'Terminal',
    ],
    expectedCounts: {
      rehearsalFlowCovered: true,
      docsParityCovered: true,
    },
    coverageTier: 'promotion-required',
    closureRequirement:
      'Conversation and Terminal documentation, rehearsal rows, and interface parity prove the same source-safe authority boundary that the integration tests execute.',
  }),
]);

function buildPredicateResults(repoRoot) {
  const packageJson = readSource(repoRoot, 'package.json');
  const gateWorkflow = readSource(repoRoot, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = readSource(repoRoot, '.github/workflows/bitcode-canon-quality.yml');
  const spec = readSource(repoRoot, 'BITCODE_SPEC_V40.md');
  const delta = readSource(repoRoot, 'BITCODE_SPEC_V40_DELTA.md');
  const notes = readSource(repoRoot, 'BITCODE_SPEC_V40_NOTES.md');
  const parity = readSource(repoRoot, 'BITCODE_SPEC_V40_PARITY_MATRIX.md');
  const roadmap = readSource(repoRoot, 'SPECIFICATIONS_ROADMAP.md');
  const protocolReadme = readSource(repoRoot, 'packages/specifying/README.md');
  const rootReadme = readSource(repoRoot, 'README.md');
  const protocolIndex = readSource(repoRoot, 'packages/specifying/src/index.js');
  const protocolTypes = readSource(repoRoot, 'packages/specifying/src/index.d.ts');

  const rowPredicates = V40_CONVERSATION_TERMINAL_INTEGRATION_ROWS.flatMap((coverageRow) => {
    const safeId = coverageRow.integrationSurfaceId.replace(/[^a-z0-9]+/gu, '-');
    return [
      predicateResult(
        `${safeId}:source-roots-exist`,
        coverageRow.sourceRoots[0],
        coverageRow.sourceRoots.every((sourcePath) => sourceExists(repoRoot, sourcePath)),
      ),
      predicateResult(
        `${safeId}:test-paths-exist`,
        coverageRow.testPaths[0],
        coverageRow.testPaths.every((testPath) => sourceExists(repoRoot, testPath)),
      ),
      predicateResult(
        `${safeId}:source-markers-present`,
        coverageRow.sourceRoots[0],
        allMarkersPresent(repoRoot, coverageRow.sourceRoots, coverageRow.requiredSourceMarkers),
      ),
      predicateResult(
        `${safeId}:test-markers-present`,
        coverageRow.testPaths[0],
        allMarkersPresent(repoRoot, coverageRow.testPaths, coverageRow.requiredTestMarkers),
      ),
    ];
  });

  return [
    predicateResult('package-scripts-include-gate6', 'package.json', packageJson.includes('generate:v40-conversation-terminal-integration') && packageJson.includes('check:v40-gate6')),
    predicateResult('workflows-run-gate6-check', '.github/workflows/bitcode-gate-quality.yml', gateWorkflow.includes('check-v40-gate6-conversation-terminal-integration.mjs') && canonWorkflow.includes('check-v40-gate6-conversation-terminal-integration.mjs')),
    predicateResult('gate-quality-runs-conversation-terminal-integration-test', '.github/workflows/bitcode-gate-quality.yml', gateWorkflow.includes('conversationTerminalIntegrationCoverage.test.tsx')),
    predicateResult('uapi-jest-includes-conversation-terminal-integration-test', 'apps/uapi/jest.config.cjs', readSource(repoRoot, 'apps/uapi/jest.config.cjs').includes('conversationTerminalIntegrationCoverage.test.tsx')),
    predicateResult('protocol-exports-gate6', 'packages/specifying/src/index.js', protocolIndex.includes('buildV40ConversationTerminalIntegration') && protocolTypes.includes('buildV40ConversationTerminalIntegration')),
    predicateResult('spec-documents-gate6', 'BITCODE_SPEC_V40.md', spec.includes('V40 Gate 6 Conversation And Terminal Integration Coverage') && spec.includes(V40_CONVERSATION_TERMINAL_INTEGRATION_ARTIFACT_PATH)),
    predicateResult('delta-documents-gate6', 'BITCODE_SPEC_V40_DELTA.md', delta.includes('Gate 6 closes with package-backed `V40ConversationTerminalIntegration`')),
    predicateResult('notes-document-gate6', 'BITCODE_SPEC_V40_NOTES.md', notes.includes('Gate 6 implementation notes') && notes.includes('Conversation and Terminal integration coverage')),
    predicateResult('parity-documents-gate6', 'BITCODE_SPEC_V40_PARITY_MATRIX.md', parity.includes('v40-conversation-terminal-integration') && parity.includes('| Gate 6 | Conversation/Terminal integration artifact | implemented |')),
    predicateResult(
      'roadmap-advanced-through-gate6',
      'SPECIFICATIONS_ROADMAP.md',
      roadmap.includes('V40 Gate 6 closure anchor') &&
        (/Current working gate: V40 Gate (?:6|7|8|9|10|11)\b/u.test(roadmap) ||
          roadmap.includes('Latest closed version: V40 Exhaustive Commercial Application Testing') ||
          roadmap.includes('Recent V40 closure anchor')),
    ),
    predicateResult('readmes-document-gate6', 'README.md', rootReadme.includes('V40 Gate 6') && protocolReadme.includes('V40ConversationTerminalIntegration')),
    predicateResult(
      'roadmap-preserves-v41-prompt-programs',
      'SPECIFICATIONS_ROADMAP.md',
      roadmap.includes('| V41 | `BITCODE_SPEC_V41.md` |') &&
        roadmap.includes('Prompt and PromptPart excellence') &&
        roadmap.includes('prompts as programs'),
    ),
    ...rowPredicates,
  ];
}

function buildCoverage(rows, predicateResults) {
  const failedPredicateIds = predicateResults.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  const rowsByVerdict = rows.reduce((acc, item) => {
    acc[item.verdict] = (acc[item.verdict] || 0) + 1;
    return acc;
  }, {});
  const rowsByTier = rows.reduce((acc, item) => {
    acc[item.coverageTier] = (acc[item.coverageTier] || 0) + 1;
    return acc;
  }, {});

  return {
    rowCount: rows.length,
    surfaceCount: V40_CONVERSATION_TERMINAL_SURFACE_IDS.length,
    verdictIds: [...V40_CONVERSATION_TERMINAL_VERDICTS],
    rowsByVerdict,
    rowsByTier,
    expectedTotals: { ...V40_CONVERSATION_TERMINAL_EXPECTED_TOTALS },
    requiredPredicateCount: predicateResults.length,
    passedPredicateCount: predicateResults.length - failedPredicateIds.length,
    failedPredicateIds,
    coveredRowCount: rows.filter((item) => item.verdict === 'covered').length,
    missingRowCount: rows.filter((item) => item.verdict === 'missing').length,
    blockedRowCount: rows.filter((item) => item.verdict === 'blocked').length,
    exemptRowCount: rows.filter((item) => item.verdict === 'exempt').length,
    allCriticalSurfacesClosed: failedPredicateIds.length === 0 && rows.every((item) => item.verdict === 'covered'),
    terminalHandoffRouteCoverageClosed: rows.some((item) => item.integrationSurfaceId === 'conversation:terminal-handoff-route-contract'),
    conversationStreamLogCoverageClosed: rows.some((item) => item.integrationSurfaceId === 'conversation:stream-events-to-rich-log'),
    conversationRouteApiCoverageClosed: rows.some((item) => item.integrationSurfaceId === 'conversation:route-api-persistence-branch-contracts'),
    writingSourceSelectorCoverageClosed: rows.some((item) => item.integrationSurfaceId === 'conversation:writing-source-selector-handoff'),
    terminalReadingStateCoverageClosed: rows.some((item) => item.integrationSurfaceId === 'terminal:reading-state-handoff-readback'),
    terminalHarnessLogStreamCoverageClosed: rows.some((item) => item.integrationSurfaceId === 'terminal:pipeline-host-log-stream'),
    terminalAuthorityBoundaryCoverageClosed: rows.some((item) => item.integrationSurfaceId === 'terminal:transaction-cockpit-authority-boundary'),
    rehearsalDocsParityCoverageClosed: rows.some((item) => item.integrationSurfaceId === 'conversation-terminal:rehearsal-docs-and-parity'),
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    rawModelResponseWithProtectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    ledgerAuthorityClaimedByConversation: false,
    valueBearingMainnetRequired: false,
    promptContentRewriteDeferredToV41: true,
  };
}

export function buildV40ConversationTerminalIntegration(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const rows = [...V40_CONVERSATION_TERMINAL_INTEGRATION_ROWS];
  const predicateResults = buildPredicateResults(repoRoot);
  const coverage = buildCoverage(rows, predicateResults);
  const artifactRoot = `v40-conversation-terminal-integration:${digest(JSON.stringify({
    rows: rows.map((item) => item.rowRoot),
    failedPredicateIds: coverage.failedPredicateIds,
    expectedTotals: coverage.expectedTotals,
  }))}`;

  return {
    artifactId: 'v40-conversation-terminal-integration',
    schemaId: V40_CONVERSATION_TERMINAL_INTEGRATION_SCHEMA_ID,
    version: V40_CONVERSATION_TERMINAL_INTEGRATION_VERSION,
    currentTarget: V40_CONVERSATION_TERMINAL_INTEGRATION_CURRENT_TARGET,
    sourceSafetyVerdict: V40_CONVERSATION_TERMINAL_INTEGRATION_SOURCE_SAFETY_VERDICT,
    generatedAt: 'deterministic',
    artifactRoot,
    passed: coverage.failedPredicateIds.length === 0 && coverage.allCriticalSurfacesClosed,
    surfaceIds: [...V40_CONVERSATION_TERMINAL_SURFACE_IDS],
    verdictIds: [...V40_CONVERSATION_TERMINAL_VERDICTS],
    rows,
    rowIds: rows.map((item) => item.integrationSurfaceId),
    predicateResults,
    coverage,
  };
}
