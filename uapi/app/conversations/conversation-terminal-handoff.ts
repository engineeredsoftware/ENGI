import type { TerminalTransactionDetailSection } from '@/components/bitcode/pipeline/models/pipeline-selection-query';
// Handoff opens Packs with source-safe selection query params.
import { buildPacksHref } from '@/components/bitcode/routes/product-routes';
import type { TerminalEnterpriseReadingStepId } from '@/components/reads/models/enterprise-reading-ux-state';

import type { ConversationSourceSelectorPreview } from './conversation-source-selector';

export type ConversationTerminalHandoffWorkflow =
  | 'depositing'
  | 'reading'
  | 'finding_fits'
  | 'exchange'
  | 'settlement'
  | 'delivery';

export type ConversationTerminalHandoffPolicyState = 'allowed' | 'retry_required' | 'denied';

export type ConversationTerminalHandoffInput = {
  conversationId?: string | null;
  workflow: ConversationTerminalHandoffWorkflow;
  readingStage?: TerminalEnterpriseReadingStepId | null;
  transactionId?: string | null;
  repositoryAnchor?: string | null;
  sourceSelectors?: ConversationSourceSelectorPreview[];
  sourceSafeSummary: string;
  policyResult?: ConversationTerminalHandoffPolicyState;
};

export type ConversationTerminalHandoffEnvelope = {
  workflow: ConversationTerminalHandoffWorkflow;
  conversationId: string | null;
  transactionId: string | null;
  repositoryAnchor: string | null;
  sourceSelectorRefs: string[];
  sourceSafeSummary: string;
  readingStage: TerminalEnterpriseReadingStepId | null;
  policyResult: ConversationTerminalHandoffPolicyState;
  packsRoute: string;
  transactionDetail: TerminalTransactionDetailSection;
  proofRoot: string;
  eventId: string;
  retryAction: string | null;
  denialReason: string | null;
  redactionApplied: boolean;
  metadata: {
    disclosureClass: 'source_safe_conversation_terminal_handoff';
    protectedSourceVisible: false;
    unpaidAssetPackSourceVisible: false;
    ledgerAuthorityClaimed: false;
    walletSigningAuthorityClaimed: false;
    terminalRemainsTransactionCockpit: true;
    terminalEnterpriseReadingStage: TerminalEnterpriseReadingStepId | null;
  };
};

export const CONVERSATION_TERMINAL_HANDOFF_WORKFLOWS: Array<{
  workflow: ConversationTerminalHandoffWorkflow;
  label: string;
  terminalDetail: TerminalTransactionDetailSection;
  summaryPlaceholder: string;
}> = [
  {
    workflow: 'depositing',
    label: 'Depositing',
    terminalDetail: 'activity',
    summaryPlaceholder: 'Summarize the Deposit intent Terminal should prepare.',
  },
  {
    workflow: 'reading',
    label: 'Reading',
    terminalDetail: 'transaction',
    summaryPlaceholder: 'Summarize the Read Request or reviewed Need Terminal should prepare.',
  },
  {
    workflow: 'finding_fits',
    label: 'Finding Fits',
    terminalDetail: 'activity',
    summaryPlaceholder: 'Summarize the reviewed Need and source-safe fit request.',
  },
  {
    workflow: 'exchange',
    label: 'Exchange',
    terminalDetail: 'activity',
    summaryPlaceholder: 'Summarize the Exchange review intent.',
  },
  {
    workflow: 'settlement',
    label: 'Settlement',
    terminalDetail: 'wallet-btc',
    summaryPlaceholder: 'Summarize the settlement review intent without private wallet material.',
  },
  {
    workflow: 'delivery',
    label: 'Delivery',
    terminalDetail: 'shippables',
    summaryPlaceholder: 'Summarize the post-settlement delivery review intent.',
  },
];

export function getConversationTerminalHandoffWorkflow(workflow: ConversationTerminalHandoffWorkflow) {
  return CONVERSATION_TERMINAL_HANDOFF_WORKFLOWS.find((candidate) => candidate.workflow === workflow)
    ?? CONVERSATION_TERMINAL_HANDOFF_WORKFLOWS[0];
}

export function inferConversationTerminalReadingStage(
  workflow: ConversationTerminalHandoffWorkflow,
): TerminalEnterpriseReadingStepId | null {
  if (workflow === 'depositing') return 'request-read';
  if (workflow === 'reading') return 'review-synthesized-need';
  if (workflow === 'finding_fits') return 'request-fit';
  if (workflow === 'exchange') return 'review-synthesized-asset-pack';
  if (workflow === 'settlement' || workflow === 'delivery') return 'buy-asset-pack-settle';
  return null;
}

function stableClientHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function redactConversationTerminalHandoffText(text: string) {
  let redactionApplied = false;
  const redact = (value: string, pattern: RegExp, replacement: string) => {
    if (pattern.test(value)) {
      redactionApplied = true;
      return value.replace(pattern, replacement);
    }
    return value;
  };

  let output = text;
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

function evaluateHandoffPolicy(input: ConversationTerminalHandoffInput): {
  policyResult: ConversationTerminalHandoffPolicyState;
  retryAction: string | null;
  denialReason: string | null;
} {
  const sourceStates = input.sourceSelectors?.map((selector) => selector.previewState) ?? [];
  if (input.policyResult === 'denied' || sourceStates.includes('denied')) {
    return {
      policyResult: 'denied',
      retryAction: null,
      denialReason: 'conversation_source_policy_denied',
    };
  }

  if (!input.sourceSafeSummary.trim()) {
    return {
      policyResult: 'retry_required',
      retryAction: 'summarize_handoff_intent_before_opening_terminal',
      denialReason: null,
    };
  }

  if (input.policyResult === 'retry_required' || sourceStates.includes('retry_required')) {
    return {
      policyResult: 'retry_required',
      retryAction: 'resolve_source_selector_or_policy_retry_before_terminal_execution',
      denialReason: null,
    };
  }

  return {
    policyResult: 'allowed',
    retryAction: null,
    denialReason: null,
  };
}

export function buildConversationTerminalHandoffEnvelope(
  input: ConversationTerminalHandoffInput,
): ConversationTerminalHandoffEnvelope {
  const workflow = getConversationTerminalHandoffWorkflow(input.workflow);
  const redactedSummary = redactConversationTerminalHandoffText(input.sourceSafeSummary);
  const sourceSelectorRefs =
    input.sourceSelectors?.map((selector) => `${selector.kind}:${selector.sourceSafeRefSummary}`.slice(0, 220)) ?? [];
  const policy = evaluateHandoffPolicy({
    ...input,
    sourceSafeSummary: redactedSummary.text,
  });
  const readingStage = input.readingStage || inferConversationTerminalReadingStage(input.workflow);
  const seed = JSON.stringify({
    workflow: input.workflow,
    readingStage,
    conversationId: input.conversationId || null,
    transactionId: input.transactionId || null,
    repositoryAnchor: input.repositoryAnchor || null,
    sourceSelectorRefs,
    sourceSafeSummary: redactedSummary.text.slice(0, 420),
    policyResult: policy.policyResult,
    transactionDetail: workflow.terminalDetail,
  });
  const proofRoot = `conversation-terminal-handoff:${stableClientHash(seed)}`;
  const terminalParams = buildConversationTerminalHandoffSearchParams({
    conversationId: input.conversationId || null,
    workflow: input.workflow,
    transactionId: input.transactionId || null,
    repositoryAnchor: input.repositoryAnchor || null,
    sourceSelectorRefs,
    sourceSafeSummary: redactedSummary.text.slice(0, 420),
    readingStage,
    policyResult: policy.policyResult,
    transactionDetail: workflow.terminalDetail,
    proofRoot,
  });

  return {
    workflow: input.workflow,
    conversationId: input.conversationId || null,
    transactionId: input.transactionId || null,
    repositoryAnchor: input.repositoryAnchor || null,
    sourceSelectorRefs,
    sourceSafeSummary: redactedSummary.text.slice(0, 420) || 'No handoff summary prepared.',
    readingStage,
    policyResult: policy.policyResult,
    packsRoute: buildPacksHref(terminalParams),
    transactionDetail: workflow.terminalDetail,
    proofRoot,
    eventId: `conversation.terminal_handoff.${input.workflow}.${policy.policyResult}`,
    retryAction: policy.retryAction,
    denialReason: policy.denialReason,
    redactionApplied: redactedSummary.redactionApplied,
    metadata: {
      disclosureClass: 'source_safe_conversation_terminal_handoff',
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      ledgerAuthorityClaimed: false,
      walletSigningAuthorityClaimed: false,
      terminalRemainsTransactionCockpit: true,
      terminalEnterpriseReadingStage: readingStage,
    },
  };
}

export function buildConversationTerminalHandoffSearchParams(input: {
  conversationId: string | null;
  workflow: ConversationTerminalHandoffWorkflow;
  transactionId: string | null;
  repositoryAnchor: string | null;
  sourceSelectorRefs: string[];
  sourceSafeSummary: string;
  readingStage?: TerminalEnterpriseReadingStepId | null;
  policyResult: ConversationTerminalHandoffPolicyState;
  transactionDetail: TerminalTransactionDetailSection;
  proofRoot: string;
}) {
  const params = new URLSearchParams();
  params.set('conversationHandoff', '1');
  params.set('handoffWorkflow', input.workflow);
  params.set('handoffPolicy', input.policyResult);
  params.set('handoffProofRoot', input.proofRoot);
  params.set('transactionDetail', input.transactionDetail);
  if (input.conversationId) params.set('conversationId', input.conversationId);
  if (input.transactionId) params.set('transactionId', input.transactionId);
  if (input.readingStage) params.set('readingStage', input.readingStage);
  if (input.repositoryAnchor) params.set('handoffRepositoryAnchor', input.repositoryAnchor);
  if (input.sourceSelectorRefs.length) params.set('handoffSourceSelectors', input.sourceSelectorRefs.join(' | ').slice(0, 900));
  if (input.sourceSafeSummary) params.set('handoffSummary', input.sourceSafeSummary.slice(0, 420));
  return params;
}
