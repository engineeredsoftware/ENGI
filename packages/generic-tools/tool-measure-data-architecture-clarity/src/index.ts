/**
 * tool-measure-data-architecture-clarity: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteDataArchitectureClarity } from '@bitcode/generic-measurements-absolutes-data-architecture-clarity';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_DATA_ARCHITECTURE_CLARITY_KEY = 'measure:absolute:data-architecture-clarity' as const;

export class ToolMeasureDataArchitectureClarity extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteDataArchitectureClarity(args);
}

export function createToolMeasureDataArchitectureClarity(): ToolMeasureDataArchitectureClarity {
  return new ToolMeasureDataArchitectureClarity();
}

export { measureAbsoluteDataArchitectureClarity };
