/**
 * tool-measure-dead-code-ratio: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteDeadCodeRatio } from '@bitcode/generic-measurements-absolutes-dead-code-ratio';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_DEADCODERATIO_KEY = 'measure:absolute:dead-code-ratio' as const;

export class ToolMeasureDeadCodeRatio extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteDeadCodeRatio(args);
}

export function createToolMeasureDeadCodeRatio(): ToolMeasureDeadCodeRatio {
  return new ToolMeasureDeadCodeRatio();
}

export { measureAbsoluteDeadCodeRatio };
