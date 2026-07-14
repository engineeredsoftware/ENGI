/**
 * Deposit-mode AssetPack synthesis agent (V48 Gate 3).
 *
 * Implementation phase of SynthesizeDepositAssetPacks: synthesize reviewable
 * AssetPacks from the depositor Host checkout. Each AssetPack is
 * patch + measurements + metadata. Schema and prompts are co-located siblings;
 * this file owns the PTRR factory agent, patch-write materialization, absolute
 * measurement attachment, and cross-phase stores.
 *
 * Default export (run factory path) and `DepositAssetPackSynthesisAgent` remain
 * stable for phase registration and tests.
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
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

export const DepositAssetPackSynthesisAgent = factoryPTRRAgent<any, DepositSynthesisOptions>({
  name: 'DepositAssetPackSynthesisAgent',
  description:
    'Synthesizes reviewable AssetPacks (patch + measurements + metadata) from the depositor Host sourceCheckoutCatalog.',
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
  const demandContext = input?.demandContext ?? findValue(execution, 'deposit', 'demandContext') ?? [];

  const codebaseComprehension = findValue(execution, 'discovery', 'codebaseComprehension');
  const depositorySearch = findValue(execution, 'discovery', 'depositorySearch');
  const inherentRegurgitation = findValue(execution, 'discovery', 'inherentRegurgitation');
  const obfuscationGuidance =
    input?.obfuscationGuidance ?? findValue(execution, 'setup', 'inputComprehension');

  const { ensureDepositCheckoutSourceFiles } = await import(
    '../../ensure-deposit-checkout-source-files'
  );
  const { resolveSourceCheckoutCatalog } = await import('../../resolve-source-checkout-catalog');
  const sourceCheckoutCatalog = await ensureDepositCheckoutSourceFiles(
    execution,
    resolveSourceCheckoutCatalog(
      execution,
      input?.sourceCheckoutCatalog ?? input?.inventory,
    ),
  );
  const { projectInventoryForPrompt } = await import('../../asset-packs-synthesis');
  const catalogForPrompt = projectInventoryForPrompt(sourceCheckoutCatalog);
  const sourceMeasurements = findValue(execution, 'discovery', 'sourceMeasurements') ?? [];

  const raw = await DepositAssetPackSynthesisAgent(
    {
      ...input,
      repository,
      instructions: obfuscations,
      forcedExclusions,
      demandContext,
      // Paths + samples only for PTRR prompts; file bodies on deposit:sourceCheckoutCatalog.
      sourceCheckoutCatalog: catalogForPrompt,
      inventory: catalogForPrompt,
      inventoryPaths: catalogForPrompt?.paths ?? sourceCheckoutCatalog?.paths,
      excerpts: catalogForPrompt?.samples ?? sourceCheckoutCatalog?.samples,
      obfuscationGuidance,
      sourceMeasurements,
      discovery: {
        context: execution?.get?.('discovery', 'context'),
        plan: execution?.get?.('discovery', 'plan'),
        codebase: codebaseComprehension,
        depository: depositorySearch,
        regurgitation: inherentRegurgitation,
        sourceMeasurements,
      },
    },
    execution,
  );
  const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;

  const options = Array.isArray((result as any)?.options) ? (result as any).options : [];

  // AssetPack = patch + measurements + metadata. Attach absolutes per option.
  try {
    (execution as any)?.tools?.registerTool?.('asset-pack-patch-write', new AssetPackPatchWriteTool());
  } catch {}
  const bodies = Array.isArray((sourceCheckoutCatalog as any)?.sources)
    ? (sourceCheckoutCatalog as any).sources
        .filter((s: any) => s && typeof s.path === 'string' && typeof s.content === 'string')
        .map((s: any) => ({ path: s.path as string, content: s.content as string }))
    : [];
  const { measureAssetPackAbsolutes } = await import('../validation/agent-measure-absolutes');

  for (const option of options) {
    const fileChanges = (option as any)?.patch?.fileChanges;
    if (Array.isArray(fileChanges)) {
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
    // Required measurements element
    if (!Array.isArray((option as any).absolutes) || (option as any).absolutes.length === 0) {
      try {
        if (Array.isArray(sourceMeasurements) && sourceMeasurements.length > 0) {
          (option as any).absolutes = sourceMeasurements;
        } else {
          (option as any).absolutes = await measureAssetPackAbsolutes(
            {
              title: String((option as any)?.title ?? ''),
              summary: String((option as any)?.summary ?? ''),
              coveredSourcePaths: Array.isArray((option as any)?.coveredSourcePaths)
                ? (option as any).coveredSourcePaths
                : [],
              fileChanges: Array.isArray((option as any)?.patch?.fileChanges)
                ? (option as any).patch.fileChanges
                : undefined,
              confidence:
                typeof (option as any)?.confidence === 'number'
                  ? (option as any).confidence
                  : undefined,
              patchSummary:
                typeof (option as any)?.patch?.patchSummary === 'string'
                  ? (option as any).patch.patchSummary
                  : undefined,
            },
            { lens: 'deposit', execution, sources: bodies },
          );
        }
      } catch {
        (option as any).absolutes = [];
      }
    }
  }

  const output = {
    success: true,
    semanticKind: 'asset-pack-written-asset' as const,
    options,
    summary: `Synthesized ${options.length} measured deposit AssetPack(s) (patch + measurements + metadata).`,
    assetPack: { repository },
  };

  storeCrossPhaseArtifact(execution, 'implementation', 'assetPacks', options);
  storeCrossPhaseArtifact(execution, 'implementation', 'options', options);
  storeCrossPhaseArtifact(execution, 'implementation', 'assetPack', output.assetPack);
  storeCrossPhaseArtifact(execution, 'implementation', 'summary', output.summary);

  return output;
}
