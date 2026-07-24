/**
 * tool-measure-duplication-internal: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteDuplicationInternal } from '@bitcode/generic-measurements-absolutes-duplication-internal';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_DUPLICATIONINTERNAL_KEY = 'measure:absolute:duplication-internal' as const;

export class ToolMeasureDuplicationInternal extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteDuplicationInternal(args);
}

export function createToolMeasureDuplicationInternal(): ToolMeasureDuplicationInternal {
  return new ToolMeasureDuplicationInternal();
}

export { measureAbsoluteDuplicationInternal };
