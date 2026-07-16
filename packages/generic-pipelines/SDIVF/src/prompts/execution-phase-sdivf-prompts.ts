/**
 * SDIVF base phase Prompts — assembled from raw_promptparts only.
 */

import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { PROMPTPART_GENERIC_SDIVFPHASE_SETUP_NAME_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_setup_name_corestatement';
import { PROMPTPART_GENERIC_SDIVFPHASE_SETUP_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_setup_objective_corestatement';
import { PROMPTPART_GENERIC_SDIVFPHASE_SETUP_STORES_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_setup_stores_detailcontent';
import { PROMPTPART_GENERIC_SDIVFPHASE_DISCOVERY_NAME_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_discovery_name_corestatement';
import { PROMPTPART_GENERIC_SDIVFPHASE_DISCOVERY_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_discovery_objective_corestatement';
import { PROMPTPART_GENERIC_SDIVFPHASE_DISCOVERY_STORES_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_discovery_stores_detailcontent';
import { PROMPTPART_GENERIC_SDIVFPHASE_IMPLEMENTATION_NAME_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_implementation_name_corestatement';
import { PROMPTPART_GENERIC_SDIVFPHASE_IMPLEMENTATION_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_implementation_objective_corestatement';
import { PROMPTPART_GENERIC_SDIVFPHASE_IMPLEMENTATION_STORES_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_implementation_stores_detailcontent';
import { PROMPTPART_GENERIC_SDIVFPHASE_VALIDATION_NAME_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_validation_name_corestatement';
import { PROMPTPART_GENERIC_SDIVFPHASE_VALIDATION_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_validation_objective_corestatement';
import { PROMPTPART_GENERIC_SDIVFPHASE_VALIDATION_STORES_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_validation_stores_detailcontent';
import { PROMPTPART_GENERIC_SDIVFPHASE_FINISH_NAME_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_finish_name_corestatement';
import { PROMPTPART_GENERIC_SDIVFPHASE_FINISH_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_finish_objective_corestatement';
import { PROMPTPART_GENERIC_SDIVFPHASE_FINISH_STORES_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_finish_stores_detailcontent';
import { PROMPTPART_GENERIC_SDIVFPHASE_UNKNOWN_NAME_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_unknown_name_corestatement';
import { PROMPTPART_GENERIC_SDIVFPHASE_UNKNOWN_OBJECTIVE_CORESTATEMENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_unknown_objective_corestatement';
import { PROMPTPART_GENERIC_SDIVFPHASE_UNKNOWN_STORES_DETAILCONTENT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_sdivfphase_unknown_stores_detailcontent';

function phase(name: PromptPart, objective: PromptPart, stores: PromptPart): Prompt {
  const p = new Prompt();
  p.set('name', name);
  p.set('objective', objective);
  p.set('stores', stores);
  return p;
}

export const EXECUTION_PHASE_SDIVF_SETUP_PROMPT = phase(
  PROMPTPART_GENERIC_SDIVFPHASE_SETUP_NAME_CORESTATEMENT,
  PROMPTPART_GENERIC_SDIVFPHASE_SETUP_OBJECTIVE_CORESTATEMENT,
  PROMPTPART_GENERIC_SDIVFPHASE_SETUP_STORES_DETAILCONTENT,
);

export const EXECUTION_PHASE_SDIVF_DISCOVERY_PROMPT = phase(
  PROMPTPART_GENERIC_SDIVFPHASE_DISCOVERY_NAME_CORESTATEMENT,
  PROMPTPART_GENERIC_SDIVFPHASE_DISCOVERY_OBJECTIVE_CORESTATEMENT,
  PROMPTPART_GENERIC_SDIVFPHASE_DISCOVERY_STORES_DETAILCONTENT,
);

export const EXECUTION_PHASE_SDIVF_IMPLEMENTATION_PROMPT = phase(
  PROMPTPART_GENERIC_SDIVFPHASE_IMPLEMENTATION_NAME_CORESTATEMENT,
  PROMPTPART_GENERIC_SDIVFPHASE_IMPLEMENTATION_OBJECTIVE_CORESTATEMENT,
  PROMPTPART_GENERIC_SDIVFPHASE_IMPLEMENTATION_STORES_DETAILCONTENT,
);

export const EXECUTION_PHASE_SDIVF_VALIDATION_PROMPT = phase(
  PROMPTPART_GENERIC_SDIVFPHASE_VALIDATION_NAME_CORESTATEMENT,
  PROMPTPART_GENERIC_SDIVFPHASE_VALIDATION_OBJECTIVE_CORESTATEMENT,
  PROMPTPART_GENERIC_SDIVFPHASE_VALIDATION_STORES_DETAILCONTENT,
);

export const EXECUTION_PHASE_SDIVF_FINISH_PROMPT = phase(
  PROMPTPART_GENERIC_SDIVFPHASE_FINISH_NAME_CORESTATEMENT,
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
      return phase(
        PROMPTPART_GENERIC_SDIVFPHASE_UNKNOWN_NAME_CORESTATEMENT,
        PROMPTPART_GENERIC_SDIVFPHASE_UNKNOWN_OBJECTIVE_CORESTATEMENT,
        PROMPTPART_GENERIC_SDIVFPHASE_UNKNOWN_STORES_DETAILCONTENT,
      );
  }
}
