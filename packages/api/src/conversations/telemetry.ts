import * as crypto from 'crypto';

import conversationTelemetryProofHooksArtifact from '../../../../.bitcode/v37-conversation-telemetry-proof-hooks.json';
import { redactPemPrivateKeyBlocks } from './secret-redaction';

export type ConversationTelemetryEventFamily =
  | 'session'
  | 'message'
  | 'stream'
  | 'tool'
  | 'source_selector'
  | 'product_handoff'
  | 'retry'
  | 'error'
  | 'completion';

export type ConversationTelemetryVisibilityTier =
  | 'public'
  | 'user_visible'
  | 'organization_visible'
  | 'buyer_visible'
  | 'reviewer_visible'
  | 'operator_only';

export type ConversationTelemetryProofHook = {
  eventId: string;
  eventFamily: ConversationTelemetryEventFamily;
  eventKind: string;
  conversationId: string | null;
  messageId: string | null;
  runId: string | null;
  sourceSelectorId: string | null;
  terminalTransactionId: string | null;
  actorId: string | null;
  timestamp: string;
  status: string;
  correlationIds: Record<string, string | number | boolean | null>;
  proofRoots: Record<string, string>;
  redactionPosture: 'proof_roots_ids_counts_states_and_redacted_error_classes_only';
  visibilityTier: ConversationTelemetryVisibilityTier;
  dashboardPanel: string;
  runbookId: string;
  sourceSafetyClass: 'source_safe_conversation_telemetry_metadata';
  sourceSafetyVerdict: string;
  expandedMetadata: Record<string, unknown>;
  disclosureBoundary: {
    allowedTelemetryPayloadClasses: string[];
    forbiddenTelemetryPayloadClasses: string[];
  };
};

type CanonicalTelemetryRow = {
  eventFamily: ConversationTelemetryEventFamily;
  dashboardPanel: string;
  runbookId: string;
  proofRootFields: string[];
  allowedPayloadClasses: string[];
};

type ConversationTelemetryProofHooksArtifact = {
  sourceSafetyVerdict: string;
  forbiddenPayloadClasses: string[];
  rows: CanonicalTelemetryRow[];
};

type BuildConversationTelemetryProofHookInput = {
  eventFamily: ConversationTelemetryEventFamily;
  eventKind: string;
  status?: string;
  conversationId?: string | null;
  messageId?: string | null;
  runId?: string | null;
  sourceSelectorId?: string | null;
  terminalTransactionId?: string | null;
  actorId?: string | null;
  timestamp?: string;
  visibilityTier?: ConversationTelemetryVisibilityTier;
  correlationIds?: Record<string, unknown>;
  proofRoots?: Record<string, string>;
  metadata?: Record<string, unknown>;
};

const NON_SECRET_CLASSIFICATION_KEYS = new Set(['token_type']);
const SENSITIVE_KEY_RE = /(secret|token|password|private[_-]?key|wallet[_-]?private|service[_-]?role|authorization|credential)/iu;
const PROTECTED_CONTEXT_RE =
  /(raw[_ -]?prompt|protected[_ -]?prompt|model[_ -]?response|protected[_ -]?source|source[_ -]?body|unpaid[_ -]?assetpack|wallet[_ -]?private|settlement[_ -]?private)/iu;
const SECRET_VALUE_PATTERNS = [
  new RegExp(`${['sk', 'proj'].join('-')}[A-Za-z0-9_-]{12,}`, 'gu'),
  new RegExp(`${['sb', 'secret'].join('_')}__[A-Za-z0-9_-]{12,}`, 'gu'),
  new RegExp('eyJ[A-Za-z0-9_-]{16,}\\.[A-Za-z0-9_-]{16,}\\.[A-Za-z0-9_-]{16,}', 'gu'),
  /Bearer\s+[A-Za-z0-9._-]{16,}/giu,
  /(?:password|secret|token|private_key)\s*[:=]\s*\S{8,}/giu,
];

const TELEMETRY_ROWS_BY_FAMILY = new Map(
  ((conversationTelemetryProofHooksArtifact as ConversationTelemetryProofHooksArtifact).rows || []).map((row) => [
    row.eventFamily as ConversationTelemetryEventFamily,
    row as CanonicalTelemetryRow,
  ]),
);

function stableJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
    .join(',')}}`;
}

function digest(value: unknown) {
  return crypto.createHash('sha256').update(stableJson(value)).digest('hex').slice(0, 24);
}

function shouldRedactKey(key: string) {
  if (NON_SECRET_CLASSIFICATION_KEYS.has(key.toLowerCase())) return false;
  return SENSITIVE_KEY_RE.test(key) || PROTECTED_CONTEXT_RE.test(key);
}

function sanitizeText(value: string) {
  const privateKeyRedaction = redactPemPrivateKeyBlocks(value, '[redacted:conversation-telemetry-secret]');
  let redacted = privateKeyRedaction.value;

  for (const pattern of SECRET_VALUE_PATTERNS) {
    redacted = redacted.replace(pattern, '[redacted:conversation-telemetry-secret]');
  }

  redacted = redacted.replace(PROTECTED_CONTEXT_RE, '[redacted:conversation-telemetry-protected-context]');
  return redacted.length > 500 ? `${redacted.slice(0, 497)}...` : redacted;
}

function sanitizeMetadata(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === 'string') return sanitizeText(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.slice(0, 12).map(sanitizeMetadata);

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .slice(0, 24)
        .map(([key, entryValue], index) =>
          shouldRedactKey(key)
            ? [`redactedField${index}`, '[redacted:conversation-telemetry-field]']
            : [key, sanitizeMetadata(entryValue)],
        ),
    );
  }

  return sanitizeText(String(value));
}

function sourceSafeCorrelationValue(value: unknown): string | number | boolean | null {
  if (value == null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return sanitizeMetadata(value) as string | number | boolean;
  }
  return `conversation-telemetry-correlation:${digest(value)}`;
}

function buildProofRoots(input: BuildConversationTelemetryProofHookInput, row: CanonicalTelemetryRow) {
  const provided = input.proofRoots || {};
  const rootFields = row.proofRootFields.length > 0 ? row.proofRootFields : ['telemetryRoot'];
  return Object.fromEntries(
    rootFields.map((field) => [
      field,
      provided[field] ||
        `conversation-telemetry-proof:${digest({
          field,
          eventFamily: input.eventFamily,
          eventKind: input.eventKind,
          conversationId: input.conversationId || null,
          messageId: input.messageId || null,
          runId: input.runId || null,
        })}`,
    ]),
  );
}

export function buildConversationTelemetryProofHook(
  input: BuildConversationTelemetryProofHookInput,
): ConversationTelemetryProofHook {
  const row = TELEMETRY_ROWS_BY_FAMILY.get(input.eventFamily);
  if (!row) {
    throw new Error(`Unknown conversation telemetry event family: ${input.eventFamily}`);
  }

  const proofRoots = buildProofRoots(input, row);
  const seed = {
    eventFamily: input.eventFamily,
    eventKind: input.eventKind,
    conversationId: input.conversationId || null,
    messageId: input.messageId || null,
    runId: input.runId || null,
    status: input.status || 'observed',
    proofRoots,
  };

  return {
    eventId: `conversation-telemetry:${digest(seed)}`,
    eventFamily: input.eventFamily,
    eventKind: input.eventKind,
    conversationId: input.conversationId || null,
    messageId: input.messageId || null,
    runId: input.runId || null,
    sourceSelectorId: input.sourceSelectorId || null,
    terminalTransactionId: input.terminalTransactionId || null,
    actorId: input.actorId || null,
    timestamp: input.timestamp || new Date().toISOString(),
    status: input.status || 'observed',
    correlationIds: Object.fromEntries(
      Object.entries(input.correlationIds || {}).map(([key, value]) => [key, sourceSafeCorrelationValue(value)]),
    ),
    proofRoots,
    redactionPosture: 'proof_roots_ids_counts_states_and_redacted_error_classes_only',
    visibilityTier: input.visibilityTier || 'user_visible',
    dashboardPanel: row.dashboardPanel,
    runbookId: row.runbookId,
    sourceSafetyClass: 'source_safe_conversation_telemetry_metadata',
    sourceSafetyVerdict: (conversationTelemetryProofHooksArtifact as ConversationTelemetryProofHooksArtifact).sourceSafetyVerdict,
    expandedMetadata: sanitizeMetadata(input.metadata || {}) as Record<string, unknown>,
    disclosureBoundary: {
      allowedTelemetryPayloadClasses: [...row.allowedPayloadClasses],
      forbiddenTelemetryPayloadClasses: [
        ...(conversationTelemetryProofHooksArtifact as ConversationTelemetryProofHooksArtifact).forbiddenPayloadClasses,
      ],
    },
  };
}

export function assertConversationTelemetryProofHookSourceSafe(hook: ConversationTelemetryProofHook) {
  const serialized = JSON.stringify({
    eventKind: hook.eventKind,
    status: hook.status,
    correlationIds: hook.correlationIds,
    proofRoots: hook.proofRoots,
    expandedMetadata: hook.expandedMetadata,
  });
  const forbiddenVisible = [
    /sk-proj-/iu,
    /sb_secret__/iu,
    /Bearer\s+[A-Za-z0-9._-]{16,}/iu,
    /raw[_ -]?prompt/iu,
    /protected[_ -]?source/iu,
    /unpaid[_ -]?assetpack/iu,
    /wallet[_ -]?private/iu,
    /PRIVATE KEY/iu,
  ].some((pattern) => pattern.test(serialized));

  return {
    admitted: !forbiddenVisible && hook.sourceSafetyClass === 'source_safe_conversation_telemetry_metadata',
    reason: forbiddenVisible
      ? 'conversation_telemetry_proof_hook_boundary_violation'
      : 'source_safe_conversation_telemetry_proof_hook',
  };
}
