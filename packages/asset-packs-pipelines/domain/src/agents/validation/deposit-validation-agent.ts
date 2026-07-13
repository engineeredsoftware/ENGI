/**
 * Deposit-mode Validation agent — Validation phase (V48 Gate 2/3).
 *
 * The deposit lens of the SynthesizeAssetPacks Validation phase: validate the
 * synthesized, measured-patch AssetPacks (implementation:options /
 * implementation:assetPacks) before Finish uploads them for depositor review.
 * Merges qualitative PTRR findings with deterministic smoke checks, stores
 * issues for ReadyToFinish, then attaches formal ABSOLUTES via measure-agent.
 *
 * Schema, prompts, and smoke/merge logic live in co-located siblings. Default
 * export (run factory path) and `DepositValidationAgent` remain stable.
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';
import { measureAssetPackAbsolutes } from './agent-measure-absolutes';
import {
  DepositValidationOutputSchema,
  type DepositValidationInput,
  type DepositValidationResult,
} from './deposit-validation-schema';
import { createDepositValidationPrompt } from './deposit-validation-prompts';
import {
  asPathList,
  mergeDepositValidationVerdict,
  smokeCheckAssetPacks,
} from './deposit-validation-checks';

export type { DepositValidationResult } from './deposit-validation-schema';
export {
  DepositValidationInputSchema,
  DepositValidationOutputSchema,
} from './deposit-validation-schema';
export {
  asPathList,
  dedupeIssues,
  isNum01,
  mergeDepositValidationVerdict,
  pathViolates,
  smokeCheckAssetPacks,
} from './deposit-validation-checks';

const prompt = createDepositValidationPrompt();

export const DepositValidationAgent = factoryPTRRAgent<
  DepositValidationInput,
  DepositValidationResult
>({
  name: 'DepositValidationAgent',
  description:
    'Validates the synthesized deposit AssetPacks for quality, distinctness, source-safety, obfuscation/exclusion compliance, patch coherence, and coverage (deposit lens).',
  outputSchema: DepositValidationOutputSchema,
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

export default async function runDepositValidationAgent(input: any, execution: any) {
  const assetPacks =
    input?.assetPacks ??
    findValue(execution, 'implementation', 'options') ??
    findValue(execution, 'implementation', 'assetPacks') ??
    [];
  const inventory = input?.inventory ?? findValue(execution, 'deposit', 'inventory');
  const obfuscationGuidance =
    input?.obfuscationGuidance ?? findValue(execution, 'setup', 'inputComprehension');
  const forcedExclusions = asPathList(
    input?.forcedExclusions ??
      findValue(execution, 'deposit', 'forcedExclusions') ??
      findValue(execution, 'deposit', 'protectedIpExclusions') ??
      [],
  );
  const obfuscatedPaths = asPathList((obfuscationGuidance as any)?.obfuscatedPaths);
  const packs = Array.isArray(assetPacks) ? assetPacks : [];

  const { projectInventoryForPrompt } = await import('../../asset-packs-synthesis');
  // LLM qualitative validation: paths only. Static-analysis measurement below
  // still reads full inventory.sources from the shared store.
  const inventoryForPrompt = projectInventoryForPrompt(inventory);
  const raw = await DepositValidationAgent(
    {
      ...input,
      assetPacks: packs,
      inventory: inventoryForPrompt,
      inventoryPaths: inventoryForPrompt?.paths ?? inventory?.paths,
      obfuscationGuidance,
      forcedExclusions,
    },
    execution,
  );
  // factoryPTRRAgent returns an envelope ({ context, output, finalOutput });
  // unwrap to the agent's typed validation output (F27).
  const agentOutput = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;

  const smokeIssues = smokeCheckAssetPacks(packs, forcedExclusions, obfuscatedPaths);
  const result = mergeDepositValidationVerdict(agentOutput, smokeIssues);

  // Cross-phase artifacts: ReadyToFinish + /deposit surface read these keys.
  storeCrossPhaseArtifact(execution, 'validation/implementation', 'issues', result.issues);
  storeCrossPhaseArtifact(execution, 'validation', 'depositQuality', result);

  // Formal ABSOLUTES measurement of digital material properties.
  if (packs.length > 0) {
    const inventorySources = Array.isArray((inventory as any)?.sources)
      ? (inventory as any).sources
          .filter((s: any) => s && typeof s.path === 'string' && typeof s.content === 'string')
          .map((s: any) => ({ path: s.path as string, content: s.content as string }))
      : Array.isArray((inventory as any)?.samples)
        ? (inventory as any).samples
            .filter((s: any) => s && typeof s.path === 'string' && typeof s.excerpt === 'string')
            .map((s: any) => ({ path: s.path as string, content: s.excerpt as string }))
        : [];
    await Promise.all(
      packs.map(async (pack: any) => {
        try {
          const absolutes = await measureAssetPackAbsolutes(
            {
              title: String(pack?.title ?? ''),
              summary: String(pack?.summary ?? ''),
              coveredSourcePaths: asPathList(pack?.coveredSourcePaths),
              fileChanges: Array.isArray(pack?.patch?.fileChanges) ? pack.patch.fileChanges : undefined,
              confidence: typeof pack?.confidence === 'number' ? pack.confidence : undefined,
              patchSummary:
                typeof pack?.patch?.patchSummary === 'string' ? pack.patch.patchSummary : undefined,
            },
            { lens: 'deposit', execution, sources: inventorySources },
          );
          pack.absolutes = absolutes;
        } catch {}
      }),
    );
    storeCrossPhaseArtifact(execution, 'implementation', 'options', packs);
    storeCrossPhaseArtifact(execution, 'implementation', 'assetPacks', packs);
  }

  return { ...(input || {}), ...result };
}
