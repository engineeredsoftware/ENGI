'use client';

/**
 * Subtle scroll-down cue under the hero (CTA void).
 * Absolute, zero layout space; label + chevron only.
 *
 * Enter/exit scroll position is shared with the audience `whileInView` gate
 * (`landingAudienceViewport` / `isLandingAudienceInEnterBand`) so the cue
 * clears at the same moment the panes begin their entrance.
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';
import {
  animatedMotionStyle,
  entranceEase,
  isLandingAudienceInEnterBand,
  LANDING_AUDIENCE_VIEWPORT_MARGIN,
} from '@/components/marketing/MarketingLandingShared/MarketingLandingShared';

type Props = {
  targetId: string;
};

/** After hero (~0.9s) + upper depot (~1.12s). */
const APPEAR_AFTER_MS = 1800;

const EXIT_MS = 0.1;

export const MarketingLandingScrollCue = memo(function MarketingLandingScrollCue({
  targetId,
}: Props) {
  const [phase, setPhase] = useState<'waiting' | 'shown' | 'gone'>('waiting');
  const { label, ariaLabel } = BITCODE_PUBLIC_COPY.scrollCue;
  const visible = phase === 'shown';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let gone = false;
    const markGone = () => {
      if (gone) return;
      gone = true;
      setPhase('gone');
    };

    const getAudience = () => document.getElementById(targetId);

    const tryShow = () => {
      if (gone) return;
      const el = getAudience();
      if (!el) return;
      // Same band as whileInView — if already in it, never show.
      if (isLandingAudienceInEnterBand(el)) {
        markGone();
        return;
      }
      setPhase('shown');
    };

    const onScrollOrResize = () => {
      if (gone) return;
      const el = getAudience();
      if (!el) return;
      if (isLandingAudienceInEnterBand(el)) markGone();
    };

    const appearId = window.setTimeout(tryShow, APPEAR_AFTER_MS);
    const retryId = window.setTimeout(tryShow, APPEAR_AFTER_MS + 500);

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    // Same rootMargin as framer audience whileInView — identical fire moment.
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      const el = getAudience();
      if (el) {
        observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) markGone();
          },
          {
            root: null,
            rootMargin: LANDING_AUDIENCE_VIEWPORT_MARGIN,
            threshold: 0.01,
          },
        );
        observer.observe(el);
      }
    }

    return () => {
      clearTimeout(appearId);
      clearTimeout(retryId);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      observer?.disconnect();
    };
  }, [targetId]);

  const scrollToAudience = useCallback(() => {
    setPhase('gone');
    const target = document.getElementById(targetId);
    if (!target) return;
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    });
  }, [targetId]);

  return (
    <div className="pointer-events-none flex justify-center" aria-hidden={!visible}>
      <motion.button
        type="button"
        data-testid="landing-scroll-cue"
        aria-label={ariaLabel}
        onClick={scrollToAudience}
        tabIndex={visible ? 0 : -1}
        initial={false}
        animate={{
          opacity: visible ? 1 : 0,
          y: visible ? 0 : 4,
          pointerEvents: visible ? 'auto' : 'none',
        }}
        transition={
          visible
            ? { duration: 0.5, ease: entranceEase }
            : { duration: EXIT_MS, ease: 'linear' }
        }
        className="pointer-events-auto group mt-7 inline-flex flex-col items-center gap-1.5 bg-transparent p-0 phone:mt-8"
        style={animatedMotionStyle}
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/55 transition-colors duration-300 group-hover:text-white/80">
          {label}
        </span>
        <span className="relative flex h-4 w-4 items-center justify-center">
          <motion.span
            className="absolute inset-0 rounded-full border border-emerald-300/22 motion-reduce:hidden"
            animate={
              visible ? { scale: [1, 1.55], opacity: [0.4, 0] } : { scale: 1, opacity: 0 }
            }
            transition={
              visible
                ? { duration: 2.1, repeat: Infinity, ease: 'easeOut' }
                : { duration: EXIT_MS, ease: 'linear' }
            }
          />
          <ChevronDownIcon className="relative h-3.5 w-3.5 translate-y-0 text-emerald-200/65 transition-[color,transform] duration-300 ease-out group-hover:translate-y-0.5 group-hover:text-emerald-100/90 motion-reduce:transition-colors motion-reduce:group-hover:translate-y-0" />
        </span>
      </motion.button>
    </div>
  );
});
