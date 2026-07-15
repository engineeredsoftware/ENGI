/**
 * Docs: AssetPacks, BTD, and the activity ledger.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';
import { BITCODE_PUBLIC_EXPLAINERS } from '@/components/bitcode/layout/BitcodePublicExplainers/bitcode-public-explainers';

export const sourceSharesSections = [
  {
    id: 'share-object',
    eyebrow: 'AssetPacks',
    title: 'What Bitcode measures and what it withholds',
    summary:
      'Bitcode turns permitted technical source into tradable, measured intelligence — not inert file attachments and not unprotected source dumps.',
    detail:
      'Code, files, designs, data, notes, and repository context enter as supply. Bitcode synthesizes AssetPacks, scores needs-fits, and exposes measurements and proof roots on the market path. Protected IP stays behind obfuscation and rights gates until settlement unlocks delivery. Seller view: permitted source, obfuscations, synthesized pack. Buyer view: measurements, needs-fits scores, knowledge volume.',
    reason:
      'An AssetPack is only credible when source posture, demand measurement, proof, BTD volume/rights, and BTC settlement can be reread together without leaking unpaid source.',
    points: [
      'Supply is deposited as measured, listed IP you approve.',
      'Demand is a Reading that becomes needs-fits scores and quotes.',
      'Settlement finality and BTD rights decide whether pack contents may deliver.',
    ],
  },
  {
    id: 'market-frame',
    eyebrow: 'Packs',
    title: BITCODE_PUBLIC_EXPLAINERS.network.title,
    summary: BITCODE_PUBLIC_EXPLAINERS.network.summary,
    detail: BITCODE_PUBLIC_EXPLAINERS.network.detail ?? '',
    reason:
      'The Packs ledger introduces network activity without forcing a first-time reader into raw proof artifacts.',
    points: BITCODE_PUBLIC_EXPLAINERS.network.points,
  },
  {
    id: 'value-flow',
    eyebrow: 'Value flow',
    title: 'Deposit → Read → Fit → Prove → Settle → Deliver',
    summary:
      'For a new reader the market path is linear: list supply, measure need, compare fits, produce proofs, settle in BTC, transfer BTD rights, deliver knowledge.',
    detail:
      '/deposits, /reads, and /packs each expose stages of that chain so operators can see both the write that changes state and the read surface that proves what happened next. Interfaces must preserve the same chain.',
    reason:
      'The linear path is the teaching model. The underlying system is richer, but every advanced interface still has to honor this order of truth.',
    points: [
      'Deposit writes searchable, source-safe supply.',
      'Read writes measured demand and settlement for delivery.',
      'Packs rereads proof-backed BTC finality, BTD rights, compensation, and delivery posture.',
    ],
  },
] as const satisfies readonly DocsGuideCard[];
