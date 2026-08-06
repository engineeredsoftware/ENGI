/**
 * tool-measure-symbol-connectivity: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteSymbolConnectivity } from '@bitcode/generic-measurements-absolutes-symbol-connectivity';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_SYMBOLCONNECTIVITY_KEY = 'measure:absolute:symbol-connectivity' as const;

export class ToolMeasureSymbolConnectivity extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteSymbolConnectivity(args);
}

export function createToolMeasureSymbolConnectivity(): ToolMeasureSymbolConnectivity {
  return new ToolMeasureSymbolConnectivity();
}

export { measureAbsoluteSymbolConnectivity };
