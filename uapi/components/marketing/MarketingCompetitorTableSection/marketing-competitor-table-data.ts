/**
 * Competitor comparison matrix data and derived row ordering for marketing.
 */
export type Status = "✅" | "±" | "✖" | "⏳";

export interface Row {
  name: string;
  values: Status[];
}

/* -------------------------------------------------------------------------- */
/* Base column order – will be dynamically re-sorted below so keep this tuple  */
/* immutable for type-safety & copy look-ups.                                  */
/* -------------------------------------------------------------------------- */

export const COLUMNS = [
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
export interface DocBoxCopy {
  title: string;
  subtitle: string;
  description: string;
}

export const COLUMN_INFO: Record<(typeof COLUMNS)[number], DocBoxCopy> = {
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

export interface CrushCopy {
  headline: string;
  points: string[];
}

export const BITCODE_CRUSH_COPY: Record<(typeof COLUMNS)[number], CrushCopy> = {
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

export type Column = (typeof COLUMNS)[number];

export const COMPETITOR_DATA: Record<string, Record<Column, Status>> = {
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
export const competitorNames = Object.keys(COMPETITOR_DATA).filter((n) => n !== "Bitcode");

export const columnGreenCount: Record<Column, number> = (COLUMNS as readonly Column[]).reduce(
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
export const ORDERED_COLUMNS: Column[] = [...COLUMNS].sort((a, b) => {
  // Always prioritize Local Interfaces as the first column.
  if (a === "Local Interfaces") return -1;
  if (b === "Local Interfaces") return 1;
  const diff = columnGreenCount[b] - columnGreenCount[a];
  // Stable fallback to original index to keep deterministic ordering on ties.
  return diff !== 0 ? diff : COLUMNS.indexOf(a) - COLUMNS.indexOf(b);
});

// Transform to table source rows (keeps column order automatically)
export const ROWS: Row[] = Object.entries(COMPETITOR_DATA).map(([name, colMap]) => ({
  name,
  values: ORDERED_COLUMNS.map((c) => colMap[c] ?? "✖"),
}));
