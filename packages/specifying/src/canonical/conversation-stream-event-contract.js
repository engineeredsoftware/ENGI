// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONVERSATION_STREAM_EVENT_CONTRACT_ARTIFACT_PATH = '.bitcode/v37-conversation-stream-event-contract.json';
export const CONVERSATION_STREAM_EVENT_CONTRACT_SCHEMA_ID = 'bitcode.v37.conversationStreamEventContract.v1';
export const CONVERSATION_STREAM_EVENT_CONTRACT_VERSION = 'V37';
export const CONVERSATION_STREAM_EVENT_CONTRACT_CURRENT_TARGET = 'V36';
export const CONVERSATION_STREAM_EVENT_CONTRACT_SOURCE_SAFETY_VERDICT =
  'source-safe-conversation-stream-event-metadata';

export const CONVERSATION_STREAM_EVENT_KIND_IDS = Object.freeze([
  'model_delta',
  'tool_call',
  'retrieval_summary',
  'proof_root',
  'retry_state',
  'completion_decision',
  'error_row',
]);

export const CONVERSATION_STREAM_REQUIRED_TELEMETRY_FIELD_IDS = Object.freeze([
  'event_id',
  'run_id',
  'conversation_id',
  'sequence',
  'timestamp',
  'collapsed_status',
  'expanded_metadata',
  'proof_roots',
  'redaction_posture',
  'prompt_disclosure_posture',
  'result_disclosure_posture',
  'fail_closed_states',
]);

export const CONVERSATION_STREAM_DISCLOSURE_POSTURES = Object.freeze([
  'prompt_template_id_only',
  'prompt_summary_only',
  'result_summary_only',
  'parsed_result_shape_only',
  'source_safe_metadata_only',
]);

const FORBIDDEN_STREAM_PAYLOAD_CLASSES = Object.freeze([
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
 * @param {string} value
 */
function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

/**
 * @param {string} id
 * @param {string} label
 * @param {string} description
 */
function detailSection(id, label, description) {
  return {
    id,
    label,
    description,
    sourceSafetyClass: 'source_safe_conversation_stream_detail',
  };
}

/**
 * @param {{
 *   kindId: string;
 *   label: string;
 *   collapsedStatus: string;
 *   legacySseTypes: string[];
 *   executionState: Record<string, string>;
 *   proofRootFields: string[];
 *   failClosedStates: string[];
 *   expandedMetadataSections: Array<ReturnType<typeof detailSection>>;
 * }} input
 */
function eventRow(input) {
  return {
    ...input,
    sourceSafetyClass: 'source_safe_conversation_stream_event_metadata',
    promptDisclosurePosture: 'prompt_template_id_only',
    resultDisclosurePosture: 'parsed_result_shape_only',
    redactionPosture: {
      postureId: 'conversation-stream-redaction-source-safe',
      forbiddenPayloadClasses: [...FORBIDDEN_STREAM_PAYLOAD_CLASSES],
      promptPayloadVisible: false,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawModelResponseVisible: false,
      globalLedgerAuthorityClaimed: false,
    },
    telemetryFields: [...CONVERSATION_STREAM_REQUIRED_TELEMETRY_FIELD_IDS],
    rowRoot: `conversation-stream-row:${digest(`${input.kindId}:${input.collapsedStatus}`)}`,
    detailRoot: `conversation-stream-detail:${digest(
      JSON.stringify(input.expandedMetadataSections.map((section) => section.id)),
    )}`,
  };
}

export const CONVERSATION_STREAM_EVENT_CONTRACT_ROWS = Object.freeze([
  eventRow({
    kindId: 'model_delta',
    label: 'Model delta row',
    collapsedStatus: 'Assistant model delta streamed',
    legacySseTypes: ['token'],
    executionState: {
      type: 'generation',
      pipeline: 'ConversationStream',
      phase: 'stream',
      agent: 'ConversationStreamEvent',
      step: 'try',
      generation: 'structured_output',
      outputSchema: 'ConversationStreamEvent:model_delta',
    },
    proofRootFields: ['eventRoot', 'conversationRoot', 'deltaRoot'],
    failClosedStates: ['missing_event_id', 'unsafe_delta_payload', 'protected_source_visible'],
    expandedMetadataSections: [
      detailSection('delta_summary', 'Delta summary', 'Only chunk counts and source-safe text deltas may be visible.'),
      detailSection('prompt_disclosure', 'Prompt posture', 'Prompt content is hidden; template ids and summaries may be shown.'),
      detailSection('result_disclosure', 'Result posture', 'The raw provider response is never emitted through the stream UI.'),
    ],
  }),
  eventRow({
    kindId: 'tool_call',
    label: 'Tool call row',
    collapsedStatus: 'Conversation tool call admitted',
    legacySseTypes: ['pipeline_triggered', 'pipeline_event'],
    executionState: {
      type: 'tool-use',
      pipeline: 'ConversationStream',
      phase: 'tooling',
      agent: 'ConversationStreamEvent',
      step: 'try',
      tool: 'conversation-stream-router',
      outputSchema: 'ConversationStreamEvent:tool_call',
    },
    proofRootFields: ['eventRoot', 'conversationRoot', 'toolCallRoot'],
    failClosedStates: ['missing_tool_name', 'tool_payload_not_source_safe', 'provider_token_visible'],
    expandedMetadataSections: [
      detailSection('tool_name', 'Tool name', 'Tool names and source-safe tool summaries are visible.'),
      detailSection('tool_arguments', 'Argument posture', 'Arguments are summarized and never expose credentials or protected source.'),
    ],
  }),
  eventRow({
    kindId: 'retrieval_summary',
    label: 'Retrieval summary row',
    collapsedStatus: 'Conversation retrieval context summarized',
    legacySseTypes: ['pipeline_event'],
    executionState: {
      type: 'thinking',
      pipeline: 'ConversationStream',
      phase: 'retrieval',
      agent: 'ConversationStreamEvent',
      step: 'plan',
      outputSchema: 'ConversationStreamEvent:retrieval_summary',
    },
    proofRootFields: ['eventRoot', 'conversationRoot', 'retrievalRoot'],
    failClosedStates: ['missing_context_ref', 'protected_source_visible', 'raw_prompt_visible'],
    expandedMetadataSections: [
      detailSection('retrieval_refs', 'Retrieval refs', 'Attachment, source selector, and history refs are visible as metadata only.'),
      detailSection('context_summary', 'Context summary', 'Context is summarized without raw protected source.'),
    ],
  }),
  eventRow({
    kindId: 'proof_root',
    label: 'Proof root row',
    collapsedStatus: 'Conversation proof roots anchored',
    legacySseTypes: ['pipeline_event'],
    executionState: {
      type: 'thinking',
      pipeline: 'ConversationStream',
      phase: 'proof',
      agent: 'ConversationStreamEvent',
      step: 'refine',
      outputSchema: 'ConversationStreamEvent:proof_root',
    },
    proofRootFields: ['eventRoot', 'conversationRoot', 'telemetryRoot', 'redactionRoot'],
    failClosedStates: ['missing_proof_root', 'redaction_posture_missing'],
    expandedMetadataSections: [
      detailSection('proof_roots', 'Proof roots', 'Event, conversation, telemetry, and redaction proof roots are visible.'),
      detailSection('redaction_root', 'Redaction root', 'Redaction posture is bound to the proof root set.'),
    ],
  }),
  eventRow({
    kindId: 'retry_state',
    label: 'Retry state row',
    collapsedStatus: 'Conversation retry posture recorded',
    legacySseTypes: ['pipeline_event'],
    executionState: {
      type: 'thinking',
      pipeline: 'ConversationStream',
      phase: 'retry',
      agent: 'ConversationStreamEvent',
      step: 'retry',
      outputSchema: 'ConversationStreamEvent:retry_state',
    },
    proofRootFields: ['eventRoot', 'conversationRoot', 'retryRoot'],
    failClosedStates: ['retry_without_history_ref', 'retry_policy_missing', 'unsafe_retry_payload'],
    expandedMetadataSections: [
      detailSection('retry_policy', 'Retry policy', 'Retry rows describe route-local retry posture and history refs.'),
      detailSection('fail_closed', 'Fail-closed state', 'Unsafe retry payloads fail closed before streaming.'),
    ],
  }),
  eventRow({
    kindId: 'completion_decision',
    label: 'Completion decision row',
    collapsedStatus: 'Conversation completion decision emitted',
    legacySseTypes: ['message_complete', 'pipeline_complete'],
    executionState: {
      type: 'completion',
      pipeline: 'ConversationStream',
      phase: 'completion',
      agent: 'ConversationStreamEvent',
      step: 'refine',
      outputSchema: 'ConversationStreamEvent:completion_decision',
    },
    proofRootFields: ['eventRoot', 'conversationRoot', 'messageRoot', 'completionRoot'],
    failClosedStates: ['missing_message_id', 'unsafe_completion_payload', 'assistant_message_not_persisted'],
    expandedMetadataSections: [
      detailSection('message_ref', 'Message ref', 'Completion rows expose message ids and source-safe summaries.'),
      detailSection('persistence', 'Persistence', 'Completion rows bind final stream state to route-local message persistence.'),
    ],
  }),
  eventRow({
    kindId: 'error_row',
    label: 'Error row',
    collapsedStatus: 'Conversation stream failed closed',
    legacySseTypes: ['error'],
    executionState: {
      type: 'error',
      pipeline: 'ConversationStream',
      phase: 'error',
      agent: 'ConversationStreamEvent',
      step: 'retry',
      outputSchema: 'ConversationStreamEvent:error_row',
    },
    proofRootFields: ['eventRoot', 'conversationRoot', 'errorRoot'],
    failClosedStates: ['stream_exception', 'unsafe_error_detail', 'raw_provider_error_visible'],
    expandedMetadataSections: [
      detailSection('error_code', 'Error code', 'Only source-safe error codes and summaries may be visible.'),
      detailSection('recovery', 'Recovery posture', 'Retry guidance is metadata only and never claims ledger authority.'),
    ],
  }),
]);

const SOURCE_EVIDENCE_PATHS = Object.freeze([
  'packages/specifying/src/canonical/conversation-stream-event-contract.js',
  'packages/api/src/conversations/stream-events.ts',
  'packages/api/src/routes/conversations.ts',
  'uapi/hooks/useConversationStream.ts',
  'uapi/app/conversations/components/hooks/usePipelineState.ts',
  'uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
  'uapi/components/bitcode/pipeline/pipeline-execution-log-header.tsx',
  'uapi/app/api/conversations/_shared.ts',
  'uapi/tests/api/conversationStreamEventContract.test.ts',
  'uapi/tests/conversationStreamPipelineLog.test.tsx',
]);

/**
 * @param {{ generatedAt?: string; repoRoot?: string }} [input]
 */
export function buildConversationStreamEventContract(input = {}) {
  const repoRoot = input.repoRoot || path.resolve(__dirname, '..', '..', '..');
  const generatedAt = input.generatedAt || new Date().toISOString();
  const serializedRows = JSON.stringify(CONVERSATION_STREAM_EVENT_CONTRACT_ROWS);
  const sourceEvidence = SOURCE_EVIDENCE_PATHS.map((sourceRoot) => ({
    sourceRoot,
    present: existsSync(path.join(repoRoot, sourceRoot)),
  }));
  const failures = [];

  const coveredKinds = CONVERSATION_STREAM_EVENT_CONTRACT_ROWS.map((row) => row.kindId);
  const missingKindIds = CONVERSATION_STREAM_EVENT_KIND_IDS.filter((kindId) => !coveredKinds.includes(kindId));
  const missingTelemetryFieldIds = CONVERSATION_STREAM_REQUIRED_TELEMETRY_FIELD_IDS.filter((fieldId) =>
    CONVERSATION_STREAM_EVENT_CONTRACT_ROWS.some((row) => !row.telemetryFields.includes(fieldId)),
  );
  const missingSourceRoots = sourceEvidence.filter((entry) => !entry.present).map((entry) => entry.sourceRoot);
  const forbiddenMarkerHits = SECRET_MARKERS.filter((marker) => serializedRows.includes(marker));
  const protectedPayloadVisible = CONVERSATION_STREAM_EVENT_CONTRACT_ROWS.some((row) =>
    row.redactionPosture.protectedSourceVisible ||
    row.redactionPosture.unpaidAssetPackSourceVisible ||
    row.redactionPosture.rawModelResponseVisible ||
    row.redactionPosture.globalLedgerAuthorityClaimed,
  );

  if (missingKindIds.length) failures.push(`Missing conversation stream event kinds: ${missingKindIds.join(', ')}`);
  if (missingTelemetryFieldIds.length) {
    failures.push(`Missing conversation stream telemetry fields: ${missingTelemetryFieldIds.join(', ')}`);
  }
  if (missingSourceRoots.length) failures.push(`Missing source roots: ${missingSourceRoots.join(', ')}`);
  if (forbiddenMarkerHits.length) failures.push(`Serialized stream contract contains forbidden markers: ${forbiddenMarkerHits.join(', ')}`);
  if (protectedPayloadVisible) failures.push('Conversation stream event contract exposes protected payload posture.');

  const rows = CONVERSATION_STREAM_EVENT_CONTRACT_ROWS.map((row) => ({
    ...row,
    proofRoots: Object.fromEntries(
      row.proofRootFields.map((field) => [field, `conversation-stream-proof:${digest(`${row.kindId}:${field}`)}`]),
    ),
  }));
  const artifactRoot = `conversation-stream-event-contract:${digest(
    JSON.stringify({ rows, generatedAt, schemaId: CONVERSATION_STREAM_EVENT_CONTRACT_SCHEMA_ID }),
  )}`;

  return {
    artifactId: 'v37-conversation-stream-event-contract',
    schemaId: CONVERSATION_STREAM_EVENT_CONTRACT_SCHEMA_ID,
    version: CONVERSATION_STREAM_EVENT_CONTRACT_VERSION,
    currentTarget: CONVERSATION_STREAM_EVENT_CONTRACT_CURRENT_TARGET,
    generatedAt,
    artifactRoot,
    sourceSafetyVerdict: CONVERSATION_STREAM_EVENT_CONTRACT_SOURCE_SAFETY_VERDICT,
    requiredEventKindIds: [...CONVERSATION_STREAM_EVENT_KIND_IDS],
    requiredTelemetryFieldIds: [...CONVERSATION_STREAM_REQUIRED_TELEMETRY_FIELD_IDS],
    disclosurePostures: [...CONVERSATION_STREAM_DISCLOSURE_POSTURES],
    rows,
    sourceEvidence,
    coverage: {
      eventKindCount: rows.length,
      missingKindIds,
      missingTelemetryFieldIds,
      missingSourceRoots,
      modelDeltaCovered: coveredKinds.includes('model_delta'),
      toolCallCovered: coveredKinds.includes('tool_call'),
      retrievalSummaryCovered: coveredKinds.includes('retrieval_summary'),
      proofRootCovered: coveredKinds.includes('proof_root'),
      retryStateCovered: coveredKinds.includes('retry_state'),
      completionDecisionCovered: coveredKinds.includes('completion_decision'),
      errorRowCovered: coveredKinds.includes('error_row'),
      collapsedReadableStatusCovered: rows.every((row) => Boolean(row.collapsedStatus)),
      expandedMetadataCovered: rows.every((row) => row.expandedMetadataSections.length > 0),
      proofRootsCovered: rows.every((row) => row.proofRootFields.length > 0),
      redactionPostureCovered: rows.every((row) => row.redactionPosture.forbiddenPayloadClasses.length >= FORBIDDEN_STREAM_PAYLOAD_CLASSES.length),
      promptDisclosureCovered: rows.every((row) => row.promptDisclosurePosture === 'prompt_template_id_only'),
      resultDisclosureCovered: rows.every((row) => row.resultDisclosurePosture === 'parsed_result_shape_only'),
      failClosedStatesCovered: rows.every((row) => row.failClosedStates.length > 0),
      protectedSourceVisible: protectedPayloadVisible,
      credentialsSerialized: forbiddenMarkerHits.length > 0,
      legacySourceRoots: sourceEvidence.some((entry) => entry.sourceRoot.includes('_legacy/')),
    },
    uiContract: {
      collapsedRowSurface: 'PipelineExecutionLog collapsed row status',
      expandedMetadataSurface: 'PipelineExecutionLog expanded metadata accordion',
      headerSurface: 'PipelineExecutionLogHeader event/proof/redaction metadata rows',
      sourceDisclosureBoundary: 'source-safe stream event metadata only',
    },
    failures,
    passed: failures.length === 0,
  };
}
