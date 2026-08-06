/**
 * tool-measure-api-style-clarity: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteApiStyleClarity } from '@bitcode/generic-measurements-absolutes-api-style-clarity';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_API_STYLE_CLARITY_KEY = 'measure:absolute:api-style-clarity' as const;

export class ToolMeasureApiStyleClarity extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteApiStyleClarity(args);
}

export function createToolMeasureApiStyleClarity(): ToolMeasureApiStyleClarity {
  return new ToolMeasureApiStyleClarity();
}

export { measureAbsoluteApiStyleClarity };
