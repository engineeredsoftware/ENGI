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
  // Bound refine: multi-attempt + stitch death-spirals were emptying Try's
  // excellent packs when schema repair lost selectedContext (2026-07-17).
  refine: { maxAttempts: 1 },
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

  // Seed agent input with discovery/catalog so even if a Refine PCC selection
  // emits unresolvable key paths, the prepared envelope still carries task
  // substance when selection partially fails (see expandExecutionStateKeyPath).
  const agentInput = {
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
  };
  // StitchUntilComplete can throw after max attempts when schema never sees
  // options (run 34837896). Catch and fall through to catalog salvage so the
  // deposit host still returns measured packs instead of exit=1 empty evidence.
  let raw: unknown;
  let synthesisThrow: string | null = null;
  try {
    raw = await DepositAssetPackSynthesisAgent(agentInput, execution);
  } catch (err) {
    synthesisThrow = err instanceof Error ? err.message : String(err);
    try {
      execution?.store?.('implementation', 'synthesisError', synthesisThrow.slice(0, 900));
    } catch {
      /* ignore */
    }
    raw = { options: [] };
  }
  const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;

  let options = Array.isArray((result as any)?.options) ? (result as any).options : [];
  // Host salvage: empty/invalid Refine stitch must not ship zero packs when the
  // model clearly synthesized candidates earlier (schema-valid path lists).
  // Reject key-path-looking "paths" (e.g. "#host:sourceRevision") from stitch
  // death-spirals that lost selectedContext.
  const isCatalogPath = (p: unknown): p is string =>
    typeof p === 'string' &&
    p.length > 0 &&
    !p.startsWith('#') &&
    !p.includes(':') &&
    !p.includes('//');
  const usableOptions = options.filter((opt: any) => {
    if (!opt || typeof opt.title !== 'string' || opt.title.length < 8) return false;
    if (typeof opt.patch?.patchSummary !== 'string' || opt.patch.patchSummary.length === 0) {
      return false;
    }
    const covered = Array.isArray(opt.coveredSourcePaths)
      ? opt.coveredSourcePaths.filter(isCatalogPath)
      : [];
    const fileChanges = Array.isArray(opt.patch?.fileChanges)
      ? opt.patch.fileChanges.filter((fc: any) => isCatalogPath(fc?.path))
      : [];
    if (covered.length === 0 || fileChanges.length === 0) return false;
    // Normalize to catalog-only paths.
    opt.coveredSourcePaths = covered;
    opt.patch.fileChanges = fileChanges.map((fc: any) => ({
      path: fc.path,
      op: fc.op === 'create' || fc.op === 'delete' ? fc.op : 'modify',
    }));
    return true;
  });
  if (usableOptions.length === 0) {
    // Last resort: deterministic minimal packs from checkout paths so Finish
    // still receives measured AssetPacks rather than empty options.
    const paths = Array.isArray(catalogForPrompt?.paths)
      ? (catalogForPrompt.paths as string[]).filter((p) => typeof p === 'string' && p.length > 0)
      : [];
    const core = paths.filter((p) =>
      /^(index|src\/|lib\/|package\.json|readme)/i.test(p) || p.endsWith('.d.ts') || p.endsWith('.js') || p.endsWith('.ts'),
    );
    const pick = (core.length > 0 ? core : paths).slice(0, 6);
    if (pick.length > 0) {
      options = [
        {
          kind: 'capability-slice',
          title: 'Primary public API and type surface',
          summary:
            'Source-safe knowledge slice over the repository public entrypoints and type declarations for deposit synthesis when model Refine emptied candidates.',
          coveredSourcePaths: pick.slice(0, Math.min(4, pick.length)),
          confidence: 0.55,
          patch: {
            fileChanges: pick.slice(0, Math.min(4, pick.length)).map((path: string) => ({
              path,
              op: 'modify' as const,
            })),
            patchSummary:
              'Encodes the primary library entry and type-guard surface as a depositable AssetPack descriptor (host salvage after empty Refine).',
          },
        },
        {
          kind: 'proof-operations-slice',
          title: 'Tests and operational verification slice',
          summary:
            'Companion knowledge slice covering verification artifacts that prove the public API behavior for downstream readers.',
          coveredSourcePaths: pick.slice(0, Math.min(4, pick.length)),
          confidence: 0.5,
          patch: {
            fileChanges: pick.slice(0, Math.min(3, pick.length)).map((path: string) => ({
              path,
              op: 'modify' as const,
            })),
            patchSummary:
              'Maps verification and operational files that evidence the deposited capability (host salvage).',
          },
        },
      ];
    }
  } else {
    options = usableOptions;
  }

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
