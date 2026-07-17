/**
 * Bitcode Read Measurement - Computer Use Tool
 *
 * Internal feature-flagged wrapper for bounded computer-use evidence.
 * It is admitted only for Read-measurement evidence collection; broader
 * computer-using agent behavior remains outside this tool.
 */

import { Tool } from '@bitcode/tools-generics';
import {
  useComputerTool,
  type UseComputerInput,
  type UseComputerOutput
} from '@bitcode/generic-tools/use-computer';

/**
 * @doc-code-tool
 * intent: "Run a bounded shell command only when the internal Bitcode Read-measurement computer-use registry admits it"
 */
export class BitcodeReadMeasurementComputerUseTool extends Tool<
  (input: UseComputerInput) => Promise<UseComputerOutput>
> {
  use = async (input: UseComputerInput) => {
    return await useComputerTool.use(input);
  };
}

export const bitcodeReadMeasurementComputerUseTool = new BitcodeReadMeasurementComputerUseTool();
