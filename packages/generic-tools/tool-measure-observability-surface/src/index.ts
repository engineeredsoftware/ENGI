/**
 * tool-measure-observability-surface: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteObservabilitySurface } from '@bitcode/generic-measurements-absolutes-observability-surface';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_OBSERVABILITY_SURFACE_KEY = 'measure:absolute:observability-surface' as const;

export class ToolMeasureObservabilitySurface extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteObservabilitySurface(args);
}

export function createToolMeasureObservabilitySurface(): ToolMeasureObservabilitySurface {
  return new ToolMeasureObservabilitySurface();
}

export { measureAbsoluteObservabilitySurface };
