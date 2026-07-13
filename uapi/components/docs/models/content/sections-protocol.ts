/**
 * Docs content module: sections protocol.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const protocolSections = [
  {
    id: 'active-canon',
    eyebrow: 'Active canon',
    title: 'V45 is active canon while V46 is draft target',
    summary:
      'V45 is the active Protocol canon for Bitcode knowledge commoditization. V46 is the draft-target family for commercial protocol comprehension and claim boundaries.',
    detail:
      'Public docs are not protocol law. They teach the active Protocol canon in product order, using the same object flow: source supply, measured Read, fit, proof, settlement, rights, interfaces, and promotion evidence.',
    reason:
      'New users read a simpler path, while experienced readers read to know where the simplified story maps back to active law and V46 claim boundary work.',
    points: [
      'V45 is the current pointer truth until a promotion workflow advances BITCODE_SPEC.txt.',
      'V46 claim boundary work may clarify public language but must not weaken V45 law.',
      'Public docs should not overclaim state that proof readback keeps blocked or unproven.',
    ],
  },
  {
    id: 'domain-model',
    eyebrow: 'Domain model',
    title: 'Every Protocol subsystem must be learnable from source to proof',
    summary:
      'The protocol covers repo supply, depositing, Read measurement, prompt and inference ownership, fit, recall, verification, selection, AssetPacks, identity, disclosure, settlement, proof families, telemetry, persistence, live interfaces, validation, and generated artifacts.',
    detail:
      'Docs readers should be able to move from the high-level product story into any subsystem and understand what it owns, what can fail closed, and what evidence proves it.',
    reason:
      'This is the path toward documenting the whole active Protocol without forcing every user to start in canonical prose.',
  },
  {
    id: 'operator-chain',
    eyebrow: 'Operator chain',
    title: 'The whole operator chain ends in validation and promotion',
    summary:
      'Bitcode does not end at a successful workflow. It reconciles telemetry, persistence, state, failure semantics, validation, generated artifacts, and promotion truth.',
    detail:
      'This is why docs must teach proof and generated evidence alongside product actions. The commercial value claim depends on the user being able to audit what happened after the system acts.',
    reason:
      'A protocol-backed product has to teach both the experience and the proof system under it.',
  },
] as const satisfies readonly DocsGuideCard[];
