/**
 * tool-measure-architectural-pattern-density: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteArchitecturalPatternDensity } from '@bitcode/generic-measurements-absolutes-architectural-pattern-density';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_ARCHITECTURAL_PATTERN_DENSITY_KEY = 'measure:absolute:architectural-pattern-density' as const;

export class ToolMeasureArchitecturalPatternDensity extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteArchitecturalPatternDensity(args);
}

export function createToolMeasureArchitecturalPatternDensity(): ToolMeasureArchitecturalPatternDensity {
  return new ToolMeasureArchitecturalPatternDensity();
}

export { measureAbsoluteArchitecturalPatternDensity };
