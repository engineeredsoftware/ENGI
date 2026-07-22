'use client';

import React, { useEffect, useRef, FC } from 'react';
import { createPortal } from 'react-dom';

interface ParticleEffectProps {
  targetRef: React.RefObject<HTMLElement | null>;
  particleCount?: number;
  duration?: number;
  delay?: number;
  /**
   * Re-fire the same burst on a loop (typing highlight re-trigger).
   * Interval is measured from each burst start.
   */
  loop?: boolean;
  /** ms between burst starts when `loop` is true. Default: duration + 400. */
  loopInterval?: number;
}

const ParticleEffect: FC<ParticleEffectProps> = ({
  targetRef,
  particleCount = 20,
  duration = 1500,
  delay = 0,
  loop = false,
  loopInterval,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalMs = loopInterval ?? duration + 400;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!targetRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const timers: number[] = [];
    let rafId = 0;
    let intervalId = 0;
    let cancelled = false;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    /**
     * Viewport-fixed box matching the highlight glyph bounds.
     * `fixed` avoids scroll-offset drift; no vertical shift so the cloud
     * is centered on the text rather than sitting below it.
     */
    const positionContainer = () => {
      const targetElement = targetRef.current;
      if (!targetElement) return null;

      const el = targetElement;
      const root = el.closest('.typing-animation');
      const highlightId = el.getAttribute('data-particle-highlight');
      const spans =
        root && highlightId
          ? Array.from(root.querySelectorAll(`[data-particle-highlight="${highlightId}"]`))
          : [el];
      const rects = spans.map((s) => s.getBoundingClientRect());
      if (!rects.length) return null;

      const left = Math.min(...rects.map((r) => r.left));
      const top = Math.min(...rects.map((r) => r.top));
      const right = Math.max(...rects.map((r) => r.right));
      const bottom = Math.max(...rects.map((r) => r.bottom));
      const width = right - left;
      const height = bottom - top;
      if (width <= 0 || height <= 0) return null;

      container.style.position = 'fixed';
      container.style.bottom = 'auto';
      container.style.right = 'auto';
      container.style.top = `${top}px`;
      container.style.left = `${left}px`;
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
      container.style.pointerEvents = 'none';
      container.style.overflow = 'visible';
      container.style.margin = '0';
      container.style.padding = '0';
      container.style.transform = 'none';

      return { left, top, width, height };
    };

    const fireBurst = () => {
      if (cancelled) return;
      const rect = positionContainer();
      if (!rect) return;

      const createParticle = () => {
        if (cancelled) return;
        const particle = document.createElement('div');
        particle.className = 'particle-effect-dot';
        // Spawn across the full glyph box (aligned with the text).
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        const directionX = Math.random() * 2 - 1;
        const directionY = Math.random() * 2 - 1.2;
        particle.style.setProperty('--x', directionX.toString());
        particle.style.setProperty('--y', directionY.toString());
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        const size = Math.random() * 3 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        const animDuration = (Math.random() * 0.5 + 0.75) * duration;
        particle.style.animationDuration = `${animDuration}ms`;
        const animDelay = Math.random() * 10;
        particle.style.animationDelay = `${animDelay}ms`;
        container.appendChild(particle);
        const removeId = window.setTimeout(() => {
          if (container.contains(particle)) container.removeChild(particle);
        }, animDuration + animDelay);
        timers.push(removeId);
      };

      let nextIndex = 0;
      const batchSize = Math.max(1, Math.floor(particleCount / 5));
      const scheduleBatch = () => {
        if (cancelled) return;
        const end = Math.min(nextIndex + batchSize, particleCount);
        for (let i = nextIndex; i < end; i++) createParticle();
        nextIndex = end;
        if (nextIndex < particleCount) {
          rafId = requestAnimationFrame(scheduleBatch);
        }
      };
      scheduleBatch();
    };

    const startId = window.setTimeout(() => {
      fireBurst();
      if (loop) {
        intervalId = window.setInterval(fireBurst, intervalMs);
      }
    }, delay);
    timers.push(startId);

    // Keep the spawn box locked to the text if layout/scroll shifts mid-loop.
    const onRelayout = () => {
      if (!cancelled) positionContainer();
    };
    window.addEventListener('scroll', onRelayout, { passive: true });
    window.addEventListener('resize', onRelayout);

    return () => {
      cancelled = true;
      timers.forEach((id) => clearTimeout(id));
      if (intervalId) clearInterval(intervalId);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onRelayout);
      window.removeEventListener('resize', onRelayout);
      while (container.firstChild) container.removeChild(container.firstChild);
    };
  }, [targetRef, particleCount, duration, delay, loop, intervalMs]);

  if (typeof document === 'undefined') return null;

  // Body portal so particles are not clipped by overflow parents. z-index lives
  // in particle-effect.css (20) — below Auxillaries (10000). Do not kill/hide
  // animations when Auxillaries opens; opaque overlay floor covers them.
  return createPortal(
    <div
      ref={containerRef}
      className="particle-effect-container pointer-events-none"
      style={{ overflow: 'visible' }}
    />,
    document.body,
  );
};

export default ParticleEffect;
