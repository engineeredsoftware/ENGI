/**
 * tool-measure-completeness: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteCompleteness } from '@bitcode/generic-measurements-absolutes-completeness';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_COMPLETENESS_KEY = 'measure:absolute:completeness' as const;

export class ToolMeasureCompleteness extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteCompleteness(args);
}

export function createToolMeasureCompleteness(): ToolMeasureCompleteness {
  return new ToolMeasureCompleteness();
}

export { measureAbsoluteCompleteness };
