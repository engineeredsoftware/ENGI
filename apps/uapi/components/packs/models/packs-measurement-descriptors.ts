/**
 * Buyer-facing absolute measurement descriptors for /packs detail.
 * Source-safe catalog prose only — never raw source or provider payloads.
 * Aligned to ASSET_PACK_ABSOLUTES_CATALOG (generic-asset-packs-synthesis).
 */

export type AbsoluteMeasurementKind =
  | "function-count"
  | "type-count"
  | "file-span"
  | "symbolic-richness"
  | "modularity"
  | "correctness-estimate"
  | "objectives-fidelity"
  | "computational-usage";

export type AbsoluteMeasurementBuyerDescriptor = {
  kind: AbsoluteMeasurementKind;
  label: string;
  unit: string;
  /** Short buyer-facing paragraph (obfuscated / non-source). */
  descriptor: string;
};

export const ABSOLUTE_MEASUREMENT_BUYER_DESCRIPTORS: Record<
  AbsoluteMeasurementKind,
  AbsoluteMeasurementBuyerDescriptor
> = {
  "function-count": {
    kind: "function-count",
    label: "Functions",
    unit: "functions",
    descriptor:
      "How many distinct behaviors the AssetPack patch encodes. Higher counts mean denser operational knowledge in the slice — not raw repository size.",
  },
  "type-count": {
    kind: "type-count",
    label: "Types",
    unit: "types",
    descriptor:
      "How many distinct types, interfaces, or schemas the patch defines. Signals structural API surface a reader can reuse without seeing unpaid source.",
  },
  "file-span": {
    kind: "file-span",
    label: "File span",
    unit: "files",
    descriptor:
      "How many files the patch creates or modifies. A compact span is easier to review and settle; broader span covers more of a capability boundary.",
  },
  "symbolic-richness": {
    kind: "symbolic-richness",
    label: "Symbolic richness",
    unit: "symbols",
    descriptor:
      "Unique symbol density in the patch. Richer symbol graphs usually mean more transferable knowledge per file without disclosing protected bodies.",
  },
  modularity: {
    kind: "modularity",
    label: "Modularity",
    unit: "modules",
    descriptor:
      "How many coherent modules the patch spans. Multi-module packs can ship clearer seams; single-module packs stay tightly scoped.",
  },
  "correctness-estimate": {
    kind: "correctness-estimate",
    label: "Correctness",
    unit: "estimate",
    descriptor:
      "Estimated coherence and internal consistency of the synthesized patch (0..1 honesty class: estimate). Not a formal proof of runtime correctness.",
  },
  "objectives-fidelity": {
    kind: "objectives-fidelity",
    label: "Objectives fidelity",
    unit: "estimate",
    descriptor:
      "How well the pack serves deposit objectives while honoring exclusions and source-safety (0..1 estimate). Low scores mean steer or resynthesize before buying.",
  },
  "computational-usage": {
    kind: "computational-usage",
    label: "Computational usage",
    unit: "estimate",
    descriptor:
      "Estimated computational demand of applying or reasoning over this pack (0..1 estimate). Helps buyers plan settlement and delivery cost.",
  },
};

export function descriptorForAbsoluteKind(
  kind: string | null | undefined,
): AbsoluteMeasurementBuyerDescriptor | null {
  if (!kind) return null;
  return ABSOLUTE_MEASUREMENT_BUYER_DESCRIPTORS[kind as AbsoluteMeasurementKind] || null;
}

/** Human labels for deposit AssetPack kinds (not activity taxonomy). */
export const ASSET_PACK_KIND_LABELS: Record<string, string> = {
  "capability-slice": "Capabilities",
  "implementation-pattern": "Patterns",
  "proof-operations-slice": "Operations",
};

export function formatAssetPackKind(kind: string | null | undefined): string {
  if (!kind) return "—";
  return ASSET_PACK_KIND_LABELS[kind] || kind;
}
