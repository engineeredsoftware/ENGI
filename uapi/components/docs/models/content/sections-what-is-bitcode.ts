/**
 * Docs content module: sections what is bitcode.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const whatIsBitcodeSections = [
  {
    id: 'plain-model',
    eyebrow: 'Plain model',
    title: 'Bitcode is a market system for source-backed technical intelligence',
    summary:
      'An AssetPack is not a file upload, a tokenized repo, or a generic AI answer. It is a measured technical-knowledge commodity that can satisfy a reviewed Need under auditable proof and settlement rules.',
    detail:
      'Bitcode starts with source: code, docs, diagrams, architecture notes, issue context, commits, proofs, and metadata. The product routes measure that source into AssetPack supply, BTD scalar volume and rights, BTC settlement posture, and proof readback before any source-bearing delivery is trusted.',
    reason:
      'This framing keeps first-time readers from thinking Bitcode is only a developer tool. The product is the measured market path from source to accepted AssetPack commodity.',
    points: [
      'Deposit means placing source-backed supply into the Bitcode operating chain.',
      'Read means making demand measurable before source is selected or settled.',
      'Proof, BTC settlement, and BTD rights decide whether source-bearing AssetPack delivery can unlock.',
    ],
  },
  {
    id: 'product-map',
    eyebrow: 'Product map',
    title: '/deposits, /reads, /packs, Protocol, and interfaces are one system',
    summary:
      '/deposits prepares AssetPack supply, /reads expresses demand and receives paid delivery, and /packs rereads activity. Protocol is the rulebook and proof contract. Interfaces such as MCP, ChatGPT App, Bitcode Chat, GitHub, and webhooks are admitted ways to read or write against that same system.',
    detail:
      'The important rule is that none of the interfaces become separate products. They must read and write the same source-safe route state, follow the same Protocol boundaries, and leave proof readback authority that /packs and authorized delivery can reread.',
    reason:
      'New users read one map before learning details. Otherwise routes, MCP, ChatGPT App, Bitcode Chat, and Auxillaries can look like separate products instead of coordinated surfaces over AssetPacks.',
    points: [
      '/packs owns activity reread, proof roots, settlement posture, compensation state, delivery state, and repair state.',
      '/deposits and /reads own the shortest current user paths for supply and demand.',
      'Protocol owns semantics, proof families, fail-closed rules, and promotion truth.',
    ],
  },
  {
    id: 'operator-path',
    eyebrow: 'Operator path',
    title: 'The simplest path is deposit, read, fit, prove, settle, issue',
    summary:
      'A first-time operator should understand Bitcode as a short path: deposit source, measure Read, inspect fit, produce proof, settle in BTC, transfer BTD rights, and deliver the AssetPack.',
    detail:
      '/deposits, /reads, and /packs keep the path visible as focused product loops. You write only when a bounded state change is intended, then read the result before moving deeper into proof, settlement, rights transfer, or connected-interface delivery.',
    reason:
      'The product becomes easier to learn when every button is read as part of the value path rather than as miscellaneous dashboard furniture.',
    steps: [
      'Start with AssetPacks so the market object is clear.',
      'Open /deposits, /reads, and /packs so the product surfaces are familiar.',
      'Read the action guide before trusting write controls.',
      'Use the proof and interface chapters when operating against real integrations.',
    ],
  },
  {
    id: 'testnet-meaning',
    eyebrow: 'Commercial testnet',
    title: 'Testnet means free BTC amounts with production-intended behavior',
    summary:
      'The commercial launch runs on BTC testnet: payment amounts are testnet and free, while measurements, quotes, settlement ordering, BTD rights, compensation routing, and repository delivery behave exactly as the production protocol intends.',
    detail:
      'Testnet does not weaken identity, rights, authority, source safety, or delivery boundaries. Source-bearing AssetPack contents stay withheld until BTC-testnet finality and BTD rights transfer, every state advance is proof-backed, and value-bearing mainnet settlement remains blocked until a later promoted version authorizes it.',
    reason:
      'Buyers and depositors should understand exactly which part of the exchange is rehearsal money and which part is real protocol state before they trust the launch surfaces.',
    points: [
      'BTC amounts are testnet and free; nothing else is simulated.',
      'Quotes, settlement finality, BTD rights, and delivery follow production protocol law.',
      'Value-bearing mainnet stays blocked; proof readback decides every state.',
    ],
  },
] as const satisfies readonly DocsGuideCard[];
