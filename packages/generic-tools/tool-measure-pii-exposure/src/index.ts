/**
 * tool-measure-pii-exposure: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsolutePiiExposure } from '@bitcode/generic-measurements-absolutes-pii-exposure';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_PIIEXPOSURE_KEY = 'measure:absolute:pii-exposure' as const;

export class ToolMeasurePiiExposure extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsolutePiiExposure(args);
}

export function createToolMeasurePiiExposure(): ToolMeasurePiiExposure {
  return new ToolMeasurePiiExposure();
}

export { measureAbsolutePiiExposure };
