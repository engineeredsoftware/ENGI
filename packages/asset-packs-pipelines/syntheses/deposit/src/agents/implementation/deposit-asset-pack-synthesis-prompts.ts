/**
 * PTRR prompt parts for deposit-mode AssetPack synthesis agent.
 *
 * AssetPack = patch + measurements + metadata.
 * The LLM synthesizes the source-safe patch descriptor and metadata; the
 * Implementation host attaches absolute measurements after PTRR (do not invent
 * volumes). Paths come only from sourceCheckoutCatalog.
 */

import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { DEPOSIT_OPTION_KINDS } from './deposit-asset-pack-synthesis-schema';

const part = (content: string): PromptPart => content as PromptPart;

const DEPOSIT_IDENTITY = part(
  'You are SynthesizeAssetPacks Implementation for deposit. A depositor supplies ' +
    'repository knowledge as AssetPacks — each AssetPack is patch + measurements + ' +
    'metadata. Measurement KINDS: absolutes (intrinsic material properties) and ' +
    'needinesses (reader-relative — READ ONLY, never on deposit). You SYNTHESIZE the ' +
    'source-safe patch descriptor and pack metadata from Discovery and Setup ' +
    'obfuscation guidance. Absolute measurements are ATTACHED by the Implementation ' +
    'host after your output as measurements.absolutes — do NOT invent absolute volumes ' +
    'or needinesses. Synthesize 2-4 DISTINCT AssetPack candidates. Describe knowledge ' +
    'and the SHAPE of the patch — never quote raw source, code, secrets, or file contents. ' +
    'Honor obfuscations and Impermissible sources absolutely.',
);

const DEPOSIT_REQUIREMENTS = part(
  [
    'Ground every candidate in Discovery comprehension (codebase analysis + knowledge map,',
    'depository-search demand guidance, inherent regurgitation) and honor obfuscation',
    'guidance + Impermissible sources.',
    'Each candidate is a distinct commercially-legible knowledge slice:',
    `- kind: one of ${DEPOSIT_OPTION_KINDS.join(', ')}.`,
    '- title + source-safe summary (knowledge/capability, never raw text).',
    '- coveredSourcePaths: ONLY from the provided sourceCheckoutCatalog paths, exactly as written.',
    '- confidence: 0..1 self-estimate of synthesis fidelity (metadata soft prior).',
    '- patch: SOURCE-SAFE descriptor of the digital material you synthesize:',
    '    - fileChanges: non-empty { path, op } list (create|modify|delete); path+op ONLY — never code/diffs.',
    '    - patchSummary: source-safe natural-language summary of the knowledge the patch encodes.',
    'Do NOT emit measurements, absolutes, needinesses, or needinessSignal — the Implementation',
    'host attaches measurements: { absolutes: [...], needinesses: [] } so each deposit AssetPack',
    'leaves Implementation as patch + absolute measurements + metadata. Emitting empty',
    'needinessSignal.rationale fails schema and triggers stitch repair — omit those keys.',
    'Return ONLY {"options":[ ... ]} — top-level key MUST be "options".',
  ].join('\n'),
);

const DEPOSIT_PLAN = part(
  'Plan: from the sourceCheckoutCatalog, Discovery comprehension (including absolute ' +
    'measurements of the checkout), and depositor steering, identify the distinct, ' +
    'buyer-legible AssetPack patches the repository supports.',
);
const DEPOSIT_TRY = part(
  'Try: synthesize each candidate as digital material — kind, title, source-safe ' +
    'summary, covered source paths from sourceCheckoutCatalog, confidence, and the ' +
    'source-safe patch descriptor (fileChanges path+op + patchSummary). Do not invent ' +
    'absolute volumes or needinesses.',
);
const DEPOSIT_REFINE = part(
  'Refine: polish the prior Try/Retry candidates — NEVER return an empty options ' +
    'array. Keep 2–4 DISTINCT options. Prefer PrepareConciseContext keys in exact ' +
    'form "#namespace:key" or "path#namespace:key" (colon before the key name; do not ' +
    'use "#namespace#key"). Ground coveredSourcePaths and patch.fileChanges ONLY in ' +
    'sourceCheckoutCatalog paths. Ensure each option is source-safe, obfuscation- and ' +
    'exclusion-honoring, and legible to a future buyer (no code/contents).',
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
