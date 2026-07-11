'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckIcon, ExitFullScreenIcon, FileTextIcon, ReloadIcon, Share1Icon } from '@radix-ui/react-icons';

import {
  CONVERSATION_WRITING_WORKSPACE_MODES,
  buildConversationWritingWorkspaceHandoff,
  buildConversationWritingWorkspaceStorageKey,
  getConversationWritingWorkspaceMode,
  summarizeConversationWritingWorkspaceDraft,
  type ConversationWritingWorkspaceHandoff,
  type ConversationWritingWorkspaceMode,
  type ConversationWritingWorkspaceSummary,
} from '@/components/conversations/ConversationWritingWorkspace/ConversationWritingWorkspace';

type ConversationWritingWorkspaceProps = {
  conversationId?: string;
  initialMode?: ConversationWritingWorkspaceMode;
  onHandoff?: (handoff: ConversationWritingWorkspaceHandoff) => void | Promise<void>;
  onClose?: () => void;
};

export default function ConversationWritingWorkspace({
  conversationId,
  initialMode = 'read_request',
  onHandoff,
  onClose,
}: ConversationWritingWorkspaceProps) {
  const [modeId, setModeId] = useState<ConversationWritingWorkspaceMode>(initialMode);
  const [draft, setDraft] = useState('');
  const [summary, setSummary] = useState<ConversationWritingWorkspaceSummary | null>(null);
  const [status, setStatus] = useState('Workspace ready.');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const activeMode = getConversationWritingWorkspaceMode(modeId);
  const storageKey = useMemo(
    () => buildConversationWritingWorkspaceStorageKey(conversationId, modeId),
    [conversationId, modeId],
  );

  useEffect(() => {
    setSummary(null);
    setStatus(`${activeMode.label} workspace ready.`);
  }, [activeMode.label, modeId]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [modeId]);

  const saveDraft = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, draft);
    }
    setStatus(`${activeMode.label} draft saved locally.`);
  }, [activeMode.label, draft, storageKey]);

  const restoreDraft = useCallback(() => {
    const restored = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
    setDraft(restored || '');
    setSummary(null);
    setStatus(restored ? `${activeMode.label} draft restored.` : `No saved ${activeMode.label} draft.`);
  }, [activeMode.label, storageKey]);

  const summarizeDraft = useCallback(() => {
    const nextSummary = summarizeConversationWritingWorkspaceDraft(modeId, draft);
    setSummary(nextSummary);
    setStatus(
      nextSummary.redactionApplied
        ? `${activeMode.label} source-safe summary ready with redaction.`
        : `${activeMode.label} source-safe summary ready.`,
    );
    return nextSummary;
  }, [activeMode.label, draft, modeId]);

  const handoffDraft = useCallback(async () => {
    const handoff = buildConversationWritingWorkspaceHandoff(modeId, draft);
    setSummary(handoff.summary);
    await onHandoff?.(handoff);
    setStatus(`${activeMode.label} handed off as source-safe workspace summary.`);
  }, [activeMode.label, draft, modeId, onHandoff]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const usesModifier = event.metaKey || event.ctrlKey;
      if (usesModifier && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveDraft();
      }
      if (usesModifier && event.key === 'Enter') {
        event.preventDefault();
        void handoffDraft();
      }
      if (event.key === 'Escape') {
        onClose?.();
      }
    },
    [handoffDraft, onClose, saveDraft],
  );

  return (
    <section
      className="conversation-writing-workspace"
      data-testid="conversation-writing-workspace"
      aria-label="Conversation writing workspace"
      onKeyDown={handleKeyDown}
    >
      <div className="conversation-writing-workspace__header">
        <div className="conversation-writing-workspace__title">
          <FileTextIcon aria-hidden="true" />
          <div>
            <h2>{activeMode.label}</h2>
            <p>{activeMode.draftScope}</p>
          </div>
        </div>
        <div className="conversation-writing-workspace__actions">
          <button type="button" onClick={saveDraft} aria-label="Save workspace draft">
            <CheckIcon aria-hidden="true" />
            <span>Save</span>
          </button>
          <button type="button" onClick={restoreDraft} aria-label="Restore workspace draft">
            <ReloadIcon aria-hidden="true" />
            <span>Restore</span>
          </button>
          <button type="button" onClick={summarizeDraft} aria-label="Summarize workspace draft">
            <FileTextIcon aria-hidden="true" />
            <span>Summarize</span>
          </button>
          <button type="button" onClick={() => void handoffDraft()} aria-label="Handoff workspace summary">
            <Share1Icon aria-hidden="true" />
            <span>Handoff</span>
          </button>
          {onClose && (
            <button type="button" onClick={onClose} aria-label="Close workspace">
              <ExitFullScreenIcon aria-hidden="true" />
              <span>Close</span>
            </button>
          )}
        </div>
      </div>

      <div className="conversation-writing-workspace__modes" role="tablist" aria-label="Writing workspace modes">
        {CONVERSATION_WRITING_WORKSPACE_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={mode.id === modeId}
            data-state={mode.id === modeId ? 'active' : 'idle'}
            onClick={() => setModeId(mode.id)}
          >
            {mode.shortLabel}
          </button>
        ))}
      </div>

      <div className="conversation-writing-workspace__body">
        <label className="conversation-writing-workspace__editor">
          <span>{activeMode.placeholder}</span>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={activeMode.placeholder}
            aria-label={`${activeMode.label} draft`}
            spellCheck="true"
          />
        </label>
        <aside className="conversation-writing-workspace__details" aria-label="Workspace source-safe summary">
          <dl>
            <div>
              <dt>Words</dt>
              <dd>{summary?.wordCount ?? (draft.trim() ? draft.trim().split(/\s+/u).length : 0)}</dd>
            </div>
            <div>
              <dt>Characters</dt>
              <dd>{summary?.characterCount ?? draft.trim().length}</dd>
            </div>
            <div>
              <dt>Disclosure</dt>
              <dd>source-safe summary only</dd>
            </div>
            <div>
              <dt>Recovery</dt>
              <dd>route-local saved draft</dd>
            </div>
          </dl>
          <div className="conversation-writing-workspace__preview">
            {summary?.sourceSafePreview || 'Summarize the draft to preview source-safe handoff text.'}
          </div>
        </aside>
      </div>

      <div role="status" aria-live="polite" className="conversation-writing-workspace__status">
        {status}
      </div>
    </section>
  );
}
