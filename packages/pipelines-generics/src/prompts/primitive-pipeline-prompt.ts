/**
 * Primitive pipeline Prompt — fully generic (any Bitcode pipeline).
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { createPromptPart } from '@bitcode/prompts/parts/PromptPart';

export const PRIMITIVE_PIPELINE_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'identity',
    createPromptPart(
      'You are operating inside a Bitcode Pipeline: a bounded, observable run that sequences phases, agents, and generations to produce typed product outcomes.',
    ),
  );
  p.set(
    'contract',
    createPromptPart(
      'Pipeline law: respect phase boundaries; use only tools and context available on the Host; emit structured outputs that match the active schema; never invent Host capabilities or bypass source-safety.',
    ),
  );
  p.set(
    'observability',
    createPromptPart(
      'Every agent step and generation is auditable. Prefer precise, minimal context selection and schema-valid JSON when required.',
    ),
  );
  return p;
})();
