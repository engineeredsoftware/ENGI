/**
 * Conversations overlay main body: history, chat, process log, execution details, thinking.
 */
'use client';

import React from 'react';
import ConversationsChat from '@/components/conversations/ConversationsChat/ConversationsChat';
import { ChatHistorySidebar } from '@/components/conversations/ConversationsChatHistorySidebar/ConversationsChatHistorySidebar';
import { ThinkingLog } from '@/components/conversations/ConversationsThinkingLog/ConversationsThinkingLog';
import BitcodeExecutionStreamPanel from '@/components/bitcode/pipeline/BitcodeExecutionStreamPanel/BitcodeExecutionStreamPanel';
import { ExecutionDetailsView } from '@/components/bitcode/pipeline/ExecutionsDetailsView/ExecutionsDetailsView';
import type { StreamToken } from '@/hooks/useConversationStream';
import type { Chat, ChatMessage } from '@/components/conversations/hooks/UseChatState/UseChatState';
import type { ConversationSourceSelectorPreview } from '@/components/conversations/models/conversation-source-selector';
import type { ConversationWritingWorkspaceMode } from '@/components/conversations/models/conversation-writing-workspace';
import { ConversationsOverlayHeader } from './ConversationsOverlayHeader';
import { ConversationsOverlaySidePanels } from './ConversationsOverlaySidePanels';

export interface ConversationsOverlayMainContentProps {
  chats: Chat[];
  currentChat: Chat | null;
  showHistory: boolean;
  isFullscreen: boolean;
  isProcessing: boolean;
  processError: Error | null;
  processLogOutputDetails: Record<string, unknown>;
  processLogHasScrolled: boolean;
  activeRunId: string | null;
  selectedRunDetailsId: string | null;
  isRunComplete: boolean;
  logError: string | null;
  executionState: unknown;
  generationCount: number;
  runLog: unknown;
  runLogDetails: Record<string, unknown>;
  latestWorkUpdate: unknown;
  iterationUpdates: unknown[];
  thinkingLog: Array<{ type: string; content: string; timestamp?: Date }>;
  showSourceSelector: boolean;
  showTerminalHandoff: boolean;
  showPersistencePrivacy: boolean;
  showTelemetryProof: boolean;
  showRehearsalProof: boolean;
  showWritingWorkspace: boolean;
  sourceSelectorInitialRef: string;
  conversationSourcePreview: ConversationSourceSelectorPreview | null;
  writingWorkspaceMode: ConversationWritingWorkspaceMode;
  currentSource: { repoSlug?: string };
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  processLogRef: React.RefObject<HTMLDivElement | null>;
  onSelectChat: (chat: Chat) => void;
  onCreateChat: () => Chat;
  onDeleteChat: (id: string) => void;
  onCloseHistory: () => void;
  onToggleHistory: () => void;
  onToggleFullscreen: () => void;
  onToggleSplitScreen: () => void;
  onToggleWritingWorkspace: () => void;
  onToggleSourceSelector: () => void;
  onToggleTerminalHandoff: () => void;
  onTogglePersistencePrivacy: () => void;
  onToggleTelemetryProof: () => void;
  onToggleRehearsalProof: () => void;
  onBranched: (conversation: { id: string; title?: string }) => void;
  onClose: () => void;
  onSourceSelect: (preview: ConversationSourceSelectorPreview) => void;
  onCloseWritingWorkspace: () => void;
  onWritingHandoff: (message: string, tokens: StreamToken[]) => void;
  onSend: (message: string, tokens?: StreamToken[]) => void;
  renderTokenInMessage: (content: string, tokens?: unknown[]) => string;
  onScroll: () => void;
  onRetry: () => void;
  onDismissError: () => void;
  setProcessLogHasScrolled: (value: boolean) => void;
  setSelectedRunDetailsId: (id: string | null) => void;
  setActiveRunId: (id: string | null) => void;
  setProcessError: (error: Error | null) => void;
}

export function ConversationsOverlayMainContent(props: ConversationsOverlayMainContentProps) {
  const {
    chats,
    currentChat,
    showHistory,
    isFullscreen,
    isProcessing,
    processError,
    processLogOutputDetails,
    processLogHasScrolled,
    activeRunId,
    selectedRunDetailsId,
    isRunComplete,
    logError,
    executionState,
    generationCount,
    runLog,
    runLogDetails,
    latestWorkUpdate,
    iterationUpdates,
    thinkingLog,
    showSourceSelector,
    showTerminalHandoff,
    showPersistencePrivacy,
    showTelemetryProof,
    showRehearsalProof,
    showWritingWorkspace,
    sourceSelectorInitialRef,
    conversationSourcePreview,
    writingWorkspaceMode,
    currentSource,
    chatContainerRef,
    processLogRef,
    onSelectChat,
    onCreateChat,
    onDeleteChat,
    onCloseHistory,
    onToggleHistory,
    onToggleFullscreen,
    onToggleSplitScreen,
    onToggleWritingWorkspace,
    onToggleSourceSelector,
    onToggleTerminalHandoff,
    onTogglePersistencePrivacy,
    onToggleTelemetryProof,
    onToggleRehearsalProof,
    onBranched,
    onClose,
    onSourceSelect,
    onCloseWritingWorkspace,
    onWritingHandoff,
    onSend,
    renderTokenInMessage,
    onScroll,
    onRetry,
    onDismissError,
    setProcessLogHasScrolled,
    setSelectedRunDetailsId,
    setActiveRunId,
    setProcessError,
  } = props;

  const activeRunStatusRunning = isProcessing;

  return (
    <>
      {showHistory && (
        <ChatHistorySidebar
          chats={chats}
          currentChat={currentChat}
          onSelectChat={onSelectChat}
          onCreateChat={onCreateChat}
          onDeleteChat={onDeleteChat}
          onClose={onCloseHistory}
        />
      )}

      <div className="conversations-container">
        <ConversationsOverlayHeader
          title={currentChat?.title || 'New Conversation'}
          isFullscreen={isFullscreen}
          showHistory={showHistory}
          showWritingWorkspace={showWritingWorkspace}
          showSourceSelector={showSourceSelector}
          showTerminalHandoff={showTerminalHandoff}
          showPersistencePrivacy={showPersistencePrivacy}
          showTelemetryProof={showTelemetryProof}
          showRehearsalProof={showRehearsalProof}
          onToggleHistory={onToggleHistory}
          onToggleFullscreen={onToggleFullscreen}
          onToggleSplitScreen={onToggleSplitScreen}
          onToggleWritingWorkspace={onToggleWritingWorkspace}
          onToggleSourceSelector={onToggleSourceSelector}
          onToggleTerminalHandoff={onToggleTerminalHandoff}
          onTogglePersistencePrivacy={onTogglePersistencePrivacy}
          onToggleTelemetryProof={onToggleTelemetryProof}
          onToggleRehearsalProof={onToggleRehearsalProof}
          onBranched={onBranched}
          onClose={onClose}
        />

        <ConversationsOverlaySidePanels
          showSourceSelector={showSourceSelector}
          showTerminalHandoff={showTerminalHandoff}
          showPersistencePrivacy={showPersistencePrivacy}
          showTelemetryProof={showTelemetryProof}
          showRehearsalProof={showRehearsalProof}
          showWritingWorkspace={showWritingWorkspace}
          sourceSelectorInitialRef={sourceSelectorInitialRef}
          conversationSourcePreview={conversationSourcePreview}
          writingWorkspaceMode={writingWorkspaceMode}
          conversationId={currentChat?.id}
          activeRunId={activeRunId}
          repositoryAnchor={currentSource?.repoSlug || null}
          defaultSourceText={
            currentChat?.messages[currentChat.messages.length - 1]?.content || ''
          }
          onSourceSelect={onSourceSelect}
          onCloseWritingWorkspace={onCloseWritingWorkspace}
          onWritingHandoff={onWritingHandoff}
        />

        <ConversationsChat
          containerRef={chatContainerRef as React.RefObject<HTMLDivElement>}
          messages={(currentChat?.messages || []) as ChatMessage[]}
          onSend={(message, tokens) => {
            onSend(message, (tokens ?? []) as StreamToken[]);
          }}
          currentConversationId={currentChat?.id}
          disabled={isProcessing}
          placeholder={isProcessing ? 'Processing...' : 'Type a message or /command'}
          renderTokenInMessage={renderTokenInMessage}
          processLogOutputDetails={processLogOutputDetails}
          onScroll={onScroll}
        />

        {activeRunId && (
          <div className="conversations-process-log">
            <BitcodeExecutionStreamPanel
              ref={processLogRef as React.RefObject<HTMLDivElement>}
              isProcessing={activeRunStatusRunning}
              executionState={(executionState || {}) as Record<string, unknown>}
              isStreamingComplete={isRunComplete}
              generationCount={generationCount}
              error={logError}
              runId={activeRunId || undefined}
              output={runLog as string}
              outputDetails={{ ...processLogOutputDetails, ...runLogDetails }}
              onRetry={onRetry}
              onDismissError={onDismissError}
              userHasScrolled={processLogHasScrolled}
              setUserHasScrolled={setProcessLogHasScrolled}
              compact={false}
              latestWorkUpdate={latestWorkUpdate as never}
              iterationUpdates={(iterationUpdates as never[]) || []}
              onOpenDetails={(id) => setSelectedRunDetailsId(id)}
              onNavigateToExecution={(id) => {
                if (typeof window !== 'undefined') {
                  window.open(
                    `/packs?transactionId=${id}&transactionDetail=activity`,
                    '_blank',
                    'noopener',
                  );
                }
              }}
              onClose={() => {
                setActiveRunId(null);
                setSelectedRunDetailsId(null);
              }}
              workUpdatesClassName="mt-4 space-y-4"
            />
          </div>
        )}

        {selectedRunDetailsId && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between bg-gray-900/50 border border-gray-700/60 rounded-md px-3 py-2">
              <div className="text-sm text-gray-200">
                Execution Details ·{' '}
                <span className="font-mono">{selectedRunDetailsId.slice(0, 8)}</span>
              </div>
              <button
                type="button"
                className="text-xs text-gray-300 hover:text-emerald-300 transition"
                onClick={() => setSelectedRunDetailsId(null)}
              >
                Close
              </button>
            </div>
            <div className="bg-gray-900/40 border border-gray-700/60 rounded-md p-4">
              <ExecutionDetailsView runId={selectedRunDetailsId} />
            </div>
          </div>
        )}

        {thinkingLog.length > 0 && <ThinkingLog entries={thinkingLog as never} />}
      </div>

      {processError && (
        <div className="conversations-error">
          <div className="error-message">{processError.message}</div>
          <button onClick={() => setProcessError(null)}>Dismiss</button>
        </div>
      )}
    </>
  );
}
