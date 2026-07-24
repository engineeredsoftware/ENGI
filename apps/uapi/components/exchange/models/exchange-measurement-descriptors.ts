/**
 * Catalog fallback labels/units for absolute kinds when a stored reading has no
 * measure-time `descriptor`. Prefer instance descriptors attached on the
 * DataPack absolute row (built by buildSourceSafeAbsoluteDescriptor at measure).
 * Never raw source.
 *
 * Covers the full weighted DATA_PACK_ABSOLUTES commercial catalog (Σ weights = 1).
 */

export type AbsoluteMeasurementKind =
  | "function-count"
  | "type-count"
  | "file-span"
  | "symbolic-richness"
  | "modularity"
  | "lang-span"
  | "test-surface"
  | "api-surface"
  | "correctness-estimate"
  | "objectives-fidelity"
  | "computational-usage";

export type AbsoluteMeasurementBuyerDescriptor = {
  kind: AbsoluteMeasurementKind;
  label: string;
  unit: string;
  /** Short buyer-facing paragraph (obfuscated / non-source) about this pack. */
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
      "This DataPack’s measured function-count: distinct behaviors encoded in its source-safe patch slice. The magnitude at right is this option’s reading — denser operational surface for this pack, not full-repository size.",
  },
  "type-count": {
    kind: "type-count",
    label: "Types",
    unit: "types",
    descriptor:
      "This DataPack’s measured type surface: distinct types, interfaces, or schemas defined in its patch. Structural reuse signal for this option without exposing unpaid source bodies.",
  },
  "file-span": {
    kind: "file-span",
    label: "File span",
    unit: "files",
    descriptor:
      "This DataPack’s file span: how many files its patch creates or modifies. A compact span keeps this option easy to review and settle; a broader span covers a wider capability boundary for this pack only.",
  },
  "symbolic-richness": {
    kind: "symbolic-richness",
    label: "Symbolic richness",
    unit: "symbols",
    descriptor:
      "This DataPack’s unique-symbol density in the patch graph. Higher richness on this option usually means more transferable structure per file, still without disclosing protected bodies.",
  },
  modularity: {
    kind: "modularity",
    label: "Modularity",
    unit: "modules",
    descriptor:
      "This DataPack’s module span: how many coherent modules this patch covers. Multi-module readings on this option imply clearer seams; a single module means a tightly scoped slice.",
  },
  "lang-span": {
    kind: "lang-span",
    label: "Language span",
    unit: "languages",
    descriptor:
      "How many distinct languages this DataPack’s patch touches. Multi-language span signals cross-stack capability; a single language keeps the slice tightly scoped.",
  },
  "test-surface": {
    kind: "test-surface",
    label: "Test surface",
    unit: "tests",
    descriptor:
      "Measured test/assertion surface attached to this DataPack’s patch. Higher surface means more verification material travels with the knowledge—not a runtime pass rate.",
  },
  "api-surface": {
    kind: "api-surface",
    label: "API surface",
    unit: "exports",
    descriptor:
      "Public export/entrypoint surface of this DataPack. Higher API surface usually means clearer integration seams for buyers without disclosing unpaid source bodies.",
  },
  "correctness-estimate": {
    kind: "correctness-estimate",
    label: "Correctness",
    unit: "estimate",
    descriptor:
      "This DataPack’s estimated coherence and internal consistency (0..1 honesty class: estimate). Not a formal proof of runtime correctness — a source-safe quality reading for this option.",
  },
  "objectives-fidelity": {
    kind: "objectives-fidelity",
    label: "Objectives fidelity",
    unit: "estimate",
    descriptor:
      "How well this DataPack serves its deposit objectives while holding exclusions and source-safety (0..1 estimate). Low scores on this pack mean steer or resynthesize before settle.",
  },
  "computational-usage": {
    kind: "computational-usage",
    label: "Computational usage",
    unit: "estimate",
    descriptor:
      "Estimated computational demand of applying or reasoning over this DataPack (0..1 estimate). Use it to plan settlement and delivery cost for this option.",
  },
};

export function descriptorForAbsoluteKind(
  kind: string | null | undefined,
): AbsoluteMeasurementBuyerDescriptor | null {
  if (!kind) return null;
  return ABSOLUTE_MEASUREMENT_BUYER_DESCRIPTORS[kind as AbsoluteMeasurementKind] || null;
}

/** Human labels for deposit DataPack kinds (not activity taxonomy). */
export const ASSET_PACK_KIND_LABELS: Record<string, string> = {
  "capability-slice": "Capabilities",
  "implementation-pattern": "Patterns",
  "proof-operations-slice": "Operations",
};

export function formatDataPackKind(kind: string | null | undefined): string {
  if (!kind) return "—";
  return ASSET_PACK_KIND_LABELS[kind] || kind;
}
