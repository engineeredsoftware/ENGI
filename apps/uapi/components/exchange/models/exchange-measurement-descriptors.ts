/**
 * Buyer-facing absolute labels/units/descriptors — SSOT from
 * DATA_PACK_ABSOLUTES_CATALOG (all 46 commercial kinds, Σ weights = 1).
 *
 * Prefer measure-time instance `descriptor` on the reading when present.
 * Never raw source.
 */

import {
  DATA_PACK_ABSOLUTES_CATALOG,
  DATA_PACK_ABSOLUTE_KINDS,
  type DataPackAbsoluteKindSpec,
} from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';

export type AbsoluteMeasurementKind = string;

export type AbsoluteMeasurementBuyerDescriptor = {
  kind: string;
  label: string;
  unit: string;
  weight: number;
  family: string;
  policyRole: string;
  /** Short buyer-facing paragraph (obfuscated / non-source) about this pack. */
  descriptor: string;
};

/** Hand-authored buyer prose for kinds that need richer copy; others use a template. */
const DESCRIPTOR_OVERRIDES: Record<string, string> = {
  'function-count':
    "This DataPack's measured function-count: distinct behaviors encoded in its source-safe patch slice. The magnitude at right is this option's reading — denser operational surface for this pack, not full-repository size.",
  'type-count':
    "This DataPack's measured type surface: distinct types, interfaces, or schemas defined in its patch. Structural reuse signal for this option without exposing unpaid source bodies.",
  'file-span':
    "This DataPack's file span: how many files its patch creates or modifies. A compact span keeps this option easy to review and settle; a broader span covers a wider capability boundary for this pack only.",
  'symbolic-richness':
    "This DataPack's unique-symbol density in the patch graph. Higher richness on this option usually means more transferable structure per file, still without disclosing protected bodies.",
  modularity:
    "This DataPack's module span: how many coherent modules this patch covers. Multi-module readings on this option imply clearer seams; a single module means a tightly scoped slice.",
  'lang-span':
    "How many distinct languages this DataPack's patch touches. Multi-language span signals cross-stack capability; a single language keeps the slice tightly scoped.",
  'test-surface':
    "Measured test/assertion surface attached to this DataPack's patch. Higher surface means more verification material travels with the knowledge—not a runtime pass rate.",
  'api-surface':
    "Public export/entrypoint surface of this DataPack. Higher API surface usually means clearer integration seams for buyers without disclosing unpaid source bodies.",
  'correctness-estimate':
    "This DataPack's estimated coherence and internal consistency (0..1 honesty class: estimate). Not a formal proof of runtime correctness — a source-safe quality reading for this option.",
  'objectives-fidelity':
    'How well this DataPack serves its deposit objectives while holding exclusions and source-safety (0..1 estimate). Low scores on this pack mean steer or resynthesize before settle.',
  'computational-usage':
    'Estimated computational demand of applying or reasoning over this DataPack (0..1 estimate). Use it to plan settlement and delivery cost for this option.',
  'secret-safety':
    'Gate reading: whether this DataPack patch appears free of secret material that would block deposit. Fail-closed in Validation even while carrying catalogue weight.',
  'pii-exposure':
    'Gate reading: personal-data exposure risk on this DataPack. High exposure blocks or discounts commercial listing until remediated.',
  buildability:
    'Verification signal: whether this DataPack slice appears buildable from source-safe evidence (not a live CI guarantee).',
  'test-pass-rate':
    'Verification signal: estimated test pass posture for material covered by this DataPack.',
  difficulty:
    'Value signal: estimated difficulty of absorbing or applying this DataPack in a buyer context.',
};

function defaultDescriptor(spec: DataPackAbsoluteKindSpec): string {
  const override = DESCRIPTOR_OVERRIDES[spec.measurementKind];
  if (override) return override;
  return (
    `This DataPack's measured ${spec.label.toLowerCase()} (${spec.measurementKind})` +
    ` — commercial absolute in the ${spec.family} family` +
    ` (policy ${spec.policyRole}, weight ${spec.weight}).` +
    ` Source-safe reading only; never unpaid source bodies.`
  );
}

function rowFromSpec(spec: DataPackAbsoluteKindSpec): AbsoluteMeasurementBuyerDescriptor {
  return {
    kind: spec.measurementKind,
    label: spec.label,
    unit: spec.unit || 'normalized',
    weight: spec.weight,
    family: spec.family,
    policyRole: spec.policyRole,
    descriptor: defaultDescriptor(spec),
  };
}

/** Full 46-kind buyer descriptor map (SSOT order). */
export const ABSOLUTE_MEASUREMENT_BUYER_DESCRIPTORS: Record<
  string,
  AbsoluteMeasurementBuyerDescriptor
> = Object.fromEntries(
  DATA_PACK_ABSOLUTES_CATALOG.map((spec) => [spec.measurementKind, rowFromSpec(spec)]),
);

/** Ordered catalogue descriptors (46). */
export const ABSOLUTE_MEASUREMENT_BUYER_DESCRIPTOR_LIST: AbsoluteMeasurementBuyerDescriptor[] =
  DATA_PACK_ABSOLUTES_CATALOG.map(rowFromSpec);

export function descriptorForAbsoluteKind(
  kind: string | null | undefined,
): AbsoluteMeasurementBuyerDescriptor | null {
  if (!kind) return null;
  const hit = ABSOLUTE_MEASUREMENT_BUYER_DESCRIPTORS[kind];
  if (hit) return hit;
  // Unknown kind: still surface something honest rather than null.
  return {
    kind,
    label: kind,
    unit: 'normalized',
    weight: 0,
    family: 'unknown',
    policyRole: 'weighted',
    descriptor: `Absolute measurement ${kind} on this DataPack (source-safe).`,
  };
}

/** SSOT kind ids (46). */
export const ABSOLUTE_MEASUREMENT_KINDS: readonly string[] = DATA_PACK_ABSOLUTE_KINDS;

/** Human labels for deposit DataPack kinds (not activity taxonomy). */
export const ASSET_PACK_KIND_LABELS: Record<string, string> = {
  'capability-slice': 'Capabilities',
  'implementation-pattern': 'Patterns',
  'proof-operations-slice': 'Operations',
};

export function formatDataPackKind(kind: string | null | undefined): string {
  if (!kind) return '—';
  return ASSET_PACK_KIND_LABELS[kind] || kind;
}
