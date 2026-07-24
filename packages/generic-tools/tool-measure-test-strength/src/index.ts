/**
 * tool-measure-test-strength: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteTestStrength } from '@bitcode/generic-measurements-absolutes-test-strength';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_TESTSTRENGTH_KEY = 'measure:absolute:test-strength' as const;

export class ToolMeasureTestStrength extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteTestStrength(args);
}

export function createToolMeasureTestStrength(): ToolMeasureTestStrength {
  return new ToolMeasureTestStrength();
}

export { measureAbsoluteTestStrength };
