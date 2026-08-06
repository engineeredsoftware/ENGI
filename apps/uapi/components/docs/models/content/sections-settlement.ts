/**
 * Docs: Settlement, BTD volume/rights, BTC finality.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const settlementSections = [
  {
    id: 'btd-accounting',
    eyebrow: 'BTD and BTC',
    title: 'Settlement turns accepted DataPack evidence into exact, rereadable accounting',
    summary:
      'BTD records knowledge volume and rights from contribution, needs-fits measurement, participation, and proof posture. Bitcoin is settlement money: it pays the quote and unlocks rights transfer only after finality.',
    detail:
      'User-facing truth is simple: measured knowledge can become attributable pack value. Protocol truth is strict: volume conservation, fit-quality receipts, journals, finality, rights transfer, and policy-bound execution must agree. Settlement is proven on a fully open-source, decentralized, and auditable ledger — not by a UI success state alone.',
    reason:
      'Settlement is where DataPacks become economically meaningful instead of only technically interesting.',
    points: [
      'Needs-fits quality affects BTD volume posture and BTC quote posture.',
      'Journals and receipts make allocation rereadable on /exchange.',
      'Wallet readiness, BTC finality, and BTD rights decide whether delivery may unlock.',
    ],
  },
  {
    id: 'payment-modes',
    eyebrow: 'Payment modes',
    title: 'Base-layer, repeated-read, and sidechain modes are interface responsibilities',
    summary:
      'Protocol records mainchain execution, repeated-read payment execution, and sidechain execution as hardened interface duties — not marketing labels.',
    detail:
      'In commercial testnet, BTC amounts are free testnet units while ordering and proof rules still follow production-intended law. Value-bearing mainnet remains blocked until a promoted version authorizes it. Docs teach what each mode would prove and which blockers keep it staged.',
    reason:
      'Commercial credibility depends on distinguishing rehearsal money from live value-bearing execution.',
  },
] as const satisfies readonly DocsGuideCard[];
