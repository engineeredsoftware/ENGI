// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONVERSATION_PERSISTENCE_PRIVACY_ARTIFACT_PATH =
  '.bitcode/v37-conversation-persistence-privacy-redaction.json';
export const CONVERSATION_PERSISTENCE_PRIVACY_SCHEMA_ID =
  'bitcode.v37.conversationPersistencePrivacyRedaction.v1';
export const CONVERSATION_PERSISTENCE_PRIVACY_VERSION = 'V37';
export const CONVERSATION_PERSISTENCE_PRIVACY_CURRENT_TARGET = 'V36';
export const CONVERSATION_PERSISTENCE_PRIVACY_SOURCE_SAFETY_VERDICT =
  'source-safe-conversation-persistence-privacy-redaction-metadata';

export const CONVERSATION_PERSISTENCE_VISIBILITY_TIER_IDS = Object.freeze([
  'public',
  'user_visible',
  'organization_visible',
  'buyer_visible',
  'reviewer_visible',
  'operator_only',
]);

export const CONVERSATION_PERSISTENCE_OPERATION_IDS = Object.freeze([
  'persist_message',
  'restore_history',
  'export_history',
  'delete_history',
  'retain_history',
  'replay_history',
  'incident_repair',
]);

export const CONVERSATION_PERSISTENCE_RETENTION_POSTURES = Object.freeze([
  'route_local_ephemeral',
  'durable_user_visible',
  'durable_organization_visible',
  'buyer_rights_visible',
  'reviewer_limited_visible',
  'operator_audit_only',
  'deletion_tombstone',
]);

export const CONVERSATION_PERSISTENCE_FIELD_IDS = Object.freeze([
  'conversation_id',
  'message_id',
  'actor_id',
  'visibility_tier',
  'source_context_refs',
  'redaction_posture',
  'retention_posture',
  'export_posture',
  'delete_posture',
  'replay_posture',
  'incident_repair_posture',
  'proof_roots',
  'event_ids',
]);

export const CONVERSATION_PERSISTENCE_FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
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
 *   operationId: string;
 *   label: string;
 *   defaultVisibilityTier: string;
 *   retentionPosture: string;
 *   sourceSafeSummary: string;
 *   mayExpose: string[];
 *   blockedPayloads: string[];
 *   requiredPostures: string[];
 *   eventIds: string[];
 * }} input
 */
function persistenceRow(input) {
  return {
    ...input,
    fieldIds: [...CONVERSATION_PERSISTENCE_FIELD_IDS],
    visibilityTierIds: [...CONVERSATION_PERSISTENCE_VISIBILITY_TIER_IDS],
    retentionPostures: [...CONVERSATION_PERSISTENCE_RETENTION_POSTURES],
    sourceSafetyClass: 'source_safe_conversation_persistence_privacy_redaction_metadata',
    storagePolicy: {
      routeLocalProjection: true,
      globalLedgerTruth: false,
      mayPersistProtectedPromptBodies: false,
      mayPersistProtectedModelResponseBodies: false,
      mayPersistWalletPrivateMaterial: false,
      mayPersistUnpaidAssetPackSource: false,
      mayPersistSourceBearingContextOnlyAsRefs: true,
      mustSeparateVisibilityTiers: true,
      mustAttachProofRoots: true,
    },
    disclosurePolicy: {
      mayExpose: input.mayExpose,
      mustNotExpose: [...CONVERSATION_PERSISTENCE_FORBIDDEN_PAYLOAD_CLASSES, ...input.blockedPayloads],
    },
  };
}

export const CONVERSATION_PERSISTENCE_PRIVACY_ROWS = Object.freeze([
  persistenceRow({
    operationId: 'persist_message',
    label: 'Persist conversation message safely',
    defaultVisibilityTier: 'user_visible',
    retentionPosture: 'durable_user_visible',
    sourceSafeSummary:
      'Message content and rich-input metadata are redacted before durable storage; source-bearing context is retained only as references and proof roots.',
    mayExpose: [
      'conversation_id',
      'message_id',
      'role',
      'source_safe_content',
      'source_context_refs',
      'proof_roots',
      'event_ids',
    ],
    blockedPayloads: ['raw_protected_prompts', 'provider_tokens', 'protected_source_payloads'],
    requiredPostures: ['redaction_posture', 'retention_posture', 'proof_roots'],
    eventIds: ['conversation.persistence.message.redacted', 'conversation.persistence.message.persisted'],
  }),
  persistenceRow({
    operationId: 'restore_history',
    label: 'Restore route-local conversation history',
    defaultVisibilityTier: 'user_visible',
    retentionPosture: 'durable_user_visible',
    sourceSafeSummary:
      'Restore reads durable route-local history while preserving visibility tier filters and redaction checkpoints.',
    mayExpose: [
      'conversation_id',
      'message_ids',
      'source_safe_content',
      'visibility_tier',
      'history_refs',
      'proof_roots',
      'event_ids',
    ],
    blockedPayloads: ['operator_private_notes', 'settlement_private_payloads', 'unpaid_assetpack_source'],
    requiredPostures: ['redaction_posture', 'replay_posture', 'retention_posture'],
    eventIds: ['conversation.persistence.history.restored', 'conversation.persistence.history.redaction_checked'],
  }),
  persistenceRow({
    operationId: 'export_history',
    label: 'Export source-safe conversation history',
    defaultVisibilityTier: 'user_visible',
    retentionPosture: 'durable_user_visible',
    sourceSafeSummary:
      'Exports include only the requesting principal visible tiers and omit protected prompts, protected model responses, source bodies, and private material.',
    mayExpose: [
      'conversation_id',
      'message_ids',
      'source_safe_content',
      'export_manifest_root',
      'visibility_tier',
      'proof_roots',
      'event_ids',
    ],
    blockedPayloads: ['protected_source_payloads', 'raw_model_responses_with_protected_source', 'wallet_private_material'],
    requiredPostures: ['export_posture', 'redaction_posture', 'proof_roots'],
    eventIds: ['conversation.persistence.export.prepared', 'conversation.persistence.export.redacted'],
  }),
  persistenceRow({
    operationId: 'delete_history',
    label: 'Delete conversation history with tombstone proof',
    defaultVisibilityTier: 'operator_only',
    retentionPosture: 'deletion_tombstone',
    sourceSafeSummary:
      'Deletes user-visible records while retaining only a source-safe tombstone proof for audit and incident repair.',
    mayExpose: [
      'conversation_id',
      'deletion_tombstone_root',
      'deleted_message_count',
      'retention_posture',
      'proof_roots',
      'event_ids',
    ],
    blockedPayloads: ['source_safe_content', 'protected_source_payloads', 'operator_private_notes'],
    requiredPostures: ['delete_posture', 'retention_posture', 'incident_repair_posture'],
    eventIds: ['conversation.persistence.delete.requested', 'conversation.persistence.delete.tombstoned'],
  }),
  persistenceRow({
    operationId: 'retain_history',
    label: 'Apply retention posture',
    defaultVisibilityTier: 'organization_visible',
    retentionPosture: 'durable_organization_visible',
    sourceSafeSummary:
      'Retention separates personal, organization, buyer, reviewer, and operator audit views without escalating visibility.',
    mayExpose: [
      'conversation_id',
      'retention_policy_id',
      'visibility_tier',
      'retention_expires_at',
      'proof_roots',
      'event_ids',
    ],
    blockedPayloads: ['raw_protected_prompts', 'private_payment_credentials', 'wallet_private_material'],
    requiredPostures: ['retention_posture', 'redaction_posture', 'proof_roots'],
    eventIds: ['conversation.persistence.retention.applied', 'conversation.persistence.retention.expiry_scheduled'],
  }),
  persistenceRow({
    operationId: 'replay_history',
    label: 'Replay history into a stream safely',
    defaultVisibilityTier: 'reviewer_visible',
    retentionPosture: 'reviewer_limited_visible',
    sourceSafeSummary:
      'Replay reconstructs only source-safe prompt/result shapes and route-local proof roots, never raw protected prompt or response bodies.',
    mayExpose: [
      'conversation_id',
      'message_ids',
      'prompt_template_ids',
      'parsed_result_shapes',
      'replay_root',
      'proof_roots',
      'event_ids',
    ],
    blockedPayloads: ['raw_protected_prompts', 'raw_model_responses_with_protected_source', 'protected_source_payloads'],
    requiredPostures: ['replay_posture', 'redaction_posture', 'proof_roots'],
    eventIds: ['conversation.persistence.replay.prepared', 'conversation.persistence.replay.redacted'],
  }),
  persistenceRow({
    operationId: 'incident_repair',
    label: 'Repair persistence incident without disclosure escalation',
    defaultVisibilityTier: 'operator_only',
    retentionPosture: 'operator_audit_only',
    sourceSafeSummary:
      'Incident repair can inspect proof roots and redaction verdicts but cannot expose protected source, raw prompts, wallet material, or unpaid AssetPack source.',
    mayExpose: [
      'conversation_id',
      'incident_id',
      'redaction_verdict',
      'repair_action_id',
      'operator_audit_root',
      'proof_roots',
      'event_ids',
    ],
    blockedPayloads: ['operator_private_notes', 'ledger_write_authority', 'wallet_signing_authority'],
    requiredPostures: ['incident_repair_posture', 'redaction_posture', 'proof_roots'],
    eventIds: ['conversation.persistence.incident.detected', 'conversation.persistence.incident.repaired'],
  }),
]);

/**
 * @param {{ generatedAt?: string; repoRoot?: string }} [input]
 */
export function buildConversationPersistencePrivacyRedaction(input = {}) {
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const sharedSourceRoots = [
    'BITCODE_SPEC_V37.md',
    'BITCODE_SPEC_V37_DELTA.md',
    'BITCODE_SPEC_V37_NOTES.md',
    'BITCODE_SPEC_V37_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'packages/specifying/src/canonical/conversation-persistence-privacy-redaction.js',
    'packages/specifying/test/conversation-persistence-privacy-redaction.test.js',
    'scripts/generate-v37-conversation-persistence-privacy-redaction.mjs',
    'scripts/check-v37-gate7-conversation-persistence-privacy-redaction.mjs',
    'packages/api/src/conversations/privacy.ts',
    'packages/api/src/conversations/__tests__/privacy.test.ts',
    'uapi/components/conversations/models/conversation-persistence-privacy-redaction.ts',
    'uapi/tests/api/conversationPersistencePrivacyRedaction.test.ts',
    'uapi/app/conversations/README.md',
    'packages/specifying/README.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  const rows = CONVERSATION_PERSISTENCE_PRIVACY_ROWS.map((row) => {
    const sourceEvidence = sharedSourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const rowWithoutRoot = {
      ...row,
      sourceEvidence,
      freshnessChecks: [
        {
          checkId: `${row.operationId}.conversation-persistence-privacy-row-present`,
          command: 'pnpm run check:v37-gate7',
          cadence: 'per_gate',
          failClosedOn: [
            'missing_visibility_tier',
            'missing_retention_posture',
            'protected_prompt_visible',
            'protected_model_response_visible',
            'source_body_visible',
            'wallet_private_material_visible',
            'unpaid_assetpack_source_visible',
          ],
        },
      ],
    };

    const rowRoot = `conversation-persistence-privacy-row:${sha256(
      row.operationId + canonicalJson(rowWithoutRoot),
    ).slice(0, 24)}`;
    const proofRoots = Object.fromEntries(
      CONVERSATION_PERSISTENCE_FIELD_IDS.map((field) => [
        `${field.replace(/_([a-z])/gu, (_match, char) => String(char).toUpperCase())}Root`,
        `conversation-persistence-privacy-proof:${sha256(`${row.operationId}:${field}:${rowRoot}`).slice(0, 24)}`,
      ]),
    );

    return {
      ...rowWithoutRoot,
      proofRoots,
      rowRoot,
      detailRoot: `conversation-persistence-privacy-detail:${sha256(
        row.operationId + canonicalJson(row.disclosurePolicy),
      ).slice(0, 24)}`,
    };
  });

  const observedOperationIds = rows.map((row) => row.operationId);
  const observedVisibilityTiers = [...new Set(rows.flatMap((row) => row.visibilityTierIds))];
  const observedRetentionPostures = [...new Set(rows.flatMap((row) => row.retentionPostures))];
  const observedFieldIds = [...new Set(rows.flatMap((row) => row.fieldIds))];
  const missingOperationIds = CONVERSATION_PERSISTENCE_OPERATION_IDS.filter(
    (operationId) => !observedOperationIds.includes(operationId),
  );
  const missingVisibilityTierIds = CONVERSATION_PERSISTENCE_VISIBILITY_TIER_IDS.filter(
    (tierId) => !observedVisibilityTiers.includes(tierId),
  );
  const missingRetentionPostures = CONVERSATION_PERSISTENCE_RETENTION_POSTURES.filter(
    (posture) => !observedRetentionPostures.includes(posture),
  );
  const missingFieldIds = CONVERSATION_PERSISTENCE_FIELD_IDS.filter((fieldId) => !observedFieldIds.includes(fieldId));
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);
  const rowsWithMissingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.operationId}:${entry.sourceRoot}`),
  );
  const rowsWithProtectedPromptVisible = rows.filter(
    (row) => !row.disclosurePolicy.mustNotExpose.includes('raw_protected_prompts'),
  );
  const rowsWithProtectedResponseVisible = rows.filter(
    (row) => !row.disclosurePolicy.mustNotExpose.includes('raw_model_responses_with_protected_source'),
  );
  const rowsWithProtectedSourceVisible = rows.filter(
    (row) => !row.disclosurePolicy.mustNotExpose.includes('protected_source_payloads'),
  );
  const rowsWithUnpaidSourceVisible = rows.filter(
    (row) => !row.disclosurePolicy.mustNotExpose.includes('unpaid_assetpack_source'),
  );
  const rowsWithWalletPrivateVisible = rows.filter(
    (row) => !row.disclosurePolicy.mustNotExpose.includes('wallet_private_material'),
  );
  const rowsPersistingProtectedBodies = rows.filter(
    (row) =>
      row.storagePolicy.mayPersistProtectedPromptBodies !== false ||
      row.storagePolicy.mayPersistProtectedModelResponseBodies !== false,
  );
  const rowsMissingVisibilitySeparation = rows.filter((row) => row.storagePolicy.mustSeparateVisibilityTiers !== true);
  const rowsMissingProofRoots = rows.filter((row) =>
    CONVERSATION_PERSISTENCE_FIELD_IDS.some((field) => {
      const key = `${field.replace(/_([a-z])/gu, (_match, char) => String(char).toUpperCase())}Root`;
      return !row.proofRoots[key];
    }),
  );
  const rowsWithLegacySourceRoots = rows.filter((row) => row.sourceEvidence.some((entry) => entry.sourceRoot.startsWith('_legacy/')));

  const failures = [
    ...missingOperationIds.map((operationId) => `missing required ConversationPersistencePrivacy operation ${operationId}`),
    ...missingVisibilityTierIds.map((tierId) => `missing required ConversationPersistencePrivacy visibility tier ${tierId}`),
    ...missingRetentionPostures.map((posture) => `missing required ConversationPersistencePrivacy retention posture ${posture}`),
    ...missingFieldIds.map((fieldId) => `missing required ConversationPersistencePrivacy field ${fieldId}`),
    ...rowsWithMissingSourceRoots.map((sourceRoot) => `missing Conversation persistence privacy source root ${sourceRoot}`),
    ...(forbiddenMarkerDetected ? ['Conversation persistence privacy contains a secret-shaped marker'] : []),
    ...rowsWithProtectedPromptVisible.map((row) => `Conversation persistence privacy row ${row.operationId} lacks prompt boundary`),
    ...rowsWithProtectedResponseVisible.map((row) => `Conversation persistence privacy row ${row.operationId} lacks response boundary`),
    ...rowsWithProtectedSourceVisible.map((row) => `Conversation persistence privacy row ${row.operationId} lacks protected source boundary`),
    ...rowsWithUnpaidSourceVisible.map((row) => `Conversation persistence privacy row ${row.operationId} lacks unpaid AssetPack source boundary`),
    ...rowsWithWalletPrivateVisible.map((row) => `Conversation persistence privacy row ${row.operationId} lacks wallet private boundary`),
    ...rowsPersistingProtectedBodies.map((row) => `Conversation persistence privacy row ${row.operationId} persists protected bodies`),
    ...rowsMissingVisibilitySeparation.map((row) => `Conversation persistence privacy row ${row.operationId} lacks visibility separation`),
    ...rowsMissingProofRoots.map((row) => `Conversation persistence privacy row ${row.operationId} lacks proof roots`),
    ...rowsWithLegacySourceRoots.map((row) => `Conversation persistence privacy row ${row.operationId} points at _legacy source roots`),
  ];

  const coverage = {
    requiredOperationIds: [...CONVERSATION_PERSISTENCE_OPERATION_IDS],
    observedOperationIds,
    missingOperationIds,
    requiredVisibilityTierIds: [...CONVERSATION_PERSISTENCE_VISIBILITY_TIER_IDS],
    observedVisibilityTierIds: observedVisibilityTiers,
    missingVisibilityTierIds,
    requiredRetentionPostures: [...CONVERSATION_PERSISTENCE_RETENTION_POSTURES],
    observedRetentionPostures,
    missingRetentionPostures,
    requiredFieldIds: [...CONVERSATION_PERSISTENCE_FIELD_IDS],
    observedFieldIds,
    missingFieldIds,
    operationCount: rows.length,
    allOperationsCovered: includesAll(observedOperationIds, CONVERSATION_PERSISTENCE_OPERATION_IDS),
    allVisibilityTiersCovered: includesAll(observedVisibilityTiers, CONVERSATION_PERSISTENCE_VISIBILITY_TIER_IDS),
    allRetentionPosturesCovered: includesAll(observedRetentionPostures, CONVERSATION_PERSISTENCE_RETENTION_POSTURES),
    allFieldsCovered: includesAll(observedFieldIds, CONVERSATION_PERSISTENCE_FIELD_IDS),
    persistMessageCovered: observedOperationIds.includes('persist_message'),
    restoreHistoryCovered: observedOperationIds.includes('restore_history'),
    exportHistoryCovered: observedOperationIds.includes('export_history'),
    deleteHistoryCovered: observedOperationIds.includes('delete_history'),
    retainHistoryCovered: observedOperationIds.includes('retain_history'),
    replayHistoryCovered: observedOperationIds.includes('replay_history'),
    incidentRepairCovered: observedOperationIds.includes('incident_repair'),
    visibilitySeparationCovered: rowsMissingVisibilitySeparation.length === 0,
    proofRootsCovered: rowsMissingProofRoots.length === 0,
    missingSourceRoots: rowsWithMissingSourceRoots,
    legacySourceRoots: rowsWithLegacySourceRoots.length > 0,
    credentialsSerialized: forbiddenMarkerDetected,
    protectedPromptVisible: rowsWithProtectedPromptVisible.length > 0,
    protectedModelResponseVisible: rowsWithProtectedResponseVisible.length > 0,
    protectedSourceVisible: rowsWithProtectedSourceVisible.length > 0,
    unpaidAssetPackSourceVisible: rowsWithUnpaidSourceVisible.length > 0,
    walletPrivateMaterialVisible: rowsWithWalletPrivateVisible.length > 0,
    protectedBodiesPersisted: rowsPersistingProtectedBodies.length > 0,
  };

  const artifactSeed = {
    version: CONVERSATION_PERSISTENCE_PRIVACY_VERSION,
    currentTarget: CONVERSATION_PERSISTENCE_PRIVACY_CURRENT_TARGET,
    rows,
    coverage,
    sourceSafetyVerdict: CONVERSATION_PERSISTENCE_PRIVACY_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v37-conversation-persistence-privacy-redaction',
    schemaId: CONVERSATION_PERSISTENCE_PRIVACY_SCHEMA_ID,
    version: CONVERSATION_PERSISTENCE_PRIVACY_VERSION,
    currentTarget: CONVERSATION_PERSISTENCE_PRIVACY_CURRENT_TARGET,
    generatedAt,
    sourceSafetyVerdict: CONVERSATION_PERSISTENCE_PRIVACY_SOURCE_SAFETY_VERDICT,
    disclosureBoundary: {
      persistenceMayExpose: [
        'conversation_id',
        'message_id',
        'actor_id',
        'visibility_tier',
        'source_safe_content',
        'source_context_refs',
        'redaction_posture',
        'retention_posture',
        'proof_roots',
        'event_ids',
      ],
      persistenceMustNotExpose: [...CONVERSATION_PERSISTENCE_FORBIDDEN_PAYLOAD_CLASSES],
    },
    passed: failures.length === 0,
    failures,
    coverage,
    requiredOperationIds: [...CONVERSATION_PERSISTENCE_OPERATION_IDS],
    requiredVisibilityTierIds: [...CONVERSATION_PERSISTENCE_VISIBILITY_TIER_IDS],
    requiredRetentionPostures: [...CONVERSATION_PERSISTENCE_RETENTION_POSTURES],
    requiredFieldIds: [...CONVERSATION_PERSISTENCE_FIELD_IDS],
    forbiddenPayloadClasses: [...CONVERSATION_PERSISTENCE_FORBIDDEN_PAYLOAD_CLASSES],
    rows,
    sourceEvidence: rows.map((row) => ({
      operationId: row.operationId,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `conversation-persistence-privacy:${stableRoot(artifactSeed).slice(
      'sha256:'.length,
      'sha256:'.length + 24,
    )}`,
  };
}
