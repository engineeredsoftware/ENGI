/**
 * Marketplace section colors, listing types, and synthetic listing generation.
 */
export const MARKETPLACE_COLORS = {
  bullish: {
    wick: 'rgba(103, 254, 183, 0.2)',
    body: 'rgba(103, 254, 183, 0.4)',
  },
  bearish: {
    wick: 'rgba(239, 68, 68, 0.2)',
    body: 'rgba(239, 68, 68, 0.4)',
  },
} as const;

export type Side = "buy" | "sell";
export type ListingType = "shippable" | "evidence_document";
export type Asset = "pr" | "knowledge_extension";

export interface Listing {
  id: string;
  type: ListingType;
  asset: Asset;
  side: Side;
  price: number;
  title: string;
  tech: Array<"react" | "rust" | "python" | "solidity" | "typescript" | "swift">;
  /**
   * Amount of Bitcode `$BTD` involved in this listing. This will be highlighted
   * in the detail card together with the glowing "e" logo.
   */
  measuredBtd: number;

  /** Remaining quantity for this listing */
  available: number;

  /** Quick quality/measure indicator shown in the order book */
  measure: number;

  flash?: "add" | "trade";
}

export const randomElement = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const owners = [
  "@stellar-ai",
  "@openbuild",
  "@infra-gurus",
  "@low-latency",
  "@frontend-speed",
  "@vision-labs",
  "@ops-bot",
  "@algo-kings",
  "@qa-reviewers",
];

let idCounter = 1;
export const genId = () => `L${idCounter++}`;

export function generateListing(): Listing {
  const type = randomElement(["shippable", "evidence_document"] as const);
  const asset = type === "shippable" ? "pr" : "knowledge_extension";
  const side = randomElement(["buy", "sell"] as const);
  const titles = {
    pr: [
      "Auth Refactor PR",
      "Next.js 14 Routes",
      "Payment Gateway",
      "CI Optimization",
    ],
    knowledge_extension: [
      "Rust Error Fixes",
      "OpenCV Snippets",
      "Terraform Modules",
      "SwiftUI Cheatsheet",
    ],
  };
  const techSets = {
    react: ["react", "typescript"],
    rust: ["rust"],
    python: ["python"],
    solidity: ["solidity", "typescript"],
    swift: ["swift"],
  } as const;
  const techPool = Object.keys(techSets) as Array<keyof typeof techSets>;
  const chosen = randomElement(techPool);
  return {
    id: genId(),
    type,
    asset,
    side,
    price: randomInt(80, 600),
    title: randomElement(titles[asset]),
    tech: [...techSets[chosen]],
    measuredBtd: randomInt(40, 600),
    available: randomInt(1, 20),
    measure: randomInt(60, 99),
    flash: "add",
  };
}

export const ROW_VARIANTS = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
} as const;


/** Preset order-book rows shown before synthetic listings join the tape. */
export const EXAMPLE_LISTINGS: Listing[] = [
  {
    id: "1",
    type: "shippable",
    asset: "pr",
    side: "buy",
    title: "Auth Refactor PR",
    tech: ["react", "typescript"],
    price: 420,
    measuredBtd: 420,
    available: 3,
    measure: 95,
  },
  {
    id: "2",
    type: "shippable",
    asset: "pr",
    side: "sell",
    title: "CI Optimisation PR",
    tech: ["python"],
    price: 280,
    measuredBtd: 280,
    available: 7,
    measure: 91,
  },
  {
    id: "3",
    type: "evidence_document",
    asset: "knowledge_extension",
    side: "buy",
    title: "Rust Error Patterns",
    tech: ["rust"],
    price: 140,
    measuredBtd: 140,
    available: 12,
    measure: 88,
  },
  {
    id: "4",
    type: "evidence_document",
    asset: "knowledge_extension",
    side: "sell",
    title: "OpenCV Snippets",
    tech: ["python"],
    price: 190,
    measuredBtd: 190,
    available: 5,
    measure: 92,
  },
];

export type Candle = {
  id: number;
  left: string;
  wickTop: string;
  wickHeight: string;
  bodyTop: string;
  bodyHeight: string;
  bullish: boolean;
  delay: string;
  duration: string;
};

/** Build a deterministic-shape random candlestick series for the backdrop. */
export function generateCandles(total = 70): Candle[] {
  const sticks: Candle[] = [];
  for (let i = 0; i < total; i++) {
    const bullish = Math.random() > 0.5;
    const high = Math.random() * 65 + 5;
    const low = high + Math.random() * 20 + 5;
    let open = high + Math.random() * (low - high - 4) + 2;
    let close = high + Math.random() * (low - high - 4) + 2;
    if (bullish && close < open) [open, close] = [close, open];
    if (!bullish && close > open) [open, close] = [close, open];
    const bodyTop = Math.min(open, close);
    const bodyBottom = Math.max(open, close);
    sticks.push({
      id: i,
      left: `${(i / total) * 100}%`,
      wickTop: `${high}%`,
      wickHeight: `${low - high}%`,
      bodyTop: `${bodyTop}%`,
      bodyHeight: `${bodyBottom - bodyTop}%`,
      bullish,
      delay: `${Math.random() * 4}s`,
      duration: `${4 + Math.random() * 4}s`,
    });
  }
  return sticks;
}

export const MARKETPLACE_NARRATIVE_CARDS = [
  {
    title: 'Read Gap Procurement',
    body: 'Bitcode identifies persistent and severe gaps and purchases the expertise required to unblock a Read.',
    iconKey: 'trending' as const,
  },
  {
    title: 'Beyond Public Data Layer',
    body: 'For a price, proprietary code, private research, and expert datasets surface to meet innovative demand.',
    iconKey: 'globe' as const,
  },
  {
    title: 'Granular Budgets',
    body: 'Topical procurement allowances can help Finding Fits decide when paid knowledge is worth the spend.',
    iconKey: 'banknotes' as const,
  },
  {
    title: 'Visible Impactfulness',
    body: 'Procured evidence documents are benchmarked as usage in subsequent Reads and AssetPacks.',
    iconKey: 'chart' as const,
  },
] as const;

export const MARKETPLACE_ACTION_PAD = [
  { label: 'Procured Evidence', iconKey: 'wrench' as const },
  { label: 'Industrial Knowledge', iconKey: 'rocket' as const },
  { label: 'Innovation Exchange', iconKey: 'code' as const },
  { label: 'List, Order, Fill', iconKey: 'clipboard' as const },
  { label: 'Recycled Code', iconKey: 'path' as const },
  { label: 'Passive Satisfaction', iconKey: 'currency' as const },
  { label: 'Trades Measured $BTD', iconKey: 'banknotes' as const },
  { label: 'Managed Activity', iconKey: 'arrows' as const },
  { label: 'Invisible Marketplace', iconKey: 'puzzle' as const },
] as const;
