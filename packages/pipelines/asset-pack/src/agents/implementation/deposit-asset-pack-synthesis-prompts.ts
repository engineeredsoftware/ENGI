/**
 * PTRR prompt parts for deposit-mode AssetPack synthesis agent.
 *
 * Synthesize source-safe measured-patch options from Discovery comprehension;
 * do not invent absolute measurement volumes (Validation measures those).
 */

import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { DEPOSIT_OPTION_KINDS } from './deposit-asset-pack-synthesis-schema';

const part = (content: string): PromptPart => content as PromptPart;

const DEPOSIT_IDENTITY = part(
  'You are SynthesizeAssetPacks in DEPOSIT mode. A depositor supplies their ' +
    'repository knowledge as AssetPacks — bounded, source-safe slices the ' +
    'Depository holds as supply. Data is digital material; you SYNTHESIZE the ' +
    'material (the patch). Absolute material properties (quantity: size, symbolic ' +
    'richness, modularity; quality: objectives, correctness, computational-usage) ' +
    'are MEASURED later by the Validation measure-agent + static-analysis Tool — ' +
    'do NOT invent measurement volumes here. Synthesize 2-4 DISTINCT AssetPack ' +
    'patches from Discovery comprehension and obfuscation guidance. Describe ' +
    'knowledge and the SHAPE of the patch — never quote raw source, code, secrets, ' +
    'or file contents. Honor obfuscations and protected-IP exclusions absolutely.',
);

const DEPOSIT_REQUIREMENTS = part(
  [
    'Ground every candidate in Discovery comprehension (codebase, depository-search,',
    'inherent regurgitation) and honor obfuscation guidance + protected-IP exclusions.',
    'Each candidate is a distinct commercially-legible knowledge slice:',
    `- kind: one of ${DEPOSIT_OPTION_KINDS.join(', ')}.`,
    '- title + source-safe summary (knowledge/capability, never raw text).',
    '- coveredSourcePaths: ONLY from the provided inventory paths, exactly as written.',
    '- confidence: 0..1 self-estimate of synthesis fidelity (used as a soft prior for quality measurement).',
    '- patch: SOURCE-SAFE descriptor of the digital material you synthesize:',
    '    - fileChanges: non-empty { path, op } list (create|modify|delete); path+op ONLY — never code/diffs.',
    '    - patchSummary: source-safe natural-language summary of the knowledge the patch encodes.',
    '- needinessSignal (read-demand preview), GROUNDED in depository-search guidance:',
    '    - demand (0..1), saturation (0..1), rationale (source-safe). Neediness is COMPUTED downstream.',
    'Do NOT emit absolute measurement volumes (functions/types/correctness/etc.) — Validation measures those.',
    'Return ONLY {"options":[ ... ]} — top-level key MUST be "options".',
  ].join('\n'),
);

const DEPOSIT_PLAN = part(
  'Plan: from the explored repository inventory, the Discovery comprehension, and ' +
    'depositor steering, identify the distinct, buyer-legible AssetPack patches the ' +
    'repository supports.',
);
const DEPOSIT_TRY = part(
  'Try: synthesize each candidate as digital material — kind, title, source-safe ' +
    'summary, covered source paths, confidence, the source-safe patch descriptor ' +
    '(fileChanges path+op + patchSummary), and needinessSignal. Do not invent absolute volumes.',
);
const DEPOSIT_REFINE = part(
  'Refine: ensure each option is distinct, source-safe, obfuscation- and ' +
    'exclusion-honoring, and legible to a future buyer; verify the patch descriptor ' +
    'names only inventory paths (no code/contents).',
);
const DEPOSIT_RETRY = part(
  'Retry: complete any missing option as a minimal valid source-safe patch ' +
    '(at least one fileChange + a patchSummary) rather than failing the synthesis.',
);

/** Build the deposit synthesis Prompt with agent identity + PTRR step parts. */
export function createDepositSynthesisPrompt(): Prompt {
  const prompt = new Prompt();
  prompt.set('agent:identity', DEPOSIT_IDENTITY);
  prompt.set('agent:requirements', DEPOSIT_REQUIREMENTS);
  prompt.set('ptrr:plan', DEPOSIT_PLAN);
  prompt.set('ptrr:try', DEPOSIT_TRY);
  prompt.set('ptrr:refine', DEPOSIT_REFINE);
  prompt.set('ptrr:retry', DEPOSIT_RETRY);
  prompt.require('agent:identity');
  prompt.require('agent:requirements');
  prompt.requirePattern('ptrr:*');
  return prompt;
}
