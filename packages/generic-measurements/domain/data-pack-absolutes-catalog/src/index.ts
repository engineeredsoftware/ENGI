/**
 * DATA_PACK_ABSOLUTES catalogue (canon).
 * Full target absolute vocabulary for depositing DataPacks + weighted subset (Σ=1).
 * learning-gain is intentionally excluded (BTD / need-fit owns exchange value scalar).
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

export type AbsolutePolicyRole = 'weighted' | 'gate' | 'penalty' | 'flag' | 'target';

export interface DataPackAbsoluteKindSpec extends MeasurementSpec {
  family: AbsoluteFamily;
  propertyClass: AbsolutePropertyClass;
  policyRole: AbsolutePolicyRole;
  weight?: number;
  hasMagnitude: true;
  inWeightedCatalog: boolean;
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
    "weight": 0.09
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
    "weight": 0.07
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
    "weight": 0.05
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
    "weight": 0.09
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
    "weight": 0.05
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
    "weight": 0.06
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
    "weight": 0.07
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
    "weight": 0.07
  },
  {
    "measurementKind": "dependency-span",
    "label": "Dependency span",
    "unit": "dependencies",
    "guidance": "Absolute measure of a synthesized DataPack: Dependency span (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "doc-signal",
    "label": "Doc signal",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Doc signal (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "data-flow-depth",
    "label": "Data-flow depth",
    "unit": "depth",
    "guidance": "Absolute measure of a synthesized DataPack: Data-flow depth (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "symbol-connectivity",
    "label": "Symbol connectivity",
    "unit": "edges",
    "guidance": "Absolute measure of a synthesized DataPack: Symbol connectivity (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "control-complexity",
    "label": "Control complexity",
    "unit": "complexity",
    "guidance": "Absolute measure of a synthesized DataPack: Control complexity (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "config-surface",
    "label": "Config surface",
    "unit": "keys",
    "guidance": "Absolute measure of a synthesized DataPack: Config surface (structure).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "buildability",
    "label": "Buildability",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Buildability (verification).",
    "family": "verification",
    "propertyClass": "verification",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "test-pass-rate",
    "label": "Test pass rate",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Test pass rate (verification).",
    "family": "verification",
    "propertyClass": "verification",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "test-coverage",
    "label": "Test coverage",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Test coverage (verification).",
    "family": "verification",
    "propertyClass": "verification",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "test-strength",
    "label": "Test strength",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Test strength (verification).",
    "family": "verification",
    "propertyClass": "verification",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "runtime-cleanliness",
    "label": "Runtime cleanliness",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Runtime cleanliness (verification).",
    "family": "verification",
    "propertyClass": "verification",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "reproducibility",
    "label": "Reproducibility",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Reproducibility (verification).",
    "family": "verification",
    "propertyClass": "verification",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
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
    "inWeightedCatalog": false
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
    "inWeightedCatalog": false
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
    "inWeightedCatalog": false
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
    "inWeightedCatalog": false
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
    "inWeightedCatalog": false
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
    "inWeightedCatalog": false
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
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "originality",
    "label": "Originality",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Originality (provenance).",
    "family": "provenance",
    "propertyClass": "provenance",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "semantic-novelty",
    "label": "Semantic novelty",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Semantic novelty (provenance).",
    "family": "provenance",
    "propertyClass": "provenance",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "contamination",
    "label": "Contamination",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Contamination (provenance).",
    "family": "provenance",
    "propertyClass": "provenance",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "authorship-consistency",
    "label": "Authorship consistency",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Authorship consistency (provenance).",
    "family": "provenance",
    "propertyClass": "provenance",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "provenance-integrity",
    "label": "Provenance integrity",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Provenance integrity (provenance).",
    "family": "provenance",
    "propertyClass": "provenance",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
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
    "inWeightedCatalog": false
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
    "weight": 0.16
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
    "weight": 0.15
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
    "weight": 0.14
  },
  {
    "measurementKind": "coherence",
    "label": "Coherence",
    "unit": "estimate",
    "guidance": "Absolute measure of a synthesized DataPack: Coherence (semantics).",
    "family": "semantics",
    "propertyClass": "quality",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "completeness",
    "label": "Completeness",
    "unit": "estimate",
    "guidance": "Absolute measure of a synthesized DataPack: Completeness (semantics).",
    "family": "semantics",
    "propertyClass": "quality",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "capability-clarity",
    "label": "Capability clarity",
    "unit": "estimate",
    "guidance": "Absolute measure of a synthesized DataPack: Capability clarity (semantics).",
    "family": "semantics",
    "propertyClass": "quality",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "documentation-alignment",
    "label": "Documentation alignment",
    "unit": "estimate",
    "guidance": "Absolute measure of a synthesized DataPack: Documentation alignment (semantics).",
    "family": "semantics",
    "propertyClass": "quality",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "difficulty",
    "label": "Difficulty",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Difficulty (value).",
    "family": "value",
    "propertyClass": "value",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "irreducibility",
    "label": "Irreducibility",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Irreducibility (value).",
    "family": "value",
    "propertyClass": "value",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "information-content",
    "label": "Information content",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Information content (value).",
    "family": "value",
    "propertyClass": "value",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "rl-object-completeness",
    "label": "RL-object completeness",
    "unit": "components",
    "guidance": "Absolute measure of a synthesized DataPack: RL-object completeness (value).",
    "family": "value",
    "propertyClass": "value",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "trajectory-richness",
    "label": "Trajectory richness",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Trajectory richness (value).",
    "family": "value",
    "propertyClass": "value",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  },
  {
    "measurementKind": "diversity-contribution",
    "label": "Diversity contribution",
    "unit": "ratio",
    "guidance": "Absolute measure of a synthesized DataPack: Diversity contribution (value).",
    "family": "value",
    "propertyClass": "value",
    "policyRole": "target",
    "hasMagnitude": true,
    "inWeightedCatalog": false
  }
] as DataPackAbsoluteKindSpec[];

export const DATA_PACK_ABSOLUTES_CATALOG: DataPackAbsoluteKindSpec[] =
  DATA_PACK_ABSOLUTE_KIND_SPECS.filter((s) => s.inWeightedCatalog && typeof s.weight === 'number');

export const DATA_PACK_ABSOLUTE_KINDS: string[] = DATA_PACK_ABSOLUTE_KIND_SPECS.map(
  (s) => s.measurementKind,
);

export const DATA_PACK_WEIGHTED_ABSOLUTE_KINDS: string[] = DATA_PACK_ABSOLUTES_CATALOG.map(
  (s) => s.measurementKind,
);

export function assertDataPackAbsolutesCatalogWeights(): void {
  const sum = DATA_PACK_ABSOLUTES_CATALOG.reduce((s, row) => s + (row.weight ?? 0), 0);
  if (Math.abs(sum - 1) > 1e-9) {
    throw new Error(`DATA_PACK_ABSOLUTES_CATALOG weights sum to ${sum}, expected 1`);
  }
}

/** @deprecated Use DATA_PACK_ABSOLUTES_CATALOG */
export const ASSET_PACK_ABSOLUTES_CATALOG = DATA_PACK_ABSOLUTES_CATALOG;
/** @deprecated Use DATA_PACK_ABSOLUTE_KINDS */
export const ASSET_PACK_ABSOLUTE_KINDS = DATA_PACK_WEIGHTED_ABSOLUTE_KINDS;
