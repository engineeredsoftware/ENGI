'use client';

/**
 * Conversations overlay side panels (source, handoff, privacy, telemetry, rehearsal, writing).
 */

import React from 'react';
import ConversationSourceSelector from '@/components/conversations/ConversationSourceSelector/ConversationSourceSelector';
import ConversationProductHandoff from '@/components/conversations/ConversationProductHandoff/ConversationProductHandoff';
import ConversationPersistencePrivacyPanel from '@/components/conversations/ConversationPersistencePrivacyPanel/ConversationPersistencePrivacyPanel';
import ConversationTelemetryProofPanel from '@/components/conversations/ConversationTelemetryProofPanel/ConversationTelemetryProofPanel';
import ConversationRehearsalPanel from '@/components/conversations/ConversationRehearsalPanel/ConversationRehearsalPanel';
import ConversationWritingWorkspace from '@/components/conversations/ConversationWritingWorkspace/ConversationWritingWorkspace';
import type { ConversationSourceSelectorPreview } from '@/components/conversations/models/conversation-source-selector';
import type { ConversationWritingWorkspaceMode } from '@/components/conversations/models/conversation-writing-workspace';
import type { StreamToken } from '@/hooks/useConversationStream';

export interface ConversationsOverlaySidePanelsProps {
  showSourceSelector: boolean;
  showTerminalHandoff: boolean;
  showPersistencePrivacy: boolean;
  showTelemetryProof: boolean;
  showRehearsalProof: boolean;
  showWritingWorkspace: boolean;
  sourceSelectorInitialRef: string;
  conversationSourcePreview: ConversationSourceSelectorPreview | null;
  writingWorkspaceMode: ConversationWritingWorkspaceMode;
  conversationId?: string;
  activeRunId?: string | null;
  repositoryAnchor?: string | null;
  defaultSourceText?: string;
  onSourceSelect: (preview: ConversationSourceSelectorPreview) => void;
  onCloseWritingWorkspace: () => void;
  onWritingHandoff: (message: string, tokens: StreamToken[]) => void;
}

export function ConversationsOverlaySidePanels(props: ConversationsOverlaySidePanelsProps) {
  const {
    showSourceSelector,
    showTerminalHandoff,
    showPersistencePrivacy,
    showTelemetryProof,
    showRehearsalProof,
    showWritingWorkspace,
    sourceSelectorInitialRef,
    conversationSourcePreview,
    writingWorkspaceMode,
    conversationId,
    activeRunId,
    repositoryAnchor,
    defaultSourceText,
    onSourceSelect,
    onCloseWritingWorkspace,
    onWritingHandoff,
  } = props;

  return (
    <>
      {showSourceSelector && (
        <ConversationSourceSelector
          initialSourceRef={sourceSelectorInitialRef}
          onSelect={onSourceSelect}
        />
      )}

      {conversationSourcePreview && !showSourceSelector && (
        <div className="conversation-source-selector__status" role="status" aria-live="polite">
          Source context: {conversationSourcePreview.label} · {conversationSourcePreview.previewState.replace('_', ' ')} ·{' '}
          {conversationSourcePreview.sourceSafeRefSummary}
        </div>
      )}

      {showTerminalHandoff && (
        <ConversationProductHandoff
          conversationId={conversationId}
          transactionId={activeRunId}
          repositoryAnchor={repositoryAnchor || null}
          sourcePreview={conversationSourcePreview}
        />
      )}

      {showPersistencePrivacy && (
        <ConversationPersistencePrivacyPanel
          conversationId={conversationId}
          defaultSourceText={defaultSourceText || ''}
        />
      )}

      {showTelemetryProof && (
        <ConversationTelemetryProofPanel
          conversationId={conversationId}
          defaultSourceText={defaultSourceText || ''}
        />
      )}

      {showRehearsalProof && (
        <ConversationRehearsalPanel
          conversationId={conversationId}
          defaultSourceText={defaultSourceText || ''}
        />
      )}

      {showWritingWorkspace && (
        <ConversationWritingWorkspace
          conversationId={conversationId}
          initialMode={writingWorkspaceMode}
          onClose={onCloseWritingWorkspace}
          onHandoff={(handoff) => {
            onWritingHandoff(handoff.message, []);
          }}
        />
      )}
    </>
  );
}
