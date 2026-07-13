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

