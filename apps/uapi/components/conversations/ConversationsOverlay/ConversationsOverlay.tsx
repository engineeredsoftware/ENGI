'use client';

/**
 * Conversations Overlay orchestration shell.
 * View mode, send path, hydration, header, and main content are co-located modules.
 *
 * Features: floating/sidebar/fullscreen/split views, rich write input with sources,
 * SSE streaming, embedded process logs, keyboard shortcuts.
 */

import React, {
  useState,
  useRef,
  useEffect,
  memo,
  useCallback,
  startTransition,
} from 'react';

import {
  throttle,
  renderTokenInMessageHelper,
} from './conversations-overlay-helpers';
import { formatConversationExecutionLabel } from './conversations-overlay-helpers';
import { useConversationHydration } from './hooks/use-conversation-hydration';
import { useConversationSend } from './hooks/use-conversation-send';
import { useConversationViewMode } from './hooks/use-conversation-view-mode';
import { ConversationsOverlayMainContent } from './ConversationsOverlayMainContent';
import type { ConversationsOverlayProps as ConversationProps } from './conversations-overlay-types';

import { useKeyboardShortcuts } from '@/components/conversations/hooks/UseKeyboardShortcuts/UseKeyboardShortcuts';
import { useChatState } from '@/components/conversations/hooks/UseChatState/UseChatState';
import { usePipelineState } from '@/components/conversations/hooks/UsePipelineState/UsePipelineState';
import { FloatingOrb } from '@/components/conversations/ConversationsFloatingOrb/ConversationsFloatingOrb';
import FullscreenPortal from '@/components/conversations/ConversationsFullscreenPortal/ConversationsFullscreenPortal';
import { FullscreenControls } from '@/components/conversations/ConversationsFullscreenControls/ConversationsFullscreenControls';
import { SplitGrid } from '@/components/conversations/ConversationsSplitGrid/ConversationsSplitGrid';
import { useConversationPages } from '@/hooks/useConversationPages';
import { useConversationStream, type StreamToken } from '@/hooks/useConversationStream';
import { mapConversationRowToChat } from '@/components/conversations/ConversationChatMapping/ConversationChatMapping';

import '@/styles/conversations.css';
import '@/styles/conversations-fullscreen.css';
import '@/styles/conversations-button-fix.css';
import '@/styles/conversations/process-log-integration.css';

let didPlayEntrance = false;

const Conversation = memo(function Conversation({
  position = 'bottom-right',
  size = 60,
  inSidebar = false,
  isOpen: isOpenProp,
  forceOpen,
  forceFullscreen = false,
  onToggle,
  onCloseRequest,
  showFloatingOrb = true,
}: ConversationProps) {
  const {
    chats,
    currentChat,
    showHistory,
    setChats,
    setCurrentChat,
    setShowHistory,
    createNewChat,
    deleteChat,
    updateMessage,
    markAsViewed,
  } = useChatState();

  const {
    conversations,
    mutate: mutateConversationPages,
  } = useConversationPages('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<Error | null>(null);
  const [processLogOutputDetails, setProcessLogOutputDetails] = useState<Record<string, unknown>>({});
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [processLogHasScrolled, setProcessLogHasScrolled] = useState(false);
  const [lastInputForRetry, setLastInputForRetry] = useState<{
    message: string;
    tokens: StreamToken[];
  } | null>(null);
  const activeStreamChatIdRef = useRef<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const processLogRef = useRef<HTMLDivElement>(null);

  const view = useConversationViewMode({
    inSidebar,
    isOpenProp,
    forceOpen,
    forceFullscreen,
    currentChat,
    createNewChat,
  });

  useEffect(() => {
    if (!didPlayEntrance && !inSidebar) {
      didPlayEntrance = false;
    }
  }, [inSidebar]);

  useKeyboardShortcuts({
    isOpen: view.isOpen,
    isFullscreen: view.isFullscreen,
    inSidebar,
    onToggle: inSidebar ? onToggle : () => view.setIsOpenInternal(false),
    onToggleFullscreen: view.toggleFullscreen,
    onToggleSplitScreen: view.toggleSplitScreen,
  });

  useEffect(() => {
    startTransition(() => {
      setChats((prev) => {
        const remoteConversationIds = new Set(conversations.map((c) => c.id));
        const persistedById = new Map(
          prev.filter((chat) => chat.persisted).map((chat) => [chat.id, chat]),
        );
        const localOnlyChats = prev.filter(
          (chat) => !chat.persisted || !remoteConversationIds.has(chat.id),
        );

        return [
          ...localOnlyChats,
          ...conversations.map((conversation) =>
            mapConversationRowToChat(conversation, persistedById.get(conversation.id) || null),
          ),
        ];
      });

      setCurrentChat((prev) => {
        if (!prev?.persisted) {
          return prev;
        }

        const matchingConversation = conversations.find((c) => c.id === prev.id);
        if (!matchingConversation) {
          return prev;
        }

        return mapConversationRowToChat(matchingConversation, prev);
      });
    });
  }, [conversations, setChats, setCurrentChat]);

  const { hydrateConversation } = useConversationHydration({
    setChats,
    setCurrentChat,
    setShowHistory,
  });

  const {
    runs,
    activeRunId,
    runLog,
    runLogDetails,
    thinkingLog,
    executionState,
    generationCount,
    latestWorkUpdate,
    iterationUpdates,
    startPipelineRun,
    completePipelineRun,
    appendThinkingLog,
    handlePipelineEvent,
    setActiveRunId,
  } = usePipelineState({
    onPipelineStart: () => {
      setIsProcessing(true);
    },
    onPipelineComplete: () => {
      setIsProcessing(false);
    },
  });

  // Placeholder stream object; send hook binds after stream is created.
  // We wire send after stream so onToken can use append from send hook.
  const streamCallbacksRef = useRef<{
    appendAssistantToken: (chatId: string, token: string) => void;
    finalizeStreamingAssistantMessage: (
      chatId: string,
      messageId: string,
      content: string,
      persistedConversationId?: string,
    ) => void;
  }>({
    appendAssistantToken: () => {},
    finalizeStreamingAssistantMessage: () => {},
  });

  const conversationStream = useConversationStream({
    conversationId: '',
    onToken: (token) => {
      const targetChatId = activeStreamChatIdRef.current || currentChat?.id;
      if (targetChatId) {
        streamCallbacksRef.current.appendAssistantToken(targetChatId, token);
      }
    },
    onMessageComplete: (messageId, content, persistedConversationId) => {
      const targetChatId = activeStreamChatIdRef.current || currentChat?.id;
      if (!targetChatId) {
        return;
      }

      streamCallbacksRef.current.finalizeStreamingAssistantMessage(
        targetChatId,
        messageId,
        content,
        persistedConversationId,
      );
      activeStreamChatIdRef.current = persistedConversationId || targetChatId;
      void mutateConversationPages();
    },
    onPipelineTriggered: (runId, pipelineType) => {
      startPipelineRun(runId, pipelineType);
      appendThinkingLog({
        type: 'success',
        content: `${formatConversationExecutionLabel(pipelineType)} started (${runId})`,
      });
    },
    onPipelineEvent: (runId, event) => {
      handlePipelineEvent(runId, event);
    },
    onPipelineComplete: (runId, success, summary) => {
      completePipelineRun(runId, success, summary);
    },
    onError: (message) => {
      setProcessError(new Error(message));
      appendThinkingLog({
        type: 'error',
        content: message,
      });
    },
    throttleMs: 50,
  });

  const {
    appendAssistantToken,
    finalizeStreamingAssistantMessage,
    handleSendMessageCallback,
    handleRetry,
  } = useConversationSend({
    chats,
    currentChat,
    createNewChat,
    setChats,
    setCurrentChat,
    updateMessage,
    setProcessError,
    setIsProcessing,
    setLastInputForRetry,
    setSplitBoxes: view.setSplitBoxes,
    activeStreamChatIdRef,
    conversationStream,
    mutateConversationPages,
    lastInputForRetry,
  });

  streamCallbacksRef.current = {
    appendAssistantToken,
    finalizeStreamingAssistantMessage,
  };

  useEffect(() => {
    if (!userHasScrolled && chatContainerRef.current) {
      const scrollToBottom = throttle(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      });
      scrollToBottom();
    }
  }, [currentChat?.messages, userHasScrolled]);

  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setUserHasScrolled(!isAtBottom);
  }, []);

  const handleClose = useCallback(() => {
    if (inSidebar && onToggle) {
      onToggle();
    } else if (onCloseRequest) {
      onCloseRequest();
    } else {
      view.setIsOpenInternal(false);
    }
  }, [inSidebar, onCloseRequest, onToggle, view]);

  const renderTokenInMessage = useCallback((content: string, tokens?: unknown[]): string => {
    return renderTokenInMessageHelper(content, tokens as never);
  }, []);

  const handleDismissError = useCallback(() => {
    setProcessError(null);
  }, []);

  const cleanupConversationStream = conversationStream.cleanup;
  useEffect(() => {
    return () => {
      cleanupConversationStream?.();
    };
  }, [cleanupConversationStream]);

  if (!view.isOpen && !inSidebar) {
    if (!showFloatingOrb) {
      return null;
    }
    return (
      <FloatingOrb
        position={position}
        size={size}
        onClick={() => view.setIsOpenInternal(true)}
        didPlayEntrance={didPlayEntrance}
        onEntranceComplete={() => {
          didPlayEntrance = true;
        }}
      />
    );
  }

  const activeRun = activeRunId ? runs.find((r) => r.id === activeRunId) : null;
  const isRunComplete = activeRun ? activeRun.status !== 'running' : !isProcessing;
  const logError = processError?.message || null;

  const mainContent = (
    <ConversationsOverlayMainContent
      chats={chats}
      currentChat={currentChat}
      showHistory={showHistory}
      isFullscreen={view.isFullscreen}
      isProcessing={isProcessing}
      processError={processError}
      processLogOutputDetails={processLogOutputDetails}
      processLogHasScrolled={processLogHasScrolled}
      activeRunId={activeRunId}
      selectedRunDetailsId={view.selectedRunDetailsId}
      isRunComplete={isRunComplete}
      logError={logError}
      executionState={executionState}
      generationCount={generationCount}
      runLog={runLog}
      runLogDetails={runLogDetails as Record<string, unknown>}
      latestWorkUpdate={latestWorkUpdate}
      iterationUpdates={(iterationUpdates as unknown[]) || []}
      thinkingLog={thinkingLog as Array<{ type: string; content: string }>}
      showSourceSelector={view.showSourceSelector}
      showProductHandoff={view.showProductHandoff}
      showPersistencePrivacy={view.showPersistencePrivacy}
      showTelemetryProof={view.showTelemetryProof}
      showRehearsalProof={view.showRehearsalProof}
      showWritingWorkspace={view.showWritingWorkspace}
      sourceSelectorInitialRef={view.sourceSelectorInitialRef}
      conversationSourcePreview={view.conversationSourcePreview}
      writingWorkspaceMode={view.writingWorkspaceMode}
      currentSource={view.currentSource}
      chatContainerRef={chatContainerRef}
      processLogRef={processLogRef}
      onSelectChat={(chat) => {
        void hydrateConversation(chat)
          .then(() => {
            markAsViewed(chat.id);
          })
          .catch((error) => {
            setProcessError(error as Error);
          });
      }}
      onCreateChat={createNewChat}
      onDeleteChat={deleteChat}
      onCloseHistory={() => setShowHistory(false)}
      onToggleHistory={() => setShowHistory(!showHistory)}
      onToggleFullscreen={view.toggleFullscreen}
      onToggleSplitScreen={view.toggleSplitScreen}
      onToggleWritingWorkspace={() => view.setShowWritingWorkspace((prev) => !prev)}
      onToggleSourceSelector={() => view.setShowSourceSelector((prev) => !prev)}
      onToggleProductHandoff={() => view.setShowTerminalHandoff((prev) => !prev)}
      onTogglePersistencePrivacy={() => view.setShowPersistencePrivacy((prev) => !prev)}
      onToggleTelemetryProof={() => view.setShowTelemetryProof((prev) => !prev)}
      onToggleRehearsalProof={() => view.setShowRehearsalProof((prev) => !prev)}
      onBranched={(c) => {
        const newChat = {
          id: c.id,
          title: c.title || 'Branched Conversation',
          messages: [],
          runs: [],
          persisted: true,
          loaded: false,
        };
        setChats((prev) => [newChat, ...prev]);
        setCurrentChat(newChat);
        setShowHistory(false);
        void mutateConversationPages();
      }}
      onClose={handleClose}
      onSourceSelect={view.handleConversationSourceSelect}
      onCloseWritingWorkspace={() => view.setShowWritingWorkspace(false)}
      onWritingHandoff={(message, tokens) => {
        void handleSendMessageCallback(message, tokens);
      }}
      onSend={(message, tokens) => {
        void handleSendMessageCallback(message, (tokens ?? []) as StreamToken[]);
      }}
      renderTokenInMessage={renderTokenInMessage}
      onScroll={handleScroll}
      onRetry={handleRetry}
      onDismissError={handleDismissError}
      setProcessLogHasScrolled={setProcessLogHasScrolled}
      setSelectedRunDetailsId={view.setSelectedRunDetailsId}
      setActiveRunId={setActiveRunId}
      setProcessError={setProcessError}
    />
  );

  if (view.isFullscreen) {
    return (
      <FullscreenPortal isOpen={view.isFullscreen} onClose={handleClose}>
        <>
          {view.splitScreenMode ? (
            <SplitGrid
              boxes={view.splitBoxes}
              chats={chats}
              activeSplitId={view.activeSplitId}
              embedProcessLogs={view.embedProcessLogs}
              renderLog={() => null}
              onSelectChatInBox={(id, chatId) => {
                view.setSplitBoxes((prev) =>
                  prev.map((box) => (box.id === id ? { ...box, chatId } : box)),
                );
                const nextChat = chats.find((chat) => chat.id === chatId) ?? null;
                if (nextChat) {
                  setCurrentChat(nextChat);
                }
                view.setActiveSplitId(id);
              }}
              onActivateBox={(id) => {
                view.setActiveSplitId(id);
                const box = view.splitBoxes.find((candidate) => candidate.id === id);
                const nextChat = box
                  ? chats.find((chat) => chat.id === box.chatId)
                  : null;
                if (nextChat) {
                  setCurrentChat(nextChat);
                }
              }}
              onRemoveBox={(id) => {
                view.setSplitBoxes((prev) => prev.filter((box) => box.id !== id));
              }}
              onSend={(message, tokens, chatId) => {
                void handleSendMessageCallback(message, tokens, chatId);
              }}
              renderTokenInMessage={renderTokenInMessage}
              currentSource={view.currentSource}
              onSourceChange={view.setCurrentSource}
            />
          ) : (
            mainContent
          )}

          <FullscreenControls
            onNewChat={() => {
              const chat = createNewChat();
              setCurrentChat(chat);
            }}
            onSplit={view.toggleSplitScreen}
            onToggleLogs={() => {
              view.setEmbedProcessLogs((prev) => !prev);
            }}
            logsToggleDisabled={!activeRunId}
            onToggleSize={view.toggleFullscreen}
            onExit={handleClose}
            splitActive={view.splitScreenMode}
            logsEmbedded={view.embedProcessLogs}
          />
        </>
      </FullscreenPortal>
    );
  }

  return mainContent;
});

export default Conversation;
