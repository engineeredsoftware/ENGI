/**
 * tool-measure-capability-clarity: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteCapabilityClarity } from '@bitcode/generic-measurements-absolutes-capability-clarity';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_CAPABILITYCLARITY_KEY = 'measure:absolute:capability-clarity' as const;

export class ToolMeasureCapabilityClarity extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteCapabilityClarity(args);
}

export function createToolMeasureCapabilityClarity(): ToolMeasureCapabilityClarity {
  return new ToolMeasureCapabilityClarity();
}

export { measureAbsoluteCapabilityClarity };
