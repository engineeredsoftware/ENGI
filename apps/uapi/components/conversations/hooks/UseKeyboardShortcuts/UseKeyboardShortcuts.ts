/**
 * Keyboard shortcuts hook for Conversation component
 * 
 * Handles:
 * - Escape key: blur input on first press, close Conversation on second press
 * - Cmd/Ctrl + Arrow Up/Down: navigate between user messages
 * - F11: toggle fullscreen
 * - Cmd/Ctrl + /: toggle split screen
 */

import { useEffect, useRef } from 'react';

interface UseKeyboardShortcutsProps {
  isOpen: boolean;
  isFullscreen: boolean;
  inSidebar: boolean;
  onToggle?: () => void;
  onToggleFullscreen: () => void;
  onToggleSplitScreen: () => void;
}

export function useKeyboardShortcuts({
  isOpen,
  isFullscreen,
  inSidebar,
  onToggle,
  onToggleFullscreen,
  onToggleSplitScreen
}: UseKeyboardShortcutsProps) {
  const lastEscTimeRef = useRef<number>(0);
  const userJumpIndexRef = useRef<number>(-1);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Close on double-Esc or blur on first
      if (e.key === 'Escape') {
        const active = document.activeElement as HTMLElement | null;
        if (active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT')) {
          (active as HTMLElement).blur();
          e.stopPropagation();
          e.preventDefault();
          // mark first escape
          lastEscTimeRef.current = Date.now();
          return;
        }

        // If within 800 ms of last blur escape or general window, close Conversations
        if (isOpen && Date.now() - lastEscTimeRef.current < 800) {
          if (inSidebar && onToggle) {
            onToggle();
          } else if (!inSidebar) {
            onToggle?.();
          }
        }
        return;
      }

      // Cmd/Ctrl + Arrow Up/Down for user bubble navigation
      if ((e.metaKey || e.ctrlKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        const container = document.getElementById('message-waterfall-container');
        if (!container) return;
        
        // Collect user bubbles – element order in DOM is new→old because flex-col-reverse
        const bubbles = Array.from(container.querySelectorAll('[data-msg-type="user"]')) as HTMLElement[];
        if (bubbles.length === 0) return;

        // Determine next index
        if (e.key === 'ArrowUp') {
          userJumpIndexRef.current = Math.min(userJumpIndexRef.current + 1, bubbles.length - 1);
        } else {
          userJumpIndexRef.current = Math.max(userJumpIndexRef.current - 1, -1);
        }

        if (userJumpIndexRef.current === -1) {
          // Jump back to bottom (newest)
          container.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        const target = bubbles[userJumpIndexRef.current];
        if (target) {
          // Scroll so that target roughly centres
          const containerRect = container.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const relativeTop = targetRect.top - containerRect.top + container.scrollTop;
          const centerOffset = relativeTop - containerRect.height / 2 + targetRect.height / 2;
          container.scrollTo({ top: centerOffset, behavior: 'smooth' });
        }

        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, inSidebar, onToggle]);

  // Fullscreen and split screen shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F11 - Toggle fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        onToggleFullscreen();
      }
      
      // Cmd/Ctrl + / - Toggle split screen (only in fullscreen)
      if (isFullscreen && (e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        onToggleSplitScreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onToggleFullscreen, onToggleSplitScreen]);
}