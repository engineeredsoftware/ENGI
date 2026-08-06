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
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import { projectInventoryForPrompt } from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis';
import {
  planDynamicNeedinessesFromContext,
  type DynamicNeedinessPlanRow,
} from '../../read-neediness-measurements';

const part = (content: string): PromptPart => content as PromptPart;

const DynamicNeedinessRowSchema = z.object({
  measurementKind: z.string(),
  label: z.string().optional(),
  guidance: z.string().optional(),
  weight: z.number().optional(),
});

const NeedComprehensionSchema = z.object({
  summary: z.string(),
  needTopics: z.array(z.string()).optional(),
  acceptanceCriteria: z.array(z.string()).optional(),
  /** Dynamic neediness kinds to measure (each must end with -fit). */
  dynamicNeedinessKinds: z.array(z.string()).optional(),
  /**
   * Preferred: full dynamic plan with human labels + guidance grounded in Need
   * and (when available) codebase topics.
   */
  dynamicNeedinesses: z.array(DynamicNeedinessRowSchema).optional(),
  honorNotes: z.array(z.string()).optional(),
});

const OutputSchema = z.object({
  comprehension: NeedComprehensionSchema,
});

export type ReadNeedComprehension = z.infer<typeof NeedComprehensionSchema>;

const IDENTITY = part(
  'You are the SynthesizeAssetPacks Setup agent that comprehends the reader NEED. ' +
    'Map free-text Need text against the Host sourceCheckoutCatalog (paths/samples only). ' +
    'Produce structured Need guidance and a DYNAMIC neediness measurement PLAN ' +
    '(kinds + human labels + guidance + relative weights) to run after synthesis. ' +
    'Every dynamic kind MUST end with the suffix "-fit" (e.g. needs-session-refresh-fit). ' +
    'Labels are short product titles (e.g. "Session refresh fit"), not slugs. ' +
    'Never quote raw source or secrets.',
);

const REQUIREMENTS = part(
  'From the Need text and sourceCheckoutCatalog, derive: summary, needTopics, ' +
    'acceptanceCriteria, dynamicNeedinesses (3–8 objects: measurementKind ending -fit, ' +
    'label, guidance how to score pack vs Need, weight), and honorNotes. ' +
    'You may also emit dynamicNeedinessKinds as a fallback. Return ONLY {"comprehension": {...}}.',
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

export type ReadNeedComprehensionEnriched = ReadNeedComprehension & {
  dynamicNeedinesses: DynamicNeedinessPlanRow[];
};

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
    findValue(execution, 'read', 'sourceCheckoutCatalog') ??
    findValue(execution, 'deposit', 'sourceCheckoutCatalog');

  const text = typeof needText === 'string' ? needText.trim() : '';
  if (!text) {
    const empty: ReadNeedComprehensionEnriched = {
      summary: 'No Need text declared; reader must provide a Need to synthesize packs.',
      needTopics: [],
      acceptanceCriteria: [],
      dynamicNeedinessKinds: [],
      dynamicNeedinesses: [],
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

  // Prefer model dynamicNeedinesses; else kinds; ground labels from Need + paths.
  const pathHints = Array.isArray(catalogForPrompt?.paths)
    ? (catalogForPrompt.paths as string[]).slice(0, 24)
    : Array.isArray(catalog?.paths)
      ? (catalog.paths as string[]).slice(0, 24)
      : [];
  const existing =
    Array.isArray(base.dynamicNeedinesses) && base.dynamicNeedinesses.length > 0
      ? base.dynamicNeedinesses
      : base.dynamicNeedinessKinds || [];
  const dynamicNeedinesses = planDynamicNeedinessesFromContext({
    needText: text,
    needTopics: base.needTopics,
    acceptanceCriteria: base.acceptanceCriteria,
    pathHints,
    existing: existing as Array<string | DynamicNeedinessPlanRow>,
  });

  const comprehension: ReadNeedComprehensionEnriched = {
    ...base,
    dynamicNeedinessKinds: dynamicNeedinesses.map((d) => d.measurementKind),
    dynamicNeedinesses,
  };

  storeCrossPhaseArtifact(execution, 'setup', 'inputComprehension', comprehension);
  storeCrossPhaseArtifact(execution, 'setup', 'needComprehension', comprehension);
  storeCrossPhaseArtifact(execution, 'read', 'needComprehension', comprehension);
  storeCrossPhaseArtifact(execution, 'read', 'need', text);

  return { ...(input || {}), success: true, comprehension };
}
