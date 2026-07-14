/**
 * Deposit-mode Validation agent (compat export).
 *
 * Prefer deposit-ready-to-finish-agent (validation:ready-to-finish-asset-packs-
 * synthesis-deposit-pipeline) — the single A/B/C gate. This module remains for
 * prompt-contract tests and older roster aliases; it shares
 * createDepositValidationPrompt and smoke/merge helpers.
 *
 * Qualitative PTRR + deterministic smoke; may backfill missing absolutes so
 * packs leave Validation as patch + measurements + metadata when Implementation
 * did not attach them.
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
    'Validates deposit AssetPacks (patch + measurements + metadata) for quality, distinctness, source-safety, and obfuscation/exclusion compliance.',
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

  const { ensureDepositCheckoutSourceFiles } = await import(
    '../../ensure-deposit-checkout-source-files'
  );
  const { resolveSourceCheckoutCatalog } = await import('../../resolve-source-checkout-catalog');
  const { projectInventoryForPrompt } = await import('../../asset-packs-synthesis');
  const catalog = await ensureDepositCheckoutSourceFiles(
    execution,
    resolveSourceCheckoutCatalog(
      execution,
      input?.sourceCheckoutCatalog ?? input?.inventory,
    ),
  );
  // LLM qualitative validation: paths only. Static-analysis measurement below
  // still reads full catalog.sources from the shared store.
  const catalogForPrompt = projectInventoryForPrompt(catalog);
  const raw = await DepositValidationAgent(
    {
      ...input,
      assetPacks: packs,
      sourceCheckoutCatalog: catalogForPrompt,
      inventory: catalogForPrompt, // dual-write for legacy stream filters
      inventoryPaths: catalogForPrompt?.paths ?? catalog?.paths,
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

  // Backfill nested measurements.absolutes when Implementation did not attach them.
  if (packs.length > 0) {
    const { attachNestedAbsolutes, resolvePackAbsolutes } = await import(
      '../../asset-pack-measurements'
    );
    const catalogSources = Array.isArray((catalog as any)?.sources)
      ? (catalog as any).sources
          .filter((s: any) => s && typeof s.path === 'string' && typeof s.content === 'string')
          .map((s: any) => ({ path: s.path as string, content: s.content as string }))
      : Array.isArray((catalog as any)?.samples)
        ? (catalog as any).samples
            .filter((s: any) => s && typeof s.path === 'string' && typeof s.excerpt === 'string')
            .map((s: any) => ({ path: s.path as string, content: s.excerpt as string }))
        : [];
    await Promise.all(
      packs.map(async (pack: any) => {
        delete pack.needinessSignal;
        delete pack.neediness;
        if (resolvePackAbsolutes(pack).length > 0) {
          attachNestedAbsolutes(pack, resolvePackAbsolutes(pack));
          return;
        }
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
            { lens: 'deposit', execution, sources: catalogSources },
          );
          attachNestedAbsolutes(pack, absolutes);
        } catch {
          attachNestedAbsolutes(pack, []);
        }
      }),
    );
    storeCrossPhaseArtifact(execution, 'implementation', 'options', packs);
    storeCrossPhaseArtifact(execution, 'implementation', 'assetPacks', packs);
  }

  return { ...(input || {}), ...result };
}
