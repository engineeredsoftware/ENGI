"use client";

import React, { useEffect, useRef } from 'react';
import '@/styles/processing-indicator.css';

export function ProcessingIndicator({
  label = 'Processing',
  stalled = false,
}: {
  label?: string;
  /** True once elapsed time since the last event suggests a genuine hang (vs. a slow but live call) — swaps the label to an amber warning tone. */
  stalled?: boolean;
}) {
  const orbRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => { animationFrameId = requestAnimationFrame(animate); };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const intelligentLabel = label;

  return (
    <div className="flex items-center space-x-4 py-3.5 pl-6 group/indicator relative max-w-fit">
      <div className="relative mr-2">
        <div className="relative w-2 h-2">
          <div ref={orbRef} className="processing-orb-core gpu-accelerate will-animate" />
          {[0, 1, 2].map((i) => (<div key={i} className={`orbital-processing-ring orbital-processing-ring-${i} gpu-accelerate will-animate`} />))}
          {[...Array(6)].map((_, i) => (<div key={i} className={`quantum-dot-small processing-particle processing-particle-${i} gpu-accelerate will-animate`} />))}
        </div>
      </div>
      <div className="relative">
        <div
          ref={textRef}
          className={`processing-text text-neon ${stalled ? 'text-amber-400' : 'text-brand-emerald'}`}
        >
          {intelligentLabel}
        </div>
        <div className="processing-underline w-full" />
      </div>
    </div>
  );
}

