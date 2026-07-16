/**
 * Overlay view-mode state: open/fullscreen/split, panel toggles, source preview.
 */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ConversationSourceSelectorPreview } from '@/components/conversations/models/conversation-source-selector';
import type { ConversationWritingWorkspaceMode } from '@/components/conversations/models/conversation-writing-workspace';
import type { Chat } from '@/components/conversations/hooks/UseChatState/UseChatState';
import { ENABLE_SPLIT_VIEW } from '../conversations-overlay-constants';

export interface SplitBox {
  id: string;
  type: 'chat' | 'command' | 'source';
  chatId: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface UseConversationViewModeArgs {
  inSidebar: boolean;
  isOpenProp?: boolean;
  forceOpen?: boolean;
  forceFullscreen?: boolean;
  currentChat: Chat | null;
  createNewChat: () => Chat;
}

export function useConversationViewMode({
  inSidebar,
  isOpenProp,
  forceOpen,
  forceFullscreen = false,
  currentChat,
  createNewChat,
}: UseConversationViewModeArgs) {
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [splitScreenMode, setSplitScreenMode] = useState(false);
  const [splitBoxes, setSplitBoxes] = useState<SplitBox[]>([]);
  const [activeSplitId, setActiveSplitId] = useState<string>('');
  const [embedProcessLogs, setEmbedProcessLogs] = useState(false);
  const [showThinkingLogs, setShowThinkingLogs] = useState(true);
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [conversationSourcePreview, setConversationSourcePreview] =
    useState<ConversationSourceSelectorPreview | null>(null);
  const [showProductHandoff, setShowProductHandoff] = useState(false);
  const [showPersistencePrivacy, setShowPersistencePrivacy] = useState(false);
  const [showTelemetryProof, setShowTelemetryProof] = useState(false);
  const [showRehearsalProof, setShowRehearsalProof] = useState(false);
  const [showWritingWorkspace, setShowWritingWorkspace] = useState(false);
  const [writingWorkspaceMode] = useState<ConversationWritingWorkspaceMode>('read_request');
  const [currentSource, setCurrentSource] = useState<{
    repoSlug: string;
    branch?: string | null;
    commitSha?: string | null;
  }>({ repoSlug: '' });
  const [lastSource, setLastSource] = useState<unknown>(null);
  const [selectedRunDetailsId, setSelectedRunDetailsId] = useState<string | null>(null);

  const isControlledOpen = !inSidebar && typeof forceOpen === 'boolean';
  const isOpen = inSidebar
    ? (isOpenProp ?? false)
    : isControlledOpen
      ? forceOpen
      : isOpenInternal;

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

  useEffect(() => {
    if (inSidebar) {
      setShowThinkingLogs(false);
      setEmbedProcessLogs(false);
    }
  }, [inSidebar]);

  useEffect(() => {
    if (!splitScreenMode && embedProcessLogs) {
      setEmbedProcessLogs(false);
      setShowThinkingLogs(true);
    }
  }, [splitScreenMode, embedProcessLogs]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const toggleSplitScreen = useCallback(() => {
    if (!ENABLE_SPLIT_VIEW) return;
    setSplitScreenMode((prev) => {
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

  const sourceSelectorInitialRef = useMemo(() => {
    if (!currentSource?.repoSlug) return '';
    if (currentSource.commitSha) return `${currentSource.repoSlug}@${currentSource.commitSha}`;
    if (currentSource.branch) return `${currentSource.repoSlug}#${currentSource.branch}`;
    return currentSource.repoSlug;
  }, [currentSource?.branch, currentSource?.commitSha, currentSource?.repoSlug]);

  const handleConversationSourceSelect = useCallback(
    (preview: ConversationSourceSelectorPreview) => {
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
    },
    [],
  );

  const handleSourceChange = useCallback((source: {
    repoSlug: string;
    branch?: string | null;
    commitSha?: string | null;
  }) => {
    setCurrentSource(source);
    setLastSource(source);
  }, []);

  const createSplitBox = useCallback(
    (type: 'chat' | 'command' | 'source') => {
      const newBox: SplitBox = {
        id: `box-${Date.now()}`,
        type,
        chatId: currentChat?.id ?? '',
        width: 50,
        height: 100,
        x: splitBoxes.length * 10,
        y: splitBoxes.length * 10,
      };
      setSplitBoxes((prev) => [...prev, newBox]);
      setActiveSplitId(newBox.id);
    },
    [currentChat?.id, splitBoxes],
  );

  return {
    isOpen,
    isOpenInternal,
    setIsOpenInternal,
    isFullscreen,
    setIsFullscreen,
    splitScreenMode,
    splitBoxes,
    setSplitBoxes,
    activeSplitId,
    setActiveSplitId,
    embedProcessLogs,
    setEmbedProcessLogs,
    showThinkingLogs,
    selectedRunDetailsId,
    setSelectedRunDetailsId,
    showSourceSelector,
    setShowSourceSelector,
    conversationSourcePreview,
    showProductHandoff,
    setShowProductHandoff,
    showPersistencePrivacy,
    setShowPersistencePrivacy,
    showTelemetryProof,
    setShowTelemetryProof,
    showRehearsalProof,
    setShowRehearsalProof,
    showWritingWorkspace,
    setShowWritingWorkspace,
    writingWorkspaceMode,
    currentSource,
    setCurrentSource,
    lastSource,
    toggleFullscreen,
    toggleSplitScreen,
    sourceSelectorInitialRef,
    handleConversationSourceSelect,
    handleSourceChange,
    createSplitBox,
  };
}
