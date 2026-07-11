'use client';

import TypingAnimation from '@/components/bitcode/TypingAnimation/TypingAnimation';
import React, { useEffect, useRef, memo } from 'react';

interface ProcessingIndicatorProps {
  /**
   * Optional label that appears before the animated ellipsis.
   * Defaults to "Processing" for neutral Bitcode run state.
   */
  label?: string;
}

export const ProcessingIndicator = memo(({ label = 'Processing' }: ProcessingIndicatorProps) => {
  const orbRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let startTime: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = (currentTime - startTime) / 1000; // Convert to seconds
      
      // Use CSS custom properties for GPU-optimized animations
      if (orbRef.current) {
        orbRef.current.style.setProperty('--phase', `${elapsed}`);
      }
      if (textRef.current) {
        textRef.current.style.setProperty('--phase', `${elapsed}`);
      }
      if (underlineRef.current) {
        underlineRef.current.style.setProperty('--phase', `${elapsed}`);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="flex items-center space-x-4 py-3.5 pl-6 group/indicator relative max-w-fit">
      {/* Primary orb with CSS-driven animations */}
      <div className="relative mr-2">
        <div className="relative w-2 h-2">
          {/* Core orb - Uses design tokens and CSS animations */}
          <div
            ref={orbRef}
            className="processing-orb-core gpu-accelerate will-animate"
          />

          {/* Orbital rings - Pure CSS animations */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`orbital-processing-ring orbital-processing-ring-${i} gpu-accelerate will-animate`}
            />
          ))}

          {/* Ambient glow particles - Static quantum dots */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`quantum-dot-small processing-particle processing-particle-${i} gpu-accelerate will-animate`}
            />
          ))}
        </div>
      </div>

      {/* Elegant minimal text with design tokens */}
      <div className="relative">
        <div
          ref={textRef}
          className="processing-text text-brand-emerald text-neon"
        >
          {label}
          <TypingAnimation
            loop={true}
            text="..."
            duration={150}
            className="!text-[13px] !font-light !leading-none !tracking-wider !text-left"
          />
        </div>

        {/* Subtle underline animation */}
        <div
          ref={underlineRef}
          className="processing-underline"
        />
      </div>

      {/* Ambient interaction glow - Uses existing design system */}
      <div className="absolute inset-[-1px] opacity-0 group-hover/indicator:opacity-100 transition-all duration-700 rounded-lg pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-emerald/0 via-brand-emerald/5 to-brand-emerald/0 animate-shimmer-button-emerald" />
        <div className="absolute inset-0 bg-gradient-radial from-brand-emerald/5 to-transparent" />
      </div>
    </div>
  );
});
