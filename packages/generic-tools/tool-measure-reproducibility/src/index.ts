/**
 * tool-measure-reproducibility: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteReproducibility } from '@bitcode/generic-measurements-absolutes-reproducibility';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_REPRODUCIBILITY_KEY = 'measure:absolute:reproducibility' as const;

export class ToolMeasureReproducibility extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteReproducibility(args);
}

export function createToolMeasureReproducibility(): ToolMeasureReproducibility {
  return new ToolMeasureReproducibility();
}

export { measureAbsoluteReproducibility };
