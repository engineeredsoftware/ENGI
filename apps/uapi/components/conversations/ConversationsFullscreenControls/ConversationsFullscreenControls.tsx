"use client";

import React from "react";
import {
  PlusIcon,
  MixerHorizontalIcon,
  ChatBubbleIcon,
  ExitFullScreenIcon,
} from "@radix-ui/react-icons";

interface FullscreenControlsProps {
  /** create a new empty conversation */
  onNewChat: () => void;
  /** add a split pane or toggle split mode */
  onSplit: () => void;
  /** embed or detach process logs */
  onToggleLogs: () => void;
  /** disable logs toggle */
  logsToggleDisabled?: boolean;
  /** toggle fullscreen ↔ small mode */
  onToggleSize: () => void;
  /** exit fullscreen entirely */
  onExit: () => void;

  /** state flags so controls can reflect active statuses */
  splitActive?: boolean;
  logsEmbedded?: boolean;
}

/**
 * Top-bar control cluster for Conversations fullscreen mode.
 * Pure presentational component – no internal state.
 */
export function FullscreenControls({
  onNewChat,
  onSplit,
  onToggleLogs,
  onToggleSize,
  onExit,
  splitActive,
  logsEmbedded,
  logsToggleDisabled,
}: FullscreenControlsProps) {
  const btn =
    "fullscreen-button inline-flex items-center gap-1 px-2 py-1 rounded text-sm hover:bg-emerald-500/10";

  return (
    <div className="flex items-center gap-2">
      {/* New chat */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNewChat();
        }}
        className={btn}
        title="New Conversation"
      >
        <PlusIcon />
        <span className="button-text">New</span>
      </button>

      {/* Split */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSplit();
        }}
        className={`${btn} ${splitActive ? "active" : ""}`}
        aria-label="Add split pane"
        title="Add Split (Ctrl+Shift+S)"
      >
        <MixerHorizontalIcon />
        <span className="button-text">Split</span>
      </button>

      {/* Logs embed */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleLogs();
        }}
        className={`${btn} ${logsEmbedded ? "active" : ""}`}
        aria-label="Toggle pipeline log location"
        title={logsEmbedded ? "Show Logs in Sidebar" : "Embed Logs"}
        disabled={logsToggleDisabled}
      >
        <ChatBubbleIcon />
        <span className="button-text">Logs</span>
      </button>

      {/* Size toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSize();
        }}
        className={btn}
        aria-label="Toggle size mode"
        title="Toggle Size (Ctrl+Shift+O)"
      >
        <ExitFullScreenIcon />
        <span className="button-text">Small</span>
      </button>

      {/* Exit */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExit();
        }}
        className={btn}
        aria-label="Exit fullscreen"
        title="Exit"
      >
        ✕
        <span className="button-text">Exit</span>
      </button>
    </div>
  );
}
