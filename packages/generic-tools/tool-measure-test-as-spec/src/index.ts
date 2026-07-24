/**
 * tool-measure-test-as-spec: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteTestAsSpec } from '@bitcode/generic-measurements-absolutes-test-as-spec';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_TEST_AS_SPEC_KEY = 'measure:absolute:test-as-spec' as const;

export class ToolMeasureTestAsSpec extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteTestAsSpec(args);
}

export function createToolMeasureTestAsSpec(): ToolMeasureTestAsSpec {
  return new ToolMeasureTestAsSpec();
}

export { measureAbsoluteTestAsSpec };
