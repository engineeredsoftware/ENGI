/**
 * tool-measure-provenance-integrity: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteProvenanceIntegrity } from '@bitcode/generic-measurements-absolutes-provenance-integrity';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_PROVENANCEINTEGRITY_KEY = 'measure:absolute:provenance-integrity' as const;

export class ToolMeasureProvenanceIntegrity extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteProvenanceIntegrity(args);
}

export function createToolMeasureProvenanceIntegrity(): ToolMeasureProvenanceIntegrity {
  return new ToolMeasureProvenanceIntegrity();
}

export { measureAbsoluteProvenanceIntegrity };
