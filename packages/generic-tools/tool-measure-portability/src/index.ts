/**
 * tool-measure-portability: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsolutePortability } from '@bitcode/generic-measurements-absolutes-portability';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_PORTABILITY_KEY = 'measure:absolute:portability' as const;

export class ToolMeasurePortability extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsolutePortability(args);
}

export function createToolMeasurePortability(): ToolMeasurePortability {
  return new ToolMeasurePortability();
}

export { measureAbsolutePortability };
