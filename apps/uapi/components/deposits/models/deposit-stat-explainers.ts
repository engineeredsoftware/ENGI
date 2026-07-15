/**
 * Rich-tooltip copy for the /deposits stat surfaces: the route header metric
 * chips, the source-safe session rows, the organization-authority rows, the
 * earning-supply-intelligence rows, and the deposit proof-detail roots.
 * Rendered through TelemetryExplainerTrigger (hover/focus/touch), matching
 * the telemetry pill tooltips.
 */

export const DEPOSIT_HEADER_METRIC_EXPLAINERS: Record<string, string> = {
  Stage:
    "Where this deposit session currently sits in the journey: connect source, synthesize options, review source-safe options, submit deposit, then read depository state.",
  Options:
    "How many source-safe AssetPack options the AssetPacksSynthesis pipeline proposed from the connected repository in this session.",
  "Positive ROI":
    "Of the synthesized options, how many the deposit policy measures as positive expected return — worth reviewing for admission.",
  Admitted:
    "How many options you have approved into the Depository this session. Admission is permanent; archived options stay re-depositable.",
  Network:
    "Network-visible admitted AssetPacks across the whole Depository feed — the supply your deposit joins.",
  Authority:
    "The organization policy + wallet authority aggregate for this account: whether depositing is currently allowed, and why not when denied.",
  "Earning estimate":
    "Total expected compensation (sats) across the synthesized options, from the depositor earning supply intelligence measurement.",
};

export const DEPOSIT_SESSION_ROW_EXPLAINERS: Record<string, string> = {
  Repository:
    "The connected repository this deposit session reads from. One repository, branch, and commit form the source package everything downstream measures.",
  Branch:
    "The selected branch of the connected repository. The default branch is picked automatically once branches load.",
  Commit:
    "The exact commit the synthesis measured. Options are pinned to this revision — a new commit means resynthesis.",
  Transaction:
    "The run id of this session's synthesis pipeline execution — the same id the pipelines table and telemetry detail attach to.",
  Pipeline:
    "The formal pipeline that synthesizes the source-safe AssetPack options for review.",
  Policy:
    "The deposit policy report that measures each option's ROI posture and decides which are reviewable.",
  Admission:
    "The admission report recording which reviewed options were approved into the Depository.",
  Earnings:
    "The depositor earning supply intelligence measurement behind the compensation estimates.",
  "Option roots":
    "How many source-safe option roots the synthesis produced — one hash per proposed AssetPack, anchoring it into proof readback.",
  "Positive ROI options":
    "How many synthesized options the policy measures as positive expected return.",
  "Admitted options":
    "How many options were admitted into the Depository this session.",
  "Expected compensation":
    "Total expected compensation (sats) across the synthesized options if deposited and read against.",
};

export const DEPOSIT_AUTHORITY_ROW_EXPLAINERS: Record<string, string> = {
  Authority:
    "The aggregate organization-authority verdict: 'approved' means depositing can proceed; 'denied' means at least one required approval is missing — see the authority blockers.",
  Wallet:
    "The wallet-binding authority state. Depositing requires a verified wallet so compensation can settle to a proven address.",
  "Deposit policy":
    "The organization deposit-approval policy state — e.g. critical source is blocked from deposit until the policy repairs it.",
  "Required denials":
    "How many deposit actions the authority currently denies. Each denied action is listed in the authority blockers.",
  "Authority root":
    "The source-safe hash anchoring this authority evaluation into proof readback — auditable without revealing policy internals.",
};

export const DEPOSIT_EARNING_ROW_EXPLAINERS: Record<string, string> = {
  "Likely demand":
    "The measured demand posture for this repository's supply, with the average confidence across demand signals.",
  "Unfit Need opportunities":
    "Read Needs the network could not satisfy that this repository's supply could serve — count and demand strength.",
  "Expected compensation":
    "The measured compensation range (sats) across the synthesized options if deposited and read against.",
  "Supply recommendations":
    "How many source-safe supply recommendations are approve-ready versus how many need repair before deposit.",
};

export const DEPOSIT_OPPORTUNITY_ROOT_EXPLAINER =
  "An unfit-Need opportunity: read demand the network could not satisfy that this repository's supply could serve. The root is the source-safe hash anchoring the opportunity into proof readback.";

export const DEPOSIT_PROOF_ROOT_EXPLAINERS: Record<string, string> = {
  "route-session-root":
    "The source-safe hash of this whole deposit route session — the single root a reader can verify the session against.",
  "synthesis-root":
    "The source-safe hash of the AssetPacksSynthesis output: the synthesized options, without any source-bearing content.",
  "policy-root":
    "The source-safe hash of the deposit policy report measuring option ROI posture.",
  "admission-root":
    "The source-safe hash of the admission report recording which options entered the Depository.",
  "earning-root":
    "The source-safe hash of the depositor earning supply intelligence measurement.",
  "authority-root":
    "The source-safe hash of the organization policy + wallet authority evaluation.",
};

export const DEPOSIT_DISCLOSURE_BOUNDARY_EXPLAINER =
  "The source-safety law for this page: which measurement categories are visible before payment, and which source-bearing materials stay withheld until BTC finality and BTD rights transfer.";

export const DEPOSIT_AUTHORITY_BLOCKERS_EXPLAINER =
  "The concrete deposit actions the organization authority currently denies, and why. Repairing these unblocks the Submit deposit stage.";

/**
 * Section (b) generic copy for the stat tooltips — the what-is-this-type
 * text rendered below the specific copy, per tooltip kicker.
 */
export const DEPOSIT_STAT_TOOLTIP_GENERICS = {
  sessionState:
    "Session state rows are the source-safe state of this deposit route — derived from the connected source package and this session's measurements, never from withheld source content.",
  governance:
    "Governance rows come from the organization policy + wallet authority evaluation that gates every deposit action; denied actions list their blockers.",
  earningIntelligence:
    "Earning intelligence rows come from the DepositorEarningSupplyIntelligence measurement: network demand, unfit-Need opportunities, and expected compensation for this supply.",
  opportunityRoot:
    "Proof roots are source-safe hashes anchoring measurements into proof readback — auditable without revealing withheld content.",
} as const;

/** Sections (c)+(d) per stat family — spread into every stat tooltip. */
export const DEPOSIT_STAT_TOOLTIP_SECTIONS = {
  sessionState: {
    points: [
      "Confirm the exact source package (repository · branch · commit) a synthesis measured",
      "Find the run id the pipelines table and telemetry detail attach to",
    ],
    references: {
      source: [
        "apps/uapi/app/deposits/DepositPageClient.tsx",
        "apps/uapi/components/deposits/models/deposit-route-model.ts",
      ],
      canon: ["BITCODE_SPEC_V48_NOTES.md § Deposit/Read product-surface presentation laws"],
    },
  },
  governance: {
    points: [
      "See why depositing is allowed or denied right now",
      "Trace a denial to its concrete blockers before repairing",
    ],
    references: {
      source: [
        "apps/uapi/app/deposits/DepositPageClient.tsx",
        "packages/asset-packs-pipelines/domain/src/organization-policy-wallet-authority.ts",
      ],
      canon: ["BITCODE_SPEC_V48_NOTES.md § Deposit/Read product-surface presentation laws"],
    },
  },
  earningIntelligence: {
    points: [
      "Gauge demand and expected compensation before spending synthesis effort",
      "Spot approve-ready versus repair-required supply recommendations",
    ],
    references: {
      source: [
        "apps/uapi/app/deposits/DepositPageClient.tsx",
        "packages/asset-packs-pipelines/domain/src/depositor-earning-supply-intelligence.ts",
      ],
      canon: ["BITCODE_SPEC_V48_NOTES.md § Deposit/Read product-surface presentation laws"],
    },
  },
  opportunityRoot: {
    points: [
      "Audit an opportunity against proof readback without seeing withheld content",
      "Cite the root when discussing the opportunity with the network",
    ],
    references: {
      source: [
        "apps/uapi/app/deposits/DepositPageClient.tsx",
        "packages/asset-packs-pipelines/domain/src/depositor-earning-supply-intelligence.ts",
      ],
      canon: ["BITCODE_SPEC_V48_NOTES.md § Deposit/Read product-surface presentation laws"],
    },
  },
} as const;
