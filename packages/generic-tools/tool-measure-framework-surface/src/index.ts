/**
 * tool-measure-framework-surface: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteFrameworkSurface } from '@bitcode/generic-measurements-absolutes-framework-surface';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_FRAMEWORK_SURFACE_KEY = 'measure:absolute:framework-surface' as const;

export class ToolMeasureFrameworkSurface extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteFrameworkSurface(args);
}

export function createToolMeasureFrameworkSurface(): ToolMeasureFrameworkSurface {
  return new ToolMeasureFrameworkSurface();
}

export { measureAbsoluteFrameworkSurface };
