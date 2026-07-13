/**
 * Docs content module: sections source shares.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';
import { BITCODE_PUBLIC_EXPLAINERS } from '@/components/bitcode/layout/BitcodePublicExplainers/bitcode-public-explainers';

export const sourceSharesSections = [
  {
    id: 'share-object',
    eyebrow: 'AssetPacks',
    title: 'What Bitcode is measuring',
    summary:
      'Bitcode turns source material into tradable, measured technical intelligence rather than treating files as inert attachments.',
    detail:
      'Code, docs, diagrams, PDFs, notes, commits, citations, authorship, and metadata enter as source supply. Bitcode measures that supply against Need, fit, quality, provenance, and proof posture so useful technical intelligence can become source-safe AssetPack commodity.',
    reason:
      'The AssetPack is only credible when source, demand, proof, BTD scalar volume and rights, and BTC settlement can be reread together.',
    points: [
      'Supply is deposited as deposit-side source.',
      'Demand is expressed as a measured Read.',
      'Fit, proof, BTC finality, and BTD rights decide whether source can move toward delivery.',
    ],
  },
  {
    id: 'market-frame',
    eyebrow: 'Packs',
    title: BITCODE_PUBLIC_EXPLAINERS.network.title,
    summary: BITCODE_PUBLIC_EXPLAINERS.network.summary,
    detail: BITCODE_PUBLIC_EXPLAINERS.network.detail ?? '',
    reason:
      'The public Packs view introduces the activity ledger without forcing a first-time reader into proof detail too early.',
    points: BITCODE_PUBLIC_EXPLAINERS.network.points,
  },
  {
    id: 'value-flow',
    eyebrow: 'Value flow',
    title: 'Deposit -> Read -> Fit -> Prove -> Settle -> Deliver',
    summary:
      'The market path is intentionally linear for a new reader: source is given, Need is measured, fits are reviewed, proofs are produced, BTC settlement is read, BTD rights transfer, and repository delivery completes.',
    detail:
      '/deposits, /reads, and /packs expose each stage so an operator can see both the write action that changes state and the read surface that proves what happened next.',
    reason:
      'The linear path is a teaching model. The under-the-hood system remains richer, but every advanced interface still has to preserve this chain.',
    points: [
      'Deposit writes searchable supply.',
      'Read writes measured demand.',
      'Settlement reads proof-backed BTC finality, BTD rights, compensation, and delivery posture.',
    ],
  },
] as const satisfies readonly DocsGuideCard[];
