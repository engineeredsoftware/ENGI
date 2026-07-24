/**
 * tool-measure-type-safety-pressure: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteTypeSafetyPressure } from '@bitcode/generic-measurements-absolutes-type-safety-pressure';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_TYPE_SAFETY_PRESSURE_KEY = 'measure:absolute:type-safety-pressure' as const;

export class ToolMeasureTypeSafetyPressure extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteTypeSafetyPressure(args);
}

export function createToolMeasureTypeSafetyPressure(): ToolMeasureTypeSafetyPressure {
  return new ToolMeasureTypeSafetyPressure();
}

export { measureAbsoluteTypeSafetyPressure };
