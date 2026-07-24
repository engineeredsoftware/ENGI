/**
 * tool-measure-computational-usage: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteComputationalUsage } from '@bitcode/generic-measurements-absolutes-computational-usage';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_COMPUTATIONALUSAGE_KEY = 'measure:absolute:computational-usage' as const;

export class ToolMeasureComputationalUsage extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteComputationalUsage(args);
}

export function createToolMeasureComputationalUsage(): ToolMeasureComputationalUsage {
  return new ToolMeasureComputationalUsage();
}

export { measureAbsoluteComputationalUsage };
