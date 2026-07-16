import type { PipelineTransactionDetailSection } from '@/components/bitcode/pipeline/models/pipeline-selection-query';
// Handoff opens Packs with source-safe selection query params.
import { buildPacksHref } from '@/components/bitcode/routes/ProductRoutes/product-routes';
import type { EnterpriseReadingStepId } from '@/components/reads/models/enterprise-reading-ux-state';

import type { ConversationSourceSelectorPreview } from './conversation-source-selector';

export type ConversationProductHandoffWorkflow =
  | 'depositing'
  | 'reading'
  | 'finding_fits'
  | 'exchange'
  | 'settlement'
  | 'delivery';

export type ConversationProductHandoffPolicyState = 'allowed' | 'retry_required' | 'denied';

export type ConversationProductHandoffInput = {
  conversationId?: string | null;
  workflow: ConversationProductHandoffWorkflow;
  readingStage?: EnterpriseReadingStepId | null;
  transactionId?: string | null;
  repositoryAnchor?: string | null;
  sourceSelectors?: ConversationSourceSelectorPreview[];
  sourceSafeSummary: string;
  policyResult?: ConversationProductHandoffPolicyState;
};

export type ConversationProductHandoffEnvelope = {
  workflow: ConversationProductHandoffWorkflow;
  conversationId: string | null;
  transactionId: string | null;
  repositoryAnchor: string | null;
  sourceSelectorRefs: string[];
  sourceSafeSummary: string;
  readingStage: EnterpriseReadingStepId | null;
  policyResult: ConversationProductHandoffPolicyState;
  packsRoute: string;
  transactionDetail: PipelineTransactionDetailSection;
  proofRoot: string;
  eventId: string;
  retryAction: string | null;
  denialReason: string | null;
  redactionApplied: boolean;
  metadata: {
    disclosureClass: 'source_safe_conversation_product_handoff';
    protectedSourceVisible: false;
    unpaidAssetPackSourceVisible: false;
    ledgerAuthorityClaimed: false;
    walletSigningAuthorityClaimed: false;
    productRemainsTransactionWorkspace: true;
    productEnterpriseReadingStage: EnterpriseReadingStepId | null;
  };
};

export const CONVERSATION_PRODUCT_HANDOFF_WORKFLOWS: Array<{
  workflow: ConversationProductHandoffWorkflow;
  label: string;
  productDetail: PipelineTransactionDetailSection;
  summaryPlaceholder: string;
}> = [
  {
    workflow: 'depositing',
    label: 'Depositing',
    productDetail: 'activity',
    summaryPlaceholder: 'Summarize the Deposit intent the product workspace should prepare.',
  },
  {
    workflow: 'reading',
    label: 'Reading',
    productDetail: 'transaction',
    summaryPlaceholder: 'Summarize the Read Request or reviewed Need the product workspace should prepare.',
  },
  {
    workflow: 'finding_fits',
    label: 'Finding Fits',
    productDetail: 'activity',
    summaryPlaceholder: 'Summarize the reviewed Need and source-safe fit request.',
  },
  {
    workflow: 'exchange',
    label: 'Exchange',
    productDetail: 'activity',
    summaryPlaceholder: 'Summarize the Exchange review intent.',
  },
  {
    workflow: 'settlement',
    label: 'Settlement',
    productDetail: 'wallet-btc',
    summaryPlaceholder: 'Summarize the settlement review intent without private wallet material.',
  },
  {
    workflow: 'delivery',
    label: 'Delivery',
    productDetail: 'settle_delivery',
    summaryPlaceholder: 'Summarize the post-settlement delivery review intent.',
  },
];

export function getConversationProductHandoffWorkflow(workflow: ConversationProductHandoffWorkflow) {
  return CONVERSATION_PRODUCT_HANDOFF_WORKFLOWS.find((candidate) => candidate.workflow === workflow)
    ?? CONVERSATION_PRODUCT_HANDOFF_WORKFLOWS[0];
}

export function inferConversationProductReadingStage(
  workflow: ConversationProductHandoffWorkflow,
): EnterpriseReadingStepId | null {
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

export function redactConversationProductHandoffText(text: string) {
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

function evaluateHandoffPolicy(input: ConversationProductHandoffInput): {
  policyResult: ConversationProductHandoffPolicyState;
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
      retryAction: 'summarize_handoff_intent_before_opening_product',
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

export function buildConversationProductHandoffEnvelope(
  input: ConversationProductHandoffInput,
): ConversationProductHandoffEnvelope {
  const workflow = getConversationProductHandoffWorkflow(input.workflow);
  const redactedSummary = redactConversationProductHandoffText(input.sourceSafeSummary);
  const sourceSelectorRefs =
    input.sourceSelectors?.map((selector) => `${selector.kind}:${selector.sourceSafeRefSummary}`.slice(0, 220)) ?? [];
  const policy = evaluateHandoffPolicy({
    ...input,
    sourceSafeSummary: redactedSummary.text,
  });
  const readingStage = input.readingStage || inferConversationProductReadingStage(input.workflow);
  const seed = JSON.stringify({
    workflow: input.workflow,
    readingStage,
    conversationId: input.conversationId || null,
    transactionId: input.transactionId || null,
    repositoryAnchor: input.repositoryAnchor || null,
    sourceSelectorRefs,
    sourceSafeSummary: redactedSummary.text.slice(0, 420),
    policyResult: policy.policyResult,
    transactionDetail: workflow.productDetail,
  });
  const proofRoot = `conversation-product-handoff:${stableClientHash(seed)}`;
  const productParams = buildConversationProductHandoffSearchParams({
    conversationId: input.conversationId || null,
    workflow: input.workflow,
    transactionId: input.transactionId || null,
    repositoryAnchor: input.repositoryAnchor || null,
    sourceSelectorRefs,
    sourceSafeSummary: redactedSummary.text.slice(0, 420),
    readingStage,
    policyResult: policy.policyResult,
    transactionDetail: workflow.productDetail,
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
    packsRoute: buildPacksHref(productParams),
    transactionDetail: workflow.productDetail,
    proofRoot,
    eventId: `conversation.product_handoff.${input.workflow}.${policy.policyResult}`,
    retryAction: policy.retryAction,
    denialReason: policy.denialReason,
    redactionApplied: redactedSummary.redactionApplied,
    metadata: {
      disclosureClass: 'source_safe_conversation_product_handoff',
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      ledgerAuthorityClaimed: false,
      walletSigningAuthorityClaimed: false,
      productRemainsTransactionWorkspace: true,
      productEnterpriseReadingStage: readingStage,
    },
  };
}

export function buildConversationProductHandoffSearchParams(input: {
  conversationId: string | null;
  workflow: ConversationProductHandoffWorkflow;
  transactionId: string | null;
  repositoryAnchor: string | null;
  sourceSelectorRefs: string[];
  sourceSafeSummary: string;
  readingStage?: EnterpriseReadingStepId | null;
  policyResult: ConversationProductHandoffPolicyState;
  transactionDetail: PipelineTransactionDetailSection;
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
