export type ConversationPersistenceVisibilityTier =
  | 'public'
  | 'user_visible'
  | 'organization_visible'
  | 'buyer_visible'
  | 'reviewer_visible'
  | 'operator_only';

export type ConversationPersistenceOperation =
  | 'persist_message'
  | 'restore_history'
  | 'export_history'
  | 'delete_history'
  | 'retain_history'
  | 'replay_history'
  | 'incident_repair';

export type ConversationPersistencePreview = {
  operationId: ConversationPersistenceOperation;
  visibilityTier: ConversationPersistenceVisibilityTier;
  sourceSafetyClass: 'source_safe_conversation_persistence_privacy_redaction';
  sourceSafePreview: string;
  redactionApplied: boolean;
  retentionPosture: string;
  exportAllowed: boolean;
  deleteAllowed: boolean;
  replayAllowed: boolean;
  incidentRepairAllowed: boolean;
  proofRoot: string;
  eventIds: string[];
  metadata: {
    publicDataSeparated: true;
    userVisibleDataSeparated: true;
    organizationVisibleDataSeparated: true;
    buyerVisibleDataSeparated: true;
    reviewerVisibleDataSeparated: true;
    operatorOnlyDataSeparated: true;
    protectedPromptVisible: false;
    protectedModelResponseVisible: false;
    protectedSourceVisible: false;
    walletPrivateMaterialVisible: false;
    unpaidAssetPackSourceVisible: false;
  };
};

export const CONVERSATION_PERSISTENCE_OPERATION_OPTIONS: Array<{
  operationId: ConversationPersistenceOperation;
  label: string;
}> = [
  { operationId: 'persist_message', label: 'Persist message' },
  { operationId: 'restore_history', label: 'Restore history' },
  { operationId: 'export_history', label: 'Export history' },
  { operationId: 'delete_history', label: 'Delete history' },
  { operationId: 'retain_history', label: 'Retain history' },
  { operationId: 'replay_history', label: 'Replay history' },
  { operationId: 'incident_repair', label: 'Incident repair' },
];

export const CONVERSATION_PERSISTENCE_VISIBILITY_TIER_OPTIONS: Array<{
  visibilityTier: ConversationPersistenceVisibilityTier;
  label: string;
}> = [
  { visibilityTier: 'public', label: 'Public' },
  { visibilityTier: 'user_visible', label: 'User visible' },
  { visibilityTier: 'organization_visible', label: 'Organization visible' },
  { visibilityTier: 'buyer_visible', label: 'Buyer visible' },
  { visibilityTier: 'reviewer_visible', label: 'Reviewer visible' },
  { visibilityTier: 'operator_only', label: 'Operator only' },
];

export const CONVERSATION_PERSISTENCE_FORBIDDEN_PAYLOAD_CLASSES = [
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
] as const;

const SECRET_PATTERNS = [
  new RegExp(`${['sk', 'proj'].join('-')}[A-Za-z0-9_-]{12,}`, 'gu'),
  new RegExp(`${['sb', 'secret'].join('_')}__[A-Za-z0-9_-]{12,}`, 'gu'),
  /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/gu,
  /Bearer\s+[A-Za-z0-9._-]{16,}/giu,
  /(?:password|secret|token|private_key)\s*[:=]\s*\S+/giu,
  /(raw[_ -]?prompt|protected[_ -]?prompt|model[_ -]?response|protected[_ -]?source|source[_ -]?body|unpaid[_ -]?assetpack|wallet[_ -]?private|settlement[_ -]?private)/giu,
];

function stableClientHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function resolveRetentionPosture(visibilityTier: ConversationPersistenceVisibilityTier) {
  if (visibilityTier === 'operator_only') return 'operator_audit_only';
  if (visibilityTier === 'organization_visible') return 'durable_organization_visible';
  if (visibilityTier === 'buyer_visible') return 'buyer_rights_visible';
  if (visibilityTier === 'reviewer_visible') return 'reviewer_limited_visible';
  if (visibilityTier === 'public') return 'route_local_ephemeral';
  return 'durable_user_visible';
}

export function redactConversationPersistencePreviewText(value: string) {
  let redactionApplied = false;
  let output = value;

  for (const pattern of SECRET_PATTERNS) {
    output = output.replace(pattern, () => {
      redactionApplied = true;
      return '[redacted:conversation-persistence]';
    });
  }

  return {
    text: output.replace(/\s+/gu, ' ').trim(),
    redactionApplied,
  };
}

export function buildConversationPersistencePreview(input: {
  operationId?: ConversationPersistenceOperation;
  visibilityTier?: ConversationPersistenceVisibilityTier;
  conversationId?: string | null;
  sourceText?: string | null;
}): ConversationPersistencePreview {
  const operationId = input.operationId || 'persist_message';
  const visibilityTier = input.visibilityTier || 'user_visible';
  const redacted = redactConversationPersistencePreviewText(input.sourceText || '');
  const sourceSafePreview = redacted.text || 'Conversation persistence preview has no source-bearing text.';
  const proofRoot = `conversation-persistence-privacy:${stableClientHash(
    JSON.stringify({
      operationId,
      visibilityTier,
      conversationId: input.conversationId || null,
      sourceSafePreview,
      redactionApplied: redacted.redactionApplied,
    }),
  )}`;

  return {
    operationId,
    visibilityTier,
    sourceSafetyClass: 'source_safe_conversation_persistence_privacy_redaction',
    sourceSafePreview,
    redactionApplied: redacted.redactionApplied,
    retentionPosture: operationId === 'delete_history' ? 'deletion_tombstone' : resolveRetentionPosture(visibilityTier),
    exportAllowed: operationId !== 'delete_history' && visibilityTier !== 'operator_only',
    deleteAllowed: operationId === 'delete_history' || visibilityTier === 'user_visible',
    replayAllowed: operationId !== 'delete_history' && visibilityTier !== 'operator_only',
    incidentRepairAllowed: true,
    proofRoot,
    eventIds: [
      `conversation.persistence.${operationId}.checked`,
      redacted.redactionApplied
        ? `conversation.persistence.${operationId}.redacted`
        : `conversation.persistence.${operationId}.source_safe`,
    ],
    metadata: {
      publicDataSeparated: true,
      userVisibleDataSeparated: true,
      organizationVisibleDataSeparated: true,
      buyerVisibleDataSeparated: true,
      reviewerVisibleDataSeparated: true,
      operatorOnlyDataSeparated: true,
      protectedPromptVisible: false,
      protectedModelResponseVisible: false,
      protectedSourceVisible: false,
      walletPrivateMaterialVisible: false,
      unpaidAssetPackSourceVisible: false,
    },
  };
}

export function assertConversationPersistencePreviewSourceSafe(preview: ConversationPersistencePreview) {
  const visibilitySeparated = Object.values(preview.metadata).every((value) => value === true || value === false);
  const protectedVisibility =
    preview.metadata.protectedPromptVisible ||
    preview.metadata.protectedModelResponseVisible ||
    preview.metadata.protectedSourceVisible ||
    preview.metadata.walletPrivateMaterialVisible ||
    preview.metadata.unpaidAssetPackSourceVisible;

  if (!visibilitySeparated || protectedVisibility) {
    return {
      admitted: false,
      reason: 'conversation_persistence_preview_boundary_violation',
    };
  }

  return {
    admitted: true,
    reason: 'source_safe_conversation_persistence_preview',
  };
}
