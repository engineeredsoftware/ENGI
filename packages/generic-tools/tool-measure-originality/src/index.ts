/**
 * tool-measure-originality: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteOriginality } from '@bitcode/generic-measurements-absolutes-originality';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_ORIGINALITY_KEY = 'measure:absolute:originality' as const;

export class ToolMeasureOriginality extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteOriginality(args);
}

export function createToolMeasureOriginality(): ToolMeasureOriginality {
  return new ToolMeasureOriginality();
}

export { measureAbsoluteOriginality };
