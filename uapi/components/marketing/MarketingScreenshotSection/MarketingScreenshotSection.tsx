"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import MarketingThumbnailStack from './MarketingThumbnailStack';
import {
  EnvelopeIcon,
  ArrowDownTrayIcon,
  WalletIcon,
  BuildingOfficeIcon,
  FolderIcon,
  ArrowPathRoundedSquareIcon,
  HashtagIcon,
  SquaresPlusIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  PaperClipIcon,
  LinkIcon,
  CodeBracketIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  PuzzlePieceIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
// Fullscreen gallery for screenshots with thumbnail carousel
import MarketingFullScreenGallery from './MarketingFullScreenGallery';
import type { Screenshot } from './marketing-types';
// Reuse the global neon underline + glow styles defined for Bitcode headers.
import "@/styles/bitcode-header-shiny-text.css";
import { motion, useInView } from "framer-motion";
import { BITCODE_GITHUB_APP_PUBLIC_URL } from '@/lib/github-app-url';

// Persist a module-level flag so the animation only ever plays once per page
// load, even if the component gets unmounted/remounted (e.g. via Next.js
// routing, Suspense boundaries, etc.).
let screenshotsAnimated = false;

declare global {
  interface Window {
    __bitcodeRevealScreenshotsFired?: boolean;
  }
}

const MarketingScreenshotSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  // Gallery modal control
  const [activeScreens, setActiveScreens] = useState<Screenshot[] | null>(null);
  const [initialSlide, setInitialSlide] = useState(0);

  const openGallery = useCallback((screens: Screenshot[], index = 0) => {
    setActiveScreens(screens);
    setInitialSlide(index);
  }, []);

  const closeGallery = useCallback(() => {
    setActiveScreens(null);
  }, []);

  // ---------------------------------------------------------------------
  // Screenshot bundles used by the three steps
  // ---------------------------------------------------------------------

  const step1Screens: Screenshot[] = [
    {
      id: 'setup-marketplace',
      src: '/screenshots/setup-marketplace.png',
      alt: 'Marketplace setup',
      revealingSoon: true,
      description: 'Quickly connect your repo and configure Bitcode in the GitHub marketplace.'
    },
    {
      id: 'setup-btd',
      src: '/screenshots/setup-btd.png',
      alt: 'Acquire BTD',
      revealingSoon: true,
      description: 'Fund your Bitcode account with $BTD for protocol activity.'
    },
    {
      id: 'setup-btd-balance',
      src: '/screenshots/setup-btd-balance.png',
      alt: 'BTD balance widget',
      revealingSoon: true,
      description: 'Real-time balance overview.'
    },
  ];

  const step2Screens: Screenshot[] = [
    {
      id: 'asset-pack-request',
      src: '/screenshots/asset-pack-page-minimal-state.png',
      alt: 'Create an AssetPack request',
      revealingSoon: true,
      description: 'Open a new Read describing the AssetPack you want finished.'
    },
    {
      id: 'execution-kickoff',
      src: '/screenshots/executions-page.png',
      alt: 'Kick-off an execution',
      revealingSoon: true,
      description: 'Start a one-click execution pipeline.'
    },
  ];

  const step3Screens: Screenshot[] = [
    {
      id: 'execution-summary',
      src: '/screenshots/sidebar-executions.png',
      alt: 'Execution summary',
      revealingSoon: true,
      description: 'Concise summary of completed execution.'
    },
    {
      id: 'conversations-widget',
      src: '/screenshots/conversations-small.png',
      alt: 'Conversations widget',
      revealingSoon: true,
      description: 'Automated complexity analysis attached to PRs.'
    },
    {
      id: 'notifications',
      src: '/screenshots/notifications-widget.png',
      alt: 'Instant notifications',
      revealingSoon: true,
      description: 'Stay in the loop with subtle Dock notifications.'
    },
    //{
    //id: 'btd-tracker',
    //src: '/screenshots/btd-tracker-widget.png',
    //alt: 'BTD tracker',
    //type: 'component',
    //category: 'setup_steps',
    //description: 'Real-time view of your remaining $BTD balance.'
    //},
  ];
  // Refs for dynamic arrow
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const installRef = useRef<HTMLLIElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const arrowPathRef = useRef<SVGPathElement>(null);
  const arrowHeadRef = useRef<SVGPathElement>(null);
  // Trigger animation when section scrolls into view. `once` ensures the hook
  // itself only flips to `true` on the first intersection, but when the
  // component remounts it would start from `false` again.  By coupling this
  // with the module-level `screenshotsAnimated` flag we guarantee at most one
  // full animation for the entire session.
  const isInView = useInView(ref, { once: true, margin: "0px 0px -75% 0px" });
  // (Parallax removed)

  // The hero fires a global `revealScreenshots` event when it decides the
  // gallery is allowed to play its grand entrance.  However, after moving the
  // "Trusted By" marquee to a different part of the page that event can now
  // occur *before* the `ScreenshotSection` is even mounted, causing us to miss
  // it and thus never animate.
  //
  // To make the section completely self-sufficient we fall back to animating
  // as soon as it intersects the viewport even if the event was missed.  The
  // hero event still gives us the opportunity to start a little earlier (e.g.
  // while the section is partially off-screen) but is no longer strictly
  // required.
  //
  // Default to `true` when the animation already played once so any remounts
  // render the final resting state immediately.
  const [canAnimate, setCanAnimate] = useState(screenshotsAnimated);
  const [highlightGroup, setHighlightGroup] = useState<null | 'assetPacks' | 'evidenceDocuments'>(null);

  // Reused class names (SRP/DRY)
  const screenshotFrameClass = "relative w-full aspect-video overflow-hidden rounded-lg shadow-lg";

  // -----------------------------------------------------------------------
  // Dynamic arrow positioning
  // -----------------------------------------------------------------------
  const updateArrow = useCallback(() => {
    if (!linkRef.current || !step1Ref.current || !arrowRef.current || !arrowPathRef.current || !arrowHeadRef.current || !howItWorksRef.current) {
      return;
    }

    const containerRect = howItWorksRef.current.getBoundingClientRect();
    const source = linkRef.current.getBoundingClientRect();
    // Determine the target element (list item for 'Install GitHub App' if available)
    const defaultTarget = step1Ref.current.getBoundingClientRect();
    const installEl = installRef.current;
    const targetRect = installEl
      ? installEl.getBoundingClientRect()
      : defaultTarget;

    // start point – left-most x of link, slight offset from bottom
    // coordinates relative to container
    const startX = source.left - containerRect.left - 6;
    const startY = source.bottom - containerRect.top + .33; // small offset

    // end point – left edge, mid-point of target element
    const endX = targetRect.left - containerRect.left;
    const endY = targetRect.top - containerRect.top + targetRect.height / 2;

    // Calculate horizontal gap and arc to slot into available space
    const dx = Math.abs(endX - startX);
    // Determine available space between card's left edge and screen edge
    const cardLeft = targetRect.left; // px from viewport left
    const screenMargin = 16; // px inset from screen edge
    const available = Math.max(cardLeft - screenMargin, 0);
    const arc = available;
    const minX = Math.min(startX, endX) - arc;
    const minY = Math.min(startY, endY) - 20;
    const width = dx + arc * 2;
    const height = Math.abs(endY - startY) + 40;

    const svg = arrowRef.current;
    svg.style.left = `${minX}px`;
    svg.style.top = `${minY}px`;
    svg.setAttribute('width', `${width}`);
    svg.setAttribute('height', `${height}`);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const sx = startX - minX;
    const sy = startY - minY;
    const ex = endX - minX;
    const ey = endY - minY;

    // control points for wide arch hugging the left side
    const cx1 = 0;
    const cy1 = sy;
    const cx2 = 0;
    const cy2 = ey;
    arrowPathRef.current.setAttribute(
      'd',
      `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${ex} ${ey}`
    );

    // arrow head triangle
    const angle = Math.atan2(ey - cy2, ex - cx2);
    const size = 16;
    const hx = ex;
    const hy = ey;
    const leftX = hx - size * Math.cos(angle - Math.PI / 6);
    const leftY = hy - size * Math.sin(angle - Math.PI / 6);
    const rightX = hx - size * Math.cos(angle + Math.PI / 6);
    const rightY = hy - size * Math.sin(angle + Math.PI / 6);
    arrowHeadRef.current.setAttribute('d', `M ${hx} ${hy} L ${leftX} ${leftY} L ${rightX} ${rightY} Z`);
  }, []);

  useEffect(() => {
    updateArrow();

    let raf = 0;
    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateArrow);
    };

    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    return () => {
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [updateArrow]);

  // If the hero already fired the event before we mounted, we’ll detect that
  // via a flag set on `window` (added in the hero component).  This guarantees
  // we don’t miss the cue when the dynamic import for this section lags.

  useEffect(() => {
    if (typeof window !== 'undefined' && window.__bitcodeRevealScreenshotsFired) {
      setCanAnimate(true);
    }
  }, []);

  // Listen for the hero’s explicit signal going forward.
  useEffect(() => {
    const handler = () => setCanAnimate(true);
    window.addEventListener('revealScreenshots', handler);
    return () => window.removeEventListener('revealScreenshots', handler);
  }, []);

  // Note: we deliberately **do not** auto-enable `canAnimate` just because the
  // section is in view.  Doing so caused a regression where the screenshots
  // animated before the hero finished its CTA sequence.  Instead we rely on:
  //   1) the explicit `revealScreenshots` event, or
  //   2) the `__bitcodeRevealScreenshotsFired` flag when that event happened
  //      before this component mounted.
  // Removed scroll-based tilt to prevent disappearance glitches

  // Ensure we only fire the completion event once
  // Memoised ref so we don't fire completion more than once.
  const entranceDoneRef = useRef(screenshotsAnimated);

  // Helper to decide whether we should run the entrance animation this render.
  // Kick-off the entrance only when BOTH conditions are met:
  //   1.  We’re allowed to animate (`canAnimate` set via hero event or the
  //       in-view fallback).
  //   2.  The section is at least partially visible (`isInView`).
  // This prevents the early trigger regression while still ensuring we don’t
  // miss the hero’s signal.
  const shouldAnimate = !screenshotsAnimated && canAnimate && isInView;

  return (
    <>
      <section
        id="screenshot"
        className="relative w-screen overflow-visible -mt-[38vh] pt-0 pb-8 tablet:pb-10 laptop:pb-12 desktop:pb-16 px-4 laptop:px-0"
        style={{ contain: 'layout style' }}
      >
        {/* Mobile: staggered hero screenshot layout (large → medium → small) */}
        <div className="block laptop:hidden px-4 py-6 space-y-2">
          {(() => {
            const shots = [
              { src: '/screenshots/asset-pack-page-maximal-state.png', alt: 'AssetPack evidence screenshot' },
              { src: '/screenshots/asset-pack-page-minimal-state.png', alt: 'AssetPack request screenshot' },
              { src: '/screenshots/conversations-fullscreen.png', alt: 'Conversations fullscreen chat screenshot' },
              { src: '/screenshots/sidebar-shippables.png', alt: 'Sidebar Shippables panel screenshot' },
              { src: '/screenshots/setup-marketplace.png', alt: 'Marketplace setup screenshot' },
              { src: '/screenshots/setup-btd-balance.png', alt: 'BTD balance panel screenshot' },
            ] as const;

            const [large, medium1, medium2, small1, small2, small3] = shots;

            return (
              <>
                {/* Large hero image */}
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={screenshotFrameClass}
                  style={{ filter: 'drop-shadow(0 0 20px rgba(101,254,183,0.3))' }}
                >
                  <Image
                    src={large.src}
                    alt={large.alt}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority={false}
                  />
                </motion.div>

                {/* Two mediums */}
                <div className="grid grid-cols-2 gap-2">
                  {[medium1, medium2].map((shot, idx) => (
                    <motion.div
                      key={shot.src}
                      initial={{ opacity: 0, y: 40, scale: 0.95 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.6, delay: 0.1 * (idx + 1), ease: 'easeOut' }}
                      className={screenshotFrameClass}
                      style={{ filter: 'drop-shadow(0 0 16px rgba(59,130,246,0.25))' }}
                    >
                      <Image
                        src={shot.src}
                        alt={shot.alt}
                        fill
                        className="object-cover"
                        sizes="50vw"
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Three smalls */}
                <div className="grid grid-cols-3 gap-2">
                  {[small1, small2, small3].map((shot, idx) => (
                    <motion.div
                      key={shot.src}
                      initial={{ opacity: 0, y: 40, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.55, delay: 0.15 * (idx + 1), ease: 'easeOut' }}
                      className="relative w-full aspect-video overflow-hidden rounded-lg shadow"
                      style={{ filter: 'drop-shadow(0 0 12px rgba(147,51,234,0.25))' }}
                    >
                      <Image
                        src={shot.src}
                        alt={shot.alt}
                        fill
                        className="object-cover"
                        sizes="33vw"
                      />
                    </motion.div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
        {/* Wrapper for 3D-perspective screenshots peek under fold */}
        <motion.div
          ref={ref}
          className="relative w-screen"
          style={{
            perspective: 1000,
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="hidden laptop:flex flex-col laptop:flex-row items-start justify-center overflow-visible w-screen">
            {/* Left screenshot */}
            <motion.div
              style={{ willChange: 'transform, opacity' }}
              initial={screenshotsAnimated ? { opacity: 1, y: 5, scale: 1 } : { opacity: 0, y: 70, scale: 0.985 }}
              animate={
                shouldAnimate
                  ? {
                    opacity: [0, 0.8, 1],
                    y: [70, -4, 5], // slight downward final offset
                    scale: [0.985, 1.005, 1],
                  }
                  : {
                    opacity: screenshotsAnimated ? 1 : 0,
                    y: screenshotsAnimated ? 5 : 70,
                    scale: screenshotsAnimated ? 1 : 0.985,
                  }
              }
              transition={
                shouldAnimate
                  ? {
                    duration: 1.6,
                    delay: 0,
                    times: [0, 0.55, 1],
                    ease: [0.22, 0.85, 0.36, 1],
                  }
                  : { duration: 0 }
              }
              className="relative w-full laptop:w-1/4 flex-shrink-0 laptop:-mr-32 mb-6 laptop:mb-0 z-0"
            >
              {/* Orange radial glow behind left screenshot (pulsing) */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                initial={screenshotsAnimated ? { opacity: 0.4, scale: 1 } : { opacity: 0, scale: 0.96 }}
                animate={shouldAnimate ? { opacity: [0, 1, 0.4], scale: [0.99, 1.005, 1] } : { opacity: 0.4, scale: 1 }}
                transition={shouldAnimate ? { duration: 1.2, times: [0, 0.35, 1], ease: 'easeOut' } : { duration: 0 }}
                style={{
                  background: 'radial-gradient(circle at center, rgba(249,168,38,0.5), transparent 70%)',
                  filter: 'blur(60px)',
                  willChange: 'opacity, transform',
                }}
              />
              <Image
                src="/screenshots/asset-pack-page-maximal-state.png"
                alt="Left Bitcode screenshot"
                className="relative w-full rounded-xl object-cover border-2 border-orange-400"
                style={{}}
                width={800}
                height={600}
                priority
                fetchPriority="high"
              />
              {/* Strong inner shadow overlay */}
              <div
                className="absolute inset-0 rounded-xl pointer-events-none z-50"
                style={{
                  // Slightly thinner inner border with a softer falloff shadow
                  boxShadow:
                    'inset 0 0 0 7px rgba(0,0,0,0.9), ' +
                    'inset 0 0 35px 8px rgba(0,0,0,0.9)',
                }}
              />
              {/* Outer outline ring */}
              <div
                className="absolute inset-0 rounded-xl pointer-events-none z-60"
                style={{ boxShadow: '0 0 12px 2px #fb923c' }}
              />

              {/* --- NEW: Trio of small floating screenshots (LEFT) --- */}
              {/* Responsive container for small left floating screenshots */}
              <div
                className="absolute -bottom-40 w-[20rem] h-[11rem] pointer-events-none z-[70]"
                style={{ left: '50%', transform: 'translateX(-80%)' }}
              >
                {[
                  {
                    src: '/screenshots/sidebar-shippables.png',
                    border: 'border-orange-400',
                    glow: 'rgba(249,168,38,0.6)',
                    rotate: 0,
                    style: { left: '-1rem', bottom: '0rem', zIndex: 80 },
                  },
                  {
                    src: '/screenshots/setup-marketplace.png',
                    border: 'border-orange-400',
                    glow: 'rgba(249,168,38,0.6)',
                    rotate: 0,
                    style: { left: '5.5rem', bottom: '3.5rem', zIndex: 90 },
                  },
                  {
                    src: '/screenshots/setup-btd-balance.png',
                    border: 'border-green-400',
                    glow: 'rgba(52,211,153,0.6)',
                    rotate: 0,
                    style: { left: '11rem', bottom: '5rem', zIndex: 85 },
                  },
                ].map((shot, i) => (
                  <motion.div
                    key={shot.src}
                    initial={screenshotsAnimated ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
                    animate={
                      shouldAnimate
                        ? { opacity: 1, y: 0, scale: 1 }
                        : { opacity: screenshotsAnimated ? 1 : 0, y: screenshotsAnimated ? 0 : 30, scale: screenshotsAnimated ? 1 : 0.9 }
                    }
                    transition={
                      shouldAnimate
                        ? { duration: 1, delay: 1.05 + i * 0.14, ease: [0.22, 0.85, 0.36, 1] }
                        : { duration: 0 }
                    }
                    className="absolute rounded-lg pointer-events-none"
                    style={{
                      ...shot.style,
                      rotate: `${shot.rotate}deg`,
                    }}
                  >
                    <div className="relative">
                      <Image
                        src={shot.src}
                        alt="Bitcode feature screenshot"
                        className={`w-32 laptop:w-36 desktop:w-40 rounded-lg object-cover border-2 ${shot.border}`}
                        style={{ filter: `drop-shadow(0 0 14px ${shot.glow})` }}
                        width={160}
                        height={90}
                        priority={false}
                      />
                      {/* Overlay removed – hero floating screenshots are not galleries */}
                    </div>
                    <div
                      className="absolute inset-0 rounded-lg pointer-events-none"
                      style={{
                        // Thinner inner border + softer drop for smaller floating screenshot cards
                        boxShadow:
                          'inset 0 0 0 4px rgba(0,0,0,0.9), ' +
                          'inset 0 0 22px 4px rgba(0,0,0,0.9)',
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Center screenshot */}
            <motion.div className="relative w-full laptop:w-2/4 flex-shrink-0 mb-6 laptop:mb-0 z-20">
              <motion.div
                style={{ willChange: 'transform, opacity' }}
                initial={screenshotsAnimated ? { opacity: 1, y: -10, scale: 1 } : { opacity: 0, y: 70, scale: 0.985 }}
                animate={
                  shouldAnimate
                    ? {
                      opacity: [0, 0.8, 1],
                      y: [70, -5, -10], // raise center higher
                      scale: [0.985, 1.01, 1],
                    }
                    : {
                      opacity: screenshotsAnimated ? 1 : 0,
                      y: screenshotsAnimated ? -10 : 70,
                      scale: screenshotsAnimated ? 1 : 0.985,
                    }
                }
                transition={
                  shouldAnimate
                    ? {
                      duration: 1.8,
                      delay: 0.12,
                      times: [0, 0.52, 1],
                      ease: [0.22, 0.85, 0.36, 1],
                    }
                    : { duration: 0 }
                }
                onAnimationComplete={() => {
                  // Guard: only treat this as the grand entrance if we actually
                  // ran the entrance motion this render.
                  if (!shouldAnimate || entranceDoneRef.current) return;

                  entranceDoneRef.current = true;
                  // Persist so subsequent mounts render final state instantly
                  screenshotsAnimated = true;
                  // Signal hero that screenshots have completed their entrance
                  window.dispatchEvent(new CustomEvent('screenshotEntranceComplete'));
                }}
              >
                {/* Green radial glow behind center screenshot (pulsing) */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  initial={screenshotsAnimated ? { opacity: 0.45, scale: 1 } : { opacity: 0, scale: 0.96 }}
                  animate={shouldAnimate ? { opacity: [0, 1, 0.45], scale: [0.99, 1.008, 1] } : { opacity: 0.45, scale: 1 }}
                  transition={shouldAnimate ? { duration: 1.5, times: [0, 0.35, 1], ease: 'easeOut' } : { duration: 0 }}
                  style={{
                    background: 'radial-gradient(circle at center, rgba(52,211,153,0.5), transparent 70%)',
                    filter: 'blur(120px)',
                    willChange: 'opacity, transform',
                  }}
                />
                <Image
                  src="/screenshots/asset-pack-page-minimal-state.png"
                  alt="Center Bitcode screenshot"
                  className="relative w-full rounded-2xl object-cover border-2 border-green-400"
                  style={{}}
                  width={900}
                  height={600}
                  priority
                  sizes="(min-width:1024px) 45vw, 90vw"
                />
                {/* Strong inner shadow overlay */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none z-50"
                  style={{
                    // Slightly thinner inner border with a softer falloff shadow
                    boxShadow:
                      'inset 0 0 0 7px rgba(0,0,0,0.9), ' +
                      'inset 0 0 35px 8px rgba(0,0,0,0.9)',
                  }}
                />
                {/* Outer outline ring */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none z-60"
                  style={{ boxShadow: '0 0 12px 2px #4ade80' }}
                />
              </motion.div>
            </motion.div>

            {/* Right screenshot */}
            <motion.div className="relative w-full laptop:w-1/4 flex-shrink-0 laptop:-ml-32 mb-6 laptop:mb-0 z-0">
              <motion.div
                style={{ willChange: 'transform, opacity' }}
                initial={screenshotsAnimated ? { opacity: 1, y: 15, scale: 1 } : { opacity: 0, y: 70, scale: 0.985 }}
                animate={
                  shouldAnimate
                    ? {
                      opacity: [0, 0.8, 1],
                      y: [70, -3, 15], // lowest final offset
                      scale: [0.985, 1.005, 1],
                    }
                    : {
                      opacity: screenshotsAnimated ? 1 : 0,
                      y: screenshotsAnimated ? 15 : 70,
                      scale: screenshotsAnimated ? 1 : 0.985,
                    }
                }
                transition={
                  shouldAnimate
                    ? {
                      duration: 1.6,
                      delay: 0.24,
                      times: [0, 0.55, 1],
                      ease: [0.22, 0.85, 0.36, 1],
                    }
                    : { duration: 0 }
                }
              >
                {/* Purple radial glow behind right screenshot */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  initial={screenshotsAnimated ? { opacity: 0.4, scale: 1 } : { opacity: 0, scale: 0.96 }}
                  animate={shouldAnimate ? { opacity: [0, 1, 0.4], scale: [0.99, 1.005, 1] } : { opacity: 0.4, scale: 1 }}
                  transition={shouldAnimate ? { duration: 1.2, times: [0, 0.35, 1], ease: 'easeOut' } : { duration: 0 }}
                  style={{
                    background: 'radial-gradient(circle at center, rgba(192,132,252,0.5), transparent 70%)',
                    filter: 'blur(60px)',
                    willChange: 'opacity, transform',
                  }}
                />
                <Image
                  src="/screenshots/conversations-fullscreen.png"
                  alt="Right Bitcode screenshot"
                  className="relative w-full rounded-xl object-cover border-2 border-purple-500"
                  style={{}}
                  width={800}
                  height={600}
                  priority={false}
                  fetchPriority="low"
                  sizes="(min-width:1024px) 22vw, 45vw"
                />
                {/* Strong inner shadow overlay */}
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none z-50"
                  style={{
                    // Slightly thinner inner border with a softer falloff shadow
                    boxShadow:
                      'inset 0 0 0 7px rgba(0,0,0,0.9), ' +
                      'inset 0 0 35px 8px rgba(0,0,0,0.9)',
                  }}
                />
                {/* Outer outline ring */}
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none z-60"
                  style={{ boxShadow: '0 0 12px 2px #a855f7' }}
                />

                {/* --- NEW: Trio of small floating screenshots (RIGHT) --- */}
                {/* Responsive container for small right floating screenshots */}
                <div
                  className="absolute -bottom-40 w-[20rem] h-[11rem] pointer-events-none z-[70]"
                  style={{ left: '50%', transform: 'translateX(-20%)' }}
                >
                  {[
                    {
                      src: '/screenshots/conversations-small.png',
                      border: 'border-purple-500',
                      glow: 'rgba(192,132,252,0.6)',
                      rotate: 0,
                      style: { left: '1rem', bottom: '-1rem', zIndex: 80 },
                    },
                    {
                      src: '/screenshots/rich-text-conversations.png',
                      border: 'border-purple-500',
                      glow: 'rgba(192,132,252,0.6)',
                      rotate: 0,
                      style: { left: '1rem', bottom: '17.5rem', zIndex: 90 },
                    },
                    {
                      src: '/screenshots/notifications-widget.png',
                      border: 'border-green-400',
                      glow: 'rgba(52,211,153,0.6)',
                      rotate: 0,
                      style: { left: '8.5rem', bottom: '5.5rem', zIndex: 85 },
                    },
                  ].map((shot, i) => (
                    <motion.div
                      key={shot.src}
                      initial={screenshotsAnimated ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
                      animate={
                        shouldAnimate
                          ? { opacity: 1, y: 0, scale: 1 }
                          : { opacity: screenshotsAnimated ? 1 : 0, y: screenshotsAnimated ? 0 : 30, scale: screenshotsAnimated ? 1 : 0.9 }
                      }
                      transition={
                        shouldAnimate
                          ? { duration: 1, delay: 1.35 + i * 0.14, ease: [0.22, 0.85, 0.36, 1] }
                          : { duration: 0 }
                      }
                      className="absolute rounded-lg pointer-events-none"
                      style={{
                        ...shot.style,
                        rotate: `${shot.rotate}deg`,
                      }}
                    >
                      <Image
                        src={shot.src}
                        alt="Bitcode feature screenshot"
                        className={`w-32 laptop:w-36 desktop:w-40 rounded-lg object-cover border-2 ${shot.border}`}
                        style={{ filter: `drop-shadow(0 0 14px ${shot.glow})` }}
                        width={160}
                        height={90}
                        priority={false}
                      />
                      <div
                        className="absolute inset-0 rounded-lg pointer-events-none"
                        style={{
                          // Thinner inner border + softer drop for smaller floating screenshot cards
                          boxShadow:
                            'inset 0 0 0 4px rgba(0,0,0,0.9), ' +
                            'inset 0 0 22px 4px rgba(0,0,0,0.9)',
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Title and subtitle reveal on scroll */}
          {/*
         * Title and subtitle block.  When the screenshot entrance ran once
         * we persist that fact via the `screenshotsAnimated` module-level flag
         * so any later remounts render this text in its final state at full
         * opacity.  This prevents the fade-in animation from replaying
         * accidentally (e.g. during route transitions or Suspense).  We use
         * the same `shouldAnimate` guard as the main gallery so the motion
         * only occurs on the very first reveal.
         */}
          <motion.div
            initial={screenshotsAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={
              //   1. First entrance: fade in when the section is in view.
              //   2. Subsequent remounts: render final state instantly.
              screenshotsAnimated ? { opacity: 1, y: 0 } : isInView ? { opacity: 1, y: 0 } : {}
            }
            transition={screenshotsAnimated ? { duration: 0 } : { delay: 0.6, duration: 0.8 }}
            className="mt-16 text-center px-4 z-20"
          >
            <h2
              className="text-4xl laptop:text-7xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-emerald-300 via-sky-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-[0_3px_15px_rgba(0,0,0,0.25)] pb-2 laptop:pb-3"
            >
              <span className="block">Powerful Bitcode Workflows</span>
              <span className="block">That Adapt To Your Stack</span>
            </h2>
            <div className="mt-6 max-w-4xl mx-auto leading-relaxed px-4 overflow-hidden">
              {/* Subtitle paragraph with silver-sheen highlight + neon underline */}
              <p className="text-xl laptop:text-2xl text-center text-slate-300" style={{ whiteSpace: 'normal' }}>
                The{' '}
                <a
                  ref={linkRef}
                  id="esi-link"
                  href={BITCODE_GITHUB_APP_PUBLIC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glowing-underline text-slate-100 hover:text-white transition-colors font-semibold"
                >
                  Bitcode&nbsp;GitHub&nbsp;App
                </a>{' '}
                lets you turn repository context into PR-backed AssetPacks with reviewable evidence and connected-interface delivery.
              </p>
            </div>

            {/* ------------------------------------------------------------------
              Simple 1-2-3 How-It-Works wireframe (non-interactive)
              Displays three equally sized boxes – Setup, Use, Receive –
              and a dotted line connecting the subtitle above to step #1.
              This is an early scaffold only, visual polish & animations
              will be added in a subsequent iteration.                    
          ------------------------------------------------------------------- */}

            <div ref={howItWorksRef} className="mt-12 w-full max-w-5xl mx-auto px-4 relative z-10" id="how-it-works">
              {/* ----------------------------------------------------------------
             *  Curved dotted arrow connecting subtitle ➜ Step #1 (desktop)
             * --------------------------------------------------------------*/}
              {/* Curved arrow rendered via dynamic SVG so we can reposition on resize */}
              <svg
                ref={arrowRef}
                className="hidden laptop:block absolute pointer-events-none"
                style={{ overflow: 'visible' }}
                width="0" height="0"
                viewBox="0 0 1 1"
                fill="none"
              >
                <path
                  ref={arrowPathRef}
                  stroke="#34d399"
                  strokeWidth="3"
                  strokeDasharray="4 8"
                  vectorEffect="non-scaling-stroke"
                />
                <path ref={arrowHeadRef} fill="#34d399" />
              </svg>

              {/* How-it-Works grid */}
              <div className="grid grid-cols-1 tablet:grid-cols-3 gap-6 tablet:gap-6 gap-y-8">
                {/* ------------------------ STEP 1 – varied design -------------- */}
                <div ref={step1Ref} className="relative p-6 rounded-lg border border-emerald-500/40 bg-gradient-to-br from-emerald-400/10 to-black/10 backdrop-blur-sm  flex flex-col overflow-visible">
                  <div className="flex items-center mb-3">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/25 text-emerald-300 font-bold mr-3">
                      1
                    </span>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">Setup</h3>
                  </div>
                  {/* Step subtitle – ribbon along full top edge */}
                  <p
                    className="absolute -top-4 left-4 right-4 text-center text-[12px] laptop:text-sm font-medium text-emerald-100 leading-snug select-none pointer-events-none px-3 py-1 rounded-md bg-emerald-500/15 backdrop-blur-sm border border-emerald-400/30 shadow-md"
                  >
                    Minimal Onboarding, Easy Integration
                  </p>
                  <ul className="space-y-3">
                    {[
                      { label: 'Confirm email', icon: EnvelopeIcon },
                      { label: 'Install GitHub App', icon: ArrowDownTrayIcon },
                      { label: 'Acquire $BTD', icon: WalletIcon },
                    ].map(({ label, icon: Icon }, idx) => (
                      <li
                        key={label}
                        ref={idx === 1 ? installRef : undefined}
                        className="flex items-center text-base text-slate-200 font-medium px-3 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 shadow-sm"
                        style={{ filter: 'drop-shadow(0 0 12px rgba(52,211,153,0.55))' }}
                      >
                        <span className="inline-flex items-center justify-center w-8 h-8 mr-4 rounded-full bg-emerald-500/20">
                          <Icon className="w-5 h-5 text-emerald-300" />
                        </span>
                        {label}
                      </li>
                    ))}
                  </ul>

                  {/* Floating thumbnails – Step 1: maintain original asymmetric placement */}
                  {step1Screens.slice(0, 3).map((shot, idx) => {
                    // Mobile-friendly thumbnail placement: keep first thumb
                    // hidden sentinel, then spread visible ones evenly
                    // across the card’s width.
                    const positions = [
                      // Sentinel – invisible element that preserves stacking context
                      'absolute right-0 translate-x-full bottom-10 w-32 h-20 invisible',
                      // First visible thumbnail – will receive an inline top offset via style
                      'absolute right-4 laptop:left-1/4 laptop:-translate-x-1/2 w-28 laptop:w-32 h-16',
                      // Second visible thumbnail – likewise offset via inline style
                      'absolute right-4 laptop:left-3/4 laptop:-translate-x-1/2 w-28 laptop:w-32 h-16',
                    ];
                    return (
                      <div
                        key={shot.id}
                        className={`${positions[idx]} pointer-events-auto hover:scale-[1.06] transition-transform ${idx === 1 ? 'top-[34%] laptop:top-[90%]' : idx === 2 ? 'top-[59%] laptop:top-[90%]' : ''}`}
                        style={{
                          filter: 'drop-shadow(0 0 12px rgba(52,211,153,0.55))',
                        }}
                      >
                        <MarketingThumbnailStack
                          images={[shot.src]}
                          onThumbClick={() => openGallery(step1Screens, idx)}
                          pad={false}
                          className="!w-full !h-full grid grid-cols-1 !grid-rows-1 gap-0 border border-slate-700 rounded-md shadow-lg"
                        />
                      </div>
                    );
                  })}



                </div>

                {/* ------------------------ STEP 2 – dual-mode design -------------- */}
                <div className="relative p-6 rounded-lg border border-sky-500/40 bg-gradient-to-br from-sky-400/10 to-black/10 backdrop-blur-sm flex flex-col overflow-visible min-w-0">
                  <div className="flex items-center mb-3">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-sky-500/25 text-sky-300 font-bold mr-3">
                      2
                    </span>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-sky-300 to-cyan-300 bg-clip-text text-transparent">Command</h3>
                  </div>

                  {/* Step subtitle – ribbon along full top edge */}
                  <p
                    className="absolute -top-4 left-4 right-4 text-center text-[12px] laptop:text-sm font-medium text-sky-100 leading-snug select-none pointer-events-none px-3 py-1 rounded-md bg-sky-500/15 backdrop-blur-sm border border-sky-400/30 shadow-md"
                  >
                    Define Tasks, Attach References
                  </p>

                  {/* two-halves toggle */}
                  {/*
                   * Added `divide-x` utilities for a subtle vertical separator and
                   * some transparency so it blends with the background.
                   */}
                  <div className="grid grid-cols-2 gap-6 text-xs place-content-center justify-items-center px-4 w-full mt-4 tablet:mt-8">
                    {/* source half */}
                    <div
                      onMouseEnter={() => setHighlightGroup('assetPacks')}
                      onMouseLeave={() => setHighlightGroup(null)}
                      className="relative flex flex-col justify-center items-center p-3 rounded-md border border-sky-400/15"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        {/* Organization */}
                        <div className="flex flex-col items-center gap-1">
                          <BuildingOfficeIcon className="w-6 h-6 text-sky-300" />
                          <span className="text-[10px] text-sky-200">Org</span>
                        </div>
                        {/* Repository */}
                        <div className="flex flex-col items-center gap-1">
                          <FolderIcon className="w-6 h-6 text-sky-300" />
                          <span className="text-[10px] text-sky-200">Repo</span>
                        </div>
                        {/* Branch */}
                        <div className="flex flex-col items-center gap-1">
                          <ArrowPathRoundedSquareIcon className="w-6 h-6 text-sky-300" />
                          <span className="text-[10px] text-sky-200">Branch</span>
                        </div>
                        {/* Commit */}
                        <div className="flex flex-col items-center gap-1">
                          <HashtagIcon className="w-6 h-6 text-sky-300" />
                          <span className="text-[10px] text-sky-200">Commit</span>
                        </div>
                      </div>
                      {/* Group label – moved above icons */}
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full text-sky-200 text-xs font-semibold text-nowrap">Source Snapshot</span>
                    </div>

                    {/* Attachemesn half */}
                    <div
                      onMouseEnter={() => setHighlightGroup('evidenceDocuments')}
                      onMouseLeave={() => setHighlightGroup(null)}
                      className="relative flex flex-col justify-center items-center p-3 rounded-md border border-sky-400/15 "
                    >
                      <div className="grid grid-cols-2 gap-3">
                        {/* Issues & PRs */}
                        <div className="flex flex-col items-center gap-1">
                          <PencilSquareIcon className="w-6 h-6 text-sky-300" />
                          <span className="text-[10px] text-sky-200 text-center text-nowrap">Issue, PR</span>
                        </div>
                        {/* Multi-Modal Files */}
                        <div className="flex flex-col items-center gap-1">
                          <PaperClipIcon className="w-6 h-6 text-sky-300" />
                          <span className="text-[10px] text-sky-200 text-center">Files</span>
                        </div>
                        {/* URLs */}
                        <div className="flex flex-col items-center gap-1">
                          <LinkIcon className="w-6 h-6 text-sky-300" />
                          <span className="text-[10px] text-sky-200">URLs</span>
                        </div>
                        {/* Integrations */}
                        <div className="flex flex-col items-center gap-1">
                          <SquaresPlusIcon className="w-6 h-6 text-sky-300" />
                          <span className="text-[10px] text-sky-200 text-center">Connects</span>
                        </div>
                      </div>
                      {/* Group label – moved above icons */}
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full text-sky-200 text-xs font-semibold">Attachments</span>
                    </div>
                  </div>

                  {/* Floating thumbnails – Step 2: replicate original 2×2 with only lower row visible */}
                  {Array.from({ length: 4 }).map((_, idx) => {
                    const shot = step2Screens[idx % step2Screens.length];
                    const positions = [
                      'absolute left-1/4 -translate-x-1/2 bottom-14 w-32 h-20 invisible',
                      'absolute left-3/4 -translate-x-1/2 bottom-14 w-32 h-20 invisible',
                      'absolute left-1/4 -translate-x-1/2 -bottom-8 w-32 h-16',
                      'absolute left-3/4 -translate-x-1/2 -bottom-8 w-32 h-16',
                    ];
                    return (
                      <div
                        key={shot.id + idx}
                        className={`${positions[idx]} pointer-events-auto hover:scale-[1.06] transition-transform`}
                        style={{ filter: 'drop-shadow(0 0 12px rgba(56,189,248,0.55))' }}
                      >
                        <MarketingThumbnailStack
                          images={[shot.src]}
                          onThumbClick={() => openGallery(step2Screens, idx % step2Screens.length)}
                          pad={false}
                          className="!w-full !h-full grid grid-cols-1 !grid-rows-1 gap-0 border border-slate-700 rounded-md shadow-lg"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* ------------------------ STEP 3 – varied design -------------- */}
                <div className="relative p-6 rounded-lg border border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-400/10 to-black/10 backdrop-blur-sm flex flex-col overflow-visible min-w-0">
                  <div className="flex items-center mb-3">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-fuchsia-500/25 text-fuchsia-300 font-bold mr-3">
                      3
                    </span>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-fuchsia-300 to-pink-400 bg-clip-text text-transparent">Receive</h3>
                  </div>

                  {/* Step subtitle – ribbon along full top edge */}
                  <p
                    className="absolute -top-4 left-4 right-4 text-center text-[12px] laptop:text-sm font-medium text-fuchsia-100 leading-snug select-none pointer-events-none px-3 py-1 rounded-md bg-fuchsia-500/15 backdrop-blur-sm border border-fuchsia-400/30 shadow-md"
                  >
                    AssetPacks Finished Through Pull Requests
                  </p>
                  {/* AssetPack & evidence documents grouped tags */}
                  <div className="space-y-4 mt-1 text-xs">
                    {/* AssetPack group */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-300 select-none text-left mb-3">
                        AssetPack
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { label: 'PR Shippable', icon: CodeBracketIcon, cls: 'bg-blue-600/20 text-blue-200 border-blue-500/40' },
                          { label: 'Code Changes', icon: DocumentTextIcon, cls: 'bg-yellow-600/20 text-yellow-200 border-yellow-500/40' },
                          { label: 'Proof Receipts', icon: ClipboardDocumentCheckIcon, cls: 'bg-emerald-600/20 text-emerald-200 border-emerald-500/40' },
                        ].map(({ label, icon: Icon, cls }) => (
                          <span
                            key={label}
                            className={`relative inline-flex items-center pr-4 pl-6 py-1.5 rounded-md border text-sm leading-tight whitespace-nowrap ${cls}`}
                          >
                            <Icon className="absolute -top-3 -left-3 w-6 h-6 p-1 rounded-full bg-black/70 shadow-md pointer-events-none" />
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Evidence Documents group */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-300 select-none text-left mb-3">
                        Evidence Documents
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { label: 'MCP APIs', icon: WrenchScrewdriverIcon, cls: 'bg-indigo-600/20 text-indigo-200 border-indigo-500/40' },
                          { label: 'Extensions', icon: PuzzlePieceIcon, cls: 'bg-purple-600/20 text-purple-200 border-purple-500/40' },
                          { label: 'Feedback', icon: MegaphoneIcon, cls: 'bg-pink-600/20 text-pink-200 border-pink-500/40' },
                        ].map(({ label, icon: Icon, cls }) => (
                          <span
                            key={label}
                            className={`relative inline-flex items-center pr-4 pl-6 py-1.5 rounded-md border text-sm leading-tight whitespace-nowrap ${cls}`}
                          >
                            <Icon className="absolute -top-3 -left-3 w-6 h-6 p-1 rounded-full bg-black/70 shadow-md pointer-events-none" />
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Floating thumbnails – Step 3: replicate original diagonal stack */}
                  {step3Screens.slice(0, 4).map((shot, idx) => {
                    const positions = [
                      'absolute left-1/4 -translate-x-1/2 -bottom-5 w-32 h-20 invisible',
                      'absolute left-[66%] -translate-x-1/2 -bottom-5 w-32 h-16',
                      // Center-right thumbnail – pull inward on small screens so it doesn’t overflow
                      'absolute right-4 laptop:-right-2 top-[17%] laptop:top-[55%] -translate-y-1/2 w-32 h-16 laptop:translate-x-1/2',
                      'absolute right-4 translate-x-1/4 top-6 w-32 h-16',
                    ];
                    return (
                      <div
                        key={shot.id}
                        className={`${positions[idx]} pointer-events-auto hover:scale-[1.06] transition-transform`}
                        style={{ filter: 'drop-shadow(0 0 12px rgba(232,121,249,0.55))' }}
                      >
                        <MarketingThumbnailStack
                          images={[shot.src]}
                          onThumbClick={() => openGallery(step3Screens, idx)}
                          pad={false}
                          className="!w-full !h-full grid grid-cols-1 !grid-rows-1 gap-0 border border-slate-700 rounded-md shadow-lg"
                        />
                      </div>
                    );
                  })}
                </div>


              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>
      {/* Full-screen gallery modal */}
      {activeScreens && (
        <MarketingFullScreenGallery
          screenshots={activeScreens}
          isOpen={Boolean(activeScreens)}
          initialIndex={initialSlide}
          onClose={closeGallery}
        />
      )}
    </>
  );
};

export default MarketingScreenshotSection;
