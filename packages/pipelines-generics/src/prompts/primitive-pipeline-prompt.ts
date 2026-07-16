/**
 * Primitive pipeline Prompt — fully generic (any Bitcode pipeline).
 * Assembled from raw_promptparts (not inline prose SSOT).
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_GENERIC_PIPELINE_SYSTEM_IDENTITY_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_pipeline_system_identity_corestatement';
import { PROMPTPART_GENERIC_PIPELINE_SYSTEM_CONTRACT_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_pipeline_system_contract_detailcontent';
import { PROMPTPART_GENERIC_PIPELINE_SYSTEM_OBSERVABILITY_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_pipeline_system_observability_detailcontent';

export const PRIMITIVE_PIPELINE_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('identity', PROMPTPART_GENERIC_PIPELINE_SYSTEM_IDENTITY_CORESTATEMENT);
  p.set('contract', PROMPTPART_GENERIC_PIPELINE_SYSTEM_CONTRACT_DETAILCONTENT);
  p.set('observability', PROMPTPART_GENERIC_PIPELINE_SYSTEM_OBSERVABILITY_DETAILCONTENT);
  return p;
})();
