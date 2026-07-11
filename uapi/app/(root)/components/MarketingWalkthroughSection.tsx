"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";

// Defer loading of the SVG path/animation logic until the component mounts in the browser.
const AnimatedBeam = dynamic(
  () => import("@/components/bitcode/magicui/animated-beam").then((mod) => mod.AnimatedBeam),
  { ssr: false }
);
import BitcodePill from "@/components/bitcode/branding/bitcode-pill";
import {
  ArrowRightIcon,
  CursorArrowRaysIcon,
  WrenchScrewdriverIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

// Thumbnail stack used for screenshot previews beneath each step card.
const MarketingThumbnailStack = dynamic(() => import("./MarketingThumbnailStack"));

// Full-screen gallery for viewing screenshots
const MarketingFullScreenGallery = dynamic(() => import("./MarketingFullScreenGallery"), { ssr: false });
import './walkthrough-section.module.css';

// Type for screenshot metadata consumed by FullScreenGallery
import type { Screenshot } from './marketing-types';

// ---------------------------------------------------------------------------
// Static screenshot pools – 3 per step (4 steps ⇒ 12 total)
// ---------------------------------------------------------------------------

const STEP_SCREENSHOTS: Record<number, Screenshot[]> = {
  1: [
    {
      id: "wt-1-1",
      src: "/screenshots/setup-marketplace.png",
      alt: "Setup marketplace screenshot",
      type: "component",
      category: "setup",
      revealingSoon: true,
    },
    {
      id: "wt-1-2",
      src: "/screenshots/setup-btd.png",
      alt: "Setup BTD screenshot",
      type: "component",
      category: "setup",
      revealingSoon: true,
    },
    {
      id: "wt-1-3",
      src: "/screenshots/setup-btd-balance.png",
      alt: "Setup BTD balance screenshot",
      type: "component",
      category: "setup",
      revealingSoon: true,
    },
  ],
  2: [
    {
      id: "wt-2-1",
      src: "/screenshots/sidebar-chats-history.png",
      alt: "Chats history sidebar screenshot",
      type: "component",
      category: "sidebar",
      revealingSoon: true,
    },
    {
      id: "wt-2-2",
      src: "/screenshots/sidebar-chats-chatting.png",
      alt: "Chats chatting sidebar screenshot",
      type: "component",
      category: "sidebar",
      revealingSoon: true,
    },
    {
      id: "wt-2-3",
      src: "/screenshots/sidebar-feedbacks-history.png",
      alt: "Feedbacks history sidebar screenshot",
      type: "component",
      category: "sidebar",
      revealingSoon: true,
    },
  ],
  3: [
    {
      id: "wt-3-1",
      src: "/screenshots/asset-pack-page-minimal-state.png",
      alt: "AssetPack page - minimal state",
      type: "full_page",
      category: "asset-packs",
      revealingSoon: true,
    },
    {
      id: "wt-3-2",
      src: "/screenshots/asset-pack-page-maximal-state.png",
      alt: "AssetPack page - maximal state",
      type: "full_page",
      category: "asset-packs",
      revealingSoon: true,
    },
    {
      id: "wt-3-3",
      src: "/screenshots/asset-pack-page-minimal-state.png",
      alt: "AssetPack page alt",
      type: "full_page",
      category: "asset-packs",
      revealingSoon: true,
    },
  ],
  4: [
    {
      id: "wt-4-1",
      src: "/screenshots/asset-pack-page-maximal-state.png",
      alt: "AssetPack evidence page screenshot",
      type: "full_page",
      category: "asset-packs",
      revealingSoon: true,
    },
    {
      id: "wt-4-2",
      src: "/screenshots/sidebar-shippables.png",
      alt: "Shippables sidebar screenshot",
      type: "component",
      category: "sidebar",
      revealingSoon: true,
    },
    {
      id: "wt-4-3",
      src: "/screenshots/integration-notion.png",
      alt: "Notion integration screenshot",
      type: "component",
      category: "integration",
      revealingSoon: true,
    },
  ],
};

// ---------------------------------------------------------------------------
//                           Utility: simple media-query hook
// ---------------------------------------------------------------------------
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handler);
    }
    return () => {
      if (typeof mq.removeEventListener === "function") {
        mq.removeEventListener("change", handler);
      }
    };
  }, [query]);

  return matches;
}

type Step = {
  title: string;
  desc: string;
  Icon: any;
};

// ---------------------------------------------------------------------------
// Launch-Day Scenarios - Bitcode Technical Exchange
// ---------------------------------------------------------------------------

const NEW_SCENARIOS: Record<string, { label: string; steps: Step[] }> = {
  killBug: {
    label: "Kill the Bug Backlog",
    steps: [
      { title: 'Bug Backlog', desc: 'Backend-api releases are blocked by a growing bug queue.', Icon: CursorArrowRaysIcon },
      { title: 'Kick-off in Chat', desc: 'Select backend-api repo & prod logs; ask Bitcode to blitz Q2 bugs.', Icon: AcademicCapIcon },
      { title: 'Bitcode Root-Causes & Fixes', desc: 'Reads stack traces, writes failing tests, patches code, re-runs full suite to guard regressions.', Icon: WrenchScrewdriverIcon },
      { title: 'Zero-Bug Release', desc: 'PRs land with exhaustive tests—backlog cleared above-and-beyond quality.', Icon: ArrowRightIcon },
    ],
  },
  addAI: {
    label: "Add Another AI Feature",
    steps: [
      { title: 'Read AI Endpoint', desc: 'Product needs /summaries that returns concise JSON.', Icon: CursorArrowRaysIcon },
      { title: 'Describe in Chat', desc: 'Select Node repo; paste spec & sample Jest assertions.', Icon: AcademicCapIcon },
      { title: 'Bitcode Designs & Builds', desc: 'Benchmarks models, codes route & vector store, writes docs, unit + contract tests, ensures zero regressions.', Icon: WrenchScrewdriverIcon },
      { title: 'Feature PR Ready', desc: 'Production-grade endpoint delivered & documented above-and-beyond quality.', Icon: ArrowRightIcon },
    ],
  },
  awsCost: {
    label: "Slash AWS Cloud Spend",
    steps: [
      { title: 'Cloud Costs Spike', desc: 'EC2 spend is overshooting budget.', Icon: CursorArrowRaysIcon },
      { title: 'Set Goal in Chat', desc: 'Connect Terraform repo & cost explorer; ask “-30 % spend, keep p99 < 200 ms”.', Icon: AcademicCapIcon },
      { title: 'Bitcode Explores & Optimizes', desc: 'Simulates Spot/Graviton mixes, load-tests, predicts savings, updates IaC with guarded rollbacks.', Icon: WrenchScrewdriverIcon },
      { title: 'Savings Locked-In', desc: 'PR ships with cost forecast & automated canary—above-and-beyond quality.', Icon: ArrowRightIcon },
    ],
  },
  checkoutSplit: {
    label: "Extract Checkout Service",
    steps: [
      { title: 'Monolith Bottleneck', desc: 'Checkout logic is trapped inside a stalled monolith.', Icon: CursorArrowRaysIcon },
      { title: 'Define Boundaries', desc: 'Select repo; list endpoints & tables that form checkout domain.', Icon: AcademicCapIcon },
      { title: 'Bitcode Carves & Validates', desc: 'Generates strangler proxy, new service, contract tests, data migration & load tests—no regressions.', Icon: WrenchScrewdriverIcon },
      { title: 'Seamless Cut-over', desc: 'Dual-write rollout script & PR delivered above-and-beyond quality.', Icon: ArrowRightIcon },
    ],
  },
  soc2: {
    label: "Automate SOC 2 Compliance",
    steps: [
      { title: 'SOC 2 Deadline', desc: 'Fintech-api must satisfy 2024 controls before audit.', Icon: CursorArrowRaysIcon },
      { title: 'Upload Controls', desc: 'Select repo & AWS; attach spreadsheet mapping required controls.', Icon: AcademicCapIcon },
      { title: 'Bitcode Enforces Policy', desc: 'Injects encryption, audit logs, least-priv IAM; writes unit + infra tests & evidence docs.', Icon: WrenchScrewdriverIcon },
      { title: 'Audit Binder Ready', desc: 'Comprehensive evidence bundle PR—above-and-beyond quality.', Icon: ArrowRightIcon },
    ],
  },
  fraudSentinel: {
    label: "Keep Fraud Model Accurate",
    steps: [
      { title: 'Accuracy Slipping', desc: 'Fraud model F1 is trending below 92 %.', Icon: CursorArrowRaysIcon },
      { title: 'Set KPI in Chat', desc: 'Select repo; declare target F1 ≥ 92 %.', Icon: AcademicCapIcon },
      { title: 'Bitcode Calibrates & Tests', desc: 'Auto-labels fresh data, refines model, A/B tests, safeguards latency, picks champion.', Icon: WrenchScrewdriverIcon },
      { title: 'Accuracy Restored', desc: 'Champion model PR with detailed metrics—above-and-beyond quality.', Icon: ArrowRightIcon },
    ],
  },
  pricingAPI: {
    label: "Ship Pricing API Fast",
    steps: [
      { title: 'Read Pricing API', desc: 'Launch requires /calculate endpoint ASAP.', Icon: CursorArrowRaysIcon },
      { title: 'Specify in Chat', desc: 'Select repo; paste schema & golden-path tests.', Icon: AcademicCapIcon },
      { title: 'Bitcode Codes & Validates', desc: 'Scrapes competitors, writes Go handler, migrations, OpenAPI, load & unit tests—ensures zero regressions.', Icon: WrenchScrewdriverIcon },
      { title: 'Production-Ready API', desc: 'Fully tested, documented API PR—above-and-beyond quality.', Icon: ArrowRightIcon },
    ],
  },
  brandRefresh: {
    label: "Refresh Brand Everywhere",
    steps: [
      { title: 'Brand Refresh', desc: 'Figma style guide just changed across web-suite.', Icon: CursorArrowRaysIcon },
      { title: 'Sync in Chat', desc: 'Select repo; attach updated tokens & assets.', Icon: AcademicCapIcon },
      { title: 'Bitcode Re-skins & Diffs', desc: 'Updates CSS vars & assets, runs Playwright screenshot diffs & Lighthouse audits for pixel-perfect UI.', Icon: WrenchScrewdriverIcon },
      { title: 'Pixel-Perfect Release', desc: 'Visual diff PR with >95 Lighthouse—above-and-beyond quality.', Icon: ArrowRightIcon },
    ],
  },
  schemaDrift: {
    label: "Guard Against Schema Drift",
    steps: [
      { title: 'Risk of Drift', desc: 'Production DB may diverge from Prisma schema.', Icon: CursorArrowRaysIcon },
      { title: 'Enable Guard', desc: 'Select repo & Supabase; toggle Schema Guard in chat.', Icon: AcademicCapIcon },
      { title: 'Bitcode Generates Migration', desc: 'Diffs prod vs code, writes migration, updates TS types & CI gate to block future drift.', Icon: WrenchScrewdriverIcon },
      { title: 'Drift Proofed', desc: 'Schema-aligned PR with automated gate—above-and-beyond quality.', Icon: ArrowRightIcon },
    ],
  },
  recoBoost: {
    label: "Boost Recommendation CTR",
    steps: [
      { title: 'CTR Declining', desc: 'Recommendation click-through rate is sliding.', Icon: CursorArrowRaysIcon },
      { title: 'Set Goal in Chat', desc: 'Select repo & analytics; target +15 % CTR.', Icon: AcademicCapIcon },
      { title: 'Bitcode Mines & Models', desc: 'Surfaces new features, trains LightFM & XGBoost, offline & online tests, safeguards performance.', Icon: WrenchScrewdriverIcon },
      { title: 'CTR Jump-Start', desc: 'Champion model PR & real-time metrics—above-and-beyond quality.', Icon: ArrowRightIcon },
    ],
  },
  soloBlueprint: {
    label: "Kickstart Solo SaaS",
    steps: [
      { title: 'Founder Spark', desc: 'You have a new SaaS idea but no product yet.', Icon: CursorArrowRaysIcon },
      { title: 'Chat the Vision', desc: 'Create empty repo; outline market gap & MVP in web chat.', Icon: AcademicCapIcon },
      { title: 'Bitcode Scaffold & Iterate', desc: 'Bootstraps Remix + Supabase, auth, billing, tests & CI; queues nightly story expansions.', Icon: WrenchScrewdriverIcon },
      { title: 'MVP Launchpad', desc: 'Investor-ready codebase PR & CI pipeline—above-and-beyond quality.', Icon: ArrowRightIcon },
    ],
  },
};

const SCENARIOS = {
  // --- AssetPacks ---
  bugfix: {
    label: "Fix a Bug",
    steps: [
      {
        title: "Report Bug",
        desc: "Describe failing behaviour or test; attach logs.",
        Icon: CursorArrowRaysIcon,
      },
      {
        title: "Diagnose Root Cause",
        desc: "Bitcode traces stack and reproduces the issue.",
        Icon: AcademicCapIcon,
      },
      {
        title: "Patch & Test",
        desc: "Fix code, generate tests until green.",
        Icon: WrenchScrewdriverIcon,
      },
      {
        title: "Create PR & Merge",
        desc: "Bitcode opens PR, auto-review, merge on approval.",
        Icon: ArrowRightIcon,
      },
    ],
  },
  review: {
    label: "Code Review",
    steps: [
      {
        title: "Select Pull Request",
        desc: "Pick any open PR for Bitcode to inspect.",
        Icon: CursorArrowRaysIcon,
      },
      {
        title: "Static & Dynamic Analysis",
        desc: "LLMs lint, test, scan security, generate insights.",
        Icon: AcademicCapIcon,
      },
      {
        title: "Line-by-Line Feedback",
        desc: "Pull-request guidance and suggestions committed.",
        Icon: WrenchScrewdriverIcon,
      },
      {
        title: "Approve or Fix",
        desc: "Bitcode can push fixes through the PR-backed AssetPack path.",
        Icon: ArrowRightIcon,
      },
    ],
  },
  research: {
    label: "Research & Design",
    steps: [
      {
        title: "Define Question",
        desc: "Describe what you read to learn or design.",
        Icon: CursorArrowRaysIcon,
      },
      {
        title: "Collect Sources",
        desc: "Bitcode searches docs, papers, code, and benchmarks.",
        Icon: AcademicCapIcon,
      },
      {
        title: "Draft Report / Design",
        desc: "Structured docs, diagrams, trade-offs.",
        Icon: WrenchScrewdriverIcon,
      },
      {
        title: "Review & Iterate",
        desc: "Collaborate live, export markdown or PDFs.",
        Icon: ArrowRightIcon,
      },
    ],
  },
  feature: {
    label: "Build Feature",
    steps: [
      {
        title: "Describe Feature",
        desc: "User stories, acceptance tests, constraints.",
        Icon: CursorArrowRaysIcon,
      },
      {
        title: "Plan Architecture",
        desc: "Sketch modules, data flow, responsibilities.",
        Icon: AcademicCapIcon,
      },
      {
        title: "Implement & Test",
        desc: "Code, migrations, tests, docs.",
        Icon: WrenchScrewdriverIcon,
      },
      {
        title: "Open PR & Deploy",
        desc: "CI passes, preview environment, rollout.",
        Icon: ArrowRightIcon,
      },
    ],
  },

  // --- Evidence Documents ---
  evidenceDocumentKnowledge: {
    label: "Knowledge Evidence Document",
    steps: [
      {
        title: "Pick Knowledge Gap",
        desc: "Tell Bitcode what domain to master.",
        Icon: CursorArrowRaysIcon,
      },
      {
        title: "Ingest Docs & Examples",
        desc: "Bitcode chunks, embeds, and cites sources.",
        Icon: AcademicCapIcon,
      },
      {
        title: "Train Extension",
        desc: "Fine-tune retrieval + evaluation harness.",
        Icon: WrenchScrewdriverIcon,
      },
      {
        title: "Publish to Bitcode",
        desc: "New expertise instantly available to all runs.",
        Icon: ArrowRightIcon,
      },
    ],
  },
  evidenceDocumentTemplate: {
    label: "Template Evidence Document",
    steps: [
      {
        title: "Select Template Goal",
        desc: "e.g., React component boilerplate.",
        Icon: CursorArrowRaysIcon,
      },
      {
        title: "Define Variables",
        desc: "Prompts & params capture custom input.",
        Icon: AcademicCapIcon,
      },
      {
        title: "Generate Snippet",
        desc: "LLM builds robust scaffold + tests.",
        Icon: WrenchScrewdriverIcon,
      },
      {
        title: "Register Template",
        desc: "One-click insertion from Bitcode palette.",
        Icon: ArrowRightIcon,
      },
    ],
  },
  evidenceDocumentGuidance: {
    label: "Guidance Evidence Document",
    steps: [
      {
        title: "Identify Pain Point",
        desc: "Performance, security, DX, etc.",
        Icon: CursorArrowRaysIcon,
      },
      {
        title: "Draft Best Practice",
        desc: "LLM articulates policies & examples.",
        Icon: AcademicCapIcon,
      },
      {
        title: "Integrate Lint Rules",
        desc: "Guidance enforced via code mods.",
        Icon: WrenchScrewdriverIcon,
      },
      {
        title: "Continuous Improvement",
        desc: "Feedback loops refine guidance over time.",
        Icon: ArrowRightIcon,
      },
    ],
  },

  // --- Adoption / Setup ---
  cicd: {
    label: "Setup Bitcode in CI/CD",
    steps: [
      {
        title: "Install GitHub App",
        desc: "Grant read/write on selected repos.",
        Icon: CursorArrowRaysIcon,
      },
      {
        title: "Configure Workflow",
        desc: "Add bitcode-run step to your pipeline.",
        Icon: AcademicCapIcon,
      },
      {
        title: "Parameterize Jobs",
        desc: "Define triggers & scopes via YAML.",
        Icon: WrenchScrewdriverIcon,
      },
      {
        title: "Push – Auto-Run",
        desc: "Every admitted Read finishes as a PR-backed AssetPack.",
        Icon: ArrowRightIcon,
      },
    ],
  },
  mcp: {
    label: "Add MCPs to My Bitcode AI",
    steps: [
      {
        title: "Choose Capability",
        desc: "Pick an integration or skill module.",
        Icon: CursorArrowRaysIcon,
      },
      {
        title: "Configure Secrets",
        desc: "Provide API keys & environment.",
        Icon: AcademicCapIcon,
      },
      {
        title: "Deploy MCP",
        desc: "Bitcode validates and publishes the package.",
        Icon: WrenchScrewdriverIcon,
      },
      {
        title: "Use in Prompts",
        desc: "New function calls available instantly.",
        Icon: ArrowRightIcon,
      },
    ],
  },
  webhook: {
    label: "Headless Bitcode (Webhooks)",
    steps: [
      {
        title: "Subscribe Webhook",
        desc: "Point external system at /triggers.",
        Icon: CursorArrowRaysIcon,
      },
      {
        title: "Send JSON Payloads",
        desc: "Include context, repo, intent.",
        Icon: AcademicCapIcon,
      },
      {
        title: "Bitcode Executes Task",
        desc: "Bitcode runs asynchronously.",
        Icon: WrenchScrewdriverIcon,
      },
      {
        title: "Callback / PR Created",
        desc: "Receive result via webhook or Git commit.",
        Icon: ArrowRightIcon,
      },
    ],
  },
} as const;

// NOTE: removed generic feature cards; now rendering screenshot cards per step below



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
