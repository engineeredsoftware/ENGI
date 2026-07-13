/**
 * Deposit-mode AssetPack synthesis agent (V48 Gate 3).
 *
 * The deposit lens of the SynthesizeAssetPacks Implementation phase: synthesize
 * reviewable AssetPacks from the DEPOSITOR's repository. Each AssetPack is a
 * completely synthesized artifact = MEASURED PATCH (patch + measurements +
 * metadata). Schema and prompts live in co-located siblings; this file owns
 * the PTRR factory agent, patch-write materialization, and cross-phase stores.
 *
 * Default export (run factory path) and `DepositAssetPackSynthesisAgent` remain
 * stable for phase registration and tests.
 */

import { factoryAgentWithPTRR } from '@bitcode/agent-generics';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';
import { AssetPackPatchWriteTool } from './asset-pack-patch-write-tool';
import {
  depositCandidateSetSchema,
  type DepositSynthesisOptions,
} from './deposit-asset-pack-synthesis-schema';
import { createDepositSynthesisPrompt } from './deposit-asset-pack-synthesis-prompts';

export type { DepositSynthesisOptions } from './deposit-asset-pack-synthesis-schema';
export {
  DEPOSIT_OPTION_KINDS,
  depositCandidateSchema,
  depositCandidateSetSchema,
  depositNeedinessSignalSchema,
  depositPatchSchema,
} from './deposit-asset-pack-synthesis-schema';

const depositPrompt = createDepositSynthesisPrompt();

export const DepositAssetPackSynthesisAgent = factoryAgentWithPTRR<any, DepositSynthesisOptions>({
  name: 'DepositAssetPackSynthesisAgent',
  description:
    'Synthesizes reviewable, source-safe, measured AssetPack candidate options from the depositor repository source (deposit lens).',
  outputSchema: depositCandidateSetSchema,
  tools: [],
  prompt: depositPrompt,
  stepPrompts: {
    plan: () => depositPrompt,
    try: () => depositPrompt,
    refine: () => depositPrompt,
    retry: () => depositPrompt,
  },
  plan: { chunkThreshold: 2000 },
  try: { chunkThreshold: 5000 },
  refine: { maxAttempts: 2 },
  retry: { maxAttempts: 1 },
});

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

export default async function runDepositAssetPackSynthesisAgent(input: any, execution: any) {
  const repository = input?.repository ?? findValue(execution, 'deposit', 'repository') ?? {};
  const obfuscations = input?.instructions ?? findValue(execution, 'deposit', 'obfuscations') ?? null;
  const forcedExclusions =
    input?.forcedExclusions ??
    findValue(execution, 'deposit', 'forcedExclusions') ??
    findValue(execution, 'deposit', 'protectedIpExclusions') ??
    [];
  const inventory = input?.inventory ?? findValue(execution, 'deposit', 'inventory');
  const demandContext = input?.demandContext ?? findValue(execution, 'deposit', 'demandContext') ?? [];

  const codebaseComprehension = findValue(execution, 'discovery', 'codebaseComprehension');
  const depositorySearch = findValue(execution, 'discovery', 'depositorySearch');
  const inherentRegurgitation = findValue(execution, 'discovery', 'inherentRegurgitation');
  const obfuscationGuidance =
    input?.obfuscationGuidance ?? findValue(execution, 'setup', 'inputComprehension');

  const { projectInventoryForPrompt } = await import('../../asset-packs-synthesis');
  const inventoryForPrompt = projectInventoryForPrompt(inventory);

  const raw = await DepositAssetPackSynthesisAgent(
    {
      ...input,
      repository,
      instructions: obfuscations,
      forcedExclusions,
      demandContext,
      // Paths + samples only for PTRR prompts; full sources stay on deposit:inventory.
      inventory: inventoryForPrompt,
      inventoryPaths: inventoryForPrompt?.paths ?? inventory?.paths,
      excerpts: inventoryForPrompt?.samples ?? inventory?.samples,
      obfuscationGuidance,
      discovery: {
        context: execution?.get?.('discovery', 'context'),
        plan: execution?.get?.('discovery', 'plan'),
        codebase: codebaseComprehension,
        depository: depositorySearch,
        regurgitation: inherentRegurgitation,
      },
    },
    execution,
  );
  // factoryAgentWithPTRR returns an envelope ({ context, output, finalOutput });
  // unwrap it to the agent's typed structured output (F27).
  const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;

  const options = Array.isArray((result as any)?.options) ? (result as any).options : [];

  // Record each AssetPack's patch through the formal code-edit tool (source-safe).
  try {
    (execution as any)?.tools?.registerTool?.('asset-pack-patch-write', new AssetPackPatchWriteTool());
  } catch {}
  for (const option of options) {
    const fileChanges = (option as any)?.patch?.fileChanges;
    if (!Array.isArray(fileChanges)) continue;
    try {
      const tool = (execution as any)?.tools?.getTool?.('asset-pack-patch-write');
      if (tool) {
        const descriptor = await tool.execute({
          fileChanges,
          assetPackTitle: (option as any)?.title,
        });
        (option as any).patch.fileChanges = descriptor.fileChanges;
      }
    } catch {}
  }

  const output = {
    success: true,
    semanticKind: 'asset-pack-written-asset' as const,
    options,
    summary: `Synthesized ${options.length} measured deposit AssetPack patch(es).`,
    assetPack: { repository },
  };

  storeCrossPhaseArtifact(execution, 'implementation', 'assetPacks', options);
  storeCrossPhaseArtifact(execution, 'implementation', 'options', options);
  storeCrossPhaseArtifact(execution, 'implementation', 'assetPack', output.assetPack);
  storeCrossPhaseArtifact(execution, 'implementation', 'summary', output.summary);

  return output;
}
