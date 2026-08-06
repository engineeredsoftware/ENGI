/**
 * tool-measure-coherence: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteCoherence } from '@bitcode/generic-measurements-absolutes-coherence';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_COHERENCE_KEY = 'measure:absolute:coherence' as const;

export class ToolMeasureCoherence extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteCoherence(args);
}

export function createToolMeasureCoherence(): ToolMeasureCoherence {
  return new ToolMeasureCoherence();
}

export { measureAbsoluteCoherence };
