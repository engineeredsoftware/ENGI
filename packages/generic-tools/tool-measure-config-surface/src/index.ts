/**
 * tool-measure-config-surface: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteConfigSurface } from '@bitcode/generic-measurements-absolutes-config-surface';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_CONFIGSURFACE_KEY = 'measure:absolute:config-surface' as const;

export class ToolMeasureConfigSurface extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteConfigSurface(args);
}

export function createToolMeasureConfigSurface(): ToolMeasureConfigSurface {
  return new ToolMeasureConfigSurface();
}

export { measureAbsoluteConfigSurface };
