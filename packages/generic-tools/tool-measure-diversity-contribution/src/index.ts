/**
 * tool-measure-diversity-contribution: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteDiversityContribution } from '@bitcode/generic-measurements-absolutes-diversity-contribution';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_DIVERSITYCONTRIBUTION_KEY = 'measure:absolute:diversity-contribution' as const;

export class ToolMeasureDiversityContribution extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteDiversityContribution(args);
}

export function createToolMeasureDiversityContribution(): ToolMeasureDiversityContribution {
  return new ToolMeasureDiversityContribution();
}

export { measureAbsoluteDiversityContribution };
