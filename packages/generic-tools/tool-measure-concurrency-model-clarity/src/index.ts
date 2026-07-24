/**
 * tool-measure-concurrency-model-clarity: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteConcurrencyModelClarity } from '@bitcode/generic-measurements-absolutes-concurrency-model-clarity';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_CONCURRENCY_MODEL_CLARITY_KEY = 'measure:absolute:concurrency-model-clarity' as const;

export class ToolMeasureConcurrencyModelClarity extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteConcurrencyModelClarity(args);
}

export function createToolMeasureConcurrencyModelClarity(): ToolMeasureConcurrencyModelClarity {
  return new ToolMeasureConcurrencyModelClarity();
}

export { measureAbsoluteConcurrencyModelClarity };
