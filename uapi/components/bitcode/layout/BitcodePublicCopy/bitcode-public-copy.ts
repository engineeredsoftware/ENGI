export const BITCODE_PUBLIC_COPY = {
  eyebrow: 'Buy and sell measured AssetPacks',
  headline: "AIs trade technical knowledge with Bitcode's on-chain marketplace.",
  description:
    'Make AssetPacks from source-code, exposing only IP you confirm, to deposit them for purchase. Buy them with Bitcoin to consume the specific knowledge you request. All running on fully open-source, proven, and ledgerized infrastructure.',
  descriptionHighlights: [
    { text: 'AssetPacks', tone: 'purple' },
    { text: 'Bitcoin', tone: 'orange' },
  ],
  capabilityChips: [
    'Synthesize Options',
    'Deposit AssetPacks',
    'Buy AssetPacks',
  ],
  primaryCta: {
    href: '/reads',
    label: 'Buy AssetPacks',
  },
  secondaryCta: {
    href: '/deposits',
    label: 'Sell AssetPacks',
  },
  tertiaryCta: {
    href: '/packs',
    label: 'View AssetPacks',
  },
  guide: {
    posts: [
      {
        id: 'may-july-2026',
        tab: 'May–July',
        title: 'Commercial MVP Development, Protocol Precision',
        meta: 'May–July 2026 * Garrett Maring',
        body:
          'Early summer developed the Commercial MVP—most notably, AssetPack Measurements. Key user-flows are materializing from account creation to Bitcode Settlements. Late summer will launch Bitcode V1.',
        highlights: [
          'Commercial MVP',
          'AssetPack Measurements',
          'Bitcode Settlements',
          'Bitcode V1',
        ],
      },
      {
        id: 'april-2026',
        tab: 'April',
        title: '$BTD: Scalar Volume And Rights For Technical Knowledge',
        meta: 'April 2026 * Garrett Maring',
        body:
          "April launched the Bitcode Protocol. Open-source, auditable, and reproducible — with Packs, Deposit, and Read as the live surfaces for AssetPack commerce.",
        highlights: ['$BTD', 'Bitcode Protocol', 'AssetPacks'],
      },
      {
        id: 'march-2026',
        tab: 'March',
        title: "Bitcode's source-to-AssetPack protocol, now",
        meta: 'March 2026 * Garrett Maring',
        body:
          "$BTD measures technical knowledge volume and rights while BTC settlement compensates contributors. Measured deposit and Reading form the market path for source-safe AssetPack trade.",
        highlights: ['$BTD', 'BTC settlement'],
      },
    ],
  },
  terminalPreview: {
    pill: 'Market',
    kicker: 'AssetPack commerce',
    rail: ['sell', 'buy', 'settle'],
  },
  // Marketing presents the commercial product as production — no testnet language.
  testnetLaunch: {
    badge: 'Commercial Product',
    title: 'Sell and buy AssetPacks on Bitcoin.',
    meaning:
      'Measurements, quotes, settlement order, BTD rights, and delivery are live protocol state—trade AssetPacks with BTC.',
    flow: [
      {
        step: '01',
        label: 'Sell (Deposit)',
        href: '/deposits',
        detail:
          'Connect a repository, synthesize measured AssetPack options, and admit supply to the Depository.',
      },
      {
        step: '02',
        label: 'Buy (Read)',
        href: '/reads',
        detail:
          'Write a Need, review fit measurements and the quote, then SettleAssetPack in BTC.',
      },
      {
        step: '03',
        label: 'Audit (Packs)',
        href: '/packs',
        detail:
          'Inspect settlement, rights, delivery, and compensation with expandable proof roots.',
      },
    ],
    trust:
      'Trust the proof: protocol law and proof readback decide state; the product surfaces explain it.',
    sourceSafety:
      'Source-safe trade: buyers see measurements before pay; protected source stays withheld until BTC finality and BTD rights transfer.',
  },
  operatorFrame: {
    title: 'AssetPack market',
    subtitle: 'sell supply · buy against Need · settle with proof',
    badge: 'live paths',
    modes: ['Packs', 'Deposit', 'Read', 'Proofs'],
  },
  giveContribution: {
    title: 'What you sell',
  },
  sourceToSettlement: {
    title: 'From repo to paid delivery',
    subtitle: 'seller → buyer market path',
    badge: '6 stages',
    stages: [
      { number: '01', stage: 'deposit' },
      { number: '02', stage: 'read' },
      { number: '03', stage: 'fit' },
      { number: '04', stage: 'prove' },
      { number: '05', stage: 'settle' },
      { number: '06', stage: 'issue' },
    ],
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
        detail: 'Mint volume from Final Fit needinesses-fits.',
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
      'Docs teaches the complete system in user order: AssetPacks, BTD scalar volume and rights, BTC settlement money, proof readback authority, /deposits, /reads, /packs, MCP/API, ChatGPT App, Bitcode Chat, and connected interfaces.',
    checkingVideoTitle: 'Recorded walkthrough',
    checkingVideoBody:
      'Checking the recorded Bitcode walkthrough for inline playback inside the docs.',
    cardTitle: 'Recorded operator walkthrough',
    cardBody:
      'Use the walkthrough when you want the Bitcode flow narrated before you move into Deposit, Read, and Packs.',
    missingVideoTitle: 'Walkthrough',
    missingVideoBody:
      'The recorded walkthrough is being refreshed. Use the docs panels and the Packs activity route while the next capture is published.',
    missingVideoCta: 'Open Packs',
  },
} as const;
