'use client';

import { useEffect, useState, useRef, FC } from 'react';
import { cn } from '@bitcode/styling';
import ParticleEffect from './particle-effect';
import '@/styles/highlight-transition.css';
import '@/styles/shiny-text.css';
import '@/styles/smooth-typing.css';

interface TypingAnimationProps {
  text: string;
  duration?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
  loop?: boolean;
  showCursor?: boolean;
  highlightText?: string;
  highlightClass?: string;
  disableParticleEffect?: boolean;
  initialHighlightVisible?: boolean;
}

const TypingAnimation: FC<TypingAnimationProps> = ({
  text,
  duration = 40,
  delay = 0,
  className = '',
  onComplete,
  loop = false,
  showCursor = true,
  highlightText = '',
  highlightClass = '',
  disableParticleEffect = false,
  initialHighlightVisible = false,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [highlightVisible, setHighlightVisible] = useState(initialHighlightVisible);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const revealingHighlightRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let animationStarted = false;
    const timeoutIds: number[] = [];

    const schedule = (callback: () => void, timeout: number) => {
      const id = window.setTimeout(callback, timeout);
      timeoutIds.push(id);
    };

    const startTyping = () => {
      if (animationStarted) return;
      animationStarted = true;
      setDisplayedText('');
      setIsComplete(false);
      setHighlightVisible(initialHighlightVisible);
      revealingHighlightRef.current = false;
      let currentIndex = 0;
      const typeNextChar = () => {
        if (!isMounted) return;
        if (currentIndex < text.length) {
          currentIndex++;
          const newDisplayedText = text.substring(0, currentIndex);
          setDisplayedText(newDisplayedText);
          if (
            highlightText &&
            !revealingHighlightRef.current &&
            newDisplayedText.includes(highlightText) &&
            newDisplayedText.indexOf(highlightText) + highlightText.length === currentIndex
          ) {
            revealingHighlightRef.current = true;
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (isMounted) setHighlightVisible(true);
              });
            });
          }
          const currentChar = text[currentIndex - 1];
          let nextDelay =
            currentChar === '.' ? duration * 6 :
            currentChar === ',' ? duration * 4 :
            currentChar === ' ' ? duration * 1.5 :
            duration;
          if (highlightText) {
            const highlightStart = text.indexOf(highlightText);
            if (highlightStart !== -1) {
              const highlightEnd = highlightStart + highlightText.length;
              const inHighlight = currentIndex - 1 >= highlightStart && currentIndex - 1 < highlightEnd;
              nextDelay *= inHighlight ? 1.3 : 0.85;
            }
          }
          if (currentIndex / text.length > 0.85) nextDelay *= 1.15;
          const jitter = 0.9 + Math.random() * 0.2;
          nextDelay *= jitter;
          schedule(typeNextChar, nextDelay);
        } else {
          setIsComplete(true);
          if (onComplete && isMounted) onComplete();
          if (loop && isMounted) {
            animationStarted = false;
            schedule(startTyping, Math.max(duration * 8, 400));
          }
        }
      };
      if (delay > 0) schedule(typeNextChar, delay);
      else typeNextChar();
    };
    startTyping();
    return () => {
      isMounted = false;
      timeoutIds.forEach((id) => window.clearTimeout(id));
    };
  }, [delay, duration, highlightText, initialHighlightVisible, loop, onComplete, text]);

  const renderText = () => {
    const renderPlain = (txt: string) =>
      txt.split('\n').map((chunk, i, arr) => (
        <span key={i}>
          {chunk}
          {i < arr.length - 1 && <br />}
        </span>
      ));
    if (!highlightText || !displayedText.includes(highlightText)) return renderPlain(displayedText);
    const parts = displayedText.split(highlightText);
    const beforeText = parts[0];
    const afterText = parts.length > 1 ? parts.slice(1).join(highlightText) : '';
    return (
      <>
        {renderPlain(beforeText)}
        <span
          ref={highlightRef}
          className={`${highlightClass} ${highlightVisible ? 'visible' : 'invisible'}`}
          style={{ display: 'inline', animation: highlightVisible ? undefined : 'none', opacity: highlightVisible ? 1 : 0, transition: 'none' }}
        >
          {highlightText}
        </span>
        {renderPlain(afterText)}
      </>
    );
  };

  return (
    <span
      ref={containerRef}
      className={cn('typing-animation inline-block relative', className)}
      style={{ verticalAlign: 'middle', textAlign: 'left', width: 'max-content', maxWidth: '100%' }}
    >
      <span className="opacity-0 whitespace-pre-wrap block pointer-events-none select-none text-left" aria-hidden="true">
        {text}
      </span>
      <span className="absolute inset-0 whitespace-pre-wrap text-left">
        {renderText()}
        <span className={`typing-cursor ${isComplete && !showCursor ? 'typing-cursor-hidden' : ''}`} aria-hidden="true" style={{ minHeight: '1.2em', display: 'inline-block' }} />
      </span>
      {!disableParticleEffect && highlightVisible && highlightRef.current && (
        <ParticleEffect targetRef={highlightRef} particleCount={70} delay={0} duration={2500} />
      )}
    </span>
  );
};

export default TypingAnimation;
 
