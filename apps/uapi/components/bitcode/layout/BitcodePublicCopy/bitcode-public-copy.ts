import {
  GLOBAL_CONSTANT_BITCODE_REPOSITORY_URL,
  GLOBAL_CONSTANT_BITCODE_WHITEPAPER_URL,
} from '@bitcode/global-constants';

export const BITCODE_PUBLIC_COPY = {
  eyebrow: 'Knowledge Exchange Made Possible',
  headline: "Trade technical data on the Bitcode exchange.",
  /**
   * Marketing + product chrome: DataPack commodity language.
   * Domain packages / wire types may still use DataPack identifiers.
   */
  description:
    'The stock market for data is here. Mint, find, and trade DataPacks in just a few clicks. Ironclad IP protection. A global, liquid market. Verifiable, on-chain settlement.',
  descriptionHighlights: [
    { text: 'The stock market for data is here.', tone: 'bold' as const },
    { text: 'DataPacks', tone: 'green' as const },
    { text: 'Ironclad IP protection', tone: 'purple' as const },
    { text: 'global', tone: 'orange' as const },
    { text: 'liquid', tone: 'orange' as const },
    { text: 'settlement', tone: 'orange' as const },
  ],
  capabilityChips: [
    'Synthesize DataPacks',
    'Review Options',
    'Buy Bitcodes',
  ],
  primaryCta: {
    href: '/reads',
    label: 'Buy DataPacks',
  },
  secondaryCta: {
    href: '/deposits',
    label: 'Sell Source',
  },
  tertiaryCta: {
    href: '/exchange',
    label: 'View Exchange',
  },
  guide: {
    posts: [
      {
        id: 'may-july-2026',
        tab: 'May–July',
        title: 'Developing an MVP',
        meta: 'May–July 2026',
        body:
          'Early summer developed the Commercial MVP—most notably, Measurements. Key user-flows are materializing from Wallets to Settlements. Late summer will launch Bitcode V1. The launch will support the central experiences of trading DataPacks, along with the very first mints of $BTD.',
        highlights: [
          'Commercial MVP',
          'Measurements',
          'Wallets',
          'Settlements',
          'Bitcode V1',
          'DataPacks',
          '$BTD',
        ],
      },
      {
        id: 'april-2026',
        tab: 'April',
        // Restored pre-Gate-15 original micro-blog content from commit history.
        title: 'An Open-Source Exchange',
        meta: 'April 2026',
        body:
          'April launched the Bitcode Protocol. It is available at our open-source repository which includes a commercially-ready whole-system specification (auditable, reproducible). The website now includes the first pieces of the $BTD product along with documentation on the internals and interfaces of the ecosystem.',
        highlights: ['$BTD', 'Bitcode Protocol', 'Exchange'],
      },
      {
        id: 'march-2026',
        tab: 'March',
        // Restored original March micro-blog; only change: hoard → collect.
        title: 'A Source-to-Shares Protocol',
        meta: 'March 2026',
        body:
          "$BTD's purpose is to collect valuable technical information and compensate contributors fairly. Provable knowledge measuring algorithms build the foundations for collection and issuance. Ideal long-term partnerships for asset management and infrastructure will be finalized to empower the secure and thriving future of $BTD.",
        highlights: ['$BTD'],
      },
    ],
  },
  productPreview: {
    pill: 'Market',
    kicker: 'DataPack commerce',
    // Single rail label (depot window chrome).
    rail: 'For Agents, Humans, Aliens...',
  },
  // Marketing presents the commercial product as production — no testnet language.
  // Claim anchors in meaning: * ERC-1155 · ** Measured · *** DataPacks (footnotes).
  testnetLaunch: {
    badge: 'Productionized Protocol',
    // Marketing exchange strip: Code ⇄ Coin (for → exchange glyph in the title).
    title: 'Code for Coin.',
    meaning:
      "Bitcode's canonical, commercial deployments are its mainnet ERC-1155* tokens, tradable Measured** DataPacks*** artifacts, and delightful user applications.",
    flow: [
      {
        id: 'whitepaper',
        label: 'Bitcode Whitepaper',
        // Whole-row link: public Whitepaper (canonical orientation).
        href: GLOBAL_CONSTANT_BITCODE_WHITEPAPER_URL,
        external: true,
        // Compact emerald chrome (no body).
        status: 'open_source' as const,
        badge: 'Canonical Specification',
        detail: '',
      },
      {
        id: 'website',
        label: 'Website Application',
        // Descriptive only — not a whole-row nav link (home is already the page).
        href: null,
        status: 'live' as const,
        detail:
          'Connect your wallets, data-sources, etc.; a GUI for viewing, synthesizing, and trading DataPacks, managing account authorities, and more.',
      },
      {
        id: 'mcp',
        label: 'MCP API',
        // Whole-row link to MCP/API docs reference.
        href: '/docs/mcp-api',
        status: 'live' as const,
        detail:
          "Bitcode's API is consumable virtually everywhere, whether it be via scripting or within your own applications. Most core experiences are supported.",
      },
      {
        id: 'repository',
        label: 'Contributable Repository',
        // Whole-row link to the open-source monorepo.
        href: GLOBAL_CONSTANT_BITCODE_REPOSITORY_URL,
        external: true,
        // Compact emerald chrome (no body); badge is Open-Source, not Live.
        status: 'open_source' as const,
        badge: 'Open-Source',
        detail: '',
      },
      {
        id: 'extensions',
        label: 'Conversational Extensions',
        href: null,
        status: 'coming_soon' as const,
        detail:
          "Extensions for Claude, ChatGPT, Grok, and any application that communicates over MCP. Effortlessly use Bitcode within the chat experiences you're already used to.",
      },
    ],
    sourceSafety: [
      '* Bitcode (BTD) tokens are an immutable, scarce, deflationary, data-backed digital asset.',
      '** Measurements are visible; IP is not. Bitcode is source-safe knowledge trading.',
      "*** A DataPack's BTD volume is a protocol determination. The price of BTD is a market one.",
    ],
  },
  operatorFrame: {
    title: 'Marketplace',
    // Rendered as flex segments + middle-dot bullets (not claim-anchor *).
    subtitleParts: ['Sell Supplies', 'Buys Reads', 'Settle Proofs'] as const,
    badge: 'Exchange',
    modes: ['Exchange', 'Deposit', 'Read', 'Proofs'],
  },
  giveContribution: {
    title: 'Selling Knowledge',
  },
  sourceToSettlement: {
    title: 'Source to Delivery',
    subtitle: 'Seller → Deposits → Buyer → Fits → Settle',
    badge: 'Steps',
    stages: ['Deposit', 'Measure', 'Approve', 'Read', 'Fit', 'Settle'] as const,
  },
  // Bottom-right depot card — fills residual height beside Verified access.
  settlementLedger: {
    title: 'Crypto · BTD · DataPacks',
    subtitle: 'buy · mint · earn',
    rows: [
      {
        label: 'Crypto',
        detail:
          'Buy and settle DataPack reads with ETH, BTC, SOL, and more pay rails.',
      },
      {
        label: 'BTD fungible',
        detail: "Mint volume from needinesses' normalized weighted sum.",
      },
      {
        label: 'DataPack NFTs',
        detail: 'Buy read-rights with Crypto; earn Crypto when packs sell.',
      },
      {
        label: 'On-chain',
        detail: 'Open-source, proven, ledgerized multi-rail settlement.',
      },
    ],
  },
  footer: {
    steps: ['Deposit', 'Read', 'Settle'],
    guestCta: 'Open Auxillaries',
    userCta: 'Open Auxillaries',
    links: {
      network: 'Exchange',
      deposit: 'Deposits',
      read: 'Reads',
      transactions: 'Exchange',
      docs: 'Docs',
      github: 'Source',
    },
    /** Uppercase card subtitles under product nav titles. */
    linkMeta: {
      network: 'Trade the exchange',
      deposit: 'List your data',
      read: 'Buy data that fits',
      docs: 'Learn to operate',
      github: 'Protocol, products',
    },
  },
  publicNav: {
    // Product order: Read → Exchange → Deposit. Docs lives under the logo-area.
    // Experience name is Exchange (retired: Packs). Marketing: DataPack; system: DataPack.
    links: [
      { href: '/reads', label: 'Read' },
      { href: '/exchange', label: 'Exchange' },
      { href: '/deposits', label: 'Deposit' },
    ],
    // Guests only see Connect Wallet; Open Auxillaries is signed-in chrome.
    guestPrimaryCta: 'Connect Wallet',
    guestSecondaryCta: 'Connect Wallet',
  },
  guideRoute: {
    eyebrow: 'Bitcode docs',
    heading: 'Learn Bitcode from DataPacks to proof.',
    body:
      'Docs teach the system in operator order: DataPacks, BTD volume and rights, Crypto settlement, proof readback, /deposits, /reads, /exchange, Auxillaries, MCP/API, ChatGPT App, and connected interfaces.',
    checkingVideoTitle: 'Recorded walkthrough',
    checkingVideoBody:
      'Checking the recorded Bitcode walkthrough for inline playback inside the docs.',
    cardTitle: 'Recorded operator walkthrough',
    cardBody:
      'Use the walkthrough when you want the commercial flow narrated before you open Deposit, Read, or Exchange.',
    missingVideoTitle: 'Walkthrough',
    missingVideoBody:
      'The recorded walkthrough is being refreshed. Use the docs chapters and the Exchange activity ledger while the next capture is published.',
    missingVideoCta: 'Open Exchange',
  },
} as const;
