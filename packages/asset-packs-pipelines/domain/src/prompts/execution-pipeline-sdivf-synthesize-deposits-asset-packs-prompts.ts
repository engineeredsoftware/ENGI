/**
 * Product Prompts for ExecutionPipelineSDIVFSynthesizeDepositAssetPacks.
 *
 * LAW: PromptPart strings are imported from raw_promptparts only — never inline.
 * File: execution-pipeline-sdivf-synthesize-deposits-asset-packs-prompts
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEDEPOSITSASSETPACKS_LENS_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_pipeline_synthesizedepositsassetpacks_lens_corestatement';
import { PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEDEPOSITSASSETPACKS_NAME_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_pipeline_synthesizedepositsassetpacks_name_corestatement';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_SETUP_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizedeposits_setup_objective_corestatement';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_SETUP_ROSTER_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizedeposits_setup_roster_detailcontent';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_DISCOVERY_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizedeposits_discovery_objective_corestatement';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_DISCOVERY_ROSTER_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizedeposits_discovery_roster_detailcontent';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_IMPLEMENTATION_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizedeposits_implementation_objective_corestatement';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_IMPLEMENTATION_ROSTER_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizedeposits_implementation_roster_detailcontent';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_VALIDATION_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizedeposits_validation_objective_corestatement';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_VALIDATION_ROSTER_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizedeposits_validation_roster_detailcontent';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_FINISH_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizedeposits_finish_objective_corestatement';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_FINISH_ROSTER_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizedeposits_finish_roster_detailcontent';
import { EXECUTION_PIPELINE_SDIVF_SYNTHESIZE_ASSET_PACKS_PROMPT } from './execution-pipeline-sdivf-synthesize-asset-packs-prompts';

export const EXECUTION_PIPELINE_SDIVF_SYNTHESIZE_DEPOSITS_ASSET_PACKS_PROMPT: Prompt = (() => {
  const p = EXECUTION_PIPELINE_SDIVF_SYNTHESIZE_ASSET_PACKS_PROMPT.clone();
  p.set('lens', PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEDEPOSITSASSETPACKS_LENS_CORESTATEMENT);
  p.set('name', PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEDEPOSITSASSETPACKS_NAME_CORESTATEMENT);
  return p;
})();

export const EXECUTION_PHASE_SDIVF_SYNTHESIZE_DEPOSITS_SETUP_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('objective', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_SETUP_OBJECTIVE_CORESTATEMENT);
  p.set('roster', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_SETUP_ROSTER_DETAILCONTENT);
  return p;
})();

export const EXECUTION_PHASE_SDIVF_SYNTHESIZE_DEPOSITS_DISCOVERY_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('objective', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_DISCOVERY_OBJECTIVE_CORESTATEMENT);
  p.set('roster', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_DISCOVERY_ROSTER_DETAILCONTENT);
  return p;
})();

export const EXECUTION_PHASE_SDIVF_SYNTHESIZE_DEPOSITS_IMPLEMENTATION_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('objective', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_IMPLEMENTATION_OBJECTIVE_CORESTATEMENT);
  p.set('roster', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_IMPLEMENTATION_ROSTER_DETAILCONTENT);
  return p;
})();

export const EXECUTION_PHASE_SDIVF_SYNTHESIZE_DEPOSITS_VALIDATION_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('objective', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_VALIDATION_OBJECTIVE_CORESTATEMENT);
  p.set('roster', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_VALIDATION_ROSTER_DETAILCONTENT);
  return p;
})();

export const EXECUTION_PHASE_SDIVF_SYNTHESIZE_DEPOSITS_FINISH_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('objective', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_FINISH_OBJECTIVE_CORESTATEMENT);
  p.set('roster', PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_FINISH_ROSTER_DETAILCONTENT);
  return p;
})();
