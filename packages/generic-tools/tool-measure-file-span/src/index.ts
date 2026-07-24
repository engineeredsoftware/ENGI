/**
 * tool-measure-file-span: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteFileSpan } from '@bitcode/generic-measurements-absolutes-file-span';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_FILESPAN_KEY = 'measure:absolute:file-span' as const;

export class ToolMeasureFileSpan extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteFileSpan(args);
}

export function createToolMeasureFileSpan(): ToolMeasureFileSpan {
  return new ToolMeasureFileSpan();
}

export { measureAbsoluteFileSpan };
