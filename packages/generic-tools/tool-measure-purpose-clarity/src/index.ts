/**
 * tool-measure-purpose-clarity: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsolutePurposeClarity } from '@bitcode/generic-measurements-absolutes-purpose-clarity';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_PURPOSE_CLARITY_KEY = 'measure:absolute:purpose-clarity' as const;

export class ToolMeasurePurposeClarity extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsolutePurposeClarity(args);
}

export function createToolMeasurePurposeClarity(): ToolMeasurePurposeClarity {
  return new ToolMeasurePurposeClarity();
}

export { measureAbsolutePurposeClarity };
