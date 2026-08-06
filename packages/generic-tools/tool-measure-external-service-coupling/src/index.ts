/**
 * tool-measure-external-service-coupling: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteExternalServiceCoupling } from '@bitcode/generic-measurements-absolutes-external-service-coupling';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_EXTERNAL_SERVICE_COUPLING_KEY = 'measure:absolute:external-service-coupling' as const;

export class ToolMeasureExternalServiceCoupling extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteExternalServiceCoupling(args);
}

export function createToolMeasureExternalServiceCoupling(): ToolMeasureExternalServiceCoupling {
  return new ToolMeasureExternalServiceCoupling();
}

export { measureAbsoluteExternalServiceCoupling };
