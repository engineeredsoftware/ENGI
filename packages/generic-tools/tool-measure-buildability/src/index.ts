/**
 * tool-measure-buildability: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteBuildability } from '@bitcode/generic-measurements-absolutes-buildability';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_BUILDABILITY_KEY = 'measure:absolute:buildability' as const;

export class ToolMeasureBuildability extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteBuildability(args);
}

export function createToolMeasureBuildability(): ToolMeasureBuildability {
  return new ToolMeasureBuildability();
}

export { measureAbsoluteBuildability };
