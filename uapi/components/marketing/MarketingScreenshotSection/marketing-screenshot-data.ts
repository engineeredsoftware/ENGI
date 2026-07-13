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

/** Floating hero screenshots flanking the left main panel. */
export const LEFT_FLOATING_SHOTS = [
  {
    src: '/screenshots/sidebar-shippables.png',
    border: 'border-orange-400',
    glow: 'rgba(249,168,38,0.6)',
    rotate: 0,
    style: { left: '-1rem', bottom: '0rem', zIndex: 80 },
  },
  {
    src: '/screenshots/setup-marketplace.png',
    border: 'border-orange-400',
    glow: 'rgba(249,168,38,0.6)',
    rotate: 0,
    style: { left: '5.5rem', bottom: '3.5rem', zIndex: 90 },
  },
  {
    src: '/screenshots/setup-btd-balance.png',
    border: 'border-green-400',
    glow: 'rgba(52,211,153,0.6)',
    rotate: 0,
    style: { left: '11rem', bottom: '5rem', zIndex: 85 },
  },
] as const;

/** Floating hero screenshots flanking the right main panel. */
export const RIGHT_FLOATING_SHOTS = [
  {
    src: '/screenshots/conversations-small.png',
    border: 'border-purple-500',
    glow: 'rgba(192,132,252,0.6)',
    rotate: 0,
    style: { left: '1rem', bottom: '-1rem', zIndex: 80 },
  },
  {
    src: '/screenshots/rich-text-conversations.png',
    border: 'border-purple-500',
    glow: 'rgba(192,132,252,0.6)',
    rotate: 0,
    style: { left: '1rem', bottom: '17.5rem', zIndex: 90 },
  },
  {
    src: '/screenshots/notifications-widget.png',
    border: 'border-green-400',
    glow: 'rgba(52,211,153,0.6)',
    rotate: 0,
    style: { left: '8.5rem', bottom: '5.5rem', zIndex: 85 },
  },
] as const;

export type ScreenshotHighlightGroup = 'assetPacks' | 'evidenceDocuments';
