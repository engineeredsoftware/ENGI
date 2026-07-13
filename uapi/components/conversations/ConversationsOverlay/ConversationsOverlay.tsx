'use client';


import dynamic from 'next/dynamic';
import React, {
  useState,
  useRef,
  useEffect,
  memo,
  useCallback,
  useMemo,
  startTransition,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  throttle,
  getEntranceInitial,
  formatConversationExecutionLabel,
  renderTokenInMessageHelper,
} from './conversations-overlay-helpers';
import {
  sidebarBase,
  sidebarBg,
  sidebarBorderColor,
  sidebarRight,
  sidebarW28,
  sidebarShadowRight,
  ENABLE_SPLIT_VIEW,
  SIDEBAR_WIDTH_REM,
  ORB_GAP_REM,
} from './conversations-overlay-constants';
import { useConversationHydration } from './hooks/use-conversation-hydration';
import { ConversationsOverlaySidePanels } from './ConversationsOverlaySidePanels';

/**
 * Conversations Overlay shell - Bitcode production surface.
 * Types, hydration, and helpers live in co-located modules.
 *
 * Conversations Overlay - Bitcode production surface
 *
 * A sophisticated conversation interface with:
 * - Multiple view modes (floating, sidebar, fullscreen, split-screen)
 * - Rich write input with source attachments and output destinations
 * - Real-time SSE streaming for messages and agentic execution events
 * - Embedded process logs with live updates
 * - Keyboard shortcuts for power users
 * - Smooth animations and transitions
 *
 * This is the refactored version maintaining 100% feature parity
 * with zero visual regressions.
 */

let didPlayEntrance = false;

const QuantumOrb = dynamic(
  () =>
    import('@/components/bitcode/effects/quantum-orb').then((mod) => ({
      default: mod.QuantumOrb,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);
import { 
  ReloadIcon, 
  EnterFullScreenIcon, 
  Cross2Icon, 
  ExitFullScreenIcon, 
  PlusIcon, 
  MixerHorizontalIcon, 
  DownloadIcon, 
  CopyIcon, 
  CodeIcon, 
  FileTextIcon, 
  ChatBubbleIcon, 
  MagnifyingGlassIcon,
  Share1Icon,
  LockClosedIcon
} from "@radix-ui/react-icons";

// Styles
import '@/styles/conversations.css';
import '@/styles/conversations-fullscreen.css';
import '@/styles/conversations-button-fix.css';
import '@/styles/conversations/process-log-integration.css';

// Custom hooks
import { useKeyboardShortcuts } from '@/components/conversations/hooks/UseKeyboardShortcuts/UseKeyboardShortcuts';
import { useChatState } from '@/components/conversations/hooks/UseChatState/UseChatState';
import { useSSEConnection, createReconnectingEventSource } from '@/components/conversations/hooks/UseSSEConnection/UseSSEConnection';
import { usePipelineState } from '@/components/conversations/hooks/UsePipelineState/UsePipelineState';

// Components
import SidebarTitleBar from '@/components/bitcode/layout/sidebars/SidebarTitleBar/SidebarTitleBar';
import FlipText from '@/components/bitcode/layout/sidebars/FlipText/FlipText';
import ConversationsChat from '@/components/conversations/ConversationsChat/ConversationsChat';
import ConversationsGitHubSourceSelector from '@/components/conversations/ConversationsGithubSourceSelector/ConversationsGitHubSourceSelector';
import SourceDivider from '@/components/conversations/ConversationsSourceDivider/ConversationsSourceDivider';
import { FullscreenControls } from '@/components/conversations/ConversationsFullscreenControls/ConversationsFullscreenControls';
import { BranchMenuButton } from '@/components/conversations/ConversationsBranchMenuButton/ConversationsBranchMenuButton';
import { SplitGrid } from '@/components/conversations/ConversationsSplitGrid/ConversationsSplitGrid';
import { ChatHistorySidebar } from '@/components/conversations/ConversationsChatHistorySidebar/ConversationsChatHistorySidebar';
import { ThinkingLog } from '@/components/conversations/ConversationsThinkingLog/ConversationsThinkingLog';
import { FloatingOrb } from '@/components/conversations/ConversationsFloatingOrb/ConversationsFloatingOrb';
import FullscreenPortal from '@/components/conversations/ConversationsFullscreenPortal/ConversationsFullscreenPortal';
import ConversationSourceSelector from '@/components/conversations/ConversationSourceSelector/ConversationSourceSelector';
import ConversationWritingWorkspace from '@/components/conversations/ConversationWritingWorkspace/ConversationWritingWorkspace';
import type { ConversationSourceSelectorPreview } from '@/components/conversations/models/conversation-source-selector';
import type { ConversationWritingWorkspaceMode } from '@/components/conversations/models/conversation-writing-workspace';
import BitcodeExecutionStreamPanel from '@/components/bitcode/pipeline/BitcodeExecutionStreamPanel/BitcodeExecutionStreamPanel';
import { ExecutionDetailsView } from '@/components/bitcode/pipeline/ExecutionsDetailsView/ExecutionsDetailsView';
// NOTE: Avoid wrapping the Big‑O container in GPUAcceleration because
// transform on an ancestor breaks position: sticky on header/input.

// Data hooks
import { useConversationPages, type ConversationRow } from '@/hooks/useConversationPages';
import { useConversationStream, StreamToken } from '@/hooks/useConversationStream';
import {
  mapConversationDetailToChat,
  mapConversationRowToChat,
} from '@/components/conversations/ConversationChatMapping/ConversationChatMapping';

// Backend types from generics packages
import type { 
  Conversation as DBConversation, 
  ConversationMessage as DBMessage
} from '@bitcode/conversations-generics';

// UI types from local hooks - these intentionally differ from DB types
// The UI uses 'type' instead of 'role' and 'agent' instead of 'assistant'
// This allows for UI-specific features like dividers
import type { Chat, ChatMessage } from '@/components/conversations/hooks/UseChatState/UseChatState';

// Import sidebar classes separately to avoid conflicts

// Throttle helper

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------



// Token rendering helper

import type { ConversationsOverlayProps as ConversationProps } from './conversations-overlay-types';

// ---------------------------------------------------------------------------
// Conversations Overlay - The Excellence Continues
// ---------------------------------------------------------------------------

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
  // Core state
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [splitScreenMode, setSplitScreenMode] = useState(false);
  
  // Determine actual open state
  const isControlledOpen = !inSidebar && typeof forceOpen === 'boolean';
  const isOpen = inSidebar ? (isOpenProp ?? false) : (isControlledOpen ? forceOpen : isOpenInternal);
  
  // Chat state management (using UI-specific types)
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
    clearAllChats,
    markAsViewed
  } = useChatState();

  const {
    conversations,
    mutate: mutateConversationPages,
  } = useConversationPages('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<Error | null>(null);
  const [processLogOutputDetails, setProcessLogOutputDetails] = useState<any>({});
  
  // UI state
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [processLogHasScrolled, setProcessLogHasScrolled] = useState(false);
  const [currentSource, setCurrentSource] = useState<any>({ repoSlug: '' });
  const [lastSource, setLastSource] = useState<any>(null);
  const [splitBoxes, setSplitBoxes] = useState<any[]>([]);
  const [activeSplitId, setActiveSplitId] = useState<string>('');
  const [embedProcessLogs, setEmbedProcessLogs] = useState(false);
  const activeStreamChatIdRef = useRef<string | null>(null);
  const [showThinkingLogs, setShowThinkingLogs] = useState(true);
  const [selectedRunDetailsId, setSelectedRunDetailsId] = useState<string | null>(null);
  const [lastInputForRetry, setLastInputForRetry] = useState<{message: string; tokens: StreamToken[]} | null>(null);
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [conversationSourcePreview, setConversationSourcePreview] = useState<ConversationSourceSelectorPreview | null>(null);
  const [showTerminalHandoff, setShowTerminalHandoff] = useState(false);
  const [showPersistencePrivacy, setShowPersistencePrivacy] = useState(false);
  const [showTelemetryProof, setShowTelemetryProof] = useState(false);
  const [showRehearsalProof, setShowRehearsalProof] = useState(false);
  const [showWritingWorkspace, setShowWritingWorkspace] = useState(false);
  const [writingWorkspaceMode] = useState<ConversationWritingWorkspaceMode>('read_request');
  
  // Refs
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const processLogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Track if entrance animation has played
  useEffect(() => {
    if (!didPlayEntrance && !inSidebar) {
      didPlayEntrance = false; // Reset for floating mode
    }
  }, [inSidebar]);

  useEffect(() => {
    if (inSidebar || !isControlledOpen) return;

    if (forceOpen) {
      setIsFullscreen(forceFullscreen);
      return;
    }

    setIsFullscreen(false);
    setSplitScreenMode(false);
    setSelectedRunDetailsId(null);
  }, [forceFullscreen, forceOpen, inSidebar, isControlledOpen]);

  // Handle embed process logs in sidebar mode
  useEffect(() => {
    if (inSidebar) {
      // Hide standalone processing-log panels in sidebar mode
      setShowThinkingLogs(false);
      setEmbedProcessLogs(false);
    }
  }, [inSidebar]);

  // Sync embed logs with split screen mode
  useEffect(() => {
    if (!splitScreenMode && embedProcessLogs) {
      setEmbedProcessLogs(false);
      setShowThinkingLogs(true);
    }
  }, [splitScreenMode, embedProcessLogs]);

  // Keyboard shortcuts
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const toggleSplitScreen = useCallback(() => {
    if (!ENABLE_SPLIT_VIEW) return;
    setSplitScreenMode(prev => {
      const next = !prev;
      if (next && splitBoxes.length === 0) {
        const chat = currentChat || createNewChat();
        const primaryBoxId = `box-${Date.now()}-primary`;
        const secondaryBoxId = `box-${Date.now()}-secondary`;
        setSplitBoxes([
          {
            id: primaryBoxId,
            type: 'chat',
            chatId: chat.id,
            width: 50,
            height: 100,
            x: 0,
            y: 0,
          },
          {
            id: secondaryBoxId,
            type: 'chat',
            chatId: chat.id,
            width: 50,
            height: 100,
            x: 10,
            y: 10,
          },
        ]);
        setActiveSplitId(primaryBoxId);
      }
      return next;
    });
  }, [createNewChat, currentChat, splitBoxes.length]);

  useKeyboardShortcuts({
    isOpen,
    isFullscreen,
    inSidebar,
    onToggle: inSidebar ? onToggle : () => setIsOpenInternal(false),
    onToggleFullscreen: toggleFullscreen,
    onToggleSplitScreen: toggleSplitScreen
  });

  useEffect(() => {
    startTransition(() => {
      setChats((prev) => {
        const remoteConversationIds = new Set(conversations.map((conversation) => conversation.id));
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

        const matchingConversation = conversations.find((conversation) => conversation.id === prev.id);
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

  const appendAssistantToken = useCallback((chatId: string, token: string) => {
    const updateChat = (chat: Chat) => {
      const messages = [...chat.messages];
      const lastMessage = messages[messages.length - 1];

      if (!lastMessage || lastMessage.type !== 'agent' || lastMessage.status === 'sent') {
        return chat;
      }

      messages[messages.length - 1] = {
        ...lastMessage,
        content: `${lastMessage.content || ''}${token}`,
      };

      return { ...chat, messages };
    };

    setChats((prev) => prev.map((chat) => (chat.id === chatId ? updateChat(chat) : chat)));
    setCurrentChat((prev) => (prev?.id === chatId ? updateChat(prev) : prev));
  }, [setChats, setCurrentChat]);

  const finalizeStreamingAssistantMessage = useCallback((
    chatId: string,
    messageId: string,
    content: string,
    persistedConversationId?: string,
  ) => {
    const updateChat = (chat: Chat): Chat => {
      const nextConversationId = persistedConversationId || chat.id;
      const messages = [...chat.messages];
      const lastMessage = messages[messages.length - 1];

      if (lastMessage?.type === 'agent') {
        messages[messages.length - 1] = {
          ...lastMessage,
          id: messageId,
          content,
          status: 'sent',
        };
      } else {
        messages.push({
          id: messageId,
          type: 'agent',
          content,
          status: 'sent',
          timestamp: new Date(),
        });
      }

      return {
        ...chat,
        id: nextConversationId,
        messages,
        persisted: true,
        loaded: true,
        updatedAt: new Date().toISOString(),
        lastMessage: content,
      };
    };

    startTransition(() => {
      setChats((prev) => prev.map((chat) => (chat.id === chatId ? updateChat(chat) : chat)));
      setCurrentChat((prev) => (prev?.id === chatId ? updateChat(prev) : prev));
      if (persistedConversationId && persistedConversationId !== chatId) {
        setSplitBoxes((prev) =>
          prev.map((box) =>
            box.chatId === chatId ? { ...box, chatId: persistedConversationId } : box,
          ),
        );
      }
    });
  }, [setChats, setCurrentChat]);

  // SSE Connection for streaming
  const conversationStream = useConversationStream({
    // The send path passes the target chat id explicitly. Keeping the hook key
    // stable prevents first-message draft creation from aborting the stream.
    conversationId: '',
    onToken: (token) => {
      const targetChatId = activeStreamChatIdRef.current || currentChat?.id;
      if (targetChatId) {
        appendAssistantToken(targetChatId, token);
      }
    },
    onMessageComplete: (messageId, content, persistedConversationId) => {
      const targetChatId = activeStreamChatIdRef.current || currentChat?.id;
      if (!targetChatId) {
        return;
      }

      finalizeStreamingAssistantMessage(targetChatId, messageId, content, persistedConversationId);
      activeStreamChatIdRef.current = persistedConversationId || targetChatId;
      void mutateConversationPages();
    },
    onPipelineTriggered: (runId, pipelineType) => {
      startPipelineRun(runId, pipelineType);
      appendThinkingLog({
        type: 'success',
        content: `${formatConversationExecutionLabel(pipelineType)} started (${runId})`
      });
    },
    onPipelineEvent: (runId, event) => {
      handlePipelineEvent(runId, event);
    },
    onPipelineComplete: (runId, success, summary) => {
      completePipelineRun(runId, success, summary);
    },
    onError: (message, code) => {
      setProcessError(new Error(message));
      appendThinkingLog({
        type: 'error',
        content: message
      });
    },
    throttleMs: 50
  });

  // Pipeline state from hook
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
    appendRunLog,
    appendThinkingLog,
    clearThinkingLog,
    handlePipelineEvent,
    clearRuns,
    resetExecutionState,
    setActiveRunId
  } = usePipelineState({
    onPipelineStart: (runId, type) => {
      setIsProcessing(true);
    },
    onPipelineComplete: (runId, success) => {
      setIsProcessing(false);
    }
  });

  // Handle sending messages
  const handleSendMessageCallback = useCallback(async (
    message: string,
    tokens: StreamToken[],
    targetChatId?: string,
  ) => {
    if (!message.trim()) return;

    const targetChat = targetChatId
      ? chats.find((chat) => chat.id === targetChatId) || (currentChat?.id === targetChatId ? currentChat : null)
      : currentChat;
    const createdDraftChat = !targetChat;
    const activeChat = targetChat || createNewChat();
    activeStreamChatIdRef.current = activeChat.id;
    setCurrentChat(activeChat);
    
    setProcessError(null);
    setIsProcessing(true);
    setLastInputForRetry({ message, tokens }); // Store for retry

    // Add user message to chat (using UI types)
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',  // UI uses 'type' not 'role'
      content: message,
      status: 'sending',
      timestamp: new Date(),
      tokens
    };

    // Create agent message placeholder (UI uses 'agent' not 'assistant')
    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'agent',  // UI uses 'agent' not 'assistant'
      content: '',
      status: 'sending',
      timestamp: new Date()
    };

    const initialMessages = [newMsg, assistantMsg];
    setChats((prev) => {
      let found = false;
      const next = prev.map((chat) => {
        if (chat.id !== activeChat.id) {
          return chat;
        }

        found = true;
        return {
          ...chat,
          messages: [...chat.messages, ...initialMessages],
        };
      });

      if (found) {
        return next;
      }

      return [
        {
          ...activeChat,
          messages: [...activeChat.messages, ...initialMessages],
          loaded: true,
        },
        ...prev,
      ];
    });
    setCurrentChat((prev) => {
      if (prev && prev.id !== activeChat.id) {
        return prev;
      }

      const baseChat = prev ?? activeChat;
      return {
        ...baseChat,
        messages: [...baseChat.messages, ...initialMessages],
        loaded: true,
      };
    });

    try {
      if (createdDraftChat) {
        await new Promise<void>((resolve) => {
          window.requestAnimationFrame(() => resolve());
        });
      }

      // Send via streaming API
      const assistantContent = await conversationStream.sendMessage(message, tokens || [], true, activeChat.id);
      
      // Mark user message as sent
      updateMessage(newMsg.id, { status: 'sent' }, activeChat.id);
      if (assistantContent) {
        updateMessage(assistantMsg.id, {
          content: assistantContent,
          status: 'sent',
        }, activeChat.id);
      }
      void mutateConversationPages();
    } catch (error) {
      setProcessError(error as Error);
      updateMessage(assistantMsg.id, { 
        status: 'error',
        content: 'Failed to send message. Please try again.'
      }, activeChat.id);
    } finally {
      setIsProcessing(false);
    }
  }, [
    chats,
    currentChat,
    createNewChat,
    setChats,
    setCurrentChat,
    updateMessage,
    conversationStream,
    mutateConversationPages,
  ]);

  // Handle source changes
  const handleSourceChange = useCallback((source: any) => {
    setCurrentSource(source);
    setLastSource(source);
  }, []);

  const sourceSelectorInitialRef = useMemo(() => {
    if (!currentSource?.repoSlug) return '';
    if (currentSource.commitSha) return `${currentSource.repoSlug}@${currentSource.commitSha}`;
    if (currentSource.branch) return `${currentSource.repoSlug}#${currentSource.branch}`;
    return currentSource.repoSlug;
  }, [currentSource?.branch, currentSource?.commitSha, currentSource?.repoSlug]);

  const handleConversationSourceSelect = useCallback((preview: ConversationSourceSelectorPreview) => {
    setConversationSourcePreview(preview);
    setLastSource(preview);

    const sourceRef = preview.sourceSafeRefSummary;
    if (preview.kind === 'repository' && sourceRef.includes('/')) {
      setCurrentSource({ repoSlug: sourceRef });
    }
    if (preview.kind === 'branch' && sourceRef.includes('#')) {
      const [repoSlug, branch] = sourceRef.split('#');
      setCurrentSource({ repoSlug, branch: branch || null, commitSha: null });
    }
    if (preview.kind === 'commit' && sourceRef.includes('@')) {
      const [repoSlug, commitSha] = sourceRef.split('@');
      setCurrentSource({ repoSlug, branch: null, commitSha: commitSha || null });
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
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

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setUserHasScrolled(!isAtBottom);
  }, []);

  // Handle closing
  const handleClose = useCallback(() => {
    if (inSidebar && onToggle) {
      onToggle();
    } else if (onCloseRequest) {
      onCloseRequest();
    } else {
      setIsOpenInternal(false);
    }
  }, [inSidebar, onCloseRequest, onToggle]);

  // Render token in message helper
  const renderTokenInMessage = useCallback((content: string, tokens?: any[]): string => {
    return renderTokenInMessageHelper(content, tokens);
  }, []);

  // Create split box helper
  const createSplitBox = useCallback((type: 'chat' | 'command' | 'source') => {
    const newBox = {
      id: `box-${Date.now()}`,
      type,
      chatId: currentChat?.id ?? '',
      width: 50,
      height: 100,
      x: splitBoxes.length * 10,
      y: splitBoxes.length * 10
    };
    setSplitBoxes(prev => [...prev, newBox]);
    setActiveSplitId(newBox.id);
  }, [currentChat?.id, splitBoxes]);

  // Handle retry after error
  const handleRetry = useCallback(() => {
    if (!lastInputForRetry) return;
    const { message, tokens } = lastInputForRetry;
    setProcessError(null);
    handleSendMessageCallback(message, tokens);
  }, [lastInputForRetry, handleSendMessageCallback]);

  // Handle dismiss error
  const handleDismissError = useCallback(() => {
    setProcessError(null);
  }, []);

  // Clean up on unmount
  const cleanupConversationStream = conversationStream.cleanup;

  useEffect(() => {
    return () => {
      cleanupConversationStream?.();
    };
  }, [cleanupConversationStream]);

  // Render main component
  if (!isOpen && !inSidebar) {
    if (!showFloatingOrb) {
      return null;
    }
    // Floating orb mode
    return (
      <FloatingOrb
        position={position}
        size={size}
        onClick={() => setIsOpenInternal(true)}
        didPlayEntrance={didPlayEntrance}
        onEntranceComplete={() => { didPlayEntrance = true; }}
      />
    );
  }

  // Full component render
  const activeRun = activeRunId ? runs.find(r => r.id === activeRunId) : null;
  const isRunComplete = activeRun ? activeRun.status !== 'running' : !isProcessing;
  const logError = processError?.message || null;

  const mainContent = (
    <>
      {/* Chat history sidebar */}
      {showHistory && (
        <ChatHistorySidebar
          chats={chats}
          currentChat={currentChat}
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
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Main chat interface */}
      <div className="conversations-container">
        {/* Header */}
        <div className="conversations-header">
          <SidebarTitleBar>
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 truncate font-medium">
                {currentChat?.title || 'New Conversation'}
              </div>
              <button className="fullscreen-button" title="Chat History" onClick={() => setShowHistory(!showHistory)}>
                <ChatBubbleIcon />
              </button>
              <button className="fullscreen-button" title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'} onClick={toggleFullscreen}>
                {isFullscreen ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
              </button>
              <button className="fullscreen-button" title="Toggle Split View" onClick={toggleSplitScreen} disabled={!ENABLE_SPLIT_VIEW}>
                <MixerHorizontalIcon />
              </button>
              <button
                className="fullscreen-button"
                title={showWritingWorkspace ? 'Hide Writing Workspace' : 'Open Writing Workspace'}
                aria-pressed={showWritingWorkspace}
                onClick={() => setShowWritingWorkspace((prev) => !prev)}
              >
                <FileTextIcon />
              </button>
              <button
                className="fullscreen-button"
                title={showSourceSelector ? 'Hide Source Selector' : 'Open Source Selector'}
                aria-pressed={showSourceSelector}
                onClick={() => setShowSourceSelector((prev) => !prev)}
              >
                <MagnifyingGlassIcon />
              </button>
              <button
                className="fullscreen-button"
                title={showTerminalHandoff ? 'Hide Terminal Handoff' : 'Open Terminal Handoff'}
                aria-pressed={showTerminalHandoff}
                onClick={() => setShowTerminalHandoff((prev) => !prev)}
              >
                <Share1Icon />
              </button>
              <button
                className="fullscreen-button"
                title={showPersistencePrivacy ? 'Hide Persistence Privacy' : 'Open Persistence Privacy'}
                aria-pressed={showPersistencePrivacy}
                onClick={() => setShowPersistencePrivacy((prev) => !prev)}
              >
                <LockClosedIcon />
              </button>
              <button
                className="fullscreen-button"
                title={showTelemetryProof ? 'Hide Telemetry Proof' : 'Open Telemetry Proof'}
                aria-pressed={showTelemetryProof}
                onClick={() => setShowTelemetryProof((prev) => !prev)}
              >
                <CodeIcon />
              </button>
              <button
                className="fullscreen-button"
                title={showRehearsalProof ? 'Hide Rehearsal Proof' : 'Open Rehearsal Proof'}
                aria-pressed={showRehearsalProof}
                onClick={() => setShowRehearsalProof((prev) => !prev)}
              >
                <ReloadIcon />
              </button>
              <BranchMenuButton
                onBranched={(c: any) => {
                  const newChat = {
                    id: c.id,
                    title: c.title || 'Branched Conversation',
                    messages: [],
                    runs: [],
                    persisted: true,
                    loaded: false,
                  };
                  setChats(prev => [newChat, ...prev]);
                  setCurrentChat(newChat);
                  setShowHistory(false);
                  void mutateConversationPages();
                }}
              />
              <button className="fullscreen-button" title="Close" onClick={handleClose}>
                <Cross2Icon />
              </button>
            </div>
          </SidebarTitleBar>
        </div>

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
          defaultSourceText={currentChat?.messages[currentChat.messages.length - 1]?.content || ''}
          onSourceSelect={handleConversationSourceSelect}
          onCloseWritingWorkspace={() => setShowWritingWorkspace(false)}
          onWritingHandoff={(message, tokens) => {
            void handleSendMessageCallback(message, tokens);
          }}
        />

        {/* Messages */}
        <ConversationsChat
          containerRef={chatContainerRef}
          messages={currentChat?.messages || []}
          onSend={(message, tokens) => {
            void handleSendMessageCallback(message, (tokens ?? []) as StreamToken[]);
          }}
          currentConversationId={currentChat?.id}
          disabled={isProcessing}
          placeholder={isProcessing ? 'Processing...' : 'Type a message or /command'}
          renderTokenInMessage={renderTokenInMessage}
          processLogOutputDetails={processLogOutputDetails}
          onScroll={handleScroll}
        />

        {/* Process log (if active) */}
        {activeRunId && (
          <div className="conversations-process-log">
            <BitcodeExecutionStreamPanel
              ref={processLogRef}
              isProcessing={isProcessing || (activeRun?.status === 'running')}
              executionState={executionState || {}}
              isStreamingComplete={isRunComplete}
              generationCount={generationCount}
              error={logError}
              runId={activeRunId || undefined}
              output={runLog}
              outputDetails={{ ...processLogOutputDetails, ...runLogDetails }}
              onRetry={handleRetry}
              onDismissError={handleDismissError}
              userHasScrolled={processLogHasScrolled}
              setUserHasScrolled={setProcessLogHasScrolled}
              compact={false}
              latestWorkUpdate={latestWorkUpdate as any}
              iterationUpdates={(iterationUpdates as any[]) || []}
              onOpenDetails={(id) => setSelectedRunDetailsId(id)}
              onNavigateToExecution={(id) => {
                if (typeof window !== 'undefined') {
                  window.open(`/packs?transactionId=${id}&transactionDetail=activity`, '_blank', 'noopener');
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
                Execution Details · <span className="font-mono">{selectedRunDetailsId.slice(0, 8)}</span>
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

        {/* Thinking log */}
        {thinkingLog.length > 0 && (
          <ThinkingLog entries={thinkingLog} />
        )}

        {/* Command menu removed - ':' trigger no longer used */}
      </div>

      {/* Error display */}
      {processError && (
        <div className="conversations-error">
          <div className="error-message">
            {processError.message}
          </div>
          <button onClick={() => setProcessError(null)}>Dismiss</button>
        </div>
      )}
    </>
  );

  // Handle fullscreen mode
  if (isFullscreen) {
    return (
      <FullscreenPortal isOpen={isFullscreen} onClose={handleClose}>
        <>
          {splitScreenMode ? (
            <SplitGrid
              boxes={splitBoxes}
              chats={chats}
              activeSplitId={activeSplitId}
              embedProcessLogs={embedProcessLogs}
              renderLog={() => null}
              onSelectChatInBox={(id, chatId) => {
                setSplitBoxes((prev) =>
                  prev.map((box) => (box.id === id ? { ...box, chatId } : box)),
                );
                const nextChat = chats.find((chat) => chat.id === chatId) ?? null;
                if (nextChat) {
                  setCurrentChat(nextChat);
                }
                setActiveSplitId(id);
              }}
              onActivateBox={(id) => {
                setActiveSplitId(id);
                const box = splitBoxes.find((candidate) => candidate.id === id);
                const nextChat = box ? chats.find((chat) => chat.id === box.chatId) : null;
                if (nextChat) {
                  setCurrentChat(nextChat);
                }
              }}
              onRemoveBox={(id) => {
                setSplitBoxes(prev => prev.filter(box => box.id !== id));
              }}
              onSend={(message, tokens, chatId) => {
                void handleSendMessageCallback(message, tokens, chatId);
              }}
              renderTokenInMessage={renderTokenInMessage}
              currentSource={currentSource}
              onSourceChange={setCurrentSource}
            />
          ) : (
            mainContent
          )}
          
          <FullscreenControls
            onNewChat={() => {
              const chat = createNewChat();
              setCurrentChat(chat);
            }}
            onSplit={toggleSplitScreen}
            onToggleLogs={() => {
              setEmbedProcessLogs((prev) => !prev);
            }}
            logsToggleDisabled={!activeRunId}
            onToggleSize={toggleFullscreen}
            onExit={handleClose}
            splitActive={splitScreenMode}
            logsEmbedded={embedProcessLogs}
          />
        </>
      </FullscreenPortal>
    );
  }

  return mainContent;
});

export default Conversation;
