// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONVERSATION_TELEMETRY_PROOF_HOOKS_ARTIFACT_PATH =
  '.bitcode/v37-conversation-telemetry-proof-hooks.json';
export const CONVERSATION_TELEMETRY_PROOF_HOOKS_SCHEMA_ID =
  'bitcode.v37.conversationTelemetryProofHooks.v1';
export const CONVERSATION_TELEMETRY_PROOF_HOOKS_VERSION = 'V37';
export const CONVERSATION_TELEMETRY_PROOF_HOOKS_CURRENT_TARGET = 'V36';
export const CONVERSATION_TELEMETRY_PROOF_HOOKS_SOURCE_SAFETY_VERDICT =
  'source-safe-conversation-telemetry-proof-hooks-metadata';

export const CONVERSATION_TELEMETRY_EVENT_FAMILY_IDS = Object.freeze([
  'session',
  'message',
  'stream',
  'tool',
  'source_selector',
  'terminal_handoff',
  'retry',
  'error',
  'completion',
]);

export const CONVERSATION_TELEMETRY_REQUIRED_FIELD_IDS = Object.freeze([
  'event_id',
  'conversation_id',
  'message_id',
  'run_id',
  'source_selector_id',
  'terminal_transaction_id',
  'actor_id',
  'timestamp',
  'status',
  'event_family',
  'event_kind',
  'correlation_ids',
  'proof_roots',
  'redaction_posture',
  'visibility_tier',
  'dashboard_panel',
  'runbook_id',
  'source_safety_class',
]);

export const CONVERSATION_TELEMETRY_DASHBOARD_PANEL_IDS = Object.freeze([
  'conversation.dashboard.session-health',
  'conversation.dashboard.message-storage',
  'conversation.dashboard.stream-quality',
  'conversation.dashboard.tool-policy',
  'conversation.dashboard.source-policy',
  'conversation.dashboard.product-handoff',
  'conversation.dashboard.retry-recovery',
  'conversation.dashboard.error-recovery',
  'conversation.dashboard.completion-quality',
]);

export const CONVERSATION_TELEMETRY_RUNBOOK_IDS = Object.freeze([
  'runbook.conversation.session-repair',
  'runbook.conversation.message-redaction',
  'runbook.conversation.stream-debug',
  'runbook.conversation.tool-policy-denial',
  'runbook.conversation.source-selector-policy',
  'runbook.conversation.product-handoff-repair',
  'runbook.conversation.retry-loop',
  'runbook.conversation.error-recovery',
  'runbook.conversation.completion-repair',
]);

export const CONVERSATION_TELEMETRY_FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'protected_source_payloads',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'unpaid_assetpack_source',
  'settlement_private_payloads',
  'private_payment_credentials',
  'operator_private_notes',
  'ledger_write_authority',
  'wallet_signing_authority',
]);

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  Buffer.from('ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5', 'base64url').toString('utf8'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
]);

/**
 * @param {unknown} value
 * @returns {string}
 */
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
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
function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function root(value) {
  return digest(canonicalJson(value));
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
 * @param {readonly string[]} values
 * @param {readonly string[]} requiredValues
 * @returns {boolean}
 */
function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function includesSecretMarker(value) {
  return SECRET_MARKERS.some((marker) => value.includes(marker));
}

/**
 * @param {string} eventFamily
 * @param {{
 *   eventIds: string[];
 *   lifecycleStage: string;
 *   statusStates: string[];
 *   correlationIds: string[];
 *   proofRootFields: string[];
 *   dashboardPanel: string;
 *   runbookId: string;
 *   alertThreshold: string;
 *   sourceRoots: string[];
 *   publicDocsRefs: string[];
 *   operatorRunbookSteps: string[];
 * }} input
 */
function telemetryRow(eventFamily, input) {
  const rowSeed = {
    eventFamily,
    eventIds: input.eventIds,
    dashboardPanel: input.dashboardPanel,
    runbookId: input.runbookId,
  };

  return {
    eventFamily,
    eventIds: input.eventIds,
    lifecycleStage: input.lifecycleStage,
    statusStates: input.statusStates,
    sourceSafetyClass: 'source_safe_conversation_telemetry_metadata',
    redactionPosture: 'proof_roots_ids_counts_states_and_redacted_error_classes_only',
    allowedPayloadClasses: [
      'event_ids',
      'conversation_ids',
      'message_ids',
      'run_ids',
      'source_selector_refs',
      'terminal_transaction_refs',
      'state_enums',
      'counts',
      'proof_roots',
      'redacted_error_classes',
      'dashboard_panel_ids',
      'runbook_ids',
    ],
    forbiddenPayloadClasses: [...CONVERSATION_TELEMETRY_FORBIDDEN_PAYLOAD_CLASSES],
    requiredFields: [...CONVERSATION_TELEMETRY_REQUIRED_FIELD_IDS],
    correlationIds: input.correlationIds,
    proofRootFields: input.proofRootFields.includes('telemetryRoot')
      ? input.proofRootFields
      : [...input.proofRootFields, 'telemetryRoot'],
    dashboardPanel: input.dashboardPanel,
    runbookId: input.runbookId,
    alertThreshold: input.alertThreshold,
    publicDocsRefs: input.publicDocsRefs,
    operatorRunbookSteps: input.operatorRunbookSteps,
    sourceRoots: input.sourceRoots,
    hookRoot: `conversation-telemetry-hook:${root(rowSeed)}`,
    rowRoot: `conversation-telemetry-row:${digest(`${eventFamily}:${input.dashboardPanel}:${input.runbookId}`)}`,
  };
}

export const CONVERSATION_TELEMETRY_PROOF_HOOK_ROWS = Object.freeze([
  telemetryRow('session', {
    eventIds: ['conversation.session.created', 'conversation.session.restored', 'conversation.session.branched', 'conversation.session.deleted'],
    lifecycleStage: 'conversation_route_local_session_lifecycle',
    statusStates: ['created', 'restored', 'branched', 'deleted', 'repair_required'],
    correlationIds: ['conversationId', 'actorId', 'routeSessionId', 'historyRoot'],
    proofRootFields: ['conversationRoot', 'historyRoot', 'policyRoot', 'telemetryRoot'],
    dashboardPanel: 'conversation.dashboard.session-health',
    runbookId: 'runbook.conversation.session-repair',
    alertThreshold: 'missing_history_root_or_restore_failure_warning',
    sourceRoots: [
      'scripts/specifying/src/canonical/conversation-session-route-history.js',
      'packages/api/src/routes/conversations.ts',
      'apps/uapi/tests/api/conversationSessionRouteHistory.test.ts',
      '.docs/conversations.md',
    ],
    publicDocsRefs: ['.docs/conversations.md#route-local-history'],
    operatorRunbookSteps: [
      'inspect conversation id, route session id, and history proof root',
      'verify restore or branch route emitted source-safe metadata only',
      'repair by replaying source-safe session envelope and preserving tombstone proof for deletes',
    ],
  }),
  telemetryRow('message', {
    eventIds: ['conversation.message.persisted', 'conversation.message.redacted', 'conversation.message.exported', 'conversation.message.deleted'],
    lifecycleStage: 'conversation_message_storage_lifecycle',
    statusStates: ['persisted', 'redacted', 'exported', 'deleted', 'blocked'],
    correlationIds: ['conversationId', 'messageId', 'actorId', 'visibilityTier'],
    proofRootFields: ['messageRoot', 'redactionRoot', 'visibilityRoot', 'retentionRoot'],
    dashboardPanel: 'conversation.dashboard.message-storage',
    runbookId: 'runbook.conversation.message-redaction',
    alertThreshold: 'redaction_failure_or_visibility_escalation_critical',
    sourceRoots: [
      'scripts/specifying/src/canonical/conversation-persistence-privacy-redaction.js',
      'packages/api/src/conversations/privacy.ts',
      'packages/api/src/conversations/messages.ts',
      '.docs/BITCODE_CONVERSATIONS_TELEMETRY_RUNBOOK.md',
    ],
    publicDocsRefs: ['.docs/conversations.md#privacy-and-exports'],
    operatorRunbookSteps: [
      'inspect redaction proof root, visibility tier, and retention posture',
      'confirm stored message contains no protected prompt, source, secret, or unpaid AssetPack source',
      'repair by rewriting source-safe message projection or creating deletion tombstone proof',
    ],
  }),
  telemetryRow('stream', {
    eventIds: ['conversation.stream.started', 'conversation.stream.event_emitted', 'conversation.stream.completed', 'conversation.stream.aborted'],
    lifecycleStage: 'conversation_stream_lifecycle',
    statusStates: ['started', 'event_emitted', 'completed', 'aborted', 'repair_required'],
    correlationIds: ['conversationId', 'runId', 'eventId', 'sequence'],
    proofRootFields: ['eventRoot', 'conversationRoot', 'streamRoot', 'telemetryRoot'],
    dashboardPanel: 'conversation.dashboard.stream-quality',
    runbookId: 'runbook.conversation.stream-debug',
    alertThreshold: 'missing_completion_or_unsafe_stream_metadata_warning',
    sourceRoots: [
      'scripts/specifying/src/canonical/conversation-stream-event-contract.js',
      'packages/api/src/conversations/stream-events.ts',
      'apps/uapi/tests/conversationStreamPipelineLog.test.tsx',
      '.docs/BITCODE_CONVERSATIONS.md',
    ],
    publicDocsRefs: ['.docs/conversations.md#streaming-and-proof-roots'],
    operatorRunbookSteps: [
      'inspect event id, sequence, stream root, and redaction posture',
      'verify collapsed row and expanded metadata are source-safe',
      'repair orphaned stream by emitting redacted error or completion telemetry row',
    ],
  }),
  telemetryRow('tool', {
    eventIds: ['conversation.tool.admitted', 'conversation.tool.started', 'conversation.tool.completed', 'conversation.tool.denied'],
    lifecycleStage: 'conversation_tool_lifecycle',
    statusStates: ['admitted', 'started', 'completed', 'denied', 'failed'],
    correlationIds: ['conversationId', 'runId', 'toolCallId', 'policyRoot'],
    proofRootFields: ['toolInputRoot', 'toolOutputRoot', 'policyRoot', 'telemetryRoot'],
    dashboardPanel: 'conversation.dashboard.tool-policy',
    runbookId: 'runbook.conversation.tool-policy-denial',
    alertThreshold: 'tool_policy_denial_or_repeated_failure_warning',
    sourceRoots: [
      'packages/api/src/conversations/stream-events.ts',
      'apps/uapi/components/conversations/ConversationsOverlay/ConversationsOverlay.tsx',
      '.docs/BITCODE_AGENTIC_EXECUTION.md',
      '.docs/BITCODE_CONVERSATIONS_TELEMETRY_RUNBOOK.md',
    ],
    publicDocsRefs: ['.docs/conversations.md#tools-and-source-context'],
    operatorRunbookSteps: [
      'inspect tool call id, policy root, and redacted argument summary',
      'confirm provider tokens and protected source are absent from telemetry',
      'repair by updating policy denial copy and source-safe tool summary',
    ],
  }),
  telemetryRow('source_selector', {
    eventIds: ['conversation.source_selector.opened', 'conversation.source_selector.previewed', 'conversation.source_selector.allowed', 'conversation.source_selector.denied'],
    lifecycleStage: 'conversation_source_selector_lifecycle',
    statusStates: ['opened', 'previewed', 'allowed', 'denied', 'retry_required'],
    correlationIds: ['conversationId', 'sourceSelectorId', 'repositoryRef', 'policyRoot'],
    proofRootFields: ['selectorRoot', 'policyRoot', 'rightsRoot', 'telemetryRoot'],
    dashboardPanel: 'conversation.dashboard.source-policy',
    runbookId: 'runbook.conversation.source-selector-policy',
    alertThreshold: 'source_policy_denial_spike_warning',
    sourceRoots: [
      'scripts/specifying/src/canonical/conversation-source-selector.js',
      'apps/uapi/components/conversations/models/conversation-source-selector.ts',
      'apps/uapi/tests/conversationSourceSelector.test.tsx',
      '.docs/conversations.md',
    ],
    publicDocsRefs: ['.docs/conversations.md#source-selection'],
    operatorRunbookSteps: [
      'inspect selector kind, policy state, rights posture, and source-safe ref summary',
      'verify denied selectors do not include protected source samples',
      'repair policy metadata without escalating source visibility',
    ],
  }),
  telemetryRow('terminal_handoff', {
    eventIds: ['conversation.terminal_handoff.prepared', 'conversation.terminal_handoff.opened', 'conversation.terminal_handoff.blocked', 'conversation.terminal_handoff.completed'],
    lifecycleStage: 'conversation_terminal_handoff_lifecycle',
    statusStates: ['prepared', 'opened', 'blocked', 'completed', 'repair_required'],
    correlationIds: ['conversationId', 'transactionId', 'repositoryAnchor', 'handoffRoot'],
    proofRootFields: ['handoffRoot', 'terminalRouteRoot', 'policyRoot', 'telemetryRoot'],
    dashboardPanel: 'conversation.dashboard.product-handoff',
    runbookId: 'runbook.conversation.product-handoff-repair',
    alertThreshold: 'handoff_blocked_or_terminal_context_missing_warning',
    sourceRoots: [
      'scripts/specifying/src/canonical/conversation-product-handoff.js',
      'apps/uapi/components/conversations/models/conversation-product-handoff.ts',
      'apps/uapi/components/conversations/ConversationProductHandoff/ConversationProductHandoff.tsx',
      '.docs/BITCODE_OPERATOR_EXPERIENCE.md',
    ],
    publicDocsRefs: ['.docs/conversations.md#terminal-handoff'],
    operatorRunbookSteps: [
      'inspect handoff root, terminal route query, selected workflow, and policy state',
      'confirm the Packs remains the execution authority',
      'repair by recreating source-safe handoff context from conversation and selector refs',
    ],
  }),
  telemetryRow('retry', {
    eventIds: ['conversation.retry.requested', 'conversation.retry.admitted', 'conversation.retry.completed', 'conversation.retry.blocked'],
    lifecycleStage: 'conversation_retry_lifecycle',
    statusStates: ['requested', 'admitted', 'completed', 'blocked', 'loop_detected'],
    correlationIds: ['conversationId', 'messageId', 'retryRoot', 'historyRoot'],
    proofRootFields: ['retryRoot', 'historyRoot', 'policyRoot', 'telemetryRoot'],
    dashboardPanel: 'conversation.dashboard.retry-recovery',
    runbookId: 'runbook.conversation.retry-loop',
    alertThreshold: 'retry_loop_or_missing_history_warning',
    sourceRoots: [
      'scripts/specifying/src/canonical/conversation-session-route-history.js',
      'packages/api/src/routes/conversations.ts',
      'apps/uapi/components/conversations/ConversationsBranchMenuButton/ConversationsBranchMenuButton.tsx',
      '.docs/BITCODE_CONVERSATIONS_TELEMETRY_RUNBOOK.md',
    ],
    publicDocsRefs: ['.docs/conversations.md#retry-and-recovery'],
    operatorRunbookSteps: [
      'inspect retry root, source message id, and route-local history root',
      'block retry loops before model work repeats unsafe context',
      'repair by branching from the last source-safe checkpoint',
    ],
  }),
  telemetryRow('error', {
    eventIds: ['conversation.error.raised', 'conversation.error.redacted', 'conversation.error.recovered', 'conversation.error.escalated'],
    lifecycleStage: 'conversation_error_lifecycle',
    statusStates: ['raised', 'redacted', 'recovered', 'escalated', 'blocked'],
    correlationIds: ['conversationId', 'runId', 'errorClass', 'redactionRoot'],
    proofRootFields: ['errorRoot', 'redactionRoot', 'incidentRoot', 'telemetryRoot'],
    dashboardPanel: 'conversation.dashboard.error-recovery',
    runbookId: 'runbook.conversation.error-recovery',
    alertThreshold: 'unrecovered_error_or_raw_error_visibility_critical',
    sourceRoots: [
      'packages/api/src/conversations/privacy.ts',
      'packages/api/src/conversations/stream-events.ts',
      'apps/uapi/lib/bitcode-server-telemetry.ts',
      '.docs/BITCODE_CONVERSATIONS_TELEMETRY_RUNBOOK.md',
    ],
    publicDocsRefs: ['.docs/conversations.md#retry-and-recovery'],
    operatorRunbookSteps: [
      'inspect redacted error class, incident root, and affected conversation id',
      'confirm raw provider errors and protected payloads were not serialized',
      'repair by replaying source-safe error row and updating incident notes',
    ],
  }),
  telemetryRow('completion', {
    eventIds: ['conversation.completion.started', 'conversation.completion.persisted', 'conversation.completion.handoff_ready', 'conversation.completion.failed'],
    lifecycleStage: 'conversation_completion_lifecycle',
    statusStates: ['started', 'persisted', 'handoff_ready', 'failed', 'repair_required'],
    correlationIds: ['conversationId', 'messageId', 'runId', 'completionRoot'],
    proofRootFields: ['completionRoot', 'messageRoot', 'handoffRoot', 'telemetryRoot'],
    dashboardPanel: 'conversation.dashboard.completion-quality',
    runbookId: 'runbook.conversation.completion-repair',
    alertThreshold: 'missing_completion_or_unpersisted_assistant_message_warning',
    sourceRoots: [
      'scripts/specifying/src/canonical/conversation-stream-event-contract.js',
      'packages/api/src/conversations/messages.ts',
      'apps/uapi/components/conversations/ConversationsChat/ConversationsChat.tsx',
      '.docs/conversations.md',
    ],
    publicDocsRefs: ['.docs/conversations.md#streaming-and-proof-roots'],
    operatorRunbookSteps: [
      'inspect completion root, assistant message id, and handoff readiness state',
      'verify completion summary is source-safe and persisted under the correct visibility tier',
      'repair missing completion by emitting a redacted completion or error row',
    ],
  }),
]);

/**
 * @param {{
 *   version?: string,
 *   currentTarget?: string,
 *   generatedAt?: string,
 *   repoRoot?: string,
 * }} [input]
 */
export function buildConversationTelemetryProofHooks(input = {}) {
  const version = input.version || CONVERSATION_TELEMETRY_PROOF_HOOKS_VERSION;
  const currentTarget = input.currentTarget || CONVERSATION_TELEMETRY_PROOF_HOOKS_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');

  const rows = CONVERSATION_TELEMETRY_PROOF_HOOK_ROWS.map((row) => {
    const sourceEvidence = row.sourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));

    return {
      ...row,
      sourceEvidence,
      replayExpectation: {
        command: 'pnpm run check:v37-gate8',
        failClosedOn: [
          'missing_event_family',
          'missing_dashboard_panel',
          'missing_runbook',
          'missing_proof_root',
          'missing_source_root',
          'source_unsafe_payload',
        ],
      },
    };
  });

  const observedEventFamilies = rows.map((row) => row.eventFamily);
  const observedDashboardPanels = rows.map((row) => row.dashboardPanel);
  const observedRunbookIds = rows.map((row) => row.runbookId);
  const missingEventFamilies = CONVERSATION_TELEMETRY_EVENT_FAMILY_IDS.filter(
    (family) => !observedEventFamilies.includes(family),
  );
  const missingDashboardPanels = CONVERSATION_TELEMETRY_DASHBOARD_PANEL_IDS.filter(
    (panel) => !observedDashboardPanels.includes(panel),
  );
  const missingRunbookIds = CONVERSATION_TELEMETRY_RUNBOOK_IDS.filter(
    (runbook) => !observedRunbookIds.includes(runbook),
  );
  const missingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.eventFamily}:${entry.sourceRoot}`),
  );
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);
  const rowsMissingProofRoots = rows.filter((row) => row.proofRootFields.length === 0).map((row) => row.eventFamily);
  const rowsMissingRequiredFields = rows
    .filter((row) => !includesAll(row.requiredFields, CONVERSATION_TELEMETRY_REQUIRED_FIELD_IDS))
    .map((row) => row.eventFamily);
  const rowsMissingDocs = rows.filter((row) => row.publicDocsRefs.length === 0).map((row) => row.eventFamily);
  const rowsMissingRunbookSteps = rows.filter((row) => row.operatorRunbookSteps.length === 0).map((row) => row.eventFamily);

  const failures = [
    ...missingEventFamilies.map((family) => `missing conversation telemetry event family ${family}`),
    ...missingDashboardPanels.map((panel) => `missing conversation telemetry dashboard panel ${panel}`),
    ...missingRunbookIds.map((runbook) => `missing conversation telemetry runbook ${runbook}`),
    ...missingSourceRoots.map((sourceRoot) => `missing conversation telemetry source root ${sourceRoot}`),
    ...rowsMissingProofRoots.map((family) => `missing proof root fields for ${family}`),
    ...rowsMissingRequiredFields.map((family) => `missing required telemetry fields for ${family}`),
    ...rowsMissingDocs.map((family) => `missing public docs reference for ${family}`),
    ...rowsMissingRunbookSteps.map((family) => `missing runbook steps for ${family}`),
    ...(forbiddenMarkerDetected ? ['conversation telemetry proof hooks contain a secret-shaped marker'] : []),
  ];

  const coverage = {
    requiredEventFamilies: [...CONVERSATION_TELEMETRY_EVENT_FAMILY_IDS],
    observedEventFamilies,
    missingEventFamilies,
    eventFamilyCount: rows.length,
    requiredFieldCount: CONVERSATION_TELEMETRY_REQUIRED_FIELD_IDS.length,
    dashboardPanelCount: new Set(observedDashboardPanels).size,
    runbookCount: new Set(observedRunbookIds).size,
    totalEventIdCount: rows.reduce((count, row) => count + row.eventIds.length, 0),
    allRequiredFamiliesCovered: includesAll(observedEventFamilies, CONVERSATION_TELEMETRY_EVENT_FAMILY_IDS),
    allDashboardPanelsCovered: includesAll(observedDashboardPanels, CONVERSATION_TELEMETRY_DASHBOARD_PANEL_IDS),
    allRunbooksCovered: includesAll(observedRunbookIds, CONVERSATION_TELEMETRY_RUNBOOK_IDS),
    sessionTelemetryCovered: observedEventFamilies.includes('session'),
    messageTelemetryCovered: observedEventFamilies.includes('message'),
    streamTelemetryCovered: observedEventFamilies.includes('stream'),
    toolTelemetryCovered: observedEventFamilies.includes('tool'),
    sourceSelectorTelemetryCovered: observedEventFamilies.includes('source_selector'),
    terminalHandoffTelemetryCovered: observedEventFamilies.includes('terminal_handoff'),
    retryTelemetryCovered: observedEventFamilies.includes('retry'),
    errorTelemetryCovered: observedEventFamilies.includes('error'),
    completionTelemetryCovered: observedEventFamilies.includes('completion'),
    missingSourceRoots,
    rowsMissingProofRoots,
    rowsMissingRequiredFields,
    rowsMissingDocs,
    rowsMissingRunbookSteps,
    credentialsSerialized: forbiddenMarkerDetected,
    protectedPromptVisible: false,
    protectedModelResponseVisible: false,
    protectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
  };

  const artifactSeed = {
    version,
    currentTarget,
    rows,
    coverage,
    sourceSafetyVerdict: CONVERSATION_TELEMETRY_PROOF_HOOKS_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v37-conversation-telemetry-proof-hooks',
    schemaId: CONVERSATION_TELEMETRY_PROOF_HOOKS_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: CONVERSATION_TELEMETRY_PROOF_HOOKS_SOURCE_SAFETY_VERDICT,
    disclosureBoundary: {
      allowedTelemetryPayloadClasses: [
        'event_ids',
        'conversation_ids',
        'message_ids',
        'run_ids',
        'source_selector_refs',
        'terminal_transaction_refs',
        'counts',
        'state_enums',
        'proof_roots',
        'redacted_error_classes',
        'dashboard_panel_ids',
        'runbook_ids',
      ],
      forbiddenTelemetryPayloadClasses: [...CONVERSATION_TELEMETRY_FORBIDDEN_PAYLOAD_CLASSES],
      operatorRule:
        'Conversation telemetry may expose source-safe ids, counts, states, proof roots, dashboard ids, runbook ids, and redacted error classes only.',
    },
    passed: failures.length === 0,
    failures,
    coverage,
    requiredEventFamilies: [...CONVERSATION_TELEMETRY_EVENT_FAMILY_IDS],
    requiredFieldIds: [...CONVERSATION_TELEMETRY_REQUIRED_FIELD_IDS],
    requiredDashboardPanels: [...CONVERSATION_TELEMETRY_DASHBOARD_PANEL_IDS],
    requiredRunbookIds: [...CONVERSATION_TELEMETRY_RUNBOOK_IDS],
    forbiddenPayloadClasses: [...CONVERSATION_TELEMETRY_FORBIDDEN_PAYLOAD_CLASSES],
    rows,
    sourceEvidence: rows.map((row) => ({
      eventFamily: row.eventFamily,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `conversation-telemetry-proof-hooks:${root(artifactSeed)}`,
  };
}
