/**
 * tool-measure-security-cleanliness: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteSecurityCleanliness } from '@bitcode/generic-measurements-absolutes-security-cleanliness';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_SECURITYCLEANLINESS_KEY = 'measure:absolute:security-cleanliness' as const;

export class ToolMeasureSecurityCleanliness extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteSecurityCleanliness(args);
}

export function createToolMeasureSecurityCleanliness(): ToolMeasureSecurityCleanliness {
  return new ToolMeasureSecurityCleanliness();
}

export { measureAbsoluteSecurityCleanliness };
