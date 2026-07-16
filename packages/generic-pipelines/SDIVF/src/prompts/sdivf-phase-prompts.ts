/**
 * SDIVF base phase Prompts — one per SDIVF phase name.
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { createPromptPart } from '@bitcode/prompts/parts/PromptPart';

function phase(name: string, objective: string, stores: string): Prompt {
  const p = new Prompt();
  p.set('name', createPromptPart(name));
  p.set('objective', createPromptPart(objective));
  p.set('stores', createPromptPart(stores));
  return p;
}

export const SDIVF_PHASE_SETUP_PROMPT = phase(
  'setup',
  'Setup prepares the Host working tree, initializes measurement/tool surfaces, comprehends steering (Need or Obfuscations), and admits the run via danger-wall before Discovery.',
  'Typical stores: repository workspacePath, setup admission, LSP/MCP readiness, input comprehension artifacts.',
);

export const SDIVF_PHASE_DISCOVERY_PROMPT = phase(
  'discovery',
  'Discovery maps Host checkout material and product-relevant Depository evidence (after wave-1 parallel work when applicable).',
  'Typical stores: sourceMeasurements, depository search results, knowledge maps.',
);

export const SDIVF_PHASE_IMPLEMENTATION_PROMPT = phase(
  'implementation',
  'Implementation synthesizes measured AssetPack options (or patches) from Discovery evidence under source-safety.',
  'Typical stores: implementation options / assetPacks / selection candidates.',
);

export const SDIVF_PHASE_VALIDATION_PROMPT = phase(
  'validation',
  'Validation gates readiness to Finish (or to iterate DIV) with concrete evidence-backed issues only.',
  'Typical stores: validation issues, ready-to-finish flags.',
);

export const SDIVF_PHASE_FINISH_PROMPT = phase(
  'finish',
  'Finish records terminal artifacts and selection envelopes for product surfaces; it does not settle BTC or ship PRs (those are Simple settle).',
  'Typical stores: finish selectionEnvelope, ledger/store receipts when configured.',
);

export function sdivfPhasePromptFor(phaseName: string): Prompt {
  switch (String(phaseName).toLowerCase()) {
    case 'setup':
      return SDIVF_PHASE_SETUP_PROMPT;
    case 'discovery':
      return SDIVF_PHASE_DISCOVERY_PROMPT;
    case 'implementation':
      return SDIVF_PHASE_IMPLEMENTATION_PROMPT;
    case 'validation':
      return SDIVF_PHASE_VALIDATION_PROMPT;
    case 'finish':
      return SDIVF_PHASE_FINISH_PROMPT;
    default:
      return phase(phaseName, `SDIVF phase ${phaseName}.`, 'Phase-local stores only.');
  }
}
