/**
 * Docs content module: sections exchange.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const exchangeSections = [
  {
    id: 'exchange-role',
    eyebrow: 'Compatibility',
    title: '/exchange redirects to /packs',
    summary:
      '/exchange is retained only as a compatibility redirect. /packs is the current master-detail activity surface for repository scope, Need measurement, fit review, AssetPack evidence, proof rows, settlement receipts, and interface admissions.',
    detail:
      'The compatibility path must not become a parallel product. Connected apps, MCP, ChatGPT App, Bitcode Chat, and future commercial surfaces must reread the same proof-backed activity exposed through /packs.',
    reason:
      'This separation lets Bitcode preserve old links while preventing multiple inconsistent product centers.',
    points: [
      'Activity and selected detail must survive navigation and reread through /packs.',
      'Write paths must create durable source-safe records.',
      'Read paths must expose the same proof readback to admitted interfaces.',
    ],
  },
  {
    id: 'activity-ledger',
    eyebrow: 'Ledger',
    title: 'The activity ledger is the main /packs read window',
    summary:
      '/packs activity records deposit-side deposits, measured Reads, AssetPack executions, proof posture, settlement, and history in one searchable ledger.',
    detail:
      'The ledger is not just a table. It is the readable index of what happened, why it happened, and which exact detail surface should be opened next.',
    reason:
      'If a write cannot be reread from the ledger, the product cannot prove an AssetPack path to a user.',
    points: [
      'Search and filters keep large activity sets usable.',
      'Selected detail carries proofs, branch artifacts, settlement, and history.',
      'Route-owned query state makes activity review shareable and recoverable.',
    ],
  },
  {
    id: 'persistence',
    eyebrow: 'Persistence',
    title: '/packs reread is what turns actions into evidence',
    summary:
      'A write is not trusted merely because a button returned success. The expected result is durable /packs reread with the right proof, readiness, and state posture.',
    detail:
      'The active Protocol treats persistence, schema, route-owned state, execution history, and final work summaries as part of the product truth rather than incidental backend storage.',
    reason:
      'AssetPacks require state that can be audited later by a different surface, not just local UI continuity.',
    steps: [
      'Write through /deposits, /reads, Bitcode Chat, MCP, or another admitted interface.',
      'Persist normalized evidence and activity context into source-safe activity state.',
      'Reread the activity and selected detail in /packs before trusting fit, proof, or settlement.',
    ],
  },
] as const satisfies readonly DocsGuideCard[];
