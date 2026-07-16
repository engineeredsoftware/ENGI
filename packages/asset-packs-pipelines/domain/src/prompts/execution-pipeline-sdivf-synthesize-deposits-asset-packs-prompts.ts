/**
 * Product Prompts for ExecutionPipelineSDIVFSynthesizeDepositAssetPacks.
 *
 * File: execution-pipeline-sdivf-synthesize-deposits-asset-packs-prompts
 * Call-site law: .docs/PROMPTING.md
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { createPromptPart } from '@bitcode/prompts/parts/PromptPart';
import { PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEDEPOSITSASSETPACKS_LENS_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_pipeline_synthesizedepositsassetpacks_lens_corestatement';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_SETUP_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizedeposits_setup_objective_corestatement';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEDEPOSITS_SETUP_ROSTER_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizedeposits_setup_roster_detailcontent';
import { EXECUTION_PIPELINE_SDIVF_SYNTHESIZE_ASSET_PACKS_PROMPT } from './execution-pipeline-sdivf-synthesize-asset-packs-prompts';

export const EXECUTION_PIPELINE_SDIVF_SYNTHESIZE_DEPOSITS_ASSET_PACKS_PROMPT: Prompt = (() => {
  const p = EXECUTION_PIPELINE_SDIVF_SYNTHESIZE_ASSET_PACKS_PROMPT.clone();
  p.set('lens', PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEDEPOSITSASSETPACKS_LENS_CORESTATEMENT);
  p.set('name', createPromptPart('synthesize-deposits-asset-packs-pipeline'));
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
  p.set(
    'objective',
    createPromptPart(
      'Discovery (deposit): map Host checkout supply and relevant Depository evidence under depositor Obfuscations.',
    ),
  );
  p.set(
    'roster',
    createPromptPart(
      'Deposit Discovery roster (typical): parallel {comprehend-codebase, inherent-regurgitation} → search-depository-for-deposit-relevants.',
    ),
  );
  return p;
})();

export const EXECUTION_PHASE_SDIVF_SYNTHESIZE_DEPOSITS_IMPLEMENTATION_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'objective',
    createPromptPart(
      'Implementation (deposit): synthesize measured DepositSynthesizedAssetPack options from Discovery evidence under source-safety and Obfuscations.',
    ),
  );
  p.set(
    'roster',
    createPromptPart(
      'Deposit Implementation roster (typical): deposit-asset-pack-synthesis agent.',
    ),
  );
  return p;
})();

export const EXECUTION_PHASE_SDIVF_SYNTHESIZE_DEPOSITS_VALIDATION_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'objective',
    createPromptPart(
      'Validation (deposit): gate readiness to Finish with Absolutes/measurement evidence; do not admit to Depository or settle.',
    ),
  );
  p.set(
    'roster',
    createPromptPart(
      'Deposit Validation roster (typical): deposit readiness / ready-to-finish agents.',
    ),
  );
  return p;
})();

export const EXECUTION_PHASE_SDIVF_SYNTHESIZE_DEPOSITS_FINISH_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'objective',
    createPromptPart(
      'Finish (deposit): store deposit options and terminal artifacts for /deposits review/admission — not PR ship (settle is Simple).',
    ),
  );
  p.set(
    'roster',
    createPromptPart(
      'Deposit Finish roster (typical): store-artifacts → ledgerize → finish-synthesize-asset-packs-for-deposit-run.',
    ),
  );
  return p;
})();
