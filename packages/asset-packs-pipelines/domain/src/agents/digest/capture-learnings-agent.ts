/**
 * Capture Learnings Agent (Digest Phase)
 *
 * Analyzes execution results and proposes AGENTS.md updates.
 * Extracts Q&A patterns, user iterates and provides feedback.
 */

import { factoryAgentWithPTRR } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import { createPromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';

const CaptureLearningsInputSchema = z.object({
  executionResults: z.any(), // Results from Develop phase
  fileChanges: z.any(), // File change statistics
  currentAgentsMd: z.string().optional(),
  userFeedback: z.string().optional()
});

const CaptureLearningsOutputSchema = z.object({
  agentsMdUpdates: z.string(),
  questionsAnswered: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    files: z.array(z.string()),
    codeExample: z.string().optional()
  })),
  patternsDocumented: z.array(z.object({
    pattern: z.string(),
    description: z.string(),
    whenToUse: z.string()
  })),
  readyToFinish: z.boolean(),
  useTools: z.array(z.object({
    name: z.string(),
    input: z.any()
  })).optional()
});

function createCaptureLearningsStepPrompt(purpose: string): Prompt {
  const prompt = new Prompt();
  prompt.set('step/purpose', createPromptPart(purpose));
  prompt.require('step/purpose');
  return prompt;
}

const captureLearningsPrompt = (() => {
  const prompt = new Prompt();
  prompt.set(
    'agent/identity',
    createPromptPart('Bitcode digest-phase agent for converting execution evidence into reviewable AGENTS.md knowledge and AssetPack follow-through notes.')
  );
  prompt.set(
    'agent/purpose',
    createPromptPart('Summarize what the Bitcode inference run learned, which questions it answered, and which durable patterns should be written back for future source-to-shares runs.')
  );
  prompt.set(
    'agent/constraints',
    createPromptPart('Do not treat observed behavior as proof unless backed by source or verification evidence; preserve operator feedback as an explicit review input.')
  );
  prompt.set('ptrr/plan/purpose', createPromptPart('Plan the digest around execution results, changed files, answered questions, and reusable Bitcode operating patterns.'));
  prompt.set('ptrr/try/purpose', createPromptPart('Draft AGENTS.md updates and learning records with source-backed specificity.'));
  prompt.set('ptrr/refine/purpose', createPromptPart('Refine learning records against operator feedback, missing evidence, and future-run usefulness.'));
  prompt.set('ptrr/retry/purpose', createPromptPart('Recover by emitting conservative documented patterns and unresolved questions without overclaiming closure.'));
  prompt.require('agent/identity');
  prompt.require('agent/purpose');
  prompt.requirePattern('ptrr/*/purpose');
  return prompt;
})();

const captureLearningsStepPrompts = {
  plan: () => createCaptureLearningsStepPrompt('Plan source-backed AGENTS.md learning updates from the completed Bitcode run evidence.'),
  try: () => createCaptureLearningsStepPrompt('Draft AGENTS.md updates, answered questions, and reusable patterns from execution evidence.'),
  refine: () => createCaptureLearningsStepPrompt('Tighten learning records against feedback, source references, and proof-boundary honesty.'),
  retry: () => createCaptureLearningsStepPrompt('Return conservative learning updates and unresolved questions when digest evidence is incomplete.'),
};

const captureLearningsAgent = factoryAgentWithPTRR<
  z.infer<typeof CaptureLearningsInputSchema>,
  z.infer<typeof CaptureLearningsOutputSchema>
>({
  name: 'digest-capture-learnings',
  description: 'Bitcode digest-phase agent for writing source-backed AGENTS.md learning records from run evidence and operator feedback',

  outputSchema: CaptureLearningsOutputSchema,
  prompt: captureLearningsPrompt,
  stepPrompts: captureLearningsStepPrompts,

  tools: ['Write', 'Edit'], // Can edit the AGENTS.md learning asset.

  plan: { chunkThreshold: 2000 },
  try: { chunkThreshold: 5000 },
  refine: { maxAttempts: 2 },
  retry: { maxAttempts: 1 }
});

export const CaptureLearningsAgent = captureLearningsAgent;

export default async function captureLearningsWithStore(input: any, execution: any) {
  const result = await captureLearningsAgent(input, execution);
  try {
    execution.store('digest', 'proposal', {
      ...result,
      capturedAt: new Date().toISOString()
    });
  } catch {}
  return result;
}
