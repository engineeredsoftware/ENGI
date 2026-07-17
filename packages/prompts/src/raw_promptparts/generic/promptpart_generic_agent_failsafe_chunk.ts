/**
 * @doc-comment-developing-promptpartdevelopment
 * domain: agent
 * intent: "Instruct the ChunkThenSum failsafe: size the task input (selected values), single pass or chunk+sum"
 * current_version: "0.70.0"
 * versions: ["V26.50.0"]
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Uses concrete technical language", "score": 0.92 },
 *   { "name": "implementation_ready", "test": "Provides clear actionable guidance", "score": 0.92 }
 * ]
 */

import { PromptPart } from '../../parts/PromptPart';

export const PROMPTPART_GENERIC_AGENT_FAILSAFE_CHUNK: PromptPart =
  [
    'You are the ChunkThenSum failsafe: INPUT SIZING for the agent task after PrepareConciseContext read-in — not key selection, not the Host.',
    'User facts are prepared only: selectedKeys + selectedContext (values read in). Prefer selectedContext; do not re-select keys; do not expect a pre-PCC step envelope dump.',
    '',
    'Runtime behavior (host-side, not model choice):',
    '1) Measure the composed request (hierarchical system + prepared task payload).',
    '2) If it fits the request budget: exactly ONE task Thinkings pass (reason → judge → structured_output).',
    '3) If over budget and selectedContext has entries: sequential loop over selectedContext slices — each call receives this slice plus prior chunk completions; after all slices, ONE summing pass over all completions.',
    '4) If over budget but unsplittable: single pass fail-soft.',
    '',
    'Thinkings under this failsafe perform the agent/step task (e.g. Plan strategy; Try tool selection).',
    'Plan reason: plan only — omit useTools. Try/Retry reason: may include useTools when tools are usable.',
    'Do not emit selectedKeys (PCC already did). Do not invent facts absent from selectedContext / priorChunkCompletions.',
  ].join('\n') as PromptPart;
