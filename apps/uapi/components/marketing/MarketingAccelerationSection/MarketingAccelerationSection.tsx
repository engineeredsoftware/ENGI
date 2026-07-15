"use client";

/**
 * Acceleration gains section (quality, speed, cost).
 * Thumbnail strip and edu DocBox are co-located subcomponents.
 */

import React, { useState, useRef, useMemo } from 'react';
import styles from './marketing-acceleration-section.module.css';
import MarketingSectionWrapper from '@/components/marketing/MarketingSectionWrapper/MarketingSectionWrapper';
import '../../../styles/marketing-orbital-rings.css';
import {
  DocumentTextIcon,
  CodeBracketIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  WrenchScrewdriverIcon,
  MegaphoneIcon,
  PuzzlePieceIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';

/* AccelerationSection – Highlights the parallelizable acceleration gains across quality, speed, and cost. */
import { NavProcessingIndicator } from '@/components/bitcode/indicators/NavProcessingIndicator/NavProcessingIndicator';
import dynamic from 'next/dynamic';

// Load heavy gallery code on demand only
const MarketingFullScreenGallery = dynamic(() => import('@/components/marketing/MarketingFullScreenGallery/MarketingFullScreenGallery'), { ssr: false });

import type { Screenshot } from '@/components/marketing/MarketingTypes/marketing-types';
import MarketingPlaceholderImage from '@/components/marketing/MarketingPlaceholderImage/MarketingPlaceholderImage';
import MarketingThumbnailStack from '@/components/marketing/MarketingThumbnailStack/MarketingThumbnailStack';
// Small two-row thumbnail strip used in the Acceleration Gains grid
// SRP: dedicated ThumbnailStrip (unchanged visuals)

import { MarketingAccelerationThumbnailStrip as ThumbnailStrip } from './MarketingAccelerationThumbnailStrip';
import { MarketingAccelerationDocBox as DocBox } from './MarketingAccelerationDocBox';

const MarketingAccelerationSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isSectionVisible = useInView(sectionRef, {
    margin: '0px 0px -25% 0px',
    once: false,
  });
  // ---------------------------------------------------------------------------
  // Local state
  // ---------------------------------------------------------------------------

  // Fullscreen gallery modal controls
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStart, setGalleryStart] = useState(0);
  const [thumbErrors, setThumbErrors] = useState<Record<string, boolean>>({});

  // Top-level group descriptions for hover info
  const groupDescriptions: Record<string, string> = useMemo(() => ({
    AssetPacks: 'From Read evidence through merge-ready, CI-validated code and proof receipts, Bitcode finishes work as a PR-backed AssetPack.',
    'Evidence Documents': 'Evidence-driven system refinement: Bitcode ingests developer and user signals, orchestrates MCP integrations, and applies domain-specific Extensions so each iteration aligns with real-world results.',
  }), []);

  // AssetPack items for hover and EduBox content
  const items = useMemo(() => [
    {
      name: 'Design Doc',
      icon: DocumentTextIcon,
      color: 'text-yellow-400',
      description: 'Generate versioned design specs with diagrams and decision logs in seconds.',
    },
    {
      name: 'Source Code',
      icon: CodeBracketIcon,
      color: 'text-blue-400',
      description: 'Auto-generate merge-ready, fully tested code with typed definitions and integrated telemetry.',
    },
    {
      name: 'Proof Receipts',
      icon: ChatBubbleLeftRightIcon,
      color: 'text-gray-400',
      description: 'Attach source-bearing proof, validation, and operator-visible receipts to the AssetPack.',
    },
    {
      name: 'PR Shippable',
      icon: ClipboardDocumentCheckIcon,
      color: 'text-emerald-400',
      description: 'Finish with a connected-interface pull request instead of parallel comment, issue, or review outputs.',
    },
    // Evidence Documents
    {
      name: 'Feedback',
      icon: MegaphoneIcon,
      color: 'text-pink-400',
      description: 'Capture and prioritize developer and user signals via a structured memory graph.',
    },
    {
      name: 'MCP',
      icon: WrenchScrewdriverIcon,
      color: 'text-indigo-400',
      description: 'Control Bitcode workflows via a schema-validated API, orchestrating work and exporting results.',
    },
    {
      name: 'Extension',
      icon: PuzzlePieceIcon,
      color: 'text-purple-400',
      description: 'Auto-apply code patterns via Extensions for consistent standards and maintainable modules.',
    }
  ], []);
  const defaultEdu = { title: items[0].name, body: items[0].description };
  const [activeEdu, setActiveEdu] = useState<{ title: string; subtitle?: string; body: string }>(defaultEdu);

  // Reused class constants (SRP/DRY) – no visual change
  const gridCardClass = "relative rounded-xl border border-emerald-500/20 bg-black/40 backdrop-blur-sm overflow-hidden";
  const statPillClass = "inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] tracking-wide border border-emerald-500/30 text-emerald-300 bg-emerald-500/10";
  // Content mappings for stats & thumbnails per feature
  const featureMeta: Record<
    string,
    { stats?: string[]; images?: string[] }
  > = useMemo(() => ({
    'Design Doc': {
      stats: ['Deep Research', 'Deep Reasoning'],
      images: ['/screenshots/design-doc-1.png', '/screenshots/design-doc-2.png']
    },
    'Source Code': {
      stats: ['1000x Production Volume', '1/1000 Production Cost'],
      images: ['/screenshots/code-1.png', '/screenshots/code-2.png']
    },
    'Proof Receipts': {
      stats: ['Deep Research', 'Deep Reasoning'],
      images: ['/screenshots/comments-1.png']
    },
    'PR Shippable': {
      stats: ['1000x Faster Response'],
      images: ['/screenshots/review-1.png', '/screenshots/review-2.png']
    },
    Feedback: {
      stats: ['2–10x Performance Gain'],
      images: ['/screenshots/prompt-1.png']
    },
    MCP: {
      stats: ['1000s Connections'],
      images: ['/screenshots/mcp-1.png']
    },
    Extension: {
      stats: ['90%+ Fewer Stale-System Hallucinations'],
      images: ['/screenshots/knowledge-1.png']
    }
  }), []);

  // Animation variants for staggered stats entry/exit
  const statsContainerVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 12 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: [0.23, 1, 0.32, 1],
        staggerChildren: 0.12,
        delayChildren: 0.05,
        staggerDirection: 1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 12,
      transition: {
        duration: 0.25,
        ease: 'easeInOut',
        staggerChildren: 0.08,
        staggerDirection: -1
      }
    }
  } as const;

  const statItemVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.85 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    },
    exit: {
      opacity: 0,
      y: -16,
      scale: 0.85,
      transition: { duration: 0.25, ease: 'easeInOut' }
    }
  } as const;

  const activeFeature = activeEdu?.title ?? '';
  return (
    <>
      <div ref={sectionRef} className="contents">
        <MarketingSectionWrapper
          id="acceleration"
          className="pt-14 tablet:pt-16 laptop:pt-20 desktop:pt-24 pb-14 tablet:pb-16 laptop:pb-20 desktop:pb-24"
          style={{ contain: 'layout style' }}
        >
          <div className="text-center mb-12">
            {/* Increased bottom margin for better separation from the subtitle */}
            <h2 className="text-2xl laptop:text-3xl font-bold text-white mb-4 tracking-tight block super-shiny-text">
              Supercharge Read-to-AssetPack Workflows
            </h2>
            <p className="text-base laptop:text-lg text-gray-400 max-w-2xl mx-auto">
              Measure Reads, synthesize AssetPacks, and ship production-ready iterations through connected review interfaces.
            </p>
          </div>
          {/*
          AssetPacks & evidence documents icon row

          The original single-row layout is preserved but now split into two subtly
          highlighted groups:

          • The first four items are wrapped in a bordered container labelled
            "AssetPacks".
          • The last three items are wrapped in a bordered container labelled
            "Evidence Documents".

          Both wrappers share the same gap spacing so the overall arrangement and
          responsive behaviour remain unchanged.
        */}
          <div className="flex flex-wrap justify-center gap-8 mb-16 relative z-10">
            {/* AssetPacks */}
            <div className="flex gap-8 relative px-6 py-4 rounded-xl border border-purple-400/25">
              <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center px-2 bg-[#020617] text-[10px] font-semibold uppercase tracking-wider text-purple-300 cursor-pointer"
                onMouseEnter={() => setActiveEdu({ title: 'AssetPacks', body: groupDescriptions.AssetPacks })}
              >
                <InformationCircleIcon className="w-3 h-3 mr-1 text-purple-300" />
                AssetPacks
              </div>
              {items.slice(0, 4).map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col items-center w-20 cursor-pointer"
                  onMouseEnter={() => setActiveEdu({ title: item.name, body: item.description })}
                >
                  <item.icon className={`${item.color} w-6 h-6 mb-2`} />
                  <span className="text-xs text-gray-300 text-center">{item.name}</span>
                </div>
              ))}
            </div>

            {/* Evidence Documents */}
            <div className="flex gap-8 relative px-6 py-4 rounded-xl border border-emerald-400/25">
              <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center px-2 bg-[#020617] text-[10px] font-semibold uppercase tracking-wider text-emerald-300 cursor-pointer"
                onMouseEnter={() => setActiveEdu({ title: 'Evidence Documents', body: groupDescriptions['Evidence Documents'] })}
              >
                <InformationCircleIcon className="w-3 h-3 mr-1 text-emerald-300" />
                Evidence Documents
              </div>
              {items.slice(4).map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col items-center w-20 cursor-pointer"
                  onMouseEnter={() => setActiveEdu({ title: item.name, body: item.description })}
                >
                  <item.icon className={`${item.color} w-6 h-6 mb-2`} />
                  <span className="text-xs text-gray-300 text-center">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
          {/* 2×3 grid: Cheaper, Edu box, Better & their extras */}
          <div className="relative">
            {/* Background orbital rings - Marketing specific */}
            <div className="marketing-orbital-container">
              <div
                className="marketing-orbital-ring marketing-orbital-ring-large border-2 border-emerald-400/40"
                style={{ animation: isSectionVisible ? 'marketing-orbital-pulse 22s infinite linear' : 'none' }}
              />
              <div
                className="marketing-orbital-ring marketing-orbital-ring-medium border-2 border-blue-400/40"
                style={{ animation: isSectionVisible ? 'marketing-orbital-pulse 16s infinite linear reverse' : 'none' }}
              />
              <div
                className="marketing-orbital-ring marketing-orbital-ring-small border-2 border-yellow-400/40"
                style={{ animation: isSectionVisible ? 'marketing-orbital-pulse 12s infinite linear' : 'none' }}
              />
            </div>
            {/* Connection line */}
            <div className="absolute top-1/2 left-6 right-6 h-[2px] bg-[#1f2937]" />
            {/* Tight 2 × 3 information grid */}
            <div className="grid grid-cols-2 grid-rows-3 gap-4 laptop:grid-cols-3 laptop:grid-rows-2 laptop:gap-6 relative z-10 px-4 laptop:px-0 max-w-6xl mx-auto">
              {/* Row 1 */}
              {/* Cheaper card cell */}
              <div className="relative flex justify-center items-center col-start-1 row-start-1 overflow-visible aspect-video">
                {/* Mobile-only floating header */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 tablet:hidden pointer-events-none">
                  <span className="inline-flex items-center rounded-full bg-emerald-300 text-gray-900 text-[12px] font-semibold px-4 py-0.5 whitespace-nowrap shadow">
                    Cheap Code
                  </span>
                </div>

                <div className="card text-center flex flex-col items-center justify-center px-2 py-4 tablet:px-4 tablet:py-6 rounded-lg bg-[#0f172a]/60 w-full h-full space-y-0 tablet:space-y-4 shadow-xl">
                  {/* Default header hidden on very small screens */}
                  <div className="flex items-center space-x-4 hidden tablet:flex">
                    <div className="transform scale-150">
                      <NavProcessingIndicator />
                    </div>
                    <h3 className={`text-xl font-semibold text-white ${styles.neon}`}>Cheap Code</h3>
                  </div>
                  <p className="text-gray-300 max-w-xs text-[13px] tablet:text-sm laptop:text-base leading-relaxed">
                    Automates keystrokes in parallel, freeing you to focus on creative ideas instead of typing.
                  </p>
                </div>
                {/* empty spacer */}
              </div>

              {/* Stats cell (row 2, col 1) – flows & animates more dynamically */}
              <div className="flex justify-center items-center col-start-1 row-start-2 overflow-hidden aspect-video">
                <AnimatePresence mode="wait">
                  {featureMeta[activeFeature]?.stats && (
                    <motion.div
                      key={activeFeature + '-stats'}
                      variants={statsContainerVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className={`grid ${featureMeta[activeFeature].stats!.length > 1 ? 'grid-cols-2 gap-4' : 'grid-cols-1'
                        } w-full h-full place-items-center p-0`}
                    >
                      {featureMeta[activeFeature].stats!.map((stat) => {
                        const match = stat.match(/^(.*?)(?:\s+)(.+)$/);
                        const value = match ? match[1] : stat;
                        const label = match ? match[2] : '';

                        return (
                          <motion.div
                            key={stat}
                            variants={statItemVariants}
                            className="flex flex-col items-center justify-center bg-emerald-400/5 backdrop-blur-sm rounded-lg shadow-lg w-full h-full p-3"
                          >
                            <span className="text-3xl laptop:text-4xl font-extrabold tracking-tight text-emerald-300 drop-shadow-sm">
                              {value}
                            </span>
                            {label && (
                              <span className="mt-1 text-[0.7rem] laptop:text-xs font-medium uppercase tracking-wider text-gray-300 whitespace-pre-line text-center">
                                {label}
                              </span>
                            )}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Thumbnails cell (row 2, col 3) */}
              <div className="relative overflow-hidden aspect-video laptop:col-start-3 laptop:row-start-2">
                <AnimatePresence mode="wait">
                  {featureMeta[activeFeature]?.images && (
                    <motion.div
                      key={activeFeature + '-images'}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0"
                    >
                      <ThumbnailStrip
                        images={featureMeta[activeFeature].images!}
                        onThumbClick={(idx) => {
                          const imgs = featureMeta[activeFeature].images ?? [];
                          const safeIndex = imgs.length ? idx % imgs.length : 0;
                          setGalleryStart(safeIndex);
                          setGalleryOpen(true);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Fullscreen modal placed outside animated block to avoid remount flicker */}
                {/*
              FullScreenGallery is only mounted when the modal should be visible.
              This prevents the component from rendering its built-in preview
              thumbnails (which caused a duplicate set to appear beneath the
              custom ThumbnailStrip).
            */}
                {featureMeta[activeFeature]?.images && galleryOpen && (
                  <MarketingFullScreenGallery
                    screenshots={featureMeta[activeFeature].images!.map((s, idx) => ({
                      id: `${activeFeature}-${idx}`,
                      src: s,
                      alt: `${activeFeature} screenshot ${idx + 1}`,
                      type: 'component',
                      category: 'rich_text',
                      revealingSoon: true
                    })) as Screenshot[]}
                    isOpen={galleryOpen}
                    onClose={() => setGalleryOpen(false)}
                    initialIndex={galleryStart}
                  />
                )}
              </div>

              {/* Better card cell */}
              <div className="relative flex justify-center items-center overflow-visible aspect-video laptop:col-start-3 laptop:row-start-1">
                {/* Mobile-only floating header */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 tablet:hidden pointer-events-none">
                  <span className="inline-flex items-center rounded-full bg-sky-300 text-gray-900 text-[12px] font-semibold px-4 py-0.5 whitespace-nowrap shadow">
                    Evidence-Driven
                  </span>
                </div>

                <div className="card text-center flex flex-col items-center justify-center px-2 py-4 tablet:px-4 tablet:py-6 rounded-lg bg-[#0f172a]/60 w-full h-full space-y-0 tablet:space-y-4 shadow-xl">
                  <div className="flex items-center space-x-4 hidden tablet:flex">
                    <div className="transform scale-150">
                      <NavProcessingIndicator />
                    </div>
                    <h3 className={`text-xl font-semibold text-white ${styles.neon}`}>Evidence-Driven</h3>
                  </div>
                  <p className="text-gray-300 max-w-xs text-[13px] tablet:text-sm laptop:text-base leading-relaxed">
                    Digests code and external context to deliver automated fixes, patterns, and best practices.
                  </p>
                </div>

              </div>

              {/* Faster cell (center of bottom row) */}
              <div className="relative flex justify-center items-center col-start-2 row-start-2 overflow-visible aspect-video">
                {/* Mobile-only floating header */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 tablet:hidden pointer-events-none">
                  <span className="inline-flex items-center rounded-full bg-yellow-300 text-gray-900 text-[12px] font-semibold px-4 py-0.5 whitespace-nowrap shadow">
                    On-Demand
                  </span>
                </div>

                <div className="card text-center flex flex-col items-center justify-center px-2 py-4 tablet:px-4 tablet:py-6 rounded-lg bg-[#0f172a]/60 w-full h-full space-y-0 tablet:space-y-4 shadow-xl">
                  <div className="flex items-center space-x-4 hidden tablet:flex">
                    <div className="transform scale-150">
                      <NavProcessingIndicator />
                    </div>
                    <h3 className={`text-xl font-semibold text-white ${styles.neon}`}>On-Demand</h3>
                  </div>
                  <p className="text-gray-300 max-w-md text-[13px] tablet:text-sm laptop:text-base mx-auto leading-relaxed">
                    Cloud-based AI engineer that produces, fixes, and maintains code instantly at any scale.
                  </p>
                </div>
              </div>

              {/* EduDoc card fills entire square via absolute inset */}
              <div className="relative col-start-2 row-start-1 aspect-video overflow-visible">
                {/* Mobile-only floating header – shows current active education title */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 tablet:hidden pointer-events-none z-10">
                  <span className="inline-flex items-center rounded-full bg-purple-300 text-gray-900 text-[12px] font-semibold px-4 py-0.5 whitespace-nowrap shadow">
                    {activeEdu?.title}
                  </span>
                </div>

                <div className="absolute inset-0 card rounded-lg border-none flex flex-col justify-center shadow-xl">
                  <DocBox content={activeEdu} className="bg-[#0f172a]/60 w-full h-full" />
                </div>
              </div>
            </div>

            {/* Removed absolute EduDoc overlay – now sits in grid cell */}
          </div>
        </MarketingSectionWrapper>
      </div>
      {/* Styles moved to CSS Module */}
    </>
  );
}

export default MarketingAccelerationSection;
