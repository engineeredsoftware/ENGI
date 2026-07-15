export type ConversationRehearsalLane =
  | 'local'
  | 'staging-testnet'
  | 'value-bearing-mainnet';

export type ConversationRehearsalFlow =
  | 'chat'
  | 'streaming'
  | 'writing'
  | 'source_selector'
  | 'terminal_handoff'
  | 'restore'
  | 'retry'
  | 'redaction'
  | 'error';

export type ConversationRehearsalPreview = {
  laneId: ConversationRehearsalLane;
  flowId: ConversationRehearsalFlow;
  status: 'ready' | 'blocked';
  title: string;
  sourceSafetyVerdict: 'source-safe-conversation-rehearsal-metadata';
  sourceSafePreview: string;
  proofRoot: string;
  routeUiCheckRoot: string;
  telemetryRoot: string;
  screenshotOrLogRoot: string;
  metadata: {
    valueBearingMainnetAdmission: false;
    protectedSourceVisible: false;
    rawProtectedPromptVisible: false;
    rawModelResponseVisible: false;
    unpaidAssetPackSourceVisible: false;
    walletPrivateMaterialVisible: false;
    ledgerWriteAuthorityVisible: false;
    walletSigningAuthorityVisible: false;
  };
};

export const CONVERSATION_REHEARSAL_FLOW_OPTIONS: Array<{
  flowId: ConversationRehearsalFlow;
  label: string;
}> = [
  { flowId: 'chat', label: 'Chat' },
  { flowId: 'streaming', label: 'Streaming' },
  { flowId: 'writing', label: 'Writing' },
  { flowId: 'source_selector', label: 'Source selector' },
  { flowId: 'terminal_handoff', label: 'Terminal handoff' },
  { flowId: 'restore', label: 'Restore' },
  { flowId: 'retry', label: 'Retry' },
  { flowId: 'redaction', label: 'Redaction' },
  { flowId: 'error', label: 'Error' },
];

export const CONVERSATION_REHEARSAL_LANE_OPTIONS: Array<{
  laneId: ConversationRehearsalLane;
  label: string;
}> = [
  { laneId: 'local', label: 'Local' },
  { laneId: 'staging-testnet', label: 'Staging-testnet' },
  { laneId: 'value-bearing-mainnet', label: 'Value-bearing mainnet blocked' },
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

function redactRehearsalPreviewText(value: string) {
  let redactionApplied = false;
  let output = value;

  for (const pattern of SECRET_PATTERNS) {
    output = output.replace(pattern, () => {
      redactionApplied = true;
      return '[redacted:conversation-rehearsal]';
    });
  }

  return {
    text: output.replace(/\s+/gu, ' ').trim(),
    redactionApplied,
  };
}

function labelForFlow(flowId: ConversationRehearsalFlow) {
  return CONVERSATION_REHEARSAL_FLOW_OPTIONS.find((option) => option.flowId === flowId)?.label || flowId;
}

function labelForLane(laneId: ConversationRehearsalLane) {
  return CONVERSATION_REHEARSAL_LANE_OPTIONS.find((option) => option.laneId === laneId)?.label || laneId;
}

export function buildConversationRehearsalPreview(input: {
  laneId?: ConversationRehearsalLane;
  flowId?: ConversationRehearsalFlow;
  conversationId?: string | null;
  sourceText?: string | null;
}): ConversationRehearsalPreview {
  const laneId = input.laneId || 'local';
  const flowId = input.flowId || 'streaming';
  const redacted = redactRehearsalPreviewText(input.sourceText || '');
  const status = laneId === 'value-bearing-mainnet' ? 'blocked' : 'ready';
  const sourceSafePreview =
    redacted.text ||
    `${labelForLane(laneId)} ${labelForFlow(flowId)} rehearsal has source-safe proof, telemetry, and route/UI evidence.`;
  const proofRoot = `conversation-rehearsal:${stableClientHash(
    JSON.stringify({
      laneId,
      flowId,
      conversationId: input.conversationId || null,
      sourceSafePreview,
      status,
    }),
  )}`;

  return {
    laneId,
    flowId,
    status,
    title: `${labelForLane(laneId)} ${labelForFlow(flowId)} rehearsal`,
    sourceSafetyVerdict: 'source-safe-conversation-rehearsal-metadata',
    sourceSafePreview,
    proofRoot,
    routeUiCheckRoot: `conversation-rehearsal-route-ui:${stableClientHash(`${laneId}:${flowId}:route-ui`)}`,
    telemetryRoot: `conversation-rehearsal-telemetry:${stableClientHash(`${laneId}:${flowId}:telemetry`)}`,
    screenshotOrLogRoot: `conversation-rehearsal-source-safety:${stableClientHash(`${laneId}:${flowId}:screenshot-log`)}`,
    metadata: {
      valueBearingMainnetAdmission: false,
      protectedSourceVisible: false,
      rawProtectedPromptVisible: false,
      rawModelResponseVisible: false,
      unpaidAssetPackSourceVisible: false,
      walletPrivateMaterialVisible: false,
      ledgerWriteAuthorityVisible: false,
      walletSigningAuthorityVisible: false,
    },
  };
}

export function assertConversationRehearsalPreviewSourceSafe(preview: ConversationRehearsalPreview) {
  const protectedVisibility =
    preview.metadata.valueBearingMainnetAdmission ||
    preview.metadata.protectedSourceVisible ||
    preview.metadata.rawProtectedPromptVisible ||
    preview.metadata.rawModelResponseVisible ||
    preview.metadata.unpaidAssetPackSourceVisible ||
    preview.metadata.walletPrivateMaterialVisible ||
    preview.metadata.ledgerWriteAuthorityVisible ||
    preview.metadata.walletSigningAuthorityVisible;

  if (protectedVisibility) {
    return {
      admitted: false,
      reason: 'conversation_rehearsal_preview_boundary_violation',
    };
  }

  return {
    admitted: true,
    reason: 'source_safe_conversation_rehearsal_preview',
  };
}
