// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONVERSATION_REHEARSAL_ARTIFACT_PATH = '.bitcode/v37-conversation-rehearsal.json';
export const CONVERSATION_REHEARSAL_SCHEMA_ID = 'bitcode.v37.conversationRehearsal.v1';
export const CONVERSATION_REHEARSAL_VERSION = 'V37';
export const CONVERSATION_REHEARSAL_CURRENT_TARGET = 'V36';
export const CONVERSATION_REHEARSAL_SOURCE_SAFETY_VERDICT =
  'source-safe-conversation-rehearsal-metadata';

export const CONVERSATION_REHEARSAL_IDS = Object.freeze([
  'local_conversations_rehearsal',
  'staging_testnet_conversations_rehearsal',
  'stream_writing_selector_handoff_rehearsal',
  'persistence_privacy_redaction_rehearsal',
  'source_safe_screenshot_log_rehearsal',
  'value_bearing_mainnet_blocked_conversations_rehearsal',
]);

export const CONVERSATION_REHEARSAL_FLOW_IDS = Object.freeze([
  'chat',
  'streaming',
  'writing',
  'source_selector',
  'terminal_handoff',
  'restore',
  'retry',
  'redaction',
  'error',
]);

const CONVERSATION_REHEARSAL_PHASE_IDS = Object.freeze([
  'session_route_history',
  'stream_event_rendering',
  'writing_workspace_review',
  'source_selector_policy',
  'terminal_handoff_review',
  'persistence_privacy_redaction',
  'telemetry_proof_review',
  'source_safe_evidence_review',
]);

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  Buffer.from('ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5', 'base64url').toString('utf8'),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
]);

const FORBIDDEN_REHEARSAL_PAYLOAD = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'wallet_seed_phrase',
  'wallet_private_key',
  'protected_source_payloads',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'unpaid_assetpack_source',
  'settlement_private_payloads',
  'buyer_private_repository_payload',
  'private_payment_credentials',
  'operator_private_notes',
  'ledger_write_authority',
  'wallet_signing_authority',
]);

const ALLOWED_REHEARSAL_FIELDS = Object.freeze([
  'rehearsalId',
  'laneId',
  'flowIds',
  'phaseIds',
  'eventIds',
  'proofRoots',
  'routeUiChecks',
  'telemetryChecks',
  'screenshotOrLogRoots',
  'validationCommands',
  'summaryCounts',
  'sourceSafetyClass',
]);

const SHARED_SOURCE_ROOTS = Object.freeze([
  'BITCODE_SPEC_V37.md',
  'BITCODE_SPEC_V37_DELTA.md',
  'BITCODE_SPEC_V37_NOTES.md',
  'BITCODE_SPEC_V37_PARITY_MATRIX.md',
  'SPECIFICATIONS_ROADMAP.md',
  '.bitcode/v37-conversation-session-route-history.json',
  '.bitcode/v37-conversation-stream-event-contract.json',
  '.bitcode/v37-conversation-writing-workspace.json',
  '.bitcode/v37-conversation-source-selector.json',
  '.bitcode/v37-conversation-terminal-handoff.json',
  '.bitcode/v37-conversation-persistence-privacy-redaction.json',
  '.bitcode/v37-conversation-telemetry-proof-hooks.json',
]);

const rehearsalRows = Object.freeze([
  row({
    rehearsalId: 'local_conversations_rehearsal',
    laneId: 'local',
    title: 'Local Conversations rehearsal',
    purpose:
      'Exercise Website Conversations locally across chat, streaming, writing, source selection, Terminal handoff, restore, retry, redaction, and error flows.',
    phaseIds: CONVERSATION_REHEARSAL_PHASE_IDS,
    flowIds: CONVERSATION_REHEARSAL_FLOW_IDS,
    sourceRoots: [
      'apps/uapi/components/conversations/ConversationsOverlay/ConversationsOverlay.tsx',
      'apps/uapi/components/conversations/ConversationsChat/ConversationsChat.tsx',
      'apps/uapi/hooks/useConversationStream.ts',
      'apps/uapi/tests/conversationStreamPipelineLog.test.tsx',
      'apps/uapi/tests/conversationWritingWorkspace.test.tsx',
      'apps/uapi/tests/conversationSourceSelector.test.tsx',
      'apps/uapi/components/conversations/ConversationTerminalHandoff/ConversationTerminalHandoff.tsx',
    ],
    routeUiChecks: [
      'local.conversation.route-history-restored.root',
      'local.conversation.stream-log-collapsed-readable.root',
      'local.conversation.fullscreen-writing-workspace-accessible.root',
      'local.conversation.source-selector-policy-preview.root',
      'local.conversation.terminal-handoff-source-safe.root',
    ],
    telemetryChecks: [
      'local.conversation.session.telemetry-root',
      'local.conversation.stream.telemetry-root',
      'local.conversation.retry-error.telemetry-root',
    ],
    screenshotOrLogRoots: [
      'local-conversation-chat-stream-redacted-log-root',
      'local-conversation-writing-selector-handoff-redacted-screenshot-root',
    ],
    validationCommands: [
      'pnpm run check:v37-gate2',
      'pnpm run check:v37-gate3',
      'pnpm run check:v37-gate4',
      'pnpm run check:v37-gate5',
      'pnpm run check:v37-gate6',
      'pnpm run check:v37-gate7',
      'pnpm run check:v37-gate8',
    ],
    valueBearingMainnetAdmission: false,
  }),
  row({
    rehearsalId: 'staging_testnet_conversations_rehearsal',
    laneId: 'staging-testnet',
    title: 'Staging-testnet Conversations rehearsal',
    purpose:
      'Exercise Website Conversations against staging-testnet posture with source-safe telemetry, route restoration, and Terminal handoff evidence.',
    phaseIds: CONVERSATION_REHEARSAL_PHASE_IDS,
    flowIds: CONVERSATION_REHEARSAL_FLOW_IDS,
    sourceRoots: [
      'packages/api/src/routes/conversations.ts',
      'packages/api/src/conversations/messages.ts',
      'packages/api/src/conversations/privacy.ts',
      'packages/api/src/conversations/stream-events.ts',
      'packages/api/src/conversations/telemetry.ts',
      'apps/uapi/app/conversations/README.md',
      'internal-docs/BITCODE_CONVERSATIONS_TELEMETRY_RUNBOOK.md',
    ],
    routeUiChecks: [
      'staging-testnet.conversation.api-create-restore-branch-retry.root',
      'staging-testnet.conversation.sse-stream-event-contract.root',
      'staging-testnet.conversation.redaction-storage-roundtrip.root',
      'staging-testnet.conversation.terminal-route-handoff-root',
    ],
    telemetryChecks: [
      'staging-testnet.conversation.dashboard-session-health.root',
      'staging-testnet.conversation.dashboard-stream-quality.root',
      'staging-testnet.conversation.dashboard-error-recovery.root',
    ],
    screenshotOrLogRoots: [
      'staging-testnet-conversation-chat-stream-redacted-log-root',
      'staging-testnet-conversation-restore-retry-error-redacted-screenshot-root',
    ],
    validationCommands: [
      'pnpm --filter @bitcode/api exec jest --config jest.config.cjs --runTestsByPath src/conversations/__tests__/privacy.test.ts src/conversations/__tests__/stream-events.test.ts src/conversations/__tests__/telemetry.test.ts --runInBand --forceExit',
      'pnpm --dir apps/uapi exec jest tests/api/conversationSessionRouteHistory.test.ts tests/api/conversationTelemetryProofHooks.test.ts --runInBand',
    ],
    valueBearingMainnetAdmission: false,
  }),
  row({
    rehearsalId: 'stream_writing_selector_handoff_rehearsal',
    laneId: 'local',
    title: 'Stream, writing, source selector, and handoff rehearsal',
    purpose:
      'Prove the user-visible path from chat stream to writing workspace, source selector, and Terminal handoff without crossing source or ledger authority boundaries.',
    phaseIds: [
      'stream_event_rendering',
      'writing_workspace_review',
      'source_selector_policy',
      'terminal_handoff_review',
      'source_safe_evidence_review',
    ],
    flowIds: ['streaming', 'writing', 'source_selector', 'terminal_handoff', 'retry', 'error'],
    sourceRoots: [
      'apps/uapi/components/conversations/ConversationWritingWorkspace/ConversationWritingWorkspace.tsx',
      'apps/uapi/components/conversations/ConversationSourceSelector/ConversationSourceSelector.tsx',
      'apps/uapi/components/conversations/ConversationTerminalHandoff/ConversationTerminalHandoff.tsx',
      'apps/uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
      'apps/uapi/components/bitcode/pipeline/pipeline-execution-log-header.tsx',
    ],
    routeUiChecks: [
      'conversation.stream-row-expanded-metadata-source-safe.root',
      'conversation.workspace-handoff-summary-redacted.root',
      'conversation.selector-denied-retry-required-visible.root',
      'conversation.terminal-handoff-no-ledger-authority.root',
    ],
    telemetryChecks: [
      'conversation.stream.telemetry-dashboard-bound.root',
      'conversation.source-selector.telemetry-dashboard-bound.root',
      'conversation.terminal-handoff.telemetry-dashboard-bound.root',
    ],
    screenshotOrLogRoots: ['conversation-stream-writing-selector-handoff-redacted-log-root'],
    validationCommands: [
      'pnpm --dir apps/uapi exec jest tests/conversationStreamPipelineLog.test.tsx tests/conversationWritingWorkspace.test.tsx tests/conversationSourceSelector.test.tsx tests/conversationTerminalHandoff.test.tsx --runInBand',
    ],
    valueBearingMainnetAdmission: false,
  }),
  row({
    rehearsalId: 'persistence_privacy_redaction_rehearsal',
    laneId: 'local',
    title: 'Persistence, privacy, and redaction rehearsal',
    purpose:
      'Prove restore, retry, export, delete, retention, replay, incident repair, redaction, and source-safe visibility boundaries for conversation storage.',
    phaseIds: ['session_route_history', 'persistence_privacy_redaction', 'telemetry_proof_review'],
    flowIds: ['chat', 'restore', 'retry', 'redaction', 'error'],
    sourceRoots: [
      'packages/api/src/conversations/privacy.ts',
      'packages/api/src/conversations/messages.ts',
      'packages/api/src/routes/conversations.ts',
      'packages/api/src/conversations/__tests__/privacy.test.ts',
      'apps/uapi/components/conversations/ConversationPersistencePrivacyPanel/ConversationPersistencePrivacyPanel.tsx',
      'apps/uapi/tests/conversationPersistencePrivacyPanel.test.tsx',
    ],
    routeUiChecks: [
      'conversation.persistence.export-source-safe-visible-tier.root',
      'conversation.persistence.delete-tombstone-proof.root',
      'conversation.persistence.restore-route-local-history.root',
      'conversation.persistence.incident-repair-redaction-verdict.root',
    ],
    telemetryChecks: [
      'conversation.message-storage.redaction-dashboard-bound.root',
      'conversation.error-recovery.redaction-dashboard-bound.root',
    ],
    screenshotOrLogRoots: ['conversation-persistence-privacy-redaction-redacted-log-root'],
    validationCommands: [
      'pnpm --filter @bitcode/api exec jest --config jest.config.cjs --runTestsByPath src/conversations/__tests__/privacy.test.ts --runInBand --forceExit',
      'pnpm --dir apps/uapi exec jest tests/conversationPersistencePrivacyPanel.test.tsx --runInBand',
    ],
    valueBearingMainnetAdmission: false,
  }),
  row({
    rehearsalId: 'source_safe_screenshot_log_rehearsal',
    laneId: 'local',
    title: 'Source-safe screenshot and log rehearsal',
    purpose:
      'Review Conversations screenshots, stream rows, metadata accordions, telemetry panels, and generated proof roots without protected source, prompts, model responses, or unpaid AssetPack source.',
    phaseIds: ['stream_event_rendering', 'telemetry_proof_review', 'source_safe_evidence_review'],
    flowIds: ['streaming', 'source_selector', 'terminal_handoff', 'redaction', 'error'],
    sourceRoots: [
      'apps/uapi/components/conversations/ConversationTelemetryProofPanel/ConversationTelemetryProofPanel.tsx',
      'apps/uapi/components/conversations/models/conversation-telemetry-proof-hooks.ts',
      'apps/uapi/tests/conversationTelemetryProofPanel.test.tsx',
      'docs/conversations.md',
      'internal-docs/BITCODE_CONVERSATIONS_TELEMETRY_RUNBOOK.md',
    ],
    routeUiChecks: [
      'conversation.telemetry-proof-panel-source-safe.root',
      'conversation.stream-expanded-metadata-redacted.root',
      'conversation.screenshot-log-proof-root-reviewed.root',
    ],
    telemetryChecks: [
      'conversation.dashboard.session-health.bound.root',
      'conversation.dashboard.stream-quality.bound.root',
      'conversation.dashboard.completion-quality.bound.root',
    ],
    screenshotOrLogRoots: [
      'conversation-collapsed-status-redacted-screenshot-root',
      'conversation-expanded-metadata-redacted-log-root',
    ],
    validationCommands: [
      'pnpm run check:v37-gate8',
      'pnpm --dir apps/uapi exec jest tests/conversationTelemetryProofPanel.test.tsx tests/conversationStreamPipelineLog.test.tsx --runInBand',
    ],
    valueBearingMainnetAdmission: false,
  }),
  row({
    rehearsalId: 'value_bearing_mainnet_blocked_conversations_rehearsal',
    laneId: 'value-bearing-mainnet',
    title: 'Value-bearing mainnet blocked Conversations rehearsal',
    purpose:
      'Make the blocked value-bearing mainnet boundary visible for every Conversations handoff while preserving local and staging-testnet rehearsal paths.',
    phaseIds: ['terminal_handoff_review', 'source_safe_evidence_review', 'telemetry_proof_review'],
    flowIds: CONVERSATION_REHEARSAL_FLOW_IDS,
    sourceRoots: [
      'BITCODE_SPEC_V37.md',
      'packages/specifying/src/canonical/conversation-terminal-handoff.js',
      'packages/specifying/src/canonical/conversation-telemetry-proof-hooks.js',
      'apps/uapi/components/conversations/ConversationTerminalHandoff/ConversationTerminalHandoff.tsx',
    ],
    routeUiChecks: [
      'value-bearing-mainnet.conversation.non-admission.root',
      'value-bearing-mainnet.conversation.no-wallet-signing.root',
      'value-bearing-mainnet.conversation.no-ledger-write.root',
      'value-bearing-mainnet.conversation.no-source-unlock.root',
    ],
    telemetryChecks: [
      'value-bearing-mainnet.conversation.blocked-runbook-bound.root',
      'value-bearing-mainnet.conversation.blocked-dashboard-bound.root',
    ],
    screenshotOrLogRoots: ['value-bearing-mainnet-conversation-blocked-redacted-log-root'],
    validationCommands: ['pnpm run check:v37-gate6', 'pnpm run check:v37-gate8'],
    valueBearingMainnetAdmission: false,
  }),
]);

export const CONVERSATION_REHEARSAL_ROWS = rehearsalRows;

/**
 * @param {{
 *   rehearsalId: string,
 *   laneId: string,
 *   title: string,
 *   purpose: string,
 *   phaseIds: readonly string[],
 *   flowIds: readonly string[],
 *   sourceRoots: readonly string[],
 *   routeUiChecks: readonly string[],
 *   telemetryChecks: readonly string[],
 *   screenshotOrLogRoots: readonly string[],
 *   validationCommands: readonly string[],
 *   valueBearingMainnetAdmission: boolean,
 * }} input
 */
function row(input) {
  const eventIds = input.flowIds.map((flowId) => `conversation.${input.laneId}.${flowId}.rehearsed`);
  const proofRoots = {
    flowRoot: prefixedRoot('conversation-rehearsal-flow', {
      rehearsalId: input.rehearsalId,
      flowIds: input.flowIds,
    }),
    routeUiRoot: prefixedRoot('conversation-rehearsal-route-ui', input.routeUiChecks),
    telemetryRoot: prefixedRoot('conversation-rehearsal-telemetry', input.telemetryChecks),
    sourceSafetyRoot: prefixedRoot('conversation-rehearsal-source-safety', input.screenshotOrLogRoots),
  };

  return {
    ...input,
    canonicalObject: 'ConversationRehearsal',
    sourceRoots: [...SHARED_SOURCE_ROOTS, ...input.sourceRoots],
    eventIds,
    proofRoots,
    proofRootFields: Object.keys(proofRoots).sort(),
    allowedPayloadFields: ALLOWED_REHEARSAL_FIELDS,
    forbiddenPayloadFields: FORBIDDEN_REHEARSAL_PAYLOAD,
    sourceSafetyClass: CONVERSATION_REHEARSAL_SOURCE_SAFETY_VERDICT,
    sourceSafetyRule:
      'Conversation rehearsal evidence may expose source-safe ids, event ids, proof roots, lane ids, flow ids, validation commands, screenshot/log roots, and summary counts only.',
    failClosedResult:
      input.laneId === 'value-bearing-mainnet'
        ? `${input.rehearsalId} remains blocked until future canon explicitly admits value-bearing mainnet conversation settlement or source unlock`
        : `${input.rehearsalId} blocks when flow coverage, route/UI checks, telemetry checks, source-safe logs, validation commands, proof roots, or source evidence are incomplete`,
  };
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalJson(entry)).join(',')}]`;
  const record = /** @type {Record<string, unknown>} */ (value);
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(',')}}`;
}

/**
 * @param {string} value
 * @returns {string}
 */
function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

/**
 * @param {string} prefix
 * @param {unknown} value
 * @returns {string}
 */
function prefixedRoot(prefix, value) {
  return `${prefix}:${sha256(canonicalJson(value)).slice(0, 24)}`;
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function includesSecretMarker(value) {
  return SECRET_MARKERS.some((marker) => value.includes(marker));
}

/**
 * @param {string} repoRoot
 * @param {string} relativePath
 * @returns {boolean}
 */
function sourceRootExists(repoRoot, relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

/**
 * @param {ReadonlyArray<string>} values
 * @param {ReadonlyArray<string>} requiredValues
 * @returns {boolean}
 */
function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
}

/**
 * @param {{
 *   version?: string,
 *   currentTarget?: string,
 *   generatedAt?: string,
 *   repoRoot?: string,
 * }} [input]
 */
export function buildConversationRehearsal(input = {}) {
  const version = input.version || CONVERSATION_REHEARSAL_VERSION;
  const currentTarget = input.currentTarget || CONVERSATION_REHEARSAL_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const rows = rehearsalRows.map((sourceRow) => {
    const sourceEvidence = sourceRow.sourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const rowWithoutRoot = {
      ...sourceRow,
      sourceEvidence,
      replayExpectation: {
        command: 'pnpm run check:v37-conversation-rehearsal',
        failClosedOn: [
          'missing_rehearsal',
          'missing_local_lane',
          'missing_staging_testnet_lane',
          'missing_conversation_flow',
          'missing_route_ui_check',
          'missing_telemetry_check',
          'missing_source_safe_log_root',
          'value_bearing_mainnet_unblocked',
          'source_unsafe_rehearsal_payload',
        ],
      },
    };

    return {
      ...rowWithoutRoot,
      rehearsalRoot: `conversation-rehearsal-row:${sha256(sourceRow.rehearsalId + canonicalJson(rowWithoutRoot)).slice(0, 24)}`,
    };
  });

  const observedRehearsalIds = rows.map((row) => row.rehearsalId);
  const missingRehearsalIds = CONVERSATION_REHEARSAL_IDS.filter((id) => !observedRehearsalIds.includes(id));
  const observedLaneIds = Array.from(new Set(rows.map((row) => row.laneId))).sort();
  const observedFlowIds = Array.from(new Set(rows.flatMap((row) => row.flowIds))).sort();
  const observedPhaseIds = Array.from(new Set(rows.flatMap((row) => row.phaseIds))).sort();
  const localRows = rows.filter((row) => row.laneId === 'local');
  const stagingRows = rows.filter((row) => row.laneId === 'staging-testnet');
  const valueBearingRows = rows.filter((row) => row.laneId === 'value-bearing-mainnet');
  const missingFlowIds = CONVERSATION_REHEARSAL_FLOW_IDS.filter((flowId) => !observedFlowIds.includes(flowId));
  const missingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.rehearsalId}:${entry.sourceRoot}`),
  );
  const rowsMissingFlowIds = rows
    .filter((row) => row.laneId !== 'value-bearing-mainnet' && row.flowIds.length === 0)
    .map((row) => row.rehearsalId);
  const rowsMissingProofRoots = rows
    .filter((row) => row.proofRootFields.length === 0 || row.proofRootFields.some((field) => typeof row.proofRoots[field] !== 'string'))
    .map((row) => row.rehearsalId);
  const rowsMissingRouteUiChecks = rows
    .filter((row) => row.routeUiChecks.length === 0)
    .map((row) => row.rehearsalId);
  const rowsMissingTelemetryChecks = rows
    .filter((row) => row.telemetryChecks.length === 0)
    .map((row) => row.rehearsalId);
  const rowsMissingSourceSafeLogs = rows
    .filter((row) => row.screenshotOrLogRoots.length === 0)
    .map((row) => row.rehearsalId);
  const rowsMissingValidationCommands = rows
    .filter((row) => row.validationCommands.length === 0)
    .map((row) => row.rehearsalId);
  const valueBearingUnblockedRows = valueBearingRows
    .filter((row) => row.valueBearingMainnetAdmission !== false)
    .map((row) => row.rehearsalId);
  const serializedRows = canonicalJson(rows);
  const credentialsSerialized = includesSecretMarker(serializedRows);
  const localAllFlowsCovered = localRows.some((row) => includesAll(row.flowIds, CONVERSATION_REHEARSAL_FLOW_IDS));
  const stagingAllFlowsCovered = stagingRows.some((row) => includesAll(row.flowIds, CONVERSATION_REHEARSAL_FLOW_IDS));

  const failures = [
    ...missingRehearsalIds.map((id) => `missing conversation rehearsal ${id}`),
    ...missingFlowIds.map((id) => `missing conversation rehearsal flow ${id}`),
    ...missingSourceRoots.map((sourceRoot) => `missing conversation rehearsal source root ${sourceRoot}`),
    ...rowsMissingFlowIds.map((id) => `missing flow ids for ${id}`),
    ...rowsMissingProofRoots.map((id) => `missing proof roots for ${id}`),
    ...rowsMissingRouteUiChecks.map((id) => `missing route/UI checks for ${id}`),
    ...rowsMissingTelemetryChecks.map((id) => `missing telemetry checks for ${id}`),
    ...rowsMissingSourceSafeLogs.map((id) => `missing source-safe screenshot/log roots for ${id}`),
    ...rowsMissingValidationCommands.map((id) => `missing validation commands for ${id}`),
    ...valueBearingUnblockedRows.map((id) => `value-bearing mainnet is not blocked for ${id}`),
    ...(localAllFlowsCovered ? [] : ['local Conversations rehearsal does not cover every required flow']),
    ...(stagingAllFlowsCovered ? [] : ['staging-testnet Conversations rehearsal does not cover every required flow']),
    ...(credentialsSerialized ? ['Conversations rehearsal contains a secret-shaped marker'] : []),
  ];

  const flowCoverage = Object.fromEntries(
    CONVERSATION_REHEARSAL_FLOW_IDS.map((flowId) => [`${flowId}FlowCovered`, observedFlowIds.includes(flowId)]),
  );
  const coverage = {
    requiredRehearsalIds: [...CONVERSATION_REHEARSAL_IDS],
    observedRehearsalIds,
    missingRehearsalIds,
    requiredFlowIds: [...CONVERSATION_REHEARSAL_FLOW_IDS],
    observedFlowIds,
    missingFlowIds,
    observedLaneIds,
    observedPhaseIds,
    rehearsalCount: rows.length,
    allRequiredRehearsalsCovered: includesAll(observedRehearsalIds, CONVERSATION_REHEARSAL_IDS),
    allConversationFlowsCovered: includesAll(observedFlowIds, CONVERSATION_REHEARSAL_FLOW_IDS),
    localRehearsalCovered: observedLaneIds.includes('local') && localAllFlowsCovered,
    stagingTestnetRehearsalCovered: observedLaneIds.includes('staging-testnet') && stagingAllFlowsCovered,
    routeUiChecksVisible: rows.every((row) => row.routeUiChecks.length > 0),
    telemetryChecksVisible: rows.every((row) => row.telemetryChecks.length > 0),
    sourceSafeLogsCovered: rows.every((row) => row.screenshotOrLogRoots.length > 0),
    valueBearingMainnetVisibleAndBlocked:
      observedLaneIds.includes('value-bearing-mainnet') && valueBearingRows.length > 0 && valueBearingUnblockedRows.length === 0,
    rowsMissingFlowIds,
    rowsMissingProofRoots,
    rowsMissingRouteUiChecks,
    rowsMissingTelemetryChecks,
    rowsMissingSourceSafeLogs,
    rowsMissingValidationCommands,
    valueBearingUnblockedRows,
    missingSourceRoots,
    credentialsSerialized,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawModelResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
    privatePaymentCredentialsVisible: false,
    settlementPrivatePayloadVisible: false,
    ledgerWriteAuthorityVisible: false,
    walletSigningAuthorityVisible: false,
    ...flowCoverage,
  };

  const artifactSeed = {
    version,
    currentTarget,
    rows,
    coverage,
    sourceSafetyVerdict: CONVERSATION_REHEARSAL_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v37-conversation-rehearsal',
    schemaId: CONVERSATION_REHEARSAL_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: CONVERSATION_REHEARSAL_SOURCE_SAFETY_VERDICT,
    disclosureBoundary: {
      allowedRehearsalFields: [...ALLOWED_REHEARSAL_FIELDS],
      forbiddenRehearsalPayload: [...FORBIDDEN_REHEARSAL_PAYLOAD],
      rehearsalRule:
        'Local and staging-testnet Conversations rehearsal evidence may expose source-safe ids, proof roots, flow ids, validation commands, screenshot/log roots, and summary counts only; it must not expose secrets, protected source, raw protected prompts, protected model responses, unpaid AssetPack source, wallet private material, settlement private payloads, or ledger/wallet authority.',
    },
    lanePosture: {
      local: 'developer_workstation_source_safe_conversations_rehearsal',
      stagingTestnet: 'full_stack_non_value_conversations_testnet_rehearsal',
      mainnetReadyDryRun: 'watch_only_dry_run_without_value_bearing_unlock',
      valueBearingMainnet: 'blocked_future_canon_required',
    },
    rows,
    coverage,
    sourceEvidence: rows.map((row) => ({
      rehearsalId: row.rehearsalId,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `conversation-rehearsal:${sha256(canonicalJson(artifactSeed)).slice(0, 24)}`,
    passed: failures.length === 0,
    failures,
    validationCommand: 'pnpm run check:v37-gate9',
  };
}
