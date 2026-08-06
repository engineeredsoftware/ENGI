/**
 * @jest-environment node
 */

import {
  CONVERSATION_SESSION_ROUTE_HISTORY_CONTRACTS,
  assertSourceSafeConversationRouteHistoryPayload,
} from '@/components/conversations/models/conversation-session-route-history';
import { buildMockConversationStreamEnvelope } from '@/app/api/conversations/_shared';

describe('conversation route-history source-safe envelope contracts', () => {
  it('keeps mock stream envelopes route-local and source-safe', () => {
    const envelope = buildMockConversationStreamEnvelope({
      content: 'Measure the current repository state.',
      conversationId: 'conv-route-history-contract',
      tokens: [
        {
          type: 'read_measurement',
          value: 'Read measurement',
          metadata: { pipelineType: 'read_measurement' },
        },
      ],
    });

    const streamContract = CONVERSATION_SESSION_ROUTE_HISTORY_CONTRACTS.find(
      (contract) => contract.routeId === 'api.conversations.session_stream',
    );

    expect(streamContract).toBeTruthy();
    expect(envelope.conversationId).toBe('conv-route-history-contract');
    expect(envelope.queue.some((event) => event.type === 'pipeline_triggered')).toBe(true);
    expect(envelope.queue.some((event) => event.type === 'message_complete')).toBe(true);

    expect(
      assertSourceSafeConversationRouteHistoryPayload({
        routeId: 'api.conversations.session_stream',
        mustNotExpose: streamContract?.mustNotExpose,
        routeLocalHistory: true,
        globalLedgerTruth: false,
      }),
    ).toEqual({
      admitted: true,
      reason: 'source_safe_conversation_route_history_payload',
    });
  });

  it('requires branch and redaction contracts to deny ledger authority claims', () => {
    const branchContract = CONVERSATION_SESSION_ROUTE_HISTORY_CONTRACTS.find(
      (contract) => contract.routeId === 'api.conversations.branch',
    );
    const redactionContract = CONVERSATION_SESSION_ROUTE_HISTORY_CONTRACTS.find(
      (contract) => contract.routeId === 'api.conversations.shared_contracts',
    );

    expect(branchContract).toEqual(
      expect.objectContaining({
        routePath: '/api/conversations/branch',
        operationId: 'branch',
        routeLocalHistory: true,
        globalLedgerTruth: false,
      }),
    );
    expect(redactionContract).toEqual(
      expect.objectContaining({
        operationId: 'redact',
        routeLocalHistory: true,
        globalLedgerTruth: false,
      }),
    );

    for (const contract of [branchContract, redactionContract]) {
      expect(contract?.mustNotExpose).toContain('global_ledger_authority_claim');
      expect(contract?.mustNotExpose).toContain('raw_protected_prompts');
      expect(contract?.mustNotExpose).toContain('raw_model_responses_with_protected_source');
      expect(contract?.failClosedOn).toContain('global_ledger_authority_claimed');
    }
  });
});
