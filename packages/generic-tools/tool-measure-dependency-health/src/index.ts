/**
 * tool-measure-dependency-health: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics';
import { measureAbsoluteDependencyHealth } from '@bitcode/generic-measurements-absolutes-dependency-health';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_DEPENDENCYHEALTH_KEY = 'measure:absolute:dependency-health' as const;

export class ToolMeasureDependencyHealth extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteDependencyHealth(args);
}

export function createToolMeasureDependencyHealth(): ToolMeasureDependencyHealth {
  return new ToolMeasureDependencyHealth();
}

export { measureAbsoluteDependencyHealth };
