/**
 * SDIVF base pipeline Prompt — assembled from raw_promptparts.
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_GENERIC_SDIVFPIPELINE_SYSTEM_PATTERN_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfpipeline_system_pattern_corestatement';
import { PROMPTPART_GENERIC_SDIVFPIPELINE_SYSTEM_ITERATION_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfpipeline_system_iteration_detailcontent';
import { PROMPTPART_GENERIC_SDIVFPIPELINE_SYSTEM_HOST_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfpipeline_system_host_detailcontent';

export const EXECUTION_PIPELINE_SDIVF_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('pattern', PROMPTPART_GENERIC_SDIVFPIPELINE_SYSTEM_PATTERN_CORESTATEMENT);
  p.set('iteration', PROMPTPART_GENERIC_SDIVFPIPELINE_SYSTEM_ITERATION_DETAILCONTENT);
  p.set('host', PROMPTPART_GENERIC_SDIVFPIPELINE_SYSTEM_HOST_DETAILCONTENT);
  return p;
})();
