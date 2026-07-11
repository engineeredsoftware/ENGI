/* eslint-disable react/no-multi-comp */

"use client";

import React, { useState } from "react";
import styles from './marketing-competitor-table-section.module.css';
import MarketingSectionWrapper from './MarketingSectionWrapper';
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  MinusCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { DisabledTooltipWrapper } from "@/components/bitcode/overlays/disabled-tooltip-wrapper";

import Logo from "@/components/bitcode/branding/logo";
import BitcodeSoftwareSvgLogo from "@/components/bitcode/branding/bitcode-software-svg-logo";


/**
 * The competitor comparison table for the marketing pages.
 *
 *  – Columns were updated to match the latest Bitcode positioning.
 *  – A fixed “edu/doc” panel swaps its copy on column hover to avoid cramped tooltips.
 *  – The Bitcode row is always shown first and highlighted.
 */

type Status = "✅" | "±" | "✖" | "⏳";

interface Row {
  name: string;
  values: Status[];
}

/* -------------------------------------------------------------------------- */
/* Base column order – will be dynamically re-sorted below so keep this tuple  */
/* immutable for type-safety & copy look-ups.                                  */
/* -------------------------------------------------------------------------- */

const COLUMNS = [
  "Deep Coding",
  "AssetPack Finish",
  "Parallel Workflows",
  "Shepherding at Scale",
  "Auto Agent Sequencing",
  "Deep Evolution",
  "Knowledge Procurement",
  "Data-Share Compensation",
  "Retail Aligned",
  "Local Interfaces",
  "Cloud Interfaces",
  "Pervasive Plugins",
  "Security & Compliance",
  "Self-Hosted",
] as const;

// The columns are re-ordered further down once the competitor matrix is in
// scope (we read the data to calculate presence counts).  Keep the base array
// here for type-safety only.

// Copy for EducationCard per column
interface DocBoxCopy {
  title: string;
  subtitle: string;
  description: string;
}

const COLUMN_INFO: Record<(typeof COLUMNS)[number], DocBoxCopy> = {
  "Deep Coding": {
    title: "Deep Coding",
    subtitle: "Full-Stack",
    description:
      "Multi-layer reasoning that traverses your entire repository graph—Bitcode architects, implements, refactors and self-tests until the feature is fully production-ready, not just a half-baked snippet.",
  },
  "AssetPack Finish": {
    title: "AssetPack Outputs",
    subtitle: "Complete Receipts",
    description:
      "From code diffs and tests to receipts, proofs, diagrams, and review notes, every accepted output is bundled as an AssetPack or connected-interface written asset.",
  },
  "Parallel Workflows": {
    title: "Bounded Inference",
    subtitle: "Proof-Visible",
    description:
      "Bitcode uses specified inference roles, phase boundaries, and proof-visible execution records instead of unbounded orchestration claims.",
  },
  "Shepherding at Scale": {
    title: "Source-to-Shares Control",
    subtitle: "Read to Settlement",
    description:
      "Review measured Reads, inspect fit qualities, and follow AssetPack settlement artifacts through the same source-to-shares control plane.",
  },
  "Auto Agent Sequencing": {
    title: "Specified Phases",
    subtitle: "Read Through Finish",
    description:
      "Bitcode runs explicit Read, fit, implementation, review, and Finish phases so operators can inspect the execution boundary instead of trusting hidden orchestration.",
  },
  "Deep Evolution": {
    title: "Deep Evolution",
    subtitle: "Continuous Improvement",
    description:
      "Closed-loop feedback from CI, runtime telemetry, proof receipts, and accepted AssetPacks improves inference behavior and code quality after every iteration.",
  },
  "Knowledge Procurement": {
    title: "Knowledge Procurement",
    subtitle: "Premium Data",
    description:
      "When knowledge is missing, Bitcode performs source-attributed discovery and binds findings into reviewable Read evidence before fitting begins.",
  },
  "Data-Share Compensation": {
    title: "Data-Share Compensation",
    subtitle: "Earn $BTD",
    description:
      "Opt in once and earn $BTD when admitted source evidence improves source-to-shares fit.",
  },
  "Retail Aligned": {
    title: "Retail Aligned",
    subtitle: "Investable Dataset",
    description:
      "Bitcode converts its compounding knowledge graph into source-backed shares. Holding $BTD captures upside as source evidence compounds, datasets expand, and technical demand accelerates.",
  },
  "Local Interfaces": {
    title: "Local Interfaces",
    subtitle: "On-Prem Setup",
    description:
      "Local interfaces require installing and configuring CLI tools and IDE plugins on each machine. Environments must be manually updated and managed, and compute capacity is limited by local hardware.",
  },
  "Cloud Interfaces": {
    title: "Cloud Interfaces",
    subtitle: "Web & API",
    description:
      "Rich browser UI, REST API and SaaS dashboard for remote, secure interaction with Bitcode from anywhere on the planet.",
  },
  "Pervasive Plugins": {
    title: "Pervasive Plugins",
    subtitle: "Infinite Integrations",
    description:
      "One-click extensions for CI/CD, observability, databases and every major dev tool in your stack.",
  },
  "Security & Compliance": {
    title: "Security & Compliance",
    subtitle: "Enterprise-Grade",
    description:
      "SOC-2, GDPR, RBAC and audit-grade logging keep your code and data protected at every scale.",
  },
  "Self-Hosted": {
    title: "Self-Hosted",
    subtitle: "Coming Soon",
    description:
      "Private-cloud and on-prem deployments (coming soon) deliver complete data sovereignty and air-gapped compliance.",
  },
};

/* -------------------------------------------------------------------------- */
/* Bitcode-specific highlight card copy                                       */
/* -------------------------------------------------------------------------- */

interface CrushCopy {
  headline: string;
  points: string[];
}

const BITCODE_CRUSH_COPY: Record<(typeof COLUMNS)[number], CrushCopy> = {
  "Deep Coding": {
    headline: "Ship Features, Not Snippets",
    points: [
      "Ingests millions of lines instantly",
      "Architect-to-commit in a single autonomous run",
      "Ships code that passes CI before you even review",
    ],
  },
  "AssetPack Finish": {
    headline: "One PR, All Assets",
    points: [
      "Docs, tests & configs auto-bundled",
      "Cross-checked across every file & test",
      "Zero manual hand-offs or stitching",
    ],
  },
  "Parallel Workflows": {
    headline: "Bounded Inference",
    points: [
      "Read-first inference stages",
      "Proof-visible execution records",
      "No unbounded agent claims",
    ],
  },
  "Shepherding at Scale": {
    headline: "Source-to-Shares Control",
    points: [
      "Reviewable Read measurement",
      "Live, step-level visibility",
      "Settlement-bound AssetPacks",
    ],
  },
  "Auto Agent Sequencing": {
    headline: "Specified Phases",
    points: [
      "Setup through Finish is explicit",
      "Fit review before settlement",
      "Proof receipts over ceremony",
    ],
  },
  "Deep Evolution": {
    headline: "Always Improving",
    points: [
      "Continuous fine-tuning per commit",
      "Telemetry-driven optimisation loops",
      "Zero manual re-training ever",
    ],
  },
  "Knowledge Procurement": {
    headline: "Data on Demand",
    points: [
      "Proprietary research fetch",
      "Live domain-specific data feeds",
      "Zero manual sourcing or waiting",
    ],
  },
  "Data-Share Compensation": {
    headline: "Build & Earn",
    points: [
      "Opt-in trace sharing for $BTD",
      "Transparent community revenue split",
      "Roadmap funded by your real-world use",
    ],
  },
  "Retail Aligned": {
    headline: "Own the Intelligence",
    points: [
      "$BTD data-share compensation",
      "Paid knowledge bound to supply ↔ demand",
      "Finite, stable, deflationary tokenomics",
    ],
  },
  "Local Interfaces": {
    headline: "Break the Local Bottleneck",
    points: [
      "Reading and writing code doesn't scale",
      "Local machines can't auto-scale or provision on-demand",
      "Cloud-native Bitcode workflows coordinate in real time, reducing manual maintenance",
    ],
  },
  "Cloud Interfaces": {
    headline: "Anywhere Access",
    points: [
      "Web UI & REST API",
      "Full SaaS dashboard & metrics",
      "Mobile-ready endpoints",
    ],
  },
  "Pervasive Plugins": {
    headline: "Plug & Play",
    points: [
      "CI/CD connectors",
      "Observability & tracing hooks",
      "Database, messaging & DevOps tools",
    ],
  },
  "Security & Compliance": {
    headline: "Enterprise Trust",
    points: [
      "SOC-2 & GDPR certified",
      "Granular RBAC & audit logs",
      "Private network / VPC support",
    ],
  },
  "Self-Hosted": {
    headline: "Full Data Control",
    points: [
      "On-prem deployment",
      "Private-cloud ready",
      "Customisable infra modules",
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* Competitor matrix – tweak values here to update the table                    */
/* -------------------------------------------------------------------------- */

type Column = (typeof COLUMNS)[number];

const COMPETITOR_DATA: Record<string, Record<Column, Status>> = {
  Bitcode: {
    "Deep Coding": "✅",
    "AssetPack Finish": "✅",
    "Parallel Workflows": "✅",
    "Shepherding at Scale": "✅",
    "Auto Agent Sequencing": "✅",
    "Deep Evolution": "✅",
    "Knowledge Procurement": "✅",
    "Data-Share Compensation": "✅",
    "Retail Aligned": "✅",
    "Local Interfaces": "✖",
    "Cloud Interfaces": "✅",
    "Pervasive Plugins": "✅",
    "Security & Compliance": "✅",
    "Self-Hosted": "⏳",
  },
  Codex: {
    "Deep Coding": "✅",
    "AssetPack Finish": "±",
    "Parallel Workflows": "✅",
    "Shepherding at Scale": "✖",
    "Auto Agent Sequencing": "✖",
    "Deep Evolution": "✖",
    "Knowledge Procurement": "✖",
    "Data-Share Compensation": "✖",
    "Retail Aligned": "✖",
    "Local Interfaces": "✅",
    "Cloud Interfaces": "✅",
    "Pervasive Plugins": "±",
    "Security & Compliance": "±",
    "Self-Hosted": "✖",
  },
  Cognition: {
    "Deep Coding": "✅",
    "AssetPack Finish": "✅",
    "Parallel Workflows": "✅",
    "Shepherding at Scale": "✖",
    "Auto Agent Sequencing": "✖",
    "Deep Evolution": "✖",
    "Knowledge Procurement": "✖",
    "Data-Share Compensation": "✖",
    "Retail Aligned": "✖",
    "Local Interfaces": "✖",
    "Cloud Interfaces": "✖",
    "Pervasive Plugins": "✖",
    "Security & Compliance": "✖",
    "Self-Hosted": "✖",
  },
  Copilot: {
    "Deep Coding": "✅",
    "AssetPack Finish": "✅",
    "Parallel Workflows": "✅",
    "Shepherding at Scale": "✖",
    "Auto Agent Sequencing": "✖",
    "Deep Evolution": "✖",
    "Knowledge Procurement": "✖",
    "Data-Share Compensation": "✖",
    "Retail Aligned": "✖",
    "Local Interfaces": "✅",
    "Cloud Interfaces": "✅",
    "Pervasive Plugins": "±",
    "Security & Compliance": "±",
    "Self-Hosted": "✖",
  },
  Cursor: {
    "Deep Coding": "✅",
    "AssetPack Finish": "✅",
    "Parallel Workflows": "✅",
    "Shepherding at Scale": "✖",
    "Auto Agent Sequencing": "±",
    "Deep Evolution": "✖",
    "Knowledge Procurement": "✖",
    "Data-Share Compensation": "✖",
    "Retail Aligned": "✖",
    "Local Interfaces": "✅",
    "Cloud Interfaces": "✖",
    "Pervasive Plugins": "±",
    "Security & Compliance": "✖",
    "Self-Hosted": "✖",
  },
  Lovable: {
    "Deep Coding": "✅",
    "AssetPack Finish": "✖",
    "Parallel Workflows": "✅",
    "Shepherding at Scale": "✖",
    "Auto Agent Sequencing": "✖",
    "Deep Evolution": "✖",
    "Knowledge Procurement": "✖",
    "Data-Share Compensation": "✖",
    "Retail Aligned": "✖",
    "Local Interfaces": "✖",
    "Cloud Interfaces": "✅",
    "Pervasive Plugins": "✖",
    "Security & Compliance": "✖",
    "Self-Hosted": "✖",
  },
};

/* -------------------------------------------------------------------------- */
/* Dynamically rank columns by competitor coverage                             */
/* -------------------------------------------------------------------------- */

// Helper: count how many competitors (excluding Bitcode) offer a given feature.
const competitorNames = Object.keys(COMPETITOR_DATA).filter((n) => n !== "Bitcode");

const columnGreenCount: Record<Column, number> = (COLUMNS as readonly Column[]).reduce(
  (acc, col) => {
    const count = competitorNames.reduce((sum, comp) => {
      return COMPETITOR_DATA[comp][col] === "✅" ? sum + 1 : sum;
    }, 0);
    acc[col] = count;
    return acc;
  },
  {} as Record<Column, number>
);

// New presentation order – columns with more ✅ by competitors come first.
const ORDERED_COLUMNS: Column[] = [...COLUMNS].sort((a, b) => {
  // Always prioritize Local Interfaces as the first column.
  if (a === "Local Interfaces") return -1;
  if (b === "Local Interfaces") return 1;
  const diff = columnGreenCount[b] - columnGreenCount[a];
  // Stable fallback to original index to keep deterministic ordering on ties.
  return diff !== 0 ? diff : COLUMNS.indexOf(a) - COLUMNS.indexOf(b);
});

// Transform to table source rows (keeps column order automatically)
const ROWS: Row[] = Object.entries(COMPETITOR_DATA).map(([name, colMap]) => ({
  name,
  values: ORDERED_COLUMNS.map((c) => colMap[c] ?? "✖"),
}));

/* -------------------------------------------------------------------------- */
/* Re-usable DocBox for the marketing competitor table.                 */
/* -------------------------------------------------------------------------- */

function DocBox({
  content,
}: {
  content:
  | {
    title: string;
    subtitle?: string;
    body: string;
  }
  | null;
}) {
  return (
    <motion.div
      className="w-full h-full"
      initial={false}
      animate={{ opacity: content ? 1 : 0, scale: content ? 1 : 0.97 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1], scale: { duration: 0.4 } }}
    >
      <motion.div
        /*
         * Keep the internal card height consistent while the content swaps so
         * Framer-motion doesn’t have to recalc layout on every hover.  This was
         * already the case in the source header components but was
         * accidentally stripped when we copied the component into the
         * marketing competitors section, which resulted in a small ‘jump’ /
         * flicker mid-transition. Restoring the fixed height plus absolute
         * positioning brings the behaviour back in line with the original
         * implementation.
         */
        className="relative h-full rounded-lg border border-brand-emerald-glow-subtle bg-black/40 backdrop-blur-sm p-4 overflow-hidden"
        animate={{
          boxShadow: content ? "0 0 25px theme(colors.brand.purple-glow)" : "0 0 0 theme(colors.brand.purple-glow)",
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Ambient glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-brand-purple-glow/20 to-transparent"
          animate={{ opacity: content ? 1 : 0, scale: content ? 1 : 1.1 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        />

        <div className="relative h-full">
          <AnimatePresence mode="sync">
            {content && (
              <motion.div
                key={content.title + (content.subtitle || "")}
                initial={{ opacity: 0, y: 15, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.97 }}
                transition={{
                  duration: 0.3,
                  ease: [0.23, 1, 0.32, 1],
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.3 },
                }}
                className="absolute inset-0 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <motion.h3
                    className="text-brand-purple font-medium text-base"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {content.title}
                  </motion.h3>
                  {content.subtitle && (
                    <motion.p
                      className="text-gray-400 text-sm font-medium ml-2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.15 }}
                    >
                      {content.subtitle}
                    </motion.p>
                  )}
                </div>
                <motion.p
                  className="text-gray-300 text-base leading-relaxed mt-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {content.body}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Bitcode Advantage Card                                                     */
/* -------------------------------------------------------------------------- */

function BitcodeAdvantageCard({
  content,
  variant = 'excellence',
}: {
  // never null – we always pass some copy
  content: CrushCopy;
  variant?: 'excellence' | 'elimination';
}) {
  const isElimination = variant === 'elimination';
  const borderClass = isElimination
    ? 'border-red-500/25'
    : 'border-brand-emerald-glow-subtle';
  const bgClass = isElimination
    ? 'bg-red-500/5'
    : 'bg-brand-emerald-glow-subtle/20';
  const gradientClass = isElimination
    ? 'from-red-500/10'
    : 'from-brand-emerald-glow-subtle/40';
  const headlineColorClass = isElimination ? 'text-red-400' : 'text-brand-emerald';

  return (
    <motion.div
      className="w-full h-full"
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1], scale: { duration: 0.4 } }}
    >
      <motion.div
        className={`relative rounded-lg border ${borderClass} ${bgClass} backdrop-blur-sm p-4 overflow-hidden h-full w-full z-10`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35 }}
      >
        {/* Ambient glow */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${gradientClass} to-transparent pointer-events-none`}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        <div className="relative h-full flex flex-col justify-start space-y-2">
          {/* Headline */}
          <motion.h3
            key={content.headline}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.35 }}
            className={`${headlineColorClass} font-medium text-base`}
          >
            {content.headline}
          </motion.h3>

          {/* Bullet list */}
          <motion.ul
            key={content.headline + '-list'}
            initial="hidden"
            animate="show"
            exit="exit"
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.06, delayChildren: 0.05 },
              },
              exit: {
                transition: { staggerChildren: 0.04, staggerDirection: -1 },
              },
            }}
            className="space-y-1 text-gray-300 text-base"
          >
            {content.points.map((p) => (
              <motion.li
                key={p}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
                  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
                }}
                className="flex items-start"
              >
                {isElimination ? (
                  <XCircleIcon className="w-3.5 h-3.5 mr-2 text-red-400 flex-shrink-0 mt-[2px]" />
                ) : (
                  <CheckCircleIcon className="w-3.5 h-3.5 mr-2 text-brand-emerald flex-shrink-0 mt-[2px]" />
                )}
                <span>{p}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MarketingCompetitorTableSection() {
  // default focus "Deep Coding" (index 0) so card is visible and height fixed
  const [activeCol, setActiveCol] = useState<number>(0);

  const activeColumnKey = ORDERED_COLUMNS[activeCol];

  return (
    <MarketingSectionWrapper id="comparison" disablePadding className={`py-16 desktop:py-24 ${styles.competitorSection}`}>
      {/* Heading */}
      <div className="mx-auto max-w-6xl text-center mb-6">
        <h2 className="text-2xl laptop:text-3xl font-bold mb-4 super-shiny-text">
          The Autonomous, Self-Improving Software Factory
        </h2>
        <p className="text-base laptop:text-lg text-gray-300 max-w-3xl mx-auto">
          Source-to-shares execution measures Reads, reviews fit, and produces AssetPacks with proof-visible settlement evidence.
        </p>
      </div>

      {/* Styles moved to CSS Module */}

      {/* Dual card area – generic column explainer (left) & Bitcode advantage (right)
       * Reduce fixed height to tighten vertical space (approx. one-third less). */}
      <div className="mx-auto max-w-6xl mb-10 grid grid-cols-1 laptop:grid-cols-2 gap-6 h-[150px] relative">
        {/* Generic explainer */}
        <DocBox
          content={{
            title: COLUMN_INFO[activeColumnKey].title,
            subtitle: COLUMN_INFO[activeColumnKey].subtitle,
            body: COLUMN_INFO[activeColumnKey].description,
          }}
        />

        {/* Bitcode Excellence / Elimination wrapper with persistent logo */}
        <div className="relative w-full h-full">
          {/* Persistent glowing logo */}
          {/* Logo + floating label */}
          <div className="absolute top-3 right-3 laptop:top-4 laptop:right-4 flex items-center gap-1 pointer-events-none select-none z-20">
            {activeColumnKey === 'Local Interfaces' ? (
              <>
                <Logo
                  className="marketing-glowing-logo-red rotate-90"
                  width="w-6 laptop:w-7"
                  height="h-6 laptop:h-7"
                  fill="theme(colors.brand.red)"
                />
                <span className="text-[9px] laptop:text-[10px] font-semibold uppercase tracking-wider text-red-400 marketing-glowing-label-red">
                  Bitcode&nbsp;Elimination
                </span>
              </>
            ) : (
              <>
                <Logo
                  className="marketing-glowing-logo"
                  width="w-6 laptop:w-7"
                  height="h-6 laptop:h-7"
                  fill="theme(colors.brand.emerald)"
                />
                <span className="text-[9px] laptop:text-[10px] font-semibold uppercase tracking-wider text-brand-emerald marketing-glowing-label">
                  Bitcode&nbsp;Excellence
                </span>
              </>
            )}
          </div>

          {/* Animated content */}
          <AnimatePresence mode="wait" initial={false}>
            <BitcodeAdvantageCard
              content={BITCODE_CRUSH_COPY[activeColumnKey]}
              key={activeColumnKey}
              variant={activeColumnKey === 'Local Interfaces' ? 'elimination' : 'excellence'}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Comparison table */}
      {/*
       * Scroll container – add left padding equal to the sticky column’s width
       * (≈ 96 px) so that column no longer counts toward the scrollable area.
       * Then pull the actual table back to its original visual start with a
       * matching negative margin.
       *
       * This reduces `scrollWidth` by exactly the sticky-column width while
       * keeping the layout and look unchanged.
       */}
      <div
        className="overflow-x-auto max-w-6xl mx-auto laptop:pl-[96px]"
        onMouseLeave={() => setActiveCol(0)}
      >
        {/* Clip-box makes the scrollable area exactly table-width minus the
            sticky column (calculated inside with table's calc-size). This eliminates the overscroll without
            altering table layout. */}
        {/* Clip-box – keep x-hidden to cap scroll width (sticky column hack) */}
        {/*
         * The clip-box MUST keep its `overflow-x-hidden` behaviour across all
         * break-points. A recent mobile tweak flipped the default to
         * `overflow-x-visible` which inadvertently collapsed the scrollable
         * area down to 0 px height on some browsers — effectively hiding the
         * entire table (headers & rows disappeared). Restoring the original
         * `overflow-x-hidden` value fixes the regression while still allowing
         * the wider table to scroll inside its parent wrapper as intended.
         */}
        <div
          className="inline-block w-max min-w-full rounded-lg border border-white/10 overflow-x-auto phone:overflow-x-scroll laptop:overflow-x-hidden laptop:-ml-[96px] touch-pan-x"
        >
          {/*
           * Use `w-max` instead of `min-w-full` so the table’s scrollable width
           * always hugs the content exactly.  This prevents an extra blank space
           * (that looked like an empty column) showing up once the user scrolls
           * all the way to the far-right edge.
           */}
          {/*
         * Use `table-fixed` so the browser calculates the scrollable width
         * purely from the explicit column sizes instead of trying to auto-
         * expand for sticky cells (Chrome/Safari bug – sticky first column adds
         * its width twice, producing ~ one-column of blank space on the far
         * right).  Keeping `w-max` ensures we still hug the content width. */}
          <table
            className="text-xs phone:text-xs tablet:text-sm border-collapse border-spacing-0 w-max laptop:table-fixed min-w-full"
          >
            <thead className="bg-white/5 backdrop-blur">
              <tr>
                {/* Header cell for the sticky competitor column – match body padding
                 so we don't end up with what visually looks like an empty/extra
                 column at the far edge of the table. */}
                {/* Sticky header for the competitor column so that the column
                 behaves exactly like the body cells (otherwise the table keeps
                 the extra width of the column even after it scrolls out of
                 view, letting the user scroll one-column further than
                 necessary). */}
                <th
                  className="text-left font-semibold text-gray-300 px-2.5 py-2 whitespace-nowrap laptop:sticky laptop:left-0 backdrop-blur z-[2] bg-black/30"
                >
                  <span className="sr-only">Competitor</span>
                </th>

                {ORDERED_COLUMNS.map((col, idx) => (
                  <th
                    key={col}
                    className={`px-2.5 py-2 font-semibold whitespace-normal leading-snug min-w-[6.5rem] transition-colors text-sm tablet:text-base ${activeCol === idx
                        ? col === 'Local Interfaces'
                          ? 'text-red-400'
                          : 'text-brand-emerald'
                        : 'text-gray-300'
                      }`}
                    onMouseEnter={() => setActiveCol(idx)}
                    onMouseOver={() => setActiveCol(idx)}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ROWS.map((row, rowIdx) => (
                <motion.tr
                  key={row.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIdx * 0.04 }}
                  className={`relative ${row.name === "Bitcode"
                    ? "marketing-bitcode-row-glow"
                    : "border-t border-white/5"
                    }`}
                >
                  {/* Company name */}
                  <th
                    className={`text-left font-medium px-2.5 py-2 whitespace-nowrap laptop:sticky laptop:left-0 backdrop-blur z-[1] relative flex items-center ${row.name === "Bitcode"
                      ? "marketing-bitcode-logo-cell"
                      : "bg-black/30 text-gray-100 text-sm"
                      }`}
                  >
                    {row.name === "Bitcode" ? (
                      <BitcodeSoftwareSvgLogo
                        width="92px"
                        height="auto"
                        softwareClassName="hidden"
                      />
                    ) : (
                      row.name
                    )}
                  </th>

                  {/* Values */}
                  {row.values.map((value, colIdx) => (
                    <td
                      key={colIdx}
                      className={`text-center px-2.5 py-2 ${row.name === "Bitcode"
                        ? "bg-brand-emerald/5 font-semibold text-[1.55rem] laptop:text-[2.3rem]"
                        : "text-xl"
                        }`}
                      onMouseEnter={() => setActiveCol(colIdx)}
                      onMouseOver={() => setActiveCol(colIdx)}
                    >
                      <span
                        className={
                          activeCol === colIdx
                            ? "inline-block scale-110 transition-transform"
                            : ""
                        }
                      >
                        {value === "✅" ? (
                          <CheckCircleIcon
                            className={`inline text-brand-emerald ${row.name === "Bitcode" ? "h-9 w-9 marketing-bitcode-icon-glow" : "h-6 w-6"
                              }`}
                          />
                        ) : value === "±" ? (
                          <MinusCircleIcon
                            className={`inline text-yellow-400 ${row.name === "Bitcode" ? "h-9 w-9 marketing-bitcode-icon-glow" : "h-6 w-6"
                              }`}
                          />
                        ) : value === "⏳" ? (
                          row.name === "Bitcode" ? (
                            <DisabledTooltipWrapper
                              tooltip="Coming&nbsp;Soon"
                              placement="left"
                              variant="purple"
                            >
                              <ClockIcon
                                className="inline text-purple-300 h-9 w-9 marketing-coming-soon-spin"
                                style={{
                                  filter:
                                    'drop-shadow(0 0 4px theme(colors.brand.purple-glow)) drop-shadow(0 0 10px theme(colors.brand.purple-glow-subtle))',
                                }}
                              />
                            </DisabledTooltipWrapper>
                          ) : (
                            <ClockIcon
                              className={`inline text-gray-400 ${row.name === "Bitcode" ? "h-9 w-9" : "h-6 w-6"}`}
                            />
                          )
                        ) : (
                          <XCircleIcon
                            className={`inline text-red-500 ${row.name === "Bitcode" && ORDERED_COLUMNS[colIdx] === "Local Interfaces"
                              ? "h-9 w-9 marketing-bitcode-no-icon-glow"
                              : row.name === "Bitcode"
                                ? "h-9 w-9 marketing-bitcode-icon-glow"
                                : "h-6 w-6"
                              }`}
                          />
                        )}
                      </span>
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div> {/* end clip-box */}
      </div>

      {/* Spacer at bottom */}
      <div className="h-8" />
    </MarketingSectionWrapper>
  );
}
