'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { ActivityLogIcon, CheckIcon, ReloadIcon } from '@radix-ui/react-icons';

import {
  CONVERSATION_REHEARSAL_FLOW_OPTIONS,
  CONVERSATION_REHEARSAL_LANE_OPTIONS,
  buildConversationRehearsalPreview,
  type ConversationRehearsalFlow,
  type ConversationRehearsalLane,
  type ConversationRehearsalPreview,
} from '../conversation-rehearsal';

type ConversationRehearsalPanelProps = {
  conversationId?: string | null;
  defaultSourceText?: string | null;
  onPrepared?: (preview: ConversationRehearsalPreview) => void | Promise<void>;
};

export default function ConversationRehearsalPanel({
  conversationId,
  defaultSourceText,
  onPrepared,
}: ConversationRehearsalPanelProps) {
  const [laneId, setLaneId] = useState<ConversationRehearsalLane>('local');
  const [flowId, setFlowId] = useState<ConversationRehearsalFlow>('streaming');
  const [sourceText, setSourceText] = useState(defaultSourceText || '');
  const [prepared, setPrepared] = useState<ConversationRehearsalPreview | null>(null);
  const [status, setStatus] = useState('Conversation rehearsal proof ready.');

  const preview = useMemo(
    () =>
      buildConversationRehearsalPreview({
        laneId,
        flowId,
        conversationId,
        sourceText,
      }),
    [conversationId, flowId, laneId, sourceText],
  );

  const refreshPreview = useCallback(() => {
    setPrepared(preview);
    setStatus(`${laneId} ${flowId.replaceAll('_', ' ')} rehearsal preview refreshed.`);
  }, [flowId, laneId, preview]);

  const preparePreview = useCallback(async () => {
    setPrepared(preview);
    await onPrepared?.(preview);
    setStatus(`${laneId} ${flowId.replaceAll('_', ' ')} rehearsal proof prepared.`);
  }, [flowId, laneId, onPrepared, preview]);

  const visiblePreview = prepared || preview;

  return (
    <section
      className="conversation-rehearsal-proof"
      data-testid="conversation-rehearsal-proof"
      aria-label="Conversation rehearsal proof"
    >
      <div className="conversation-rehearsal-proof__header">
        <div className="conversation-rehearsal-proof__title">
          <ActivityLogIcon aria-hidden="true" />
          <div>
            <h2>Rehearsal Proof</h2>
            <p>local and staging source-safe flow closure</p>
          </div>
        </div>
        <div className="conversation-rehearsal-proof__actions">
          <button type="button" onClick={refreshPreview} aria-label="Refresh conversation rehearsal preview">
            <ReloadIcon aria-hidden="true" />
            <span>Refresh</span>
          </button>
          <button type="button" onClick={() => void preparePreview()} aria-label="Prepare conversation rehearsal proof">
            <CheckIcon aria-hidden="true" />
            <span>Prepare</span>
          </button>
        </div>
      </div>

      <div className="conversation-rehearsal-proof__main">
        <label>
          <span>Lane</span>
          <select
            value={laneId}
            onChange={(event) => setLaneId(event.target.value as ConversationRehearsalLane)}
            aria-label="Conversation rehearsal lane"
          >
            {CONVERSATION_REHEARSAL_LANE_OPTIONS.map((option) => (
              <option key={option.laneId} value={option.laneId}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Flow</span>
          <select
            value={flowId}
            onChange={(event) => setFlowId(event.target.value as ConversationRehearsalFlow)}
            aria-label="Conversation rehearsal flow"
          >
            {CONVERSATION_REHEARSAL_FLOW_OPTIONS.map((option) => (
              <option key={option.flowId} value={option.flowId}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="conversation-rehearsal-proof__source">
          <span>Evidence Text</span>
          <textarea
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
            placeholder="Paste source-safe rehearsal evidence to inspect disclosure posture."
            aria-label="Conversation rehearsal evidence text"
          />
        </label>
      </div>

      <div className="conversation-rehearsal-proof__preview" aria-label="Source-safe conversation rehearsal preview">
        <div>
          <span data-state={visiblePreview.status}>{visiblePreview.status}</span>
          <strong>{visiblePreview.title}</strong>
        </div>
        <p>{visiblePreview.sourceSafePreview}</p>
        <dl>
          <div>
            <dt>Proof</dt>
            <dd>{visiblePreview.proofRoot}</dd>
          </div>
          <div>
            <dt>Route/UI</dt>
            <dd>{visiblePreview.routeUiCheckRoot}</dd>
          </div>
          <div>
            <dt>Telemetry</dt>
            <dd>{visiblePreview.telemetryRoot}</dd>
          </div>
          <div>
            <dt>Log</dt>
            <dd>{visiblePreview.screenshotOrLogRoot}</dd>
          </div>
        </dl>
      </div>

      <div className="conversation-rehearsal-proof__boundary" aria-label="Conversation rehearsal disclosure posture">
        <span>{visiblePreview.sourceSafetyVerdict.replaceAll('-', ' ')}</span>
        <span>{visiblePreview.metadata.valueBearingMainnetAdmission ? 'mainnet admitted' : 'mainnet blocked'}</span>
        <span>{visiblePreview.metadata.ledgerWriteAuthorityVisible ? 'ledger authority visible' : 'no ledger authority'}</span>
        <span>{visiblePreview.metadata.walletSigningAuthorityVisible ? 'wallet signing visible' : 'no wallet signing'}</span>
      </div>

      <div role="status" aria-live="polite" className="conversation-rehearsal-proof__status">
        {status}
      </div>
    </section>
  );
}
