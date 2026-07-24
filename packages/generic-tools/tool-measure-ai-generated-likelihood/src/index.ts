/**
 * tool-measure-ai-generated-likelihood: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteAiGeneratedLikelihood } from '@bitcode/generic-measurements-absolutes-ai-generated-likelihood';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_AIGENERATEDLIKELIHOOD_KEY = 'measure:absolute:ai-generated-likelihood' as const;

export class ToolMeasureAiGeneratedLikelihood extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteAiGeneratedLikelihood(args);
}

export function createToolMeasureAiGeneratedLikelihood(): ToolMeasureAiGeneratedLikelihood {
  return new ToolMeasureAiGeneratedLikelihood();
}

export { measureAbsoluteAiGeneratedLikelihood };
