/**
 * Docs content module: sections settlement.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const settlementSections = [
  {
    id: 'btd-accounting',
    eyebrow: '$BTD',
    title: 'Settlement converts accepted AssetPack evidence into exact accounting',
    summary:
      'Bitcode computes BTD scalar volume and rights from contribution, Need-fit measurement, participation, and proof posture. BTC settlement money then pays the quote and unlocks rights transfer only after finality.',
    detail:
      'The user-facing idea is simple: useful measured source can become attributable AssetPack value. The protocol detail is strict: scalar-volume conservation, quantized fit-quality receipting, journals, receipts, finality, rights transfer, and policy-bound execution all have to agree.',
    reason:
      'Settlement is where AssetPacks become economically meaningful instead of just technically interesting.',
    points: [
      'Fit quality affects BTD scalar volume and BTC quote posture.',
      'Journals and receipts make allocation rereadable.',
      'Wallet, signer readiness, BTC finality, and BTD rights decide whether settlement can move beyond staged review.',
    ],
  },
  {
    id: 'payment-modes',
    eyebrow: 'Payment modes',
    title: 'Base-layer, repeated-read, and sidechain modes are interface postures',
    summary:
      'The active Protocol records bitcoin mainchain execution, repeated-read payment execution, and sidechain execution as hardened interface responsibilities, not marketing labels.',
    detail:
      'In launch mode these may be mocked or boundary-only. The product must still teach what the modes mean, which receipts would prove them, and which blockers prevent live settlement.',
    reason:
      'Commercial credibility depends on users seeing the difference between modeled readiness and live execution.',
  },
] as const satisfies readonly DocsGuideCard[];
