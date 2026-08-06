/**
 * tool-measure-data-flow-depth: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteDataFlowDepth } from '@bitcode/generic-measurements-absolutes-data-flow-depth';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_DATAFLOWDEPTH_KEY = 'measure:absolute:data-flow-depth' as const;

export class ToolMeasureDataFlowDepth extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteDataFlowDepth(args);
}

export function createToolMeasureDataFlowDepth(): ToolMeasureDataFlowDepth {
  return new ToolMeasureDataFlowDepth();
}

export { measureAbsoluteDataFlowDepth };
