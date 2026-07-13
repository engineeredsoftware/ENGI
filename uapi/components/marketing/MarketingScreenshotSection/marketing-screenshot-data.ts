/**
 * Screenshot bundles for the marketing screenshot section steps and mobile grid.
 */
import type { Screenshot } from "@/components/marketing/MarketingTypes/marketing-types";

export const STEP1_SCREENS: Screenshot[] = [
  {
    id: "setup-marketplace",
    src: "/screenshots/setup-marketplace.png",
    alt: "Marketplace setup",
    revealingSoon: true,
    description: "Quickly connect your repo and configure Bitcode in the GitHub marketplace.",
  },
  {
    id: "setup-btd",
    src: "/screenshots/setup-btd.png",
    alt: "Acquire BTD",
    revealingSoon: true,
    description: "Fund your Bitcode account with $BTD for protocol activity.",
  },
  {
    id: "setup-btd-balance",
    src: "/screenshots/setup-btd-balance.png",
    alt: "BTD balance widget",
    revealingSoon: true,
    description: "Real-time balance overview.",
  },
];

export const STEP2_SCREENS: Screenshot[] = [
  {
    id: "asset-pack-request",
    src: "/screenshots/asset-pack-page-minimal-state.png",
    alt: "Create an AssetPack request",
    revealingSoon: true,
    description: "Open a new Read describing the AssetPack you want finished.",
  },
  {
    id: "execution-kickoff",
    src: "/screenshots/executions-page.png",
    alt: "Kick-off an execution",
    revealingSoon: true,
    description: "Start a one-click execution pipeline.",
  },
];

export const STEP3_SCREENS: Screenshot[] = [
  {
    id: "execution-summary",
    src: "/screenshots/sidebar-executions.png",
    alt: "Execution summary",
    revealingSoon: true,
    description: "Concise summary of completed execution.",
  },
  {
    id: "conversations-widget",
    src: "/screenshots/conversations-small.png",
    alt: "Conversations widget",
    revealingSoon: true,
    description: "Automated complexity analysis attached to PRs.",
  },
  {
    id: "notifications",
    src: "/screenshots/notifications-widget.png",
    alt: "Instant notifications",
    revealingSoon: true,
    description: "Stay in the loop with subtle Dock notifications.",
  },
];

export const MOBILE_HERO_SHOTS = [
  { src: "/screenshots/asset-pack-page-maximal-state.png", alt: "AssetPack evidence screenshot" },
  { src: "/screenshots/asset-pack-page-minimal-state.png", alt: "AssetPack request screenshot" },
  { src: "/screenshots/conversations-fullscreen.png", alt: "Conversations fullscreen chat screenshot" },
  { src: "/screenshots/sidebar-shippables.png", alt: "Sidebar Shippables panel screenshot" },
  { src: "/screenshots/setup-marketplace.png", alt: "Marketplace setup screenshot" },
  { src: "/screenshots/setup-btd-balance.png", alt: "BTD balance panel screenshot" },
] as const;

export const SCREENSHOT_FRAME_CLASS =
  "relative w-full aspect-video overflow-hidden rounded-lg shadow-lg";
