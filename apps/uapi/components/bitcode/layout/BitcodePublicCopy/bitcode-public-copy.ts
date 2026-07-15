export const BITCODE_PUBLIC_COPY = {
  eyebrow: 'Knowledge Exchange Made Possible',
  headline: "Trade technical data on the Bitcode marketplace.",
  description:
    'Deposit AssetPacks synthesized from source code, listing only your approved IP. Read the AssetPacks you need using Bitcoin. All settlements are completely auditable with the system\'s on-chain, open-source, verifiable ledger.',
  descriptionHighlights: [
    { text: 'AssetPacks', tone: 'purple' as const },
    { text: 'Bitcode', tone: 'green' as const },
    { text: 'Bitcoin', tone: 'orange' as const },
    // Settlement claim — green underline (distinct from neon word glow).
    { text: 'completely auditable', tone: 'greenUnderline' as const },
  ],
  capabilityChips: [
    'Synthesize Packs',
    'Review Options',
    'Buy Bitcodes',
  ],
  primaryCta: {
    href: '/reads',
    label: 'Buy Packs',
  },
  secondaryCta: {
    href: '/deposits',
    label: 'Sell Source',
  },
  tertiaryCta: {
    href: '/packs',
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
          'Early summer developed the Commercial MVP—most notably, Measurements. Key user-flows are materializing from Wallets to Settlements. Late summer will launch Bitcode V1. The launch will support the central experiences of trading AssetPacks, along with the very first mints of $BTD.',
        highlights: [
          'Commercial MVP',
          'Measurements',
          'Wallets',
          'Settlements',
          'Bitcode V1',
          'AssetPacks',
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
          'April launched the Bitcode Protocol. It is available at our open-source repository which includes a commercially-ready whole-system specification (auditable, reproducible). The website now includes the first pieces of the $BTD Terminal along with documentation on the internals and interfaces of the ecosystem.',
        highlights: ['$BTD', 'Bitcode Protocol', 'Packs'],
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
    kicker: 'AssetPack commerce',
    // Single rail label (depot window chrome).
    rail: 'For Agents, Humans, Aliens...',
  },
  // Marketing presents the commercial product as production — no testnet language.
  // AssetPacks + BTD are ERC-1155 on Ethereum; purchase/settlement money is Bitcoin.
  testnetLaunch: {
    badge: 'Productionized Protocol',
    title: 'Exchange Bitcoins for Bitcodes.',
    // Claim anchors: * (emerald) → source-safety line 1; ** (orange) → BTD volume/price line 2.
    meaning:
      'Measurements*, quotes, settlements, BTD, and delivery are protocol state—AssetPacks** and BTD are ERC-1155 on Ethereum; purchase with Bitcoin.',
    flow: [
      {
        id: 'website',
        label: 'Website Application',
        href: '/',
        status: 'live' as const,
        detail:
          'Connect your wallets, data-sources, etc.; a GUI for viewing, synthesizing, and trading AssetPacks, managing account authorities, and more.',
      },
      {
        id: 'mcp',
        label: 'MCP API',
        href: '/docs',
        status: 'live' as const,
        detail:
          "Bitcode's API is consumable virtually everywhere, whether it be via scripting or within your own applications. Most core experiences are supported.",
      },
      {
        id: 'repository',
        label: 'Forkable Repository',
        href: null,
        // Live emerald badge styling; badge text is Open-Source (not Live).
        status: 'open_source' as const,
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
      '* Measurements are visible; IP is not. Bitcode is source-safe knowledge trading.',
      "** An AssetPack's BTD volume is a protocol determination. The price of BTD is a market one.",
    ],
  },
  operatorFrame: {
    title: 'Marketplace',
    subtitle: 'Sell Supplies * Buys Reads * Settle Proofs',
    badge: 'Packs',
    modes: ['Packs', 'Deposit', 'Read', 'Proofs'],
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
    title: 'BTC · BTD · AssetPacks',
    subtitle: 'buy · mint · earn',
    rows: [
      {
        label: 'Bitcoin',
        detail: 'Buy and settle AssetPack reads in BTC.',
      },
      {
        label: 'BTD fungible',
        detail: "Mint volume from needinesses' normalized weighted sum.",
      },
      {
        label: 'AssetPack NFTs',
        detail: 'Buy read-rights with BTC; earn BTC when packs sell.',
      },
      {
        label: 'On-chain',
        detail: 'Open-source, proven, ledgerized settlement rails.',
      },
    ],
  },
  footer: {
    steps: ['Deposit', 'Read', 'Settle'],
    guestCta: 'Open Auxillaries',
    userCta: 'Open Auxillaries',
    links: {
      network: 'Packs',
      deposit: 'Deposits',
      read: 'Reads',
      transactions: 'Packs',
      docs: 'Docs',
      github: 'Bitcode on GitHub',
    },
  },
  publicNav: {
    // Product order: Read → Packs → Deposit. Docs lives under the logo-area.
    links: [
      { href: '/reads', label: 'Read' },
      { href: '/packs', label: 'Packs' },
      { href: '/deposits', label: 'Deposit' },
    ],
    // Guests only see Connect Wallet; Open Auxillaries is signed-in chrome.
    guestPrimaryCta: 'Connect Wallet',
    guestSecondaryCta: 'Connect Wallet',
  },
  guideRoute: {
    eyebrow: 'Bitcode docs',
    heading: 'Learn Bitcode from AssetPacks to proof.',
    body:
      'Docs teach the system in operator order: AssetPacks, BTD volume and rights, Bitcoin settlement, proof readback, /deposits, /reads, /packs, Auxillaries, MCP/API, ChatGPT App, and connected interfaces.',
    checkingVideoTitle: 'Recorded walkthrough',
    checkingVideoBody:
      'Checking the recorded Bitcode walkthrough for inline playback inside the docs.',
    cardTitle: 'Recorded operator walkthrough',
    cardBody:
      'Use the walkthrough when you want the commercial flow narrated before you open Deposit, Read, or Packs.',
    missingVideoTitle: 'Walkthrough',
    missingVideoBody:
      'The recorded walkthrough is being refreshed. Use the docs chapters and the Packs activity ledger while the next capture is published.',
    missingVideoCta: 'Open Packs',
  },
} as const;
