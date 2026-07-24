/**
 * tool-measure-trajectory-richness: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteTrajectoryRichness } from '@bitcode/generic-measurements-absolutes-trajectory-richness';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_TRAJECTORYRICHNESS_KEY = 'measure:absolute:trajectory-richness' as const;

export class ToolMeasureTrajectoryRichness extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteTrajectoryRichness(args);
}

export function createToolMeasureTrajectoryRichness(): ToolMeasureTrajectoryRichness {
  return new ToolMeasureTrajectoryRichness();
}

export { measureAbsoluteTrajectoryRichness };
