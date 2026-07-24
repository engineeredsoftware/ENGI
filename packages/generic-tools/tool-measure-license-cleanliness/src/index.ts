/**
 * tool-measure-license-cleanliness: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteLicenseCleanliness } from '@bitcode/generic-measurements-absolutes-license-cleanliness';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_LICENSECLEANLINESS_KEY = 'measure:absolute:license-cleanliness' as const;

export class ToolMeasureLicenseCleanliness extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteLicenseCleanliness(args);
}

export function createToolMeasureLicenseCleanliness(): ToolMeasureLicenseCleanliness {
  return new ToolMeasureLicenseCleanliness();
}

export { measureAbsoluteLicenseCleanliness };
