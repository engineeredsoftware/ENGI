/**
 * tool-measure-lang-span: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteLangSpan } from '@bitcode/generic-measurements-absolutes-lang-span';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_LANGSPAN_KEY = 'measure:absolute:lang-span' as const;

export class ToolMeasureLangSpan extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteLangSpan(args);
}

export function createToolMeasureLangSpan(): ToolMeasureLangSpan {
  return new ToolMeasureLangSpan();
}

export { measureAbsoluteLangSpan };
