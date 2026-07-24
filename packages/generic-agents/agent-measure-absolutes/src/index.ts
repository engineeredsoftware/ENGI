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

import { measureAbsoluteAiGeneratedLikelihood } from '@bitcode/generic-measurements-absolutes-ai-generated-likelihood';
import { measureAbsoluteApiSurface } from '@bitcode/generic-measurements-absolutes-api-surface';
import { measureAbsoluteAuthorshipConsistency } from '@bitcode/generic-measurements-absolutes-authorship-consistency';
import { measureAbsoluteBuildability } from '@bitcode/generic-measurements-absolutes-buildability';
import { measureAbsoluteCapabilityClarity } from '@bitcode/generic-measurements-absolutes-capability-clarity';
import { measureAbsoluteCoherence } from '@bitcode/generic-measurements-absolutes-coherence';
import { measureAbsoluteCompleteness } from '@bitcode/generic-measurements-absolutes-completeness';
import { measureAbsoluteComputationalUsage } from '@bitcode/generic-measurements-absolutes-computational-usage';
import { measureAbsoluteConfigSurface } from '@bitcode/generic-measurements-absolutes-config-surface';
import { measureAbsoluteContamination } from '@bitcode/generic-measurements-absolutes-contamination';
import { measureAbsoluteControlComplexity } from '@bitcode/generic-measurements-absolutes-control-complexity';
import { measureAbsoluteCorrectnessEstimate } from '@bitcode/generic-measurements-absolutes-correctness-estimate';
import { measureAbsoluteDataFlowDepth } from '@bitcode/generic-measurements-absolutes-data-flow-depth';
import { measureAbsoluteDeadCodeRatio } from '@bitcode/generic-measurements-absolutes-dead-code-ratio';
import { measureAbsoluteDependencyHealth } from '@bitcode/generic-measurements-absolutes-dependency-health';
import { measureAbsoluteDependencySpan } from '@bitcode/generic-measurements-absolutes-dependency-span';
import { measureAbsoluteDifficulty } from '@bitcode/generic-measurements-absolutes-difficulty';
import { measureAbsoluteDiversityContribution } from '@bitcode/generic-measurements-absolutes-diversity-contribution';
import { measureAbsoluteDocSignal } from '@bitcode/generic-measurements-absolutes-doc-signal';
import { measureAbsoluteDocumentationAlignment } from '@bitcode/generic-measurements-absolutes-documentation-alignment';
import { measureAbsoluteDuplicationInternal } from '@bitcode/generic-measurements-absolutes-duplication-internal';
import { measureAbsoluteFileSpan } from '@bitcode/generic-measurements-absolutes-file-span';
import { measureAbsoluteFunctionCount } from '@bitcode/generic-measurements-absolutes-function-count';
import { measureAbsoluteInformationContent } from '@bitcode/generic-measurements-absolutes-information-content';
import { measureAbsoluteIrreducibility } from '@bitcode/generic-measurements-absolutes-irreducibility';
import { measureAbsoluteLangSpan } from '@bitcode/generic-measurements-absolutes-lang-span';
import { measureAbsoluteLicenseCleanliness } from '@bitcode/generic-measurements-absolutes-license-cleanliness';
import { measureAbsoluteModularity } from '@bitcode/generic-measurements-absolutes-modularity';
import { measureAbsoluteObjectivesFidelity } from '@bitcode/generic-measurements-absolutes-objectives-fidelity';
import { measureAbsoluteOriginality } from '@bitcode/generic-measurements-absolutes-originality';
import { measureAbsolutePiiExposure } from '@bitcode/generic-measurements-absolutes-pii-exposure';
import { measureAbsoluteProvenanceIntegrity } from '@bitcode/generic-measurements-absolutes-provenance-integrity';
import { measureAbsoluteReproducibility } from '@bitcode/generic-measurements-absolutes-reproducibility';
import { measureAbsoluteRlObjectCompleteness } from '@bitcode/generic-measurements-absolutes-rl-object-completeness';
import { measureAbsoluteRuntimeCleanliness } from '@bitcode/generic-measurements-absolutes-runtime-cleanliness';
import { measureAbsoluteSecretSafety } from '@bitcode/generic-measurements-absolutes-secret-safety';
import { measureAbsoluteSecurityCleanliness } from '@bitcode/generic-measurements-absolutes-security-cleanliness';
import { measureAbsoluteSemanticNovelty } from '@bitcode/generic-measurements-absolutes-semantic-novelty';
import { measureAbsoluteSymbolConnectivity } from '@bitcode/generic-measurements-absolutes-symbol-connectivity';
import { measureAbsoluteSymbolicRichness } from '@bitcode/generic-measurements-absolutes-symbolic-richness';
import { measureAbsoluteTestCoverage } from '@bitcode/generic-measurements-absolutes-test-coverage';
import { measureAbsoluteTestPassRate } from '@bitcode/generic-measurements-absolutes-test-pass-rate';
import { measureAbsoluteTestStrength } from '@bitcode/generic-measurements-absolutes-test-strength';
import { measureAbsoluteTestSurface } from '@bitcode/generic-measurements-absolutes-test-surface';
import { measureAbsoluteTrajectoryRichness } from '@bitcode/generic-measurements-absolutes-trajectory-richness';
import { measureAbsoluteTypeCount } from '@bitcode/generic-measurements-absolutes-type-count';

export { factoryAbsolutesMeasureAgentBase as factoryAbsolutesMeasureAgent };
export type { AbsolutesMeasureAgent, AbsolutesMeasureAgentConfig } from './factory-absolutes-measure-agent';
export { ABSOLUTES_CATEGORY_FRAMING } from './factory-absolutes-measure-agent';

export {
  DATA_PACK_ABSOLUTES_CATALOG,
  DATA_PACK_ABSOLUTE_KIND_SPECS,
  assertDataPackAbsolutesCatalogWeights,
};

export const ABSOLUTE_MEASURE_REGISTRY: Array<{
  kind: string;
  measure: (input: DataPackAbsoluteMeasureInput) => AbsoluteMeasureResult;
}> = [
  { kind: 'ai-generated-likelihood', measure: measureAbsoluteAiGeneratedLikelihood },
  { kind: 'api-surface', measure: measureAbsoluteApiSurface },
  { kind: 'authorship-consistency', measure: measureAbsoluteAuthorshipConsistency },
  { kind: 'buildability', measure: measureAbsoluteBuildability },
  { kind: 'capability-clarity', measure: measureAbsoluteCapabilityClarity },
  { kind: 'coherence', measure: measureAbsoluteCoherence },
  { kind: 'completeness', measure: measureAbsoluteCompleteness },
  { kind: 'computational-usage', measure: measureAbsoluteComputationalUsage },
  { kind: 'config-surface', measure: measureAbsoluteConfigSurface },
  { kind: 'contamination', measure: measureAbsoluteContamination },
  { kind: 'control-complexity', measure: measureAbsoluteControlComplexity },
  { kind: 'correctness-estimate', measure: measureAbsoluteCorrectnessEstimate },
  { kind: 'data-flow-depth', measure: measureAbsoluteDataFlowDepth },
  { kind: 'dead-code-ratio', measure: measureAbsoluteDeadCodeRatio },
  { kind: 'dependency-health', measure: measureAbsoluteDependencyHealth },
  { kind: 'dependency-span', measure: measureAbsoluteDependencySpan },
  { kind: 'difficulty', measure: measureAbsoluteDifficulty },
  { kind: 'diversity-contribution', measure: measureAbsoluteDiversityContribution },
  { kind: 'doc-signal', measure: measureAbsoluteDocSignal },
  { kind: 'documentation-alignment', measure: measureAbsoluteDocumentationAlignment },
  { kind: 'duplication-internal', measure: measureAbsoluteDuplicationInternal },
  { kind: 'file-span', measure: measureAbsoluteFileSpan },
  { kind: 'function-count', measure: measureAbsoluteFunctionCount },
  { kind: 'information-content', measure: measureAbsoluteInformationContent },
  { kind: 'irreducibility', measure: measureAbsoluteIrreducibility },
  { kind: 'lang-span', measure: measureAbsoluteLangSpan },
  { kind: 'license-cleanliness', measure: measureAbsoluteLicenseCleanliness },
  { kind: 'modularity', measure: measureAbsoluteModularity },
  { kind: 'objectives-fidelity', measure: measureAbsoluteObjectivesFidelity },
  { kind: 'originality', measure: measureAbsoluteOriginality },
  { kind: 'pii-exposure', measure: measureAbsolutePiiExposure },
  { kind: 'provenance-integrity', measure: measureAbsoluteProvenanceIntegrity },
  { kind: 'reproducibility', measure: measureAbsoluteReproducibility },
  { kind: 'rl-object-completeness', measure: measureAbsoluteRlObjectCompleteness },
  { kind: 'runtime-cleanliness', measure: measureAbsoluteRuntimeCleanliness },
  { kind: 'secret-safety', measure: measureAbsoluteSecretSafety },
  { kind: 'security-cleanliness', measure: measureAbsoluteSecurityCleanliness },
  { kind: 'semantic-novelty', measure: measureAbsoluteSemanticNovelty },
  { kind: 'symbol-connectivity', measure: measureAbsoluteSymbolConnectivity },
  { kind: 'symbolic-richness', measure: measureAbsoluteSymbolicRichness },
  { kind: 'test-coverage', measure: measureAbsoluteTestCoverage },
  { kind: 'test-pass-rate', measure: measureAbsoluteTestPassRate },
  { kind: 'test-strength', measure: measureAbsoluteTestStrength },
  { kind: 'test-surface', measure: measureAbsoluteTestSurface },
  { kind: 'trajectory-richness', measure: measureAbsoluteTrajectoryRichness },
  { kind: 'type-count', measure: measureAbsoluteTypeCount },
];

export function listAbsoluteMeasureKinds(): string[] {
  return ABSOLUTE_MEASURE_REGISTRY.map((e) => e.kind);
}

export function measureDataPackAllAbsolutes(
  input: DataPackAbsoluteMeasureInput,
): AbsoluteMeasureResult[] {
  return ABSOLUTE_MEASURE_REGISTRY.map((e) => e.measure(input));
}

export function measureDataPackWeightedAbsolutes(
  input: DataPackAbsoluteMeasureInput,
): AbsoluteMeasureResult[] {
  const weighted = new Set(DATA_PACK_ABSOLUTES_CATALOG.map((s) => s.measurementKind));
  return ABSOLUTE_MEASURE_REGISTRY.filter((e) => weighted.has(e.kind)).map((e) => e.measure(input));
}

export function measureDataPackWeightedAbsoluteReadings(
  input: DataPackAbsoluteMeasureInput,
) {
  assertDataPackAbsolutesCatalogWeights();
  const byKind = new Map(measureDataPackWeightedAbsolutes(input).map((r) => [r.measurementKind, r]));
  return DATA_PACK_ABSOLUTES_CATALOG.map((spec) => {
    const reading = byKind.get(spec.measurementKind);
    const volume = reading?.volume ?? 0;
    const magnitude =
      typeof reading?.magnitude === 'number' ? reading.magnitude : volume;
    return {
      measurementKind: spec.measurementKind,
      label: spec.label,
      weight: spec.weight ?? 0,
      volume,
      magnitude,
      unit: spec.unit,
      category: 'absolute' as const,
      rationale: reading?.rationale,
      status: reading?.status ?? 'insufficient_evidence',
    };
  });
}
