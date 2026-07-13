/**
 * Walkthrough scenarios, step screenshots, and step types for marketing.
 */
import type { Screenshot } from "@/components/marketing/MarketingTypes/marketing-types";

export const STEP_SCREENSHOTS: Record<number, Screenshot[]> = {
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
export type Step = {
  title: string;
  desc: string;
  Icon: any;
};

// ---------------------------------------------------------------------------
// Launch-Day Scenarios - Bitcode Technical Exchange
// ---------------------------------------------------------------------------

export const NEW_SCENARIOS: Record<string, { label: string; steps: Step[] }> = {
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

export const SCENARIOS = {
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



