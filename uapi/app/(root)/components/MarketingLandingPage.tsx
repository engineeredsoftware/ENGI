'use client';

import React, { useEffect, useRef } from 'react';
import Footer from '@/components/bitcode/layout/footer';

import { MarketingLandingHero } from './landing/MarketingLandingHero';
import { MarketingLandingTerminalPreview } from './landing/MarketingLandingTerminalPreview';
import { MarketingLandingTestnetSection } from './landing/MarketingLandingTestnetSection';
import '../../../styles/marketing-landing-shell.css';
import '../../../styles/marketing-landing-glow.css';
import '../../../styles/particle-effect.css';

type Particle = {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: number;
  dx: number;
  dy: number;
  duration: number;
};

const BACKGROUND_PARTICLES: readonly Particle[] = Array.from({ length: 14 }, (_, index) => ({
  id: index,
  x: (index * 17.5 + 11) % 100,
  y: (index * 23.25 + 7) % 100,
  delay: (index * 0.37) % 5,
  size: 2 + (index % 4),
  dx: (((index * 5) % 9) - 4) * 10,
  dy: (((index * 7) % 9) - 4) * 9,
  duration: 7 + (index % 5),
}));

export default function MarketingLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    if (!window.matchMedia('(pointer: fine)').matches) {
      container.style.setProperty('--mouse-x', '50%');
      container.style.setProperty('--mouse-y', '50%');
      return;
    }

    let frameId: number | null = null;
    let nextX = 50;
    let nextY = 50;

    const commitMousePosition = () => {
      frameId = null;
      container.style.setProperty('--mouse-x', `${nextX}%`);
      container.style.setProperty('--mouse-y', `${nextY}%`);
    };

    const scheduleCommit = () => {
      if (frameId !== null) {
        return;
      }
      frameId = window.requestAnimationFrame(commitMousePosition);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const stageHeight = container.offsetHeight || container.scrollHeight || rect.height;
      nextX = ((event.clientX - rect.left) / rect.width) * 100;
      nextY = ((event.clientY - rect.top) / stageHeight) * 100;
      scheduleCommit();
    };

    const resetMousePosition = () => {
      nextX = 50;
      nextY = 50;
      scheduleCommit();
    };

    container.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerleave', resetMousePosition);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', resetMousePosition);
    };
  }, []);
  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute', top: '-9999px' }}>
        <defs>
          <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feFlood floodColor="#67feb7" floodOpacity="0.8" result="glowColor" />
            <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow" />
            <feMerge>
              <feMergeNode in="softGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div
        ref={containerRef}
        className="marketing-landing-shell relative flex w-full flex-col bg-[#030816] text-white"
        style={{
          minHeight: '100svh',
          '--mouse-x': '50%',
          '--mouse-y': '50%',
        } as React.CSSProperties}
      >
        <div className="relative flex min-h-[100svh] w-full flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(103,254,183,0.14),transparent_34%),linear-gradient(180deg,#07131d_0%,#030816_45%,#02060d_100%)]" />
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(103,254,183,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(103,254,183,0.09)_1px,transparent_1px)] [background-size:160px_160px]" />

          <div
            data-testid="landing-orbital-ambience"
            className="orbital-system absolute inset-0 hidden opacity-60 motion-reduce:hidden laptop:block"
            style={{ contain: 'paint' }}
          >
            <div
              className="orbital-ring"
              style={{ '--size': '86%', '--delay': '0s', '--rotation': '' } as React.CSSProperties}
            />
            <div
              className="orbital-ring"
              style={{ '--size': '64%', '--delay': '2.2s', '--rotation': '' } as React.CSSProperties}
            />
            <div
              className="orbital-ring"
              style={{ '--size': '40%', '--delay': '4.4s', '--rotation': '' } as React.CSSProperties}
            />
          </div>

          {BACKGROUND_PARTICLES.map((particle) => (
            <div
              key={particle.id}
              className="quantum-particle absolute hidden rounded-full bg-[#67feb7] motion-reduce:hidden tablet:block"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                boxShadow: `0 0 ${particle.size * 3}px rgba(103, 254, 183, 0.55)`,
                '--particle-dx': `${particle.dx}px`,
                '--particle-dy': `${particle.dy}px`,
                '--particle-duration': `${particle.duration}s`,
                '--particle-delay': `${particle.delay}s`,
              } as React.CSSProperties}
            />
          ))}

          <div
            data-testid="landing-pointer-glow"
            className="pointer-events-none absolute inset-0 hidden transition-opacity duration-300 motion-reduce:hidden laptop:block"
            style={{
              background:
                'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(103, 254, 183, 0.16) 0%, rgba(103, 254, 183, 0.08) 16%, transparent 44%)',
              willChange: 'background',
              contain: 'paint',
            }}
          />
          <div
            data-testid="landing-ambient-glow"
            className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/10 blur-3xl motion-reduce:hidden laptop:block"
          />

          <main className="relative z-20 mx-auto flex w-full max-w-[1380px] flex-1 items-start px-4 pb-4 pt-28 phone:px-5 phone:pb-5 tablet:px-6 laptop:items-center laptop:px-8 laptop:pb-4 laptop:pt-32 desktop:px-12">
            <div className="grid w-full gap-4 laptop:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] tablet:gap-5 laptop:gap-6">
              <MarketingLandingHero />
              <MarketingLandingTerminalPreview />
            </div>
          </main>

          <MarketingLandingTestnetSection />

          <div className="relative z-20 mt-auto w-full">
            <Footer showPrimaryContent={false} className="mt-0 border-white/10 bg-[#02060d]/72 backdrop-blur-xl" />
          </div>

        </div>
      </div>
    </>
  );
}
