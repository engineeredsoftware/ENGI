/**
 * tool-measure-difficulty: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteDifficulty } from '@bitcode/generic-measurements-absolutes-difficulty';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_DIFFICULTY_KEY = 'measure:absolute:difficulty' as const;

export class ToolMeasureDifficulty extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteDifficulty(args);
}

export function createToolMeasureDifficulty(): ToolMeasureDifficulty {
  return new ToolMeasureDifficulty();
}

export { measureAbsoluteDifficulty };
