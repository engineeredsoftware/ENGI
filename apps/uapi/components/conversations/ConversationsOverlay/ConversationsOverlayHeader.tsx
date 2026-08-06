'use client';

/**
 * Conversations overlay header toolbar (history, fullscreen, panels, branch, close).
 */

import React from 'react';
import {
  ReloadIcon,
  EnterFullScreenIcon,
  Cross2Icon,
  ExitFullScreenIcon,
  MixerHorizontalIcon,
  FileTextIcon,
  ChatBubbleIcon,
  MagnifyingGlassIcon,
  Share1Icon,
  LockClosedIcon,
  CodeIcon,
} from '@radix-ui/react-icons';
import SidebarTitleBar from '@/components/bitcode/layout/sidebars/SidebarTitleBar/SidebarTitleBar';
import { BranchMenuButton } from '@/components/conversations/ConversationsBranchMenuButton/ConversationsBranchMenuButton';
import { ENABLE_SPLIT_VIEW } from './conversations-overlay-constants';

export interface ConversationsOverlayHeaderProps {
  title: string;
  isFullscreen: boolean;
  showHistory: boolean;
  showWritingWorkspace: boolean;
  showSourceSelector: boolean;
  showProductHandoff: boolean;
  showPersistencePrivacy: boolean;
  showTelemetryProof: boolean;
  showRehearsalProof: boolean;
  onToggleHistory: () => void;
  onToggleFullscreen: () => void;
  onToggleSplitScreen: () => void;
  onToggleWritingWorkspace: () => void;
  onToggleSourceSelector: () => void;
  onToggleProductHandoff: () => void;
  onTogglePersistencePrivacy: () => void;
  onToggleTelemetryProof: () => void;
  onToggleRehearsalProof: () => void;
  onBranched: (conversation: { id: string; title?: string }) => void;
  onClose: () => void;
}

export function ConversationsOverlayHeader({
  title,
  isFullscreen,
  showHistory,
  showWritingWorkspace,
  showSourceSelector,
  showProductHandoff,
  showPersistencePrivacy,
  showTelemetryProof,
  showRehearsalProof,
  onToggleHistory,
  onToggleFullscreen,
  onToggleSplitScreen,
  onToggleWritingWorkspace,
  onToggleSourceSelector,
  onToggleProductHandoff,
  onTogglePersistencePrivacy,
  onToggleTelemetryProof,
  onToggleRehearsalProof,
  onBranched,
  onClose,
}: ConversationsOverlayHeaderProps) {
  return (
    <div className="conversations-header">
      <SidebarTitleBar>
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 truncate font-medium">{title}</div>
          <button
            className="fullscreen-button"
            title="Chat History"
            onClick={onToggleHistory}
            aria-pressed={showHistory}
          >
            <ChatBubbleIcon />
          </button>
          <button
            className="fullscreen-button"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
          </button>
          <button
            className="fullscreen-button"
            title="Toggle Split View"
            onClick={onToggleSplitScreen}
            disabled={!ENABLE_SPLIT_VIEW}
          >
            <MixerHorizontalIcon />
          </button>
          <button
            className="fullscreen-button"
            title={showWritingWorkspace ? 'Hide Writing Workspace' : 'Open Writing Workspace'}
            aria-pressed={showWritingWorkspace}
            onClick={onToggleWritingWorkspace}
          >
            <FileTextIcon />
          </button>
          <button
            className="fullscreen-button"
            title={showSourceSelector ? 'Hide Source Selector' : 'Open Source Selector'}
            aria-pressed={showSourceSelector}
            onClick={onToggleSourceSelector}
          >
            <MagnifyingGlassIcon />
          </button>
          <button
            className="fullscreen-button"
            title={showProductHandoff ? 'Hide product Handoff' : 'Open product Handoff'}
            aria-pressed={showProductHandoff}
            onClick={onToggleProductHandoff}
          >
            <Share1Icon />
          </button>
          <button
            className="fullscreen-button"
            title={
              showPersistencePrivacy
                ? 'Hide Persistence Privacy'
                : 'Open Persistence Privacy'
            }
            aria-pressed={showPersistencePrivacy}
            onClick={onTogglePersistencePrivacy}
          >
            <LockClosedIcon />
          </button>
          <button
            className="fullscreen-button"
            title={showTelemetryProof ? 'Hide Telemetry Proof' : 'Open Telemetry Proof'}
            aria-pressed={showTelemetryProof}
            onClick={onToggleTelemetryProof}
          >
            <CodeIcon />
          </button>
          <button
            className="fullscreen-button"
            title={showRehearsalProof ? 'Hide Rehearsal Proof' : 'Open Rehearsal Proof'}
            aria-pressed={showRehearsalProof}
            onClick={onToggleRehearsalProof}
          >
            <ReloadIcon />
          </button>
          <BranchMenuButton onBranched={onBranched} />
          <button className="fullscreen-button" title="Close" onClick={onClose}>
            <Cross2Icon />
          </button>
        </div>
      </SidebarTitleBar>
    </div>
  );
}
