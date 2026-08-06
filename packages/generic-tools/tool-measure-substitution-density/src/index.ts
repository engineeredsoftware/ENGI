/**
 * tool-measure-substitution-density: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteSubstitutionDensity } from '@bitcode/generic-measurements-absolutes-substitution-density';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_SUBSTITUTION_DENSITY_KEY = 'measure:absolute:substitution-density' as const;

export class ToolMeasureSubstitutionDensity extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteSubstitutionDensity(args);
}

export function createToolMeasureSubstitutionDensity(): ToolMeasureSubstitutionDensity {
  return new ToolMeasureSubstitutionDensity();
}

export { measureAbsoluteSubstitutionDensity };
