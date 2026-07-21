/**
 * Docs: proofs, witnesses, disclosure.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const proofSections = [
  {
    id: 'proof-families',
    eyebrow: 'Proof families',
    title: 'Proof families are the replayable evidence contracts behind DataPacks',
    summary:
      'Protocol carries proof families for synthesis, analysis, verification, selection, authorization, settlement, disclosure, and contract closure — each with witnesses and fail-closed conditions.',
    detail:
      'Each family has members, theorem IDs, replay steps, and witness artifact bindings. Product surfaces hide most of that detail until an operator needs an exact audit. Settlement and delivery never rest on a UI success state alone.',
    reason:
      'Operators need enough proof vocabulary to understand why proof readback is stronger than a button result.',
    points: [
      'Families explain what kind of claim was proven.',
      'Witness artifacts explain what evidence backs the claim.',
      'Replay steps explain how the claim can be checked again.',
    ],
  },
  {
    id: 'projection-redaction',
    eyebrow: 'Disclosure',
    title: 'Projection keeps proof useful without leaking private source',
    summary:
      'Public, reviewer, buyer, and internal projections can expose different proof views while preserving one underlying artifact set.',
    detail:
      'Docs and product copy must never imply that public proofs contain licensed source by default. Measurements and needs-fits scores can be visible while protected IP stays withheld until rights transfer.',
    reason:
      'A DataPack market only works if value is measurable without casually disclosing the source that gives it value.',
  },
  {
    id: 'generated-appendix',
    eyebrow: 'Generated evidence',
    title: 'Generated appendices and proof artifacts are part of the system',
    summary:
      'Generated evidence includes version reports, gate checkpoints, proof appendices, composition proof, persistence totality, and closure witnesses.',
    detail:
      'When evidence is stale, missing, or inconsistent, Bitcode must fail closed rather than letting product language outrun proof truth.',
    reason:
      'This keeps commercial claims auditable as the system moves from testnet launch posture toward production readiness.',
  },
] as const satisfies readonly DocsGuideCard[];
