"use client";

import type { BitcodeExplainer } from "@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types";

export const auxillaryPaneExplainers: Record<
  "interfacesDefaults" | "interfacesPrompt" | "interfacesModels" | "btdWallet" | "btdShares",
  BitcodeExplainer
> = {
  interfacesDefaults: {
    kicker: "Interfaces auxillary",
    title: "Interface defaults",
    summary:
      "Keep the Bitcode, MCP API, ChatGPT App, and proof reading aligned to one operator posture.",
    detail:
      "These defaults shape how the Bitcode opens, how detail is emphasized, and how evidence is read before closure.",
    points: [
      "Choose the Pack detail density you want to read first",
      "Keep MCP API and ChatGPT App entry posture predictable",
      "Decide whether proofs open visually, mixed, or as raw evidence",
    ],
    references: {
      source: [
        "apps/uapi/app/auxillaries/components/AuxillariesInterfacesPane.tsx",
      ],
      canon: ["BITCODE_SPEC_V48_NOTES.md — deposit/read product-surface presentation laws"],
    },
  },
  interfacesPrompt: {
    kicker: "Interfaces auxillary",
    title: "Read–Deposit system prompt",
    summary:
      "A single shared system prompt used by both Read and Deposit AI work so operator posture stays aligned across those surfaces.",
    detail:
      "Set tone, exactness, and explanation style once. Read and Deposit reuse this baseline; ledgerized Reading pipelines keep protocol-owned model configuration.",
    points: [
      "Shared by Read and Deposit — not per-surface forks",
      "Optional; empty keeps product defaults",
      "Does not override ledgerized / registry model config",
    ],
    references: {
      source: [
        "apps/uapi/app/auxillaries/components/AuxillariesInterfacesPane.tsx",
      ],
      canon: ["BITCODE_SPEC_V48_NOTES.md — deposit/read product-surface presentation laws"],
    },
  },
  interfacesModels: {
    kicker: "Interfaces auxillary",
    title: "Ledgerized model posture",
    summary:
      "Ledgerized Reading pipelines use protocol-owned model configuration rather than user-selected model defaults.",
    detail:
      "Conversation-only model preferences may exist outside V28 closure, but Reading, Finding Fits, AssetPack synthesis, proof, and settlement paths remain deterministic.",
    points: [
      "Do not route ledgerized synthesis through user model preferences",
      "Keep provider and model evidence in telemetry",
      "Treat conversation-only model choice as outside settlement authority",
    ],
    references: {
      source: [
        "apps/uapi/app/auxillaries/components/AuxillariesInterfacesPane.tsx",
      ],
      canon: ["BITCODE_SPEC_V48_NOTES.md — deposit/read product-surface presentation laws"],
    },
  },
  btdWallet: {
    kicker: "Wallet auxillary",
    title: "Wallet posture",
    summary:
      "Keep identity, BTC fee liquidity, $BTD holdings, account trust, and membership posture legible before you lean on heavier Bitcode throughput.",
    detail:
      "The inner auxillary should make wallet-facing BTC and non-fungible $BTD posture readable at a glance instead of hiding it behind account menus or detached account pages.",
    points: [
      "Review current $BTD read-right holdings and live access posture",
      "Surface whether BTC and wallet binding are already attached",
      "Keep team and membership posture visible beside fee and share posture",
    ],
    references: {
      source: [
        "apps/uapi/app/auxillaries/components/AuxillariesWalletPane.tsx",
      ],
      canon: ["BITCODE_SPEC_V48_NOTES.md — deposit/read product-surface presentation laws"],
    },
  },
  btdShares: {
    kicker: "Wallet auxillary",
    title: "Share posture",
    summary:
      "Share reading controls how you want ownership, settlement, and organization participation to surface in transactions.",
    detail:
      "Use this when you want the operator view to bias toward organization-level, network-level, or account-level share reading.",
    points: [
      "Choose the share lens that matches the current operating context",
      "Keep settlement reading explicit before closure",
      "Control how BTD-specific detail re-enters product and interface surfaces",
    ],
    references: {
      source: [
        "apps/uapi/app/auxillaries/components/AuxillariesWalletPane.tsx",
      ],
      canon: ["BITCODE_SPEC_V48_NOTES.md — deposit/read product-surface presentation laws"],
    },
  },
};
