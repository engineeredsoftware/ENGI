import type { BitcodeExplainer } from '@/components/bitcode/execution/bitcode-transaction-types';
import { TERMINAL_INLINE_EXPLAINERS, TERMINAL_WORKSPACE_EXPLAINERS } from '@/app/terminal/terminal-workspace-explainers';
import { BITCODE_PUBLIC_EXPLAINERS } from '@/components/bitcode/layout/bitcode-public-explainers';

type DocsGuideCard = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  detail: string;
  reason?: string;
  points?: readonly string[];
  steps?: readonly string[];
};

export type DocsEmbeddedUiSpecimen = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  explainer: BitcodeExplainer;
  signals?: readonly {
    label: string;
    value: string;
    tone?: 'default' | 'emerald' | 'amber' | 'cyan';
  }[];
  steps?: readonly {
    label: string;
    body: string;
  }[];
};

export type DocsInterfaceApiFeature = {
  name: string;
  method?: string;
  packagePath: string;
  useWhen: string;
  howToUse: string;
  inputs: readonly string[];
  outputs: readonly string[];
  verifyInTerminal?: string;
  failureModes?: readonly string[];
  requiresConfirmation?: boolean;
};

export type DocsInterfaceApiSection = {
  id: string;
  title: string;
  summary: string;
  packagePath: string;
  features: readonly DocsInterfaceApiFeature[];
};

export type BitcodeDocsPageSlug = string;

export type BitcodeDocsPage = {
  slug: BitcodeDocsPageSlug;
  href: string;
  chapterId: string;
  eyebrow: string;
  title: string;
  summary: string;
  detail: string;
  learningOutcome: string;
  primaryCta: {
    href: string;
    label: string;
  };
  sections: readonly DocsGuideCard[];
  embeddedUi?: readonly DocsEmbeddedUiSpecimen[];
  apiReference?: readonly DocsInterfaceApiSection[];
};

export type BitcodeDocsChapter = {
  id: string;
  number: string;
  title: string;
  summary: string;
  pages: readonly BitcodeDocsPage[];
};

export type TerminalActionGuide = {
  id: string;
  action: string;
  location: string;
  write: string;
  expectedRead: string;
  proofSignal: string;
};

export type TerminalReadGuide = {
  id: string;
  read: string;
  location: string;
  tellsYou: string;
  expectedResult: string;
};

const PUBLIC_DISCLOSURE_LIMIT_SECTION = {
  id: 'public-disclosure-limits',
  eyebrow: 'Disclosure limits',
  title: 'Public docs expose guidance and proof posture, not protected source',
  summary:
    'Public Bitcode docs derive from the active Protocol, package-owned catalogs, route contracts, and source-safe generated artifacts. They can explain usage, measurements, event ids, proof roots, docs links, runbook links, redaction posture, testnet rollout readiness, fee boundaries, and settlement posture.',
  detail:
    'They must not reveal protected source payloads, raw protected prompts, secret values, provider tokens, wallet private material, or unpaid AssetPack source. Source-bearing AssetPack contents cross to the reader only after settlement and rights transfer.',
  reason:
    'This keeps the public product understandable while preserving the boundary that makes AssetPacks economically and operationally safe.',
  points: [
    'Allowed: usage guidance, route links, state labels, source-safe measurements, proof roots, dashboard/runbook ids, redacted incident posture, testnet rollout readiness, LocalStagingTelemetryDocumentationRehearsal evidence, and fee/right boundaries.',
    'Interface docs may surface event ids, proof roots, docs links, runbook links, and redaction posture from TelemetryDocumentationInterfaceIntegration without revealing source-bearing payloads.',
    'Local and staging-testnet rehearsal docs may surface documentation discovery, telemetry event emission, dashboard/runbook lookup, docs QA, incident drill, source-safe proof-root review, and blocked value-bearing mainnet posture.',
    'Blocked: secrets, provider tokens, wallet private material, raw protected prompts, protected source payloads, and unpaid AssetPack source.',
    'Docs QA fails closed when public docs, internal docs, route docs, interface docs, generated artifacts, proof posture, or workflow checks drift.',
    'Compatibility boundaries stay explicit: /exchange redirects to /packs and does not create a parallel current product surface.',
  ],
} as const satisfies DocsGuideCard;

function withPublicDisclosureLimit(sections: readonly DocsGuideCard[]): readonly DocsGuideCard[] {
  if (sections.some((section) => section.id === PUBLIC_DISCLOSURE_LIMIT_SECTION.id)) return sections;
  return [...sections, PUBLIC_DISCLOSURE_LIMIT_SECTION];
}

function docsPage(page: Omit<BitcodeDocsPage, 'href'>): BitcodeDocsPage {
  return {
    ...page,
    href: `/docs/${page.slug}`,
    sections: withPublicDisclosureLimit(page.sections),
  };
}

const TERMINAL_SURFACE_EXPLAINERS_ALIAS = TERMINAL_WORKSPACE_EXPLAINERS;

const whatIsBitcodeSections = [
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

const sourceSharesSections = [
  {
    id: 'share-object',
    eyebrow: 'AssetPacks',
    title: 'What Bitcode is measuring',
    summary:
      'Bitcode turns source material into tradable, measured technical intelligence rather than treating files as inert attachments.',
    detail:
      'Code, docs, diagrams, PDFs, notes, commits, citations, authorship, and metadata enter as source supply. Bitcode measures that supply against Need, fit, quality, provenance, and proof posture so useful technical intelligence can become source-safe AssetPack commodity.',
    reason:
      'The AssetPack is only credible when source, demand, proof, BTD scalar volume and rights, and BTC settlement can be reread together.',
    points: [
      'Supply is deposited as deposit-side source.',
      'Demand is expressed as a measured Read.',
      'Fit, proof, BTC finality, and BTD rights decide whether source can move toward delivery.',
    ],
  },
  {
    id: 'market-frame',
    eyebrow: 'Packs',
    title: BITCODE_PUBLIC_EXPLAINERS.network.title,
    summary: BITCODE_PUBLIC_EXPLAINERS.network.summary,
    detail: BITCODE_PUBLIC_EXPLAINERS.network.detail ?? '',
    reason:
      'The public Packs view introduces the activity ledger without forcing a first-time reader into proof detail too early.',
    points: BITCODE_PUBLIC_EXPLAINERS.network.points,
  },
  {
    id: 'value-flow',
    eyebrow: 'Value flow',
    title: 'Deposit -> Read -> Fit -> Prove -> Settle -> Deliver',
    summary:
      'The market path is intentionally linear for a new reader: source is given, Need is measured, fits are reviewed, proofs are produced, BTC settlement is read, BTD rights transfer, and repository delivery completes.',
    detail:
      '/deposits, /reads, and /packs expose each stage so an operator can see both the write action that changes state and the read surface that proves what happened next.',
    reason:
      'The linear path is a teaching model. The under-the-hood system remains richer, but every advanced interface still has to preserve this chain.',
    points: [
      'Deposit writes searchable supply.',
      'Read writes measured demand.',
      'Settlement reads proof-backed BTC finality, BTD rights, compensation, and delivery posture.',
    ],
  },
] as const satisfies readonly DocsGuideCard[];

const exchangeSections = [
  {
    id: 'exchange-role',
    eyebrow: 'Compatibility',
    title: '/exchange redirects to /packs',
    summary:
      '/exchange is retained only as a compatibility redirect. /packs is the current master-detail activity surface for repository scope, Need measurement, fit review, AssetPack evidence, proof rows, settlement receipts, and interface admissions.',
    detail:
      'The compatibility path must not become a parallel product. Connected apps, MCP, ChatGPT App, Bitcode Chat, and future commercial surfaces must reread the same proof-backed activity exposed through /packs.',
    reason:
      'This separation lets Bitcode preserve old links while preventing multiple inconsistent product centers.',
    points: [
      'Activity and selected detail must survive navigation and reread through /packs.',
      'Write paths must create durable source-safe records.',
      'Read paths must expose the same proof readback to admitted interfaces.',
    ],
  },
  {
    id: 'activity-ledger',
    eyebrow: 'Ledger',
    title: 'The activity ledger is the main /packs read window',
    summary:
      '/packs activity records deposit-side deposits, measured Reads, AssetPack executions, proof posture, settlement, and history in one searchable ledger.',
    detail:
      'The ledger is not just a table. It is the readable index of what happened, why it happened, and which exact detail surface should be opened next.',
    reason:
      'If a write cannot be reread from the ledger, the product cannot prove an AssetPack path to a user.',
    points: [
      'Search and filters keep large activity sets usable.',
      'Selected detail carries proofs, branch artifacts, settlement, and history.',
      'Route-owned query state makes activity review shareable and recoverable.',
    ],
  },
  {
    id: 'persistence',
    eyebrow: 'Persistence',
    title: '/packs reread is what turns actions into evidence',
    summary:
      'A write is not trusted merely because a button returned success. The expected result is durable /packs reread with the right proof, readiness, and state posture.',
    detail:
      'The active Protocol treats persistence, schema, route-owned state, execution history, and final work summaries as part of the product truth rather than incidental backend storage.',
    reason:
      'AssetPacks require state that can be audited later by a different surface, not just local UI continuity.',
    steps: [
      'Write through /deposits, /reads, Bitcode Chat, MCP, or another admitted interface.',
      'Persist normalized evidence and activity context into source-safe activity state.',
      'Reread the activity and selected detail in /packs before trusting fit, proof, or settlement.',
    ],
  },
] as const satisfies readonly DocsGuideCard[];

const terminalSections = [
  {
    id: 'experience-map',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.experienceMap.kicker ?? 'Terminal',
    title: TERMINAL_WORKSPACE_EXPLAINERS.experienceMap.title,
    summary: TERMINAL_WORKSPACE_EXPLAINERS.experienceMap.summary,
    detail: TERMINAL_WORKSPACE_EXPLAINERS.experienceMap.detail ?? '',
    reason:
      'The Terminal keeps the product understandable by making the activity ledger primary and treating deeper modes as deliberate follow-through.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.experienceMap.points,
  },
  {
    id: 'read-window',
    eyebrow: 'Read',
    title: TERMINAL_INLINE_EXPLAINERS.readWindow.title,
    summary: TERMINAL_INLINE_EXPLAINERS.readWindow.summary,
    detail: TERMINAL_INLINE_EXPLAINERS.readWindow.detail ?? '',
    reason:
      'The read window is where users learn whether a Bitcode action actually changed state.',
  },
  {
    id: 'write-posture',
    eyebrow: 'Write',
    title: TERMINAL_INLINE_EXPLAINERS.writePosture.title,
    summary: TERMINAL_INLINE_EXPLAINERS.writePosture.summary,
    detail: TERMINAL_INLINE_EXPLAINERS.writePosture.detail ?? '',
    reason:
      'Writes must stay bounded because Bitcode has proof, wallet, repository, and disclosure consequences.',
  },
  {
    id: 'mode-rail',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.railModes.kicker ?? 'Modes',
    title: TERMINAL_WORKSPACE_EXPLAINERS.railModes.title,
    summary: TERMINAL_WORKSPACE_EXPLAINERS.railModes.summary,
    detail: TERMINAL_WORKSPACE_EXPLAINERS.railModes.detail ?? '',
    reason:
      'Mode changes are useful only when the reader never loses the active /packs activity context.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.railModes.points,
  },
  {
    id: 'repository-supply',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.repositorySupply.kicker ?? 'Source',
    title: TERMINAL_WORKSPACE_EXPLAINERS.repositorySupply.title,
    summary: TERMINAL_WORKSPACE_EXPLAINERS.repositorySupply.summary,
    detail: TERMINAL_WORKSPACE_EXPLAINERS.repositorySupply.detail ?? '',
    reason:
      'Repository scope is the deposit-side boundary; every deposit and downstream proof depends on it staying explicit.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.repositorySupply.points,
  },
] as const satisfies readonly DocsGuideCard[];

const terminalActionSections = [
  {
    id: 'controls',
    eyebrow: TERMINAL_SURFACE_EXPLAINERS_ALIAS.controls.kicker ?? 'Controls',
    title: TERMINAL_SURFACE_EXPLAINERS_ALIAS.controls.title,
    summary: TERMINAL_SURFACE_EXPLAINERS_ALIAS.controls.summary,
    detail: TERMINAL_SURFACE_EXPLAINERS_ALIAS.controls.detail ?? '',
    reason:
      'Controls are not generic preferences. Scenario, projection, branch mode, and guide state decide what Bitcode will measure, materialize, and prove.',
    points: TERMINAL_SURFACE_EXPLAINERS_ALIAS.controls.points,
  },
  {
    id: 'supply',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.supplyInventory.kicker ?? 'Supply',
    title: TERMINAL_WORKSPACE_EXPLAINERS.supplyInventory.title,
    summary: TERMINAL_WORKSPACE_EXPLAINERS.supplyInventory.summary,
    detail: TERMINAL_WORKSPACE_EXPLAINERS.supplyInventory.detail ?? '',
    reason:
      'Supply search is the first filter on what source can become share-bearing intelligence.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.supplyInventory.points,
  },
  {
    id: 'deposit',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.depositComposer.kicker ?? 'Deposit',
    title: TERMINAL_WORKSPACE_EXPLAINERS.depositComposer.title,
    summary: TERMINAL_WORKSPACE_EXPLAINERS.depositComposer.summary,
    detail: TERMINAL_WORKSPACE_EXPLAINERS.depositComposer.detail ?? '',
    reason:
      'Deposit provenance is what prevents useful source from becoming anonymous or unauditable.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.depositComposer.points,
  },
  {
    id: 'closure',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.closureControls.kicker ?? 'Closure',
    title: TERMINAL_WORKSPACE_EXPLAINERS.closureControls.title,
    summary: TERMINAL_WORKSPACE_EXPLAINERS.closureControls.summary,
    detail: TERMINAL_WORKSPACE_EXPLAINERS.closureControls.detail ?? '',
    reason:
      'Closure is where reviewable Read, verification, branch materialization, proof, and settlement become one consequence chain.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.closureControls.points,
  },
] as const satisfies readonly DocsGuideCard[];

const readResultSections = [
  {
    id: 'closure-map',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.closureMap.kicker ?? 'Closure',
    title: TERMINAL_WORKSPACE_EXPLAINERS.closureMap.title,
    summary: TERMINAL_WORKSPACE_EXPLAINERS.closureMap.summary,
    detail: TERMINAL_WORKSPACE_EXPLAINERS.closureMap.detail ?? '',
    reason:
      'Closure reads let experienced users decide whether a Bitcode activity is ready for deeper proof or settlement trust.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.closureMap.points,
  },
  {
    id: 'ledger-pulse',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.ledgerPulse.kicker ?? 'Signals',
    title: TERMINAL_WORKSPACE_EXPLAINERS.ledgerPulse.title,
    summary: TERMINAL_WORKSPACE_EXPLAINERS.ledgerPulse.summary,
    detail: TERMINAL_WORKSPACE_EXPLAINERS.ledgerPulse.detail ?? '',
    reason:
      'Pinned signals prevent users from opening dense proof detail just to answer whether work is blocked, proving, or ready.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.ledgerPulse.points,
  },
  {
    id: 'boundary-runtime',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.boundaryRuntime.kicker ?? 'Readiness',
    title: TERMINAL_WORKSPACE_EXPLAINERS.boundaryRuntime.title,
    summary: TERMINAL_WORKSPACE_EXPLAINERS.boundaryRuntime.summary,
    detail: TERMINAL_WORKSPACE_EXPLAINERS.boundaryRuntime.detail ?? '',
    reason:
      'Boundary honesty is what keeps launch-mode mocks, live connections, blocked interfaces, and proof readiness from being conflated.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.boundaryRuntime.points,
  },
  {
    id: 'signed-posture',
    eyebrow: 'Signed transaction posture',
    title: TERMINAL_INLINE_EXPLAINERS.transactionReadiness.title,
    summary: TERMINAL_INLINE_EXPLAINERS.transactionReadiness.summary,
    detail: TERMINAL_INLINE_EXPLAINERS.transactionReadiness.detail ?? '',
    reason:
      'Bitcode can teach and stage work before every production connection is live, but it must fail closed before signed settlement when readiness is incomplete.',
  },
] as const satisfies readonly DocsGuideCard[];

const auxillariesSections = [
  {
    id: 'auxillary-model',
    eyebrow: 'Auxillaries',
    title: 'Auxillaries are the wallet, externals, profile, and interface layer',
    summary:
      'Auxillaries hold the context that changes how Terminal can operate: signed Bitcoin wallet identity, connected repositories, optional profile metadata, interface defaults, and BTD preferences.',
    detail:
      'The auxillary shell should feel adjacent to Terminal, not detached from it. Opening Auxillaries changes readiness and configuration while the selected Terminal activity remains recoverable.',
    reason:
      'Configuration is commercially important only when users can understand which operational capability it unlocks or blocks.',
    points: [
      'Wallet owns the first identity step: a Bitcoin wallet proof that can back a Supabase session.',
      'Leather support uses its documented Bitcoin provider methods: getAddresses, signMessage, signPsbt, sendTransfer, and open.',
      'Leather Taproot p2tr is preferred for Bitcode auth when present; Native SegWit p2wpkh remains the payment-address read.',
      'Externals owns GitHub and future source-provider bindings after wallet identity exists.',
      'Profile owns optional email, display identity, account role, and organization metadata.',
      'Interfaces owns default behavior and visual/product posture.',
      'Wallet also owns BTD balances, range posture, and share-specific settings.',
    ],
  },
  {
    id: 'connects-profile-btd',
    eyebrow: 'Readiness',
    title: 'Wallet, Externals, Profile, and Interfaces are readiness surfaces',
    summary:
      'Wallet identity, repository scope, profile roles, interface defaults, and $BTD controls determine which writes can move from review to signed or connected execution.',
    detail:
      'A user may still learn or draft in launch mode, but production execution must keep blockers clear before deposit, branch, settlement, delivery, or connected-interface writes proceed.',
    reason:
      'This lets Bitcode ship a strong Terminal experience with mocked data while preserving the production direction toward real connectivity.',
    steps: [
      'Connect and sign with a Bitcoin wallet first.',
      'For Leather, unlock the extension, use its testnet lane, approve the Bitcode message signature, and expect Bitcode to keep auth and payment addresses distinct.',
      'Install the GitHub App or connect a source provider second.',
      'Add optional email/contact settings only after wallet and source readiness are clear.',
      'Set profile identity, organization, and role posture only after required wallet and repository prerequisites are visible.',
      'Choose interface defaults for Terminal and connected surfaces.',
      'Review BTD and wallet-adjacent controls before settlement.',
    ],
  },
  {
    id: 'third-party-connections',
    eyebrow: 'Externals',
    title: 'Third-party connections are source-bearing ingress, not hidden account settings',
    summary:
      'Externals owns GitHub and future provider bindings because repository scope becomes source-bearing input for Read measurement, AssetPack synthesis, proof follow-through, and settlement readiness.',
    detail:
      'A healthy connection read tells the user whether the provider is pending, connected, reconnect-required, or available only from stored inventory. It also explains that wallet identity stays in Wallet, while repository attachment and provider scope stay in Externals.',
    reason:
      'New users read to understand why a missing GitHub or wallet connection blocks live writes without blocking learning-mode Terminal review.',
    points: [
      'GitHub scope defines which repositories Bitcode can read for source supply.',
      'Stored inventory can support reread, but live write admission fails closed until the provider is restored.',
      'Bitcoin wallet posture plus GitHub scope are the minimum live prerequisites before settlement or signed delivery.',
    ],
  },
  {
    id: 'interface-defaults',
    eyebrow: 'Interfaces',
    title: 'Interface defaults shape how Terminal, conversations, and proofs open',
    summary:
      'Interfaces owns Terminal detail density, non-ledgerized instruction posture, conversation return behavior, proof read mode, instruction tone, and execution bias.',
    detail:
      'These are not cosmetic preferences. They change how much detail Terminal opens with, how conversations re-enter the product, and whether proof readers see visual, mixed, or raw evidence first. Ledgerized Reading keeps protocol-owned model configuration.',
    reason:
      'Configuration becomes teachable when every preference says what operational consequence it has.',
    points: [
      'Packs detail density controls how much selected activity detail opens by default.',
      'Conversation launch controls whether chat appears as overlay, focused work, or continuity-preserving mode.',
      'Proof mode controls whether evidence opens visually, mixed with structured payloads, or raw first.',
    ],
  },
] as const satisfies readonly DocsGuideCard[];

const conversationsSections = [
  {
    id: 'conversations-role',
    eyebrow: 'Conversations',
    title: 'Conversations are the rich write surface, not a separate product',
    summary:
      'The conversational workspace lets users draft Reads, attach source context, reference AssetPacks, choose destinations, and coordinate outputs while still writing back into source-safe route state.',
    detail:
      'The active Protocol treats conversations as a first-class interface because many high-quality technical Reads begin in natural language. The important boundary is that messages must normalize into proof readback evidence rather than remaining unstructured chat history.',
    reason:
      'This is how Bitcode can support ChatGPT-like workflows without losing protocol-grade auditability.',
    points: [
      'Source attachments, output destinations, AssetPack references, and Read-measurement intent should be structured.',
      'Conversation-started executions should become /packs-readable rows.',
      'Branching should preserve attachments and execution references.',
    ],
  },
  {
    id: 'history-and-branching',
    eyebrow: 'Continuity',
    title: 'Conversation history must remain persisted and branchable',
    summary:
      'A conversation that changes Read, source context, or AssetPack intent must be recoverable by later route and /packs reads.',
    detail:
      'The user should be able to start a conversation, attach source, receive a response, continue later, branch the thread, and still have the resulting execution evidence appear in the activity system.',
    reason:
      'Without persistence and branch continuity, chat would be a helpful drafting area but not a Bitcode interface.',
  },
] as const satisfies readonly DocsGuideCard[];

const protocolSections = [
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

const proofSections = [
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

const settlementSections = [
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

const commercialInterfaceSections = [
  {
    id: 'interface-model',
    eyebrow: 'Interfaces',
    title: 'Commercial interfaces read and write route state under Protocol rules',
    summary:
      'GitHub, webhooks, ChatGPT App, Bitcode MCP, storage, compute, and future partner surfaces can admit inputs or deliver outputs, but they must not become parallel product owners.',
    detail:
      'An interface is healthy when its write admission is explicit, its read result can be found in /packs, and its boundary posture is source-safe before settlement, BTD rights transfer, and repository delivery.',
    reason:
      'This prevents interface sprawl from diluting the Bitcode AssetPack contract.',
    points: [
      'Ingress surfaces attach source, Read, or destination context.',
      'Delivery surfaces provide Shippables backed by AssetPack evidence.',
      'Every interface must preserve proof, disclosure, and fail-closed boundaries.',
    ],
  },
  {
    id: 'github-webhooks',
    eyebrow: 'GitHub + webhooks',
    title: 'GitHub and webhooks are connected-interface delivery and ingress surfaces',
    summary:
      'GitHub can bind repository supply and deliver the Protocol-backed Shippable as a pull request. Webhooks can schedule AssetPack automation and record ingress basis.',
    detail:
      'Neither GitHub nor webhooks own product canon. Their job is to feed or receive Bitcode-controlled state and leave evidence behind.',
    reason:
      'This keeps repository automation commercially useful without turning external provider behavior into unprovable product truth.',
  },
  {
    id: 'compute-storage',
    eyebrow: 'Runtime',
    title: 'Compute and storage are hardened runtime surfaces',
    summary:
      'Compute-container execution, storage publication/retrieval, telemetry, and reconciliation must be visible when they affect proof, source, settlement, or disclosure posture.',
    detail:
      'Users do not read every runtime detail by default. They do read to know what is live, what is modeled, what is boundary-only, and what is blocked.',
    reason:
      'Runtime honesty is the difference between a trusted commercial interface and a black-box automation demo.',
  },
] as const satisfies readonly DocsGuideCard[];

const mcpSections = [
  {
    id: 'mcp-role',
    eyebrow: 'MCP',
    title: 'Bitcode MCP is a connected proof-readback interface',
    summary:
      'MCP tools should expose current Bitcode actions and reads: attach source, express Read, admit AssetPack intent, read activity, inspect proof posture, and return write-admission evidence.',
    detail:
      'The MCP surface should be narrow and explicit. Non-admitted generic tools are support or reference surfaces until the Protocol and /packs can read their effects.',
    reason:
      'MCP makes Bitcode programmable, but programmability is only valuable if it keeps AssetPack proof parity.',
    points: [
      'Tool calls must be confirmation-gated when they write.',
      'Tool results must point back to /packs-readable activity.',
      'PromptPart and attachment structures preserve source and Read context.',
    ],
  },
  {
    id: 'api-read-write',
    eyebrow: 'API',
    title: 'The API contract is write, reread, and prove',
    summary:
      'A useful API action writes bounded intent, returns admission evidence, and gives the caller a way to reread the resulting proof-backed activity state.',
    detail:
      'Docs for MCP should therefore teach request shape, expected result, failure posture, and which proof readback confirms the write.',
    reason:
      'This mirrors the action manual for external developers and agentic clients.',
  },
] as const satisfies readonly DocsGuideCard[];

const chatGptAppSections = [
  {
    id: 'chatgpt-role',
    eyebrow: 'ChatGPT App',
    title: 'The ChatGPT App is a guided Bitcode interface, not a separate assistant',
    summary:
      'A ChatGPT App can help users express Reads, attach source, ask for proof explanations, draft Shippables, and operate through confirmation-gated writes.',
    detail:
      'Its answers should map back to /packs records and proof readback. The app may be conversational, but the proof and state contract remains Bitcode.',
    reason:
      'This keeps a familiar commercial interface aligned with Protocol-grade evidence instead of drifting into untracked chat output.',
    points: [
      'Confirm writes before changing route-owned state.',
      'Attach source, output destinations, Read intent, and AssetPack references as structured context.',
      'Return /packs links or activity IDs for reread.',
    ],
  },
  {
    id: 'safe-results',
    eyebrow: 'Results',
    title: 'Chat results should teach where to verify',
    summary:
      'A good ChatGPT App response should say what it did, what is staged, what is blocked, and where the user can verify the result in /packs or the relevant route.',
    detail:
      'This is the same write/read discipline as the action guide, adapted for conversational operation.',
    reason:
      'Users should never have to trust a chat transcript when /packs and route readback can show the actual state.',
  },
] as const satisfies readonly DocsGuideCard[];

const chatGptAppApiReference = [
  {
    id: 'chatgpt-app-tools',
    title: 'ChatGPT App MCP tools',
    summary:
      'These are the canonical tools exported by packages/chatgptapp. Read tools gather evidence; write tools require confirmed: true and return write-admission metadata.',
    packagePath: 'packages/chatgptapp/src/tools.ts',
    features: [
      {
        name: 'answer_codebase_query',
        method: 'tools/call',
        packagePath: 'packages/chatgptapp/src/tools.ts',
        useWhen: 'Ask a targeted question about the current repository or find existing implementation points.',
        howToUse:
          'Call with a regex-friendly query and optional cwd/maxResults. Use the returned file lines to decide whether to extend existing behavior or introduce new behavior.',
        inputs: [
          'query: required search pattern.',
          'cwd: optional working directory scope.',
          'maxResults: optional 1-500 cap, default 100.',
          'ignoreCase: optional boolean, default false.',
        ],
        outputs: [
          'answer: plain-language summary plus file:line hits.',
          'metadata.matches: structured match objects.',
          'metadata.matchCount and guidance: count and next-step framing.',
        ],
        verifyInTerminal: 'Use the resulting files as source context before a Terminal or connected-interface write.',
      },
      {
        name: 'answer_codeweb_query',
        method: 'tools/call',
        packagePath: 'packages/chatgptapp/src/tools.ts',
        useWhen: 'Research external technical references, examples, or documentation for a product or implementation decision.',
        howToUse:
          'Call with a focused query. Keep the result as external reference evidence, not route state, until it is attached to a real Bitcode action.',
        inputs: [
          'query: required web research query.',
          'numResults: optional 1-20 cap, default 8.',
          'useAutoprompt: optional provider refinement toggle, default true.',
        ],
        outputs: [
          'answer: numbered reading list or no-source guidance.',
          'metadata.provider: exa.',
          'metadata.results: normalized title, url, and summary records.',
        ],
      },
      {
        name: 'depict_design_asset',
        method: 'tools/call',
        packagePath: 'packages/chatgptapp/src/tools.ts',
        useWhen: 'Turn a screenshot, diagram, or wireframe into text that later tools can reference.',
        howToUse:
          'Pass base64 or text asset data with an optional focus. Use the depiction as context for design_code or code_design.',
        inputs: [
          'assetData: required base64 or UTF-8 asset representation.',
          'focus: optional analysis emphasis.',
          'notes: optional author hints.',
        ],
        outputs: [
          'depiction: textual description of the asset.',
          'metadata.focus: requested emphasis.',
          'metadata.bytes: decoded/estimated asset size.',
        ],
      },
      {
        name: 'design_code',
        method: 'tools/call',
        packagePath: 'packages/chatgptapp/src/tools.ts',
        useWhen: 'Capture conversational product intent into .ai/PRODUCT.md before planning implementation.',
        howToUse:
          'Pass raw ideas. Optionally include current PRODUCT.md or request digest regeneration before appending proposed updates.',
        inputs: [
          'ideas: required raw ideas or requirements.',
          'currentProductMd: optional current .ai/PRODUCT.md snapshot.',
          'regenerateFromDigest: optional boolean to rebuild the baseline from digest.',
        ],
        outputs: [
          'update: proposed update block.',
          'latest_design: full latest PRODUCT.md content.',
          'metadata.evidenceDocument, guidance, digestUsed, and prepared context stats.',
        ],
        verifyInTerminal: 'Treat this as design context until a later write creates /packs-readable activity.',
      },
      {
        name: 'code_design',
        method: 'tools/call',
        packagePath: 'packages/chatgptapp/src/tools.ts',
        useWhen: 'Translate accepted design intent into tasks and patch scaffolds before code changes.',
        howToUse:
          'Pass the design update and optional target files. Review the generated implementation actions before executing any write.',
        inputs: [
          'update: required implementation update or summary.',
          'latest_design: optional PRODUCT.md content.',
          'files: optional array of { path, intent } targets.',
        ],
        outputs: [
          'update: numbered implementation actions plus diff scaffold.',
          'latest_design: design basis used for the plan.',
          'metadata.taskCount, fileCount, guidance, and prepared context stats.',
        ],
      },
      {
        name: 'read_code_changes_from_vcs',
        method: 'tools/call',
        packagePath: 'packages/chatgptapp/src/tools.ts',
        useWhen: 'Summarize recent GitHub activity before deciding what changed or what to build next.',
        howToUse:
          'Pass a GitHub token, owner, repo, and optional branch/limit. Use the result as VCS read evidence.',
        inputs: [
          'accessToken: required GitHub repo-scoped token.',
          'owner and repo: required repository coordinates.',
          'branch: optional branch ref.',
          'limit: optional 1-50 commit cap, default 10.',
        ],
        outputs: [
          'changes: human-readable commit summary.',
          'metadata.branch and commitCount.',
          'metadata.urlSamples: source URLs for follow-up.',
        ],
      },
      {
        name: 'write_code_changes_to_vcs',
        method: 'tools/call',
        packagePath: 'packages/chatgptapp/src/tools.ts',
        useWhen: 'Create a GitHub repository or write file contents after explicit user confirmation.',
        howToUse:
          'Set confirmed: true. For createRepository, pass name/description/private. For createOrUpdateFile, pass owner/repo/path/content/message/branch.',
        inputs: [
          'operation: createRepository or createOrUpdateFile.',
          'confirmed: required true.',
          'accessToken: required GitHub repo-scoped token.',
          'name, description, private: repository creation inputs.',
          'owner, repo, path, content, message, branch: file-write inputs.',
        ],
        outputs: [
          'result: GitHub repository or commit response.',
          'metadata.operation and optional sha.',
          'metadata.writeAdmission: interfaceSurface, permission basis, operation, and targetAnchor.',
        ],
        verifyInTerminal: 'Reread the connected-interface result as a delivery mechanism, not independent product truth.',
        failureModes: [
          'Throws if confirmed is not true.',
          'Throws if createOrUpdateFile lacks owner, repo, or path.',
        ],
        requiresConfirmation: true,
      },
      {
        name: 'improve_developing_behavior',
        method: 'tools/call',
        packagePath: 'packages/chatgptapp/src/tools.ts',
        useWhen: 'Record collaboration rules or development behavior preferences into .ai/AGENTS.md.',
        howToUse:
          'Pass behaviorImprovement and optional current AGENTS.md. Use regenerateFromDigest when the baseline should be rebuilt first.',
        inputs: [
          'behaviorImprovement: optional behavior note.',
          'currentAgentsMd: optional current AGENTS.md snapshot.',
          'regenerateFromDigest: optional boolean.',
        ],
        outputs: [
          'behaviorDelta: appended behavior block.',
          'latestBehaviorDocument and latestBehavior: latest AGENTS.md.',
          'metadata.evidenceDocument, guidance, digestUsed, and prepared context stats.',
        ],
      },
      {
        name: 'use_vercel_read_external_mcp',
        method: 'tools/call',
        packagePath: 'packages/chatgptapp/src/tools.ts',
        useWhen: 'Read Vercel teams, projects, deployments, build logs, events, or docs from ChatGPT.',
        howToUse:
          'Set request to the Vercel read operation and pass provider-specific arguments in payload.',
        inputs: [
          'request: list_teams, list_projects, get_project, list_deployments, get_deployment, get_deployment_events, get_deployment_build_logs, or search_documentation.',
          'payload: optional Vercel arguments such as teamId, projectId, idOrUrl, limit, topic, or tokens.',
        ],
        outputs: [
          'answer: Vercel tool response.',
          'metadata.provider: vercel.',
          'metadata.request, evidenceDocument, and guidance.',
        ],
      },
      {
        name: 'use_vercel_write_external_mcp',
        method: 'tools/call',
        packagePath: 'packages/chatgptapp/src/tools.ts',
        useWhen: 'Request Vercel delivery actions after explicit user confirmation.',
        howToUse:
          'Set confirmed: true and request deploy_to_vercel, buy_domain, or check_domain_availability with provider arguments in payload.',
        inputs: [
          'request: deploy_to_vercel, buy_domain, or check_domain_availability.',
          'confirmed: required true.',
          'payload: projectId/teamId/message, domain names/contact, or availability names.',
        ],
        outputs: [
          'result: Vercel write or availability result.',
          'metadata.provider, request, guidance, and evidenceDocument.',
          'metadata.writeAdmission with connectedInterface vercel and targetAnchor.',
        ],
        failureModes: ['Throws if confirmed is not true.'],
        requiresConfirmation: true,
      },
      {
        name: 'use_aws_read_external_mcp',
        method: 'tools/call',
        packagePath: 'packages/chatgptapp/src/tools.ts',
        useWhen: 'Read AWS runtime state from ChatGPT for health checks or configuration confirmation.',
        howToUse:
          'Set request to the AWS read action and pass the raw AWS-style payload through to the underlying tool.',
        inputs: [
          'request: lambda.invoke, s3.getObject, dynamo.getItem, or cloudwatch.log.',
          'payload: raw function, bucket/key, table/key, or log query arguments.',
        ],
        outputs: [
          'answer: AWS read result.',
          'metadata.provider: aws.',
          'metadata.request, evidenceDocument, and guidance.',
        ],
      },
      {
        name: 'use_aws_write_external_mcp',
        method: 'tools/call',
        packagePath: 'packages/chatgptapp/src/tools.ts',
        useWhen: 'Write scoped AWS delivery/configuration outputs after explicit user confirmation.',
        howToUse:
          'Set confirmed: true and request s3.putObject or dynamo.putItem with the underlying AWS payload.',
        inputs: [
          'request: s3.putObject or dynamo.putItem.',
          'confirmed: required true.',
          'payload: bucket/key/body or table/item style arguments.',
        ],
        outputs: [
          'result: AWS write result.',
          'metadata.provider, request, guidance, and evidenceDocument.',
          'metadata.writeAdmission with connectedInterface aws and targetAnchor.',
        ],
        failureModes: ['Throws if confirmed is not true.'],
        requiresConfirmation: true,
      },
    ],
  },
] as const satisfies readonly DocsInterfaceApiSection[];

const mcpApiReference = [
  {
    id: 'mcp-call-lifecycle',
    title: 'MCP call lifecycle',
    summary:
      'The proof-readback MCP server exposes tools/list and tools/call over the Model Context Protocol, authenticates each call, applies rate/resource limits, and dispatches by bitcode:// prefix.',
    packagePath: 'packages/executions-mcp/src/mcp-server/src/server.ts',
    features: [
      {
        name: 'tools/list',
        method: 'MCP request',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/server.ts',
        useWhen: 'Discover the active default Bitcode MCP tools available to a client.',
        howToUse:
          'Call tools/list after connecting. The default server registers pipeline, analysis, intelligence, enterprise, LSP, and observability categories.',
        inputs: ['No body is required for discovery.'],
        outputs: [
          'tools: array of { name, description, inputSchema } records.',
          'Server logs include count and failed category count.',
        ],
      },
      {
        name: 'tools/call',
        method: 'MCP request',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/server.ts',
        useWhen: 'Execute one proof-readback MCP feature.',
        howToUse:
          'Pass name and arguments. Include request params _meta.authorization when auth is required. Local repositories are prepared before execution when repository.provider is local.',
        inputs: [
          'name: required bitcode:// tool identifier.',
          'arguments: tool-specific validated input object.',
          '_meta.authorization: optional auth header used by authenticateMCPRequest.',
        ],
        outputs: [
          'Tool-specific result object.',
          'Execution passes through auth, rate limits, resource limits, and circuit breaker handling.',
        ],
        failureModes: [
          'Authentication failure rejects the call.',
          'Invalid schema arguments return validation errors.',
          'Unknown tool names fail closed.',
        ],
      },
    ],
  },
  {
    id: 'mcp-pipeline-tools',
    title: 'Pipeline tools',
    summary:
      'Pipeline tools write bounded AssetPack intent into route-facing execution, require pipeline create permission, and return rereadable run/admission metadata.',
    packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/pipeline-tools.ts',
    features: [
      {
        name: 'bitcode://pipelines/asset-pack/create',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/pipeline-tools.ts',
        useWhen: 'Create an AssetPack pipeline for implementation, review, issue work, docs, diagrams, API specs, scaffolding, planning, or refactoring.',
        howToUse:
          'Pass task, repository, subtype, and optional attachments/connections. Use streaming for queued run reread or wait for completion when streaming is false.',
        inputs: [
          'task: required detailed task, minimum 10 characters.',
          'repository: required RepositoryContext, including provider/owner/name/branch or local path.',
          'subtype: pull_request, pr_review, issue, comment, blog_post, diagram, api_spec, frontend_scaffolder, scope_analysis, implementation_plan, or refactor_proposal.',
          'attachments: optional multimodal source context.',
          'connections: optional repository/provider ingress context.',
          'mcpConfig, streaming, organizationId, modelPreferences, and options.',
        ],
        outputs: [
          'runId and assetPackEvidenceId.',
          'status, interfaceSurface, inputContext, writeAdmission, and outputMeaning.',
          'When completed: result, AssetPack synthesis artifacts, Shippables, measuredBtd, BTC-fee posture, timestamps, and events.',
        ],
        verifyInTerminal: 'Open the returned run/activity and inspect AssetPack, proof, delivery, and settlement posture.',
        failureModes: [
          'Requires pipelines.create permission.',
          'Rejects incoherent repository_connection ingress.',
          'Rejects non-local providers without matching connection or provider credential.',
        ],
        requiresConfirmation: true,
      },
    ],
  },
  {
    id: 'mcp-analysis-tools',
    title: 'Analysis tools',
    summary:
      'Analysis tools read repository, dependency, pattern, and trend evidence for route and interface users.',
    packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/analysis-tools.ts',
    features: [
      {
        name: 'bitcode://analysis/repository/analyze',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/analysis-tools.ts',
        useWhen: 'Analyze one repository for architecture, dependencies, security, performance, quality, complexity, patterns, or technical debt.',
        howToUse: 'Pass repository coordinates, analysisType, and optional depth/output controls.',
        inputs: [
          'repository: { owner, name, branch? }.',
          'analysisType: architecture, dependencies, security, performance, quality, complexity, patterns, or technical_debt.',
          'depth: surface, medium, or deep.',
          'includeMetrics and outputFormat.',
        ],
        outputs: ['repository, branch, analysisType, timestamp, analyst.', 'results and metadata with analysisId, duration, confidence, lines/files analyzed.'],
      },
      {
        name: 'bitcode://analysis/intelligence/synthesize',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/analysis-tools.ts',
        useWhen: 'Synthesize trends across repository, organization, or user scope.',
        howToUse: 'Pass scope/timeframe and optional repositories, analysisTypes, recommendation, and confidence settings.',
        inputs: [
          'scope: repository, organization, or user.',
          'timeframe: 7d, 30d, 90d, or all.',
          'repositories and analysisTypes.',
          'includeRecommendations and confidenceThreshold.',
        ],
        outputs: ['insights, recommendations, trends, and metadata.', 'Confidence-scored strategic guidance for engineering decisions.'],
      },
      {
        name: 'bitcode://analysis/patterns/detect',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/analysis-tools.ts',
        useWhen: 'Find design patterns, anti-patterns, architecture patterns, testing patterns, security patterns, or performance patterns.',
        howToUse: 'Pass repository/path plus pattern type filters and severity.',
        inputs: [
          'repository: { owner, name, path? }.',
          'patternTypes: optional array.',
          'language, includeExamples, and severity.',
        ],
        outputs: ['patterns with type, name, confidence, locations, examples, severity, and recommendations.', 'summary totals and average confidence.'],
      },
      {
        name: 'bitcode://analysis/dependencies/analyze',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/analysis-tools.ts',
        useWhen: 'Analyze dependency graph, vulnerabilities, licenses, updates, and dependency risk.',
        howToUse: 'Pass repository plus depth and inclusion toggles.',
        inputs: [
          'repository: { owner, name }.',
          'analysisDepth: direct, transitive, or full.',
          'includeVulnerabilities, includeLicenses, includeUpdates.',
          'outputFormat: json, graph, or report.',
        ],
        outputs: ['dependency counts, vulnerabilities, license summary, update recommendations, and risk posture.'],
      },
    ],
  },
  {
    id: 'mcp-intelligence-tools',
    title: 'Intelligence tools',
    summary:
      'Intelligence tools turn measured code, repositories, research, and attachments into higher-level recommendations.',
    packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/intelligence-tools.ts',
    features: [
      {
        name: 'bitcode://intelligence/effectiveness/track',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/intelligence-tools.ts',
        useWhen: 'Measure, predict, learn, or optimize code-change effectiveness.',
        howToUse: 'Choose operation and provide the matching metrics, proposedChanges, outcomes, or targetMetrics.',
        inputs: ['operation: measure, predict, learn, or optimize.', 'pipelineId, beforeMetrics, afterMetrics, repository, proposedChanges, outcomes, targetMetrics, constraints, timeframe, includeConfidence.'],
        outputs: ['Effectiveness scores, predictions, learning results, or optimization recommendations with confidence data.'],
      },
      {
        name: 'bitcode://intelligence/cross-repo/learn',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/intelligence-tools.ts',
        useWhen: 'Extract, propagate, analyze, or recommend cross-repository patterns.',
        howToUse: 'Choose operation and provide source repositories, patterns, targets, analysisType, or repositoryContext.',
        inputs: ['operation: extract, propagate, analyze, or recommend.', 'sourceRepositories, patterns, targetRepositories, analysisType, repositoryContext, includeVisualization, maxResults.'],
        outputs: ['Extracted patterns, propagation results, cross-repo insights, visualization data, and recommendations.'],
      },
      {
        name: 'bitcode://intelligence/research/advanced',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/intelligence-tools.ts',
        useWhen: 'Run multi-provider research with URL credibility and synthesis.',
        howToUse: 'Pass a detailed query, researchType, provider list, filters, and synthesis options.',
        inputs: ['query, researchType, providers, filters, synthesisType, maxResults, includeUrlIntelligence, contextAware.'],
        outputs: ['research_results, synthesis, url_intelligence, and credibility_scores.'],
      },
      {
        name: 'bitcode://intelligence/multimodal/process',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/intelligence-tools.ts',
        useWhen: 'Process images, audio, video, documents, Figma files, or URLs into technical knowledge evidence.',
        howToUse: 'Pass at least one attachment, a processingType, and desired output format/synthesis settings.',
        inputs: ['attachments: array of { type, content, metadata? }.', 'processingType, outputFormat, crossModalSynthesis, includeImplementationGuidance, contextRepository, qualityThreshold.'],
        outputs: ['processed_attachments, synthesis, implementation_guidance, and quality_scores.'],
      },
      {
        name: 'bitcode://intelligence/enterprise/orchestrate',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/intelligence-tools.ts',
        useWhen: 'Analyze team, organization, knowledge, skill-gap, collaboration, innovation, risk, or strategy posture.',
        howToUse: 'Pass operation, organizationId, scope, time horizon, depth, recommendation, benchmarking, and confidentiality settings.',
        inputs: ['operation, organizationId, scope, timeHorizon, analysisDepth, includeRecommendations, includeBenchmarking, confidentialityLevel.'],
        outputs: ['analysis, strategic_insights, benchmarking, and recommendations.'],
      },
      {
        name: 'bitcode://intelligence/marketplace/analyze',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/intelligence-tools.ts',
        useWhen: 'Discover, assess, price, or risk-review marketplace solutions and providers.',
        howToUse: 'Choose marketplace operation and provide requirements, listing/provider IDs, search query, filters, and risk settings.',
        inputs: ['operation, requirements, listingId, providerId, searchQuery, filters, includeCompetitiveAnalysis, riskTolerance.'],
        outputs: ['solutions, quality_assessment, provider_analysis, and recommendations.'],
      },
    ],
  },
  {
    id: 'mcp-enterprise-tools',
    title: 'Enterprise interface tools',
    summary:
      'Enterprise tools configure webhooks, managed APIs, integration marketplace connectors, and observability surfaces.',
    packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/enterprise-tools.ts',
    features: [
      {
        name: 'bitcode://enterprise/webhook/orchestrate',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/enterprise-tools.ts',
        useWhen: 'Create, update, delete, test, route, batch, or inspect enterprise webhooks.',
        howToUse: 'Pass operation and the webhook/routing/test/analytics payload that matches it.',
        inputs: ['operation plus webhook config, testPayload, analyticsTimeRange, webhookIds, or routingRules.'],
        outputs: ['Webhook operation result, analytics, delivery status, routing results, or audit-ready recommendations.'],
      },
      {
        name: 'bitcode://enterprise/api/manage',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/enterprise-tools.ts',
        useWhen: 'Manage API lifecycle: create, version, deploy, govern, document, rate-limit, monitor, or test APIs.',
        howToUse: 'Pass operation and API config, environment, versioning strategy, governance rules, or test suite.',
        inputs: ['operation plus api, versioningStrategy, environment, governanceRules, or testSuite.'],
        outputs: ['API operation result, governance score, documentation output, analytics, or test report.'],
      },
      {
        name: 'bitcode://enterprise/integration/marketplace',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/enterprise-tools.ts',
        useWhen: 'Browse, install, configure, update, uninstall, analyze, develop, or publish enterprise integrations.',
        howToUse: 'Pass operation and the relevant marketplace, integration, connector, or filter payload.',
        inputs: ['operation plus filters, integration config, connector config, dataMapping, triggers, schedule, or tests.'],
        outputs: ['integrations, marketplace_analytics, installation_status, and custom_connectors.'],
      },
      {
        name: 'bitcode://enterprise/observability/configure',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/enterprise-tools.ts',
        useWhen: 'Configure metrics, traces, logs, alerts, dashboards, and analysis settings for enterprise observability.',
        howToUse: 'Pass monitoringConfig, alerts, dashboard, and analysisConfig.',
        inputs: ['monitoringConfig, alerts, dashboard, analysisConfig.'],
        outputs: ['monitoring_status, dashboards, alerts, telemetry_endpoints, and related configuration results.'],
      },
    ],
  },
  {
    id: 'mcp-lsp-tools',
    title: 'LSP and code-intelligence tools',
    summary:
      'LSP tools provide semantic analysis, navigation/refactoring, diagnostics, and workspace-wide intelligence.',
    packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/lsp-tools.ts',
    features: [
      {
        name: 'bitcode://lsp/semantic/analyze',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/lsp-tools.ts',
        useWhen: 'Analyze symbols, types, dependency graphs, call graphs, semantic search, hover, or signatures.',
        howToUse: 'Pass repository, targets, optional position, analysisConfig, and filters.',
        inputs: ['repository, targets, position, analysisConfig, filters.'],
        outputs: ['Semantic analysis, symbol relationships, dependency/call graph data, and contextual code intelligence.'],
      },
      {
        name: 'bitcode://lsp/intelligence/navigate',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/lsp-tools.ts',
        useWhen: 'Find references, rename symbols, extract methods, find implementations, get actions, or organize imports.',
        howToUse: 'Pass repository, symbol target, refactoring config, optional range, and formatting options.',
        inputs: ['repository, symbol, refactoringConfig, range, formattingOptions.'],
        outputs: ['references, rename or refactor previews, implementations, code actions, quick fixes, and source actions.'],
      },
      {
        name: 'bitcode://lsp/diagnostic/analyze',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/lsp-tools.ts',
        useWhen: 'Run diagnostics across syntax, semantics, performance, security, complexity, tests, or dependencies.',
        howToUse: 'Pass repository, scope, diagnosticConfig, thresholds, preferences, and outputConfig.',
        inputs: ['repository, scope, diagnosticConfig, qualityThresholds, analysisPreferences, outputConfig.'],
        outputs: ['diagnostics, quality_score, recommendations, and metrics.'],
      },
      {
        name: 'bitcode://lsp/workspace/intelligence',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/lsp-tools.ts',
        useWhen: 'Understand architecture, module dependencies, API surface, change impact, technical debt, and knowledge graph.',
        howToUse: 'Pass repository, analysisScope, changeAnalysis, architectureConfig, knowledgeGraphConfig, migrationConfig, and visualizationConfig.',
        inputs: ['repository, analysisScope, changeAnalysis, architectureConfig, knowledgeGraphConfig, migrationConfig, visualizationConfig.'],
        outputs: ['workspace_analysis, architecture_insights, knowledge_graph, and recommendations.'],
      },
    ],
  },
  {
    id: 'mcp-observability-tools',
    title: 'Observability tools',
    summary:
      'Observability tools read and configure metrics, traces, business intelligence, and log analytics.',
    packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/observability-tools.ts',
    features: [
      {
        name: 'bitcode://observability/metrics/realtime',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/observability-tools.ts',
        useWhen: 'Collect/query metrics, configure alerts, build dashboards, or stream real-time data.',
        howToUse: 'Pass metrics, query, alert, dashboard, and streamConfig depending on the operation.',
        inputs: ['metrics, query, alert, dashboard, streamConfig.'],
        outputs: ['metrics result, alert status, dashboard data, stream configuration, anomalies, and benchmarks.'],
      },
      {
        name: 'bitcode://observability/tracing/distributed',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/observability-tools.ts',
        useWhen: 'Analyze distributed traces, spans, service maps, profiling, bottlenecks, and request flow.',
        howToUse: 'Pass trace/span data and analysis, profiling, and service-map config.',
        inputs: ['trace, span, analysisConfig, profilingConfig, serviceMapConfig.'],
        outputs: ['trace analysis, bottlenecks, dependencies, health, and visualization data.'],
      },
      {
        name: 'bitcode://observability/intelligence/business',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/observability-tools.ts',
        useWhen: 'Read technical productivity, ROI, technical debt cost, velocity, quality, innovation, and benchmark metrics.',
        howToUse: 'Pass scope, metricsConfig, analysisPreferences, outputConfig, and benchmarkConfig.',
        inputs: ['scope, metricsConfig, analysisPreferences, outputConfig, benchmarkConfig.'],
        outputs: ['metrics, insights, recommendations, and forecasts.'],
      },
      {
        name: 'bitcode://observability/logs/analytics',
        method: 'tools/call',
        packagePath: 'packages/executions-mcp/src/mcp-server/src/tools/observability-tools.ts',
        useWhen: 'Run log search, pattern detection, anomaly analysis, security analysis, or compliance reporting.',
        howToUse: 'Pass logs or searchQuery with analysis, pattern, anomaly, and compliance config.',
        inputs: ['logs, analysisConfig, searchQuery, patternConfig, anomalyConfig, complianceConfig.'],
        outputs: ['analysis, patterns, anomalies, compliance, and correlated log intelligence.'],
      },
    ],
  },
] as const satisfies readonly DocsInterfaceApiSection[];

const configurationSections = [
  {
    id: 'environment-modes',
    eyebrow: 'Modes',
    title: 'Environment mode, feature flags, and boundary state explain what is live',
    summary:
      'Production, staging, development, and mock postures must stay explicit. Feature flags can keep launch-mode controls visible but disabled until the connected implementation is ready.',
    detail:
      'A disabled control should still teach what it will do. That keeps users oriented and avoids implying that missing connectivity is accidental breakage.',
    reason:
      'This is especially important while Terminal is active and advancing from mocked state toward commercial readiness.',
    points: [
      'Disabled controls remain visible with clear tooltip copy.',
      'Product routes are active; compatibility and Auxillaries surfaces can remain gated by launch flags.',
      'Boundary truth should be readable before any proof or settlement trust decision.',
    ],
  },
  {
    id: 'preferences',
    eyebrow: 'Preferences',
    title: 'Configuration should be rich but consequence-oriented',
    summary:
      'Auxillary configuration includes repository connections, interface defaults, profile identity, wallet posture, organization roles, $BTD settings, and future connected-interface options.',
    detail:
      'Each preference should explain the operational consequence: what it changes in route detail, settlement, delivery, or proof visibility.',
    reason:
      'Configuration is not a settings dump; it is the user-facing control plane around AssetPacks.',
  },
  {
    id: 'fail-closed',
    eyebrow: 'Safety',
    title: 'Every blocked configuration path should fail closed',
    summary:
      'Wallet verification drift, missing repository scope, stale connection state, projection overexposure, or unadmitted interface writes should block the risky action while preserving safe reads and learning.',
    detail:
      'The product can still show mocked or review-only state, but it must be honest about what cannot yet transact or deliver.',
    reason:
      'Fail-closed behavior makes launch-mode UX useful without weakening the production standard.',
  },
] as const satisfies readonly DocsGuideCard[];

export const TERMINAL_ACTION_GUIDES = [
  {
    id: 'scenario',
    action: 'Choose the active scenario',
    location: 'Command deck',
    write:
      'Select the measured Read or operating frame the Terminal should honor before fit, branch, and closure work continues.',
    expectedRead:
      'Route readback rereads deposit, read, fit, and closure against the selected scenario rather than treating it as a cosmetic filter.',
    proofSignal: TERMINAL_INLINE_EXPLAINERS.scenario.summary,
  },
  {
    id: 'projection',
    action: 'Set projection',
    location: 'Command deck',
    write:
      'Choose whether the current flow is previewing, staging, or readying a stronger materialized posture.',
    expectedRead:
      'The rest of the Terminal should make clear which posture is being read before any state-changing work is trusted.',
    proofSignal: TERMINAL_INLINE_EXPLAINERS.projection.summary,
  },
  {
    id: 'branch-mode',
    action: 'Set branch mode',
    location: 'Command deck and closure controls',
    write:
      'Select the AssetPack execution posture that branch materialization should use when closure runs.',
    expectedRead:
      'Branch, settlement, and proof panels should reflect the selected mode as an operator-visible Bitcode decision.',
    proofSignal: TERMINAL_INLINE_EXPLAINERS.branchMode.summary,
  },
  {
    id: 'provider-repository',
    action: 'Select provider and repository',
    location: 'Repository context',
    write:
      'Bind the deposit-side boundary to the provider and repository whose source supply the Terminal may search and cite.',
    expectedRead:
      'Repository supply, deposit provenance, and later closure reads should all stay attached to that selected source perimeter.',
    proofSignal: TERMINAL_INLINE_EXPLAINERS.providerRepository.summary,
  },
  {
    id: 'repository-anchor',
    action: 'Record repository anchor',
    location: 'Repository context',
    write:
      'Write the selected source perimeter into Bitcode activity so it survives navigation and later rereads.',
    expectedRead:
      'Recent Terminal activity shows repository posture beside deposit, read, proof, and settlement records.',
    proofSignal: TERMINAL_INLINE_EXPLAINERS.repositoryAnchor.summary,
  },
  {
    id: 'supply-selection',
    action: 'Search, filter, and select supply',
    location: 'Deposit-side supply',
    write:
      'Use auth session, artifact kind, and inventory search to narrow the supply set before drafting a deposit.',
    expectedRead:
      'Selected inventory remains explicit and can be carried directly into deposit, deposit, fit, and closure.',
    proofSignal: TERMINAL_WORKSPACE_EXPLAINERS.supplyInventory.summary,
  },
  {
    id: 'deposit-posture',
    action: 'Record deposit-side posture',
    location: 'Deposit + read workbench',
    write:
      'Record the current deposit-side summary into the Bitcode activity ledger when supply posture is ready to be reread.',
    expectedRead:
      'The selected activity can show what was offered, where it came from, and how it relates to later fit.',
    proofSignal: TERMINAL_WORKSPACE_EXPLAINERS.depositReadChain.summary,
  },
  {
    id: 'active-read',
    action: 'Record active Read',
    location: 'Read measurement',
    write:
      'Write the currently measured demand frame into the Bitcode activity ledger before fit and closure read against it.',
    expectedRead:
      'The Terminal activity result can reopen the exact Read frame with parser posture, scenario, and review state intact.',
    proofSignal: TERMINAL_INLINE_EXPLAINERS.activeNeed.summary,
  },
  {
    id: 'read-review',
    action: 'Accept, reject, or remeasure Read',
    location: 'Read measurement',
    write:
      'Choose whether the measured Read is admitted for Finding Fits, rejected, or sent back for remeasurement with feedback.',
    expectedRead:
      'Finding Fits stays blocked until Read review is accepted, and the closure map shows the current review posture.',
    proofSignal: TERMINAL_WORKSPACE_EXPLAINERS.readScenarios.summary,
  },
  {
    id: 'deposit-draft',
    action: 'Complete deposit provenance',
    location: 'Deposit intake',
    write:
      'Set source repo, source commit or ref, signer address, selected supply, and optional raw content where exact provenance is required.',
    expectedRead:
      'The deposit draft reads as source-backed supply rather than loose metadata, with readiness blockers visible before submit.',
    proofSignal: TERMINAL_WORKSPACE_EXPLAINERS.depositComposer.summary,
  },
  {
    id: 'deposit-submit',
    action: 'Deposit into Bitcode',
    location: 'Deposit intake',
    write:
      'Submit selected supply, provenance, and content into the Bitcode activity chain.',
    expectedRead:
      'A ledger row should be rereadable immediately and should carry forward into fit, proof, settlement, and history.',
    proofSignal: TERMINAL_INLINE_EXPLAINERS.depositSubmission.summary,
  },
  {
    id: 'external-readiness',
    action: 'Record external interface readiness',
    location: 'External interface readiness',
    write:
      'Record whether connections, attachments, repository scope, and boundary services are live, modeled, blocked, or review-only.',
    expectedRead:
      'The Terminal shows boundary truth before downstream AssetPacks or settlement are trusted.',
    proofSignal: TERMINAL_WORKSPACE_EXPLAINERS.boundaryRuntime.summary,
  },
  {
    id: 'closure-run',
    action: 'Run closure and branch follow-through',
    location: 'Closure controls',
    write:
      'Run the closure path from Read review through verification, branch materialization, settlement, and proof.',
    expectedRead:
      'Verification, branch artifacts, AssetPack settlement, ledger continuity, and history should read as one consequence chain.',
    proofSignal: TERMINAL_INLINE_EXPLAINERS.closureAction.summary,
  },
  {
    id: 'closure-refresh-reset',
    action: 'Refresh or reset closure state',
    location: 'Closure controls',
    write:
      'Refresh the current closure read or reset closure state when the operator needs to rebuild the exact follow-through path.',
    expectedRead:
      'The Terminal should make runtime status, visible artifacts, proof families, credited assets, and flow continuity explicit.',
    proofSignal: TERMINAL_WORKSPACE_EXPLAINERS.closureControls.summary,
  },
  {
    id: 'conversations-mode',
    action: 'Open Conversations',
    location: 'Support rail and experience map',
    write:
      'Open natural-language drafting and coordination without losing the current Bitcode activity context.',
    expectedRead:
      'The Terminal remains the primary ledger, while conversation output can assist drafting and follow-through.',
    proofSignal: 'Conversations are a deliberate mode change, not a competing destination.',
  },
  {
    id: 'auxillaries-mode',
    action: 'Open Auxillaries',
    location: 'Support rail and navigation',
    write:
      'Open profile, connects, interface defaults, wallet posture, and $BTD state when identity or interface posture must change.',
    expectedRead:
      'The Terminal keeps its selected activity context while Auxillaries changes readiness and account posture.',
    proofSignal: BITCODE_PUBLIC_EXPLAINERS.openOrbitals.summary,
  },
] as const satisfies readonly TerminalActionGuide[];

export const TERMINAL_READ_GUIDES = [
  {
    id: 'activity-ledger',
    read: 'Terminal activity results',
    location: 'Bitcode Terminal',
    tellsYou:
      'Which Bitcode activity is selected, how it is typed, and whether it reads as deposit, Read, closure, proof, or history posture.',
    expectedResult:
      'You can search, filter, page, and reopen activity without losing the selected detail read.',
  },
  {
    id: 'selected-detail',
    read: 'Selected activity detail',
    location: 'Bitcode Terminal',
    tellsYou:
      'The selected activity identity, source posture, AssetPacks, proof rows, closure state, and related history.',
    expectedResult:
      'You can decide whether to stay at summary level or open exact proof, branch, settlement, or ledger detail.',
  },
  {
    id: 'read-window',
    read: TERMINAL_INLINE_EXPLAINERS.readWindow.title,
    location: 'Experience frame',
    tellsYou: TERMINAL_INLINE_EXPLAINERS.readWindow.summary,
    expectedResult:
      'The central ledger remains primary while deeper modes and proof views are deliberate follow-through.',
  },
  {
    id: 'transaction-readiness',
    read: TERMINAL_INLINE_EXPLAINERS.transactionReadiness.title,
    location: 'Command deck, deposit, and closure controls',
    tellsYou: TERMINAL_INLINE_EXPLAINERS.transactionReadiness.summary,
    expectedResult:
      'If readiness is incomplete, branch, deposit, signed settlement, and closure stay fail-closed while review can continue.',
  },
  {
    id: 'boundary-runtime',
    read: TERMINAL_WORKSPACE_EXPLAINERS.boundaryRuntime.title,
    location: 'External interface readiness',
    tellsYou: TERMINAL_WORKSPACE_EXPLAINERS.boundaryRuntime.summary,
    expectedResult:
      'Live, modeled, boundary-only, and blocked states are visible before downstream proof or settlement work is trusted.',
  },
  {
    id: 'supply-fit',
    read: TERMINAL_WORKSPACE_EXPLAINERS.supplyFit.title,
    location: 'Deposit and read overview',
    tellsYou: TERMINAL_WORKSPACE_EXPLAINERS.supplyFit.summary,
    expectedResult:
      'Repository supply, measured Read, and fit posture can be read together before exact proof inspection.',
  },
  {
    id: 'closure-map',
    read: TERMINAL_WORKSPACE_EXPLAINERS.closureMap.title,
    location: 'Closure and provenance',
    tellsYou: TERMINAL_WORKSPACE_EXPLAINERS.closureMap.summary,
    expectedResult:
      'Read review, verification, branch artifacts, AssetPack settlement, and ledger continuity read as one sequence.',
  },
  {
    id: 'proof-runtime',
    read: TERMINAL_WORKSPACE_EXPLAINERS.sourcePath.title,
    location: 'Demonstration witness detail',
    tellsYou: TERMINAL_WORKSPACE_EXPLAINERS.sourcePath.summary,
    expectedResult:
      'Dense replay, proof, and settlement detail stays available without making the main Terminal feel like plumbing.',
  },
  {
    id: 'ledger-pulse',
    read: TERMINAL_WORKSPACE_EXPLAINERS.ledgerPulse.title,
    location: 'Pinned operating signals',
    tellsYou: TERMINAL_WORKSPACE_EXPLAINERS.ledgerPulse.summary,
    expectedResult:
      'You can judge whether activity is moving, blocked, proving, or ready for closure before opening exact detail.',
  },
] as const satisfies readonly TerminalReadGuide[];

export const BITCODE_DOCS_PAGES = [
  docsPage({
    slug: 'what-is-bitcode',
    chapterId: 'start',
    eyebrow: 'Start here',
    title: 'What Bitcode is',
    summary:
      'Begin with the zero-to-hero map: what AssetPack commodities are, how BTD scalar volume and rights work, why BTC settlement money matters, and where Protocol and interfaces fit.',
    detail:
      'This is the first page for readers who know nothing about Bitcode. It keeps the model plain before introducing /deposits, /reads, /packs, proof, and interface pages.',
    learningOutcome:
      'You can explain Bitcode as knowledge-commoditization infrastructure and name the major product surfaces without reading implementation history.',
    primaryCta: { href: '/docs/source-shares', label: 'Continue to AssetPacks' },
    sections: whatIsBitcodeSections,
    embeddedUi: [
      {
        id: 'product-surfaces',
        eyebrow: 'Component vocabulary',
        title: '/deposits, /reads, /packs, Protocol, interfaces',
        summary:
          'The docs use the same card and explainer pattern as the product routes so the mental model transfers into the commercial surfaces.',
        explainer: TERMINAL_WORKSPACE_EXPLAINERS.experienceMap,
        signals: [
          { label: 'Packs', value: 'Activity and proof readback', tone: 'emerald' },
          { label: 'Read/Deposit', value: 'User paths', tone: 'cyan' },
          { label: 'Protocol', value: 'Rules and proofs', tone: 'amber' },
        ],
        steps: [
          { label: 'Deposit', body: 'Source enters with provenance and repository context.' },
          { label: 'Read', body: 'Demand becomes measurable before fit or settlement.' },
          { label: 'Read', body: 'Every write must produce a proof-readable result.' },
        ],
      },
    ],
  }),
  docsPage({
    slug: 'source-shares',
    chapterId: 'start',
    eyebrow: 'AssetPacks',
    title: 'AssetPacks, BTD, and the Bitcode activity ledger',
    summary:
      'Learn the value model first: Bitcode measures technical source into AssetPacks, BTD scalar volume and rights, and BTC-settled delivery.',
    detail:
      'This guide is for first-time readers who read the simple model before using the product routes: source supply comes in, demand is measured, fit and proofs decide what can move, and settlement makes attribution readable.',
    learningOutcome:
      'You can describe an AssetPack, identify what gets measured, and understand why proof-backed BTC settlement and BTD rights matter.',
    primaryCta: { href: '/docs/exchange', label: 'Read compatibility guide' },
    sections: sourceSharesSections,
    embeddedUi: [
      {
        id: 'source-share-flow',
        eyebrow: 'Terminal specimen',
        title: 'AssetPack status card',
        summary:
          'This mirrors the compact status cards used around product routes: a reader should see supply, Read, fit, and proof as related signals.',
        explainer: TERMINAL_WORKSPACE_EXPLAINERS.supplyFit,
        signals: [
          { label: 'Supply', value: 'Repository-backed', tone: 'emerald' },
          { label: 'Read', value: 'Measured and reviewable', tone: 'cyan' },
          { label: 'Settlement', value: 'BTC + BTD rights staged', tone: 'amber' },
        ],
      },
    ],
  }),
  docsPage({
    slug: 'exchange',
    chapterId: 'experiences',
    eyebrow: 'Compatibility',
    title: 'Understand /exchange compatibility and /packs',
    summary:
      '/exchange is a compatibility redirect to /packs. /packs is the durable activity, persistence, proof, settlement, compensation, delivery, and repair readback surface.',
    detail:
      'Use this page after AssetPacks are clear. It explains why bounded actions must reread proof-backed activity before users trust the result.',
    learningOutcome:
      'You can explain why /exchange survives only as compatibility and why rereadable /packs state is central to Bitcode.',
    primaryCta: { href: '/packs', label: 'Open Packs' },
    sections: exchangeSections,
    embeddedUi: [
      {
        id: 'exchange-ledger',
        eyebrow: 'Embedded Packs card',
        title: 'Packs activity master-detail',
        summary:
          '/packs uses a master-detail pattern: searchable activity rows as the master, selected AssetPack/proof/history state as detail.',
        explainer: TERMINAL_INLINE_EXPLAINERS.readWindow,
        signals: [
          { label: 'Search', value: 'Query-owned ledger', tone: 'default' },
          { label: 'Selected detail', value: 'Proof + history', tone: 'emerald' },
          { label: 'Reread', value: 'Durable /packs state', tone: 'cyan' },
        ],
      },
    ],
  }),
  docsPage({
    slug: 'terminal',
    chapterId: 'experiences',
    eyebrow: 'Terminal map',
    title: 'Orient inside the Bitcode Terminal',
    summary:
      'Understand the Terminal as one focused Deposit/Read operator surface with recent activity results, support rails, and exact proof follow-through.',
    detail:
      'Use this page when you read to know where to read, where to write, and when to open deeper modes such as Conversations or Auxillaries.',
    learningOutcome:
      'You can open Terminal and identify the read window, write posture, repository supply, support rail, and deeper modes.',
    primaryCta: { href: '/docs/terminal-actions', label: 'Read action guide' },
    sections: terminalSections,
    embeddedUi: [
      {
        id: 'command-deck',
        eyebrow: 'Actual card grammar',
        title: 'Command deck signals',
        summary:
          'Route control cards pair plain labels with explainers because every control changes how proof readback interprets work.',
        explainer: TERMINAL_WORKSPACE_EXPLAINERS.controls,
        signals: [
          { label: 'Scenario', value: 'Read frame', tone: 'emerald' },
          { label: 'Projection', value: 'Read posture', tone: 'cyan' },
          { label: 'Branch mode', value: 'AssetPack execution', tone: 'amber' },
        ],
        steps: [
          { label: 'Set', body: 'Choose the operating frame before closure.' },
          { label: 'Write', body: 'Run a bounded action only when readiness is clear.' },
          { label: 'Read', body: 'Verify the expected proof readback.' },
        ],
      },
    ],
  }),
  docsPage({
    slug: 'terminal-actions',
    chapterId: 'experiences',
    eyebrow: 'Write guide',
    title: 'Actions: what writes and what should read back',
    summary:
      'Every bounded write should have an expected read result. This guide lists the operator actions and the state they should make visible.',
    detail:
      'Use this as the practical manual for product operation. It follows the same model as the exhaustive tooltips: write deliberately, then verify the resulting read surface before moving deeper.',
    learningOutcome:
      'You can identify the write, the expected read, and the proof signal for each major action.',
    primaryCta: { href: '/reads', label: 'Use Read' },
    sections: terminalActionSections,
    embeddedUi: [
      {
        id: 'write-read-loop',
        eyebrow: 'Write/read loop',
        title: 'Action cards are bounded state changes',
        summary:
          'The action guide mirrors route controls: each write has a location, an expected read, and a proof signal.',
        explainer: TERMINAL_INLINE_EXPLAINERS.closureAction,
        signals: [
          { label: 'Write', value: 'Operator action', tone: 'emerald' },
          { label: 'Read', value: 'Proof readback', tone: 'cyan' },
          { label: 'Proof', value: 'Closure signal', tone: 'amber' },
        ],
      },
    ],
  }),
  docsPage({
    slug: 'read-results',
    chapterId: 'experiences',
    eyebrow: 'Read guide',
    title: 'Reads, proofs, readiness, and expected results',
    summary:
      'Know what each read surface is supposed to prove before you trust a Bitcode activity, AssetPack, settlement, or ledger state.',
    detail:
      'This page is for experienced users auditing the result of Bitcode work. It separates quick operating signals from exact proof and closure follow-through.',
    learningOutcome:
      'You can tell which read surface answers orientation, readiness, proof, settlement, and history questions.',
    primaryCta: { href: '/docs/terminal-actions', label: 'Compare write actions' },
    sections: readResultSections,
    embeddedUi: [
      {
        id: 'readiness-card',
        eyebrow: 'Readiness specimen',
        title: 'Boundary and signed-transaction readiness',
        summary:
          'Readiness cards teach whether a flow is live, modeled, blocked, review-only, or ready for signed follow-through.',
        explainer: TERMINAL_WORKSPACE_EXPLAINERS.boundaryRuntime,
        signals: [
          { label: 'Repository', value: 'Scoped', tone: 'emerald' },
          { label: 'Wallet', value: 'Staged', tone: 'amber' },
          { label: 'External runtime', value: 'Launch-mode mocked', tone: 'cyan' },
        ],
      },
    ],
  }),
  docsPage({
    slug: 'auxillaries',
    chapterId: 'modes',
    eyebrow: 'Auxillaries',
    title: 'Configure Auxillaries for wallet, externals, profile, and interfaces',
    summary:
      'Auxillaries explain the commercially important configuration layer around Terminal: Wallet, Externals, Profile, and Interfaces.',
    detail:
      'Use this page to understand what each auxillary pane changes and why Terminal may stay fail-closed until wallet, repository, or profile posture is complete.',
    learningOutcome:
      'You can identify each auxillary pane and understand which Terminal capability it unlocks.',
    primaryCta: { href: '/docs/configuration', label: 'Read configuration guide' },
    sections: auxillariesSections,
    embeddedUi: [
      {
        id: 'auxillary-ring',
        eyebrow: 'Auxillary shell',
        title: 'Wallet, Externals, Profile, Interfaces',
        summary:
          'The auxillary rail is configuration with product consequences: each pane changes readiness or defaults for Terminal.',
        explainer: BITCODE_PUBLIC_EXPLAINERS.openOrbitals,
        signals: [
          { label: 'Wallet', value: 'Bitcoin identity + BTD posture', tone: 'amber' },
          { label: 'Externals', value: 'Repository + providers', tone: 'emerald' },
          { label: 'Profile', value: 'Email + roles', tone: 'cyan' },
        ],
      },
    ],
  }),
  docsPage({
    slug: 'conversations',
    chapterId: 'modes',
    eyebrow: 'Conversations',
    title: 'Use Conversations as a rich Bitcode write surface',
    summary:
      'Conversations provide ChatGPT-like drafting and coordination while preserving route-backed source attachments, output destinations, AssetPack references, and Read-measurement intent.',
    detail:
      'This page explains how natural-language work stays compatible with AssetPack proof instead of becoming untracked chat residue.',
    learningOutcome:
      'You can explain how conversation writes become /packs-readable evidence and why attachments must be structured.',
    primaryCta: { href: '/docs/chatgpt-app', label: 'Compare ChatGPT App interface' },
    sections: conversationsSections,
    embeddedUi: [
      {
        id: 'conversation-evidence',
        eyebrow: 'Rich input',
        title: 'Conversation input should become proof readback evidence',
        summary:
          'Chat can be expressive, but Bitcode reads normalized context so Terminal can reread the outcome.',
        explainer: TERMINAL_INLINE_EXPLAINERS.writePosture,
        signals: [
          { label: 'Source', value: 'Attachment tokens', tone: 'emerald' },
          { label: 'Read', value: 'Measurement intent', tone: 'cyan' },
          { label: 'Output', value: 'Destination refs', tone: 'amber' },
        ],
      },
    ],
  }),
  docsPage({
    slug: 'configuration',
    chapterId: 'modes',
    eyebrow: 'Configuration',
    title: 'Read launch-mode, environment, and feature configuration clearly',
    summary:
      'Configuration docs explain feature flags, environment modes, disabled controls, optional preferences, and fail-closed readiness so launch-mode routes remain honest.',
    detail:
      'Use this page when a control is visible but disabled, when an interface is mocked or boundary-only, or when a setting has a settlement or delivery consequence.',
    learningOutcome:
      'You can tell the difference between disabled launch controls, mocked route state, review-only posture, and live-ready configuration.',
    primaryCta: { href: '/docs/read-results', label: 'Review readiness reads' },
    sections: configurationSections,
  }),
  docsPage({
    slug: 'protocol',
    chapterId: 'protocol',
    eyebrow: 'Protocol',
    title: 'Map the active Protocol canon',
    summary:
      'A guided version of the active Protocol canon: AssetPack commodity flow, BTD scalar volume and rights, BTC settlement, claim authority, validation, and promotion posture.',
    detail:
      'Use this page to connect product docs to the canonical specification without reading every formal section first. V45 is active canon while V46 is draft target; Public docs are not protocol law.',
    learningOutcome:
      'You can navigate from public docs into active Protocol canon and understand which areas remain open by design under the V46 claim boundary.',
    primaryCta: { href: '/docs/proofs', label: 'Read proof system' },
    sections: protocolSections,
    embeddedUi: [
      {
        id: 'canon-map',
        eyebrow: 'Protocol map',
        title: 'The active Protocol teaches product, proof, packages, and promotion together',
        summary:
          'The Protocol is not a whitepaper beside the app. It is the operating contract product routes and interfaces must satisfy.',
        explainer: BITCODE_PUBLIC_EXPLAINERS.protocolSpec,
        signals: [
          { label: 'Gates', value: '1-8', tone: 'emerald' },
          { label: 'Domain model', value: 'AssetPack to proof', tone: 'cyan' },
          { label: 'Generated evidence', value: 'Fail-closed', tone: 'amber' },
        ],
      },
    ],
  }),
  docsPage({
    slug: 'proofs',
    chapterId: 'protocol',
    eyebrow: 'Proofs',
    title: 'Understand Bitcode proofs, witnesses, and replay',
    summary:
      'Proof docs explain the families, witness artifacts, replay steps, projection rules, generated appendices, and fail-closed posture behind AssetPacks.',
    detail:
      'Use this page when you read to understand why product readback is proof-bearing and how canon prevents stale or missing evidence from becoming product truth.',
    learningOutcome:
      'You can name the proof families and explain why witness artifacts, replay, and projection boundaries matter.',
    primaryCta: { href: '/docs/settlement-btd', label: 'Read settlement guide' },
    sections: proofSections,
    embeddedUi: [
      {
        id: 'proof-family-card',
        eyebrow: 'Proof runtime',
        title: 'Proof families become readable product signals',
        summary:
          'Terminal can keep dense proof detail available without forcing every user to start in raw artifacts.',
        explainer: TERMINAL_WORKSPACE_EXPLAINERS.sourcePath,
        signals: [
          { label: 'Witness', value: 'Artifact-bound', tone: 'emerald' },
          { label: 'Replay', value: 'Step-bound', tone: 'cyan' },
          { label: 'Projection', value: 'Disclosure-bound', tone: 'amber' },
        ],
      },
    ],
  }),
  docsPage({
    slug: 'settlement-btd',
    chapterId: 'protocol',
    eyebrow: '$BTD',
    title: 'Read settlement, $BTD, and exact accounting',
    summary:
      'Settlement docs connect AssetPacks to BTD scalar volume and rights, BTC settlement money, fit-quality receipts, journal completeness, wallet readiness, finality, and delivery posture.',
    detail:
      'Use this page when you read to understand how accepted AssetPack evidence becomes attributable settlement rather than just a successful analysis run.',
    learningOutcome:
      'You can explain how Bitcode moves from measured source and fit into exact accounting, BTC finality, BTD rights transfer, and staged or live payment posture.',
    primaryCta: { href: '/docs/commercial-interfaces', label: 'Read interface guide' },
    sections: settlementSections,
  }),
  docsPage({
    slug: 'commercial-interfaces',
    chapterId: 'interfaces',
    eyebrow: 'Interfaces',
    title: 'Understand commercial Bitcode interfaces',
    summary:
      'Commercial interface docs cover GitHub, webhooks, storage, compute, connected delivery mechanisms, and why every admitted interface must read/write source-safe route state under Protocol rules.',
    detail:
      'Use this page before MCP or ChatGPT App if you want the general interface contract first.',
    learningOutcome:
      'You can tell which surfaces are ingress, delivery, storage, compute, or proof support and why none of them own Bitcode state independently.',
    primaryCta: { href: '/docs/mcp-api', label: 'Read MCP guide' },
    sections: commercialInterfaceSections,
    embeddedUi: [
      {
        id: 'interface-readiness',
        eyebrow: 'Boundary specimen',
        title: 'Connected interfaces read admission and proof readback',
        summary:
          'Interface cards should tell users what is connected, what is staged, and where to verify effects in /packs.',
        explainer: TERMINAL_WORKSPACE_EXPLAINERS.boundaryRuntime,
        signals: [
          { label: 'GitHub', value: 'Ingress + delivery', tone: 'emerald' },
          { label: 'Webhook', value: 'Automation trigger', tone: 'cyan' },
          { label: 'Storage', value: 'Proof publication', tone: 'amber' },
        ],
      },
    ],
  }),
  docsPage({
    slug: 'mcp-api',
    chapterId: 'interfaces',
    eyebrow: 'MCP/API',
    title: 'Operate Bitcode through MCP and API surfaces',
    summary:
      'MCP/API docs explain how programmable clients should attach context, write bounded intent, receive admission evidence, and reread proof-backed results.',
    detail:
      'Use this page when building external tools, agentic clients, or automation around the same AssetPack state that product routes read.',
    learningOutcome:
      'You can design an MCP or API interaction that mirrors route write/read/proof discipline.',
    primaryCta: { href: '/docs/chatgpt-app', label: 'Read ChatGPT App guide' },
    sections: mcpSections,
    apiReference: mcpApiReference,
    embeddedUi: [
      {
        id: 'mcp-result',
        eyebrow: 'API result',
        title: 'A good tool result points back to proof readback',
        summary:
          'Programmable writes should never strand users in a tool transcript; the activity should be rereadable in /packs.',
        explainer: TERMINAL_INLINE_EXPLAINERS.repositoryAnchor,
        signals: [
          { label: 'Write admission', value: 'Confirmed', tone: 'emerald' },
          { label: 'Activity ID', value: 'Rereadable', tone: 'cyan' },
          { label: 'Proof posture', value: 'Pending/closed', tone: 'amber' },
        ],
      },
    ],
  }),
  docsPage({
    slug: 'chatgpt-app',
    chapterId: 'interfaces',
    eyebrow: 'ChatGPT App',
    title: 'Use the ChatGPT App as a connected Bitcode interface',
    summary:
      'ChatGPT App docs explain conversational Bitcode operation: expressing Reads, attaching source, confirming writes, returning proof readback links, and preserving proof boundaries.',
    detail:
      'Use this page when the user experience is conversational but the outcome still has to be /packs-readable and Protocol-bound.',
    learningOutcome:
      'You can explain how a ChatGPT App can feel natural while still preserving Bitcode write admission and proof reread.',
    primaryCta: { href: '/docs/what-is-bitcode', label: 'Restart from overview' },
    sections: chatGptAppSections,
    apiReference: chatGptAppApiReference,
    embeddedUi: [
      {
        id: 'chat-confirmation',
        eyebrow: 'Confirmation',
        title: 'Conversational writes still read proof-aware confirmation',
        summary:
          'The app can help a user draft, but state changes should clearly say what will be written and where to verify it.',
        explainer: TERMINAL_INLINE_EXPLAINERS.writePosture,
        signals: [
          { label: 'Draft', value: 'Natural language', tone: 'default' },
          { label: 'Confirm', value: 'Bounded write', tone: 'amber' },
          { label: 'Verify', value: '/packs reread', tone: 'emerald' },
        ],
      },
    ],
  }),
] as const satisfies readonly BitcodeDocsPage[];

function docsPagesFor(slugs: readonly string[]) {
  return slugs.map((slug) => {
    const page = BITCODE_DOCS_PAGES.find((candidate) => candidate.slug === slug);
    if (!page) {
      throw new Error(`Missing Bitcode docs page for slug: ${slug}`);
    }
    return page;
  });
}

export const BITCODE_DOCS_CHAPTERS = [
  {
    id: 'start',
    number: '00',
    title: 'Start Here',
    summary: 'A zero-to-hero introduction to AssetPacks, BTD scalar volume and rights, BTC settlement, /deposits, /reads, /packs, and the product map.',
    pages: docsPagesFor(['what-is-bitcode', 'source-shares']),
  },
  {
    id: 'experiences',
    number: '01',
    title: 'Product Routes',
    summary: 'The product experiences: /packs master-detail, bounded write actions, and proof-bearing reads.',
    pages: docsPagesFor(['exchange', 'terminal', 'terminal-actions', 'read-results']),
  },
  {
    id: 'modes',
    number: '02',
    title: 'Operator Modes',
    summary: 'Auxillaries, conversations, configuration, feature flags, launch mode, and readiness posture.',
    pages: docsPagesFor(['auxillaries', 'conversations', 'configuration']),
  },
  {
    id: 'protocol',
    number: '03',
    title: 'Protocol And Proof',
    summary: 'Canon, proof families, generated evidence, settlement, BTD, disclosure, and fail-closed rules.',
    pages: docsPagesFor(['protocol', 'proofs', 'settlement-btd']),
  },
  {
    id: 'interfaces',
    number: '04',
    title: 'Commercial Interfaces',
    summary: 'GitHub, webhooks, MCP/API, ChatGPT App, compute, storage, and connected-interface admission.',
    pages: docsPagesFor(['commercial-interfaces', 'mcp-api', 'chatgpt-app']),
  },
] as const satisfies readonly BitcodeDocsChapter[];

export const BITCODE_DOCS_PAGE_SLUGS = BITCODE_DOCS_PAGES.map((page) => page.slug);

export function getBitcodeDocsPage(slug: string | undefined): BitcodeDocsPage | null {
  return BITCODE_DOCS_PAGES.find((page) => page.slug === slug) ?? null;
}
