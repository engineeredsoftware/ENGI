// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONVERSATION_SOURCE_SELECTOR_ARTIFACT_PATH = '.bitcode/v37-conversation-source-selector.json';
export const CONVERSATION_SOURCE_SELECTOR_SCHEMA_ID = 'bitcode.v37.conversationSourceSelector.v1';
export const CONVERSATION_SOURCE_SELECTOR_VERSION = 'V37';
export const CONVERSATION_SOURCE_SELECTOR_CURRENT_TARGET = 'V36';
export const CONVERSATION_SOURCE_SELECTOR_SOURCE_SAFETY_VERDICT =
  'source-safe-conversation-source-selector-metadata';

export const CONVERSATION_SOURCE_SELECTOR_KIND_IDS = Object.freeze([
  'repository',
  'branch',
  'commit',
  'deposit',
  'btd_range',
  'assetpack_preview',
  'document',
  'prior_conversation',
]);

export const CONVERSATION_SOURCE_SELECTOR_GOVERNANCE_IDS = Object.freeze([
  'account',
  'organization',
  'wallet',
  'rights',
  'settlement',
  'disclosure',
  'policy',
]);

export const CONVERSATION_SOURCE_SELECTOR_PREVIEW_STATES = Object.freeze([
  'allowed',
  'denied',
  'retry_required',
]);

export const CONVERSATION_SOURCE_SELECTOR_FIELD_IDS = Object.freeze([
  'selector_kind',
  'source_ref',
  'account_posture',
  'organization_posture',
  'wallet_posture',
  'rights_posture',
  'settlement_posture',
  'disclosure_posture',
  'policy_posture',
  'preview_policy',
  'denial_reason',
  'retry_action',
  'proof_roots',
  'event_ids',
]);

const FORBIDDEN_SELECTOR_PAYLOAD_CLASSES = Object.freeze([
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
 * @param {{
 *   selectorKind: string;
 *   label: string;
 *   sourceRefShape: string;
 *   previewSummary: string;
 *   allowedWhen: string[];
 *   deniedWhen: string[];
 *   retryWhen: string[];
 *   eventIds: string[];
 * }} input
 */
function selectorRow(input) {
  return {
    ...input,
    fieldIds: [...CONVERSATION_SOURCE_SELECTOR_FIELD_IDS],
    governanceIds: [...CONVERSATION_SOURCE_SELECTOR_GOVERNANCE_IDS],
    previewStates: [...CONVERSATION_SOURCE_SELECTOR_PREVIEW_STATES],
    sourceSafetyClass: 'source_safe_conversation_source_selector_metadata',
    previewPolicy: {
      mayExpose: [
        'selector_kind',
        'source_ref_summary',
        'source_safe_preview_label',
        'policy_verdict',
        'denial_reason',
        'retry_action',
        'proof_roots',
        'event_ids',
      ],
      mustNotExpose: [...FORBIDDEN_SELECTOR_PAYLOAD_CLASSES],
    },
    policyPosture: {
      account: 'requires_authenticated_account_scope',
      organization: 'requires_selected_organization_or_personal_scope',
      wallet: 'requires_wallet_presence_for_btd_or_settlement_bound_sources',
      rights: 'requires_reader_visible_rights_or_source_safe_preview_rights',
      settlement: 'requires_settlement_for_full_assetpack_or_btd_source_visibility',
      disclosure: 'source_safe_preview_only_before_rights_and_settlement',
      policy: 'fails_closed_until_all_applicable_policy_dimensions_are_known',
    },
  };
}

export const CONVERSATION_SOURCE_SELECTOR_ROWS = Object.freeze([
  selectorRow({
    selectorKind: 'repository',
    label: 'Repository source',
    sourceRefShape: 'provider/repository slug with optional default branch summary',
    previewSummary: 'Repository selectors expose repository identity and policy status, not repository source contents.',
    allowedWhen: ['account_connected', 'organization_allows_repository_context', 'disclosure_source_safe'],
    deniedWhen: ['account_missing', 'organization_denies_repository', 'repository_not_visible'],
    retryWhen: ['provider_connection_expired', 'repository_list_stale'],
    eventIds: ['conversation.source.repository.selected', 'conversation.source.repository.denied'],
  }),
  selectorRow({
    selectorKind: 'branch',
    label: 'Branch source',
    sourceRefShape: 'repository slug plus branch name',
    previewSummary: 'Branch selectors expose branch identity and freshness posture only.',
    allowedWhen: ['repository_allowed', 'branch_visible', 'disclosure_source_safe'],
    deniedWhen: ['repository_denied', 'branch_not_visible'],
    retryWhen: ['branch_refresh_required', 'provider_connection_expired'],
    eventIds: ['conversation.source.branch.selected', 'conversation.source.branch.retry_required'],
  }),
  selectorRow({
    selectorKind: 'commit',
    label: 'Commit source',
    sourceRefShape: 'repository slug plus branch and commit hash',
    previewSummary: 'Commit selectors expose commit identity, short hash, and proof roots only.',
    allowedWhen: ['repository_allowed', 'commit_visible', 'disclosure_source_safe'],
    deniedWhen: ['repository_denied', 'commit_not_visible'],
    retryWhen: ['commit_refresh_required', 'provider_connection_expired'],
    eventIds: ['conversation.source.commit.selected', 'conversation.source.commit.retry_required'],
  }),
  selectorRow({
    selectorKind: 'deposit',
    label: 'Deposit source',
    sourceRefShape: 'deposit id with depository evidence and depositor ownership posture',
    previewSummary: 'Deposit selectors expose source-safe deposit metadata, owner posture, and matching readiness.',
    allowedWhen: ['account_authenticated', 'deposit_discoverable', 'rights_preview_allowed'],
    deniedWhen: ['deposit_private_to_other_party', 'rights_denied', 'policy_denies_deposit_context'],
    retryWhen: ['deposit_index_refresh_required', 'rights_check_pending'],
    eventIds: ['conversation.source.deposit.selected', 'conversation.source.deposit.denied'],
  }),
  selectorRow({
    selectorKind: 'btd_range',
    label: 'BTD range source',
    sourceRefShape: 'BTD id range or deterministic BTD root range',
    previewSummary: 'BTD range selectors expose ownership and rights posture without private BTD source.',
    allowedWhen: ['wallet_present', 'rights_preview_allowed', 'btd_range_visible'],
    deniedWhen: ['wallet_missing', 'rights_denied', 'btd_range_not_visible'],
    retryWhen: ['wallet_connection_required', 'rights_check_pending'],
    eventIds: ['conversation.source.btd_range.selected', 'conversation.source.btd_range.denied'],
  }),
  selectorRow({
    selectorKind: 'assetpack_preview',
    label: 'AssetPack preview source',
    sourceRefShape: 'AssetPack preview id with measurement roots and settlement posture',
    previewSummary: 'AssetPack preview selectors expose measurements and preview metadata only until settlement.',
    allowedWhen: ['preview_visible', 'disclosure_source_safe', 'settlement_not_required_for_preview'],
    deniedWhen: ['preview_not_visible', 'policy_denies_preview', 'settlement_required_for_requested_detail'],
    retryWhen: ['preview_generation_pending', 'settlement_state_refresh_required'],
    eventIds: ['conversation.source.assetpack_preview.selected', 'conversation.source.assetpack_preview.retry_required'],
  }),
  selectorRow({
    selectorKind: 'document',
    label: 'Document source',
    sourceRefShape: 'document id, attachment id, or source-safe document reference',
    previewSummary: 'Document selectors expose title, type, owner, and redaction posture.',
    allowedWhen: ['document_attached_or_visible', 'disclosure_source_safe', 'policy_allows_document_context'],
    deniedWhen: ['document_not_visible', 'document_contains_unredacted_protected_source'],
    retryWhen: ['document_redaction_required', 'document_upload_pending'],
    eventIds: ['conversation.source.document.selected', 'conversation.source.document.retry_required'],
  }),
  selectorRow({
    selectorKind: 'prior_conversation',
    label: 'Prior conversation source',
    sourceRefShape: 'conversation id, message id, or source-safe summarized conversation root',
    previewSummary: 'Prior conversation selectors expose route-local summaries and proof roots only.',
    allowedWhen: ['conversation_owned_by_account', 'history_restorable', 'disclosure_source_safe'],
    deniedWhen: ['conversation_not_owned', 'history_redacted_or_deleted'],
    retryWhen: ['history_restore_required', 'redaction_checkpoint_pending'],
    eventIds: ['conversation.source.prior_conversation.selected', 'conversation.source.prior_conversation.denied'],
  }),
]);

/**
 * @param {{ generatedAt?: string; repoRoot?: string }} [input]
 */
export function buildConversationSourceSelector(input = {}) {
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const sharedSourceRoots = [
    'BITCODE_SPEC_V37.md',
    'BITCODE_SPEC_V37_DELTA.md',
    'BITCODE_SPEC_V37_NOTES.md',
    'BITCODE_SPEC_V37_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'packages/specifying/src/canonical/conversation-source-selector.js',
    'packages/specifying/test/conversation-source-selector.test.js',
    'scripts/generate-v37-conversation-source-selector.mjs',
    'scripts/check-v37-gate5-conversation-source-selector.mjs',
    'apps/uapi/components/conversations/models/conversation-source-selector.ts',
    'apps/uapi/components/conversations/ConversationSourceSelector/ConversationSourceSelector.tsx',
    'apps/uapi/components/conversations/ConversationsOverlay/ConversationsOverlay.tsx',
    'apps/uapi/app/conversations/README.md',
    'apps/uapi/tests/conversationSourceSelector.test.tsx',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  const rows = CONVERSATION_SOURCE_SELECTOR_ROWS.map((row) => {
    const sourceEvidence = sharedSourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const rowWithoutRoot = {
      ...row,
      sourceEvidence,
      freshnessChecks: [
        {
          checkId: `${row.selectorKind}.conversation-source-selector-row-present`,
          command: 'pnpm run check:v37-gate5',
          cadence: 'per_gate',
          failClosedOn: [
            'missing_selector_kind',
            'missing_policy_dimension',
            'missing_denial_state',
            'missing_retry_state',
            'protected_source_visible',
            'unpaid_assetpack_source_visible',
            'global_ledger_authority_claimed',
          ],
        },
      ],
    };

    const rowRoot = `conversation-source-selector-row:${sha256(
      row.selectorKind + canonicalJson(rowWithoutRoot),
    ).slice(0, 24)}`;
    const proofRoots = Object.fromEntries(
      CONVERSATION_SOURCE_SELECTOR_GOVERNANCE_IDS.map((field) => [
        `${field}PolicyRoot`,
        `conversation-source-selector-proof:${sha256(`${row.selectorKind}:${field}:${rowRoot}`).slice(0, 24)}`,
      ]),
    );

    return {
      ...rowWithoutRoot,
      proofRoots,
      rowRoot,
      detailRoot: `conversation-source-selector-detail:${sha256(
        row.selectorKind + canonicalJson(row.policyPosture),
      ).slice(0, 24)}`,
    };
  });

  const observedKindIds = rows.map((row) => row.selectorKind);
  const observedGovernanceIds = [...new Set(rows.flatMap((row) => row.governanceIds))];
  const observedPreviewStates = [...new Set(rows.flatMap((row) => row.previewStates))];
  const missingKindIds = CONVERSATION_SOURCE_SELECTOR_KIND_IDS.filter((kindId) => !observedKindIds.includes(kindId));
  const missingGovernanceIds = CONVERSATION_SOURCE_SELECTOR_GOVERNANCE_IDS.filter(
    (governanceId) => !observedGovernanceIds.includes(governanceId),
  );
  const missingPreviewStates = CONVERSATION_SOURCE_SELECTOR_PREVIEW_STATES.filter(
    (previewState) => !observedPreviewStates.includes(previewState),
  );
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);
  const rowsWithMissingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.selectorKind}:${entry.sourceRoot}`),
  );
  const rowsWithProtectedSourceVisible = rows.filter(
    (row) => !row.previewPolicy.mustNotExpose.includes('protected_source_payloads'),
  );
  const rowsWithUnpaidSourceVisible = rows.filter(
    (row) => !row.previewPolicy.mustNotExpose.includes('unpaid_assetpack_source'),
  );
  const rowsClaimingLedgerAuthority = rows.filter(
    (row) => !row.previewPolicy.mustNotExpose.includes('global_ledger_authority_claim'),
  );
  const rowsWithoutDenial = rows.filter((row) => row.deniedWhen.length === 0);
  const rowsWithoutRetry = rows.filter((row) => row.retryWhen.length === 0);
  const rowsWithoutProofRoots = rows.filter((row) =>
    CONVERSATION_SOURCE_SELECTOR_GOVERNANCE_IDS.some((field) => !row.proofRoots[`${field}PolicyRoot`]),
  );
  const rowsWithLegacySourceRoots = rows.filter((row) => row.sourceEvidence.some((entry) => entry.sourceRoot.startsWith('_legacy/')));

  const failures = [
    ...missingKindIds.map((kindId) => `missing required ConversationSourceSelector kind ${kindId}`),
    ...missingGovernanceIds.map((governanceId) => `missing required ConversationSourceSelector governance dimension ${governanceId}`),
    ...missingPreviewStates.map((previewState) => `missing required ConversationSourceSelector preview state ${previewState}`),
    ...rowsWithMissingSourceRoots.map((sourceRoot) => `missing Conversation source selector source root ${sourceRoot}`),
    ...(forbiddenMarkerDetected ? ['Conversation source selector contains a secret-shaped marker'] : []),
    ...rowsWithProtectedSourceVisible.map((row) => `Conversation source selector row ${row.selectorKind} lacks protected source boundary`),
    ...rowsWithUnpaidSourceVisible.map((row) => `Conversation source selector row ${row.selectorKind} lacks unpaid AssetPack source boundary`),
    ...rowsClaimingLedgerAuthority.map((row) => `Conversation source selector row ${row.selectorKind} can claim global ledger authority`),
    ...rowsWithoutDenial.map((row) => `Conversation source selector row ${row.selectorKind} lacks denial states`),
    ...rowsWithoutRetry.map((row) => `Conversation source selector row ${row.selectorKind} lacks retry states`),
    ...rowsWithoutProofRoots.map((row) => `Conversation source selector row ${row.selectorKind} lacks proof roots`),
    ...rowsWithLegacySourceRoots.map((row) => `Conversation source selector row ${row.selectorKind} points at _legacy source roots`),
  ];

  const coverage = {
    requiredKindIds: [...CONVERSATION_SOURCE_SELECTOR_KIND_IDS],
    observedKindIds,
    missingKindIds,
    requiredGovernanceIds: [...CONVERSATION_SOURCE_SELECTOR_GOVERNANCE_IDS],
    observedGovernanceIds,
    missingGovernanceIds,
    requiredPreviewStates: [...CONVERSATION_SOURCE_SELECTOR_PREVIEW_STATES],
    observedPreviewStates,
    missingPreviewStates,
    requiredFieldIds: [...CONVERSATION_SOURCE_SELECTOR_FIELD_IDS],
    selectorKindCount: rows.length,
    allKindsCovered: includesAll(observedKindIds, CONVERSATION_SOURCE_SELECTOR_KIND_IDS),
    allGovernanceCovered: includesAll(observedGovernanceIds, CONVERSATION_SOURCE_SELECTOR_GOVERNANCE_IDS),
    allPreviewStatesCovered: includesAll(observedPreviewStates, CONVERSATION_SOURCE_SELECTOR_PREVIEW_STATES),
    repositoryCovered: observedKindIds.includes('repository'),
    branchCovered: observedKindIds.includes('branch'),
    commitCovered: observedKindIds.includes('commit'),
    depositCovered: observedKindIds.includes('deposit'),
    btdRangeCovered: observedKindIds.includes('btd_range'),
    assetpackPreviewCovered: observedKindIds.includes('assetpack_preview'),
    documentCovered: observedKindIds.includes('document'),
    priorConversationCovered: observedKindIds.includes('prior_conversation'),
    denialStatesCovered: rowsWithoutDenial.length === 0,
    retryStatesCovered: rowsWithoutRetry.length === 0,
    proofRootsCovered: rowsWithoutProofRoots.length === 0,
    missingSourceRoots: rowsWithMissingSourceRoots,
    legacySourceRoots: rowsWithLegacySourceRoots.length > 0,
    credentialsSerialized: forbiddenMarkerDetected,
    protectedSourceVisible: rowsWithProtectedSourceVisible.length > 0,
    unpaidAssetPackSourceVisible: rowsWithUnpaidSourceVisible.length > 0,
    globalLedgerAuthorityClaimed: rowsClaimingLedgerAuthority.length > 0,
  };

  const artifactSeed = {
    version: CONVERSATION_SOURCE_SELECTOR_VERSION,
    currentTarget: CONVERSATION_SOURCE_SELECTOR_CURRENT_TARGET,
    rows,
    coverage,
    sourceSafetyVerdict: CONVERSATION_SOURCE_SELECTOR_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v37-conversation-source-selector',
    schemaId: CONVERSATION_SOURCE_SELECTOR_SCHEMA_ID,
    version: CONVERSATION_SOURCE_SELECTOR_VERSION,
    currentTarget: CONVERSATION_SOURCE_SELECTOR_CURRENT_TARGET,
    generatedAt,
    sourceSafetyVerdict: CONVERSATION_SOURCE_SELECTOR_SOURCE_SAFETY_VERDICT,
    disclosureBoundary: {
      selectorMayExpose: [
        'selector_kind',
        'source_ref_summary',
        'source_safe_preview_label',
        'policy_verdict',
        'denial_reason',
        'retry_action',
        'proof_roots',
        'event_ids',
      ],
      selectorMustNotExpose: [...FORBIDDEN_SELECTOR_PAYLOAD_CLASSES],
    },
    passed: failures.length === 0,
    failures,
    coverage,
    requiredKindIds: [...CONVERSATION_SOURCE_SELECTOR_KIND_IDS],
    requiredGovernanceIds: [...CONVERSATION_SOURCE_SELECTOR_GOVERNANCE_IDS],
    requiredPreviewStates: [...CONVERSATION_SOURCE_SELECTOR_PREVIEW_STATES],
    requiredFieldIds: [...CONVERSATION_SOURCE_SELECTOR_FIELD_IDS],
    rows,
    sourceEvidence: rows.map((row) => ({
      selectorKind: row.selectorKind,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `conversation-source-selector:${stableRoot(artifactSeed).slice('sha256:'.length, 'sha256:'.length + 24)}`,
  };
}
