export type ConversationSourceSelectorKind =
  | 'repository'
  | 'branch'
  | 'commit'
  | 'deposit'
  | 'btd_range'
  | 'assetpack_preview'
  | 'document'
  | 'prior_conversation';

export type ConversationSourceSelectorPreviewState = 'allowed' | 'denied' | 'retry_required';

export type ConversationSourceSelectorGovernance = {
  account: 'authenticated' | 'missing';
  organization: 'allowed' | 'denied' | 'unknown';
  wallet: 'present' | 'missing' | 'not_required';
  rights: 'preview_allowed' | 'full_rights' | 'denied' | 'pending';
  settlement: 'not_required' | 'settled' | 'pending' | 'required_for_full_source';
  disclosure: 'source_safe' | 'protected_source_requested' | 'unpaid_assetpack_source_requested';
  policy: 'allowed' | 'denied' | 'unknown';
};

export type ConversationSourceSelectorInput = {
  kind: ConversationSourceSelectorKind;
  sourceRef: string;
  label?: string;
  governance: ConversationSourceSelectorGovernance;
};

export type ConversationSourceSelectorPreview = {
  kind: ConversationSourceSelectorKind;
  label: string;
  sourceSafeRefSummary: string;
  previewState: ConversationSourceSelectorPreviewState;
  denialReason: string | null;
  retryAction: string | null;
  redactionApplied: boolean;
  proofRoot: string;
  eventId: string;
  metadata: {
    disclosureClass: 'source_safe_conversation_source_selector_preview';
    protectedSourceVisible: false;
    unpaidAssetPackSourceVisible: false;
    globalLedgerAuthorityClaimed: false;
    governance: ConversationSourceSelectorGovernance;
  };
};

export const CONVERSATION_SOURCE_SELECTOR_OPTIONS: Array<{
  kind: ConversationSourceSelectorKind;
  label: string;
  sourceRefPlaceholder: string;
}> = [
  {
    kind: 'repository',
    label: 'Repository',
    sourceRefPlaceholder: 'engineeredsoftware/ENGI',
  },
  {
    kind: 'branch',
    label: 'Branch',
    sourceRefPlaceholder: 'engineeredsoftware/ENGI#main',
  },
  {
    kind: 'commit',
    label: 'Commit',
    sourceRefPlaceholder: 'engineeredsoftware/ENGI@commit',
  },
  {
    kind: 'deposit',
    label: 'Deposit',
    sourceRefPlaceholder: 'deposit id or source-safe deposit root',
  },
  {
    kind: 'btd_range',
    label: 'BTD Range',
    sourceRefPlaceholder: 'btd root range',
  },
  {
    kind: 'assetpack_preview',
    label: 'AssetPack Preview',
    sourceRefPlaceholder: 'AssetPack preview id',
  },
  {
    kind: 'document',
    label: 'Document',
    sourceRefPlaceholder: 'document id or attachment id',
  },
  {
    kind: 'prior_conversation',
    label: 'Prior Conversation',
    sourceRefPlaceholder: 'conversation id or message root',
  },
];

export const DEFAULT_CONVERSATION_SOURCE_SELECTOR_GOVERNANCE: ConversationSourceSelectorGovernance = {
  account: 'authenticated',
  organization: 'allowed',
  wallet: 'not_required',
  rights: 'preview_allowed',
  settlement: 'not_required',
  disclosure: 'source_safe',
  policy: 'allowed',
};

export function getConversationSourceSelectorOption(kind: ConversationSourceSelectorKind) {
  return CONVERSATION_SOURCE_SELECTOR_OPTIONS.find((option) => option.kind === kind) ?? CONVERSATION_SOURCE_SELECTOR_OPTIONS[0];
}

function stableClientHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function redactConversationSourceSelectorRef(sourceRef: string) {
  let redactionApplied = false;
  const redact = (value: string, pattern: RegExp, replacement: string) => {
    if (pattern.test(value)) {
      redactionApplied = true;
      return value.replace(pattern, replacement);
    }
    return value;
  };

  let output = sourceRef;
  output = redact(output, /```[\s\S]*?```/gu, '[redacted-source-block]');
  output = redact(output, /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/gu, '[redacted-private-key]');
  output = redact(output, /\bsk-[A-Za-z0-9_-]{16,}\b/gu, '[redacted-provider-token]');
  output = redact(output, new RegExp(`\\b${['sb', 'secret'].join('_')}__[A-Za-z0-9_-]+\\b`, 'gu'), '[redacted-service-token]');
  output = redact(output, /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/gu, '[redacted-jwt]');
  output = redact(output, /\b(?:password|secret|token|private_key)\s*[:=]\s*\S+/giu, '[redacted-secret-field]');

  return {
    text: output.replace(/\s+/gu, ' ').trim(),
    redactionApplied,
  };
}

function evaluatePolicyState(input: ConversationSourceSelectorInput): {
  previewState: ConversationSourceSelectorPreviewState;
  denialReason: string | null;
  retryAction: string | null;
} {
  const { kind, sourceRef, governance } = input;

  if (!sourceRef.trim()) {
    return {
      previewState: 'retry_required',
      denialReason: null,
      retryAction: 'select_or_enter_source_reference',
    };
  }

  if (governance.account === 'missing') {
    return {
      previewState: 'denied',
      denialReason: 'account_scope_missing',
      retryAction: 'authenticate_account_before_selecting_source',
    };
  }

  if (governance.organization === 'denied' || governance.policy === 'denied' || governance.rights === 'denied') {
    return {
      previewState: 'denied',
      denialReason: 'policy_or_rights_denied',
      retryAction: null,
    };
  }

  if (
    governance.disclosure === 'protected_source_requested' ||
    governance.disclosure === 'unpaid_assetpack_source_requested'
  ) {
    return {
      previewState: 'denied',
      denialReason: 'requested_disclosure_crosses_source_safe_boundary',
      retryAction: 'select_source_safe_preview_metadata',
    };
  }

  if ((kind === 'btd_range' || kind === 'assetpack_preview') && governance.wallet === 'missing') {
    return {
      previewState: 'retry_required',
      denialReason: null,
      retryAction: 'connect_wallet_or_select_non_wallet_source',
    };
  }

  if (
    governance.organization === 'unknown' ||
    governance.policy === 'unknown' ||
    governance.rights === 'pending' ||
    governance.settlement === 'pending'
  ) {
    return {
      previewState: 'retry_required',
      denialReason: null,
      retryAction: 'refresh_policy_rights_and_settlement_state',
    };
  }

  if (governance.settlement === 'required_for_full_source') {
    return {
      previewState: 'allowed',
      denialReason: null,
      retryAction: 'full_source_visibility_waits_for_settlement',
    };
  }

  return {
    previewState: 'allowed',
    denialReason: null,
    retryAction: null,
  };
}

export function buildConversationSourceSelectorPreview(
  input: ConversationSourceSelectorInput,
): ConversationSourceSelectorPreview {
  const option = getConversationSourceSelectorOption(input.kind);
  const redacted = redactConversationSourceSelectorRef(input.sourceRef);
  const policyState = evaluatePolicyState(input);
  const sourceSafeRefSummary = redacted.text.slice(0, 280) || 'No source reference selected.';
  const seed = JSON.stringify({
    kind: input.kind,
    sourceSafeRefSummary,
    previewState: policyState.previewState,
    governance: input.governance,
  });

  return {
    kind: input.kind,
    label: input.label || option.label,
    sourceSafeRefSummary,
    previewState: policyState.previewState,
    denialReason: policyState.denialReason,
    retryAction: policyState.retryAction,
    redactionApplied: redacted.redactionApplied,
    proofRoot: `conversation-source-selector:${stableClientHash(seed)}`,
    eventId: `conversation.source.${input.kind}.${policyState.previewState}`,
    metadata: {
      disclosureClass: 'source_safe_conversation_source_selector_preview',
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      globalLedgerAuthorityClaimed: false,
      governance: input.governance,
    },
  };
}
