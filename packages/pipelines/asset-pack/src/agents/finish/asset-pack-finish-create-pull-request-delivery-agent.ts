import { factoryAgentWithPTRR } from '@bitcode/agent-generics';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';
import { z } from 'zod';
import { Prompt } from '@bitcode/prompts/prompt';
import { createPromptPart } from '@bitcode/prompts/parts/PromptPart';
import { PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_json_only_header';
import { PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_generation_use_this_structured_schema';
import { PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT } from '@bitcode/prompts/raw_promptparts/generic/promptpart_generic_agent_failsafe_prepare_context';

const CreatePRInputSchema = z.object({
  provider: z.enum(['github','gitlab','bitbucket']).describe('VCS provider'),
  connectionId: z.string().optional(),
  userId: z.string().optional(),
  owner: z.string(),
  repo: z.string(),
  sourceBranch: z.string(),
  targetBranch: z.string().default('main'),
  title: z.string(),
  description: z.string().optional(),
  draft: z.boolean().optional()
});

const CreatePROutputSchema = z.object({
  url: z.string().optional(),
  number: z.number().optional(),
  title: z.string().optional(),
  status: z.string().optional().default('created')
});

const systemPrompt = (() => {
  const p = new Prompt();
  p.set('agent:identity', createPromptPart('You deliver AssetPack evidence by creating a pull request for validated repository changes.'));
  p.set('generation:json_only_header', PROMPTPART_GENERIC_AGENT_GENERATION_JSON_ONLY_HEADER as any);
  p.set('generation:use_this_structure', PROMPTPART_GENERIC_AGENT_GENERATION_USE_THIS_STRUCTURED_SCHEMA as any);
  p.set('failsafe:prepare_context', PROMPTPART_GENERIC_AGENT_FAILSAFE_PREPARE_CONTEXT as any);
  return p;
})();

const stepPrompts = {
  plan: () => { const p = new Prompt(); p.set('step:purpose', createPromptPart('Plan AssetPack pull-request delivery details: source branch, target branch, title, and evidence body.')); return p; },
  try: () => { const p = new Prompt(); p.set('step:purpose', createPromptPart('Create the pull request delivery mechanism using the VCS tool.')); return p; },
  refine: () => { const p = new Prompt(); p.set('step:purpose', createPromptPart('Adjust AssetPack delivery metadata if needed.')); return p; },
  retry: () => { const p = new Prompt(); p.set('step:purpose', createPromptPart('Retry pull-request delivery with alternative metadata if conflicts occur.')); return p; }
};

export const AssetPackFinishCreatePullRequestDeliveryAgent = factoryAgentWithPTRR<
  z.infer<typeof CreatePRInputSchema>,
  z.infer<typeof CreatePROutputSchema>
>({
  name: 'finish:asset-pack-create-pull-request-delivery-agent',
  description: 'Deliver AssetPack evidence through a pull request delivery mechanism',
  outputSchema: CreatePROutputSchema,
  tools: ['vcs_create_pull_request'],
  prompt: systemPrompt,
  stepPrompts,
  plan: {}, try: {}, refine: {}, retry: {}
});

export default async function assetPackFinishCreatePullRequestDeliveryAgent(input: any, execution: any) {
  // Prepare sensible defaults from execution
  const owner = execution.get('source','owner') || execution.get('source','org') || '';
  const repo = execution.get('source','name') || '';
  const sourceBranch = execution.get('source','branch') || 'feature/bitcode-change';
  const title = input?.title || 'AssetPack changes';
  const provider = execution.get('source','provider') || 'github';
  const connectionId = execution.get('source','connectionId');
  const prepared = CreatePRInputSchema.parse({
    provider,
    connectionId,
    owner,
    repo,
    sourceBranch,
    targetBranch: 'main',
    title,
    description: input?.description
  });
  const result = await AssetPackFinishCreatePullRequestDeliveryAgent(prepared, execution);
  // Cross-phase artifacts: postprocess reads the PR coordinates from another
  // sibling (cross-phase store-visibility law).
  if (result?.url) {
    storeCrossPhaseArtifact(execution, 'finish', 'pullRequestUrl', result.url);
  }
  if (result?.number != null) {
    storeCrossPhaseArtifact(execution, 'finish', 'pullRequestNumber', result.number);
  }
  if (result?.title) {
    storeCrossPhaseArtifact(execution, 'finish', 'pullRequestTitle', result.title);
  }
  return {
    status: 'created',
    writtenAssetType: 'read-satisfaction-asset-pack',
    deliveryMechanismTemplate: 'pull-request',
    ...result,
  };
}
