"use client";

import React, { useEffect, useRef, useState } from 'react';
import MultiLineTypingAnimation from '@/components/bitcode/multi-line-typing-animation';
import '@/styles/smooth-typing.css';
import { cn } from '@bitcode/styling';

type ExecType = 'agentic-execution:asset-pack';

interface ExecutionHeaderTitleProps {
  type: ExecType;
  className?: string;
  /** Optional custom title; sensible default provided */
  shippablesTitle?: string;
  /** Typing speed in ms per char */
  charDelay?: number;
}

export default function ExecutionHeaderTitle({
  type,
  className,
  shippablesTitle = 'What would you like engineered today?',
  charDelay = 38,
}: ExecutionHeaderTitleProps) {
  const targetText = shippablesTitle;
  const [currentText, setCurrentText] = useState<string>(targetText);
  const [phase, setPhase] = useState<'idle' | 'deleting' | 'typing'>('typing');
  const [key, setKey] = useState<number>(0);
  const deleteTimer = useRef<number | null>(null);

  useEffect(() => {
    if (currentText === targetText) return;
    setPhase('deleting');
    const startLen = currentText.length;
    const deletionStep = () => {
      setCurrentText(prev => {
        if (prev.length <= 0) {
          setPhase('typing');
          setKey((k) => k + 1);
          if (deleteTimer.current) window.clearTimeout(deleteTimer.current);
          deleteTimer.current = null;
          return '';
        }
        return prev.slice(0, -1);
      });
      const elLen = (document?.querySelector('.typing-animation')?.textContent || '').length;
      const remaining = Math.max(0, startLen - Math.max(0, elLen - 1));
      const speed = Math.max(10, charDelay * 0.65 + Math.random() * 10 + (remaining < 6 ? 35 : 0));
      deleteTimer.current = window.setTimeout(deletionStep, speed);
    };
    if (deleteTimer.current) window.clearTimeout(deleteTimer.current);
    deleteTimer.current = window.setTimeout(deletionStep, Math.max(10, charDelay * 0.5));
    return () => {
      if (deleteTimer.current) window.clearTimeout(deleteTimer.current);
      deleteTimer.current = null;
    };
  }, [targetText, currentText, charDelay]);

  return (
    <div className={cn('w-full', className)}>
      {phase === 'deleting' && (
        <div className="typing-animation inline-flex items-center text-balance">
          <span>{currentText}</span>
          <span className="typing-cursor" aria-hidden="true" />
        </div>
      )}
      {phase !== 'deleting' && (
        <MultiLineTypingAnimation
          key={key}
          text={targetText}
          charDelay={charDelay}
          startDelay={80}
          showCursor={true}
          className="text-balance"
        />
      )}
    </div>
  );
}
