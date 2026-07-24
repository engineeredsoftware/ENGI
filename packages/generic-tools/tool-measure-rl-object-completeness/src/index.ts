/**
 * tool-measure-rl-object-completeness: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteRlObjectCompleteness } from '@bitcode/generic-measurements-absolutes-rl-object-completeness';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_RLOBJECTCOMPLETENESS_KEY = 'measure:absolute:rl-object-completeness' as const;

export class ToolMeasureRlObjectCompleteness extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteRlObjectCompleteness(args);
}

export function createToolMeasureRlObjectCompleteness(): ToolMeasureRlObjectCompleteness {
  return new ToolMeasureRlObjectCompleteness();
}

export { measureAbsoluteRlObjectCompleteness };
