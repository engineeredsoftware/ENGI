/**
 * tool-measure-change-intent-clarity: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteChangeIntentClarity } from '@bitcode/generic-measurements-absolutes-change-intent-clarity';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_CHANGE_INTENT_CLARITY_KEY = 'measure:absolute:change-intent-clarity' as const;

export class ToolMeasureChangeIntentClarity extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteChangeIntentClarity(args);
}

export function createToolMeasureChangeIntentClarity(): ToolMeasureChangeIntentClarity {
  return new ToolMeasureChangeIntentClarity();
}

export { measureAbsoluteChangeIntentClarity };
