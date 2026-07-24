/**
 * tool-measure-contract-surface: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteContractSurface } from '@bitcode/generic-measurements-absolutes-contract-surface';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_CONTRACT_SURFACE_KEY = 'measure:absolute:contract-surface' as const;

export class ToolMeasureContractSurface extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteContractSurface(args);
}

export function createToolMeasureContractSurface(): ToolMeasureContractSurface {
  return new ToolMeasureContractSurface();
}

export { measureAbsoluteContractSurface };
