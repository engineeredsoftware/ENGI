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
    title: 'A Liquid Market',
    subtitle: 'Own · Trade · Compound',
    badge: 'Exchange',
    rows: [
      {
        label: 'Real ownership',
        detail:
          'Buyers get DataPacks as on-chain co-ownership — an asset you hold, not a scrape you rent. Sellers keep their stake and keep earning.',
      },
      {
        label: 'Traded day one',
        detail:
          'DataPacks and $BTD both trade globally. Code IP becomes a liquid asset class.',
      },
      {
        label: 'The flywheel',
        detail:
          'More deposits deepen the pool; sharper fits pull more buyers; every settlement mints $BTD and pays.',
      },
      {
        label: 'Measurement is the moat',
        detail:
          "No one else prices code by measured need-fit. That's what makes this a market, not a listing.",
      },
    ],
  },
  giveContribution: {
    title: 'Exchanging Knowledge',
  },
  sourceToSettlement: {
    title: '$BTD · Tokenomics',
    subtitle: 'Knowledge-backed currency',
    badge: 'Token',
    rows: [
      {
        label: 'Measured, not priced',
        detail:
          "Sellers never set a price. Bitcode measures the data's quality and quantity into one scalar: $BTD.",
      },
      {
        label: 'Need-relative',
        detail:
          "A pack's $BTD is how well it fits a buyer's stated Need — the knowledge volume of that data under that demand.",
      },
      {
        label: 'Minted after payment',
        detail:
          'Buyers settle in ETH, BTC, or SOL; the measured $BTD is minted only afterward. Every token is backed by capital already spent.',
      },
      {
        label: 'Seller-chosen split',
        detail:
          'Sellers take payout as any mix of payment currency + minted $BTD.',
      },
      {
        label: 'Hard-capped, like Bitcoin',
        detail: 'Finite supply, minted on a decaying curve as issuance nears the cap.',
      },
    ],
  },
  // Bottom-right depot card — fills residual height beside Verified access.
  settlementLedger: {
    title: 'Three things you hold on-chain',
    subtitle: 'money · volume · commodity',
    rows: [
      {
        label: 'Crypto — the money',
        detail:
          'Pay and settle in ETH, BTC, or SOL. The rails buyers already use.',
      },
      {
        label: '$BTD — the volume',
        detail:
          'A scarce, knowledge-backed token, minted to you on purchase — your receipt of how much you bought.',
      },
      {
        label: 'DataPacks — the commodity',
        detail:
          'Measured code IP as co-ownership NFTs. Own them, resell them, keep them.',
      },
      {
        label: 'On-chain, open-source',
        detail:
          "Every $BTD is backed by capital already spent and the measured data it represents.*",
      },
    ],
    footnote:
      '* Minted only after settlement — which is what binds $BTD\'s supply to data that has actually been paid for.',
  },
  whyNow: {
    body:
      "Buying the data that trains AI is broken — nine-month deals, lawsuits, or buying the whole company. It's a ~$100B market growing ~25% a year, with no real exchange. Until now.",
  },
  /** Scroll cue under the opening band until the audience panes enter view. */
  scrollCue: {
    label: 'Buyers, Sellers, Traders',
    ariaLabel: 'Scroll to buyers, sellers, and traders',
  },
  /**
   * Lower-left production-band filler (under micro-blog): how a trade closes.
   * Fills residual height so the left column meets Safe / Three things.
   */
  valueFlow: {
    eyebrow: 'How a trade closes',
    title: 'Need → fit → settle → mint',
    steps: [
      { label: 'State a Need', detail: 'Buyer names what the data must do' },
      { label: 'Score the fit', detail: 'Packs ranked by measured need-fit' },
      { label: 'Pay the rails', detail: 'ETH · BTC · SOL — fail-closed' },
      { label: 'Mint & hold', detail: '$BTD volume + DataPack co-ownership' },
    ],
    rails: ['ETH', 'BTC', 'SOL'],
  },
  audienceBuyers: {
    eyebrow: 'FOR BUYERS · building AI, acquiring data',
    headline: 'Stop buying data by hand.',
    pain:
      'License it and wait nine months for a deal that often collapses. Scrape it and inherit a lawsuit — one AI lab paid billions. Or buy the whole company for tens of billions. And the open web runs dry by the end of the decade.',
    bullets: [
      'See the fit before you pay — every pack scored against your exact Need.',
      'Rights-clean, audit-ready — no scraping risk; legal signs off.',
      'Own what you buy — settle in ETH, BTC, or SOL. Minutes, not months.',
    ],
    inPractice:
      'A lab needs rare, high-assurance firmware patterns. It states the Need, Bitcode assembles the best-fitting DataPacks with measured scores, and one click buys them — clean, fast, no sourcing team.',
    cta: {
      href: '/reads',
      label: 'Buy DataPacks',
    },
  },
  audienceSellers: {
    eyebrow: 'FOR SELLERS · STEM builders, IP-holders, data owners',
    headline: 'If you have code, you have inventory.',
    pain:
      'Your best work sits idle — too small for a licensing deal, too niche for a marketplace, or trapped in a project that died. Dead code sells for ~5% of its value, if it ever sells at all.',
    bullets: [
      'Deposit it, hide the secrets — it becomes a measured, tradeable DataPack.',
      'Earn on every Need it fits — no negotiation, no minimum, no NDA.',
      'Keep ownership — sell knowledge without selling the company.',
    ],
    inPractice:
      'A shut-down robotics startup deposits its whole codebase. Instead of ~11 months in bankruptcy court for pennies, the DataPacks are measured, listed, and price-discovered in clicks — value recovered.',
    cta: {
      href: '/deposits',
      label: 'Sell your source',
    },
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
