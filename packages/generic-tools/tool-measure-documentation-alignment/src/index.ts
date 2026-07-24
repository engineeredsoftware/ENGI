/**
 * tool-measure-documentation-alignment: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteDocumentationAlignment } from '@bitcode/generic-measurements-absolutes-documentation-alignment';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_DOCUMENTATIONALIGNMENT_KEY = 'measure:absolute:documentation-alignment' as const;

export class ToolMeasureDocumentationAlignment extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteDocumentationAlignment(args);
}

export function createToolMeasureDocumentationAlignment(): ToolMeasureDocumentationAlignment {
  return new ToolMeasureDocumentationAlignment();
}

export { measureAbsoluteDocumentationAlignment };
