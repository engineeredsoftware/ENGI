/**
 * Docs: operator orientation across product routes.
 * Legacy "Terminal" naming in explainers is mapped to Packs / Deposit / Read language.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';
import { TERMINAL_INLINE_EXPLAINERS, TERMINAL_WORKSPACE_EXPLAINERS } from '@/components/bitcode/pipeline/models/workspace-explainers';

export const productSections = [
  {
    id: 'experience-map',
    eyebrow: 'Product map',
    title: 'Packs is the durable ledger; Deposit and Read are the write paths',
    summary:
      'Treat /packs as the activity master-detail you reread after work, /deposits as supply synthesis and listing, and /reads as demand measurement and paid delivery.',
    detail:
      'Deeper modes — Auxillaries and Conversations — support readiness and drafting. They must not invent a second ledger. Every bounded write should leave source-safe activity that /packs can reopen.',
    reason:
      'One map keeps the product learnable: write on Deposit or Read, audit on Packs, configure in Auxillaries.',
    points: [
      'Packs owns searchable activity and expandable proof/settlement detail.',
      'Deposit and Read own the shortest seller and buyer loops.',
      'Auxillaries and Conversations are deliberate follow-through, not parallel products.',
    ],
  },
  {
    id: 'read-window',
    eyebrow: 'Read',
    title: TERMINAL_INLINE_EXPLAINERS.readWindow.title,
    summary:
      'The read surfaces on product routes show whether a Bitcode action actually changed proof-bearing state.',
    detail:
      TERMINAL_INLINE_EXPLAINERS.readWindow.detail ??
      'Prefer /packs selected detail and route-owned proof panels over ephemeral success toasts.',
    reason:
      'Operators learn whether work completed by rereading evidence, not by button feedback alone.',
  },
  {
    id: 'write-posture',
    eyebrow: 'Write',
    title: TERMINAL_INLINE_EXPLAINERS.writePosture.title,
    summary:
      'Writes stay bounded because Bitcode has proof, wallet, repository, disclosure, and settlement consequences.',
    detail: TERMINAL_INLINE_EXPLAINERS.writePosture.detail ?? '',
    reason:
      'Bounded writes keep commercial and proof posture coherent across product and interface surfaces.',
  },
  {
    id: 'mode-rail',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.railModes.kicker ?? 'Modes',
    title: 'Auxillaries and Conversations must not erase pack activity context',
    summary:
      'Mode changes are useful only when the reader never loses the active /packs activity or deposit/read work context.',
    detail: TERMINAL_WORKSPACE_EXPLAINERS.railModes.detail ?? '',
    reason:
      'Supporting modes exist to configure or draft — not to replace the ledger.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.railModes.points,
  },
  {
    id: 'repository-supply',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.repositorySupply.kicker ?? 'Source',
    title: 'Repository scope is the deposit-side boundary',
    summary:
      'Permitted source comes from authorized repositories. Every deposit and downstream proof depends on that scope staying explicit.',
    detail: TERMINAL_WORKSPACE_EXPLAINERS.repositorySupply.detail ?? '',
    reason:
      'Without clear repository attachment, synthesis and settlement readiness cannot be trusted.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.repositorySupply.points,
  },
] as const satisfies readonly DocsGuideCard[];
