'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { BarChartIcon, CheckIcon, ReloadIcon } from '@radix-ui/react-icons';

import {
  CONVERSATION_TELEMETRY_EVENT_FAMILY_OPTIONS,
  CONVERSATION_TELEMETRY_VISIBILITY_TIER_OPTIONS,
  buildConversationTelemetryProofPreview,
  type ConversationTelemetryEventFamily,
  type ConversationTelemetryProofPreview,
  type ConversationTelemetryVisibilityTier,
} from '../conversation-telemetry-proof-hooks';

type ConversationTelemetryProofPanelProps = {
  conversationId?: string | null;
  defaultSourceText?: string | null;
  onPrepared?: (preview: ConversationTelemetryProofPreview) => void | Promise<void>;
};

export default function ConversationTelemetryProofPanel({
  conversationId,
  defaultSourceText,
  onPrepared,
}: ConversationTelemetryProofPanelProps) {
  const [eventFamily, setEventFamily] = useState<ConversationTelemetryEventFamily>('stream');
  const [visibilityTier, setVisibilityTier] = useState<ConversationTelemetryVisibilityTier>('user_visible');
  const [sourceText, setSourceText] = useState(defaultSourceText || '');
  const [prepared, setPrepared] = useState<ConversationTelemetryProofPreview | null>(null);
  const [status, setStatus] = useState('Conversation telemetry proof hooks ready.');

  const preview = useMemo(
    () =>
      buildConversationTelemetryProofPreview({
        eventFamily,
        visibilityTier,
        conversationId,
        sourceText,
      }),
    [conversationId, eventFamily, sourceText, visibilityTier],
  );

  const refreshPreview = useCallback(() => {
    setPrepared(preview);
    setStatus(`${eventFamily.replaceAll('_', ' ')} telemetry preview refreshed.`);
  }, [eventFamily, preview]);

  const preparePreview = useCallback(async () => {
    setPrepared(preview);
    await onPrepared?.(preview);
    setStatus(`${eventFamily.replaceAll('_', ' ')} telemetry proof hook prepared.`);
  }, [eventFamily, onPrepared, preview]);

  const visiblePreview = prepared || preview;

  return (
    <section
      className="conversation-telemetry-proof"
      data-testid="conversation-telemetry-proof"
      aria-label="Conversation telemetry proof hooks"
    >
      <div className="conversation-telemetry-proof__header">
        <div className="conversation-telemetry-proof__title">
          <BarChartIcon aria-hidden="true" />
          <div>
            <h2>Telemetry Proof</h2>
            <p>source-safe dashboard, runbook, and proof-root posture</p>
          </div>
        </div>
        <div className="conversation-telemetry-proof__actions">
          <button type="button" onClick={refreshPreview} aria-label="Refresh telemetry proof preview">
            <ReloadIcon aria-hidden="true" />
            <span>Refresh</span>
          </button>
          <button type="button" onClick={() => void preparePreview()} aria-label="Prepare telemetry proof preview">
            <CheckIcon aria-hidden="true" />
            <span>Prepare</span>
          </button>
        </div>
      </div>

      <div className="conversation-telemetry-proof__main">
        <label>
          <span>Family</span>
          <select
            value={eventFamily}
            onChange={(event) => setEventFamily(event.target.value as ConversationTelemetryEventFamily)}
            aria-label="Conversation telemetry event family"
          >
            {CONVERSATION_TELEMETRY_EVENT_FAMILY_OPTIONS.map((option) => (
              <option key={option.eventFamily} value={option.eventFamily}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Visibility</span>
          <select
            value={visibilityTier}
            onChange={(event) => setVisibilityTier(event.target.value as ConversationTelemetryVisibilityTier)}
            aria-label="Conversation telemetry visibility tier"
          >
            {CONVERSATION_TELEMETRY_VISIBILITY_TIER_OPTIONS.map((option) => (
              <option key={option.visibilityTier} value={option.visibilityTier}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="conversation-telemetry-proof__source">
          <span>Preview Text</span>
          <textarea
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
            placeholder="Paste source-safe telemetry context to inspect disclosure posture."
            aria-label="Conversation telemetry proof preview text"
          />
        </label>
      </div>

      <div className="conversation-telemetry-proof__preview" aria-label="Source-safe telemetry proof preview">
        <div>
          <span data-state={visiblePreview.sourceSafetyClass}>source-safe</span>
          <strong>{visiblePreview.eventKind}</strong>
        </div>
        <p>{visiblePreview.sourceSafePreview}</p>
        <dl>
          <div>
            <dt>Dashboard</dt>
            <dd>{visiblePreview.dashboardPanel}</dd>
          </div>
          <div>
            <dt>Runbook</dt>
            <dd>{visiblePreview.runbookId}</dd>
          </div>
          <div>
            <dt>Visibility</dt>
            <dd>{visiblePreview.visibilityTier.replaceAll('_', ' ')}</dd>
          </div>
          <div>
            <dt>Proof</dt>
            <dd>{visiblePreview.proofRoot}</dd>
          </div>
        </dl>
      </div>

      <div className="conversation-telemetry-proof__boundary" aria-label="Conversation telemetry disclosure posture">
        <span>{visiblePreview.redactionPosture.replaceAll('_', ' ')}</span>
        <span>{visiblePreview.sourceSafetyVerdict.replaceAll('-', ' ')}</span>
        <span>{visiblePreview.metadata.dashboardBound ? 'dashboard bound' : 'dashboard missing'}</span>
        <span>{visiblePreview.metadata.runbookBound ? 'runbook bound' : 'runbook missing'}</span>
      </div>

      <div role="status" aria-live="polite" className="conversation-telemetry-proof__status">
        {status}
      </div>
    </section>
  );
}
