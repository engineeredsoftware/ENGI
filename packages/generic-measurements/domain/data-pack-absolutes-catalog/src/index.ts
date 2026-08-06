/**
 * DATA_PACK_ABSOLUTES catalogue (canon).
 *
 * Law: the full absolute vocabulary is structure/quality kinds plus buyer-visible
 * material-identity companion scalars. Each kind has a commercial weight and
 * **Σ weights = 1**. There is no separate weighted subset.
 * `DATA_PACK_ABSOLUTES_CATALOG` is the full catalogue.
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
    "weight": 0.02835
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
    "weight": 0.02025
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
    "weight": 0.0162
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
    "weight": 0.02835
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
    "weight": 0.0162
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
    "weight": 0.0162
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
    "weight": 0.0243
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
    "weight": 0.0243
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
    "weight": 0.0162
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
    "weight": 0.01215
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
    "weight": 0.0162
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
    "weight": 0.01215
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
    "weight": 0.0081
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
    "weight": 0.00405
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
    "weight": 0.0243
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
    "weight": 0.03645
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
    "weight": 0.0243
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
    "weight": 0.02835
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
    "weight": 0.0162
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
    "weight": 0.0162
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
    "weight": 0.0162
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
    "weight": 0.0162
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
    "weight": 0.01215
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
    "weight": 0.01215
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
    "weight": 0.0081
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
    "weight": 0.0081
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
    "weight": 0.0081
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
    "weight": 0.0243
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
    "weight": 0.0162
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
    "weight": 0.0162
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
    "weight": 0.01215
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
    "weight": 0.0162
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
    "weight": 0.01215
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
    "weight": 0.0405
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
    "weight": 0.0324
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
    "weight": 0.0243
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
    "weight": 0.0162
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
    "weight": 0.0162
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
    "weight": 0.0081
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
    "weight": 0.0081
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
    "weight": 0.02025
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
    "weight": 0.02025
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
    "weight": 0.0162
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
    "weight": 0.0162
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
    "weight": 0.01215
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
    "weight": 0.01215
  },
  {
    "measurementKind": "language-concentration",
    "label": "Language concentration",
    "unit": "ratio",
    "guidance": "Buyer-visible absolute: Language concentration (material identity companion).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.014
  },
  {
    "measurementKind": "framework-surface",
    "label": "Framework surface",
    "unit": "frameworks",
    "guidance": "Buyer-visible absolute: Framework surface (material identity companion).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.014
  },
  {
    "measurementKind": "purpose-clarity",
    "label": "Purpose clarity",
    "unit": "estimate",
    "guidance": "Buyer-visible absolute: Purpose clarity (material identity companion).",
    "family": "semantics",
    "propertyClass": "quality",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.014
  },
  {
    "measurementKind": "dependency-class-balance",
    "label": "Dependency class balance",
    "unit": "ratio",
    "guidance": "Buyer-visible absolute: Dependency class balance (material identity companion).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.01
  },
  {
    "measurementKind": "external-service-coupling",
    "label": "External service coupling",
    "unit": "services",
    "guidance": "Buyer-visible absolute: External service coupling (material identity companion).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.01
  },
  {
    "measurementKind": "contract-surface",
    "label": "Contract surface",
    "unit": "contracts",
    "guidance": "Buyer-visible absolute: Contract surface (material identity companion).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.01
  },
  {
    "measurementKind": "type-safety-pressure",
    "label": "Type-safety pressure",
    "unit": "ratio",
    "guidance": "Buyer-visible absolute: Type-safety pressure (material identity companion).",
    "family": "verification",
    "propertyClass": "verification",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.01
  },
  {
    "measurementKind": "observability-surface",
    "label": "Observability surface",
    "unit": "ratio",
    "guidance": "Buyer-visible absolute: Observability surface (material identity companion).",
    "family": "structure",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.008
  },
  {
    "measurementKind": "generated-code-mass",
    "label": "Generated-code mass",
    "unit": "ratio",
    "guidance": "Buyer-visible absolute: Generated-code mass (material identity companion).",
    "family": "hygiene",
    "propertyClass": "hygiene",
    "policyRole": "penalty",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.008
  },
  {
    "measurementKind": "test-as-spec",
    "label": "Test as specification",
    "unit": "ratio",
    "guidance": "Buyer-visible absolute: Test as specification (material identity companion).",
    "family": "verification",
    "propertyClass": "verification",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.01
  },
  {
    "measurementKind": "portability",
    "label": "Portability",
    "unit": "ratio",
    "guidance": "Buyer-visible absolute: Portability (material identity companion).",
    "family": "structure",
    "propertyClass": "quality",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.01
  },
  {
    "measurementKind": "architectural-pattern-density",
    "label": "Architectural pattern density",
    "unit": "ratio",
    "guidance": "Buyer-visible absolute: Architectural pattern density (material identity companion).",
    "family": "semantics",
    "propertyClass": "quality",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.01
  },
  {
    "measurementKind": "capability-surface",
    "label": "Capability surface",
    "unit": "capabilities",
    "guidance": "Buyer-visible absolute: Capability surface (material identity companion).",
    "family": "semantics",
    "propertyClass": "quantity",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.012
  },
  {
    "measurementKind": "copyleft-risk-mass",
    "label": "Copyleft risk mass",
    "unit": "ratio",
    "guidance": "Buyer-visible absolute: Copyleft risk mass (material identity companion).",
    "family": "hygiene",
    "propertyClass": "hygiene",
    "policyRole": "penalty",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.008
  },
  {
    "measurementKind": "change-intent-clarity",
    "label": "Change-intent clarity",
    "unit": "estimate",
    "guidance": "Buyer-visible absolute: Change-intent clarity (material identity companion).",
    "family": "semantics",
    "propertyClass": "quality",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.008
  },
  {
    "measurementKind": "data-architecture-clarity",
    "label": "Data-architecture clarity",
    "unit": "estimate",
    "guidance": "Buyer-visible absolute: Data-architecture clarity (material identity companion).",
    "family": "semantics",
    "propertyClass": "quality",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.008
  },
  {
    "measurementKind": "concurrency-model-clarity",
    "label": "Concurrency-model clarity",
    "unit": "estimate",
    "guidance": "Buyer-visible absolute: Concurrency-model clarity (material identity companion).",
    "family": "semantics",
    "propertyClass": "quality",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.008
  },
  {
    "measurementKind": "api-style-clarity",
    "label": "API-style clarity",
    "unit": "estimate",
    "guidance": "Buyer-visible absolute: API-style clarity (material identity companion).",
    "family": "semantics",
    "propertyClass": "quality",
    "policyRole": "weighted",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.01
  },
  {
    "measurementKind": "substitution-density",
    "label": "Substitution density",
    "unit": "ratio",
    "guidance": "Buyer-visible absolute: Substitution density (material identity companion).",
    "family": "value",
    "propertyClass": "value",
    "policyRole": "flag",
    "hasMagnitude": true,
    "inWeightedCatalog": true,
    "weight": 0.008
  }
] as DataPackAbsoluteKindSpec[];


/** Ensure Σ weights = 1 after catalog construction (rounding-safe). */
function renormCatalogWeights(specs: DataPackAbsoluteKindSpec[]): DataPackAbsoluteKindSpec[] {
  const sum = specs.reduce((s, r) => s + r.weight, 0);
  if (!(sum > 0)) return specs;
  const scaled = specs.map((r) => ({ ...r, weight: r.weight / sum }));
  // Fix residual on last row so sum is exact 1 within float.
  const sum2 = scaled.reduce((s, r) => s + r.weight, 0);
  const last = scaled[scaled.length - 1];
  if (last) last.weight = Number((last.weight + (1 - sum2)).toFixed(12));
  return scaled.map((r) => ({ ...r, weight: Number(r.weight.toFixed(6)), inWeightedCatalog: true as const, hasMagnitude: true as const }));
}

// Re-export renormed catalogue as the law array.
const _RAW_SPECS = DATA_PACK_ABSOLUTE_KIND_SPECS;
// mutate in place for module init
{
  const fixed = renormCatalogWeights(_RAW_SPECS as DataPackAbsoluteKindSpec[]);
  for (let i = 0; i < fixed.length; i++) {
    (_RAW_SPECS as DataPackAbsoluteKindSpec[])[i] = fixed[i];
  }
}

/** Commercial absolute catalogue — full vocabulary, Σ weights = 1. */
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
  const expectedLen = DATA_PACK_ABSOLUTE_KIND_SPECS.length;
  if (DATA_PACK_ABSOLUTES_CATALOG.length !== expectedLen) {
    throw new Error(
      `DATA_PACK_ABSOLUTES_CATALOG length ${DATA_PACK_ABSOLUTES_CATALOG.length}, expected ${expectedLen}`,
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
