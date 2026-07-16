/**
 * AssetPack Pipeline – Clone VCS Repository agent prompts (overlay only)
 *
 * These are AssetPack-specific Prompt instances that will be merged onto
 * the generic VCS agent prompts via Prompt.clone().merge().
 *
 * Hierarchy law (wire aggregation):
 * - Agent carrier: identity / purpose / constraints / phase only
 * - Step carrier: step purpose (label + details) only
 * - Failsafe + Thinkings parts are injected at the active generation leaf
 *   (factoryLLMGeneration / getSequencePrompt) — do NOT re-embed generation:*
 *   or failsafe:* here or Reason will receive Judge/SO soup.
 *
 * @doc-comment-developing-promptdevelopment
 * domain: agent
 * intent: "Bitcode setup overlays for cloning repository context into the AssetPack execution workspace"
 * current_version: "0.60.0"
 * benchmarks: [
 *   { "name": "technical_accuracy", "test": "Concrete directives and purpose", "score": 0.60 },
 *   { "name": "implementation_ready", "test": "Usable by registry formatter", "score": 0.60 }
 * ]
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_SYSTEM_IDENTITY } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_system_identity';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_SYSTEM_PURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_system_purpose';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_SYSTEM_CONSTRAINTS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_system_constraints';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_PLAN_LABEL } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_plan_label';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_PLAN_DETAILS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_plan_details';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_TRY_LABEL } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_try_label';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_TRY_DETAILS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_try_details';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_REFINE_LABEL } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_refine_label';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_REFINE_DETAILS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_refine_details';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_RETRY_LABEL } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_retry_label';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_RETRY_DETAILS } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_retry_details';

function stepPurpose(label: unknown, details: unknown) {
  return `${String(label)}\n${String(details)}` as any;
}

export const DP_CLONE_VCS_SYSTEM_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('agent:identity:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_SYSTEM_IDENTITY as any);
  p.set('agent:purpose:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_SYSTEM_PURPOSE as any);
  p.set('agent:constraints:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_SYSTEM_CONSTRAINTS as any);
  p.set('pipeline', 'asset-pack' as any);
  p.set('phase', 'setup' as any);
  return p;
})();

export const DP_CLONE_VCS_PLAN_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('step:label:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_PLAN_LABEL as any);
  p.set('step:details:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_PLAN_DETAILS as any);
  // Prefer step:purpose so formatStepPromptCarrier stays Plan-only (no gen soup).
  p.set(
    'step:purpose',
    stepPurpose(
      PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_PLAN_LABEL,
      PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_PLAN_DETAILS,
    ),
  );
  p.set('pipeline', 'asset-pack' as any);
  p.set('phase', 'setup' as any);
  return p;
})();

export const DP_CLONE_VCS_TRY_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('step:label:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_TRY_LABEL as any);
  p.set('step:details:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_TRY_DETAILS as any);
  p.set(
    'step:purpose',
    stepPurpose(
      PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_TRY_LABEL,
      PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_TRY_DETAILS,
    ),
  );
  p.set('pipeline', 'asset-pack' as any);
  p.set('phase', 'setup' as any);
  return p;
})();

export const DP_CLONE_VCS_REFINE_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('step:label:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_REFINE_LABEL as any);
  p.set('step:details:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_REFINE_DETAILS as any);
  p.set(
    'step:purpose',
    stepPurpose(
      PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_REFINE_LABEL,
      PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_REFINE_DETAILS,
    ),
  );
  p.set('pipeline', 'asset-pack' as any);
  p.set('phase', 'setup' as any);
  return p;
})();

export const DP_CLONE_VCS_RETRY_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set('step:label:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_RETRY_LABEL as any);
  p.set('step:details:asset-pack:addendum', PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_RETRY_DETAILS as any);
  p.set(
    'step:purpose',
    stepPurpose(
      PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_RETRY_LABEL,
      PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_RETRY_DETAILS,
    ),
  );
  p.set('pipeline', 'asset-pack' as any);
  p.set('phase', 'setup' as any);
  return p;
})();
