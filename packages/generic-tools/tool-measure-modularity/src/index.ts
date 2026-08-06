/**
 * tool-measure-modularity: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteModularity } from '@bitcode/generic-measurements-absolutes-modularity';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_MODULARITY_KEY = 'measure:absolute:modularity' as const;

export class ToolMeasureModularity extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteModularity(args);
}

export function createToolMeasureModularity(): ToolMeasureModularity {
  return new ToolMeasureModularity();
}

export { measureAbsoluteModularity };
