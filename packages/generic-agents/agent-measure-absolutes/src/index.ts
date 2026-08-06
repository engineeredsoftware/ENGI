/**
 * @bitcode/generic-agents-agent-measure-absolutes
 *
 * Registers and runs bare absolute measures for a synthesized **DataPack**.
 */
import { factoryAbsolutesMeasureAgent as factoryAbsolutesMeasureAgentBase } from './factory-absolutes-measure-agent';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';
import {
  DATA_PACK_ABSOLUTES_CATALOG,
  DATA_PACK_ABSOLUTE_KIND_SPECS,
  assertDataPackAbsolutesCatalogWeights,
} from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';

import { measureAbsoluteFunctionCount } from '@bitcode/generic-measurements-absolutes-function-count';
import { measureAbsoluteTypeCount } from '@bitcode/generic-measurements-absolutes-type-count';
import { measureAbsoluteFileSpan } from '@bitcode/generic-measurements-absolutes-file-span';
import { measureAbsoluteSymbolicRichness } from '@bitcode/generic-measurements-absolutes-symbolic-richness';
import { measureAbsoluteModularity } from '@bitcode/generic-measurements-absolutes-modularity';
import { measureAbsoluteLangSpan } from '@bitcode/generic-measurements-absolutes-lang-span';
import { measureAbsoluteTestSurface } from '@bitcode/generic-measurements-absolutes-test-surface';
import { measureAbsoluteApiSurface } from '@bitcode/generic-measurements-absolutes-api-surface';
import { measureAbsoluteDependencySpan } from '@bitcode/generic-measurements-absolutes-dependency-span';
import { measureAbsoluteDocSignal } from '@bitcode/generic-measurements-absolutes-doc-signal';
import { measureAbsoluteDataFlowDepth } from '@bitcode/generic-measurements-absolutes-data-flow-depth';
import { measureAbsoluteSymbolConnectivity } from '@bitcode/generic-measurements-absolutes-symbol-connectivity';
import { measureAbsoluteControlComplexity } from '@bitcode/generic-measurements-absolutes-control-complexity';
import { measureAbsoluteConfigSurface } from '@bitcode/generic-measurements-absolutes-config-surface';
import { measureAbsoluteBuildability } from '@bitcode/generic-measurements-absolutes-buildability';
import { measureAbsoluteTestPassRate } from '@bitcode/generic-measurements-absolutes-test-pass-rate';
import { measureAbsoluteTestCoverage } from '@bitcode/generic-measurements-absolutes-test-coverage';
import { measureAbsoluteTestStrength } from '@bitcode/generic-measurements-absolutes-test-strength';
import { measureAbsoluteRuntimeCleanliness } from '@bitcode/generic-measurements-absolutes-runtime-cleanliness';
import { measureAbsoluteReproducibility } from '@bitcode/generic-measurements-absolutes-reproducibility';
import { measureAbsoluteSecretSafety } from '@bitcode/generic-measurements-absolutes-secret-safety';
import { measureAbsolutePiiExposure } from '@bitcode/generic-measurements-absolutes-pii-exposure';
import { measureAbsoluteSecurityCleanliness } from '@bitcode/generic-measurements-absolutes-security-cleanliness';
import { measureAbsoluteDependencyHealth } from '@bitcode/generic-measurements-absolutes-dependency-health';
import { measureAbsoluteLicenseCleanliness } from '@bitcode/generic-measurements-absolutes-license-cleanliness';
import { measureAbsoluteDuplicationInternal } from '@bitcode/generic-measurements-absolutes-duplication-internal';
import { measureAbsoluteDeadCodeRatio } from '@bitcode/generic-measurements-absolutes-dead-code-ratio';
import { measureAbsoluteOriginality } from '@bitcode/generic-measurements-absolutes-originality';
import { measureAbsoluteSemanticNovelty } from '@bitcode/generic-measurements-absolutes-semantic-novelty';
import { measureAbsoluteContamination } from '@bitcode/generic-measurements-absolutes-contamination';
import { measureAbsoluteAuthorshipConsistency } from '@bitcode/generic-measurements-absolutes-authorship-consistency';
import { measureAbsoluteProvenanceIntegrity } from '@bitcode/generic-measurements-absolutes-provenance-integrity';
import { measureAbsoluteAiGeneratedLikelihood } from '@bitcode/generic-measurements-absolutes-ai-generated-likelihood';
import { measureAbsoluteCorrectnessEstimate } from '@bitcode/generic-measurements-absolutes-correctness-estimate';
import { measureAbsoluteObjectivesFidelity } from '@bitcode/generic-measurements-absolutes-objectives-fidelity';
import { measureAbsoluteComputationalUsage } from '@bitcode/generic-measurements-absolutes-computational-usage';
import { measureAbsoluteCoherence } from '@bitcode/generic-measurements-absolutes-coherence';
import { measureAbsoluteCompleteness } from '@bitcode/generic-measurements-absolutes-completeness';
import { measureAbsoluteCapabilityClarity } from '@bitcode/generic-measurements-absolutes-capability-clarity';
import { measureAbsoluteDocumentationAlignment } from '@bitcode/generic-measurements-absolutes-documentation-alignment';
import { measureAbsoluteDifficulty } from '@bitcode/generic-measurements-absolutes-difficulty';
import { measureAbsoluteIrreducibility } from '@bitcode/generic-measurements-absolutes-irreducibility';
import { measureAbsoluteInformationContent } from '@bitcode/generic-measurements-absolutes-information-content';
import { measureAbsoluteRlObjectCompleteness } from '@bitcode/generic-measurements-absolutes-rl-object-completeness';
import { measureAbsoluteTrajectoryRichness } from '@bitcode/generic-measurements-absolutes-trajectory-richness';
import { measureAbsoluteDiversityContribution } from '@bitcode/generic-measurements-absolutes-diversity-contribution';
import { measureAbsoluteLanguageConcentration } from '@bitcode/generic-measurements-absolutes-language-concentration';
import { measureAbsoluteFrameworkSurface } from '@bitcode/generic-measurements-absolutes-framework-surface';
import { measureAbsolutePurposeClarity } from '@bitcode/generic-measurements-absolutes-purpose-clarity';
import { measureAbsoluteDependencyClassBalance } from '@bitcode/generic-measurements-absolutes-dependency-class-balance';
import { measureAbsoluteExternalServiceCoupling } from '@bitcode/generic-measurements-absolutes-external-service-coupling';
import { measureAbsoluteContractSurface } from '@bitcode/generic-measurements-absolutes-contract-surface';
import { measureAbsoluteTypeSafetyPressure } from '@bitcode/generic-measurements-absolutes-type-safety-pressure';
import { measureAbsoluteObservabilitySurface } from '@bitcode/generic-measurements-absolutes-observability-surface';
import { measureAbsoluteGeneratedCodeMass } from '@bitcode/generic-measurements-absolutes-generated-code-mass';
import { measureAbsoluteTestAsSpec } from '@bitcode/generic-measurements-absolutes-test-as-spec';
import { measureAbsolutePortability } from '@bitcode/generic-measurements-absolutes-portability';
import { measureAbsoluteArchitecturalPatternDensity } from '@bitcode/generic-measurements-absolutes-architectural-pattern-density';
import { measureAbsoluteCapabilitySurface } from '@bitcode/generic-measurements-absolutes-capability-surface';
import { measureAbsoluteCopyleftRiskMass } from '@bitcode/generic-measurements-absolutes-copyleft-risk-mass';
import { measureAbsoluteChangeIntentClarity } from '@bitcode/generic-measurements-absolutes-change-intent-clarity';
import { measureAbsoluteDataArchitectureClarity } from '@bitcode/generic-measurements-absolutes-data-architecture-clarity';
import { measureAbsoluteConcurrencyModelClarity } from '@bitcode/generic-measurements-absolutes-concurrency-model-clarity';
import { measureAbsoluteApiStyleClarity } from '@bitcode/generic-measurements-absolutes-api-style-clarity';
import { measureAbsoluteSubstitutionDensity } from '@bitcode/generic-measurements-absolutes-substitution-density';

export { factoryAbsolutesMeasureAgentBase as factoryAbsolutesMeasureAgent };
export type {
  AbsolutesMeasureAgent,
  AbsolutesMeasureAgentConfig,
} from './factory-absolutes-measure-agent';
export {
  ABSOLUTES_CATEGORY_FRAMING,
  ABSOLUTES_QUANTITY_TOOL_KINDS,
  absoluteMeasureToolKeyForKind,
  listQuantityAbsoluteMeasureToolKeys,
  listWeightedQuantityAbsoluteMeasureToolKeys,
} from './factory-absolutes-measure-agent';

export {
  DATA_PACK_ABSOLUTES_CATALOG,
  DATA_PACK_ABSOLUTE_KIND_SPECS,
  assertDataPackAbsolutesCatalogWeights,
};

/** Full commercial catalogue registry — length = DATA_PACK_ABSOLUTES_CATALOG. */
export const ABSOLUTE_MEASURE_REGISTRY: Array<{
  kind: string;
  measure: (input: DataPackAbsoluteMeasureInput) => AbsoluteMeasureResult;
}> = [
  { kind: 'function-count', measure: measureAbsoluteFunctionCount },
  { kind: 'type-count', measure: measureAbsoluteTypeCount },
  { kind: 'file-span', measure: measureAbsoluteFileSpan },
  { kind: 'symbolic-richness', measure: measureAbsoluteSymbolicRichness },
  { kind: 'modularity', measure: measureAbsoluteModularity },
  { kind: 'lang-span', measure: measureAbsoluteLangSpan },
  { kind: 'test-surface', measure: measureAbsoluteTestSurface },
  { kind: 'api-surface', measure: measureAbsoluteApiSurface },
  { kind: 'dependency-span', measure: measureAbsoluteDependencySpan },
  { kind: 'doc-signal', measure: measureAbsoluteDocSignal },
  { kind: 'data-flow-depth', measure: measureAbsoluteDataFlowDepth },
  { kind: 'symbol-connectivity', measure: measureAbsoluteSymbolConnectivity },
  { kind: 'control-complexity', measure: measureAbsoluteControlComplexity },
  { kind: 'config-surface', measure: measureAbsoluteConfigSurface },
  { kind: 'buildability', measure: measureAbsoluteBuildability },
  { kind: 'test-pass-rate', measure: measureAbsoluteTestPassRate },
  { kind: 'test-coverage', measure: measureAbsoluteTestCoverage },
  { kind: 'test-strength', measure: measureAbsoluteTestStrength },
  { kind: 'runtime-cleanliness', measure: measureAbsoluteRuntimeCleanliness },
  { kind: 'reproducibility', measure: measureAbsoluteReproducibility },
  { kind: 'secret-safety', measure: measureAbsoluteSecretSafety },
  { kind: 'pii-exposure', measure: measureAbsolutePiiExposure },
  { kind: 'security-cleanliness', measure: measureAbsoluteSecurityCleanliness },
  { kind: 'dependency-health', measure: measureAbsoluteDependencyHealth },
  { kind: 'license-cleanliness', measure: measureAbsoluteLicenseCleanliness },
  { kind: 'duplication-internal', measure: measureAbsoluteDuplicationInternal },
  { kind: 'dead-code-ratio', measure: measureAbsoluteDeadCodeRatio },
  { kind: 'originality', measure: measureAbsoluteOriginality },
  { kind: 'semantic-novelty', measure: measureAbsoluteSemanticNovelty },
  { kind: 'contamination', measure: measureAbsoluteContamination },
  { kind: 'authorship-consistency', measure: measureAbsoluteAuthorshipConsistency },
  { kind: 'provenance-integrity', measure: measureAbsoluteProvenanceIntegrity },
  { kind: 'ai-generated-likelihood', measure: measureAbsoluteAiGeneratedLikelihood },
  { kind: 'correctness-estimate', measure: measureAbsoluteCorrectnessEstimate },
  { kind: 'objectives-fidelity', measure: measureAbsoluteObjectivesFidelity },
  { kind: 'computational-usage', measure: measureAbsoluteComputationalUsage },
  { kind: 'coherence', measure: measureAbsoluteCoherence },
  { kind: 'completeness', measure: measureAbsoluteCompleteness },
  { kind: 'capability-clarity', measure: measureAbsoluteCapabilityClarity },
  { kind: 'documentation-alignment', measure: measureAbsoluteDocumentationAlignment },
  { kind: 'difficulty', measure: measureAbsoluteDifficulty },
  { kind: 'irreducibility', measure: measureAbsoluteIrreducibility },
  { kind: 'information-content', measure: measureAbsoluteInformationContent },
  { kind: 'rl-object-completeness', measure: measureAbsoluteRlObjectCompleteness },
  { kind: 'trajectory-richness', measure: measureAbsoluteTrajectoryRichness },
  { kind: 'diversity-contribution', measure: measureAbsoluteDiversityContribution },
  { kind: 'language-concentration', measure: measureAbsoluteLanguageConcentration },
  { kind: 'framework-surface', measure: measureAbsoluteFrameworkSurface },
  { kind: 'purpose-clarity', measure: measureAbsolutePurposeClarity },
  { kind: 'dependency-class-balance', measure: measureAbsoluteDependencyClassBalance },
  { kind: 'external-service-coupling', measure: measureAbsoluteExternalServiceCoupling },
  { kind: 'contract-surface', measure: measureAbsoluteContractSurface },
  { kind: 'type-safety-pressure', measure: measureAbsoluteTypeSafetyPressure },
  { kind: 'observability-surface', measure: measureAbsoluteObservabilitySurface },
  { kind: 'generated-code-mass', measure: measureAbsoluteGeneratedCodeMass },
  { kind: 'test-as-spec', measure: measureAbsoluteTestAsSpec },
  { kind: 'portability', measure: measureAbsolutePortability },
  { kind: 'architectural-pattern-density', measure: measureAbsoluteArchitecturalPatternDensity },
  { kind: 'capability-surface', measure: measureAbsoluteCapabilitySurface },
  { kind: 'copyleft-risk-mass', measure: measureAbsoluteCopyleftRiskMass },
  { kind: 'change-intent-clarity', measure: measureAbsoluteChangeIntentClarity },
  { kind: 'data-architecture-clarity', measure: measureAbsoluteDataArchitectureClarity },
  { kind: 'concurrency-model-clarity', measure: measureAbsoluteConcurrencyModelClarity },
  { kind: 'api-style-clarity', measure: measureAbsoluteApiStyleClarity },
  { kind: 'substitution-density', measure: measureAbsoluteSubstitutionDensity },
];

export function listAbsoluteMeasureKinds(): string[] {
  return ABSOLUTE_MEASURE_REGISTRY.map((e) => e.kind);
}

/** Run every bare absolute measure (registry = full commercial catalogue). */
export function measureDataPackAllAbsolutes(
  input: DataPackAbsoluteMeasureInput,
): AbsoluteMeasureResult[] {
  return ABSOLUTE_MEASURE_REGISTRY.map((e) => e.measure(input));
}

/**
 * Commercial absolute readings for a DataPack — full catalogue with weights.
 * Missing host signals → volume 0 / insufficient_evidence, still present.
 * Companion identity scalars prefer staticSignals from material-identity host.
 */
export function measureDataPackAbsoluteReadings(input: DataPackAbsoluteMeasureInput) {
  assertDataPackAbsolutesCatalogWeights();
  const byKind = new Map(measureDataPackAllAbsolutes(input).map((r) => [r.measurementKind, r]));
  return DATA_PACK_ABSOLUTES_CATALOG.map((spec) => {
    const reading = byKind.get(spec.measurementKind);
    const volume = reading?.volume ?? 0;
    const magnitude =
      typeof reading?.magnitude === 'number' ? reading.magnitude : volume;
    return {
      measurementKind: spec.measurementKind,
      label: spec.label,
      weight: spec.weight,
      volume,
      magnitude,
      unit: spec.unit,
      category: 'absolute' as const,
      rationale: reading?.rationale,
      status: reading?.status ?? 'insufficient_evidence',
    };
  });
}

/**
 * @deprecated Alias of measureDataPackAllAbsolutes — "weighted" no longer subsets to 11.
 */
export function measureDataPackWeightedAbsolutes(
  input: DataPackAbsoluteMeasureInput,
): AbsoluteMeasureResult[] {
  return measureDataPackAllAbsolutes(input);
}

/**
 * @deprecated Prefer measureDataPackAbsoluteReadings — "weighted" no longer means 11.
 */
export function measureDataPackWeightedAbsoluteReadings(
  input: DataPackAbsoluteMeasureInput,
) {
  return measureDataPackAbsoluteReadings(input);
}


export {
  registerAbsoluteMeasureTools,
  listAbsoluteMeasureToolKeys,
  type AbsoluteMeasureToolsHost,
} from './register-absolute-measure-tools';
