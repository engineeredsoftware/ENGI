'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface FullscreenPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onExited?: () => void;
  children: React.ReactNode;
}

export default function FullscreenPortal({ isOpen, onClose, onExited, children }: FullscreenPortalProps) {
  const [mounted, setMounted] = useState(false);
  const portalClass = 'conversations-fullscreen';

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle escape key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling while fullscreen is mounted.
  // Restore the original body styles immediately when the close action is
  // triggered instead of waiting for the exit animation to finish. This
  // eliminates a subtle one-frame “flash” that occurred right after the exit
  // completed when the scrollbar re-appeared.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('conversations-fullscreen-active');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('conversations-fullscreen-active');
    }
  }, [isOpen]);

  // Ensure cleanup of body styles on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('conversations-fullscreen-active');
    };
  }, []);

  // Only render the portal on the client side
  if (!mounted) return null;

  // Handle body cleanup after exit animation completes
  const handleExitComplete = () => {
    document.body.style.overflow = '';
    document.body.classList.remove('conversations-fullscreen-active');
    onExited?.();
  };

  return createPortal(
    <AnimatePresence onExitComplete={handleExitComplete} mode="wait">
      {isOpen && (
        <motion.div
          key="conversations-fullscreen"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{
            opacity: { duration: 0.25, ease: 'easeInOut' },
            scale: { duration: 0.25, ease: 'easeInOut' }
          }}
          className={portalClass}
          style={{ zIndex: 9990 }}
        >
          <div className="quantum-background"></div>
          <div className="grid-background"></div>
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
