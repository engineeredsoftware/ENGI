/**
 * tool-measure-test-pass-rate: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteTestPassRate } from '@bitcode/generic-measurements-absolutes-test-pass-rate';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_TESTPASSRATE_KEY = 'measure:absolute:test-pass-rate' as const;

export class ToolMeasureTestPassRate extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteTestPassRate(args);
}

export function createToolMeasureTestPassRate(): ToolMeasureTestPassRate {
  return new ToolMeasureTestPassRate();
}

export { measureAbsoluteTestPassRate };
