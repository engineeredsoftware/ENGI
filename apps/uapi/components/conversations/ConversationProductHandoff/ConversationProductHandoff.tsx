'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { CheckIcon, ReloadIcon, Share1Icon } from '@radix-ui/react-icons';

import type { ConversationSourceSelectorPreview } from '@/components/conversations/models/conversation-source-selector';
import {
  CONVERSATION_PRODUCT_HANDOFF_WORKFLOWS,
  buildConversationProductHandoffEnvelope,
  getConversationProductHandoffWorkflow,
  type ConversationProductHandoffEnvelope,
  type ConversationProductHandoffWorkflow,
} from '@/components/conversations/models/conversation-product-handoff';

type ConversationProductHandoffProps = {
  conversationId?: string | null;
  transactionId?: string | null;
  repositoryAnchor?: string | null;
  sourcePreview?: ConversationSourceSelectorPreview | null;
  onPrepared?: (envelope: ConversationProductHandoffEnvelope) => void | Promise<void>;
};

export default function ConversationProductHandoff({
  conversationId,
  transactionId,
  repositoryAnchor,
  sourcePreview,
  onPrepared,
}: ConversationProductHandoffProps) {
  const [workflow, setWorkflow] = useState<ConversationProductHandoffWorkflow>('reading');
  const [summary, setSummary] = useState('');
  const [prepared, setPrepared] = useState<ConversationProductHandoffEnvelope | null>(null);
  const [status, setStatus] = useState('Product handoff ready.');

  const workflowConfig = getConversationProductHandoffWorkflow(workflow);
  const sourceSelectors = useMemo(() => (sourcePreview ? [sourcePreview] : []), [sourcePreview]);
  const envelope = useMemo(
    () =>
      buildConversationProductHandoffEnvelope({
        conversationId,
        workflow,
        transactionId,
        repositoryAnchor,
        sourceSelectors,
        sourceSafeSummary: summary,
      }),
    [conversationId, repositoryAnchor, sourceSelectors, summary, transactionId, workflow],
  );

  const refreshEnvelope = useCallback(() => {
    setPrepared(envelope);
    setStatus(
      envelope.policyResult === 'allowed'
        ? 'Product handoff envelope ready.'
        : envelope.policyResult === 'denied'
          ? `Product handoff denied: ${envelope.denialReason || 'policy denied'}.`
          : `Product handoff needs retry: ${envelope.retryAction || 'retry required'}.`,
    );
  }, [envelope]);

  const prepareEnvelope = useCallback(async () => {
    setPrepared(envelope);
    await onPrepared?.(envelope);
    setStatus(`${workflowConfig.label} handoff prepared for Terminal.`);
  }, [envelope, onPrepared, workflowConfig.label]);

  const openTerminal = useCallback(async () => {
    setPrepared(envelope);
    await onPrepared?.(envelope);
    if (typeof window !== 'undefined') {
      window.open(envelope.packsRoute, '_blank', 'noopener');
    }
    setStatus(`${workflowConfig.label} opened in Terminal.`);
  }, [envelope, onPrepared, workflowConfig.label]);

  const visibleEnvelope = prepared || envelope;

  return (
    <section
      className="conversation-product-handoff"
      data-testid="conversation-product-handoff"
      aria-label="Conversation Product handoff"
    >
      <div className="conversation-product-handoff__header">
        <div className="conversation-product-handoff__title">
          <Share1Icon aria-hidden="true" />
          <div>
            <h2>Terminal Handoff</h2>
            <p>source-safe transaction intent for the Terminal cockpit</p>
          </div>
        </div>
        <div className="conversation-product-handoff__actions">
          <button type="button" onClick={refreshEnvelope} aria-label="Refresh Product handoff envelope">
            <ReloadIcon aria-hidden="true" />
            <span>Refresh</span>
          </button>
          <button type="button" onClick={() => void prepareEnvelope()} aria-label="Prepare Product handoff">
            <CheckIcon aria-hidden="true" />
            <span>Prepare</span>
          </button>
          <button type="button" onClick={() => void openTerminal()} aria-label="Open Product handoff">
            <Share1Icon aria-hidden="true" />
            <span>Open</span>
          </button>
        </div>
      </div>

      <div className="conversation-product-handoff__main">
        <label>
          <span>Workflow</span>
          <select
            value={workflow}
            onChange={(event) => setWorkflow(event.target.value as ConversationProductHandoffWorkflow)}
            aria-label="Product handoff workflow"
          >
            {CONVERSATION_PRODUCT_HANDOFF_WORKFLOWS.map((candidate) => (
              <option key={candidate.workflow} value={candidate.workflow}>
                {candidate.label}
              </option>
            ))}
          </select>
        </label>

        <label className="conversation-product-handoff__summary">
          <span>Summary</span>
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder={workflowConfig.summaryPlaceholder}
            aria-label="Product handoff source-safe summary"
          />
        </label>
      </div>

      <div className="conversation-product-handoff__preview" aria-label="Source-safe Product handoff preview">
        <div>
          <span data-state={visibleEnvelope.policyResult}>{visibleEnvelope.policyResult.replace('_', ' ')}</span>
          <strong>{workflowConfig.label}</strong>
        </div>
        <p>{visibleEnvelope.sourceSafeSummary}</p>
        <dl>
          <div>
            <dt>Route</dt>
            <dd>{visibleEnvelope.packsRoute}</dd>
          </div>
          <div>
            <dt>Proof</dt>
            <dd>{visibleEnvelope.proofRoot}</dd>
          </div>
          <div>
            <dt>Event</dt>
            <dd>{visibleEnvelope.eventId}</dd>
          </div>
          <div>
            <dt>Authority</dt>
            <dd>Terminal cockpit</dd>
          </div>
        </dl>
      </div>

      <div role="status" aria-live="polite" className="conversation-product-handoff__status">
        {status}
      </div>
    </section>
  );
}
