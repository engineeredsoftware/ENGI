/**
 * tool-measure-semantic-novelty: wraps bare absolute measure for Execution tool registry.
 */
import { ExecutionTool } from '@bitcode/agent-generics/execution';
import { measureAbsoluteSemanticNovelty } from '@bitcode/generic-measurements-absolutes-semantic-novelty';
import type { DataPackAbsoluteMeasureInput, AbsoluteMeasureResult } from '@bitcode/generic-measurements-shared-absolute-measure-input';

export const TOOL_MEASURE_SEMANTICNOVELTY_KEY = 'measure:absolute:semantic-novelty' as const;

export class ToolMeasureSemanticNovelty extends ExecutionTool<
  (args: DataPackAbsoluteMeasureInput) => Promise<AbsoluteMeasureResult>
> {
  use = async (args: DataPackAbsoluteMeasureInput): Promise<AbsoluteMeasureResult> => measureAbsoluteSemanticNovelty(args);
}

export function createToolMeasureSemanticNovelty(): ToolMeasureSemanticNovelty {
  return new ToolMeasureSemanticNovelty();
}

export { measureAbsoluteSemanticNovelty };
