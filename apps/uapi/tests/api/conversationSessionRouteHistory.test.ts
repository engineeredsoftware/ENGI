import {
  CONVERSATION_SESSION_ROUTE_HISTORY_CONTRACTS,
  assertSourceSafeConversationRouteHistoryPayload,
  getConversationSessionRouteHistoryContract,
} from '@/components/conversations/models/conversation-session-route-history';

describe('ConversationSession route-history contracts', () => {
  it('covers create, restore, stream, retry, branch, and redaction route-local operations', () => {
    const operationIds = new Set(CONVERSATION_SESSION_ROUTE_HISTORY_CONTRACTS.map((contract) => contract.operationId));
    const routeIds = new Set(CONVERSATION_SESSION_ROUTE_HISTORY_CONTRACTS.map((contract) => contract.routeId));

    expect(operationIds).toEqual(new Set(['create', 'restore', 'branch', 'retry', 'redact', 'stream']));
    expect(routeIds).toEqual(
      new Set([
        'api.conversations.collection',
        'api.conversations.session',
        'api.conversations.collection_stream',
        'api.conversations.session_stream',
        'api.conversations.branch',
        'api.conversations.shared_contracts',
      ]),
    );

    for (const contract of CONVERSATION_SESSION_ROUTE_HISTORY_CONTRACTS) {
      expect(contract.sourceSafetyClass).toBe('source_safe_conversation_session_metadata');
      expect(contract.routeLocalHistory).toBe(true);
      expect(contract.globalLedgerTruth).toBe(false);
      expect(contract.mustNotExpose).toContain('protected_source_payloads');
      expect(contract.mustNotExpose).toContain('unpaid_assetpack_source');
      expect(contract.mustNotExpose).toContain('wallet_private_material');
      expect(contract.requiredRefs).toContain('proof_roots');
      expect(contract.requiredRefs).toContain('persistence_boundary');
      expect(contract.failClosedOn).toContain('global_ledger_authority_claimed');
    }
  });

  it('admits only source-safe route-history payloads', () => {
    const contract = getConversationSessionRouteHistoryContract('api.conversations.session_stream');

    expect(contract).toEqual(
      expect.objectContaining({
        routePath: '/api/conversations/[conversationId]/stream',
        operationId: 'retry',
      }),
    );

    expect(
      assertSourceSafeConversationRouteHistoryPayload({
        routeId: 'api.conversations.session_stream',
        mustNotExpose: contract?.mustNotExpose,
        routeLocalHistory: true,
        globalLedgerTruth: false,
      }),
    ).toEqual({
      admitted: true,
      reason: 'source_safe_conversation_route_history_payload',
    });

    expect(
      assertSourceSafeConversationRouteHistoryPayload({
        routeId: 'api.conversations.session_stream',
        mustNotExpose: ['protected_source_payloads'],
        routeLocalHistory: true,
        globalLedgerTruth: false,
      }),
    ).toEqual({
      admitted: false,
      reason: 'missing_forbidden_payload_boundary',
    });

    expect(
      assertSourceSafeConversationRouteHistoryPayload({
        routeId: 'api.conversations.session_stream',
        mustNotExpose: contract?.mustNotExpose,
        routeLocalHistory: true,
        globalLedgerTruth: true,
      }),
    ).toEqual({
      admitted: false,
      reason: 'conversation_route_history_boundary_violation',
    });
  });
});
