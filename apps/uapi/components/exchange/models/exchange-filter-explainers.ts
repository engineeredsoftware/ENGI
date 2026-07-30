/**
 * Rich explainers for the Packs master filter bar.
 * Same BitcodeExplainer shape as pipeline transaction filters.
 */

import type { BitcodeExplainer } from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';

function buildExplainer(explainer: BitcodeExplainer): BitcodeExplainer {
  return explainer;
}

const SOURCE_REFS = [
  'apps/uapi/components/exchange/ExchangeActivityFilterBar/ExchangeActivityFilterBar.tsx',
  'apps/uapi/components/exchange/models/exchange-format.ts',
  'apps/uapi/components/bitcode/activity/PackActivityModel/pack-activity-model.ts',
] as const;

const CANON_REFS = [
  'BITCODE_SPEC_V48_NOTES.md — product routes pluralize + master-detail pipelines',
  'BITCODE_SPEC_V48_NOTES.md — Packs as network ledger of DataPack commodity posture',
] as const;

const refs = {
  source: [...SOURCE_REFS],
  canon: [...CANON_REFS],
} as const;

export const PACKS_FILTER_EXPLAINERS = {
  search: buildExplainer({
    kicker: 'Master table control',
    title: 'Search pack activity',
    summary:
      'Find DataPacks and pack-side measurements by free text across titles, measurement labels, absolute claims, proof roots, and state strings.',
    detail:
      'Use this when you know a fragment of the pack story but not which row it lives on. Search narrows the master list without leaving the Packs route or clearing facet filters.',
    points: [
      'Matches pack titles, measurements, absolutes, proofs, and state language',
      'Combines with type, state, sort, and facet filters',
      'Keeps the selected detail route intact while the master window shrinks',
    ],
    references: refs,
  }),
  type: buildExplainer({
    kicker: 'Commodity lens',
    title: 'DataPack type',
    summary:
      'Limit the ledger to your packs, network depository supply, settled commodity, payouts awaiting seller finalize, or keep the full window.',
    detail:
      '“My DataPacks” is your ownership cut: reads you bought, deposits still unsettled in the depository, and deposits that have settled. “Needs payout review” is settled commodity still in escrow (pending-seller-review) until the seller finalizes BTD vs pay-asset split. Network Depository / Settled cuts show the public commodity ledger. “All DataPacks” restores the unscoped window.',
    points: [
      'My DataPacks = read (bought) + deposited (unsettled) + deposited (settled)',
      'My reads / My deposits subtypes narrow that ownership cut further',
      'Needs payout review = settled rows still pending seller BTD/pay finalize',
      'Depository / Settled network cuts are market-wide commodity posture',
      'Does not replace settlement / compensation / delivery / repair facets',
    ],
    references: refs,
  }),
  state: buildExplainer({
    kicker: 'Lifecycle filter',
    title: 'State filter',
    summary:
      'Match a free-text lifecycle or posture token when the row’s primary state string is what you are hunting for.',
    detail:
      'State is a lightweight string filter for the pack’s surfaced primary state. Prefer the four economic facets below when you need settlement, compensation, delivery, or repair specifically.',
    points: [
      'Substring match on the primary state field',
      'Leave blank to ignore primary state',
      'Facets below are more precise for economic axes',
    ],
    references: refs,
  }),
  sort: buildExplainer({
    kicker: 'Ordering control',
    title: 'Sort column',
    summary:
      'Choose which pack axis orders the master table: time, title, value, or one of the four economic state facets.',
    detail:
      'Sort only reorders the current filtered window. Pair with ASC/DESC to flip chronological or alphabetical direction without changing which rows remain visible.',
    points: [
      'Time is the default operational ordering',
      'Value sorts by surfaced commercial magnitude',
      'Economic facet sorts group packs by settlement / compensation / delivery / repair posture',
    ],
    references: refs,
  }),
  direction: buildExplainer({
    kicker: 'Ordering control',
    title: 'Sort direction',
    summary: 'Flip ascending vs descending order on the selected sort column.',
    detail:
      'DESC is the usual “newest / largest first” reading for live operator review. ASC is useful when you want the earliest or smallest edge of the same filtered set.',
    points: [
      'Toggles only direction — not the sort key',
      'Applies to the active sort column immediately',
    ],
    references: refs,
  }),
  settlementState: buildExplainer({
    kicker: 'Economic facet',
    title: 'Settlement facet',
    summary:
      'Filter by quote, payment, finality, or other settlement-state readback attached to each pack row.',
    detail:
      'Settlement is the commercial finality axis: whether value transfer and settlement posture have advanced. Use when the question is “has this pack settled?” rather than delivery or repair.',
    points: [
      'Targets settlementState on pack activity rows',
      'Independent of compensation, delivery, and repair facets',
      'Empty means no settlement facet constraint',
    ],
    references: refs,
  }),
  compensationState: buildExplainer({
    kicker: 'Economic facet',
    title: 'Compensation facet',
    summary:
      'Filter by source-to-shares and contributor compensation posture read back on each pack.',
    detail:
      'Compensation tracks how contributor and source-share economics are represented after measurement and settlement framing — not whether the pack delivered or needs repair.',
    points: [
      'Targets compensationState on pack activity rows',
      'Useful for contributor / earnings review',
      'Empty means no compensation facet constraint',
    ],
    references: refs,
  }),
  deliveryState: buildExplainer({
    kicker: 'Economic facet',
    title: 'Delivery facet',
    summary:
      'Filter by delivery / handoff posture — whether measured knowledge was delivered under the pack’s commercial terms.',
    detail:
      'Delivery is the fulfillment axis after or alongside settlement. Use when isolating packs that still need delivery follow-through versus packs already handed off.',
    points: [
      'Targets deliveryState on pack activity rows',
      'Orthogonal to settlement finality and repair',
      'Empty means no delivery facet constraint',
    ],
    references: refs,
  }),
  repairState: buildExplainer({
    kicker: 'Economic facet',
    title: 'Repair facet',
    summary:
      'Filter by repair / remediation posture when a pack or its proofs need operator repair work.',
    detail:
      'Repair surfaces fail-closed or remediable posture without hiding the rest of the commodity ledger. Use to isolate packs that need attention rather than completed commercial flow.',
    points: [
      'Targets repairState on pack activity rows',
      'Useful for remediation queues and proof repair',
      'Empty means no repair facet constraint',
    ],
    references: refs,
  }),
  absoluteKind: buildExplainer({
    kicker: 'Absolute measurement filters',
    title: 'Absolute volume clauses',
    summary:
      'Keep only DataPacks whose absolute measurements satisfy one or more kind · operator · volume clauses (AND). Operators: >, ≥, <, ≤, = against a 0–1 volume.',
    detail:
      'Each clause picks a catalogue kind (SSOT DATA_PACK_ABSOLUTE_KIND_SPECS), a comparison operator, and a volume in [0,1]. Multiple clauses must all match. URL SSOT: absoluteFilters=kind:op:volume,kind:op:volume (legacy absoluteKind + minAbsoluteVolume still maps to a single ≥ clause). The filter never invents a volume — missing kind or volume fails the clause (except ≥ 0 presence).',
    points: [
      'Ops: gt, gte, lt, lte, eq on absolute volume 0..1',
      'Multi-clause AND — stack several measurements',
      'Full catalogue (65 kinds) — not a hand list',
      'Combines with free-text search and economic facets',
    ],
    references: {
      source: [
        ...SOURCE_REFS,
        'apps/uapi/components/exchange/models/absolute-measurement-filters.ts',
      ],
      canon: [...CANON_REFS],
    },
  }),
} as const;

export type PacksFilterExplainerKey = keyof typeof PACKS_FILTER_EXPLAINERS;
