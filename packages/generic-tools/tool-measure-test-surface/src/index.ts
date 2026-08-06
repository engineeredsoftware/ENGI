/**
 * tool-measure-test-surface: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteTestSurface } from '@bitcode/generic-measurements-absolutes-test-surface';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_TESTSURFACE_KEY = 'measure:absolute:test-surface' as const;

export class ToolMeasureTestSurface extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteTestSurface(args);
}

export function createToolMeasureTestSurface(): ToolMeasureTestSurface {
  return new ToolMeasureTestSurface();
}

export { measureAbsoluteTestSurface };
