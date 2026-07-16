/**
 * Shared product Prompt for ExecutionPipelineSDIVF synthesize AssetPacks
 * (deposit + read lenses).
 *
 * File naming (inheritance left→right):
 *   execution-pipeline-sdivf-synthesize-asset-packs-prompts
 *
 * Lens-specific: execution-pipeline-sdivf-synthesize-{reads|deposits}-asset-packs-prompts
 * Call-site law: .docs/PROMPTING.md
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEASSETPACKS_IDENTITY_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_pipeline_synthesizeassetpacks_identity_corestatement';
import { PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEASSETPACKS_SOURCESAFETY_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_pipeline_synthesizeassetpacks_sourcesafety_detailcontent';
import { PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEASSETPACKS_MEASUREMENTS_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_pipeline_synthesizeassetpacks_measurements_detailcontent';

/** Shared product identity for deposit + read synthesize pipelines. */
export const EXECUTION_PIPELINE_SDIVF_SYNTHESIZE_ASSET_PACKS_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('identity', PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEASSETPACKS_IDENTITY_CORESTATEMENT);
  p.set('source_safety', PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEASSETPACKS_SOURCESAFETY_DETAILCONTENT);
  p.set('measurements', PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEASSETPACKS_MEASUREMENTS_DETAILCONTENT);
  return p;
})();
