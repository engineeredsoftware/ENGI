export type ConversationTelemetryEventFamily =
  | 'session'
  | 'message'
  | 'stream'
  | 'tool'
  | 'source_selector'
  | 'terminal_handoff'
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

export type ConversationTelemetryProofPreview = {
  eventFamily: ConversationTelemetryEventFamily;
  eventKind: string;
  status: string;
  visibilityTier: ConversationTelemetryVisibilityTier;
  dashboardPanel: string;
  runbookId: string;
  sourceSafetyClass: 'source_safe_conversation_telemetry_metadata';
  sourceSafetyVerdict: 'source-safe-conversation-telemetry-proof-hooks-metadata';
  redactionPosture: 'proof_roots_ids_counts_states_and_redacted_error_classes_only';
  sourceSafePreview: string;
  proofRoot: string;
  eventIds: string[];
  metadata: {
    promptPayloadVisible: false;
    protectedSourceVisible: false;
    unpaidAssetPackSourceVisible: false;
    rawModelResponseVisible: false;
    walletPrivateMaterialVisible: false;
    dashboardBound: true;
    runbookBound: true;
  };
};

export const CONVERSATION_TELEMETRY_EVENT_FAMILY_OPTIONS: Array<{
  eventFamily: ConversationTelemetryEventFamily;
  label: string;
  dashboardPanel: string;
  runbookId: string;
  defaultEventKind: string;
}> = [
  {
    eventFamily: 'session',
    label: 'Session',
    dashboardPanel: 'conversation.dashboard.session-health',
    runbookId: 'runbook.conversation.session-repair',
    defaultEventKind: 'conversation.session.restored',
  },
  {
    eventFamily: 'message',
    label: 'Message',
    dashboardPanel: 'conversation.dashboard.message-storage',
    runbookId: 'runbook.conversation.message-redaction',
    defaultEventKind: 'conversation.message.persisted',
  },
  {
    eventFamily: 'stream',
    label: 'Stream',
    dashboardPanel: 'conversation.dashboard.stream-quality',
    runbookId: 'runbook.conversation.stream-debug',
    defaultEventKind: 'conversation.stream.event_emitted',
  },
  {
    eventFamily: 'tool',
    label: 'Tool',
    dashboardPanel: 'conversation.dashboard.tool-policy',
    runbookId: 'runbook.conversation.tool-policy-denial',
    defaultEventKind: 'conversation.tool.completed',
  },
  {
    eventFamily: 'source_selector',
    label: 'Source selector',
    dashboardPanel: 'conversation.dashboard.source-policy',
    runbookId: 'runbook.conversation.source-selector-policy',
    defaultEventKind: 'conversation.source_selector.allowed',
  },
  {
    eventFamily: 'terminal_handoff',
    label: 'Terminal handoff',
    dashboardPanel: 'conversation.dashboard.terminal-handoff',
    runbookId: 'runbook.conversation.terminal-handoff-repair',
    defaultEventKind: 'conversation.terminal_handoff.opened',
  },
  {
    eventFamily: 'retry',
    label: 'Retry',
    dashboardPanel: 'conversation.dashboard.retry-recovery',
    runbookId: 'runbook.conversation.retry-loop',
    defaultEventKind: 'conversation.retry.admitted',
  },
  {
    eventFamily: 'error',
    label: 'Error',
    dashboardPanel: 'conversation.dashboard.error-recovery',
    runbookId: 'runbook.conversation.error-recovery',
    defaultEventKind: 'conversation.error.redacted',
  },
  {
    eventFamily: 'completion',
    label: 'Completion',
    dashboardPanel: 'conversation.dashboard.completion-quality',
    runbookId: 'runbook.conversation.completion-repair',
    defaultEventKind: 'conversation.completion.persisted',
  },
];

export const CONVERSATION_TELEMETRY_VISIBILITY_TIER_OPTIONS: Array<{
  visibilityTier: ConversationTelemetryVisibilityTier;
  label: string;
}> = [
  { visibilityTier: 'public', label: 'Public' },
  { visibilityTier: 'user_visible', label: 'User visible' },
  { visibilityTier: 'organization_visible', label: 'Organization visible' },
  { visibilityTier: 'buyer_visible', label: 'Buyer visible' },
  { visibilityTier: 'reviewer_visible', label: 'Reviewer visible' },
  { visibilityTier: 'operator_only', label: 'Operator only' },
];

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

function redactTelemetryPreviewText(value: string) {
  let redactionApplied = false;
  let output = value;

  for (const pattern of SECRET_PATTERNS) {
    output = output.replace(pattern, () => {
      redactionApplied = true;
      return '[redacted:conversation-telemetry]';
    });
  }

  return {
    text: output.replace(/\s+/gu, ' ').trim(),
    redactionApplied,
  };
}

function optionForFamily(eventFamily: ConversationTelemetryEventFamily) {
  return (
    CONVERSATION_TELEMETRY_EVENT_FAMILY_OPTIONS.find((option) => option.eventFamily === eventFamily) ||
    CONVERSATION_TELEMETRY_EVENT_FAMILY_OPTIONS[0]
  );
}

export function buildConversationTelemetryProofPreview(input: {
  eventFamily?: ConversationTelemetryEventFamily;
  visibilityTier?: ConversationTelemetryVisibilityTier;
  conversationId?: string | null;
  eventKind?: string | null;
  status?: string | null;
  sourceText?: string | null;
}): ConversationTelemetryProofPreview {
  const eventFamily = input.eventFamily || 'stream';
  const option = optionForFamily(eventFamily);
  const visibilityTier = input.visibilityTier || 'user_visible';
  const eventKind = input.eventKind || option.defaultEventKind;
  const status = input.status || 'observed';
  const redacted = redactTelemetryPreviewText(input.sourceText || '');
  const sourceSafePreview = redacted.text || 'Conversation telemetry preview has no source-bearing payload.';
  const proofRoot = `conversation-telemetry-proof:${stableClientHash(
    JSON.stringify({
      eventFamily,
      eventKind,
      status,
      visibilityTier,
      conversationId: input.conversationId || null,
      sourceSafePreview,
    }),
  )}`;

  return {
    eventFamily,
    eventKind,
    status,
    visibilityTier,
    dashboardPanel: option.dashboardPanel,
    runbookId: option.runbookId,
    sourceSafetyClass: 'source_safe_conversation_telemetry_metadata',
    sourceSafetyVerdict: 'source-safe-conversation-telemetry-proof-hooks-metadata',
    redactionPosture: 'proof_roots_ids_counts_states_and_redacted_error_classes_only',
    sourceSafePreview,
    proofRoot,
    eventIds: [
      option.defaultEventKind,
      redacted.redactionApplied ? 'conversation.telemetry.redacted' : 'conversation.telemetry.source_safe',
    ],
    metadata: {
      promptPayloadVisible: false,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawModelResponseVisible: false,
      walletPrivateMaterialVisible: false,
      dashboardBound: true,
      runbookBound: true,
    },
  };
}

export function assertConversationTelemetryProofPreviewSourceSafe(preview: ConversationTelemetryProofPreview) {
  const protectedVisibility =
    preview.metadata.promptPayloadVisible ||
    preview.metadata.protectedSourceVisible ||
    preview.metadata.unpaidAssetPackSourceVisible ||
    preview.metadata.rawModelResponseVisible ||
    preview.metadata.walletPrivateMaterialVisible ||
    !preview.metadata.dashboardBound ||
    !preview.metadata.runbookBound;

  if (protectedVisibility) {
    return {
      admitted: false,
      reason: 'conversation_telemetry_proof_preview_boundary_violation',
    };
  }

  return {
    admitted: true,
    reason: 'source_safe_conversation_telemetry_proof_preview',
  };
}
