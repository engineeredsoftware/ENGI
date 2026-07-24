/**
 * tool-measure-contamination: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteContamination } from '@bitcode/generic-measurements-absolutes-contamination';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_CONTAMINATION_KEY = 'measure:absolute:contamination' as const;

export class ToolMeasureContamination extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteContamination(args);
}

export function createToolMeasureContamination(): ToolMeasureContamination {
  return new ToolMeasureContamination();
}

export { measureAbsoluteContamination };
