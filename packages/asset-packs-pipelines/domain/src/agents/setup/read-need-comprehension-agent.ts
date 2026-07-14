/**
 * Read Setup: comprehend the reader's Need (instruction) — deposit twin of
 * setup:comprehend-obfuscations.
 *
 * Produces structured Need guidance + **dynamic neediness measurement plan**
 * (kinds that MUST end with `-fit`, e.g. needs-auth-refresh-fit).
 * Empty Need skips LLM (fail later at danger-wall if required).
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';
import { projectInventoryForPrompt } from '../../asset-packs-synthesis';
import { slugifyNeedinessKind } from '../../read-neediness-measurements';

const part = (content: string): PromptPart => content as PromptPart;

const NeedComprehensionSchema = z.object({
  summary: z.string(),
  needTopics: z.array(z.string()).optional(),
  acceptanceCriteria: z.array(z.string()).optional(),
  /** Dynamic neediness kinds to measure (each must end with -fit). */
  dynamicNeedinessKinds: z.array(z.string()).optional(),
  honorNotes: z.array(z.string()).optional(),
});

const OutputSchema = z.object({
  comprehension: NeedComprehensionSchema,
});

export type ReadNeedComprehension = z.infer<typeof NeedComprehensionSchema>;

const IDENTITY = part(
  'You are the SynthesizeAssetPacks Setup agent that comprehends the reader NEED. ' +
    'Map free-text Need text against the Host sourceCheckoutCatalog (paths/samples only). ' +
    'Produce structured Need guidance and a plan of DYNAMIC neediness measurement kinds ' +
    'to run after synthesis. Every dynamic kind MUST end with the suffix "-fit" ' +
    '(e.g. needs-session-refresh-fit). Never quote raw source or secrets.',
);

const REQUIREMENTS = part(
  'From the Need text and sourceCheckoutCatalog, derive: summary, needTopics, ' +
    'acceptanceCriteria, dynamicNeedinessKinds (3–8 short *-fit kinds grounded in the Need; ' +
    'always suffix -fit), and honorNotes. Return ONLY {"comprehension": {...}}.',
);

const PLAN = part('Plan: parse the Need into topics, criteria, and fit dimensions to measure.');
const TRY = part(
  'Try: map Need ideas onto catalog-grounded topics and dynamic *-fit measurement kinds.',
);
const REFINE = part(
  'Refine: ensure every dynamicNeedinessKinds entry ends with -fit and is source-safe.',
);
const RETRY = part('Retry: return minimal Need guidance with at least one *-fit kind rather than fail.');

function createPrompt(): Prompt {
  const prompt = new Prompt();
  prompt.set('agent:identity', IDENTITY);
  prompt.set('agent:requirements', REQUIREMENTS);
  prompt.set('ptrr:plan', PLAN);
  prompt.set('ptrr:try', TRY);
  prompt.set('ptrr:refine', REFINE);
  prompt.set('ptrr:retry', RETRY);
  prompt.require('agent:identity');
  prompt.require('agent:requirements');
  prompt.requirePattern('ptrr:*');
  return prompt;
}

const prompt = createPrompt();

export const ReadNeedComprehensionAgent = factoryPTRRAgent<any, z.infer<typeof OutputSchema>>({
  name: 'ReadNeedComprehensionAgent',
  description: 'Comprehends reader Need into guidance + dynamic *-fit neediness plan.',
  outputSchema: OutputSchema,
  tools: [],
  prompt,
  stepPrompts: {
    plan: () => prompt,
    try: () => prompt,
    refine: () => prompt,
    retry: () => prompt,
  },
  plan: { chunkThreshold: 2000 },
  try: { chunkThreshold: 4000 },
  refine: { maxAttempts: 2 },
  retry: { maxAttempts: 1 },
});

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

function normalizeDynamicKinds(kinds: unknown, needText: string): string[] {
  const raw = Array.isArray(kinds) ? kinds.map(String) : [];
  const fromModel = raw
    .map((k) => slugifyNeedinessKind(k))
    .filter((k) => k.endsWith('-fit'));
  if (fromModel.length > 0) return [...new Set(fromModel)].slice(0, 8);
  // Fallback: derive one kind from Need text
  const fallback = slugifyNeedinessKind(needText.slice(0, 48) || 'need');
  return [fallback.endsWith('-fit') ? fallback : `${fallback}-fit`];
}

export default async function runReadNeedComprehensionAgent(input: any, execution: any) {
  const needText =
    input?.need ??
    input?.needs ??
    input?.instructions ??
    findValue(execution, 'read', 'need') ??
    findValue(execution, 'deposit', 'obfuscations') ??
    '';
  const repository = input?.repository ?? findValue(execution, 'read', 'repository') ??
    findValue(execution, 'deposit', 'repository') ?? {};
  const catalog =
    input?.sourceCheckoutCatalog ??
    input?.inventory ??
    findValue(execution, 'read', 'sourceCheckoutCatalog') ??
    findValue(execution, 'deposit', 'sourceCheckoutCatalog') ??
    findValue(execution, 'deposit', 'inventory');

  const text = typeof needText === 'string' ? needText.trim() : '';
  if (!text) {
    const empty: ReadNeedComprehension = {
      summary: 'No Need text declared; reader must provide a Need to synthesize packs.',
      needTopics: [],
      acceptanceCriteria: [],
      dynamicNeedinessKinds: [],
      honorNotes: [],
    };
    storeCrossPhaseArtifact(execution, 'setup', 'inputComprehension', empty);
    storeCrossPhaseArtifact(execution, 'setup', 'needComprehension', empty);
    storeCrossPhaseArtifact(execution, 'read', 'needComprehension', empty);
    return {
      ...(input || {}),
      success: true,
      comprehension: empty,
      comprehensionMode: 'empty-need-skip-llm',
    };
  }

  const catalogForPrompt = projectInventoryForPrompt(catalog);
  const raw = await ReadNeedComprehensionAgent(
    {
      ...input,
      need: text,
      repository,
      sourceCheckoutCatalog: catalogForPrompt,
      inventoryPaths: catalogForPrompt?.paths ?? catalog?.paths,
    },
    execution,
  );
  const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;
  const base: ReadNeedComprehension = (result as any)?.comprehension ?? {
    summary: text.slice(0, 400),
    needTopics: [],
    acceptanceCriteria: [],
    dynamicNeedinessKinds: [],
    honorNotes: [],
  };
  const comprehension: ReadNeedComprehension = {
    ...base,
    dynamicNeedinessKinds: normalizeDynamicKinds(base.dynamicNeedinessKinds, text),
  };

  storeCrossPhaseArtifact(execution, 'setup', 'inputComprehension', comprehension);
  storeCrossPhaseArtifact(execution, 'setup', 'needComprehension', comprehension);
  storeCrossPhaseArtifact(execution, 'read', 'needComprehension', comprehension);
  storeCrossPhaseArtifact(execution, 'read', 'need', text);

  return { ...(input || {}), success: true, comprehension };
}
