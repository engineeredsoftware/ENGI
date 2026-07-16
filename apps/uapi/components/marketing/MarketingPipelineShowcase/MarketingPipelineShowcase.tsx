"use client";

import React, { useMemo, useState } from 'react';
import { NavProcessingIndicator } from '@/components/bitcode/indicators/NavProcessingIndicator/NavProcessingIndicator';
// Animation helpers
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

// -----------------------------------------------------------------------------
// Animation Variants (shared across renders)
// -----------------------------------------------------------------------------

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.03,
    },
  },
  exit: {
    transition: { staggerChildren: 0.06, staggerDirection: -1 },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.32, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    opacity: 0,
    y: -15,
    scale: 0.97,
    transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] },
  },
} as const;
import MarketingSectionWrapper from '@/components/marketing/MarketingSectionWrapper/MarketingSectionWrapper';
import MarketingPlaceholderImage from '@/components/marketing/MarketingPlaceholderImage/MarketingPlaceholderImage';
import RevealingSoonOverlay from '@/components/bitcode/overlays/RevealingSoonOverlay/RevealingSoonOverlay';

// Heroicons
import {
  LinkIcon,
  RectangleGroupIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

// -----------------------------------------------------------------------------
// MARKETING PIPELINE SHOWCASE
// -----------------------------------------------------------------------------

// NOTE:  We maintain a very simple data-model that lets the marketing team
//        tweak copy without touching any of the rendering logic.
//        For each phase we guarantee:
//          • Exactly ONE `step` (high-level action)
//          • A list of `roles` actively involved in the phase
//          • Zero-or-more `tools` utilised by those roles
//          • Several `metaSteps`, each with its own `subSteps`
// -----------------------------------------------------------------------------

type Phase = {
  id: string;
  title: string;
  description: string;
  step: string; // single, high-level pipeline step
  roles: string[];
  tools: string[];
  metaSteps: {
    id: string;
    title: string;
    subSteps: string[];
  }[];
};

const phases: Phase[] = [
  {
    id: 'setup',
    title: 'Setup',
    description:
      'Bitcode analyzes your repository, understanding your code structure and patterns.',
    step: 'Plan',
    roles: ['Architecture', 'Research'],
    tools: ['Git Clone', 'Context Preparer'],
    metaSteps: [
      {
        id: 'setup-1',
        title: 'Repo & Environment',
        subSteps: ['Ingest', 'Digest', 'Iterate'],
      },
      {
        id: 'setup-2',
        title: 'Codebase Intelligence',
        subSteps: ['Multi-Model'],
      },
      {
        id: 'setup-3',
        title: 'Context Preparation',
        subSteps: ['Improbable Short-Circuits'],
      },
    ],
  },
  {
    id: 'discovery',
    title: 'Discovery',
    description:
      'Bitcode explores your requirements, researches solutions, and plans the approach.',
    step: 'Generate',
    roles: ['Research'],
    tools: ['Web Crawler', 'Snippet Collector'],
    metaSteps: [
      {
        id: 'discovery-1',
        title: 'Requirement Extraction',
        subSteps: ['Codebase Mastery'],
      },
      {
        id: 'discovery-2',
        title: 'Knowledge Gathering',
        subSteps: ['Deep Research'],
      },
      {
        id: 'discovery-3',
        title: 'Relevance Mapping',
        subSteps: ['Large Knowledge'],
      },
    ],
  },
  {
    id: 'implementation',
    title: 'Implementation',
    description: 'Bitcode writes code, tests, and documentation matching standards.',
    step: 'Refine',
    roles: ['Implementation'],
    tools: ['Codegen Engine', 'Formatter'],
    metaSteps: [
      {
        id: 'impl-1',
        title: 'Code Generation',
        subSteps: ['Editing Fallbacks'],
      },
      {
        id: 'impl-2',
        title: 'Integration & Refactor',
        subSteps: ['Style Cohesion'],
      },
      {
        id: 'impl-3',
        title: 'Quality Polishing',
        subSteps: ['Non-Invasive'],
      },
    ],
  },
  {
    id: 'validation',
    title: 'Validation',
    description:
      'Bitcode verifies the solution via testing, reviews, and quality checks.',
    step: 'Judge',
    roles: ['Validation', 'Security'],
    tools: ['Test Runner', 'Security Scanner'],
    metaSteps: [
      {
        id: 'valid-1',
        title: 'Automated Quality Gates',
        subSteps: ['Testing & Documentation'],
      },
      {
        id: 'valid-2',
        title: 'Review & Security',
        subSteps: ['Finish Decision'],
      },
      {
        id: 'valid-3',
        title: 'Final QA',
        subSteps: ['QA'],
      },
    ],
  },
  {
    id: 'finish',
    title: 'Finish',
    description:
      'Bitcode stores AssetPack evidence, journals the run, and closes synthesis. Buyer-repo PR delivery is settle after pay — not Finish.',
    step: 'Close synthesis',
    roles: ['Evidence', 'Journal'],
    tools: ['Artifact store', 'BTD journal'],
    metaSteps: [
      {
        id: 'finish-1',
        title: 'Store artifacts',
        subSteps: ['AssetPack options'],
      },
      {
        id: 'finish-2',
        title: 'Ledgerize',
        subSteps: ['Journal entries'],
      },
      {
        id: 'finish-3',
        title: 'Selection envelope',
        subSteps: ['Ready for settle'],
      },
    ],
  },
];

export default function MarketingPipelineShowcase() {
  const prefersReducedMotion = useReducedMotion();

  const [activePhase, setActivePhase] = useState(phases[0].id);
  const phase = useMemo(() => phases.find((p) => p.id === activePhase)!, [activePhase]);

  // Reused class names (SRP/DRY) – no visual change
  const tabsContainer = "inline-flex bg-[#1f2937]/30 rounded-md border border-[#1f2937] overflow-hidden";
  const legendPill = "flex items-center gap-2 px-2 py-1 bg-[#1f2937]/50 text-gray-400 rounded";
  const metaCard = "bg-[#030816]/40 border border-[#1f2937] rounded-md p-3 transition-colors duration-200 shadow-sm hover:shadow-md";

  return (
    <MarketingSectionWrapper id="features" className="pt-6 tablet:pt-8 laptop:pt-10 desktop:pt-12">
      {/* ------------------------------------------------------------- */}
      {/* Headline                                                       */}
      {/* ------------------------------------------------------------- */}
      <div className="text-center mb-16">
        {/* Increased bottom margin for better separation from the subtitle */}
        <h2 className="text-2xl laptop:text-3xl font-bold text-white mb-4 tracking-tight block super-shiny-text">
          Under the Hood: Read-to-AssetPack Pipeline
        </h2>
        <p className="text-base laptop:text-lg text-gray-400 max-w-2xl mx-auto">
          Explore how Bitcode measures Reads, searches for fit, synthesizes AssetPacks, validates evidence, and delivers reviewable PR-backed work through connected interfaces.
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Phase Tabs                                                    */}
      {/* ------------------------------------------------------------- */}
      <div className="flex justify-center mb-8">
        <div className={tabsContainer}>
          {phases.map((p) => (
            <button
              key={p.id}
              className={`px-4 py-2 text-xs font-mono transition-all ${p.id === activePhase
                ? 'bg-[#1f2937] text-emerald-400'
                : 'text-gray-400 hover:bg-[#1f2937]/50'
                }`}
              onClick={() => setActivePhase(p.id)}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Legend                                                         */}
      {/* ------------------------------------------------------------- */}
      <div className="flex justify-center gap-6 mb-6">
        {/* Step */}
        <div className={legendPill}>
          <LinkIcon className="h-5 w-5 text-emerald-400" />
          <span className="text-xs">Steps</span>
        </div>
        {/* Roles */}
        <div className={legendPill}>
          <UserGroupIcon className="h-5 w-5 text-amber-400" />
          <span className="text-xs">Roles</span>
        </div>
        {/* Meta / Sub-Step */}
        <div className={legendPill}>
          <RectangleGroupIcon className="h-5 w-5 text-purple-400" />
          <span className="text-xs">Meta-/Sub Steps</span>
        </div>
        {/* Tools */}
        <div className={legendPill}>
          <WrenchScrewdriverIcon className="h-5 w-5 text-sky-400" />
          <span className="text-xs">Tools</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Main Content                                                 */}
      {/* ------------------------------------------------------------- */}
      {/* Container + animation wrapper */}
      <div className="relative">
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePhase}
              variants={prefersReducedMotion ? undefined : containerVariants}
              initial={prefersReducedMotion ? false : 'hidden'}
              animate={prefersReducedMotion ? undefined : 'show'}
              exit={prefersReducedMotion ? undefined : 'exit'}
            >
              <div className="grid grid-cols-1 desktop:grid-cols-2 gap-8 items-stretch">
                {/* Left column – details */}
                <motion.div
                  variants={prefersReducedMotion ? undefined : cardVariants}
                  className="bg-[#1f2937]/30 border border-[#1f2937] rounded-md p-6 flex flex-col overflow-hidden h-full"
                >
                  {/* Phase title & description */}
                  <h3 className="text-lg font-mono font-medium text-white mb-2">
                    {phase.title}
                  </h3>
                  <p className="text-gray-400 mb-4">{phase.description}</p>

                  {/* Step + roles + tools badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {/* STEP */}
                    <span className="flex items-center gap-1 px-2 py-1 bg-[#1f2937]/50 text-xs text-emerald-400 rounded">
                      <LinkIcon className="h-4 w-4" />
                      {phase.step}
                    </span>

                    {/* ROLES */}
                    {phase.roles.map((role) => (
                      <span
                        key={role}
                        className="flex items-center gap-1 px-2 py-1 bg-[#1f2937]/50 text-xs text-amber-400 rounded shadow-sm"
                      >
                        <UserGroupIcon className="h-4 w-4" />
                        {role}
                      </span>
                    ))}

                    {/* TOOLS */}
                    {phase.tools.map((tool) => (
                      <span
                        key={tool}
                        className="flex items-center gap-1 px-2 py-1 bg-[#1f2937]/50 text-xs text-sky-400 rounded shadow-sm"
                      >
                        <WrenchScrewdriverIcon className="h-4 w-4" />
                        {tool}
                      </span>
                    ))}
                  </div>

                  {/* Meta-Steps & Sub-Steps grid */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
                      {phase.metaSteps.map((meta, idx) => {
                        // accent colour per meta-step for a bit of visual flair
                        const borderColor =
                          idx === 0
                            ? 'border-l-4 border-l-emerald-400'
                            : idx === 1
                              ? 'border-l-4 border-l-purple-400'
                              : 'border-l-4 border-l-blue-400';

                        return (
                          <div
                            key={meta.id}
                            className={`${metaCard} hover:bg-[#1f2937]/30 ${borderColor}`}
                          >
                            {/* Meta-step title */}
                            <h5 className="text-xs font-semibold text-white mb-1">
                              {meta.title}
                            </h5>

                            {/* Sub-steps list with colored dot bullets */}
                            <ul className="list-none text-xs space-y-1">
                              {meta.subSteps.map((sub) => (
                                <li key={sub} className="flex items-center gap-2">
                                  <NavProcessingIndicator className="scale-50" />
                                  <span className="text-gray-300">{sub}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Roles & tools sections removed - now shown in top badge row */}
                </motion.div>

                {/* Right column – image placeholder + caption (stack) */}
                <motion.div variants={prefersReducedMotion ? undefined : cardVariants} className="w-full flex flex-col h-full">
                  <motion.div variants={prefersReducedMotion ? undefined : cardVariants} className="relative flex-1">
                    <MarketingPlaceholderImage
                      type="component"
                      category={phase.id}
                      text={phase.title}
                      stretch
                      className="w-full h-full object-cover rounded-md border border-[#1f2937]"
                    />
                    <RevealingSoonOverlay />
                  </motion.div>
                  <motion.div
                    variants={prefersReducedMotion ? undefined : cardVariants}
                    className="mt-4 bg-[#1f2937]/30 border border-[#1f2937] rounded-md p-4 text-gray-400 text-sm"
                  >
                    <h4 className="text-xs text-emerald-300 mb-1 font-mono">Screenshot</h4>
                    <p>
                      Preview of the <span className="font-semibold text-white">{phase.title}</span>{' '}
                      phase in action.
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {/* --- */}
    </MarketingSectionWrapper>
  );
}
