/**
 * tool-measure-authorship-consistency: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteAuthorshipConsistency } from '@bitcode/generic-measurements-absolutes-authorship-consistency';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_AUTHORSHIPCONSISTENCY_KEY = 'measure:absolute:authorship-consistency' as const;

export class ToolMeasureAuthorshipConsistency extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteAuthorshipConsistency(args);
}

export function createToolMeasureAuthorshipConsistency(): ToolMeasureAuthorshipConsistency {
  return new ToolMeasureAuthorshipConsistency();
}

export { measureAbsoluteAuthorshipConsistency };
