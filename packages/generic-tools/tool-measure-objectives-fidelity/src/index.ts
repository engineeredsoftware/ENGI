/**
 * tool-measure-objectives-fidelity: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteObjectivesFidelity } from '@bitcode/generic-measurements-absolutes-objectives-fidelity';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_OBJECTIVESFIDELITY_KEY = 'measure:absolute:objectives-fidelity' as const;

export class ToolMeasureObjectivesFidelity extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteObjectivesFidelity(args);
}

export function createToolMeasureObjectivesFidelity(): ToolMeasureObjectivesFidelity {
  return new ToolMeasureObjectivesFidelity();
}

export { measureAbsoluteObjectivesFidelity };
