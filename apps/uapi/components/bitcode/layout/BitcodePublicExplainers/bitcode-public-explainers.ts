/**
 * Public-facing rich explainers for nav, docs, and product chrome.
 * Aligned to V48 product routes: /packs, /reads, /deposits — not Terminal.
 */
import type { BitcodeExplainer } from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';

function buildExplainer(explainer: BitcodeExplainer): BitcodeExplainer {
  return explainer;
}

const V48_CANON = [
  'BITCODE_SPEC_V48_NOTES.md — product routes pluralize + master-detail pipelines',
  'BITCODE_SPEC_V48.md — active draft-target commercial protocol',
] as const;

export const BITCODE_PUBLIC_EXPLAINERS = {
  network: buildExplainer({
    kicker: 'Network ledger',
    title: 'Packs',
    summary:
      'Inspect network AssetPack activity: measurements, needs-fits, settlement, compensation, delivery, and repair — without exposing unpaid source.',
    detail:
      'Open /packs when you need the master-detail ledger of deposited and settled AssetPacks. Search and filter source-safe activity; expand a row for proof roots, BTD volume/rights, BTC posture, and delivery state. Protected source stays withheld until paid rights unlock delivery.',
    points: [
      'Master table of source-safe pack activity across the network',
      'Detail panels for proofs, settlement, compensation, delivery, and repair',
      'Never serializes protected IP before settlement and rights transfer',
    ],
    references: {
      source: ['apps/uapi/app/packs/page.tsx', 'apps/uapi/components/packs/PacksPageClient/PacksPageClient.tsx'],
      canon: [...V48_CANON],
    },
  }),
  read: buildExplainer({
    kicker: 'Demand path',
    title: 'Read',
    summary:
      'Express a Reading, review a synthesized Need, request needs-fits scores, inspect a source-safe AssetPack preview, and settle for knowledge delivery.',
    detail:
      'Use /reads for the buyer path. You measure demand first, then compare fits and pack previews that expose measurements and proof roots — not protected source — until BTC settlement and BTD rights transfer unlock delivery.',
    points: [
      'Separates Need review from finding fits and settlement',
      'AssetPack preview remains source-safe until paid read rights',
      'Quotes and delivery posture stay tied to proof readback',
    ],
    references: {
      source: ['apps/uapi/app/reads/page.tsx', 'apps/uapi/components/reads/'],
      canon: [...V48_CANON],
    },
  }),
  deposit: buildExplainer({
    kicker: 'Supply path',
    title: 'Deposit',
    summary:
      'Attach permitted source, synthesize AssetPack options, review measurements and obfuscations, and list only the IP you approve.',
    detail:
      'Use /deposits for the seller path. Connected repositories and depositor instruction produce reviewable AssetPack options. You admit supply that is measured and source-safe — never raw unprotected dumps — with compensation and admission boundaries explicit before listing.',
    points: [
      'Synthesize multiple AssetPack options from permitted source',
      'Review measurements, obfuscations, and pack contents before admission',
      'List only approved IP into the Bitcode market path',
    ],
    references: {
      source: ['apps/uapi/app/deposits/page.tsx', 'apps/uapi/components/deposits/'],
      canon: [...V48_CANON],
    },
  }),
  transactions: buildExplainer({
    kicker: 'Proof readback',
    title: 'Activity readback',
    summary:
      'Reread pack activity for proofs, history, settlement, compensation, delivery, and repair detail on /packs.',
    detail:
      'When you need the audit trail of a deposit, read, or settlement, open the matching /packs activity row. Proof roots, BTD volume and rights, and BTC finality are rereadable without exposing source-bearing contents before rights unlock.',
    points: [
      'Loads proofs, history, and closure posture for a selected activity',
      'Keeps source-bearing AssetPack contents withheld until rights transfer',
      'Same ledger MCP, ChatGPT App, and product routes must reread',
    ],
    references: {
      source: ['apps/uapi/app/packs/page.tsx', 'apps/uapi/components/packs/'],
      canon: [...V48_CANON],
    },
  }),
  docs: buildExplainer({
    kicker: 'Teaching surface',
    title: 'Docs',
    summary:
      'Public Bitcode documentation: product map, operator guides, protocol posture, and interface contracts in plain technical prose.',
    detail:
      'Start here before /deposits, /reads, or /packs if you need the system model. Docs reuse the same explainers and card grammar as the product so the mental model transfers into live work.',
    points: [
      'Stepwise chapters from AssetPacks through settlement and interfaces',
      'Embedded specimens mirror product cards and proof signals',
      'Public docs teach; Protocol canon remains the law',
    ],
    references: {
      source: ['apps/uapi/app/docs/', 'apps/uapi/components/docs/'],
      canon: [...V48_CANON],
    },
  }),
  openOrbitals: buildExplainer({
    kicker: 'Identity + configuration',
    title: 'Open Auxillaries',
    summary:
      'Open Wallet, Externals, Profile, and Interfaces — the readiness shell beside Packs, Deposit, and Read.',
    detail:
      'Connect Wallet is the guest identity entry. After a Bitcoin wallet (and optional session) is bound, Auxillaries opens from signed-in chrome for repository scope, profile metadata, interface defaults, and BTD posture. It does not replace the product routes.',
    points: [
      'Wallet binds Bitcoin identity and fee/BTD readiness',
      'Externals binds GitHub (and future providers) for permitted source',
      'Profile and Interfaces hold optional identity and product defaults',
    ],
    references: {
      source: [
        'apps/uapi/components/auxillaries/',
        'apps/uapi/components/bitcode/layout/Nav/Nav.tsx',
      ],
      canon: [...V48_CANON],
    },
  }),
  protocolSpec: buildExplainer({
    kicker: 'Protocol reference',
    title: 'Protocol specification',
    summary:
      'Canonical Bitcode protocol semantics: AssetPacks, BTD volume and rights, BTC settlement, proofs, and fail-closed promotion posture.',
    detail:
      'Public docs teach the commercial path. Protocol canon is the operating contract product routes and admitted interfaces must satisfy. Prefer the active specification family over marketing or docs prose when they diverge.',
    points: [
      'Defines object flow from source supply through settlement and delivery',
      'Proof readback — not UI state alone — decides commercial truth',
      'Value-bearing mainnet stays blocked until a promoted version authorizes it',
    ],
    references: {
      source: ['BITCODE_SPEC.txt', 'BITCODE_SPEC_V48.md'],
      canon: [...V48_CANON],
    },
  }),
} as const;
