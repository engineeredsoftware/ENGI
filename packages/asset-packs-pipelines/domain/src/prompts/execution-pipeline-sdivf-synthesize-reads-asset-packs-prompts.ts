/**
 * Product Prompts for ExecutionPipelineSDIVFSynthesizeReadAssetPacks.
 *
 * File: execution-pipeline-sdivf-synthesize-reads-asset-packs-prompts
 * Call-site law: .docs/PROMPTING.md
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { createPromptPart } from '@bitcode/prompts/parts/PromptPart';
import { PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEREADSASSETPACKS_LENS_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_pipeline_synthesizereadsassetpacks_lens_corestatement';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_SETUP_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizereads_setup_objective_corestatement';
import { PROMPTPART_SPECIFIC_PHASE_SYNTHESIZEREADS_SETUP_ROSTER_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_phase_synthesizereads_setup_roster_detailcontent';
import { EXECUTION_PIPELINE_SDIVF_SYNTHESIZE_ASSET_PACKS_PROMPT } from './execution-pipeline-sdivf-synthesize-asset-packs-prompts';

export const EXECUTION_PIPELINE_SDIVF_SYNTHESIZE_READS_ASSET_PACKS_PROMPT: Prompt = (() => {
  const p = EXECUTION_PIPELINE_SDIVF_SYNTHESIZE_ASSET_PACKS_PROMPT.clone();
  p.set('lens', PROMPTPART_SPECIFIC_PIPELINE_SYNTHESIZEREADSASSETPACKS_LENS_CORESTATEMENT);
  p.set('name', createPromptPart('synthesize-reads-asset-packs-pipeline'));
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
  p.set(
    'objective',
    createPromptPart(
      'Discovery (read): map Host checkout material and search the Depository for Need-fits after wave-1 parallel comprehend/regurgitation when applicable.',
    ),
  );
  p.set(
    'roster',
    createPromptPart(
      'Read Discovery roster (typical): parallel {comprehend-codebase, inherent-regurgitation} → search-depository-for-read-need-fits.',
    ),
  );
  return p;
})();

export const EXECUTION_PHASE_SDIVF_SYNTHESIZE_READS_IMPLEMENTATION_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'objective',
    createPromptPart(
      'Implementation (read): synthesize measured read-satisfaction AssetPack options from Discovery evidence under source-safety and Need steering.',
    ),
  );
  p.set(
    'roster',
    createPromptPart('Read Implementation roster (typical): read-asset-pack-synthesis agent.'),
  );
  return p;
})();

export const EXECUTION_PHASE_SDIVF_SYNTHESIZE_READS_VALIDATION_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'objective',
    createPromptPart(
      'Validation (read): gate Need readiness to Finish (or iterate DIV) with concrete evidence-backed issues only — not settlement.',
    ),
  );
  p.set(
    'roster',
    createPromptPart(
      'Read Validation roster (typical): ready-to-finish / readiness validation agents.',
    ),
  );
  return p;
})();

export const EXECUTION_PHASE_SDIVF_SYNTHESIZE_READS_FINISH_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'objective',
    createPromptPart(
      'Finish (read): store selection envelope and terminal artifacts for /reads; do not settle BTC or ship PRs.',
    ),
  );
  p.set(
    'roster',
    createPromptPart(
      'Read Finish roster (typical): store-artifacts → ledgerize → finish-synthesize-asset-packs-for-read-run.',
    ),
  );
  return p;
})();
