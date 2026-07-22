'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Footer from '@/components/bitcode/layout/Footer/Footer';

import { MarketingLandingAudienceSection } from '@/components/marketing/MarketingLandingAudienceSection/MarketingLandingAudienceSection';
import { MarketingLandingGuideCard } from '@/components/marketing/MarketingLandingGuideCard/MarketingLandingGuideCard';
import { MarketingLandingHero } from '@/components/marketing/MarketingLandingHero/MarketingLandingHero';
import { MarketingLandingProductPreview } from '@/components/marketing/MarketingLandingProductPreview/MarketingLandingProductPreview';
import { MarketingLandingScrollCue } from '@/components/marketing/MarketingLandingScrollCue/MarketingLandingScrollCue';
import { MarketingLandingTestnetSection } from '@/components/marketing/MarketingLandingTestnetSection/MarketingLandingTestnetSection';
import { MarketingLandingValueFlow } from '@/components/marketing/MarketingLandingValueFlow/MarketingLandingValueFlow';
import '@/styles/marketing-landing-shell.css';
import '@/styles/marketing-landing-glow.css';
import '@/styles/particle-effect.css';

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
  /** Hero column height — scroll cue sits at this Y, but full-width centered (X). */
  const heroColumnRef = useRef<HTMLDivElement>(null);
  const [scrollCueTop, setScrollCueTop] = useState(0);

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

  useLayoutEffect(() => {
    const el = heroColumnRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const sync = () => setScrollCueTop(el.offsetHeight);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
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

          {/*
            Three-band layout:
            1) Opening — hero (through CTAs) | Source Measurements + Exchanging Knowledge.
               items-end so the upper depot bottom meets Sell Source / Buy DataPacks / View Exchange.
            2) Audience — Stop buying… | If you have code…
            3) Production — Protocol + micro-blog | lower four depot panels.
            gap-4/5/6 matches column gutters so y-gaps equal x-gaps.
          */}
          <main className="relative z-20 mx-auto flex w-full max-w-7xl flex-1 flex-col items-stretch gap-4 px-4 pb-8 pt-28 phone:pb-10 tablet:gap-5 tablet:px-6 laptop:gap-6 laptop:px-8 laptop:pb-10 laptop:pt-32 desktop:px-12 wide:px-16">
            {/*
              items-end: depot can be taller than hero.
              Scroll cue Y = hero bottom (CTA void, on-screen); X = full band center.
            */}
            <div className="relative w-full">
              <div className="grid w-full items-end gap-4 laptop:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] tablet:gap-5 laptop:gap-6">
                <div ref={heroColumnRef} className="w-full min-w-0">
                  <MarketingLandingHero />
                </div>
                <MarketingLandingProductPreview variant="upper" />
              </div>
              <div
                className="pointer-events-none absolute inset-x-0 z-[1] flex justify-center"
                style={{ top: scrollCueTop > 0 ? scrollCueTop : undefined }}
              >
                <MarketingLandingScrollCue targetId="landing-audience" />
              </div>
            </div>

            <MarketingLandingAudienceSection />

            <div
              data-testid="landing-production-band"
              className="grid w-full items-stretch gap-4 laptop:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] tablet:gap-5 laptop:gap-6"
            >
              {/*
                min-h-0 on both columns: band height follows the lower depot;
                value-flow only consumes leftover under protocol + micro-blog.
              */}
              <div className="flex h-full min-h-0 flex-col gap-4 tablet:gap-5 laptop:gap-6">
                <div className="shrink-0">
                  <MarketingLandingTestnetSection />
                </div>
                <div className="shrink-0">
                  <MarketingLandingValueFlow />
                </div>
                {/*
                  Page-standard y-gap (gap-4/5/6) to the micro-blog *tab tops*:
                  tabs use -translate-y-1/2, so add half tab height (~12px) on top of
                  the column gap so the visual gap matches sections above.
                */}
                <div className="shrink-0 pt-3">
                  <MarketingLandingGuideCard />
                </div>
              </div>
              <div className="h-full min-h-0">
                <MarketingLandingProductPreview variant="lower" />
              </div>
            </div>
          </main>

          <div className="relative z-20 mt-auto w-full">
            <Footer showPrimaryContent={false} className="mt-0 border-white/10 bg-[#02060d]/72 backdrop-blur-xl" />
          </div>

        </div>
      </div>
    </>
  );
}
