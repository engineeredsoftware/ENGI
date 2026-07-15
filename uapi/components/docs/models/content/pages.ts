/**
 * Canonical Bitcode docs page catalog (slug → article content).
 */
import { TERMINAL_INLINE_EXPLAINERS, TERMINAL_WORKSPACE_EXPLAINERS } from '@/components/bitcode/pipeline/models/workspace-explainers';
import { docsPage } from '../bitcode-docs-helpers';
import type { BitcodeDocsPage } from '../bitcode-docs-types';
import { whatIsBitcodeSections } from './sections-what-is-bitcode';
import { sourceSharesSections } from './sections-source-shares';
import { exchangeSections } from './sections-exchange';
import { terminalSections } from './sections-terminal';
import { terminalActionSections } from './sections-terminal-actions';
import { readResultSections } from './sections-read-results';
import { auxillariesSections } from './sections-auxillaries';
import { conversationsSections } from './sections-conversations';
import { protocolSections } from './sections-protocol';
import { proofSections } from './sections-proofs';
import { settlementSections } from './sections-settlement';
import { commercialInterfaceSections } from './sections-commercial-interfaces';
import { mcpSections } from './sections-mcp';
import { chatGptAppSections } from './sections-chatgpt-app';
import { chatGptAppApiReference } from './api-reference-chatgpt-app';
import { mcpApiReference } from './api-reference-mcp';
import { configurationSections } from './sections-configuration';
import { BITCODE_PUBLIC_EXPLAINERS } from '@/components/bitcode/layout/BitcodePublicExplainers/bitcode-public-explainers';

export const BITCODE_DOCS_PAGES = [
  docsPage({
    slug: 'what-is-bitcode',
    chapterId: 'start',
    eyebrow: 'Start here',
    title: 'What Bitcode is',
    summary:
      'Begin with the map: what AssetPacks are, how BTD volume and rights work, why Bitcoin settles value, and where Packs, Deposit, Read, Protocol, and interfaces fit.',
    detail:
      'This is the first page for readers who know nothing about Bitcode. It keeps the model plain before /deposits, /reads, /packs, proof, and interface pages.',
    learningOutcome:
      'You can explain Bitcode as a market for measured technical knowledge and name the major product surfaces without reading implementation history.',
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
        eyebrow: 'Product specimen',
        title: 'AssetPack status card',
        summary:
          'This mirrors the compact status cards used on product routes: supply, Read, fit, and proof as related signals.',
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
    eyebrow: 'Operator map',
    title: 'Orient on Packs, Deposit, and Read',
    summary:
      'Understand the commercial product as three focused routes: Deposit for supply, Read for demand and delivery, Packs for durable activity and proof readback.',
    detail:
      'Use this page when you need to know where to write, where to buy, where to audit, and when to open Auxillaries or Conversations as supporting modes.',
    learningOutcome:
      'You can identify deposit write posture, read demand posture, packs activity reread, and when to open Auxillaries.',
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
      'Auxillaries explain the configuration layer beside product routes: Wallet, Externals, Profile, and Interfaces.',
    detail:
      'Use this page to understand what each auxillary pane changes and why Deposit, Read, or settlement may stay fail-closed until wallet, repository, or profile posture is complete.',
    learningOutcome:
      'You can identify each auxillary pane and which product capability it unlocks or blocks.',
    primaryCta: { href: '/docs/configuration', label: 'Read configuration guide' },
    sections: auxillariesSections,
    embeddedUi: [
      {
        id: 'auxillary-ring',
        eyebrow: 'Auxillary shell',
        title: 'Wallet, Externals, Profile, Interfaces',
        summary:
          'The auxillary rail is configuration with product consequences: each pane changes readiness or defaults for Packs, Deposit, and Read.',
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
          'Chat can be expressive, but Bitcode normalizes context so /packs can reread the outcome.',
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
      'A guided map of protocol truth: AssetPack flow, BTD volume and rights, BTC settlement, claim authority, validation, and promotion posture.',
    detail:
      'Use this page to connect product docs to the specification without reading every formal section first. V48 is the commercial draft-target family; public docs teach and do not legislate.',
    learningOutcome:
      'You can navigate from public docs into protocol canon and know which claims stay blocked until proof and promotion allow them.',
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
          'Product routes keep dense proof detail available without forcing every reader to start in raw artifacts.',
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
      'Settlement docs connect AssetPacks to BTD volume and rights, Bitcoin settlement money, needs-fits receipts, journals, wallet readiness, finality, and delivery posture.',
    detail:
      'Use this page to understand how accepted AssetPack evidence becomes attributable settlement rather than only a successful analysis run.',
    learningOutcome:
      'You can explain how Bitcode moves from measured source and fits into exact accounting, BTC finality, BTD rights transfer, and staged or live payment posture.',
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
