/**
 * SDIVF base pipeline Prompt — base-level genericism for Setup-[DIV]*-Finish.
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { createPromptPart } from '@bitcode/prompts/parts/PromptPart';

export const SDIVF_PIPELINE_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'pattern',
    createPromptPart(
      'This pipeline follows SDIVF: Setup → [Discovery → Implementation → Validation]* → Finish. Setup prepares Host-bound workspace and admission; Discovery maps and searches; Implementation synthesizes; Validation gates readiness; Finish stores terminal artifacts.',
    ),
  );
  p.set(
    'iteration',
    createPromptPart(
      'DIV may iterate within maxIterations when validation is not ready. Do not skip Setup. Host clone/adopt is Setup\'s responsibility, not pre-pipeline git source.',
    ),
  );
  p.set(
    'host',
    createPromptPart(
      'The pipeline runs on a Host that was selected at dispatch (LocalHost or Sandbox/Pipeliner). Assume Host capabilities are present; do not select Host kind from inside agents.',
    ),
  );
  return p;
})();
