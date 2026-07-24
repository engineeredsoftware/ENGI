/**
 * DATA_PACK_ABSOLUTES catalogue (canon).
 *
 * Law: the full absolute vocabulary is **46 kinds**, each with a commercial weight
 * and **Σ weights = 1**. There is no separate 11-kind subset — that was legacy.
 * `DATA_PACK_ABSOLUTES_CATALOG` is the full catalogue (all 46).
 *
 * `policyRole` remains operational metadata (gate / penalty / flag / weighted)
 * and does **not** remove a kind from Σ. learning-gain is excluded (BTD / need-fit).
 *
 * SSOT for UI options: DATA_PACK_ABSOLUTE_KIND_SELECT_OPTIONS.
 */
import type { MeasurementSpec } from '@bitcode/measurement-generics';

export type AbsoluteFamily =
  | 'structure'
  | 'verification'
  | 'hygiene'
  | 'provenance'
  | 'semantics'
  | 'value';

export type AbsolutePropertyClass =
  | 'quantity'
  | 'quality'
  | 'verification'
  | 'hygiene'
  | 'provenance'
  | 'value';

/** Operational role — all kinds remain in the weighted commercial catalogue. */
export type AbsolutePolicyRole = 'weighted' | 'gate' | 'penalty' | 'flag' | 'target';

export interface DataPackAbsoluteKindSpec extends MeasurementSpec {
  family: AbsoluteFamily;
  propertyClass: AbsolutePropertyClass;
  policyRole: AbsolutePolicyRole;
  /** Commercial weight; required for every kind. Σ across catalogue = 1. */
  weight: number;
  hasMagnitude: true;
  /**
   * @deprecated Always true — full catalogue is commercial law.
   * Kept so older filters still compile; do not use to subset the catalog.
   */
  inWeightedCatalog: true;
}

export const DATA_PACK_ABSOLUTE_KIND_SPECS: DataPackAbsoluteKindSpec[] = [
  {
    "measurementKind": "function-count",
    "label": "Functions",
    "unit": "functions",
    "guidance": "Absolute measure of a synthesized DataPack: Functions (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.035
  },
  {
    "measurementKind": "type-count",
    "label": "Types",
    "unit": "types",
    "guidance": "Absolute measure of a synthesized DataPack: Types (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.025
  },
  {
    "measurementKind": "file-span",
    "label": "File span",
    "unit": "files",
    "guidance": "Absolute measure of a synthesized DataPack: File span (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.02
  },
  {
    "measurementKind": "symbolic-richness",
    "label": "Symbolic richness",
    "unit": "symbols",
    "guidance": "Absolute measure of a synthesized DataPack: Symbolic richness (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.035
  },
  {
    "measurementKind": "modularity",
    "label": "Modularity",
    "unit": "modules",
    "guidance": "Absolute measure of a synthesized DataPack: Modularity (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.02
  },
  {
    "measurementKind": "lang-span",
    "label": "Language span",
    "unit": "languages",
    "guidance": "Absolute measure of a synthesized DataPack: Language span (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.02
  },
  {
    "measurementKind": "test-surface",
    "label": "Test surface",
    "unit": "tests",
    "guidance": "Absolute measure of a synthesized DataPack: Test surface (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.03
  },
  {
    "measurementKind": "api-surface",
    "label": "API surface",
    "unit": "exports",
    "guidance": "Absolute measure of a synthesized DataPack: API surface (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.03
  },
  {
    "measurementKind": "dependency-span",
    "label": "Dependency span",
    "unit": "dependencies",
    "guidance": "Absolute measure of a synthesized DataPack: Dependency span (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.02
  },
  {
    "measurementKind": "doc-signal",
    "label": "Doc signal",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Doc signal (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.015
  },
  {
    "measurementKind": "data-flow-depth",
    "label": "Data-flow depth",
    "unit": "depth",
    "guidance": "Absolute measure of a synthesized DataPack: Data-flow depth (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.02
  },
  {
    "measurementKind": "symbol-connectivity",
    "label": "Symbol connectivity",
    "unit": "edges",
    "guidance": "Absolute measure of a synthesized DataPack: Symbol connectivity (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.015
  },
  {
    "measurementKind": "control-complexity",
    "label": "Control complexity",
    "unit": "complexity",
    "guidance": "Absolute measure of a synthesized DataPack: Control complexity (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.01
  },
  {
    "measurementKind": "config-surface",
    "label": "Config surface",
    "unit": "keys",
    "guidance": "Absolute measure of a synthesized DataPack: Config surface (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.005
  },
  {
    "measurementKind": "buildability",
    "label": "Buildability",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Buildability (verification).",
    "family": "verification",
    "propertyClass": "verification",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.03
  },
  {
    "measurementKind": "test-pass-rate",
    "label": "Test pass rate",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Test pass rate (verification).",
    "family": "verification",
    "propertyClass": "verification",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.045
  },
  {
    "measurementKind": "test-coverage",
    "label": "Test coverage",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Test coverage (verification).",
    "family": "verification",
    "propertyClass": "verification",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.03
  },
  {
    "measurementKind": "test-strength",
    "label": "Test strength",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Test strength (verification).",
    "family": "verification",
    "propertyClass": "verification",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.035
  },
  {
    "measurementKind": "runtime-cleanliness",
    "label": "Runtime cleanliness",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Runtime cleanliness (verification).",
    "family": "verification",
    "propertyClass": "verification",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.02
  },
  {
    "measurementKind": "reproducibility",
    "label": "Reproducibility",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Reproducibility (verification).",
    "family": "verification",
    "propertyClass": "verification",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.02
  },
  {
    "measurementKind": "secret-safety",
    "label": "Secret safety",
    "unit": "gate",
    "guidance": "Absolute measure of a synthesized DataPack: Secret safety (hygiene).",
    "family": "hygiene",
    "propertyClass": "hygiene",
    "policyRole": "gate",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.02
  },
  {
    "measurementKind": "pii-exposure",
    "label": "PII exposure",
    "unit": "gate",
    "guidance": "Absolute measure of a synthesized DataPack: PII exposure (hygiene).",
    "family": "hygiene",
    "propertyClass": "hygiene",
    "policyRole": "gate",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.02
  },
  {
    "measurementKind": "security-cleanliness",
    "label": "Security cleanliness",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Security cleanliness (hygiene).",
    "family": "hygiene",
    "propertyClass": "hygiene",
    "policyRole": "penalty",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.015
  },
  {
    "measurementKind": "dependency-health",
    "label": "Dependency health",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Dependency health (hygiene).",
    "family": "hygiene",
    "propertyClass": "hygiene",
    "policyRole": "penalty",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.015
  },
  {
    "measurementKind": "license-cleanliness",
    "label": "License cleanliness",
    "unit": "gate",
    "guidance": "Absolute measure of a synthesized DataPack: License cleanliness (hygiene).",
    "family": "hygiene",
    "propertyClass": "hygiene",
    "policyRole": "gate",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.01
  },
  {
    "measurementKind": "duplication-internal",
    "label": "Internal duplication",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Internal duplication (hygiene).",
    "family": "hygiene",
    "propertyClass": "hygiene",
    "policyRole": "penalty",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.01
  },
  {
    "measurementKind": "dead-code-ratio",
    "label": "Dead-code ratio",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Dead-code ratio (hygiene).",
    "family": "hygiene",
    "propertyClass": "hygiene",
    "policyRole": "penalty",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.01
  },
  {
    "measurementKind": "originality",
    "label": "Originality",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Originality (provenance).",
    "family": "provenance",
    "propertyClass": "provenance",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.03
  },
  {
    "measurementKind": "semantic-novelty",
    "label": "Semantic novelty",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Semantic novelty (provenance).",
    "family": "provenance",
    "propertyClass": "provenance",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.02
  },
  {
    "measurementKind": "contamination",
    "label": "Contamination",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Contamination (provenance).",
    "family": "provenance",
    "propertyClass": "provenance",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.02
  },
  {
    "measurementKind": "authorship-consistency",
    "label": "Authorship consistency",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Authorship consistency (provenance).",
    "family": "provenance",
    "propertyClass": "provenance",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.015
  },
  {
    "measurementKind": "provenance-integrity",
    "label": "Provenance integrity",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Provenance integrity (provenance).",
    "family": "provenance",
    "propertyClass": "provenance",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.02
  },
  {
    "measurementKind": "ai-generated-likelihood",
    "label": "AI-generated likelihood",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: AI-generated likelihood (provenance).",
    "family": "provenance",
    "propertyClass": "provenance",
    "policyRole": "flag",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.015
  },
  {
    "measurementKind": "correctness-estimate",
    "label": "Correctness",
    "unit": "estimate",
    "guidance": "Absolute measure of a synthesized DataPack: Correctness (semantics).",
    "family": "semantics",
    "propertyClass": "quality",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.05
  },
  {
    "measurementKind": "objectives-fidelity",
    "label": "Objectives fidelity",
    "unit": "estimate",
    "guidance": "Absolute measure of a synthesized DataPack: Objectives fidelity (semantics).",
    "family": "semantics",
    "propertyClass": "quality",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.04
  },
  {
    "measurementKind": "computational-usage",
    "label": "Computational usage",
    "unit": "estimate",
    "guidance": "Absolute measure of a synthesized DataPack: Computational usage (semantics).",
    "family": "semantics",
    "propertyClass": "quality",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.03
  },
  {
    "measurementKind": "coherence",
    "label": "Coherence",
    "unit": "estimate",
    "guidance": "Absolute measure of a synthesized DataPack: Coherence (semantics).",
    "family": "semantics",
    "propertyClass": "quality",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.02
  },
  {
    "measurementKind": "completeness",
    "label": "Completeness",
    "unit": "estimate",
    "guidance": "Absolute measure of a synthesized DataPack: Completeness (semantics).",
    "family": "semantics",
    "propertyClass": "quality",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.02
  },
  {
    "measurementKind": "capability-clarity",
    "label": "Capability clarity",
    "unit": "estimate",
    "guidance": "Absolute measure of a synthesized DataPack: Capability clarity (semantics).",
    "family": "semantics",
    "propertyClass": "quality",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.01
  },
  {
    "measurementKind": "documentation-alignment",
    "label": "Documentation alignment",
    "unit": "estimate",
    "guidance": "Absolute measure of a synthesized DataPack: Documentation alignment (semantics).",
    "family": "semantics",
    "propertyClass": "quality",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.01
  },
  {
    "measurementKind": "difficulty",
    "label": "Difficulty",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Difficulty (value).",
    "family": "value",
    "propertyClass": "value",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.025
  },
  {
    "measurementKind": "irreducibility",
    "label": "Irreducibility",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Irreducibility (value).",
    "family": "value",
    "propertyClass": "value",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.025
  },
  {
    "measurementKind": "information-content",
    "label": "Information content",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Information content (value).",
    "family": "value",
    "propertyClass": "value",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.02
  },
  {
    "measurementKind": "rl-object-completeness",
    "label": "RL-object completeness",
    "unit": "components",
    "guidance": "Absolute measure of a synthesized DataPack: RL-object completeness (value).",
    "family": "value",
    "propertyClass": "value",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.02
  },
  {
    "measurementKind": "trajectory-richness",
    "label": "Trajectory richness",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Trajectory richness (value).",
    "family": "value",
    "propertyClass": "value",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.015
  },
  {
    "measurementKind": "diversity-contribution",
    "label": "Diversity contribution",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Diversity contribution (value).",
    "family": "value",
    "propertyClass": "value",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.015
  }
] as DataPackAbsoluteKindSpec[];

/** Commercial absolute catalogue — full 46 kinds, Σ weights = 1 (new law). */
export const DATA_PACK_ABSOLUTES_CATALOG: DataPackAbsoluteKindSpec[] =
  DATA_PACK_ABSOLUTE_KIND_SPECS;

/** All absolute kind ids (same as commercial catalogue). */
export const DATA_PACK_ABSOLUTE_KINDS: string[] = DATA_PACK_ABSOLUTE_KIND_SPECS.map(
  (s) => s.measurementKind,
);

/**
 * @deprecated Alias of DATA_PACK_ABSOLUTE_KINDS — there is no 11-kind weighted subset.
 * Prefer DATA_PACK_ABSOLUTE_KINDS or DATA_PACK_ABSOLUTES_CATALOG.
 */
export const DATA_PACK_WEIGHTED_ABSOLUTE_KINDS: string[] = DATA_PACK_ABSOLUTE_KINDS;

/**
 * UI / filter option rows for every absolute kind (SSOT).
 */
export type DataPackAbsoluteKindOption = {
  value: string;
  label: string;
  family: AbsoluteFamily;
  policyRole: AbsolutePolicyRole;
  inWeightedCatalog: true;
  weight: number;
};

export const DATA_PACK_ABSOLUTE_KIND_OPTIONS: DataPackAbsoluteKindOption[] =
  DATA_PACK_ABSOLUTE_KIND_SPECS.map((s) => ({
    value: s.measurementKind,
    label: s.label,
    family: s.family,
    policyRole: s.policyRole,
    inWeightedCatalog: true as const,
    weight: s.weight,
  }));

/** Select-control rows: "Any absolute" + every catalogue kind in SSOT order. */
export const DATA_PACK_ABSOLUTE_KIND_SELECT_OPTIONS: Array<{
  value: string;
  label: string;
}> = [
  { value: 'all', label: 'Any absolute' },
  ...DATA_PACK_ABSOLUTE_KIND_OPTIONS.map((o) => ({
    value: o.value,
    label: o.label,
  })),
];

export function labelForDataPackAbsoluteKind(kind: string | null | undefined): string {
  if (!kind) return '—';
  const hit = DATA_PACK_ABSOLUTE_KIND_OPTIONS.find((o) => o.value === kind);
  return hit?.label ?? kind;
}

export function assertDataPackAbsolutesCatalogWeights(): void {
  if (DATA_PACK_ABSOLUTES_CATALOG.length !== 46) {
    throw new Error(
      `DATA_PACK_ABSOLUTES_CATALOG length ${DATA_PACK_ABSOLUTES_CATALOG.length}, expected 46`,
    );
  }
  const sum = DATA_PACK_ABSOLUTES_CATALOG.reduce((s, row) => s + row.weight, 0);
  if (Math.abs(sum - 1) > 1e-9) {
    throw new Error(`DATA_PACK_ABSOLUTES_CATALOG weights sum to ${sum}, expected 1`);
  }
  for (const row of DATA_PACK_ABSOLUTES_CATALOG) {
    if (!(row.weight > 0)) {
      throw new Error(`Absolute kind ${row.measurementKind} missing positive weight`);
    }
  }
}
