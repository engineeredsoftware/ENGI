/**
 * tool-measure-copyleft-risk-mass: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteCopyleftRiskMass } from '@bitcode/generic-measurements-absolutes-copyleft-risk-mass';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_COPYLEFT_RISK_MASS_KEY = 'measure:absolute:copyleft-risk-mass' as const;

export class ToolMeasureCopyleftRiskMass extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteCopyleftRiskMass(args);
}

export function createToolMeasureCopyleftRiskMass(): ToolMeasureCopyleftRiskMass {
  return new ToolMeasureCopyleftRiskMass();
}

export { measureAbsoluteCopyleftRiskMass };
