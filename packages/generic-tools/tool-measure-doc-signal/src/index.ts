/**
 * tool-measure-doc-signal: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteDocSignal } from '@bitcode/generic-measurements-absolutes-doc-signal';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_DOCSIGNAL_KEY = 'measure:absolute:doc-signal' as const;

export class ToolMeasureDocSignal extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteDocSignal(args);
}

export function createToolMeasureDocSignal(): ToolMeasureDocSignal {
  return new ToolMeasureDocSignal();
}

export { measureAbsoluteDocSignal };
