// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONVERSATION_WRITING_WORKSPACE_ARTIFACT_PATH = '.bitcode/v37-conversation-writing-workspace.json';
export const CONVERSATION_WRITING_WORKSPACE_SCHEMA_ID = 'bitcode.v37.conversationWritingWorkspace.v1';
export const CONVERSATION_WRITING_WORKSPACE_VERSION = 'V37';
export const CONVERSATION_WRITING_WORKSPACE_CURRENT_TARGET = 'V36';
export const CONVERSATION_WRITING_WORKSPACE_SOURCE_SAFETY_VERDICT =
  'source-safe-conversation-writing-workspace-metadata';

export const CONVERSATION_WRITING_WORKSPACE_MODE_IDS = Object.freeze([
  'read_request',
  'need_feedback',
  'assetpack_review_note',
  'terminal_handoff_summary',
]);

export const CONVERSATION_WRITING_WORKSPACE_ACTION_IDS = Object.freeze([
  'save',
  'restore',
  'summarize',
  'handoff',
]);

export const CONVERSATION_WRITING_WORKSPACE_FIELD_IDS = Object.freeze([
  'workspace_mode',
  'draft_scope',
  'local_draft_key',
  'summary_policy',
  'handoff_policy',
  'source_safety_boundary',
  'keyboard_behavior',
  'responsive_layout',
  'recovery_state',
  'proof_roots',
  'event_ids',
]);

const FORBIDDEN_WORKSPACE_PAYLOAD_CLASSES = Object.freeze([
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
 * @param {string} id
 * @param {string} label
 * @param {string} description
 */
function detailSection(id, label, description) {
  return {
    id,
    label,
    description,
    sourceSafetyClass: 'source_safe_conversation_writing_workspace_detail',
  };
}

/**
 * @param {{
 *   modeId: string;
 *   label: string;
 *   draftScope: string;
 *   placeholder: string;
 *   summaryPolicy: string;
 *   handoffPolicy: string;
 *   recoveryStates: string[];
 *   proofRootFields: string[];
 *   eventIds: string[];
 *   detailSections: Array<ReturnType<typeof detailSection>>;
 * }} input
 */
function workspaceRow(input) {
  return {
    ...input,
    fieldIds: [...CONVERSATION_WRITING_WORKSPACE_FIELD_IDS],
    actionIds: [...CONVERSATION_WRITING_WORKSPACE_ACTION_IDS],
    sourceSafetyClass: 'source_safe_conversation_writing_workspace_metadata',
    localDraftKey: `conversation-writing-workspace:${input.modeId}:route-local`,
    keyboardBehavior: {
      saveShortcut: 'mod+s',
      handoffShortcut: 'mod+enter',
      exitShortcut: 'escape',
      focusRecovery: 'focus_returns_to_workspace_textarea',
    },
    responsiveLayout: {
      fullscreen: true,
      minColumnWidth: 'minmax(0, 1fr)',
      compactBreakpoint: '640px',
      detailDisclosure: 'collapsible_metadata_panel',
    },
    sourceSafetyBoundary: {
      routeLocalDraftMayContainUserText: true,
      emittedSummaryIsRedacted: true,
      emittedHandoffIsRedacted: true,
      mayExpose: [
        'workspace_mode',
        'draft_metrics',
        'source_safe_summary',
        'local_draft_state',
        'handoff_intent_metadata',
        'proof_roots',
        'event_ids',
        'recovery_state',
      ],
      mustNotExpose: [...FORBIDDEN_WORKSPACE_PAYLOAD_CLASSES],
    },
  };
}

export const CONVERSATION_WRITING_WORKSPACE_ROWS = Object.freeze([
  workspaceRow({
    modeId: 'read_request',
    label: 'Read Request drafting',
    draftScope: 'reader_authored_request_for_technical_knowledge',
    placeholder: 'Draft the Read Request the Need comprehension pipeline should understand.',
    summaryPolicy: 'summarize_goal_repository_constraints_and_acceptance_criteria_without_source_payloads',
    handoffPolicy: 'handoff_source_safe_read_request_summary_to_conversation_stream',
    recoveryStates: ['empty_draft', 'saved_locally', 'summary_ready', 'handoff_ready'],
    proofRootFields: ['workspaceRoot', 'draftMetricsRoot', 'summaryRoot', 'redactionRoot'],
    eventIds: ['conversation.writing.read_request.saved', 'conversation.writing.read_request.handoff'],
    detailSections: [
      detailSection('draft_scope', 'Draft scope', 'The draft describes the requested read, not protected source contents.'),
      detailSection('summary_policy', 'Summary policy', 'Summaries expose goals, constraints, and acceptance criteria only.'),
      detailSection('handoff_policy', 'Handoff policy', 'Handoff emits redacted Read Request context into the conversation stream.'),
    ],
  }),
  workspaceRow({
    modeId: 'need_feedback',
    label: 'Need feedback drafting',
    draftScope: 'reader_feedback_for_synthesized_need_revision',
    placeholder: 'Draft feedback for the synthesized Need before asking Bitcode to revise it.',
    summaryPolicy: 'summarize_missing_need_constraints_overreach_and_confirmation_without_raw_private_context',
    handoffPolicy: 'handoff_source_safe_need_feedback_to_conversation_stream',
    recoveryStates: ['empty_draft', 'saved_locally', 'revision_feedback_ready', 'handoff_ready'],
    proofRootFields: ['workspaceRoot', 'needFeedbackRoot', 'summaryRoot', 'redactionRoot'],
    eventIds: ['conversation.writing.need_feedback.saved', 'conversation.writing.need_feedback.handoff'],
    detailSections: [
      detailSection('draft_scope', 'Draft scope', 'The draft names comprehension gaps or corrections.'),
      detailSection('summary_policy', 'Summary policy', 'Feedback summaries name missing constraints and overreach without source.'),
      detailSection('handoff_policy', 'Handoff policy', 'Handoff requests Need revision inside route-local Conversations.'),
    ],
  }),
  workspaceRow({
    modeId: 'assetpack_review_note',
    label: 'AssetPack review-note drafting',
    draftScope: 'reader_source_safe_preview_review_note',
    placeholder: 'Draft review notes against source-safe AssetPack measurements and preview metadata.',
    summaryPolicy: 'summarize_preview_measurements_quality_questions_and_settlement_readiness_without_unpaid_source',
    handoffPolicy: 'handoff_source_safe_assetpack_review_note_to_conversation_stream',
    recoveryStates: ['empty_draft', 'saved_locally', 'preview_review_ready', 'handoff_ready'],
    proofRootFields: ['workspaceRoot', 'assetpackPreviewRoot', 'summaryRoot', 'redactionRoot'],
    eventIds: ['conversation.writing.assetpack_review_note.saved', 'conversation.writing.assetpack_review_note.handoff'],
    detailSections: [
      detailSection('draft_scope', 'Draft scope', 'Review notes may discuss measurements and preview metadata only.'),
      detailSection('summary_policy', 'Summary policy', 'Summaries do not include unpaid AssetPack source.'),
      detailSection('handoff_policy', 'Handoff policy', 'Handoff keeps settlement approval and source disclosure outside Conversations.'),
    ],
  }),
  workspaceRow({
    modeId: 'terminal_handoff_summary',
    label: 'Terminal handoff summary drafting',
    draftScope: 'source_safe_terminal_transaction_intent_summary',
    placeholder: 'Draft a source-safe handoff summary for Terminal transaction work.',
    summaryPolicy: 'summarize_transaction_intent_refs_and_blockers_without_wallet_private_material',
    handoffPolicy: 'handoff_source_safe_terminal_intent_without_claiming_ledger_authority',
    recoveryStates: ['empty_draft', 'saved_locally', 'handoff_summary_ready', 'handoff_ready'],
    proofRootFields: ['workspaceRoot', 'terminalIntentRoot', 'summaryRoot', 'redactionRoot'],
    eventIds: ['conversation.writing.terminal_handoff_summary.saved', 'conversation.writing.terminal_handoff_summary.handoff'],
    detailSections: [
      detailSection('draft_scope', 'Draft scope', 'The draft prepares Terminal intent, not ledger or wallet authority.'),
      detailSection('summary_policy', 'Summary policy', 'Summaries omit private wallet material and settlement payloads.'),
      detailSection('handoff_policy', 'Handoff policy', 'Terminal remains authoritative for transaction execution.'),
    ],
  }),
]);

/**
 * @param {{ generatedAt?: string; repoRoot?: string }} [input]
 */
export function buildConversationWritingWorkspace(input = {}) {
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const sharedSourceRoots = [
    'specifications/BITCODE_SPEC_V37.md',
    'specifications/BITCODE_SPEC_V37_DELTA.md',
    'specifications/BITCODE_SPEC_V37_NOTES.md',
    'specifications/BITCODE_SPEC_V37_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'scripts/specifying/src/canonical/conversation-writing-workspace.js',
    'scripts/specifying/test/conversation-writing-workspace.test.js',
    'scripts/generate-v37-conversation-writing-workspace.mjs',
    'scripts/check-v37-gate4-conversation-writing-workspace.mjs',
    'apps/uapi/components/conversations/models/conversation-writing-workspace.ts',
    'apps/uapi/components/conversations/ConversationWritingWorkspace/ConversationWritingWorkspace.tsx',
    'apps/uapi/components/conversations/ConversationsOverlay/ConversationsOverlay.tsx',
    'apps/uapi/app/conversations/README.md',
    'apps/uapi/tests/conversationWritingWorkspace.test.tsx',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  const rows = CONVERSATION_WRITING_WORKSPACE_ROWS.map((row) => {
    const sourceEvidence = sharedSourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const rowWithoutRoot = {
      ...row,
      sourceEvidence,
      freshnessChecks: [
        {
          checkId: `${row.modeId}.writing-workspace-row-present`,
          command: 'pnpm run check:v37-gate4',
          cadence: 'per_gate',
          failClosedOn: [
            'missing_workspace_mode',
            'missing_local_draft_boundary',
            'missing_summary_policy',
            'missing_handoff_policy',
            'protected_source_visible',
            'unpaid_assetpack_source_visible',
            'global_ledger_authority_claimed',
          ],
        },
      ],
    };

    const rowRoot = `conversation-writing-row:${sha256(row.modeId + canonicalJson(rowWithoutRoot)).slice(0, 24)}`;
    const proofRoots = Object.fromEntries(
      row.proofRootFields.map((field) => [
        field,
        `conversation-writing-proof:${sha256(`${row.modeId}:${field}:${rowRoot}`).slice(0, 24)}`,
      ]),
    );

    return {
      ...rowWithoutRoot,
      proofRoots,
      rowRoot,
      detailRoot: `conversation-writing-detail:${sha256(row.modeId + canonicalJson(row.detailSections)).slice(0, 24)}`,
    };
  });

  const observedModeIds = rows.map((row) => row.modeId);
  const observedActionIds = [...new Set(rows.flatMap((row) => row.actionIds))];
  const missingModeIds = CONVERSATION_WRITING_WORKSPACE_MODE_IDS.filter((modeId) => !observedModeIds.includes(modeId));
  const missingActionIds = CONVERSATION_WRITING_WORKSPACE_ACTION_IDS.filter((actionId) => !observedActionIds.includes(actionId));
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);
  const rowsWithMissingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.modeId}:${entry.sourceRoot}`),
  );
  const rowsWithProtectedSourceVisible = rows.filter(
    (row) => !row.sourceSafetyBoundary.mustNotExpose.includes('protected_source_payloads'),
  );
  const rowsWithUnpaidSourceVisible = rows.filter(
    (row) => !row.sourceSafetyBoundary.mustNotExpose.includes('unpaid_assetpack_source'),
  );
  const rowsClaimingLedgerAuthority = rows.filter(
    (row) => !row.sourceSafetyBoundary.mustNotExpose.includes('global_ledger_authority_claim'),
  );
  const rowsWithoutLocalDraftKeys = rows.filter((row) => !row.localDraftKey.includes(':route-local'));
  const rowsWithoutProofRoots = rows.filter((row) => row.proofRootFields.some((field) => !row.proofRoots[field]));
  const rowsWithoutRecovery = rows.filter((row) => row.recoveryStates.length === 0);
  const rowsWithoutAccessibility = rows.filter((row) => !row.keyboardBehavior.saveShortcut || !row.responsiveLayout.fullscreen);
  const rowsWithLegacySourceRoots = rows.filter((row) => row.sourceEvidence.some((entry) => entry.sourceRoot.startsWith('_legacy/')));

  const failures = [
    ...missingModeIds.map((modeId) => `missing required ConversationWritingWorkspace mode ${modeId}`),
    ...missingActionIds.map((actionId) => `missing required ConversationWritingWorkspace action ${actionId}`),
    ...rowsWithMissingSourceRoots.map((sourceRoot) => `missing Conversation writing workspace source root ${sourceRoot}`),
    ...(forbiddenMarkerDetected ? ['Conversation writing workspace contains a secret-shaped marker'] : []),
    ...rowsWithProtectedSourceVisible.map((row) => `Conversation writing workspace row ${row.modeId} lacks protected source boundary`),
    ...rowsWithUnpaidSourceVisible.map((row) => `Conversation writing workspace row ${row.modeId} lacks unpaid AssetPack source boundary`),
    ...rowsClaimingLedgerAuthority.map((row) => `Conversation writing workspace row ${row.modeId} can claim global ledger authority`),
    ...rowsWithoutLocalDraftKeys.map((row) => `Conversation writing workspace row ${row.modeId} lacks route-local draft key`),
    ...rowsWithoutProofRoots.map((row) => `Conversation writing workspace row ${row.modeId} lacks proof roots`),
    ...rowsWithoutRecovery.map((row) => `Conversation writing workspace row ${row.modeId} lacks recovery states`),
    ...rowsWithoutAccessibility.map((row) => `Conversation writing workspace row ${row.modeId} lacks keyboard or fullscreen accessibility contract`),
    ...rowsWithLegacySourceRoots.map((row) => `Conversation writing workspace row ${row.modeId} points at _legacy source roots`),
  ];

  const coverage = {
    requiredModeIds: [...CONVERSATION_WRITING_WORKSPACE_MODE_IDS],
    observedModeIds,
    missingModeIds,
    requiredActionIds: [...CONVERSATION_WRITING_WORKSPACE_ACTION_IDS],
    observedActionIds,
    missingActionIds,
    requiredFieldIds: [...CONVERSATION_WRITING_WORKSPACE_FIELD_IDS],
    workspaceModeCount: rows.length,
    allModesCovered: includesAll(observedModeIds, CONVERSATION_WRITING_WORKSPACE_MODE_IDS),
    allActionsCovered: includesAll(observedActionIds, CONVERSATION_WRITING_WORKSPACE_ACTION_IDS),
    readRequestCovered: observedModeIds.includes('read_request'),
    needFeedbackCovered: observedModeIds.includes('need_feedback'),
    assetpackReviewNoteCovered: observedModeIds.includes('assetpack_review_note'),
    terminalHandoffSummaryCovered: observedModeIds.includes('terminal_handoff_summary'),
    saveRestoreSummarizeHandoffCovered: includesAll(observedActionIds, CONVERSATION_WRITING_WORKSPACE_ACTION_IDS),
    localDraftKeysCovered: rowsWithoutLocalDraftKeys.length === 0,
    accessibilityCovered: rowsWithoutAccessibility.length === 0,
    recoveryStatesCovered: rowsWithoutRecovery.length === 0,
    proofRootsCovered: rowsWithoutProofRoots.length === 0,
    missingSourceRoots: rowsWithMissingSourceRoots,
    legacySourceRoots: rowsWithLegacySourceRoots.length > 0,
    credentialsSerialized: forbiddenMarkerDetected,
    protectedSourceVisible: rowsWithProtectedSourceVisible.length > 0,
    unpaidAssetPackSourceVisible: rowsWithUnpaidSourceVisible.length > 0,
    globalLedgerAuthorityClaimed: rowsClaimingLedgerAuthority.length > 0,
  };

  const artifactSeed = {
    version: CONVERSATION_WRITING_WORKSPACE_VERSION,
    currentTarget: CONVERSATION_WRITING_WORKSPACE_CURRENT_TARGET,
    rows,
    coverage,
    sourceSafetyVerdict: CONVERSATION_WRITING_WORKSPACE_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v37-conversation-writing-workspace',
    schemaId: CONVERSATION_WRITING_WORKSPACE_SCHEMA_ID,
    version: CONVERSATION_WRITING_WORKSPACE_VERSION,
    currentTarget: CONVERSATION_WRITING_WORKSPACE_CURRENT_TARGET,
    generatedAt,
    sourceSafetyVerdict: CONVERSATION_WRITING_WORKSPACE_SOURCE_SAFETY_VERDICT,
    disclosureBoundary: {
      workspaceMayExpose: [
        'workspace_mode',
        'draft_metrics',
        'source_safe_summary',
        'local_draft_state',
        'handoff_intent_metadata',
        'proof_roots',
        'event_ids',
        'recovery_state',
      ],
      workspaceMustNotExpose: [...FORBIDDEN_WORKSPACE_PAYLOAD_CLASSES],
    },
    passed: failures.length === 0,
    failures,
    coverage,
    requiredModeIds: [...CONVERSATION_WRITING_WORKSPACE_MODE_IDS],
    requiredActionIds: [...CONVERSATION_WRITING_WORKSPACE_ACTION_IDS],
    requiredFieldIds: [...CONVERSATION_WRITING_WORKSPACE_FIELD_IDS],
    rows,
    sourceEvidence: rows.map((row) => ({
      modeId: row.modeId,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `conversation-writing-workspace:${stableRoot(artifactSeed).slice('sha256:'.length, 'sha256:'.length + 24)}`,
  };
}
