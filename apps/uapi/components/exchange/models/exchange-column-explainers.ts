/**
 * Rich explainers for Packs master table columns.
 * Same BitcodeExplainer shape as BITCODE_TRANSACTION_COLUMN_EXPLAINERS.
 */

import type { BitcodeExplainer } from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';

function buildExplainer(explainer: BitcodeExplainer): BitcodeExplainer {
  return explainer;
}

const SOURCE_REFS = [
  'apps/uapi/components/exchange/ExchangeActivityTable/ExchangeActivityTable.tsx',
  'apps/uapi/components/bitcode/activity/PackActivityModel/pack-activity-model.ts',
  'apps/uapi/components/exchange/models/exchange-format.ts',
] as const;

const CANON_REFS = [
  'BITCODE_SPEC_V48_NOTES.md — Packs as network ledger of DataPack commodity posture',
  'BITCODE_SPEC_V48_NOTES.md — product routes pluralize + master-detail pipelines',
] as const;

const refs = {
  source: [...SOURCE_REFS],
  canon: [...CANON_REFS],
} as const;

export const PACKS_COLUMN_EXPLAINERS = {
  pack: buildExplainer({
    kicker: 'Master column',
    title: 'Pack column',
    summary:
      'Shows the DataPack title, short description, and activity id that open the selected detail view.',
    detail:
      'Selecting a row here drills into source-safe proof, settlement, compensation, and delivery without leaving the Packs route.',
    points: [
      'Primary row selector for the network ledger',
      'Carries human-readable title plus stable pack activity id',
    ],
    references: refs,
  }),
  measurements: buildExplainer({
    kicker: 'Evidence column',
    title: 'Measurements column',
    summary:
      'Surfaces the leading source-safe measurement chips for the pack row (labels, values, units).',
    detail:
      'Use this to scan economic and technical claims at table scale before opening full measurement and proof detail.',
    points: [
      'Shows up to four measurement chips with overflow count',
      'Pairs with Value and Settlement for economic triage',
    ],
    references: refs,
  }),
  type: buildExplainer({
    kicker: 'Kind column',
    title: 'Kind column',
    summary:
      'DataPack product kind: Capabilities (capability-slice), Patterns (implementation-pattern), or Operations (proof-operations-slice).',
    detail:
      'Kind is the three-way commercial taxonomy of synthesized deposit options — not activity taxonomy (depository vs settled).',
    points: [
      'capability-slice · implementation-pattern · proof-operations-slice',
      'Canonical value shown under the human label',
    ],
    references: refs,
  }),
  value: buildExplainer({
    kicker: 'BTD column',
    title: 'BTD column',
    summary:
      'Unsettled packs show absolute-derived BTD estimates (honesty class: estimate). Settled packs show final BTD / sats after mint.',
    detail:
      'Never uses size chips (function-count) as value. Unsettled BTD is not minted rights — reader settlement finalizes BTD.',
    points: [
      'BTD (est.) for depository / unsettled rows',
      'Final BTD or sats after settlement rights transfer',
    ],
    references: refs,
  }),
  settlement: buildExplainer({
    kicker: 'Closure column',
    title: 'Settlement column',
    summary:
      'Shows settlement posture for the pack (ready, blocked, settled, or intermediate state).',
    detail:
      'Use settlement when the question is whether the pack is economically closed or still open for settlement review.',
    points: [
      'Pills mirror detail-state language',
      'Pairs with Delivery for end-to-end posture',
    ],
    references: refs,
  }),
  delivery: buildExplainer({
    kicker: 'Fulfillment column',
    title: 'Delivery column',
    summary:
      'Shows delivery posture for the pack (withheld, available, delivered, or blocked).',
    detail:
      'Delivery answers whether rights-bearing content can be fulfilled after settlement, independent of raw proof depth.',
    points: [
      'Separates economic settlement from content delivery',
      'Useful when scanning for packs still blocked on delivery',
    ],
    references: refs,
  }),
  time: buildExplainer({
    kicker: 'Time column',
    title: 'Time column',
    summary:
      'Shows the surfaced activity timestamp so the network ledger reads as a time-aware commodity table.',
    detail:
      'Time ordering matters when the same DataPack lineage has multiple adjacent activity events.',
    points: [
      'Pairs with sort-by-time and direction filters',
      'Useful during incident or replay review',
    ],
    references: refs,
  }),
} as const;

export type PacksColumnExplainerKey = keyof typeof PACKS_COLUMN_EXPLAINERS;
