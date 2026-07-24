/**
 * tool-measure-dependency-span: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteDependencySpan } from '@bitcode/generic-measurements-absolutes-dependency-span';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_DEPENDENCYSPAN_KEY = 'measure:absolute:dependency-span' as const;

export class ToolMeasureDependencySpan extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteDependencySpan(args);
}

export function createToolMeasureDependencySpan(): ToolMeasureDependencySpan {
  return new ToolMeasureDependencySpan();
}

export { measureAbsoluteDependencySpan };
