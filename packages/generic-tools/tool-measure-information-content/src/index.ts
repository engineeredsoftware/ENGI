/**
 * tool-measure-information-content: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteInformationContent } from '@bitcode/generic-measurements-absolutes-information-content';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_INFORMATIONCONTENT_KEY = 'measure:absolute:information-content' as const;

export class ToolMeasureInformationContent extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteInformationContent(args);
}

export function createToolMeasureInformationContent(): ToolMeasureInformationContent {
  return new ToolMeasureInformationContent();
}

export { measureAbsoluteInformationContent };
