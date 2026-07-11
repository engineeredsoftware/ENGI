"use client";

import type { BitcodeExplainer } from "@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types";

export const auxillaryPaneExplainers: Record<
  "interfacesDefaults" | "interfacesPrompt" | "interfacesModels" | "btdWallet" | "btdShares" | "btdAdvanced",
  BitcodeExplainer
> = {
  interfacesDefaults: {
    kicker: "Interfaces auxillary",
    title: "Interface defaults",
    summary:
      "Keep the Bitcode Terminal, MCP API, ChatGPT App, and proof reading aligned to one operator posture.",
    detail:
      "These defaults shape how the Bitcode Terminal opens, how detail is emphasized, and how evidence is read before closure.",
    points: [
      "Choose the Terminal detail density you want to read first",
      "Keep MCP API and ChatGPT App entry posture predictable",
      "Decide whether proofs open visually, mixed, or as raw evidence",
    ],
    references: {
      source: [
        "uapi/app/auxillaries/components/AuxillariesInterfacesPane.tsx",
      ],
      canon: ["BITCODE_SPEC_V48_NOTES.md — deposit/read product-surface presentation laws"],
    },
  },
  interfacesPrompt: {
    kicker: "Interfaces auxillary",
    title: "Instruction baseline",
    summary:
      "The interface prompt baseline carries the user-visible posture Bitcode should keep when it summarizes or explains non-ledgerized reads.",
    detail:
      "Use a bounded baseline here when you want calmer, more exact interface behavior without rewriting every transaction or interface locally.",
    points: [
      "Keep formal or decisive tone consistent",
      "Bias toward throughput, quality, or balanced review",
      "Preserve one reusable non-ledgerized instruction surface",
    ],
    references: {
      source: [
        "uapi/app/auxillaries/components/AuxillariesInterfacesPane.tsx",
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
      "Conversation-only model preferences may exist outside V28 closure, but Terminal Reading, Finding Fits, AssetPack synthesis, proof, and settlement paths remain deterministic.",
    points: [
      "Do not route ledgerized synthesis through user model preferences",
      "Keep provider and model evidence in telemetry",
      "Treat conversation-only model choice as outside settlement authority",
    ],
    references: {
      source: [
        "uapi/app/auxillaries/components/AuxillariesInterfacesPane.tsx",
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
        "uapi/app/auxillaries/components/AuxillariesWalletPane.tsx",
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
      "Control how BTD-specific detail re-enters Terminal and interface surfaces",
    ],
    references: {
      source: [
        "uapi/app/auxillaries/components/AuxillariesWalletPane.tsx",
      ],
      canon: ["BITCODE_SPEC_V48_NOTES.md — deposit/read product-surface presentation laws"],
    },
  },
  btdAdvanced: {
    kicker: "Wallet auxillary",
    title: "Advanced defaults",
    summary:
      "Advanced $BTD defaults shape how the inner auxillary biases replay, automation, and settlement follow-through.",
    detail:
      "These controls are for the operator who wants BTD-specific behavior to stay explicit and reusable without breaking Terminal or interface reading posture.",
    points: [
      "Bias toward review-first or more decisive settlement handling",
      "Decide how BTD detail should open back into transaction views",
      "Keep replay and closure posture aligned to one account preference",
    ],
    references: {
      source: [
        "uapi/app/auxillaries/components/AuxillariesWalletPane.tsx",
      ],
      canon: ["BITCODE_SPEC_V48_NOTES.md — deposit/read product-surface presentation laws"],
    },
  },
};
