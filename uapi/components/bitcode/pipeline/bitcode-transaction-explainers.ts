import type { BitcodeExplainer } from './bitcode-transaction-types';

function buildExplainer(explainer: BitcodeExplainer): BitcodeExplainer {
  return explainer;
}

const TRANSACTION_EXPLAINER_SOURCE_REFS = [
  'uapi/components/bitcode/pipeline/BitcodeTransactionsTable.tsx',
  'uapi/components/bitcode/pipeline/BitcodeTransactionsFilterBar.tsx',
  'uapi/components/bitcode/pipeline/models/pipeline-selection-query.ts',
] as const;
const TRANSACTION_EXPLAINER_CANON_REFS = [
  'BITCODE_SPEC_V48_NOTES.md — product routes pluralize + master-detail pipelines',
  'BITCODE_SPEC_V48_NOTES.md — deposit/read product-surface presentation laws',
] as const;

export const BITCODE_TRANSACTION_FILTER_EXPLAINERS = {
  search: buildExplainer({
    kicker: 'Master table control',
    title: 'Search Bitcode activity',
    summary: 'Find Bitcode activity by id, repository, branch, participant, proof posture, or summary language from one terminal-style search field.',
    detail:
      'Use this first when you know the activity context but not the exact row position. The selected detail route stays intact while the master window narrows around it.',
    points: [
      'Searches across core surfaced activity fields',
      'Keeps the Bitcode Terminal fast without route changes',
    ],
    references: { source: [...TRANSACTION_EXPLAINER_SOURCE_REFS], canon: [...TRANSACTION_EXPLAINER_CANON_REFS] },
  }),
  status: buildExplainer({
    kicker: 'Lifecycle filter',
    title: 'Status filter',
    summary: 'Narrow the ledger to Bitcode activity that is running, completed, or fail-closed.',
    detail: 'Use status when the question is operational posture rather than repository or participant ownership.',
    points: ['Running work stays distinct from settled history', 'Fail-closed rows remain easy to isolate'],
    references: { source: [...TRANSACTION_EXPLAINER_SOURCE_REFS], canon: [...TRANSACTION_EXPLAINER_CANON_REFS] },
  }),
  ownership: buildExplainer({
    kicker: 'Perspective filter',
    title: 'Ownership filter',
    summary: 'Switch between your own Bitcode activity and broader Exchange-visible activity without changing the detail surface.',
    detail: 'This keeps one shared read surface while still letting you separate personal work from wider Source Shares participation.',
    points: ['Supports mine vs Exchange posture', 'Preserves the same detail route and tools'],
    references: { source: [...TRANSACTION_EXPLAINER_SOURCE_REFS], canon: [...TRANSACTION_EXPLAINER_CANON_REFS] },
  }),
  transactionLens: buildExplainer({
    kicker: 'Action filter',
    title: 'Action lens filter',
    summary: 'Focus the master table on Deposit, Read, or Closure posture so the main Bitcode actions stay readable.',
    detail: 'Use lens when you want the table to read by intent rather than by raw pipeline type names.',
    points: ['Deposit is searchable supply', 'Read is measured demand', 'Closure is consequence and proof'],
    references: { source: [...TRANSACTION_EXPLAINER_SOURCE_REFS], canon: [...TRANSACTION_EXPLAINER_CANON_REFS] },
  }),
  repository: buildExplainer({
    kicker: 'Boundary filter',
    title: 'Repository filter',
    summary: 'Limit the table to one repository boundary when multiple Bitcode contexts are visible.',
    detail: 'Repository filtering is useful when several repos are visible but one coherent chain matters at a time.',
    points: ['Keeps branch and repo context explicit', 'Reduces cross-repo noise in live or review windows'],
    references: { source: [...TRANSACTION_EXPLAINER_SOURCE_REFS], canon: [...TRANSACTION_EXPLAINER_CANON_REFS] },
  }),
  participant: buildExplainer({
    kicker: 'Principal filter',
    title: 'Participant filter',
    summary: 'Filter by the surfaced producer, consumer, partner, researcher, or participant label attached to each row.',
    detail: 'Participant is the easiest way to read the master table as a shared operating ledger instead of a private queue.',
    points: ['Supports principal-scoped review', 'Works alongside ownership and repository filters'],
    references: { source: [...TRANSACTION_EXPLAINER_SOURCE_REFS], canon: [...TRANSACTION_EXPLAINER_CANON_REFS] },
  }),
  proofStatus: buildExplainer({
    kicker: 'Closure filter',
    title: 'Proof posture filter',
    summary: 'Reduce the table by witness, verification, or ready-for-review posture so closure work can be isolated quickly.',
    detail: 'Use this when the question is not “what happened?” but “which transactions are ready, blocked, or still proving?”.',
    points: ['Useful for settlement review', 'Useful for proof refresh and replay inspection'],
    references: { source: [...TRANSACTION_EXPLAINER_SOURCE_REFS], canon: [...TRANSACTION_EXPLAINER_CANON_REFS] },
  }),
  sort: buildExplainer({
    kicker: 'Ordering control',
    title: 'Sort order',
    summary: 'Re-order the Bitcode Terminal by recency or economic weight without changing what transaction is selected.',
    detail: 'Sorting changes the view, not the route. You can compare the ledger from multiple angles without losing detail context.',
    points: ['Supports newest, oldest, token-heavy, and BTC-fee-basis reads'],
    references: { source: [...TRANSACTION_EXPLAINER_SOURCE_REFS], canon: [...TRANSACTION_EXPLAINER_CANON_REFS] },
  }),
  pageSize: buildExplainer({
    kicker: 'Window control',
    title: 'Page size',
    summary: 'Change how much of the ledger is visible at once while keeping pagination shareable in the route.',
    detail: 'Use a smaller window for fast investigation and a larger window when reading several related rows in sequence.',
    points: ['Pagination remains route-owned', 'Good for both live operations and review posture'],
    references: {
      source: [
        ...TRANSACTION_EXPLAINER_SOURCE_REFS,
        'uapi/components/bitcode/pipeline/BitcodeTransactionsPagination.tsx',
      ],
      canon: [...TRANSACTION_EXPLAINER_CANON_REFS],
    },
  }),
} as const;

export const BITCODE_TRANSACTION_COLUMN_EXPLAINERS = {
  transaction: buildExplainer({
    kicker: 'Master column',
    title: 'Activity column',
    summary: 'Shows the activity id, activity type, and one-line summary that anchors the selected detail view.',
    detail: 'Selecting a row here loads the central detail surface without pushing you out to another surface.',
    points: ['Primary row selector', 'Carries the human-readable summary'],
    references: { source: [...TRANSACTION_EXPLAINER_SOURCE_REFS], canon: [...TRANSACTION_EXPLAINER_CANON_REFS] },
  }),
  lens: buildExplainer({
    kicker: 'Intent column',
    title: 'Lens column',
    summary: 'Shows whether the row currently reads as Deposit, Read, or Closure posture inside the Bitcode chain.',
    detail: 'Lens is for fast interpretation. It lets the table read by intent instead of forcing pipeline names to do all the work.',
    points: ['Maps the row back to the main Bitcode actions', 'Supports quick triage at table scale'],
    references: { source: [...TRANSACTION_EXPLAINER_SOURCE_REFS], canon: [...TRANSACTION_EXPLAINER_CANON_REFS] },
  }),
  status: buildExplainer({
    kicker: 'Lifecycle column',
    title: 'Status column',
    summary: 'Shows whether the row is active, completed, or failed closed.',
    detail: 'Status keeps the master window readable as a live ledger instead of a flat archive.',
    points: ['Use with proof posture for deeper closure triage'],
    references: { source: [...TRANSACTION_EXPLAINER_SOURCE_REFS], canon: [...TRANSACTION_EXPLAINER_CANON_REFS] },
  }),
  participant: buildExplainer({
    kicker: 'Principal column',
    title: 'Participant column',
    summary: 'Shows the surfaced principal plus whether the activity is yours or broader Exchange activity.',
    detail: 'This is the quickest way to see who the row belongs to before reading proofs, history, or asset packs.',
    points: ['Carries both label and mine/Exchange context'],
    references: { source: [...TRANSACTION_EXPLAINER_SOURCE_REFS], canon: [...TRANSACTION_EXPLAINER_CANON_REFS] },
  }),
  repository: buildExplainer({
    kicker: 'Boundary column',
    title: 'Repository column',
    summary: 'Shows the repository and branch or ref tied to the activity row.',
    detail: 'Repository context keeps the Bitcode activity ledger tied back to concrete source boundaries.',
    points: ['Useful during multi-repo review', 'Useful during branch artifact inspection'],
    references: { source: [...TRANSACTION_EXPLAINER_SOURCE_REFS], canon: [...TRANSACTION_EXPLAINER_CANON_REFS] },
  }),
  proof: buildExplainer({
    kicker: 'Closure column',
    title: 'Proof column',
    summary: 'Shows the bounded proof posture and current closure focus before the row is opened in detail.',
    detail: 'Read this column when you want the table to answer “how close to closure is this?” at a glance.',
    points: ['Pairs proof posture with closure focus', 'Supports witness and settlement triage'],
    references: { source: [...TRANSACTION_EXPLAINER_SOURCE_REFS], canon: [...TRANSACTION_EXPLAINER_CANON_REFS] },
  }),
  started: buildExplainer({
    kicker: 'Time column',
    title: 'Started column',
    summary: 'Shows the surfaced start time so the master table reads as a time-aware operating ledger.',
    detail: 'Time ordering matters when the same repository or participant has multiple adjacent Bitcode activity runs in motion.',
    points: ['Useful with newest/oldest sort', 'Useful during incident or replay review'],
    references: { source: [...TRANSACTION_EXPLAINER_SOURCE_REFS], canon: [...TRANSACTION_EXPLAINER_CANON_REFS] },
  }),
} as const;

export const BITCODE_PAYLOAD_INSPECTOR_EXPLAINERS = {
  modes: buildExplainer({
    kicker: 'Detail reader',
    title: 'Visual and raw modes',
    summary: 'Switch between a curated visual read and the exact JSON payload that powers the detail card.',
    detail: 'Visual mode is for rapid interpretation. Raw JSON is for proving, typing, and exact inspection.',
    points: ['Visual mode favors fast consequence reading', 'Raw mode preserves the exact application payload'],
    references: {
      source: [
        ...TRANSACTION_EXPLAINER_SOURCE_REFS,
        'uapi/components/bitcode/pipeline/BitcodePayloadInspector.tsx',
      ],
      canon: [...TRANSACTION_EXPLAINER_CANON_REFS],
    },
  }),
  structuredPayload: buildExplainer({
    kicker: 'Shape summary',
    title: 'Structured payload shape',
    summary: 'Summarizes the payload root kind, top-level sections, and visible counts before you expand the full tree.',
    detail: 'This is the fastest way to answer “what kind of payload is this?” without reading raw JSON.',
    points: ['Surface-first structural summary', 'Useful before tree or raw inspection'],
    references: {
      source: [
        ...TRANSACTION_EXPLAINER_SOURCE_REFS,
        'uapi/components/bitcode/pipeline/BitcodePayloadShape.tsx',
      ],
      canon: [...TRANSACTION_EXPLAINER_CANON_REFS],
    },
  }),
  payloadTree: buildExplainer({
    kicker: 'Field tree',
    title: 'Payload field tree',
    summary: 'Expands the payload into a bounded nested field tree with type badges and readable paths.',
    detail: 'The tree is designed for structural inspection when raw JSON is too dense but you still read exact field visibility.',
    points: ['Shows nested shape without dropping into raw JSON', 'Keeps type and hierarchy visible together'],
    references: {
      source: [
        ...TRANSACTION_EXPLAINER_SOURCE_REFS,
        'uapi/components/bitcode/pipeline/BitcodePayloadTree.tsx',
      ],
      canon: [...TRANSACTION_EXPLAINER_CANON_REFS],
    },
  }),
  rawPayload: buildExplainer({
    kicker: 'Exact payload',
    title: 'Raw payload view',
    summary: 'Shows the exact JSON payload used by the selected detail surface and makes it copyable for proving or debugging.',
    detail: 'Use this when you read exact field values, witness material, schema alignment, or external debugging support.',
    points: ['Copyable exact payload', 'Preserves the truth feeding the UI'],
    references: {
      source: [
        ...TRANSACTION_EXPLAINER_SOURCE_REFS,
        'uapi/components/bitcode/pipeline/BitcodePayloadInspector.tsx',
      ],
      canon: [...TRANSACTION_EXPLAINER_CANON_REFS],
    },
  }),
} as const;
