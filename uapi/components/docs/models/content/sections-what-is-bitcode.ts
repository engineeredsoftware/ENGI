/**
 * Docs: What Bitcode is — first public chapter.
 * V48 product language: Packs / Reads / Deposits; AssetPacks; BTD volume & rights; BTC settlement.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const whatIsBitcodeSections = [
  {
    id: 'plain-model',
    eyebrow: 'Plain model',
    title: 'Bitcode is a market for measured technical knowledge',
    summary:
      'An AssetPack is not a raw file upload, a tokenized repository, or a free-form AI answer. It is a measured, source-safe knowledge commodity that can satisfy a reviewed Need under auditable proof and settlement rules.',
    detail:
      'Bitcode starts with permitted source: code, files, designs, data, notes, commits, and metadata. Product routes synthesize that source into AssetPack supply, score needs-fits, hold protected IP behind obfuscation and measurement surfaces, then prove settlement on a fully open-source, decentralized, and auditable ledger. Buyers pay with Bitcoin; BTD records volume and rights — not a second payment currency.',
    reason:
      'First-time readers should leave with the market object (the AssetPack) and the safety rule (measurements visible; IP not) before learning any control surface.',
    points: [
      'Deposit lists AssetPacks synthesized from source you approve — not unrestricted repo dumps.',
      'Read measures demand, compares needs-fits scores, and settles for knowledge delivery.',
      'Packs rereads network activity: proofs, BTD volume/rights, BTC finality, delivery, and repair.',
    ],
  },
  {
    id: 'product-map',
    eyebrow: 'Product map',
    title: '/deposits, /reads, and /packs are one system — interfaces ride the same law',
    summary:
      'Deposit prepares supply, Read expresses demand and receives paid delivery, and Packs is the durable activity ledger. Protocol is the rulebook. MCP, ChatGPT App, Bitcode Chat, GitHub, and webhooks are admitted ways to read or write that same state.',
    detail:
      'No interface is a separate product. Every write must leave source-safe activity that /packs can reread. Every delivery of protected contents depends on settlement finality and BTD rights transfer, not on which surface initiated the work.',
    reason:
      'Without one map, routes and integrations look like separate apps. With one map, operators know where to write, where to buy, and where to audit.',
    points: [
      '/packs owns searchable activity and expandable proof, settlement, compensation, delivery, and repair detail.',
      '/deposits and /reads are the shortest seller and buyer paths.',
      'Protocol owns semantics, proof families, fail-closed rules, and promotion truth.',
    ],
  },
  {
    id: 'operator-path',
    eyebrow: 'Operator path',
    title: 'Deposit → Read → Fit → Prove → Settle → Deliver',
    summary:
      'Treat Bitcode as a short commercial chain: attach permitted source, synthesize packs, measure need and needs-fits, produce proofs, settle in BTC, transfer BTD rights, deliver knowledge.',
    detail:
      'Each product surface exposes one part of the chain. You write only when a bounded state change is intended, then reread /packs (or the route’s own proof panel) before trusting fit, settlement, or delivery.',
    reason:
      'Learning is faster when every control is part of the value path rather than miscellaneous chrome.',
    steps: [
      'Start with AssetPacks so the market object is clear.',
      'Open /deposits, /reads, and /packs so the three product loops are familiar.',
      'Use the action and read guides before treating live writes as final.',
      'Open proof, settlement, and interface chapters when operating against real integrations.',
    ],
  },
  {
    id: 'testnet-meaning',
    eyebrow: 'Commercial testnet',
    title: 'Testnet BTC is free; protocol state is not simulated',
    summary:
      'Launch uses Bitcoin testnet amounts so operators can rehearse settlement without value-bearing mainnet risk. Measurements, quotes, ordering, BTD rights, compensation, and delivery follow production-intended protocol law.',
    detail:
      'Testnet does not weaken identity, source safety, or delivery boundaries. Source-bearing AssetPack contents stay withheld until testnet finality and rights transfer. Value-bearing mainnet settlement remains blocked until a promoted version authorizes it.',
    reason:
      'Buyers and depositors must know which part is rehearsal money and which part is real protocol state.',
    points: [
      'BTC amounts are testnet; identity, proofs, and rights rules are not “demo mode.”',
      'Quotes, finality, BTD rights, and delivery follow production protocol law.',
      'Proof readback — not a success toast — decides commercial state.',
    ],
  },
] as const satisfies readonly DocsGuideCard[];
