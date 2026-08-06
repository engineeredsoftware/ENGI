export type ConversationSessionRouteHistoryOperation = 'create' | 'restore' | 'branch' | 'retry' | 'redact' | 'stream';

export type ConversationSessionRouteHistoryContract = {
  contractId: string;
  routeId: string;
  routePath: string;
  method: 'GET' | 'POST' | 'INTERNAL';
  operationId: ConversationSessionRouteHistoryOperation;
  sourceSafetyClass: 'source_safe_conversation_session_metadata';
  routeLocalHistory: true;
  globalLedgerTruth: false;
  mayExpose: string[];
  mustNotExpose: string[];
  requiredRefs: string[];
  failClosedOn: string[];
};

const sharedMayExpose = [
  'conversation_identity',
  'source_safe_summary',
  'route_contract_metadata',
  'account_policy_metadata',
  'source_context_refs',
  'stream_state',
  'history_refs',
  'proof_roots',
  'event_ids',
  'persistence_boundary',
];

const sharedMustNotExpose = [
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'protected_source_payloads',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'unpaid_assetpack_source',
  'settlement_private_payloads',
  'global_ledger_authority_claim',
];

const sharedRequiredRefs = [
  'route_local_session_id',
  'user_account_posture',
  'source_context_ref',
  'policy_decision',
  'history_refs',
  'proof_roots',
  'event_ids',
  'redaction_posture',
  'persistence_boundary',
];

const sharedFailClosedOn = [
  'missing_conversation_id',
  'missing_user_account_posture',
  'missing_policy_decision',
  'missing_route_local_history_ref',
  'missing_proof_root',
  'missing_event_id',
  'protected_source_visible',
  'unpaid_assetpack_source_visible',
  'global_ledger_authority_claimed',
];

function contract(input: Omit<ConversationSessionRouteHistoryContract, 'sourceSafetyClass' | 'routeLocalHistory' | 'globalLedgerTruth' | 'mayExpose' | 'mustNotExpose' | 'requiredRefs' | 'failClosedOn'>): ConversationSessionRouteHistoryContract {
  return {
    ...input,
    sourceSafetyClass: 'source_safe_conversation_session_metadata',
    routeLocalHistory: true,
    globalLedgerTruth: false,
    mayExpose: [...sharedMayExpose],
    mustNotExpose: [...sharedMustNotExpose],
    requiredRefs: [...sharedRequiredRefs],
    failClosedOn: [...sharedFailClosedOn],
  };
}

export const CONVERSATION_SESSION_ROUTE_HISTORY_CONTRACTS = [
  contract({
    contractId: 'conversation.session.create',
    routeId: 'api.conversations.collection',
    routePath: '/api/conversations',
    method: 'POST',
    operationId: 'create',
  }),
  contract({
    contractId: 'conversation.session.restore',
    routeId: 'api.conversations.session',
    routePath: '/api/conversations/[conversationId]',
    method: 'GET',
    operationId: 'restore',
  }),
  contract({
    contractId: 'conversation.session.stream.create',
    routeId: 'api.conversations.collection_stream',
    routePath: '/api/conversations/stream',
    method: 'POST',
    operationId: 'stream',
  }),
  contract({
    contractId: 'conversation.session.stream.retry',
    routeId: 'api.conversations.session_stream',
    routePath: '/api/conversations/[conversationId]/stream',
    method: 'POST',
    operationId: 'retry',
  }),
  contract({
    contractId: 'conversation.session.branch',
    routeId: 'api.conversations.branch',
    routePath: '/api/conversations/branch',
    method: 'POST',
    operationId: 'branch',
  }),
  contract({
    contractId: 'conversation.session.redaction.checkpoint',
    routeId: 'api.conversations.shared_contracts',
    routePath: '/api/conversations/* shared contracts',
    method: 'INTERNAL',
    operationId: 'redact',
  }),
] satisfies ConversationSessionRouteHistoryContract[];

export function getConversationSessionRouteHistoryContract(routeId: string) {
  return CONVERSATION_SESSION_ROUTE_HISTORY_CONTRACTS.find((contractRow) => contractRow.routeId === routeId) || null;
}

export function assertSourceSafeConversationRouteHistoryPayload(payload: {
  routeId: string;
  mayExpose?: string[];
  mustNotExpose?: string[];
  globalLedgerTruth?: boolean;
  routeLocalHistory?: boolean;
}) {
  const contractRow = getConversationSessionRouteHistoryContract(payload.routeId);

  if (!contractRow) {
    return {
      admitted: false,
      reason: 'unknown_conversation_route_contract',
    };
  }

  const observedMustNotExpose = new Set(payload.mustNotExpose || []);
  const forbidsProtectedSource = contractRow.mustNotExpose.every((payloadClass) => observedMustNotExpose.has(payloadClass));

  if (!forbidsProtectedSource) {
    return {
      admitted: false,
      reason: 'missing_forbidden_payload_boundary',
    };
  }

  if (payload.globalLedgerTruth !== false || payload.routeLocalHistory !== true) {
    return {
      admitted: false,
      reason: 'conversation_route_history_boundary_violation',
    };
  }

  return {
    admitted: true,
    reason: 'source_safe_conversation_route_history_payload',
  };
}
