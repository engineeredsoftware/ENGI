/**
 * AssetPack synthesis implementation agent.
 *
 * The implementation phase is one canonical Read-to-AssetPack synthesis
 * corridor. Pull requests, reviews, issues, and comments are Finish delivery
 * mechanisms, not implementation phase types.
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKSYNTHESIZEARTIFACTS_IDENTITY_DEFINITION } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpacksynthesizeartifacts_identity_definition';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKSYNTHESIZEARTIFACTS_REQUIREMENTS_CONTEXT } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpacksynthesizeartifacts_requirements_context';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKSYNTHESIZEARTIFACTS_PTRRPLAN_PURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpacksynthesizeartifacts_ptrrplan_purpose';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKSYNTHESIZEARTIFACTS_PTRRTRY_PURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpacksynthesizeartifacts_ptrrtry_purpose';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKSYNTHESIZEARTIFACTS_PTRRREFINE_PURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpacksynthesizeartifacts_ptrrrefine_purpose';
import { PROMPTPART_SPECIFIC_AGENT_ASSETPACKSYNTHESIZEARTIFACTS_PTRRRETRY_PURPOSE } from '@bitcode/prompts/raw_promptparts/specific/promptpart_specific_agent_assetpacksynthesizeartifacts_ptrrretry_purpose';
import { z } from 'zod';
import { AssetPackWrittenAssetType } from '../../types/AssetPackWrittenAssetType';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';

const AssetPackSynthesisInputSchema = z.object({
  read: z.string().optional(),
  definitionOfRead: z.string().optional(),
  repository: z.any().optional(),
  requirements: z.any().optional(),
  discovery: z.any().optional(),
});

const AssetPackSynthesisArtifactsSchema = z.object({
  summary: z.string(),
  fileChanges: z.any().optional(),
  proofEvidence: z.array(z.string()).optional(),
  reviewNotes: z.array(z.string()).optional(),
});

const AssetPackSynthesisOutputSchema = z.object({
  success: z.boolean().optional(),
  semanticKind: z.literal('asset-pack-written-asset').optional(),
  writtenAssetType: z.literal(AssetPackWrittenAssetType.ReadSatisfactionAssetPack).optional(),
  summary: z.string(),
  assetPackSynthesisArtifacts: AssetPackSynthesisArtifactsSchema.optional(),
  writtenAssets: AssetPackSynthesisArtifactsSchema.optional(),
  assetPack: z.object({
    read: z.string().optional(),
    writtenAssetType: z.literal(AssetPackWrittenAssetType.ReadSatisfactionAssetPack).optional(),
    deliveryMechanismTemplate: z.string().optional(),
    proofEvidence: z.array(z.string()).optional(),
  }),
});

function createAssetPackSynthesisPrompt(): Prompt {
  const prompt = new Prompt();
  prompt.set('agent:identity', PROMPTPART_SPECIFIC_AGENT_ASSETPACKSYNTHESIZEARTIFACTS_IDENTITY_DEFINITION);
  prompt.set('agent:requirements', PROMPTPART_SPECIFIC_AGENT_ASSETPACKSYNTHESIZEARTIFACTS_REQUIREMENTS_CONTEXT);
  prompt.set('ptrr:plan', PROMPTPART_SPECIFIC_AGENT_ASSETPACKSYNTHESIZEARTIFACTS_PTRRPLAN_PURPOSE);
  prompt.set('ptrr:try', PROMPTPART_SPECIFIC_AGENT_ASSETPACKSYNTHESIZEARTIFACTS_PTRRTRY_PURPOSE);
  prompt.set('ptrr:refine', PROMPTPART_SPECIFIC_AGENT_ASSETPACKSYNTHESIZEARTIFACTS_PTRRREFINE_PURPOSE);
  prompt.set('ptrr:retry', PROMPTPART_SPECIFIC_AGENT_ASSETPACKSYNTHESIZEARTIFACTS_PTRRRETRY_PURPOSE);
  prompt.require('agent:identity');
  prompt.require('agent:requirements');
  prompt.requirePattern('ptrr:*');
  return prompt;
}

const prompt = createAssetPackSynthesisPrompt();

export const ReadFitsFindingSynthesisAssetPackSynthesisAgent = factoryPTRRAgent<
  z.infer<typeof AssetPackSynthesisInputSchema>,
  z.infer<typeof AssetPackSynthesisOutputSchema>
>({
  name: 'ReadFitsFindingSynthesisAssetPackSynthesisAgent',
  description: 'Synthesizes Read-satisfying AssetPack artifacts without selecting a delivery mechanism',
  outputSchema: AssetPackSynthesisOutputSchema,
  tools: [],
  prompt,
  stepPrompts: {
    plan: () => prompt,
    try: () => prompt,
    refine: () => prompt,
    retry: () => prompt,
  },
  plan: { chunkThreshold: 2000 },
  try: { chunkThreshold: 5000 },
  refine: { maxAttempts: 2 },
  retry: { maxAttempts: 1 },
});

export default async function runReadFitsFindingSynthesisAssetPackSynthesisAgent(input: any, execution: any) {
  const storedReadRequest = findExecutionValue(execution, 'read', 'request');
  const storedPipelineInput = findExecutionValue(execution, 'pipeline', 'input');
  const read =
    input?.read ??
    input?.definitionOfRead ??
    storedPipelineInput?.read ??
    storedPipelineInput?.definitionOfRead ??
    storedReadRequest?.prompt ??
    execution?.get?.('read', 'description') ??
    execution?.findUp?.('read', 'description') ??
    execution?.findUp?.('pipeline', 'expressedRead') ??
    '';
  const deliveryMechanismTemplate =
    execution?.get?.('pipeline', 'deliveryMechanismTemplate') ??
    execution?.findUp?.('pipeline', 'deliveryMechanismTemplate') ??
    storedPipelineInput?.deliveryMechanismTemplate;
  const raw = await ReadFitsFindingSynthesisAssetPackSynthesisAgent(
    {
      ...input,
      read,
      discovery: {
        context: execution?.get?.('discovery', 'context'),
        plan: execution?.get?.('discovery', 'plan'),
      },
    },
    execution
  );
  // factoryPTRRAgent returns an envelope ({ context, output, finalOutput });
  // unwrap it to the agent's typed structured output.
  const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;
  const assetPackSynthesisArtifacts = result?.assetPackSynthesisArtifacts ??
    result?.writtenAssets ?? {
      summary: result?.summary ?? 'AssetPack synthesis artifact evidence was produced.',
    };

  const output = {
    ...result,
    success: result?.success ?? true,
    semanticKind: 'asset-pack-written-asset' as const,
    writtenAssetType: AssetPackWrittenAssetType.ReadSatisfactionAssetPack,
    assetPackSynthesisArtifacts,
    writtenAssets: result?.writtenAssets ?? assetPackSynthesisArtifacts,
    assetPack: {
      ...(result?.assetPack || {}),
      read,
      writtenAssetType: AssetPackWrittenAssetType.ReadSatisfactionAssetPack,
      deliveryMechanismTemplate,
    },
  };

  // Cross-phase artifacts: the Finish upload-for-review agent and postprocess
  // read these from other phase siblings (cross-phase store-visibility law).
  storeCrossPhaseArtifact(execution, 'implementation', 'assetPack', output.assetPack);
  storeCrossPhaseArtifact(execution, 'implementation', 'assetPackSynthesisArtifacts', output.assetPackSynthesisArtifacts);
  storeCrossPhaseArtifact(execution, 'implementation', 'writtenAssets', output.writtenAssets);
  storeCrossPhaseArtifact(execution, 'implementation', 'summary', output.summary);

  return output;
}

function findExecutionValue(execution: any, namespace: string, key: string): any {
  const localValue = execution?.get?.(namespace, key);
  if (localValue !== undefined) return localValue;

  const upwardValue = execution?.findUp?.(namespace, key);
  if (upwardValue !== undefined) return upwardValue;

  return findExecutionValueDown(execution?.getRoot?.() || execution, namespace, key);
}

function findExecutionValueDown(node: any, namespace: string, key: string): any {
  if (!node) return undefined;
  const value = node.get?.(namespace, key);
  if (value !== undefined) return value;
  for (const child of node.children?.values?.() || []) {
    const childValue = findExecutionValueDown(child, namespace, key);
    if (childValue !== undefined) return childValue;
  }
  return undefined;
}
