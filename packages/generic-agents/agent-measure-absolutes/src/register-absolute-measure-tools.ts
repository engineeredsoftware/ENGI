/**
 * Register all absolute measure Execution tools on an execution tools registry.
 * Keys are measure:absolute:<kind>.
 *
 * Built from bare absolute packages (not tool-measure-* packages) so this module
 * never forms a cycle with @bitcode/agent-generics barrel re-exports.
 * Tool packages under generic-tools/tool-measure-* remain the 1:1 tool surface
 * for direct registry use; the agent base owns registration here.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import type {
  DataPackAbsoluteMeasureInput,
  AbsoluteMeasureResult,
} from '@bitcode/generic-measurements-shared-absolute-measure-input';
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

export type AbsoluteMeasureToolsHost = {
  tools?: {
    registerTool?: (key: string, tool: unknown, priority?: number) => void;
  };
};

const ABSOLUTE_MEASURE_TOOL_FACTORIES: Array<{ key: string; create: () => unknown }> = [
  {
    key: "measure:absolute:function-count",
    create: () => {
      class ToolMeasureFunctionCount extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteFunctionCount(args);
      }
      return new ToolMeasureFunctionCount();
    },
  },
  {
    key: "measure:absolute:type-count",
    create: () => {
      class ToolMeasureTypeCount extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteTypeCount(args);
      }
      return new ToolMeasureTypeCount();
    },
  },
  {
    key: "measure:absolute:file-span",
    create: () => {
      class ToolMeasureFileSpan extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteFileSpan(args);
      }
      return new ToolMeasureFileSpan();
    },
  },
  {
    key: "measure:absolute:symbolic-richness",
    create: () => {
      class ToolMeasureSymbolicRichness extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteSymbolicRichness(args);
      }
      return new ToolMeasureSymbolicRichness();
    },
  },
  {
    key: "measure:absolute:modularity",
    create: () => {
      class ToolMeasureModularity extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteModularity(args);
      }
      return new ToolMeasureModularity();
    },
  },
  {
    key: "measure:absolute:lang-span",
    create: () => {
      class ToolMeasureLangSpan extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteLangSpan(args);
      }
      return new ToolMeasureLangSpan();
    },
  },
  {
    key: "measure:absolute:test-surface",
    create: () => {
      class ToolMeasureTestSurface extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteTestSurface(args);
      }
      return new ToolMeasureTestSurface();
    },
  },
  {
    key: "measure:absolute:api-surface",
    create: () => {
      class ToolMeasureApiSurface extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteApiSurface(args);
      }
      return new ToolMeasureApiSurface();
    },
  },
  {
    key: "measure:absolute:dependency-span",
    create: () => {
      class ToolMeasureDependencySpan extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteDependencySpan(args);
      }
      return new ToolMeasureDependencySpan();
    },
  },
  {
    key: "measure:absolute:doc-signal",
    create: () => {
      class ToolMeasureDocSignal extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteDocSignal(args);
      }
      return new ToolMeasureDocSignal();
    },
  },
  {
    key: "measure:absolute:data-flow-depth",
    create: () => {
      class ToolMeasureDataFlowDepth extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteDataFlowDepth(args);
      }
      return new ToolMeasureDataFlowDepth();
    },
  },
  {
    key: "measure:absolute:symbol-connectivity",
    create: () => {
      class ToolMeasureSymbolConnectivity extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteSymbolConnectivity(args);
      }
      return new ToolMeasureSymbolConnectivity();
    },
  },
  {
    key: "measure:absolute:control-complexity",
    create: () => {
      class ToolMeasureControlComplexity extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteControlComplexity(args);
      }
      return new ToolMeasureControlComplexity();
    },
  },
  {
    key: "measure:absolute:config-surface",
    create: () => {
      class ToolMeasureConfigSurface extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteConfigSurface(args);
      }
      return new ToolMeasureConfigSurface();
    },
  },
  {
    key: "measure:absolute:buildability",
    create: () => {
      class ToolMeasureBuildability extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteBuildability(args);
      }
      return new ToolMeasureBuildability();
    },
  },
  {
    key: "measure:absolute:test-pass-rate",
    create: () => {
      class ToolMeasureTestPassRate extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteTestPassRate(args);
      }
      return new ToolMeasureTestPassRate();
    },
  },
  {
    key: "measure:absolute:test-coverage",
    create: () => {
      class ToolMeasureTestCoverage extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteTestCoverage(args);
      }
      return new ToolMeasureTestCoverage();
    },
  },
  {
    key: "measure:absolute:test-strength",
    create: () => {
      class ToolMeasureTestStrength extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteTestStrength(args);
      }
      return new ToolMeasureTestStrength();
    },
  },
  {
    key: "measure:absolute:runtime-cleanliness",
    create: () => {
      class ToolMeasureRuntimeCleanliness extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteRuntimeCleanliness(args);
      }
      return new ToolMeasureRuntimeCleanliness();
    },
  },
  {
    key: "measure:absolute:reproducibility",
    create: () => {
      class ToolMeasureReproducibility extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteReproducibility(args);
      }
      return new ToolMeasureReproducibility();
    },
  },
  {
    key: "measure:absolute:secret-safety",
    create: () => {
      class ToolMeasureSecretSafety extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteSecretSafety(args);
      }
      return new ToolMeasureSecretSafety();
    },
  },
  {
    key: "measure:absolute:pii-exposure",
    create: () => {
      class ToolMeasurePiiExposure extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsolutePiiExposure(args);
      }
      return new ToolMeasurePiiExposure();
    },
  },
  {
    key: "measure:absolute:security-cleanliness",
    create: () => {
      class ToolMeasureSecurityCleanliness extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteSecurityCleanliness(args);
      }
      return new ToolMeasureSecurityCleanliness();
    },
  },
  {
    key: "measure:absolute:dependency-health",
    create: () => {
      class ToolMeasureDependencyHealth extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteDependencyHealth(args);
      }
      return new ToolMeasureDependencyHealth();
    },
  },
  {
    key: "measure:absolute:license-cleanliness",
    create: () => {
      class ToolMeasureLicenseCleanliness extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteLicenseCleanliness(args);
      }
      return new ToolMeasureLicenseCleanliness();
    },
  },
  {
    key: "measure:absolute:duplication-internal",
    create: () => {
      class ToolMeasureDuplicationInternal extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteDuplicationInternal(args);
      }
      return new ToolMeasureDuplicationInternal();
    },
  },
  {
    key: "measure:absolute:dead-code-ratio",
    create: () => {
      class ToolMeasureDeadCodeRatio extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteDeadCodeRatio(args);
      }
      return new ToolMeasureDeadCodeRatio();
    },
  },
  {
    key: "measure:absolute:originality",
    create: () => {
      class ToolMeasureOriginality extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteOriginality(args);
      }
      return new ToolMeasureOriginality();
    },
  },
  {
    key: "measure:absolute:semantic-novelty",
    create: () => {
      class ToolMeasureSemanticNovelty extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteSemanticNovelty(args);
      }
      return new ToolMeasureSemanticNovelty();
    },
  },
  {
    key: "measure:absolute:contamination",
    create: () => {
      class ToolMeasureContamination extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteContamination(args);
      }
      return new ToolMeasureContamination();
    },
  },
  {
    key: "measure:absolute:authorship-consistency",
    create: () => {
      class ToolMeasureAuthorshipConsistency extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteAuthorshipConsistency(args);
      }
      return new ToolMeasureAuthorshipConsistency();
    },
  },
  {
    key: "measure:absolute:provenance-integrity",
    create: () => {
      class ToolMeasureProvenanceIntegrity extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteProvenanceIntegrity(args);
      }
      return new ToolMeasureProvenanceIntegrity();
    },
  },
  {
    key: "measure:absolute:ai-generated-likelihood",
    create: () => {
      class ToolMeasureAiGeneratedLikelihood extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteAiGeneratedLikelihood(args);
      }
      return new ToolMeasureAiGeneratedLikelihood();
    },
  },
  {
    key: "measure:absolute:correctness-estimate",
    create: () => {
      class ToolMeasureCorrectnessEstimate extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteCorrectnessEstimate(args);
      }
      return new ToolMeasureCorrectnessEstimate();
    },
  },
  {
    key: "measure:absolute:objectives-fidelity",
    create: () => {
      class ToolMeasureObjectivesFidelity extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteObjectivesFidelity(args);
      }
      return new ToolMeasureObjectivesFidelity();
    },
  },
  {
    key: "measure:absolute:computational-usage",
    create: () => {
      class ToolMeasureComputationalUsage extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteComputationalUsage(args);
      }
      return new ToolMeasureComputationalUsage();
    },
  },
  {
    key: "measure:absolute:coherence",
    create: () => {
      class ToolMeasureCoherence extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteCoherence(args);
      }
      return new ToolMeasureCoherence();
    },
  },
  {
    key: "measure:absolute:completeness",
    create: () => {
      class ToolMeasureCompleteness extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteCompleteness(args);
      }
      return new ToolMeasureCompleteness();
    },
  },
  {
    key: "measure:absolute:capability-clarity",
    create: () => {
      class ToolMeasureCapabilityClarity extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteCapabilityClarity(args);
      }
      return new ToolMeasureCapabilityClarity();
    },
  },
  {
    key: "measure:absolute:documentation-alignment",
    create: () => {
      class ToolMeasureDocumentationAlignment extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteDocumentationAlignment(args);
      }
      return new ToolMeasureDocumentationAlignment();
    },
  },
  {
    key: "measure:absolute:difficulty",
    create: () => {
      class ToolMeasureDifficulty extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteDifficulty(args);
      }
      return new ToolMeasureDifficulty();
    },
  },
  {
    key: "measure:absolute:irreducibility",
    create: () => {
      class ToolMeasureIrreducibility extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteIrreducibility(args);
      }
      return new ToolMeasureIrreducibility();
    },
  },
  {
    key: "measure:absolute:information-content",
    create: () => {
      class ToolMeasureInformationContent extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteInformationContent(args);
      }
      return new ToolMeasureInformationContent();
    },
  },
  {
    key: "measure:absolute:rl-object-completeness",
    create: () => {
      class ToolMeasureRlObjectCompleteness extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteRlObjectCompleteness(args);
      }
      return new ToolMeasureRlObjectCompleteness();
    },
  },
  {
    key: "measure:absolute:trajectory-richness",
    create: () => {
      class ToolMeasureTrajectoryRichness extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteTrajectoryRichness(args);
      }
      return new ToolMeasureTrajectoryRichness();
    },
  },
  {
    key: "measure:absolute:diversity-contribution",
    create: () => {
      class ToolMeasureDiversityContribution extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteDiversityContribution(args);
      }
      return new ToolMeasureDiversityContribution();
    },
  },
  {
    key: "measure:absolute:language-concentration",
    create: () => {
      class ToolMeasureLanguageConcentration extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteLanguageConcentration(args);
      }
      return new ToolMeasureLanguageConcentration();
    },
  },
  {
    key: "measure:absolute:framework-surface",
    create: () => {
      class ToolMeasureFrameworkSurface extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteFrameworkSurface(args);
      }
      return new ToolMeasureFrameworkSurface();
    },
  },
  {
    key: "measure:absolute:purpose-clarity",
    create: () => {
      class ToolMeasurePurposeClarity extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsolutePurposeClarity(args);
      }
      return new ToolMeasurePurposeClarity();
    },
  },
  {
    key: "measure:absolute:dependency-class-balance",
    create: () => {
      class ToolMeasureDependencyClassBalance extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteDependencyClassBalance(args);
      }
      return new ToolMeasureDependencyClassBalance();
    },
  },
  {
    key: "measure:absolute:external-service-coupling",
    create: () => {
      class ToolMeasureExternalServiceCoupling extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteExternalServiceCoupling(args);
      }
      return new ToolMeasureExternalServiceCoupling();
    },
  },
  {
    key: "measure:absolute:contract-surface",
    create: () => {
      class ToolMeasureContractSurface extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteContractSurface(args);
      }
      return new ToolMeasureContractSurface();
    },
  },
  {
    key: "measure:absolute:type-safety-pressure",
    create: () => {
      class ToolMeasureTypeSafetyPressure extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteTypeSafetyPressure(args);
      }
      return new ToolMeasureTypeSafetyPressure();
    },
  },
  {
    key: "measure:absolute:observability-surface",
    create: () => {
      class ToolMeasureObservabilitySurface extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteObservabilitySurface(args);
      }
      return new ToolMeasureObservabilitySurface();
    },
  },
  {
    key: "measure:absolute:generated-code-mass",
    create: () => {
      class ToolMeasureGeneratedCodeMass extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteGeneratedCodeMass(args);
      }
      return new ToolMeasureGeneratedCodeMass();
    },
  },
  {
    key: "measure:absolute:test-as-spec",
    create: () => {
      class ToolMeasureTestAsSpec extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteTestAsSpec(args);
      }
      return new ToolMeasureTestAsSpec();
    },
  },
  {
    key: "measure:absolute:portability",
    create: () => {
      class ToolMeasurePortability extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsolutePortability(args);
      }
      return new ToolMeasurePortability();
    },
  },
  {
    key: "measure:absolute:architectural-pattern-density",
    create: () => {
      class ToolMeasureArchitecturalPatternDensity extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteArchitecturalPatternDensity(args);
      }
      return new ToolMeasureArchitecturalPatternDensity();
    },
  },
  {
    key: "measure:absolute:capability-surface",
    create: () => {
      class ToolMeasureCapabilitySurface extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteCapabilitySurface(args);
      }
      return new ToolMeasureCapabilitySurface();
    },
  },
  {
    key: "measure:absolute:copyleft-risk-mass",
    create: () => {
      class ToolMeasureCopyleftRiskMass extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteCopyleftRiskMass(args);
      }
      return new ToolMeasureCopyleftRiskMass();
    },
  },
  {
    key: "measure:absolute:change-intent-clarity",
    create: () => {
      class ToolMeasureChangeIntentClarity extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteChangeIntentClarity(args);
      }
      return new ToolMeasureChangeIntentClarity();
    },
  },
  {
    key: "measure:absolute:data-architecture-clarity",
    create: () => {
      class ToolMeasureDataArchitectureClarity extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteDataArchitectureClarity(args);
      }
      return new ToolMeasureDataArchitectureClarity();
    },
  },
  {
    key: "measure:absolute:concurrency-model-clarity",
    create: () => {
      class ToolMeasureConcurrencyModelClarity extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteConcurrencyModelClarity(args);
      }
      return new ToolMeasureConcurrencyModelClarity();
    },
  },
  {
    key: "measure:absolute:api-style-clarity",
    create: () => {
      class ToolMeasureApiStyleClarity extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteApiStyleClarity(args);
      }
      return new ToolMeasureApiStyleClarity();
    },
  },
  {
    key: "measure:absolute:substitution-density",
    create: () => {
      class ToolMeasureSubstitutionDensity extends ExecutionTool<(args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>> {
        use = async (args: DataPackAbsoluteMeasureInput) => measureAbsoluteSubstitutionDensity(args);
      }
      return new ToolMeasureSubstitutionDensity();
    },
  },
];

export function listAbsoluteMeasureToolKeys(): string[] {
  return ABSOLUTE_MEASURE_TOOL_FACTORIES.map((e) => e.key);
}

/**
 * Register every absolute measure tool on the execution registry.
 * Returns the keys registered (or attempted).
 */
export function registerAbsoluteMeasureTools(
  execution: AbsoluteMeasureToolsHost | null | undefined,
): string[] {
  const register = execution?.tools?.registerTool;
  if (typeof register !== 'function') return [];
  const registered: string[] = [];
  for (const entry of ABSOLUTE_MEASURE_TOOL_FACTORIES) {
    try {
      register.call(execution!.tools, entry.key, entry.create(), 0);
      registered.push(entry.key);
    } catch {
      /* optional registry */
    }
  }
  return registered;
}
