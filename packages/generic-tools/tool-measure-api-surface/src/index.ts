/**
 * tool-measure-api-surface: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteApiSurface } from '@bitcode/generic-measurements-absolutes-api-surface';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_APISURFACE_KEY = 'measure:absolute:api-surface' as const;

export class ToolMeasureApiSurface extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteApiSurface(args);
}

export function createToolMeasureApiSurface(): ToolMeasureApiSurface {
  return new ToolMeasureApiSurface();
}

export { measureAbsoluteApiSurface };
