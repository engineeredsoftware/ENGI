'use client';

/**
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
import dynamic from 'next/dynamic';
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
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useChatState } from './hooks/useChatState';
import { useSSEConnection, createReconnectingEventSource } from './hooks/useSSEConnection';
import { usePipelineState } from './hooks/usePipelineState';

// Components
import SidebarTitleBar from '@/components/bitcode/layout/sidebars/SidebarTitleBar';
import FlipText from '@/components/bitcode/layout/sidebars/FlipText';
import ConversationsChat from './ConversationsChat';
import ConversationsGitHubSourceSelector from './ConversationsGitHubSourceSelector';
import SourceDivider from './ConversationsSourceDivider';
import { FullscreenControls } from './ConversationsFullscreenControls';
import { BranchMenuButton } from './ConversationsBranchMenuButton';
import { SplitGrid } from './ConversationsSplitGrid';
import { ChatHistorySidebar } from './ConversationsChatHistorySidebar';
import { ThinkingLog } from './ConversationsThinkingLog';
import { FloatingOrb } from './ConversationsFloatingOrb';
import FullscreenPortal from './ConversationsFullscreenPortal';
import ConversationSourceSelector from './ConversationSourceSelector';
import ConversationTerminalHandoff from './ConversationTerminalHandoff';
import ConversationPersistencePrivacyPanel from './ConversationPersistencePrivacyPanel';
import ConversationTelemetryProofPanel from './ConversationTelemetryProofPanel';
import ConversationRehearsalPanel from './ConversationRehearsalPanel';
import ConversationWritingWorkspace from './ConversationWritingWorkspace';
import type { ConversationSourceSelectorPreview } from '../conversation-source-selector';
import type { ConversationWritingWorkspaceMode } from '../conversation-writing-workspace';
import BitcodeExecutionStreamPanel from '@/components/bitcode/execution/BitcodeExecutionStreamPanel';
import { ExecutionDetailsView } from '@/app/executions/components/ExecutionsDetailsView';
// NOTE: Avoid wrapping the Big‑O container in GPUAcceleration because
// transform on an ancestor breaks position: sticky on header/input.

// Data hooks
import { useConversationPages, type ConversationRow } from '@/hooks/useConversationPages';
import { useConversationStream, StreamToken } from '@/hooks/useConversationStream';
import {
  mapConversationDetailToChat,
  mapConversationRowToChat,
} from './conversation-chat-mapping';

// Backend types from generics packages
import type { 
  Conversation as DBConversation, 
  ConversationMessage as DBMessage
} from '@bitcode/conversations-generics';

// UI types from local hooks - these intentionally differ from DB types
// The UI uses 'type' instead of 'role' and 'agent' instead of 'assistant'
// This allows for UI-specific features like dividers
import type { Chat, ChatMessage } from './hooks/useChatState';

// Import sidebar classes separately to avoid conflicts
const sidebarBase = '';
const sidebarBg = '';
const sidebarBorderColor = '';
const sidebarRight = '';
const sidebarW28 = '';
const sidebarShadowRight = '';


// Dynamically import QuantumOrb for better performance
const QuantumOrb = dynamic(() => import('@/components/bitcode/effects/quantum-orb').then(mod => ({ default: mod.QuantumOrb })), {
  ssr: false,
  loading: () => null
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Feature flags
const ENABLE_SPLIT_VIEW = true;

// Track entrance animation (module scope to persist across hot reloads)
let didPlayEntrance = false;

// Layout constants
const SIDEBAR_WIDTH_REM = 19;
const ORB_GAP_REM = 8;

// Throttle helper
function throttle<T extends (...args: any[]) => void>(fn: T, wait = 60): T {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  // @ts-ignore
  return function throttled(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn.apply(this, args);
      }, wait - (now - last));
    }
  } as T;
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

function getEntranceInitial(
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left',
) {
  const OFFSET = 64;
  const initial: Record<string, number> = {
    opacity: 0,
    scale: 0.6,
    rotate: -45,
  };

  if (position.includes('right')) initial.x = OFFSET;
  if (position.includes('left')) initial.x = -OFFSET;
  if (position.includes('bottom')) initial.y = OFFSET;
  if (position.includes('top')) initial.y = -OFFSET;

  return initial;
}

function formatConversationExecutionLabel(value?: string) {
  const normalized = String(value || '').trim().toLowerCase();

  if (!normalized) return 'agentic execution';
  if (normalized.includes('measure')) return 'read-measurement execution';
  if (normalized.includes('asset-pack') || normalized.includes('shippable') || normalized.includes('artifact')) {
    return 'AssetPack execution';
  }

  return normalized.replace('agentic-execution:', '').replace(/^pipeline:/, '') || 'agentic execution';
}

// Token rendering helper
function renderTokenInMessageHelper(content: string, tokens?: any[]): string {
  if (!tokens || tokens.length === 0) return content;
  
  let result = content;
  
  // Process execution tokens
  tokens.forEach(token => {
    const pipelineMatch = token.text?.match(/\[\[(shippable|asset_pack|evidence_document):([^\]]+)\]\]/);
    if (!pipelineMatch) return;
    
    const [fullMatch, kind, title] = pipelineMatch;
    const regex = new RegExp(`(^|\\s)${fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
    
    const isAssetPack = kind === 'shippable' || kind === 'asset_pack';
    const kindLabel = isAssetPack ? 'Asset pack' : 'Evidence Document';
    const status = token.metadata?.status || '';
    const sourceLine = token.metadata?.source ? 
      `<svg class="inline w-3 h-3 mr-1" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>${token.metadata.source}` 
      : '';
    
    const sourceChanged = token.metadata?.sourceChanged;
    
    const replacement = 
      ` <div class="inline-block align-middle mx-1 border border-gray-600 rounded-md bg-gray-800/50 overflow-hidden">` +
      `   <div class="px-2 pt-1 flex items-center gap-1.5 border-b border-gray-700">` +
      `     <span class="inline-block w-2 h-2 rounded-full ${isAssetPack ? 'bg-emerald-400' : 'bg-blue-400'}"></span>` +
      `     <span class="font-semibold text-gray-200">${title}</span>` +
      `   </div>` +
      `   <div class="px-2 text-gray-400 pb-1">${kindLabel}${status ? ' · ' + status : ''}</div>` +
      (sourceLine ? ` <div class="px-2 pb-2 text-[10px] text-gray-500 flex items-center gap-1">${sourceLine}${sourceChanged ? ' <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="10" height="10"><path fill="#fbbf24" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z"/></svg>' : ''}</div>` : '') +
      ` </div> `;
    
    result = result.replace(regex, (_match, before) => `${before}${replacement}`);
  });
  
  return result;
}

type ConversationDetailResponse = DBConversation & {
  message_count?: number;
  attachment_count?: number;
  last_message?: string | null;
  messages?: Array<
    DBMessage & {
      message_attachments?: Array<Record<string, unknown>>;
    }
  >;
};

// ---------------------------------------------------------------------------
// Main Component Props
// ---------------------------------------------------------------------------

interface ConversationProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: number;
  inSidebar?: boolean;
  isOpen?: boolean;
  forceOpen?: boolean;
  forceFullscreen?: boolean;
  onToggle?: () => void;
  onCloseRequest?: () => void;
  showFloatingOrb?: boolean;
}

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

  const hydrateConversation = useCallback(async (chat: Chat) => {
    if (!chat.persisted) {
      setCurrentChat(chat);
      setShowHistory(false);
      return chat;
    }

    if (chat.loaded && chat.messageCount !== undefined && chat.messages.length >= chat.messageCount) {
      setCurrentChat(chat);
      setShowHistory(false);
      return chat;
    }

    const response = await fetch(`/api/conversations/${chat.id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to load conversation ${chat.id}`);
    }

    const detail = (await response.json()) as ConversationDetailResponse;
    const hydratedChat = mapConversationDetailToChat(detail, chat);

    startTransition(() => {
      setChats((prev) =>
        prev.map((candidate) => (candidate.id === hydratedChat.id ? hydratedChat : candidate)),
      );
      setCurrentChat(hydratedChat);
      setShowHistory(false);
    });

    return hydratedChat;
  }, [setChats, setCurrentChat, setShowHistory]);

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

        {showSourceSelector && (
          <ConversationSourceSelector
            initialSourceRef={sourceSelectorInitialRef}
            onSelect={handleConversationSourceSelect}
          />
        )}

        {conversationSourcePreview && !showSourceSelector && (
          <div className="conversation-source-selector__status" role="status" aria-live="polite">
            Source context: {conversationSourcePreview.label} · {conversationSourcePreview.previewState.replace('_', ' ')} ·{' '}
            {conversationSourcePreview.sourceSafeRefSummary}
          </div>
        )}

        {showTerminalHandoff && (
          <ConversationTerminalHandoff
            conversationId={currentChat?.id}
            transactionId={activeRunId}
            repositoryAnchor={currentSource?.repoSlug || null}
            sourcePreview={conversationSourcePreview}
          />
        )}

        {showPersistencePrivacy && (
          <ConversationPersistencePrivacyPanel
            conversationId={currentChat?.id}
            defaultSourceText={currentChat?.messages[currentChat.messages.length - 1]?.content || ''}
          />
        )}

        {showTelemetryProof && (
          <ConversationTelemetryProofPanel
            conversationId={currentChat?.id}
            defaultSourceText={currentChat?.messages[currentChat.messages.length - 1]?.content || ''}
          />
        )}

        {showRehearsalProof && (
          <ConversationRehearsalPanel
            conversationId={currentChat?.id}
            defaultSourceText={currentChat?.messages[currentChat.messages.length - 1]?.content || ''}
          />
        )}

        {showWritingWorkspace && (
          <ConversationWritingWorkspace
            conversationId={currentChat?.id}
            initialMode={writingWorkspaceMode}
            onClose={() => setShowWritingWorkspace(false)}
            onHandoff={(handoff) => {
              void handleSendMessageCallback(handoff.message, []);
            }}
          />
        )}

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
