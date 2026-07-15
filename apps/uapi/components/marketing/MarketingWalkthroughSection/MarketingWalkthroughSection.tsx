"use client";

/**
 * Interactive marketing walkthrough scenarios with beams and gallery.
 * Scenario data and media-query hook are co-located modules.
 */

import React, { useState, useMemo, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";

// Defer loading of the SVG path/animation logic until the component mounts in the browser.
const AnimatedBeam = dynamic(
  () => import("@/components/bitcode/magicui/AnimatedBeam/AnimatedBeam").then((mod) => mod.AnimatedBeam),
  { ssr: false }
);
import BitcodePill from "@/components/bitcode/branding/BitcodePill/BitcodePill";
import {
  ArrowRightIcon,
  CursorArrowRaysIcon,
  WrenchScrewdriverIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

// Thumbnail stack used for screenshot previews beneath each step card.
const MarketingThumbnailStack = dynamic(() => import("@/components/marketing/MarketingThumbnailStack/MarketingThumbnailStack"));

// Full-screen gallery for viewing screenshots
const MarketingFullScreenGallery = dynamic(() => import("@/components/marketing/MarketingFullScreenGallery/MarketingFullScreenGallery"), { ssr: false });
import './walkthrough-section.module.css';

// Type for screenshot metadata consumed by FullScreenGallery
import type { Screenshot } from '@/components/marketing/MarketingTypes/marketing-types';

// ---------------------------------------------------------------------------
// Static screenshot pools – 3 per step (4 steps ⇒ 12 total)
// ---------------------------------------------------------------------------

import {
  STEP_SCREENSHOTS,
  NEW_SCENARIOS,
  SCENARIOS,
  type Step,
} from './marketing-walkthrough-data';
import { useMediaQuery } from './hooks/use-media-query';

export default function MarketingWalkthroughSection() {
  const [scenario, setScenario] = useState<keyof typeof NEW_SCENARIOS>("killBug");

  const steps = useMemo(() => {
    const raw: Step[] = NEW_SCENARIOS[scenario].steps;
    return raw.map((s, idx) => ({ id: idx + 1, ...s }));
  }, [scenario]);

  // ---------------------------------------------------------------
  // Pre-compute thumbnail src arrays once so <MarketingThumbnailStack/> isn’t
  // forced to re-render just because a parent render produced a new
  // `Array.map` reference (even though the underlying src values are
  // identical).  This keeps React.memo effective and removes ~3× render
  // churn when switching scenarios.
  // ---------------------------------------------------------------

  const thumbnailSrcMemo = useMemo(() => {
    return {
      1: STEP_SCREENSHOTS[1].map((s) => s.src),
      2: STEP_SCREENSHOTS[2].map((s) => s.src),
      3: STEP_SCREENSHOTS[3].map((s) => s.src),
      4: STEP_SCREENSHOTS[4].map((s) => s.src),
    } as const;
  }, []);

  // root ref & icon refs for animated beams (desktop only)
  const containerRef = useRef<HTMLElement>(null);

  // Observe when the section is (partially) visible so we can pause expensive
  // animations as soon as it scrolls off-screen.
  const isSectionVisible = useInView(containerRef, {
    margin: "0px 0px -25% 0px",
    once: false,
  });

  // Respect user OS-level “prefers-reduced-motion” setting so we can avoid
  // spawning long-running animations for users who don’t want them (and also
  // save a few main-thread cycles when possible).
  const prefersReducedMotion = useReducedMotion();

  // -------------------------------------------------------------------------
  // Beam reset handling – unmount beams briefly on scenario switch so the
  // user doesn’t see them morph across the screen while the icons are moving.
  // This also prevents expensive path recalcs during the transition.
  // -------------------------------------------------------------------------

  const [showBeams, setShowBeams] = useState(true);
  const isFirstRender = useRef(true);

  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // initial mount: keep beams visible
    }

    // Beam entrance delay tuned to outlast the slowest step-card animation
    // (≈250 ms baseline + stagger up to 200 ms). 550 ms leaves a small safety
    // margin without feeling laggy.
    const DELAY = prefersReducedMotion ? 0 : 550;

    setShowBeams(false);
    const timeout = window.setTimeout(() => setShowBeams(true), DELAY);
    return () => window.clearTimeout(timeout);
  }, [scenario, prefersReducedMotion]);

  // Desktop ≥ 1024 px – render **either** desktop or mobile layout, never both.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  // ---------------------------------------------------------------------
  // Stable refs reused across scenario switches so <AnimatedBeam> doesn’t
  // get re-mounted (and restart its gradient animation) unnecessarily.
  // ---------------------------------------------------------------------
  const iconRefs = React.useRef<React.RefObject<HTMLDivElement>[]>(
    Array.from({ length: 4 }, () => React.createRef<HTMLDivElement>())
  ).current;

  // Anchor at the very bottom-centre of each top step column (launch point
  // for the vertical beam)
  const topAnchorRefs = React.useRef<React.RefObject<HTMLSpanElement>[]>(
    Array.from({ length: 4 }, () => React.createRef<HTMLSpanElement>())
  ).current;



  // Dynamically measure icon half-width for precise beam offsets
  const [iconHalf, setIconHalf] = useState(32);

  // ---------------------------------------------------------------
  // Full-screen gallery state
  // ---------------------------------------------------------------
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStep, setGalleryStep] = useState<1 | 2 | 3 | 4>(1);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const handleThumbClick = useCallback((stepId: 1 | 2 | 3 | 4, idx: number) => {
    setGalleryStep(stepId);
    setGalleryIndex(idx);
    setGalleryOpen(true);
  }, []);

  useEffect(() => {
    // Measure on the next tick once DOM updates
    const handle = requestAnimationFrame(() => {
      const firstIcon = iconRefs[0]?.current;
      if (firstIcon) {
        const w = firstIcon.getBoundingClientRect().width / 2;
        if (w && Math.abs(w - iconHalf) > 1) setIconHalf(w);
      }
    });
    return () => cancelAnimationFrame(handle);
  }, [iconRefs, iconHalf]);

  return (
    <section
      ref={containerRef as any}
      className="relative w-full px-4 pt-16 desktop:pt-24 pb-16 tablet:pb-20 laptop:pb-24 desktop:pb-24"
      style={{ contain: 'layout style' }}
    >
      <div className="mx-auto max-w-6xl text-center mb-12">
        <h2 className="text-3xl laptop:text-4xl font-extrabold mb-5 tracking-tight super-shiny-text">
          Read-to-AssetPack Workflows for Reliable Software Change
        </h2>
        <p className="text-base laptop:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Every accepted AssetPack strengthens Bitcode’s <span className="font-semibold text-white">source-to-shares evidence</span>&nbsp;for faster, higher-quality technical work.
        </p>

        {/* scenario selector */}
        <div className="mt-8 grid grid-cols-2 tablet:flex flex-wrap justify-center gap-3 overflow-x-auto scrollbar-none py-1">
          {(Object.keys(NEW_SCENARIOS) as Array<keyof typeof NEW_SCENARIOS>).map((key) => (
            <button
              key={key}
              onClick={() => setScenario(key)}
              className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors backdrop-blur-md border border-transparent ${
                scenario === key
                  ? "bg-green-primary/90 text-black shadow-lg shadow-green-primary/30"
                  : "bg-white/5 text-gray-300 hover:bg-white/15"
              }`}
            >
              {NEW_SCENARIOS[key].label}
            </button>
          ))}
        </div>
      </div>

      {isDesktop && (
      <div className="max-w-6xl mx-auto px-6 transition-opacity duration-300" key={scenario}>
          <div className="flex justify-between">
            {steps.map(({ id, title, desc, Icon }) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.25, delay: id * 0.05, ease: "easeOut" }}
                className="relative flex flex-col items-center text-center w-1/4"
              >
                <div
                  ref={iconRefs[id - 1]}
                  className="relative z-10 mb-2 h-16 w-16 flex items-center justify-center"
                  style={
                    !prefersReducedMotion && isSectionVisible
                      ? {
                          animation: `wobble 4s linear ${id * 0.2}s infinite`,
                          animationTimingFunction: 'steps(30)',
                        }
                      : undefined
                  }
                >
                  {/* masked base */}
                  <span className="absolute inset-0 rounded-full bg-gray-950" />
                  {/* gradient ring */}
                  <span className="absolute inset-0 rounded-full bg-gradient-to-br from-green-primary/20 to-green-primary/5 border border-green-primary/60 shadow-lg shadow-green-primary/20" />
                  <Icon className="relative z-20 h-7 w-7 text-green-primary" />
                </div>
                <p className="uppercase text-[11px] tracking-wide text-green-primary font-semibold mb-1">
                  Step {id}
                </p>
                <h3 className="text-white font-semibold text-lg mb-1 leading-tight">
                  {title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-3 max-w-[14rem]">
                  {desc}
                </p>
                <div className="mb-3 w-full max-w-[14rem]">
                  <MarketingThumbnailStack
                    images={thumbnailSrcMemo[id as 1 | 2 | 3 | 4]}
                    onThumbClick={(idx) => handleThumbClick(id as 1 | 2 | 3 | 4, idx)}
                    className="!w-full !h-[70px] grid grid-cols-3 !grid-rows-1 gap-1"
                    animationPaused={!isSectionVisible}
                  />
                </div>
                <div className="relative flex justify-center w-full">
                  <BitcodePill>1000+ LLM Calls</BitcodePill>
                  <span
                    ref={topAnchorRefs[id - 1]}
                    className="absolute left-1/2 top-full -translate-x-1/2 w-px h-px"
                  />
                </div>
              </motion.div>
            ))}
          </div>

        {/* Beams connecting steps (desktop only) */}
        {isSectionVisible && showBeams &&
          iconRefs.map((ref, idx) => {
            if (idx === iconRefs.length - 1) return null;
            return (
              <motion.div
                key={`beam-${scenario}-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={iconRefs[idx]}
                  toRef={iconRefs[idx + 1]}
                  curvature={idx % 2 === 0 ? -50 : 60}
                  pathColor="transparent"
                  pathOpacity={0.12}
                  gradientStartColor="#22c55e"
                  gradientStopColor="#bbf7d0"
                  pathWidth={3.5}
                  duration={2.8}
                  delay={idx * 0.5}
                  startXOffset={iconHalf - 4}
                  endXOffset={-(iconHalf - 4)}
                  startYOffset={0}
                  endYOffset={0}
                  className="-z-10"
                />
              </motion.div>
            );
          })}
      </div>
      )}

      {/* Mobile vertical */}
      {!isDesktop && (
      <div className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={scenario}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-6"
          >
            {steps.map(({ id, title, desc, Icon }) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: id * 0.05, ease: "easeOut" }}
                className="flex flex-col items-start gap-2"
              >
                <div className="relative z-10 h-12 w-12 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-gray-950" />
                  <span className="absolute inset-0 rounded-full bg-gradient-to-br from-green-primary/20 to-green-primary/5 border border-green-primary/50" />
                  <Icon className="relative z-20 h-6 w-6 text-green-primary" />
                </div>
                <div className="flex-1">
                  <p className="uppercase text-[11px] tracking-wide text-green-primary font-semibold mb-1">Step {id}</p>
                  <h3 className="text-white font-semibold mb-1 leading-tight">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-2">{desc}</p>
                  <div className="mb-2 w-full">
                    <MarketingThumbnailStack
                      images={thumbnailSrcMemo[id as 1 | 2 | 3 | 4]}
                      onThumbClick={(idx) => handleThumbClick(id as 1 | 2 | 3 | 4, idx)}
                      className="!w-full !h-[70px] grid grid-cols-3 !grid-rows-1 gap-1"
                      animationPaused={!isSectionVisible}
                    />
                  </div>
                  <BitcodePill className="text-[10px] px-2">1000+ LLM Calls</BitcodePill>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      )}

      {/* Full-screen gallery */}
      {galleryOpen && (
        <MarketingFullScreenGallery
          screenshots={STEP_SCREENSHOTS[galleryStep]}
          initialIndex={galleryIndex}
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          layout="inline"
        />
      )}

      {/* wobble keyframes provided via CSS module import */}


    </section>
  );
}
