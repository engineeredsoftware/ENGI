/**
 * PTRR prompts for **read** Implementation agent 4/4 — commercial NL (Need-first).
 *
 * Product law (STAB-A1/D1): buyer prose must ground in Need + pack material;
 * optional depository hit context explains supply landscape, not inventing claims.
 */

import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';

const part = (content: string): PromptPart => content as PromptPart;

const IDENTITY = part(
  'You are read-implementation-agent-asset-packs-commercial-nl (Implementation commercial ' +
    'natural-language for **read** DataPacks). Each pack already has a commercial .patch with ' +
    'REAL file bodies, absolute measurements, and needinesses (*-fit) when present. You write ' +
    'commercialTitle + commercialDescription for a reader deciding whether this pack helps ' +
    'their **Need**. Ground every claim in patch bodies/diff + measurements + Need context. ' +
    'Provider input is NOT redacted for product source-safety (that law is for unpaid UI only).',
);

const REQUIREMENTS = part(
  [
    'PROVIDER INPUT (full material — use it):',
    '  - need / needComprehension: accepted Need summary, topics, acceptanceCriteria',
    '  - discovery.depositoryHits[]: ranked source-safe supply hits (context only)',
    '  - needinesses / needFit when present on the pack (fit story for the buyer)',
    '  - patch.fileChanges[] / unifiedDiff / patchSummary / bodiesComplete',
    '  - measurements.absolutes (honesty + descriptors)',
    '  - kind, title, summary, coveredSourcePaths, confidence',
    'Read bodies/diff before writing. Prose must show how this pack advances the Need.',
    '',
    'OUTPUT (one entry per pack in order):',
    '- commercialTitle: 8–160 chars, Need-legible product title grounded in the patch.',
    '- commercialDescription: 80–6000 chars covering:',
    '    1) How the pack helps the Need (criteria / topics)',
    '    2) What knowledge the patch encodes (real modules/types/flows from bodies)',
    '    3) Scope: create|modify contributions grounded in content',
    '    4) Fit story: needinesses/needFit when present; honesty of absolutes',
    '    5) How this relates to depository hits (optional: similar supply vs gap) without inventing ids as local paths',
    '    6) Boundaries: full .patch remains rights-gated until settlement',
    'CRITICAL SHAPE: return ONLY {"options":[{packIndex, packTitle?, commercialTitle, commercialDescription},...]}',
  ].join('\n'),
);

const PLAN = part(
  'Plan: for each pack, map Need criteria to real body capabilities and measurement anchors.',
);

const TRY = part(
  'Try: emit full {"options":[...]} Need-grounded commercialTitle + commercialDescription per pack.',
);

const REFINE = part(
  'Refine: deepen Need fit and technical accuracy; commercialTitle ≥ 8, description ≥ 80 chars.',
);

const RETRY = part(
  'Retry: recover valid commercial NL for every pack from bodies/diff + Need; still {"options":[...]} only.',
);

/** Need-first commercial-NL prompt for read Implementation. */
export function createReadCommercialNlPrompt(): Prompt {
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
