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
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import { AssetPackPatchWriteTool } from '../../../../domain/src/agents/implementation/asset-pack-patch-write-tool';
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
  const impermissibleSources =
    input?.impermissibleSources ??
    findValue(execution, 'deposit', 'impermissibleSources') ??
    [];
  const permissibleSources =
    input?.permissibleSources ??
    findValue(execution, 'deposit', 'permissibleSources') ??
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
  const { resolveSourceCheckoutCatalog } = await import('@bitcode/asset-packs-pipelines-syntheses-domain/resolve-source-checkout-catalog');
  const sourceCheckoutCatalog = await ensureDepositCheckoutSourceFiles(
    execution,
    resolveSourceCheckoutCatalog(
      execution,
      input?.sourceCheckoutCatalog,
    ),
  );
  const { projectInventoryForPrompt } = await import('@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis');
  const catalogForPrompt = projectInventoryForPrompt(sourceCheckoutCatalog);
  const sourceMeasurements = findValue(execution, 'discovery', 'sourceMeasurements') ?? [];

  const raw = await DepositAssetPackSynthesisAgent(
    {
      ...input,
      repository,
      instructions: obfuscations,
      permissibleSources,
      impermissibleSources,
      demandContext,
      // Paths + samples only for PTRR prompts; file bodies on deposit:sourceCheckoutCatalog.
      sourceCheckoutCatalog: catalogForPrompt,
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
  // Path-scoped static analysis for deposit pack absolutes (full catalog).
  // Avoids N× measure-agent PTRR per option after discovery already measured the repo;
  // quantities are tool-authoritative; quality volumes use report-derived defaults.
  const {
    analyzeStaticSource,
    computeAbsolutesFromReport,
    computeDeterministicAbsolutes,
  } = await import(
    '../../../../domain/src/agents/validation/agent-measure-absolutes'
  );

  const { attachNestedAbsolutes, resolvePackAbsolutes } = await import(
    '@bitcode/asset-packs-pipelines-syntheses-domain/asset-pack-measurements'
  );

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
    // Deposit: strip any model-emitted neediness (read-only measurement KIND).
    delete (option as any).needinessSignal;
    delete (option as any).neediness;

    // Required nested measurements.absolutes (deposit needinesses always []).
    // Measure each option against its covered paths — never re-use whole-repo
    // discovery.sourceMeasurements (those make every pack look identical).
    const coveredSourcePaths = Array.isArray((option as any)?.coveredSourcePaths)
      ? ((option as any).coveredSourcePaths as string[])
      : [];
    const optionFileChanges = Array.isArray((option as any)?.patch?.fileChanges)
      ? ((option as any).patch.fileChanges as Array<{ path?: string; op?: string }>)
      : [];
    const pathScope = new Set<string>(
      [
        ...coveredSourcePaths,
        ...optionFileChanges.map((c) => (typeof c?.path === 'string' ? c.path : '')),
      ].filter(Boolean),
    );
    const scopedBodies =
      pathScope.size > 0
        ? bodies.filter((b: { path: string; content: string }) => pathScope.has(b.path))
        : bodies;

    const patchDescriptor = {
      title: String((option as any)?.title ?? ''),
      summary: String((option as any)?.summary ?? ''),
      coveredSourcePaths,
      fileChanges: optionFileChanges as any,
      confidence:
        typeof (option as any)?.confidence === 'number'
          ? (option as any).confidence
          : undefined,
      patchSummary:
        typeof (option as any)?.patch?.patchSummary === 'string'
          ? (option as any).patch.patchSummary
          : undefined,
    };

    // Always host-authoritative absolute catalog (path-scoped static analysis).
    // Model-emitted absolutes are incomplete/shape-noisy; overwrite with full set.
    try {
      const report = analyzeStaticSource({
        files: scopedBodies,
        targetPaths: coveredSourcePaths,
      });
      const absolutes = computeAbsolutesFromReport(report, patchDescriptor);
      attachNestedAbsolutes(
        option as any,
        Array.isArray(absolutes) && absolutes.length > 0
          ? absolutes
          : computeDeterministicAbsolutes(patchDescriptor),
      );
    } catch {
      try {
        attachNestedAbsolutes(option as any, computeDeterministicAbsolutes(patchDescriptor));
      } catch {
        // Preserve any prior readings only as last resort.
        attachNestedAbsolutes(option as any, resolvePackAbsolutes(option));
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
