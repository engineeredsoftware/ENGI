'use client';

import { useEffect, useRef, FC } from 'react';
import { createPortal } from 'react-dom';

interface ParticleEffectProps {
  targetRef: React.RefObject<HTMLElement>;
  particleCount?: number;
  duration?: number;
  delay?: number;
}

const ParticleEffect: FC<ParticleEffectProps> = ({
  targetRef,
  particleCount = 20,
  duration = 1500,
  delay = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!targetRef.current || !containerRef.current) return;

    const timer = setTimeout(() => {
      const targetElement = targetRef.current!;
      const container = containerRef.current!;

      const el = targetElement;
      const root = el.closest('.typing-animation');
      const highlightId = el.getAttribute('data-particle-highlight');
      const spans =
        root && highlightId
          ? Array.from(root.querySelectorAll(`[data-particle-highlight="${highlightId}"]`))
          : [el];
      const rects = spans.map((s) => s.getBoundingClientRect());
      const left = Math.min(...rects.map((r) => r.left));
      const top = Math.min(...rects.map((r) => r.top));
      const right = Math.max(...rects.map((r) => r.right));
      const bottom = Math.max(...rects.map((r) => r.bottom));
      const rect = { left, top, width: right - left, height: bottom - top };

      container.style.position = 'absolute';
      container.style.bottom = 'auto';
      container.style.right = 'auto';
      const verticalShift = 24;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      container.style.top = `${rect.top + scrollTop + verticalShift}px`;
      container.style.left = `${rect.left + scrollLeft}px`;
      container.style.width = `${rect.width}px`;
      container.style.height = `${rect.height}px`;
      container.style.pointerEvents = 'none';
      container.style.overflow = 'visible';

      const createParticle = () => {
        const particle = document.createElement('div');
        particle.className = 'particle-effect-dot';
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height * 0.9 - rect.height * 0.1;
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
        setTimeout(() => {
          if (container.contains(particle)) container.removeChild(particle);
        }, animDuration + animDelay);
      };

      let nextIndex = 0;
      const batchSize = Math.max(1, Math.floor(particleCount / 5));
      const scheduleBatch = () => {
        const end = Math.min(nextIndex + batchSize, particleCount);
        for (let i = nextIndex; i < end; i++) createParticle();
        nextIndex = end;
        if (nextIndex < particleCount) requestAnimationFrame(scheduleBatch);
      };
      scheduleBatch();
    }, delay);

    return () => clearTimeout(timer);
  }, [targetRef, particleCount, duration, delay]);

  return createPortal(
    <div ref={containerRef} className="particle-effect-container absolute pointer-events-none" style={{ zIndex: 9999 }} />,
    document.body,
  );
};

export default ParticleEffect;
 
