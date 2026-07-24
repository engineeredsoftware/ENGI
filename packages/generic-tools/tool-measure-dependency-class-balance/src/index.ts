/**
 * tool-measure-dependency-class-balance: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteDependencyClassBalance } from '@bitcode/generic-measurements-absolutes-dependency-class-balance';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_DEPENDENCY_CLASS_BALANCE_KEY = 'measure:absolute:dependency-class-balance' as const;

export class ToolMeasureDependencyClassBalance extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteDependencyClassBalance(args);
}

export function createToolMeasureDependencyClassBalance(): ToolMeasureDependencyClassBalance {
  return new ToolMeasureDependencyClassBalance();
}

export { measureAbsoluteDependencyClassBalance };
