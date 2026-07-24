/**
 * tool-measure-secret-safety: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteSecretSafety } from '@bitcode/generic-measurements-absolutes-secret-safety';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_SECRETSAFETY_KEY = 'measure:absolute:secret-safety' as const;

export class ToolMeasureSecretSafety extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteSecretSafety(args);
}

export function createToolMeasureSecretSafety(): ToolMeasureSecretSafety {
  return new ToolMeasureSecretSafety();
}

export { measureAbsoluteSecretSafety };
