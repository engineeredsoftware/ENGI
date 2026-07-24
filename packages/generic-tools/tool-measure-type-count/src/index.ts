/**
 * tool-measure-type-count: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteTypeCount } from '@bitcode/generic-measurements-absolutes-type-count';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_TYPECOUNT_KEY = 'measure:absolute:type-count' as const;

export class ToolMeasureTypeCount extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteTypeCount(args);
}

export function createToolMeasureTypeCount(): ToolMeasureTypeCount {
  return new ToolMeasureTypeCount();
}

export { measureAbsoluteTypeCount };
