'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { CheckIcon, ReloadIcon, Share1Icon } from '@radix-ui/react-icons';

import type { ConversationSourceSelectorPreview } from '../conversation-source-selector';
import {
  CONVERSATION_TERMINAL_HANDOFF_WORKFLOWS,
  buildConversationTerminalHandoffEnvelope,
  getConversationTerminalHandoffWorkflow,
  type ConversationTerminalHandoffEnvelope,
  type ConversationTerminalHandoffWorkflow,
} from '../conversation-terminal-handoff';

type ConversationTerminalHandoffProps = {
  conversationId?: string | null;
  transactionId?: string | null;
  repositoryAnchor?: string | null;
  sourcePreview?: ConversationSourceSelectorPreview | null;
  onPrepared?: (envelope: ConversationTerminalHandoffEnvelope) => void | Promise<void>;
};

export default function ConversationTerminalHandoff({
  conversationId,
  transactionId,
  repositoryAnchor,
  sourcePreview,
  onPrepared,
}: ConversationTerminalHandoffProps) {
  const [workflow, setWorkflow] = useState<ConversationTerminalHandoffWorkflow>('reading');
  const [summary, setSummary] = useState('');
  const [prepared, setPrepared] = useState<ConversationTerminalHandoffEnvelope | null>(null);
  const [status, setStatus] = useState('Terminal handoff ready.');

  const workflowConfig = getConversationTerminalHandoffWorkflow(workflow);
  const sourceSelectors = useMemo(() => (sourcePreview ? [sourcePreview] : []), [sourcePreview]);
  const envelope = useMemo(
    () =>
      buildConversationTerminalHandoffEnvelope({
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
        ? 'Terminal handoff envelope ready.'
        : envelope.policyResult === 'denied'
          ? `Terminal handoff denied: ${envelope.denialReason || 'policy denied'}.`
          : `Terminal handoff needs retry: ${envelope.retryAction || 'retry required'}.`,
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
      className="conversation-terminal-handoff"
      data-testid="conversation-terminal-handoff"
      aria-label="Conversation Terminal handoff"
    >
      <div className="conversation-terminal-handoff__header">
        <div className="conversation-terminal-handoff__title">
          <Share1Icon aria-hidden="true" />
          <div>
            <h2>Terminal Handoff</h2>
            <p>source-safe transaction intent for the Terminal cockpit</p>
          </div>
        </div>
        <div className="conversation-terminal-handoff__actions">
          <button type="button" onClick={refreshEnvelope} aria-label="Refresh Terminal handoff envelope">
            <ReloadIcon aria-hidden="true" />
            <span>Refresh</span>
          </button>
          <button type="button" onClick={() => void prepareEnvelope()} aria-label="Prepare Terminal handoff">
            <CheckIcon aria-hidden="true" />
            <span>Prepare</span>
          </button>
          <button type="button" onClick={() => void openTerminal()} aria-label="Open Terminal handoff">
            <Share1Icon aria-hidden="true" />
            <span>Open</span>
          </button>
        </div>
      </div>

      <div className="conversation-terminal-handoff__main">
        <label>
          <span>Workflow</span>
          <select
            value={workflow}
            onChange={(event) => setWorkflow(event.target.value as ConversationTerminalHandoffWorkflow)}
            aria-label="Terminal handoff workflow"
          >
            {CONVERSATION_TERMINAL_HANDOFF_WORKFLOWS.map((candidate) => (
              <option key={candidate.workflow} value={candidate.workflow}>
                {candidate.label}
              </option>
            ))}
          </select>
        </label>

        <label className="conversation-terminal-handoff__summary">
          <span>Summary</span>
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder={workflowConfig.summaryPlaceholder}
            aria-label="Terminal handoff source-safe summary"
          />
        </label>
      </div>

      <div className="conversation-terminal-handoff__preview" aria-label="Source-safe Terminal handoff preview">
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

      <div role="status" aria-live="polite" className="conversation-terminal-handoff__status">
        {status}
      </div>
    </section>
  );
}
