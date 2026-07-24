/**
 * tool-measure-runtime-cleanliness: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteRuntimeCleanliness } from '@bitcode/generic-measurements-absolutes-runtime-cleanliness';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_RUNTIMECLEANLINESS_KEY = 'measure:absolute:runtime-cleanliness' as const;

export class ToolMeasureRuntimeCleanliness extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteRuntimeCleanliness(args);
}

export function createToolMeasureRuntimeCleanliness(): ToolMeasureRuntimeCleanliness {
  return new ToolMeasureRuntimeCleanliness();
}

export { measureAbsoluteRuntimeCleanliness };
