import type { BitcodeExplainer } from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';

function buildExplainer(explainer: BitcodeExplainer): BitcodeExplainer {
  return explainer;
}

export const BITCODE_PUBLIC_EXPLAINERS = {
  network: buildExplainer({
    kicker: 'Bitcode Packs',
    title: 'Packs',
    summary: 'Read pack activity where source supply, measured reads, settlement posture, compensation, delivery, and repair state meet.',
    detail:
      'Use this route when you need the activity master-detail view for AssetPack proposals, admitted packs, previews, proof roots, settlement, and delivery state.',
    points: [
      'Searches and filters source-safe pack activity',
      'Keeps proof and settlement detail expandable without exposing unpaid source',
    ],
    references: {
      source: [
        'uapi/components/bitcode/layout/nav.tsx',
        'uapi/app/packs/page.tsx',
      ],
      canon: ['BITCODE_SPEC_V48_NOTES.md — product routes pluralize + master-detail pipelines'],
    },
  }),
  read: buildExplainer({
    kicker: 'Bitcode Read',
    title: 'Read',
    summary: 'Request Reading, review a synthesized Need, request Finding Fits, inspect source-safe AssetPack preview, and settle for delivery.',
    detail:
      'Use this route for the enterprise Reading path. It keeps source-bearing AssetPack contents withheld before settlement while exposing measurements, proof roots, quote posture, and delivery state.',
    points: [
      'Separates Read-Need review from Finding Fits',
      'Keeps AssetPack preview source-safe until paid read rights unlock delivery',
    ],
    references: {
      source: [
        'uapi/components/bitcode/layout/nav.tsx',
        'uapi/app/reads/ReadPageClient.tsx',
      ],
      canon: ['BITCODE_SPEC_V48_NOTES.md — product routes pluralize + master-detail pipelines'],
    },
  }),
  deposit: buildExplainer({
    kicker: 'Bitcode Deposit',
    title: 'Deposit',
    summary: 'Connect repository source, synthesize source-safe AssetPack options, review measurements, and submit supply.',
    detail:
      'Use this route for the enterprise depositing path. It proposes multiple AssetPack options from connected source, depositor instruction, Depository demand, and Reading demand without serializing protected source.',
    points: [
      'Synthesize reviewable AssetPack options before admission',
      'Keeps criticality, ROI, compensation policy, and admission boundaries explicit',
    ],
    references: {
      source: [
        'uapi/components/bitcode/layout/nav.tsx',
        'uapi/app/deposits/DepositPageClient.tsx',
      ],
      canon: ['BITCODE_SPEC_V48_NOTES.md — product routes pluralize + master-detail pipelines'],
    },
  }),
  transactions: buildExplainer({
    kicker: 'Proof readback',
    title: 'Activity readback',
    summary: 'Open Packs for proofs, history, settlement, compensation, delivery, and repair detail.',
    detail:
      'Use this when you want to reread Bitcode activity with source-safe proof roots, BTD scalar volume and rights, BTC settlement posture, and delivery state.',
    points: [
      'Loads selected execution detail, proofs, history, and closure posture',
      'Keeps source-bearing AssetPack contents withheld until finality, rights transfer, and repository delivery',
    ],
    references: {
      source: [
        'uapi/components/bitcode/layout/footer.tsx',
      ],
      canon: ['BITCODE_SPEC_V48_NOTES.md — product routes pluralize + master-detail pipelines'],
    },
  }),
  docs: buildExplainer({
    kicker: 'Teaching surface',
    title: 'Docs',
    summary: 'Read the public Bitcode docs for stepwise explanations, inline widgets, route maps, and the recorded walkthrough.',
    detail:
      'Use this when you want the system taught clearly before moving into Deposit, Read, and Packs.',
    points: [
      'Keeps walkthroughs and explainers under one documentation area',
      'Preserves pedagogical prose instead of flattening the system into a brochure',
    ],
    references: {
      source: [
        'uapi/app/docs/bitcode-docs-content.ts',
      ],
      canon: ['BITCODE_SPEC_V48_NOTES.md — product routes pluralize + master-detail pipelines'],
    },
  }),
  openOrbitals: buildExplainer({
    kicker: 'Identity + interface',
    title: 'Open Auxillaries',
    summary: 'Open the Bitcode auxillary shell for access, profile, interface defaults, and $BTD posture.',
    detail:
      'Use this when you want the auxillary access layer directly. Connect Wallet is for first-time wallet identity and onboarding; Open Auxillaries is for entering the contained shell.',
    points: [
      'Opens the contained auxillary shell',
      'Keeps Auxillaries distinct from Packs, Deposit, Read, and Docs',
    ],
    references: {
      source: [
        'uapi/components/bitcode/layout/nav.tsx',
      ],
      canon: ['BITCODE_SPEC_V48_NOTES.md — product routes pluralize + master-detail pipelines'],
    },
  }),
  protocolSpec: buildExplainer({
    kicker: 'Protocol reference',
    title: 'Protocol specification',
    summary: 'Read the public Bitcode protocol specification for system semantics, value flow, proofs, and operating posture.',
    detail:
      'This is the reference document for how Bitcode works. It is meant for readers who want the precise model behind the protocol and commercial interfaces.',
    points: [
      'Covers system semantics and proof-bearing posture',
      'Protocol law and proof readback decide state',
      'Useful for partners, researchers, and implementation review',
    ],
    references: {
      source: [
        'uapi/components/bitcode/layout/footer.tsx',
      ],
      canon: ['BITCODE_SPEC_V48_NOTES.md — product routes pluralize + master-detail pipelines'],
    },
  }),
} as const;
