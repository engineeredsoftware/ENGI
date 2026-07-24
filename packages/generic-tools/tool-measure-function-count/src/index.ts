/**
 * tool-measure-function-count: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteFunctionCount } from '@bitcode/generic-measurements-absolutes-function-count';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_FUNCTIONCOUNT_KEY = 'measure:absolute:function-count' as const;

export class ToolMeasureFunctionCount extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteFunctionCount(args);
}

export function createToolMeasureFunctionCount(): ToolMeasureFunctionCount {
  return new ToolMeasureFunctionCount();
}

export { measureAbsoluteFunctionCount };
