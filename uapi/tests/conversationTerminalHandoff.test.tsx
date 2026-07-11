import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ConversationTerminalHandoff from '@/app/conversations/components/ConversationTerminalHandoff';
import {
  buildConversationTerminalHandoffEnvelope,
  redactConversationTerminalHandoffText,
} from '@/app/conversations/conversation-terminal-handoff';
import { buildConversationSourceSelectorPreview } from '@/app/conversations/conversation-source-selector';

describe('ConversationTerminalHandoff', () => {
  it('prepares a source-safe Terminal handoff envelope with route and proof metadata', async () => {
    const onPrepared = jest.fn();
    const sourcePreview = buildConversationSourceSelectorPreview({
      kind: 'repository',
      sourceRef: 'engineeredsoftware/ENGI',
      governance: {
        account: 'authenticated',
        organization: 'allowed',
        wallet: 'not_required',
        rights: 'preview_allowed',
        settlement: 'not_required',
        disclosure: 'source_safe',
        policy: 'allowed',
      },
    });

    render(
      <ConversationTerminalHandoff
        conversationId="conversation-1"
        transactionId="tx-123"
        repositoryAnchor="engineeredsoftware/ENGI"
        sourcePreview={sourcePreview}
        onPrepared={onPrepared}
      />,
    );

    fireEvent.change(screen.getByLabelText('Terminal handoff source-safe summary'), {
      target: { value: 'Prepare a Read handoff for Terminal with selected repository context.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Prepare Terminal handoff' }));

    await waitFor(() => expect(onPrepared).toHaveBeenCalledTimes(1));
    const envelope = onPrepared.mock.calls[0][0];
    expect(envelope.policyResult).toBe('allowed');
    expect(envelope.terminalRoute).toContain('/packs?');
    expect(envelope.terminalRoute).toContain('conversationHandoff=1');
    expect(envelope.terminalRoute).toContain('transactionId=tx-123');
    expect(envelope.terminalRoute).toContain('readingStage=review-synthesized-need');
    expect(envelope.readingStage).toBe('review-synthesized-need');
    expect(envelope.metadata.terminalRemainsTransactionCockpit).toBe(true);
    expect(envelope.metadata.terminalEnterpriseReadingStage).toBe('review-synthesized-need');
    expect(envelope.metadata.ledgerAuthorityClaimed).toBe(false);
    expect(envelope.metadata.walletSigningAuthorityClaimed).toBe(false);
    expect(envelope.proofRoot).toMatch(/^conversation-terminal-handoff:/u);
  });

  it('requires retry when a handoff summary or source selector is not ready', () => {
    const retrySource = buildConversationSourceSelectorPreview({
      kind: 'btd_range',
      sourceRef: 'btd:range:001-004',
      governance: {
        account: 'authenticated',
        organization: 'allowed',
        wallet: 'missing',
        rights: 'preview_allowed',
        settlement: 'not_required',
        disclosure: 'source_safe',
        policy: 'allowed',
      },
    });

    const emptySummaryEnvelope = buildConversationTerminalHandoffEnvelope({
      workflow: 'settlement',
      sourceSafeSummary: '',
      sourceSelectors: [retrySource],
    });

    expect(emptySummaryEnvelope.policyResult).toBe('retry_required');
    expect(emptySummaryEnvelope.retryAction).toBe('summarize_handoff_intent_before_opening_terminal');

    const retrySelectorEnvelope = buildConversationTerminalHandoffEnvelope({
      workflow: 'settlement',
      sourceSafeSummary: 'Review the settlement path in Terminal.',
      sourceSelectors: [retrySource],
    });

    expect(retrySelectorEnvelope.policyResult).toBe('retry_required');
    expect(retrySelectorEnvelope.retryAction).toBe('resolve_source_selector_or_policy_retry_before_terminal_execution');
  });

  it('maps Conversation workflows into source-safe enterprise Reading stages', () => {
    const findingFitsEnvelope = buildConversationTerminalHandoffEnvelope({
      workflow: 'finding_fits',
      sourceSafeSummary: 'Find fits from the accepted Need in Terminal.',
    });
    expect(findingFitsEnvelope.readingStage).toBe('request-fit');
    expect(findingFitsEnvelope.terminalRoute).toContain('readingStage=request-fit');

    const settlementEnvelope = buildConversationTerminalHandoffEnvelope({
      workflow: 'settlement',
      readingStage: 'review-synthesized-asset-pack',
      sourceSafeSummary: 'Review source-safe preview before moving to settlement.',
    });
    expect(settlementEnvelope.readingStage).toBe('review-synthesized-asset-pack');
    expect(settlementEnvelope.metadata.terminalEnterpriseReadingStage).toBe('review-synthesized-asset-pack');
    expect(settlementEnvelope.terminalRoute).toContain('readingStage=review-synthesized-asset-pack');
  });

  it('redacts protected source and secret-shaped handoff text before route serialization', () => {
    const token = ['sk', 'local_unsafe_example_value_12345'].join('-');
    const text = ['```ts', 'const protectedSource = true;', '```', `token=${token}`].join('\n');
    const redacted = redactConversationTerminalHandoffText(text);
    const envelope = buildConversationTerminalHandoffEnvelope({
      workflow: 'delivery',
      sourceSafeSummary: text,
    });

    expect(redacted.redactionApplied).toBe(true);
    expect(envelope.redactionApplied).toBe(true);
    expect(envelope.sourceSafeSummary).toContain('[redacted-source-block]');
    expect(envelope.sourceSafeSummary).toContain('[redacted-secret-field]');
    expect(envelope.sourceSafeSummary).not.toContain('protectedSource');
    expect(envelope.sourceSafeSummary).not.toContain(token);
    expect(envelope.terminalRoute).not.toContain(token);
  });
});
