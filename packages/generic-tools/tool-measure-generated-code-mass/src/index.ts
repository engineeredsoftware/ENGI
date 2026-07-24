/**
 * tool-measure-generated-code-mass: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteGeneratedCodeMass } from '@bitcode/generic-measurements-absolutes-generated-code-mass';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_GENERATED_CODE_MASS_KEY = 'measure:absolute:generated-code-mass' as const;

export class ToolMeasureGeneratedCodeMass extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteGeneratedCodeMass(args);
}

export function createToolMeasureGeneratedCodeMass(): ToolMeasureGeneratedCodeMass {
  return new ToolMeasureGeneratedCodeMass();
}

export { measureAbsoluteGeneratedCodeMass };
