/**
 * tool-measure-control-complexity: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteControlComplexity } from '@bitcode/generic-measurements-absolutes-control-complexity';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_CONTROLCOMPLEXITY_KEY = 'measure:absolute:control-complexity' as const;

export class ToolMeasureControlComplexity extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteControlComplexity(args);
}

export function createToolMeasureControlComplexity(): ToolMeasureControlComplexity {
  return new ToolMeasureControlComplexity();
}

export { measureAbsoluteControlComplexity };
