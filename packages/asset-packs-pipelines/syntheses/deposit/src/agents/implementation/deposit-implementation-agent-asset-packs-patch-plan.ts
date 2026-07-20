/**
 * Deposit Implementation agent — AssetPacks patch plan (V48).
 *
 * Registry: implementation:deposit-implementation-agent-asset-packs-patch-plan
 *
 * Sequence: THIS (plan descriptors) → patchfile write (artifact) → measurements.
 *
 * Builds 2–4 planned packs via allowlist (six fields only). Does NOT write the
 * formal patchfile artifact — that is the next agent. PTRR tools: [].
 *
 * Host authority after PTRR: catalog membership + exclusion path law; salvage
 * flags (never presentable).
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import {
  depositCandidateSetSchema,
  type DepositSynthesisOptions,
} from './deposit-asset-pack-synthesis-schema';
import { createDepositSynthesisPrompt } from './deposit-asset-pack-synthesis-prompts';
import {
  buildCatalogPathSet,
  collectExclusionPrefixes,
  isCatalogPathSyntax,
  isExcludedPath,
  normalizeRepoPath,
  pathAllowedInCatalog,
} from './deposit-implementation-path-law';
import type {
  DepositPatchPlanPack,
  DepositPatchPlanPhaseOutput,
} from './deposit-implementation-pack-types';
import {
  countSalvagedPacks,
  toDepositPatchPlanPack,
} from './deposit-implementation-pack-types';

export type { DepositSynthesisOptions } from './deposit-asset-pack-synthesis-schema';
export {
  DEPOSIT_OPTION_KINDS,
  depositCandidateSchema,
  depositCandidateSetSchema,
  depositPatchSchema,
} from './deposit-asset-pack-synthesis-schema';

const depositPrompt = createDepositSynthesisPrompt();

export const DepositImplementationAgentAssetPacksPatchPlan = factoryPTRRAgent<
  any,
  DepositSynthesisOptions
>({
  name: 'DepositImplementationAgentAssetPacksPatchPlan',
  description:
    'Implementation patch-plan: source-safe descriptor + metadata per deposit AssetPack. Absolutes are agent 2/2.',
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
  refine: { maxAttempts: 1 },
  retry: { maxAttempts: 1 },
});

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

/**
 * Gate paths then project onto DepositPatchPlanPack (allowlist constructor).
 * Returns null if unusable after gating.
 */
function gateAndProject(
  opt: any,
  catalogSet: Set<string>,
  exclusionPrefixes: string[],
): DepositPatchPlanPack | null {
  if (!opt || typeof opt.title !== 'string' || opt.title.length < 8) return null;
  if (typeof opt.patch?.patchSummary !== 'string' || opt.patch.patchSummary.length === 0) {
    return null;
  }

  const allow = (p: unknown): p is string => pathAllowedInCatalog(p, catalogSet, exclusionPrefixes);
  const covered = Array.isArray(opt.coveredSourcePaths)
    ? opt.coveredSourcePaths.filter(allow).map(normalizeRepoPath)
    : [];
  const fileChanges = Array.isArray(opt.patch?.fileChanges)
    ? opt.patch.fileChanges
        .filter((fc: any) => allow(fc?.path))
        .map((fc: any) => ({
          path: normalizeRepoPath(fc.path),
          op: fc.op === 'create' || fc.op === 'delete' ? fc.op : 'modify',
        }))
    : [];

  if (covered.length === 0 || fileChanges.length === 0) return null;

  return toDepositPatchPlanPack({
    kind: opt.kind,
    title: opt.title,
    summary: opt.summary,
    coveredSourcePaths: covered,
    confidence: typeof opt.confidence === 'number' ? opt.confidence : 0.5,
    patch: { fileChanges, patchSummary: opt.patch.patchSummary },
    salvaged: opt.salvaged === true ? true : undefined,
    salvageReason: typeof opt.salvageReason === 'string' ? opt.salvageReason : undefined,
  });
}

function buildDiscoveryPacket(execution: any, input: any) {
  const codebaseComprehension = findValue(execution, 'discovery', 'codebaseComprehension');
  const codebaseAnalysis = findValue(execution, 'discovery', 'codebaseAnalysis');
  const depositorySearch = findValue(execution, 'discovery', 'depositorySearch');
  const inherentRegurgitation = findValue(execution, 'discovery', 'inherentRegurgitation');
  const sourceMeasurements = findValue(execution, 'discovery', 'sourceMeasurements') ?? [];

  const analysisProjection =
    codebaseAnalysis && typeof codebaseAnalysis === 'object'
      ? {
          schema: (codebaseAnalysis as any).schema,
          pathCount: (codebaseAnalysis as any).sourceCheckoutCatalog?.pathCount,
          fileTree: (codebaseAnalysis as any).fileTree
            ? {
                rootCount: Array.isArray((codebaseAnalysis as any).fileTree?.roots)
                  ? (codebaseAnalysis as any).fileTree.roots.length
                  : undefined,
                summary: (codebaseAnalysis as any).fileTree?.summary,
                topLevel: (codebaseAnalysis as any).fileTree?.topLevel,
              }
            : undefined,
          sourceMeasurements: (codebaseAnalysis as any).sourceMeasurements,
          comprehension: (codebaseAnalysis as any).comprehension,
          notableFromAnalysis: (codebaseAnalysis as any).comprehension?.notableModules,
        }
      : null;

  return {
    context: execution?.get?.('discovery', 'context') ?? input?.discovery?.context,
    plan: execution?.get?.('discovery', 'plan') ?? input?.discovery?.plan,
    codebase: codebaseComprehension,
    codebaseAnalysis: analysisProjection,
    depository: depositorySearch,
    regurgitation: inherentRegurgitation,
    sourceMeasurements,
    anchors: {
      underservedTopics: asStringArray((depositorySearch as any)?.underservedTopics),
      likelyReadTopics: asStringArray((depositorySearch as any)?.likelyReadTopics),
      notableModules: asStringArray(
        (codebaseComprehension as any)?.notableModules ??
          (codebaseComprehension as any)?.knowledgeAreas,
      ),
      patterns: asStringArray((inherentRegurgitation as any)?.patterns),
      relevantKnowledge: asStringArray((inherentRegurgitation as any)?.relevantKnowledge),
    },
  };
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v ?? '').trim()).filter(Boolean).slice(0, 24);
}

function buildSalvagePacks(
  catalogPaths: string[],
  exclusionPrefixes: string[],
): DepositPatchPlanPack[] {
  const paths = catalogPaths
    .filter((p) => typeof p === 'string' && p.length > 0)
    .map(normalizeRepoPath)
    .filter((p) => isCatalogPathSyntax(p) && !isExcludedPath(p, exclusionPrefixes));
  const core = paths.filter(
    (p) =>
      /^(index|src\/|lib\/|package\.json|readme)/i.test(p) ||
      p.endsWith('.d.ts') ||
      p.endsWith('.js') ||
      p.endsWith('.ts'),
  );
  const pick = (core.length > 0 ? core : paths).slice(0, 6);
  if (pick.length === 0) return [];

  const reason =
    'host-salvage: model Refine emptied usable patchfile candidates; not presentable for deposit';

  return [
    toDepositPatchPlanPack({
      kind: 'capability-slice',
      title: 'Primary public API and type surface',
      summary:
        'Source-safe knowledge slice over repository public entrypoints for deposit continuity when model Refine emptied candidates. Host salvage — not depositor-presentable.',
      coveredSourcePaths: pick.slice(0, Math.min(4, pick.length)),
      confidence: 0.35,
      salvaged: true,
      salvageReason: reason,
      patch: {
        fileChanges: pick.slice(0, Math.min(4, pick.length)).map((path) => ({
          path,
          op: 'modify',
        })),
        patchSummary:
          'Host-salvage descriptor of the primary library entry surface (continuity only; not presentable).',
      },
    }),
    toDepositPatchPlanPack({
      kind: 'proof-operations-slice',
      title: 'Tests and operational verification slice',
      summary:
        'Companion knowledge slice covering verification artifacts. Host salvage after empty Refine — not depositor-presentable.',
      coveredSourcePaths: pick.slice(0, Math.min(4, pick.length)),
      confidence: 0.3,
      salvaged: true,
      salvageReason: reason,
      patch: {
        fileChanges: pick.slice(0, Math.min(3, pick.length)).map((path) => ({
          path,
          op: 'modify',
        })),
        patchSummary:
          'Host-salvage map of verification files (continuity only; not presentable).',
      },
    }),
  ];
}

export default async function runDepositImplementationAgentAssetPacksPatchPlan(
  input: any,
  execution: any,
): Promise<DepositPatchPlanPhaseOutput> {
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
  const obfuscationGuidance =
    input?.obfuscationGuidance ?? findValue(execution, 'setup', 'inputComprehension');

  const { ensureDepositCheckoutSourceFiles } = await import(
    '../../ensure-deposit-checkout-source-files'
  );
  const { resolveSourceCheckoutCatalog } = await import(
    '@bitcode/asset-packs-pipelines-syntheses-domain/resolve-source-checkout-catalog'
  );
  const sourceCheckoutCatalog = await ensureDepositCheckoutSourceFiles(
    execution,
    resolveSourceCheckoutCatalog(execution, input?.sourceCheckoutCatalog),
  );
  const { projectInventoryForPrompt } = await import(
    '@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis'
  );
  const catalogForPrompt = projectInventoryForPrompt(sourceCheckoutCatalog);
  const discoveryPacket = buildDiscoveryPacket(execution, input);
  const catalogSet = buildCatalogPathSet(catalogForPrompt?.paths ?? sourceCheckoutCatalog?.paths);
  const exclusionPrefixes = collectExclusionPrefixes(impermissibleSources, obfuscationGuidance);

  const agentInput = {
    ...input,
    repository,
    instructions: obfuscations,
    permissibleSources,
    impermissibleSources,
    demandContext,
    sourceCheckoutCatalog: catalogForPrompt,
    inventoryPaths: catalogForPrompt?.paths ?? sourceCheckoutCatalog?.paths,
    excerpts: catalogForPrompt?.samples ?? sourceCheckoutCatalog?.samples,
    obfuscationGuidance,
    sourceMeasurements: discoveryPacket.sourceMeasurements,
    discovery: discoveryPacket,
  };

  let raw: unknown;
  try {
    raw = await DepositImplementationAgentAssetPacksPatchPlan(agentInput, execution);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    try {
      execution?.store?.('implementation', 'patchPlanSynthesisError', msg.slice(0, 900));
    } catch {
      /* optional */
    }
    raw = { options: [] };
  }
  const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;
  const modelOptions = Array.isArray((result as any)?.options) ? (result as any).options : [];
  const usableOptions = modelOptions
    .map((opt: any) => gateAndProject(opt, catalogSet, exclusionPrefixes))
    .filter(Boolean) as DepositPatchPlanPack[];

  let options: DepositPatchPlanPack[];
  let usedSalvage = false;
  if (usableOptions.length === 0) {
    const catalogPaths = Array.isArray(catalogForPrompt?.paths)
      ? (catalogForPrompt.paths as string[])
      : [];
    options = buildSalvagePacks(catalogPaths, exclusionPrefixes);
    usedSalvage = options.length > 0;
  } else {
    options = usableOptions;
  }

  const salvageCount = countSalvagedPacks(options);
  const modelSucceeded = usableOptions.length > 0 && !usedSalvage;
  const summary = usedSalvage
    ? `Host-salvaged ${options.length} deposit patch plan(s) after empty Refine (salvaged=true; NOT presentable). Patchfile write + measurements deferred.`
    : `Planned ${options.length} deposit AssetPack patch descriptor(s) (six fields; formal patchfile artifact write is next agent).`;

  const output: DepositPatchPlanPhaseOutput = {
    success: modelSucceeded,
    semanticKind: 'asset-pack-patch-plan',
    options,
    summary,
    assetPack: { repository },
    patchPlanComplete: true,
    patchfileWritten: false,
    measured: false,
    salvaged: salvageCount > 0,
    salvageCount,
  };

  storeCrossPhaseArtifact(execution, 'implementation', 'patchedPlans', options);
  storeCrossPhaseArtifact(execution, 'implementation', 'patchedOptions', options);
  storeCrossPhaseArtifact(execution, 'implementation', 'options', options);
  storeCrossPhaseArtifact(execution, 'implementation', 'assetPacks', options);
  storeCrossPhaseArtifact(execution, 'implementation', 'assetPack', output.assetPack);
  storeCrossPhaseArtifact(execution, 'implementation', 'summary', summary);
  storeCrossPhaseArtifact(execution, 'implementation', 'patchPlanComplete', true);
  storeCrossPhaseArtifact(execution, 'implementation', 'patchfileWritten', false);
  storeCrossPhaseArtifact(execution, 'implementation', 'measured', false);
  storeCrossPhaseArtifact(execution, 'implementation', 'presentable', false);
  storeCrossPhaseArtifact(execution, 'implementation', 'salvaged', output.salvaged);
  storeCrossPhaseArtifact(execution, 'implementation', 'salvageCount', salvageCount);
  storeCrossPhaseArtifact(execution, 'implementation', 'discoveryPacketAnchors', discoveryPacket.anchors);

  return output;
}
