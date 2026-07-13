/**
 * Iterate PRODUCT.md Agent (Design Phase)
 *
 * User-gated iteration on PRODUCT.md specification.
 * Reads requirements, proposes PRODUCT.md changes, user reviews and provides feedback.
 */

import { factoryAgentWithPTRR } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import { createPromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';

const IterateProductMdInputSchema = z.object({
  requirements: z.string(),
  currentProductMd: z.string().optional(),
  userFeedback: z.string().optional()
});

const IterateProductMdOutputSchema = z.object({
  productMdDraft: z.string(),
  changes: z.array(z.object({
    section: z.string(),
    change: z.string(),
    reason: z.string()
  })),
  completeness: z.number().min(0).max(1),
  openQuestions: z.array(z.string()),
  readyToImplement: z.boolean(),
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any()
  })).optional()
});

function createIterateProductMdStepPrompt(purpose: string): Prompt {
  const prompt = new Prompt();
  prompt.set('step/purpose', createPromptPart(purpose));
  prompt.require('step/purpose');
  return prompt;
}

const iterateProductMdPrompt = (() => {
  const prompt = new Prompt();
  prompt.set(
    'agent/identity',
    createPromptPart('Bitcode design-phase agent for refining PRODUCT.md written-asset specifications inside an AssetPack-producing inference run.')
  );
  prompt.set(
    'agent/purpose',
    createPromptPart('Convert measured requirements, current PRODUCT.md context, and operator feedback into a reviewable product-spec draft without bypassing Read review or AssetPack proof obligations.')
  );
  prompt.set(
    'agent/constraints',
    createPromptPart('Preserve operator-gated iteration, report open questions explicitly, and treat PRODUCT.md as a written asset carried by Bitcode AssetPacks rather than as a generic output bundle.')
  );
  prompt.set('ptrr/plan/purpose', createPromptPart('Plan the PRODUCT.md revision around the accepted Read, missing evidence, and reviewable product-spec sections.'));
  prompt.set('ptrr/try/purpose', createPromptPart('Draft precise PRODUCT.md changes and explain why each change advances the Bitcode source-to-shares requirement.'));
  prompt.set('ptrr/refine/purpose', createPromptPart('Refine the draft against operator feedback, completeness, and unresolved specification gaps.'));
  prompt.set('ptrr/retry/purpose', createPromptPart('Recover from ambiguity by emitting conservative edits, open questions, and a clear readiness judgment.'));
  prompt.require('agent/identity');
  prompt.require('agent/purpose');
  prompt.requirePattern('ptrr/*/purpose');
  return prompt;
})();

const iterateProductMdStepPrompts = {
  plan: () => createIterateProductMdStepPrompt('Plan reviewable PRODUCT.md written-asset revisions from the measured Bitcode Read.'),
  try: () => createIterateProductMdStepPrompt('Produce the PRODUCT.md draft, changes list, completeness score, and open questions.'),
  refine: () => createIterateProductMdStepPrompt('Tighten the PRODUCT.md draft against feedback and AssetPack proof criteria.'),
  retry: () => createIterateProductMdStepPrompt('Return a bounded recovery draft and readiness assessment when prior attempts are incomplete.'),
};

export const IterateProductMdAgent = factoryAgentWithPTRR<
  z.infer<typeof IterateProductMdInputSchema>,
  z.infer<typeof IterateProductMdOutputSchema>
>({
  name: 'design-iterate-product-md',
  description: 'Bitcode design-phase agent for iterating PRODUCT.md as an AssetPack written asset from measured requirements and operator feedback',

  outputSchema: IterateProductMdOutputSchema,
  prompt: iterateProductMdPrompt,
  stepPrompts: iterateProductMdStepPrompts,

  tools: ['Write', 'Edit'], // Can edit the PRODUCT.md written asset.

  plan: { chunkThreshold: 2000 },
  try: { chunkThreshold: 5000 },
  refine: { maxAttempts: 2 },
  retry: { maxAttempts: 1 }
});

export default IterateProductMdAgent;
