/**
 * tool-measure-symbolic-richness: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteSymbolicRichness } from '@bitcode/generic-measurements-absolutes-symbolic-richness';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_SYMBOLICRICHNESS_KEY = 'measure:absolute:symbolic-richness' as const;

export class ToolMeasureSymbolicRichness extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteSymbolicRichness(args);
}

export function createToolMeasureSymbolicRichness(): ToolMeasureSymbolicRichness {
  return new ToolMeasureSymbolicRichness();
}

export { measureAbsoluteSymbolicRichness };
