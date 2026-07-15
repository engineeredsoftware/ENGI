// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONVERSATION_SESSION_ROUTE_HISTORY_ARTIFACT_PATH = '.bitcode/v37-conversation-session-route-history.json';
export const CONVERSATION_SESSION_ROUTE_HISTORY_SCHEMA_ID = 'bitcode.v37.conversationSessionRouteHistory.v1';
export const CONVERSATION_SESSION_ROUTE_HISTORY_VERSION = 'V37';
export const CONVERSATION_SESSION_ROUTE_HISTORY_CURRENT_TARGET = 'V36';
export const CONVERSATION_SESSION_ROUTE_HISTORY_SOURCE_SAFETY_VERDICT =
  'source-safe-conversation-session-route-history-metadata';

export const CONVERSATION_SESSION_FIELD_IDS = Object.freeze([
  'route_local_session_id',
  'user_account_posture',
  'source_context_ref',
  'policy_decision',
  'stream_state',
  'history_refs',
  'proof_roots',
  'event_ids',
  'redaction_posture',
  'persistence_boundary',
]);

export const CONVERSATION_HISTORY_OPERATION_IDS = Object.freeze([
  'create',
  'restore',
  'branch',
  'retry',
  'redact',
  'stream',
]);

export const CONVERSATION_SESSION_ROUTE_IDS = Object.freeze([
  'api.conversations.collection',
  'api.conversations.session',
  'api.conversations.collection_stream',
  'api.conversations.session_stream',
  'api.conversations.branch',
  'api.conversations.shared_contracts',
]);

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
]);

const FORBIDDEN_CONVERSATION_PAYLOAD = Object.freeze([
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

const SHARED_FAIL_CLOSED_REASONS = Object.freeze([
  'missing_conversation_id',
  'missing_user_account_posture',
  'missing_policy_decision',
  'missing_route_local_history_ref',
  'missing_proof_root',
  'missing_event_id',
  'protected_source_visible',
  'unpaid_assetpack_source_visible',
  'global_ledger_authority_claimed',
]);

/**
 * @param {string} sectionId
 * @param {string} value
 * @param {string} sourceSafetyClass
 */
function detailSection(sectionId, value, sourceSafetyClass = 'source_safe_conversation_metadata') {
  return {
    sectionId,
    value,
    sourceSafetyClass,
  };
}

/**
 * @param {string} contractId
 * @param {string} pathValue
 * @param {string} sourceRoot
 * @param {string} method
 */
function routeContract(contractId, pathValue, sourceRoot, method) {
  return {
    contractId,
    path: pathValue,
    method,
    sourceRoot,
    runtime: 'nodejs',
    sourceSafetyClass: 'source_safe_route_contract_metadata',
  };
}

const routeHistoryRows = Object.freeze([
  {
    contractId: 'conversation.session.create',
    routeId: 'api.conversations.collection',
    operationId: 'create',
    label: 'Create route-local conversation session',
    routeContract: routeContract(
      'api.conversations.collection',
      '/api/conversations',
      'apps/uapi/app/api/conversations/route.ts',
      'POST',
    ),
    sourceSafeSummary:
      'Creates a route-local ConversationSession projection with account posture, policy result, and proof-rooted history references.',
    routeLocalIdentity: {
      sessionIdRef: 'conversation-session:created-route-local',
      identityScope: 'route_local_not_global_ledger_truth',
      routeLocalHistoryRef: 'conversation-history:create',
    },
    userAccountPosture: 'authenticated_or_mock_review_user_only',
    sourceContext: {
      sourceContextRef: 'conversation-source-context:initial-user-message-and-safe-selectors',
      disclosureClass: 'source_safe_prompt_summary_and_selector_metadata_only',
    },
    policyDecision: {
      decision: 'admit_source_safe_conversation_session',
      denialReason: null,
      retryAllowed: true,
    },
    streamState: 'not_started',
    historyRefs: ['conversation-history:create'],
    persistenceBoundary: {
      storageScope: 'conversations_and_messages_projection',
      routeLocalHistory: true,
      globalLedgerTruth: false,
      terminalAuthorityRequiredForLedgerWork: true,
    },
    proofRootFields: ['sessionRoot', 'accountRoot', 'policyRoot', 'historyRoot', 'telemetryRoot'],
    eventIds: ['conversation.session.created', 'conversation.history.created'],
    detailPayload: {
      collapsedHeaderFields: ['contractId', 'routeId', 'operationId', 'sourceSafeSummary'],
      expandedDetailSections: [
        detailSection('route_local_identity', 'Session identity is local to the route and not a ledger object.'),
        detailSection('account_posture', 'Authenticated account or explicit mock-review posture is required.'),
        detailSection('source_context', 'Initial source context is limited to source-safe summaries and selector metadata.'),
        detailSection('policy_decision', 'Policy admits or denies the session before history is persisted.'),
        detailSection('stream_state', 'Create does not imply an active model stream.'),
        detailSection('history_refs', 'Create history references are replayable without protected source.'),
        detailSection('proof_roots', 'Session, account, policy, history, and telemetry roots are required.'),
        detailSection('persistence_boundary', 'Conversation storage is a projection, not global ledger truth.'),
        detailSection('redaction_posture', 'Protected prompts, source payloads, secrets, and unpaid AssetPack source are forbidden.'),
      ],
    },
  },
  {
    contractId: 'conversation.session.restore',
    routeId: 'api.conversations.session',
    operationId: 'restore',
    label: 'Restore route-local conversation history',
    routeContract: routeContract(
      'api.conversations.session',
      '/api/conversations/[conversationId]',
      'apps/uapi/app/api/conversations/[conversationId]/route.ts',
      'GET',
    ),
    sourceSafeSummary:
      'Restores a ConversationSession and message history projection for the owning account without upgrading it into ledger truth.',
    routeLocalIdentity: {
      sessionIdRef: 'conversation-session:restored-route-local',
      identityScope: 'route_local_not_global_ledger_truth',
      routeLocalHistoryRef: 'conversation-history:restore',
    },
    userAccountPosture: 'authenticated_owner_required',
    sourceContext: {
      sourceContextRef: 'conversation-source-context:stored-source-safe-message-history',
      disclosureClass: 'source_safe_message_and_attachment_metadata',
    },
    policyDecision: {
      decision: 'admit_owner_history_restore',
      denialReason: 'unauthorized_or_missing_conversation_denies_restore',
      retryAllowed: true,
    },
    streamState: 'restored_not_streaming',
    historyRefs: ['conversation-history:restore', 'conversation-history:messages', 'conversation-history:attachments'],
    persistenceBoundary: {
      storageScope: 'conversation_messages_and_attachment_projection',
      routeLocalHistory: true,
      globalLedgerTruth: false,
      terminalAuthorityRequiredForLedgerWork: true,
    },
    proofRootFields: ['sessionRoot', 'ownerRoot', 'historyRoot', 'attachmentRoot', 'telemetryRoot'],
    eventIds: ['conversation.session.restored', 'conversation.history.restored'],
    detailPayload: {
      collapsedHeaderFields: ['contractId', 'routeId', 'operationId', 'sourceSafeSummary'],
      expandedDetailSections: [
        detailSection('route_local_identity', 'Restore resolves one conversation id inside the route.'),
        detailSection('account_posture', 'Only the owning account may restore persisted conversation history.'),
        detailSection('source_context', 'Restored context remains source-safe message and attachment metadata.'),
        detailSection('policy_decision', 'Missing or unauthorized sessions fail closed.'),
        detailSection('stream_state', 'Restore does not replay live model output.'),
        detailSection('history_refs', 'History refs preserve message and attachment continuity.'),
        detailSection('proof_roots', 'Owner, history, attachment, session, and telemetry roots are required.'),
        detailSection('persistence_boundary', 'Restored history cannot override ledger or product state.'),
        detailSection('redaction_posture', 'Protected payload classes remain blocked during restore.'),
      ],
    },
  },
  {
    contractId: 'conversation.session.stream.create',
    routeId: 'api.conversations.collection_stream',
    operationId: 'stream',
    label: 'Create session and stream assistant response',
    routeContract: routeContract(
      'api.conversations.collection_stream',
      '/api/conversations/stream',
      'apps/uapi/app/api/conversations/stream/route.ts',
      'POST',
    ),
    sourceSafeSummary:
      'Creates a ConversationSession from a user write and streams source-safe assistant deltas plus optional execution references.',
    routeLocalIdentity: {
      sessionIdRef: 'conversation-session:stream-created-route-local',
      identityScope: 'route_local_not_global_ledger_truth',
      routeLocalHistoryRef: 'conversation-history:stream-create',
    },
    userAccountPosture: 'authenticated_writer_required',
    sourceContext: {
      sourceContextRef: 'conversation-source-context:rich-input-summary',
      disclosureClass: 'source_safe_rich_input_summary',
    },
    policyDecision: {
      decision: 'admit_source_safe_stream_create',
      denialReason: 'empty_content_or_unauthorized_writer_denies_stream',
      retryAllowed: true,
    },
    streamState: 'streaming',
    historyRefs: ['conversation-history:stream-create', 'conversation-history:assistant-message'],
    persistenceBoundary: {
      storageScope: 'conversation_messages_projection_with_execution_reference',
      routeLocalHistory: true,
      globalLedgerTruth: false,
      terminalAuthorityRequiredForLedgerWork: true,
    },
    proofRootFields: ['sessionRoot', 'richInputRoot', 'streamRoot', 'messageRoot', 'telemetryRoot'],
    eventIds: ['conversation.stream.created', 'conversation.message.completed'],
    detailPayload: {
      collapsedHeaderFields: ['contractId', 'routeId', 'operationId', 'sourceSafeSummary'],
      expandedDetailSections: [
        detailSection('route_local_identity', 'A stream-created session remains scoped to the conversation route.'),
        detailSection('account_posture', 'Authenticated writer identity is required.'),
        detailSection('source_context', 'Rich inputs are summarized through source-safe token counts and refs.'),
        detailSection('policy_decision', 'Empty content and unauthorized writers fail closed.'),
        detailSection('stream_state', 'Stream rows may expose deltas, event ids, and execution refs only.'),
        detailSection('history_refs', 'Assistant completion is persisted as route-local message history.'),
        detailSection('proof_roots', 'Rich input, stream, message, session, and telemetry roots are required.'),
        detailSection('persistence_boundary', 'Execution references do not make Conversations the execution authority.'),
        detailSection('redaction_posture', 'Raw protected prompts and unpaid AssetPack source remain forbidden.'),
      ],
    },
  },
  {
    contractId: 'conversation.session.stream.retry',
    routeId: 'api.conversations.session_stream',
    operationId: 'retry',
    label: 'Retry stream inside an existing session',
    routeContract: routeContract(
      'api.conversations.session_stream',
      '/api/conversations/[conversationId]/stream',
      'apps/uapi/app/api/conversations/[conversationId]/stream/route.ts',
      'POST',
    ),
    sourceSafeSummary:
      'Retries or continues a stream within an existing ConversationSession while preserving prior history roots and policy state.',
    routeLocalIdentity: {
      sessionIdRef: 'conversation-session:retry-route-local',
      identityScope: 'route_local_not_global_ledger_truth',
      routeLocalHistoryRef: 'conversation-history:retry',
    },
    userAccountPosture: 'authenticated_owner_writer_required',
    sourceContext: {
      sourceContextRef: 'conversation-source-context:existing-history-plus-new-safe-write',
      disclosureClass: 'source_safe_history_summary_and_new_write_summary',
    },
    policyDecision: {
      decision: 'admit_source_safe_retry',
      denialReason: 'missing_session_empty_content_or_unauthorized_writer_denies_retry',
      retryAllowed: true,
    },
    streamState: 'retry_streaming',
    historyRefs: ['conversation-history:restore', 'conversation-history:retry', 'conversation-history:assistant-message'],
    persistenceBoundary: {
      storageScope: 'conversation_messages_projection_with_retry_lineage',
      routeLocalHistory: true,
      globalLedgerTruth: false,
      terminalAuthorityRequiredForLedgerWork: true,
    },
    proofRootFields: ['sessionRoot', 'retryRoot', 'priorHistoryRoot', 'streamRoot', 'telemetryRoot'],
    eventIds: ['conversation.stream.retry.requested', 'conversation.stream.retry.completed'],
    detailPayload: {
      collapsedHeaderFields: ['contractId', 'routeId', 'operationId', 'sourceSafeSummary'],
      expandedDetailSections: [
        detailSection('route_local_identity', 'Retry lineage stays under the same conversation id.'),
        detailSection('account_posture', 'Only the owner writer can retry against existing history.'),
        detailSection('source_context', 'Retry context references prior safe history and the new write summary.'),
        detailSection('policy_decision', 'Missing session, empty content, or unauthorized writer fails closed.'),
        detailSection('stream_state', 'Retry stream state is distinct from first stream creation.'),
        detailSection('history_refs', 'Retry references previous restore and new assistant completion refs.'),
        detailSection('proof_roots', 'Retry, prior-history, stream, session, and telemetry roots are required.'),
        detailSection('persistence_boundary', 'Retry cannot mutate ledger, settlement, or Exchange state directly.'),
        detailSection('redaction_posture', 'Protected history is summarized or blocked before retry.'),
      ],
    },
  },
  {
    contractId: 'conversation.session.branch',
    routeId: 'api.conversations.branch',
    operationId: 'branch',
    label: 'Branch route-local conversation history',
    routeContract: routeContract(
      'api.conversations.branch',
      '/api/conversations/branch',
      'apps/uapi/app/api/conversations/branch/route.ts',
      'POST',
    ),
    sourceSafeSummary:
      'Branches a ConversationSession into a new route-local session and copies source-safe message and attachment continuity evidence.',
    routeLocalIdentity: {
      sessionIdRef: 'conversation-session:branched-route-local',
      identityScope: 'route_local_not_global_ledger_truth',
      routeLocalHistoryRef: 'conversation-history:branch',
    },
    userAccountPosture: 'authenticated_owner_required',
    sourceContext: {
      sourceContextRef: 'conversation-source-context:branched-message-and-attachment-continuity',
      disclosureClass: 'source_safe_continuity_metadata',
    },
    policyDecision: {
      decision: 'admit_owner_history_branch',
      denialReason: 'missing_source_conversation_or_unauthorized_owner_denies_branch',
      retryAllowed: true,
    },
    streamState: 'branched_not_streaming',
    historyRefs: ['conversation-history:branch', 'conversation-history:copied-messages', 'conversation-history:copied-attachments'],
    persistenceBoundary: {
      storageScope: 'branched_conversation_projection',
      routeLocalHistory: true,
      globalLedgerTruth: false,
      terminalAuthorityRequiredForLedgerWork: true,
    },
    proofRootFields: ['sourceSessionRoot', 'branchedSessionRoot', 'messageCopyRoot', 'attachmentCopyRoot', 'telemetryRoot'],
    eventIds: ['conversation.branch.created', 'conversation.history.branch.copied'],
    detailPayload: {
      collapsedHeaderFields: ['contractId', 'routeId', 'operationId', 'sourceSafeSummary'],
      expandedDetailSections: [
        detailSection('route_local_identity', 'Branch creates a new session id with parent linkage.'),
        detailSection('account_posture', 'Only the owner may branch source conversation history.'),
        detailSection('source_context', 'Branch continuity is message and attachment metadata only.'),
        detailSection('policy_decision', 'Missing source or unauthorized owner fails closed.'),
        detailSection('stream_state', 'Branching does not imply streaming.'),
        detailSection('history_refs', 'Copied message and attachment refs preserve branch lineage.'),
        detailSection('proof_roots', 'Source, branch, copy, attachment, and telemetry roots are required.'),
        detailSection('persistence_boundary', 'A branch is a route-local projection, not a ledger fork.'),
        detailSection('redaction_posture', 'Branch copies only allowed source-safe payload classes.'),
      ],
    },
  },
  {
    contractId: 'conversation.session.redaction.checkpoint',
    routeId: 'api.conversations.shared_contracts',
    operationId: 'redact',
    label: 'Apply shared route-local redaction checkpoint',
    routeContract: routeContract(
      'api.conversations.shared_contracts',
      '/api/conversations/* shared contracts',
      'apps/uapi/app/api/conversations/_shared.ts',
      'INTERNAL',
    ),
    sourceSafeSummary:
      'Defines the shared redaction checkpoint for route-local mock and live conversation history envelopes.',
    routeLocalIdentity: {
      sessionIdRef: 'conversation-session:redaction-checkpoint-route-local',
      identityScope: 'route_local_not_global_ledger_truth',
      routeLocalHistoryRef: 'conversation-history:redaction-checkpoint',
    },
    userAccountPosture: 'route_handler_policy_checkpoint',
    sourceContext: {
      sourceContextRef: 'conversation-source-context:redacted-safe-envelope',
      disclosureClass: 'source_safe_envelope_metadata',
    },
    policyDecision: {
      decision: 'block_forbidden_payload_classes',
      denialReason: 'protected_source_secret_or_unpaid_assetpack_source_denies_serialization',
      retryAllowed: false,
    },
    streamState: 'redaction_checkpoint',
    historyRefs: ['conversation-history:redaction-checkpoint'],
    persistenceBoundary: {
      storageScope: 'route_handler_serialization_checkpoint',
      routeLocalHistory: true,
      globalLedgerTruth: false,
      terminalAuthorityRequiredForLedgerWork: true,
    },
    proofRootFields: ['redactionRoot', 'disclosureRoot', 'historyRoot', 'serializationRoot', 'telemetryRoot'],
    eventIds: ['conversation.redaction.checked', 'conversation.disclosure.blocked'],
    detailPayload: {
      collapsedHeaderFields: ['contractId', 'routeId', 'operationId', 'sourceSafeSummary'],
      expandedDetailSections: [
        detailSection('route_local_identity', 'Redaction binds route-local envelopes before serialization.'),
        detailSection('account_posture', 'The route handler applies a policy checkpoint before output.'),
        detailSection('source_context', 'Only redacted envelope metadata may cross the route boundary.'),
        detailSection('policy_decision', 'Forbidden payload classes fail closed and are not retried automatically.'),
        detailSection('stream_state', 'The checkpoint covers both mock and live stream envelopes.'),
        detailSection('history_refs', 'Redaction checkpoints are replayable through source-safe history refs.'),
        detailSection('proof_roots', 'Redaction, disclosure, history, serialization, and telemetry roots are required.'),
        detailSection('persistence_boundary', 'Serialization never promotes conversation state into ledger authority.'),
        detailSection('redaction_posture', 'Protected source, secrets, private wallet material, and unpaid AssetPack source are forbidden.'),
      ],
    },
  },
]);

export const CONVERSATION_SESSION_ROUTE_HISTORY_ROWS = routeHistoryRows;

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
 * @param {unknown} value
 * @returns {string}
 */
function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function stableRoot(value) {
  return `sha256:${sha256(canonicalJson(value))}`;
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
export function buildConversationSessionRouteHistory(input = {}) {
  const version = input.version || CONVERSATION_SESSION_ROUTE_HISTORY_VERSION;
  const currentTarget = input.currentTarget || CONVERSATION_SESSION_ROUTE_HISTORY_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const sharedSourceRoots = [
    '.specifications/BITCODE_SPEC_V37.md',
    '.specifications/BITCODE_SPEC_V37_DELTA.md',
    '.specifications/BITCODE_SPEC_V37_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'scripts/specifying/src/canonical/conversation-session-route-history.js',
    'scripts/specifying/test/conversation-session-route-history.test.js',
    'scripts/generate-v37-conversation-session-route-history.mjs',
    'scripts/check-v37-gate2-conversation-session-route-history-contracts.mjs',
    'apps/uapi/components/conversations/models/conversation-session-route-history.ts',
    'apps/uapi/app/conversations/README.md',
    'apps/uapi/tests/api/conversationSessionRouteHistory.test.ts',
    'apps/uapi/tests/api/conversationSessionRouteHistoryContract.test.ts',
    'packages/api/src/routes/conversations.ts',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  const rows = routeHistoryRows.map((row) => {
    const sourceEvidence = [...new Set([...sharedSourceRoots, row.routeContract.sourceRoot])].map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const rowWithoutRoot = {
      ...row,
      sessionFieldIds: [...CONVERSATION_SESSION_FIELD_IDS],
      sourceSafetyClass: 'source_safe_conversation_session_metadata',
      sourceSafetyPosture: 'route_history_never_exposes_protected_source_or_unpaid_assetpack_content',
      redactionPosture: {
        postureId: 'conversation_session_route_history_redaction_v1',
        allowedPayloadClasses: [
          'conversation_identity',
          'source_safe_summary',
          'route_contract_metadata',
          'account_policy_metadata',
          'source_context_refs',
          'stream_state',
          'history_refs',
          'proof_roots',
          'event_ids',
          'persistence_boundary',
        ],
        forbiddenPayloadClasses: [...FORBIDDEN_CONVERSATION_PAYLOAD],
      },
      freshnessChecks: [
        {
          checkId: `${row.contractId}.route-history-row-present`,
          command: 'pnpm run check:v37-gate2',
          cadence: 'per_gate',
          failClosedOn: [...SHARED_FAIL_CLOSED_REASONS],
        },
      ],
      sourceEvidence,
    };

    const rowRoot = `conversation-session-row:${sha256(row.contractId + canonicalJson(rowWithoutRoot)).slice(0, 24)}`;
    const proofRoots = Object.fromEntries(
      row.proofRootFields.map((field) => [
        field,
        `conversation-proof:${sha256(`${row.contractId}:${field}:${rowRoot}`).slice(0, 24)}`,
      ]),
    );

    return {
      ...rowWithoutRoot,
      proofRoots,
      rowRoot,
      detailRoot: `conversation-session-detail:${sha256(row.contractId + canonicalJson(row.detailPayload)).slice(0, 24)}`,
    };
  });

  const observedRouteIds = rows.map((row) => row.routeId);
  const observedHistoryOperationIds = [...new Set(rows.map((row) => row.operationId))];
  const missingRouteIds = CONVERSATION_SESSION_ROUTE_IDS.filter((routeId) => !observedRouteIds.includes(routeId));
  const missingHistoryOperationIds = CONVERSATION_HISTORY_OPERATION_IDS.filter(
    (operationId) => !observedHistoryOperationIds.includes(operationId),
  );
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);
  const rowsWithMissingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.contractId}:${entry.sourceRoot}`),
  );
  const rowsWithProtectedSource = rows.filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('protected_source_payloads'));
  const rowsWithUnpaidAssetPackSource = rows.filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('unpaid_assetpack_source'));
  const rowsWithGlobalLedgerAuthority = rows.filter((row) => row.persistenceBoundary.globalLedgerTruth !== false);
  const rowsWithoutProofRoots = rows.filter((row) => row.proofRootFields.some((field) => !row.proofRoots[field]));
  const rowsWithoutEventIds = rows.filter((row) => row.eventIds.length === 0);
  const rowsWithoutHistoryRefs = rows.filter((row) => row.historyRefs.length === 0 || row.persistenceBoundary.routeLocalHistory !== true);
  const rowsWithoutRouteContracts = rows.filter((row) => !row.routeContract.path || !row.routeContract.sourceRoot || !row.routeContract.method);
  const rowsWithLegacySourceRoots = rows.filter((row) => row.sourceEvidence.some((entry) => entry.sourceRoot.startsWith('_legacy/')));

  const failures = [
    ...missingRouteIds.map((routeId) => `missing required Conversation route id ${routeId}`),
    ...missingHistoryOperationIds.map((operationId) => `missing required Conversation history operation ${operationId}`),
    ...rowsWithMissingSourceRoots.map((sourceRoot) => `missing Conversation session source root ${sourceRoot}`),
    ...(forbiddenMarkerDetected ? ['Conversation session route history contains a secret-shaped marker'] : []),
    ...rowsWithProtectedSource.map((row) => `Conversation route history row ${row.contractId} lacks protected source boundary`),
    ...rowsWithUnpaidAssetPackSource.map((row) => `Conversation route history row ${row.contractId} lacks unpaid AssetPack source boundary`),
    ...rowsWithGlobalLedgerAuthority.map((row) => `Conversation route history row ${row.contractId} claims global ledger truth`),
    ...rowsWithoutProofRoots.map((row) => `Conversation route history row ${row.contractId} is missing proof roots`),
    ...rowsWithoutEventIds.map((row) => `Conversation route history row ${row.contractId} is missing event ids`),
    ...rowsWithoutHistoryRefs.map((row) => `Conversation route history row ${row.contractId} is missing route-local history refs`),
    ...rowsWithoutRouteContracts.map((row) => `Conversation route history row ${row.contractId} is missing route contract data`),
    ...rowsWithLegacySourceRoots.map((row) => `Conversation route history row ${row.contractId} points at _legacy source roots`),
  ];

  const coverage = {
    requiredSessionFieldIds: [...CONVERSATION_SESSION_FIELD_IDS],
    requiredHistoryOperationIds: [...CONVERSATION_HISTORY_OPERATION_IDS],
    observedHistoryOperationIds,
    missingHistoryOperationIds,
    requiredRouteIds: [...CONVERSATION_SESSION_ROUTE_IDS],
    observedRouteIds,
    missingRouteIds,
    routeContractCount: rows.length,
    allRouteContractsCovered: includesAll(observedRouteIds, CONVERSATION_SESSION_ROUTE_IDS),
    allHistoryOperationsCovered: includesAll(observedHistoryOperationIds, CONVERSATION_HISTORY_OPERATION_IDS),
    createSupported: observedHistoryOperationIds.includes('create'),
    restoreSupported: observedHistoryOperationIds.includes('restore'),
    branchSupported: observedHistoryOperationIds.includes('branch'),
    retrySupported: observedHistoryOperationIds.includes('retry'),
    redactionSupported: observedHistoryOperationIds.includes('redact'),
    streamSupported: observedHistoryOperationIds.includes('stream'),
    proofRootsCovered: rowsWithoutProofRoots.length === 0,
    eventIdsCovered: rowsWithoutEventIds.length === 0,
    routeLocalHistoryCovered: rowsWithoutHistoryRefs.length === 0,
    routeContractsCovered: rowsWithoutRouteContracts.length === 0,
    persistenceBoundariesCovered: rowsWithGlobalLedgerAuthority.length === 0,
    missingSourceRoots: rowsWithMissingSourceRoots,
    legacySourceRoots: rowsWithLegacySourceRoots.length > 0,
    credentialsSerialized: forbiddenMarkerDetected,
    protectedSourceVisible: rowsWithProtectedSource.length > 0,
    unpaidAssetPackSourceVisible: rowsWithUnpaidAssetPackSource.length > 0,
    globalLedgerAuthorityClaimed: rowsWithGlobalLedgerAuthority.length > 0,
  };

  const artifactSeed = {
    version,
    currentTarget,
    rows,
    coverage,
    sourceSafetyVerdict: CONVERSATION_SESSION_ROUTE_HISTORY_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v37-conversation-session-route-history',
    schemaId: CONVERSATION_SESSION_ROUTE_HISTORY_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: CONVERSATION_SESSION_ROUTE_HISTORY_SOURCE_SAFETY_VERDICT,
    disclosureBoundary: {
      conversationRoutesMayExpose: [
        'conversation_identity',
        'source_safe_summary',
        'route_contract_metadata',
        'account_policy_metadata',
        'source_context_refs',
        'stream_state',
        'history_refs',
        'proof_roots',
        'event_ids',
        'persistence_boundary',
      ],
      conversationRoutesMustNotExpose: [...FORBIDDEN_CONVERSATION_PAYLOAD],
    },
    passed: failures.length === 0,
    failures,
    coverage,
    requiredSessionFieldIds: [...CONVERSATION_SESSION_FIELD_IDS],
    requiredHistoryOperationIds: [...CONVERSATION_HISTORY_OPERATION_IDS],
    requiredRouteIds: [...CONVERSATION_SESSION_ROUTE_IDS],
    rows,
    sourceEvidence: rows.map((row) => ({
      contractId: row.contractId,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `conversation-session-route-history:${stableRoot(artifactSeed).slice('sha256:'.length, 'sha256:'.length + 24)}`,
  };
}
