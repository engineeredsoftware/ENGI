/**
 * Product Prompts for ExecutionPipelineSDIVFSynthesizeReadAssetPacks.
 *
 * LAW: PromptPart strings are imported from raw_promptparts only — never inline.
 * File: execution-pipeline-sdivf-synthesize-reads-asset-packs-prompts
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEREADSASSETPACKS_LENS_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_pipeline_synthesizereadsassetpacks_lens_corestatement';
import { PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEREADSASSETPACKS_NAME_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_pipeline_synthesizereadsassetpacks_name_corestatement';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_SETUP_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizereads_setup_objective_corestatement';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_SETUP_ROSTER_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizereads_setup_roster_detailcontent';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_DISCOVERY_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizereads_discovery_objective_corestatement';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_DISCOVERY_ROSTER_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizereads_discovery_roster_detailcontent';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_IMPLEMENTATION_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizereads_implementation_objective_corestatement';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_IMPLEMENTATION_ROSTER_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizereads_implementation_roster_detailcontent';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_VALIDATION_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizereads_validation_objective_corestatement';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_VALIDATION_ROSTER_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizereads_validation_roster_detailcontent';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_FINISH_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizereads_finish_objective_corestatement';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_FINISH_ROSTER_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizereads_finish_roster_detailcontent';
import { EXECUTION_PIPELINE_SDIVF_SYNTHESIZE_ASSET_PACKS_PROMPT } from './execution-pipeline-sdivf-synthesize-asset-packs-prompts';

export const EXECUTION_PIPELINE_SDIVF_SYNTHESIZE_READS_ASSET_PACKS_PROMPT: Prompt = (() => {
  const p = EXECUTION_PIPELINE_SDIVF_SYNTHESIZE_ASSET_PACKS_PROMPT.clone();
  p.set('lens', PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEREADSASSETPACKS_LENS_CORESTATEMENT);
  p.set('name', PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEREADSASSETPACKS_NAME_CORESTATEMENT);
  return p;
})();

export const EXECUTION_PHASE_SDIVF_SYNTHESIZE_READS_SETUP_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('objective', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_SETUP_OBJECTIVE_CORESTATEMENT);
  p.set('roster', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_SETUP_ROSTER_DETAILCONTENT);
  return p;
})();

export const EXECUTION_PHASE_SDIVF_SYNTHESIZE_READS_DISCOVERY_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('objective', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_DISCOVERY_OBJECTIVE_CORESTATEMENT);
  p.set('roster', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_DISCOVERY_ROSTER_DETAILCONTENT);
  return p;
})();

export const EXECUTION_PHASE_SDIVF_SYNTHESIZE_READS_IMPLEMENTATION_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('objective', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_IMPLEMENTATION_OBJECTIVE_CORESTATEMENT);
  p.set('roster', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_IMPLEMENTATION_ROSTER_DETAILCONTENT);
  return p;
})();

export const EXECUTION_PHASE_SDIVF_SYNTHESIZE_READS_VALIDATION_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('objective', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_VALIDATION_OBJECTIVE_CORESTATEMENT);
  p.set('roster', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_VALIDATION_ROSTER_DETAILCONTENT);
  return p;
})();

export const EXECUTION_PHASE_SDIVF_SYNTHESIZE_READS_FINISH_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('objective', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_FINISH_OBJECTIVE_CORESTATEMENT);
  p.set('roster', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_FINISH_ROSTER_DETAILCONTENT);
  return p;
})();
