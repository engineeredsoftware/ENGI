/**
 * tool-measure-correctness-estimate: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteCorrectnessEstimate } from '@bitcode/generic-measurements-absolutes-correctness-estimate';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_CORRECTNESSESTIMATE_KEY = 'measure:absolute:correctness-estimate' as const;

export class ToolMeasureCorrectnessEstimate extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteCorrectnessEstimate(args);
}

export function createToolMeasureCorrectnessEstimate(): ToolMeasureCorrectnessEstimate {
  return new ToolMeasureCorrectnessEstimate();
}

export { measureAbsoluteCorrectnessEstimate };
