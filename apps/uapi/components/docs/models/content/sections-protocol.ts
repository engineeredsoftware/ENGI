/**
 * Docs: Protocol map — public teaching surface over V48 canon.
 * Public docs are not protocol law; they point at active specification truth.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const protocolSections = [
  {
    id: 'active-canon',
    eyebrow: 'Active canon',
    title: 'V48 is the draft-target commercial protocol; public docs teach, they do not legislate',
    summary:
      'Product routes and public docs follow the V48 commercial protocol story: DataPacks, BTD volume and rights, BTC settlement, source safety, and plural product routes. Formal law lives in the BITCODE_SPEC family, not in docs prose.',
    detail:
      'When docs and specification disagree, specification wins. Docs exist so operators, partners, and interface authors can learn the system in product order without reading every formal gate first. Promotion of a version into BITCODE_SPEC.txt is a separate, proof-gated workflow.',
    reason:
      'Readers need a clear boundary between teaching language and enforceable protocol law.',
    points: [
      'Prefer BITCODE_SPEC / version-family notes for legal and implementation truth.',
      'Public docs must not overclaim mainnet settlement or unlocked source delivery.',
      'Proof readback — not UI optimism — decides commercial state.',
    ],
  },
  {
    id: 'domain-model',
    eyebrow: 'Domain model',
    title: 'Every subsystem is learnable from source supply to proof readback',
    summary:
      'The protocol spans repository supply, deposit synthesis, Read measurement, fit and selection, DataPacks, identity, disclosure, settlement, proof families, telemetry, persistence, and admitted interfaces.',
    detail:
      'A docs reader should be able to drop into any subsystem and answer: what it owns, what fails closed, and what evidence proves a state advance. Product routes surface the same objects without inventing parallel vocabularies.',
    reason:
      'Comprehensibility requires one object model across Packs, Deposit, Read, Auxillaries, and MCP/Chat interfaces.',
  },
  {
    id: 'operator-chain',
    eyebrow: 'Operator chain',
    title: 'The chain ends in validation and rereadable evidence — not a success toast',
    summary:
      'Bitcode does not end when a button returns OK. It reconciles telemetry, persistence, failure semantics, generated artifacts, and promotion posture so a later surface can audit what happened.',
    detail:
      'That is why docs teach proof and settlement beside product actions. The commercial claim depends on operators being able to audit DataPack paths after the fact, including when work started from Chat, MCP, or GitHub.',
    reason:
      'A protocol-backed product must teach both the experience and the proof system underneath it.',
  },
] as const satisfies readonly DocsGuideCard[];
