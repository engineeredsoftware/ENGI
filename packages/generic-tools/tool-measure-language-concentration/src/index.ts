/**
 * tool-measure-language-concentration: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteLanguageConcentration } from '@bitcode/generic-measurements-absolutes-language-concentration';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_LANGUAGE_CONCENTRATION_KEY = 'measure:absolute:language-concentration' as const;

export class ToolMeasureLanguageConcentration extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteLanguageConcentration(args);
}

export function createToolMeasureLanguageConcentration(): ToolMeasureLanguageConcentration {
  return new ToolMeasureLanguageConcentration();
}

export { measureAbsoluteLanguageConcentration };
