/**
 * Docs content module: sections proofs.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const proofSections = [
  {
    id: 'proof-families',
    eyebrow: 'Proof families',
    title: 'Proof families are the replayable evidence contracts behind AssetPacks',
    summary:
      'The active Protocol carries proof-family canon for inference synthesis, prompt completeness, static code analysis, verification decisions, selection and materialization, authorization and sensitive flow, AssetPack settlement, disclosure boundary, and proof contract closure.',
    detail:
      'Each family has members, theorem IDs, replay step IDs, witness artifact paths, artifact bindings, and fail-closed conditions. The product hides most of that detail until the user needs an exact read.',
    reason:
      'The docs read enough proof vocabulary that users understand why proof readback authority is stronger than a UI success state.',
    points: [
      'Families explain what kind of claim was proven.',
      'Witness artifacts explain what evidence backs the claim.',
      'Replay steps explain how the claim can be checked again.',
    ],
  },
  {
    id: 'projection-redaction',
    eyebrow: 'Disclosure',
    title: 'Projection and redaction keep proof useful without leaking private source',
    summary:
      'Public, reviewer, buyer, and internal projections can expose different proof views while preserving a single underlying artifact set.',
    detail:
      'Docs and product copy must never imply that public proofs contain licensed source by default. Bounded-public proof is a separate projection from private proof payloads.',
    reason:
      'An AssetPack market only works if value is measurable without casually disclosing the source that gives it value.',
  },
  {
    id: 'generated-appendix',
    eyebrow: 'Generated evidence',
    title: 'Generated appendices and proof artifacts are part of the system',
    summary:
      'Generated evidence includes spec-family reports, canonical input reports, gate checkpoints, proof appendices, application composition proof, conversations continuity, persistence/schema totality, retained package admissibility, and later closure witnesses.',
    detail:
      'When evidence is stale, missing, or inconsistent, Bitcode must fail closed rather than letting product language outrun proof truth.',
    reason:
      'This keeps commercial claims auditable as the repository moves from launch-mode demonstration state toward production readiness.',
  },
] as const satisfies readonly DocsGuideCard[];
