/**
 * SDIVF base phase Prompts — assembled from raw_promptparts.
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { createPromptPart } from '@bitcode/prompts/parts/PromptPart';
import { PROMPTPART_GENERIC_SDIVFPHASE_SETUP_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_setup_objective_corestatement';
import { PROMPTPART_GENERIC_SDIVFPHASE_SETUP_STORES_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_setup_stores_detailcontent';
import { PROMPTPART_GENERIC_SDIVFPHASE_DISCOVERY_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_discovery_objective_corestatement';
import { PROMPTPART_GENERIC_SDIVFPHASE_DISCOVERY_STORES_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_discovery_stores_detailcontent';
import { PROMPTPART_GENERIC_SDIVFPHASE_IMPLEMENTATION_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_implementation_objective_corestatement';
import { PROMPTPART_GENERIC_SDIVFPHASE_IMPLEMENTATION_STORES_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_implementation_stores_detailcontent';
import { PROMPTPART_GENERIC_SDIVFPHASE_VALIDATION_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_validation_objective_corestatement';
import { PROMPTPART_GENERIC_SDIVFPHASE_VALIDATION_STORES_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_validation_stores_detailcontent';
import { PROMPTPART_GENERIC_SDIVFPHASE_FINISH_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_finish_objective_corestatement';
import { PROMPTPART_GENERIC_SDIVFPHASE_FINISH_STORES_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_finish_stores_detailcontent';

function phase(
  name: string,
  objective: ReturnType<typeof createPromptPart> | string,
  stores: ReturnType<typeof createPromptPart> | string,
): Prompt {
  const p = new Prompt();
  p.set('name', createPromptPart(name));
  p.set(
    'objective',
    typeof objective === 'string' ? createPromptPart(objective) : objective,
  );
  p.set(
    'stores',
    typeof stores === 'string' ? createPromptPart(stores) : stores,
  );
  return p;
}

export const EXECUTION_PHASE_SDIVF_SETUP_PROMPT = phase(
  'setup',
  PROMPTPART_GENERIC_SDIVFPHASE_SETUP_OBJECTIVE_CORESTATEMENT,
  PROMPTPART_GENERIC_SDIVFPHASE_SETUP_STORES_DETAILCONTENT,
);

export const EXECUTION_PHASE_SDIVF_DISCOVERY_PROMPT = phase(
  'discovery',
  PROMPTPART_GENERIC_SDIVFPHASE_DISCOVERY_OBJECTIVE_CORESTATEMENT,
  PROMPTPART_GENERIC_SDIVFPHASE_DISCOVERY_STORES_DETAILCONTENT,
);

export const EXECUTION_PHASE_SDIVF_IMPLEMENTATION_PROMPT = phase(
  'implementation',
  PROMPTPART_GENERIC_SDIVFPHASE_IMPLEMENTATION_OBJECTIVE_CORESTATEMENT,
  PROMPTPART_GENERIC_SDIVFPHASE_IMPLEMENTATION_STORES_DETAILCONTENT,
);

export const EXECUTION_PHASE_SDIVF_VALIDATION_PROMPT = phase(
  'validation',
  PROMPTPART_GENERIC_SDIVFPHASE_VALIDATION_OBJECTIVE_CORESTATEMENT,
  PROMPTPART_GENERIC_SDIVFPHASE_VALIDATION_STORES_DETAILCONTENT,
);

export const EXECUTION_PHASE_SDIVF_FINISH_PROMPT = phase(
  'finish',
  PROMPTPART_GENERIC_SDIVFPHASE_FINISH_OBJECTIVE_CORESTATEMENT,
  PROMPTPART_GENERIC_SDIVFPHASE_FINISH_STORES_DETAILCONTENT,
);

export function executionPhaseSdivfPromptFor(phaseName: string): Prompt {
  switch (String(phaseName).toLowerCase()) {
    case 'setup':
      return EXECUTION_PHASE_SDIVF_SETUP_PROMPT;
    case 'discovery':
      return EXECUTION_PHASE_SDIVF_DISCOVERY_PROMPT;
    case 'implementation':
      return EXECUTION_PHASE_SDIVF_IMPLEMENTATION_PROMPT;
    case 'validation':
      return EXECUTION_PHASE_SDIVF_VALIDATION_PROMPT;
    case 'finish':
      return EXECUTION_PHASE_SDIVF_FINISH_PROMPT;
    default:
      return phase(phaseName, `SDIVF phase ${phaseName}.`, 'Phase-local stores only.');
  }
}
