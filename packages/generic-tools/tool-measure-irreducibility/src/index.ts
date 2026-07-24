/**
 * tool-measure-irreducibility: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteIrreducibility } from '@bitcode/generic-measurements-absolutes-irreducibility';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_IRREDUCIBILITY_KEY = 'measure:absolute:irreducibility' as const;

export class ToolMeasureIrreducibility extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteIrreducibility(args);
}

export function createToolMeasureIrreducibility(): ToolMeasureIrreducibility {
  return new ToolMeasureIrreducibility();
}

export { measureAbsoluteIrreducibility };
