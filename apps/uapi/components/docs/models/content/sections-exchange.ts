/**
 * Docs: /exchange compatibility and /exchange activity ledger.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const exchangeSections = [
  {
    id: 'exchange-role',
    eyebrow: 'Compatibility',
    title: '/exchange redirects to /exchange',
    summary:
      '/exchange is retained only as a compatibility redirect. /exchange is the durable master-detail surface for DataPack activity, proof roots, settlement, compensation, delivery, and repair.',
    detail:
      'The compatibility path must not become a parallel product. MCP, ChatGPT App, Bitcode Chat, GitHub, and future interfaces must reread the same proof-backed activity exposed through /exchange.',
    reason:
      'Old links can survive without inventing a second center of product truth.',
    points: [
      'Activity and selected detail must survive navigation and reread through /exchange.',
      'Write paths must create durable source-safe records.',
      'Read paths must expose the same proof readback to admitted interfaces.',
    ],
  },
  {
    id: 'activity-ledger',
    eyebrow: 'Ledger',
    title: 'The activity ledger is the main /exchange read window',
    summary:
      '/exchange records deposits, measured Reads, DataPack executions, proof posture, settlement, and history in one searchable ledger.',
    detail:
      'The ledger is not only a table. It is the readable index of what happened, why it happened, and which detail panel to open next — seller and buyer views of the same commercial object.',
    reason:
      'If a write cannot be reread from the ledger, the product cannot prove a DataPack path to an operator.',
    points: [
      'Search and filters keep large activity sets usable.',
      'Selected detail carries proofs, settlement, BTD/BTC posture, and history.',
      'Route-owned query state makes review shareable and recoverable.',
    ],
  },
  {
    id: 'persistence',
    eyebrow: 'Persistence',
    title: '/exchange reread is what turns actions into evidence',
    summary:
      'A write is not trusted merely because a control returned success. The expected result is durable /exchange reread with the right proof, readiness, and state posture.',
    detail:
      'Protocol treats persistence, schema, route-owned state, execution history, and work summaries as product truth — not incidental backend storage.',
    reason:
      'DataPacks require state that a different surface can audit later, not only local UI continuity.',
    steps: [
      'Write through /deposits, /reads, Bitcode Chat, MCP, or another admitted interface.',
      'Persist normalized, source-safe activity evidence.',
      'Reread the activity and selected detail in /exchange before trusting fit, proof, or settlement.',
    ],
  },
] as const satisfies readonly DocsGuideCard[];
