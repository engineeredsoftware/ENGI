// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONVERSATION_PRODUCT_HANDOFF_ARTIFACT_PATH = '.bitcode/v37-conversation-product-handoff.json';
export const CONVERSATION_PRODUCT_HANDOFF_SCHEMA_ID = 'bitcode.v37.conversationTerminalHandoff.v1';
export const CONVERSATION_PRODUCT_HANDOFF_VERSION = 'V37';
export const CONVERSATION_PRODUCT_HANDOFF_CURRENT_TARGET = 'V36';
export const CONVERSATION_PRODUCT_HANDOFF_SOURCE_SAFETY_VERDICT =
  'source-safe-conversation-product-handoff-metadata';

export const CONVERSATION_PRODUCT_HANDOFF_WORKFLOW_IDS = Object.freeze([
  'depositing',
  'reading',
  'finding_fits',
  'exchange',
  'settlement',
  'delivery',
]);

export const CONVERSATION_PRODUCT_HANDOFF_FIELD_IDS = Object.freeze([
  'conversation_id',
  'message_root',
  'handoff_workflow',
  'transaction_id',
  'repository_anchor',
  'source_selector_refs',
  'source_safe_summary',
  'policy_result',
  'terminal_route',
  'transaction_detail',
  'proof_roots',
  'event_ids',
]);

export const CONVERSATION_PRODUCT_HANDOFF_AUTHORITY_IDS = Object.freeze([
  'terminal_transaction_cockpit',
  'ledger_authority_boundary',
  'wallet_authority_boundary',
  'source_disclosure_boundary',
  'retry_repair_boundary',
]);

export const CONVERSATION_PRODUCT_HANDOFF_POLICY_STATES = Object.freeze([
  'allowed',
  'retry_required',
  'denied',
]);

const FORBIDDEN_HANDOFF_PAYLOAD_CLASSES = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'protected_source_payloads',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'unpaid_assetpack_source',
  'settlement_private_payloads',
  'ledger_write_authority',
  'wallet_signing_authority',
  'terminal_transaction_authority_bypass',
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
 *   workflowId: string;
 *   label: string;
 *   productDetail: string;
 *   routeIntent: string;
 *   receives: string[];
 *   blockedPayloads: string[];
 *   retryWhen: string[];
 *   eventIds: string[];
 * }} input
 */
function handoffRow(input) {
  return {
    ...input,
    fieldIds: [...CONVERSATION_PRODUCT_HANDOFF_FIELD_IDS],
    authorityIds: [...CONVERSATION_PRODUCT_HANDOFF_AUTHORITY_IDS],
    policyStates: [...CONVERSATION_PRODUCT_HANDOFF_POLICY_STATES],
    sourceSafetyClass: 'source_safe_conversation_product_handoff_metadata',
    terminalAuthority: {
      productRemainsTransactionWorkspace: true,
      conversationMayPrepareIntent: true,
      conversationMayWriteLedger: false,
      conversationMaySignWalletOperations: false,
      conversationMayExposeProtectedSource: false,
      conversationMayExposeUnpaidAssetPackSource: false,
    },
    routePolicy: {
      mayExpose: [
        'conversation_id',
        'handoff_workflow',
        'transaction_id',
        'repository_anchor',
        'source_selector_refs',
        'source_safe_summary',
        'policy_result',
        'terminal_route',
        'transaction_detail',
        'proof_roots',
        'event_ids',
      ],
      mustNotExpose: [...FORBIDDEN_HANDOFF_PAYLOAD_CLASSES],
    },
  };
}

export const CONVERSATION_PRODUCT_HANDOFF_ROWS = Object.freeze([
  handoffRow({
    workflowId: 'depositing',
    label: 'Depositing handoff',
    productDetail: 'activity',
    routeIntent: 'prepare-deposit',
    receives: ['repository_anchor', 'source_selector_refs', 'source_safe_summary', 'policy_result'],
    blockedPayloads: ['protected_source_payloads', 'provider_tokens', 'wallet_private_material'],
    retryWhen: ['repository_context_missing', 'policy_unknown', 'provider_connection_expired'],
    eventIds: ['conversation.terminal_handoff.depositing.prepared', 'conversation.terminal_handoff.depositing.retry_required'],
  }),
  handoffRow({
    workflowId: 'reading',
    label: 'Reading handoff',
    productDetail: 'transaction',
    routeIntent: 'prepare-read',
    receives: ['repository_anchor', 'source_selector_refs', 'source_safe_summary', 'policy_result'],
    blockedPayloads: ['raw_protected_prompts', 'protected_source_payloads', 'raw_model_responses_with_protected_source'],
    retryWhen: ['read_request_summary_missing', 'source_selector_retry_required', 'policy_unknown'],
    eventIds: ['conversation.terminal_handoff.reading.prepared', 'conversation.terminal_handoff.reading.denied'],
  }),
  handoffRow({
    workflowId: 'finding_fits',
    label: 'Finding Fits handoff',
    productDetail: 'activity',
    routeIntent: 'prepare-finding-fits',
    receives: ['transaction_id', 'repository_anchor', 'source_selector_refs', 'source_safe_summary', 'policy_result'],
    blockedPayloads: ['unpaid_assetpack_source', 'protected_source_payloads', 'raw_model_responses_with_protected_source'],
    retryWhen: ['need_root_missing', 'read_activity_missing', 'depository_policy_unknown'],
    eventIds: ['conversation.terminal_handoff.finding_fits.prepared', 'conversation.terminal_handoff.finding_fits.retry_required'],
  }),
  handoffRow({
    workflowId: 'exchange',
    label: 'Exchange handoff',
    productDetail: 'activity',
    routeIntent: 'prepare-exchange-review',
    receives: ['transaction_id', 'source_selector_refs', 'source_safe_summary', 'policy_result'],
    blockedPayloads: ['private_buyer_payloads', 'wallet_private_material', 'settlement_private_payloads'],
    retryWhen: ['rights_preview_missing', 'wallet_policy_unknown', 'exchange_activity_missing'],
    eventIds: ['conversation.terminal_handoff.exchange.prepared', 'conversation.terminal_handoff.exchange.denied'],
  }),
  handoffRow({
    workflowId: 'settlement',
    label: 'Settlement handoff',
    productDetail: 'wallet-btc',
    routeIntent: 'prepare-settlement-review',
    receives: ['transaction_id', 'source_selector_refs', 'source_safe_summary', 'policy_result'],
    blockedPayloads: ['wallet_private_material', 'ledger_write_authority', 'wallet_signing_authority'],
    retryWhen: ['wallet_missing', 'settlement_quote_stale', 'policy_unknown'],
    eventIds: ['conversation.terminal_handoff.settlement.prepared', 'conversation.terminal_handoff.settlement.retry_required'],
  }),
  handoffRow({
    workflowId: 'delivery',
    label: 'Delivery handoff',
    productDetail: 'shippables',
    routeIntent: 'prepare-delivery-review',
    receives: ['transaction_id', 'repository_anchor', 'source_selector_refs', 'source_safe_summary', 'policy_result'],
    blockedPayloads: ['unpaid_assetpack_source', 'protected_source_payloads', 'provider_tokens'],
    retryWhen: ['settlement_not_final', 'delivery_target_missing', 'repository_context_missing'],
    eventIds: ['conversation.terminal_handoff.delivery.prepared', 'conversation.terminal_handoff.delivery.denied'],
  }),
]);

/**
 * @param {{ generatedAt?: string; repoRoot?: string }} [input]
 */
export function buildConversationProductHandoff(input = {}) {
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const sharedSourceRoots = [
    'specifications/BITCODE_SPEC_V37.md',
    'specifications/BITCODE_SPEC_V37_DELTA.md',
    'specifications/BITCODE_SPEC_V37_NOTES.md',
    'specifications/BITCODE_SPEC_V37_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'scripts/specifying/src/canonical/conversation-product-handoff.js',
    'scripts/specifying/test/conversation-product-handoff.test.js',
    'scripts/generate-v37-conversation-product-handoff.mjs',
    'scripts/check-v37-gate6-conversation-product-handoff.mjs',
    'apps/uapi/components/conversations/models/conversation-product-handoff.ts',
    'apps/uapi/components/conversations/ConversationProductHandoff/ConversationProductHandoff.tsx',
    'apps/uapi/components/conversations/ConversationsOverlay/ConversationsOverlay.tsx',
    'apps/uapi/components/bitcode/pipeline/models/pipeline-selection-query.ts',
    'apps/uapi/components/reads/ReadPageClient/ReadPageClient.tsx',
    'apps/uapi/app/conversations/README.md',
    'apps/uapi/components/README.md',
    'apps/uapi/components/conversations/ConversationProductHandoff/ConversationProductHandoff.tsx',
    'apps/uapi/tests/pipelineSelectionQuery.test.ts',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  const rows = CONVERSATION_PRODUCT_HANDOFF_ROWS.map((row) => {
    const sourceEvidence = sharedSourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const rowWithoutRoot = {
      ...row,
      sourceEvidence,
      freshnessChecks: [
        {
          checkId: `${row.workflowId}.conversation-product-handoff-row-present`,
          command: 'pnpm run check:v37-gate6',
          cadence: 'per_gate',
          failClosedOn: [
            'missing_terminal_workflow',
            'terminal_authority_bypass',
            'protected_source_visible',
            'unpaid_assetpack_source_visible',
            'wallet_signing_authority_claimed',
            'ledger_write_authority_claimed',
          ],
        },
      ],
    };

    const rowRoot = `conversation-product-handoff-row:${sha256(
      row.workflowId + canonicalJson(rowWithoutRoot),
    ).slice(0, 24)}`;
    const proofRoots = Object.fromEntries(
      CONVERSATION_PRODUCT_HANDOFF_AUTHORITY_IDS.map((field) => [
        `${field}Root`,
        `conversation-product-handoff-proof:${sha256(`${row.workflowId}:${field}:${rowRoot}`).slice(0, 24)}`,
      ]),
    );

    return {
      ...rowWithoutRoot,
      proofRoots,
      rowRoot,
      detailRoot: `conversation-product-handoff-detail:${sha256(
        row.workflowId + canonicalJson(row.routePolicy),
      ).slice(0, 24)}`,
    };
  });

  const observedWorkflowIds = rows.map((row) => row.workflowId);
  const observedFieldIds = [...new Set(rows.flatMap((row) => row.fieldIds))];
  const observedAuthorityIds = [...new Set(rows.flatMap((row) => row.authorityIds))];
  const observedPolicyStates = [...new Set(rows.flatMap((row) => row.policyStates))];
  const missingWorkflowIds = CONVERSATION_PRODUCT_HANDOFF_WORKFLOW_IDS.filter(
    (workflowId) => !observedWorkflowIds.includes(workflowId),
  );
  const missingFieldIds = CONVERSATION_PRODUCT_HANDOFF_FIELD_IDS.filter(
    (fieldId) => !observedFieldIds.includes(fieldId),
  );
  const missingAuthorityIds = CONVERSATION_PRODUCT_HANDOFF_AUTHORITY_IDS.filter(
    (authorityId) => !observedAuthorityIds.includes(authorityId),
  );
  const missingPolicyStates = CONVERSATION_PRODUCT_HANDOFF_POLICY_STATES.filter(
    (policyState) => !observedPolicyStates.includes(policyState),
  );
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);
  const rowsWithMissingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.workflowId}:${entry.sourceRoot}`),
  );
  const rowsWithProtectedSourceVisible = rows.filter(
    (row) => !row.routePolicy.mustNotExpose.includes('protected_source_payloads'),
  );
  const rowsWithUnpaidSourceVisible = rows.filter(
    (row) => !row.routePolicy.mustNotExpose.includes('unpaid_assetpack_source'),
  );
  const rowsClaimingLedgerAuthority = rows.filter((row) => row.terminalAuthority.conversationMayWriteLedger !== false);
  const rowsClaimingWalletAuthority = rows.filter((row) => row.terminalAuthority.conversationMaySignWalletOperations !== false);
  const rowsBypassingTerminal = rows.filter((row) => row.terminalAuthority.productRemainsTransactionWorkspace !== true);
  const rowsWithoutRetry = rows.filter((row) => row.retryWhen.length === 0);
  const rowsWithoutProofRoots = rows.filter((row) =>
    CONVERSATION_PRODUCT_HANDOFF_AUTHORITY_IDS.some((field) => !row.proofRoots[`${field}Root`]),
  );
  const rowsWithLegacySourceRoots = rows.filter((row) => row.sourceEvidence.some((entry) => entry.sourceRoot.startsWith('_legacy/')));

  const failures = [
    ...missingWorkflowIds.map((workflowId) => `missing required ConversationProductHandoff workflow ${workflowId}`),
    ...missingFieldIds.map((fieldId) => `missing required ConversationProductHandoff field ${fieldId}`),
    ...missingAuthorityIds.map((authorityId) => `missing required ConversationProductHandoff authority boundary ${authorityId}`),
    ...missingPolicyStates.map((policyState) => `missing required ConversationProductHandoff policy state ${policyState}`),
    ...rowsWithMissingSourceRoots.map((sourceRoot) => `missing Conversation terminal handoff source root ${sourceRoot}`),
    ...(forbiddenMarkerDetected ? ['Conversation terminal handoff contains a secret-shaped marker'] : []),
    ...rowsWithProtectedSourceVisible.map((row) => `Conversation terminal handoff row ${row.workflowId} lacks protected source boundary`),
    ...rowsWithUnpaidSourceVisible.map((row) => `Conversation terminal handoff row ${row.workflowId} lacks unpaid AssetPack source boundary`),
    ...rowsClaimingLedgerAuthority.map((row) => `Conversation terminal handoff row ${row.workflowId} claims ledger authority`),
    ...rowsClaimingWalletAuthority.map((row) => `Conversation terminal handoff row ${row.workflowId} claims wallet signing authority`),
    ...rowsBypassingTerminal.map((row) => `Conversation terminal handoff row ${row.workflowId} bypasses product cockpit`),
    ...rowsWithoutRetry.map((row) => `Conversation terminal handoff row ${row.workflowId} lacks retry states`),
    ...rowsWithoutProofRoots.map((row) => `Conversation terminal handoff row ${row.workflowId} lacks proof roots`),
    ...rowsWithLegacySourceRoots.map((row) => `Conversation terminal handoff row ${row.workflowId} points at _legacy source roots`),
  ];

  const coverage = {
    requiredWorkflowIds: [...CONVERSATION_PRODUCT_HANDOFF_WORKFLOW_IDS],
    observedWorkflowIds,
    missingWorkflowIds,
    requiredFieldIds: [...CONVERSATION_PRODUCT_HANDOFF_FIELD_IDS],
    observedFieldIds,
    missingFieldIds,
    requiredAuthorityIds: [...CONVERSATION_PRODUCT_HANDOFF_AUTHORITY_IDS],
    observedAuthorityIds,
    missingAuthorityIds,
    requiredPolicyStates: [...CONVERSATION_PRODUCT_HANDOFF_POLICY_STATES],
    observedPolicyStates,
    missingPolicyStates,
    workflowCount: rows.length,
    allWorkflowsCovered: includesAll(observedWorkflowIds, CONVERSATION_PRODUCT_HANDOFF_WORKFLOW_IDS),
    allFieldsCovered: includesAll(observedFieldIds, CONVERSATION_PRODUCT_HANDOFF_FIELD_IDS),
    allAuthorityBoundariesCovered: includesAll(observedAuthorityIds, CONVERSATION_PRODUCT_HANDOFF_AUTHORITY_IDS),
    allPolicyStatesCovered: includesAll(observedPolicyStates, CONVERSATION_PRODUCT_HANDOFF_POLICY_STATES),
    depositingCovered: observedWorkflowIds.includes('depositing'),
    readingCovered: observedWorkflowIds.includes('reading'),
    findingFitsCovered: observedWorkflowIds.includes('finding_fits'),
    exchangeCovered: observedWorkflowIds.includes('exchange'),
    settlementCovered: observedWorkflowIds.includes('settlement'),
    deliveryCovered: observedWorkflowIds.includes('delivery'),
    retryStatesCovered: rowsWithoutRetry.length === 0,
    proofRootsCovered: rowsWithoutProofRoots.length === 0,
    missingSourceRoots: rowsWithMissingSourceRoots,
    legacySourceRoots: rowsWithLegacySourceRoots.length > 0,
    credentialsSerialized: forbiddenMarkerDetected,
    protectedSourceVisible: rowsWithProtectedSourceVisible.length > 0,
    unpaidAssetPackSourceVisible: rowsWithUnpaidSourceVisible.length > 0,
    ledgerAuthorityClaimed: rowsClaimingLedgerAuthority.length > 0,
    walletSigningAuthorityClaimed: rowsClaimingWalletAuthority.length > 0,
    terminalCockpitBypassed: rowsBypassingTerminal.length > 0,
  };

  const artifactSeed = {
    version: CONVERSATION_PRODUCT_HANDOFF_VERSION,
    currentTarget: CONVERSATION_PRODUCT_HANDOFF_CURRENT_TARGET,
    rows,
    coverage,
    sourceSafetyVerdict: CONVERSATION_PRODUCT_HANDOFF_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v37-conversation-product-handoff',
    schemaId: CONVERSATION_PRODUCT_HANDOFF_SCHEMA_ID,
    version: CONVERSATION_PRODUCT_HANDOFF_VERSION,
    currentTarget: CONVERSATION_PRODUCT_HANDOFF_CURRENT_TARGET,
    generatedAt,
    sourceSafetyVerdict: CONVERSATION_PRODUCT_HANDOFF_SOURCE_SAFETY_VERDICT,
    disclosureBoundary: {
      handoffMayExpose: [
        'conversation_id',
        'handoff_workflow',
        'transaction_id',
        'repository_anchor',
        'source_selector_refs',
        'source_safe_summary',
        'policy_result',
        'terminal_route',
        'transaction_detail',
        'proof_roots',
        'event_ids',
      ],
      handoffMustNotExpose: [...FORBIDDEN_HANDOFF_PAYLOAD_CLASSES],
    },
    passed: failures.length === 0,
    failures,
    coverage,
    requiredWorkflowIds: [...CONVERSATION_PRODUCT_HANDOFF_WORKFLOW_IDS],
    requiredFieldIds: [...CONVERSATION_PRODUCT_HANDOFF_FIELD_IDS],
    requiredAuthorityIds: [...CONVERSATION_PRODUCT_HANDOFF_AUTHORITY_IDS],
    requiredPolicyStates: [...CONVERSATION_PRODUCT_HANDOFF_POLICY_STATES],
    rows,
    sourceEvidence: rows.map((row) => ({
      workflowId: row.workflowId,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `conversation-product-handoff:${stableRoot(artifactSeed).slice('sha256:'.length, 'sha256:'.length + 24)}`,
  };
}
