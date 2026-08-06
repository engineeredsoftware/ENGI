/**
 * tool-measure-test-coverage: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteTestCoverage } from '@bitcode/generic-measurements-absolutes-test-coverage';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_TESTCOVERAGE_KEY = 'measure:absolute:test-coverage' as const;

export class ToolMeasureTestCoverage extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteTestCoverage(args);
}

export function createToolMeasureTestCoverage(): ToolMeasureTestCoverage {
  return new ToolMeasureTestCoverage();
}

export { measureAbsoluteTestCoverage };
