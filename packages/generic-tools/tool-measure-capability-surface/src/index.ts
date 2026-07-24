/**
 * tool-measure-capability-surface: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteCapabilitySurface } from '@bitcode/generic-measurements-absolutes-capability-surface';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_CAPABILITY_SURFACE_KEY = 'measure:absolute:capability-surface' as const;

export class ToolMeasureCapabilitySurface extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteCapabilitySurface(args);
}

export function createToolMeasureCapabilitySurface(): ToolMeasureCapabilitySurface {
  return new ToolMeasureCapabilitySurface();
}

export { measureAbsoluteCapabilitySurface };
