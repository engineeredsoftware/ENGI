'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { CheckIcon, LockClosedIcon, ReloadIcon } from '@radix-ui/react-icons';

import {
  CONVERSATION_PERSISTENCE_FORBIDDEN_PAYLOAD_CLASSES,
  CONVERSATION_PERSISTENCE_OPERATION_OPTIONS,
  CONVERSATION_PERSISTENCE_VISIBILITY_TIER_OPTIONS,
  buildConversationPersistencePreview,
  type ConversationPersistenceOperation,
  type ConversationPersistencePreview,
  type ConversationPersistenceVisibilityTier,
} from '../conversation-persistence-privacy-redaction';

type ConversationPersistencePrivacyPanelProps = {
  conversationId?: string | null;
  defaultSourceText?: string | null;
  onPrepared?: (preview: ConversationPersistencePreview) => void | Promise<void>;
};

export default function ConversationPersistencePrivacyPanel({
  conversationId,
  defaultSourceText,
  onPrepared,
}: ConversationPersistencePrivacyPanelProps) {
  const [operationId, setOperationId] = useState<ConversationPersistenceOperation>('persist_message');
  const [visibilityTier, setVisibilityTier] = useState<ConversationPersistenceVisibilityTier>('user_visible');
  const [sourceText, setSourceText] = useState(defaultSourceText || '');
  const [prepared, setPrepared] = useState<ConversationPersistencePreview | null>(null);
  const [status, setStatus] = useState('Conversation persistence privacy ready.');

  const preview = useMemo(
    () =>
      buildConversationPersistencePreview({
        operationId,
        visibilityTier,
        conversationId,
        sourceText,
      }),
    [conversationId, operationId, sourceText, visibilityTier],
  );

  const refreshPreview = useCallback(() => {
    setPrepared(preview);
    setStatus(
      preview.redactionApplied
        ? 'Persistence preview refreshed with redaction applied.'
        : 'Persistence preview refreshed without protected payloads.',
    );
  }, [preview]);

  const preparePreview = useCallback(async () => {
    setPrepared(preview);
    await onPrepared?.(preview);
    setStatus(`${operationId.replaceAll('_', ' ')} privacy envelope prepared.`);
  }, [onPrepared, operationId, preview]);

  const visiblePreview = prepared || preview;

  return (
    <section
      className="conversation-persistence-privacy"
      data-testid="conversation-persistence-privacy"
      aria-label="Conversation persistence privacy"
    >
      <div className="conversation-persistence-privacy__header">
        <div className="conversation-persistence-privacy__title">
          <LockClosedIcon aria-hidden="true" />
          <div>
            <h2>Persistence Privacy</h2>
            <p>source-safe storage, export, delete, replay, and repair posture</p>
          </div>
        </div>
        <div className="conversation-persistence-privacy__actions">
          <button type="button" onClick={refreshPreview} aria-label="Refresh persistence privacy preview">
            <ReloadIcon aria-hidden="true" />
            <span>Refresh</span>
          </button>
          <button type="button" onClick={() => void preparePreview()} aria-label="Prepare persistence privacy preview">
            <CheckIcon aria-hidden="true" />
            <span>Prepare</span>
          </button>
        </div>
      </div>

      <div className="conversation-persistence-privacy__main">
        <label>
          <span>Operation</span>
          <select
            value={operationId}
            onChange={(event) => setOperationId(event.target.value as ConversationPersistenceOperation)}
            aria-label="Conversation persistence operation"
          >
            {CONVERSATION_PERSISTENCE_OPERATION_OPTIONS.map((option) => (
              <option key={option.operationId} value={option.operationId}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Visibility</span>
          <select
            value={visibilityTier}
            onChange={(event) => setVisibilityTier(event.target.value as ConversationPersistenceVisibilityTier)}
            aria-label="Conversation persistence visibility tier"
          >
            {CONVERSATION_PERSISTENCE_VISIBILITY_TIER_OPTIONS.map((option) => (
              <option key={option.visibilityTier} value={option.visibilityTier}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="conversation-persistence-privacy__source">
          <span>Preview Text</span>
          <textarea
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
            placeholder="Paste source-safe conversation text to inspect persistence redaction posture."
            aria-label="Conversation persistence privacy preview text"
          />
        </label>
      </div>

      <div className="conversation-persistence-privacy__preview" aria-label="Source-safe persistence privacy preview">
        <div>
          <span data-state={visiblePreview.redactionApplied ? 'redacted' : 'source-safe'}>
            {visiblePreview.redactionApplied ? 'redacted' : 'source-safe'}
          </span>
          <strong>{visiblePreview.operationId.replaceAll('_', ' ')}</strong>
        </div>
        <p>{visiblePreview.sourceSafePreview}</p>
        <dl>
          <div>
            <dt>Visibility</dt>
            <dd>{visiblePreview.visibilityTier.replaceAll('_', ' ')}</dd>
          </div>
          <div>
            <dt>Retention</dt>
            <dd>{visiblePreview.retentionPosture.replaceAll('_', ' ')}</dd>
          </div>
          <div>
            <dt>Export</dt>
            <dd>{visiblePreview.exportAllowed ? 'allowed' : 'blocked'}</dd>
          </div>
          <div>
            <dt>Delete</dt>
            <dd>{visiblePreview.deleteAllowed ? 'allowed' : 'blocked'}</dd>
          </div>
          <div>
            <dt>Replay</dt>
            <dd>{visiblePreview.replayAllowed ? 'allowed' : 'blocked'}</dd>
          </div>
          <div>
            <dt>Repair</dt>
            <dd>{visiblePreview.incidentRepairAllowed ? 'allowed' : 'blocked'}</dd>
          </div>
          <div>
            <dt>Proof</dt>
            <dd>{visiblePreview.proofRoot}</dd>
          </div>
        </dl>
      </div>

      <div className="conversation-persistence-privacy__boundary" aria-label="Forbidden persistence payload classes">
        {CONVERSATION_PERSISTENCE_FORBIDDEN_PAYLOAD_CLASSES.slice(0, 6).map((payloadClass) => (
          <span key={payloadClass}>{payloadClass.replaceAll('_', ' ')}</span>
        ))}
      </div>

      <div role="status" aria-live="polite" className="conversation-persistence-privacy__status">
        {status}
      </div>
    </section>
  );
}
