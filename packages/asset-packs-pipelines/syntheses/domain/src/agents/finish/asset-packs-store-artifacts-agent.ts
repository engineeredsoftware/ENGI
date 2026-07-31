/**
 * finish:store-artifacts — persist deposit synthesis run artifacts.
 *
 * Precise contract:
 * 1. Build durable artifact bundle (AssetPacks = patch + measurements + metadata,
 *    discovery maps, setup admission, sourceCheckoutCatalog path list).
 * 2. Store on Execution (finish:storedArtifacts) for route projection.
 * 3. If execution provides deposit:persistArtifacts (async fn), invoke it for
 *    Supabase / durable store write; record finish:persistResult.
 * 4. Never include full sourceCheckoutCatalog file bodies in the durable bundle
 *    by default (source-safe).
 */

import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

export type DepositStoredArtifactsBundle = {
  schema: 'bitcode.deposit.synthesize-asset-packs.artifacts';
  storedAt: string;
  assetPacks: unknown[];
  patches: Array<{
    title?: string;
    kind?: string;
    patch?: unknown;
    coveredSourcePaths?: unknown;
    absolutes?: unknown;
    metadata?: Record<string, unknown>;
  }>;
  discovery: Record<string, unknown>;
  setup: Record<string, unknown>;
  validation: unknown;
  sourceCheckoutCatalog: {
    pathCount: number;
    sampleCount: number;
    fileBodyCount: number;
    paths: string[];
  } | null;
};

export default async function runDepositStoreArtifactsAgent(input: any, execution: any) {
  const options =
    findValue(execution, 'implementation', 'options') ??
    findValue(execution, 'implementation', 'assetPacks') ??
    [];
  const catalog =
    findValue(execution, 'deposit', 'sourceCheckoutCatalog');
  const codebase = findValue(execution, 'discovery', 'codebaseComprehension');
  const codebaseAnalysis = findValue(execution, 'discovery', 'codebaseAnalysis');
  const depository = findValue(execution, 'discovery', 'depositorySearch');
  const depositoryTool = findValue(execution, 'discovery', 'depositorySearchToolResult');
  const regurgitation = findValue(execution, 'discovery', 'inherentRegurgitation');
  const measurements = findValue(execution, 'discovery', 'sourceMeasurements');
  const admission = findValue(execution, 'setup', 'admission');
  const validation = findValue(execution, 'validation', 'readyToFinish');
  const validationGate = findValue(execution, 'validation', 'gateDecision');
  const depositQuality = findValue(execution, 'validation', 'depositQuality');
  const repository = findValue(execution, 'deposit', 'repository') ?? {};
  const runId =
    findValue(execution, 'host', 'runId') ||
    findValue(execution, 'pipeline', 'runId') ||
    execution?.id ||
    null;

  const assetPacks = Array.isArray(options) ? options : [];
  const artifactBundle: DepositStoredArtifactsBundle = {
    schema: 'bitcode.deposit.synthesize-asset-packs.artifacts',
    storedAt: new Date().toISOString(),
    assetPacks,
    patches: assetPacks.map((opt: any) => ({
      title: opt?.title,
      kind: opt?.kind,
      patch: opt?.patch,
      coveredSourcePaths: opt?.coveredSourcePaths,
      // Deposit: absolutes only (neediness is Read-pipeline).
      measurements:
        opt?.measurements && typeof opt.measurements === 'object' && !Array.isArray(opt.measurements)
          ? {
              absolutes: opt.measurements.absolutes ?? [],
            }
          : { absolutes: Array.isArray(opt?.absolutes) ? opt.absolutes : [] },
      metadata: {
        confidence: opt?.confidence,
        summary: opt?.summary,
      },
    })),
    discovery: {
      codebaseComprehension: codebase,
      codebaseAnalysisSummary: codebaseAnalysis
        ? {
            pathCount: codebaseAnalysis.sourceCheckoutCatalog?.pathCount,
            keyFileCount: Array.isArray(codebaseAnalysis.keyFileReads)
              ? codebaseAnalysis.keyFileReads.length
              : 0,
            measurementCount: Array.isArray(codebaseAnalysis.sourceMeasurements)
              ? codebaseAnalysis.sourceMeasurements.length
              : 0,
            lspInitialized: codebaseAnalysis.lsp?.initialized,
          }
        : null,
      depositorySearch: depository,
      depositorySearchTool: depositoryTool
        ? {
            hitCount: depositoryTool.hitCount,
            queryTerms: depositoryTool.queryTerms,
            vectorStatus: depositoryTool.vectorStore?.status,
          }
        : null,
      inherentRegurgitation: regurgitation,
      sourceMeasurements: measurements,
    },
    setup: { admission },
    validation: {
      readyToFinish: validation,
      gateDecision: validationGate || null,
      qualityScore:
        typeof depositQuality?.qualityScore === 'number' ? depositQuality.qualityScore : null,
      issueCount: Array.isArray(depositQuality?.issues) ? depositQuality.issues.length : null,
    },
    sourceCheckoutCatalog: catalog
      ? {
          pathCount: Array.isArray(catalog.paths) ? catalog.paths.length : 0,
          sampleCount: Array.isArray(catalog.samples) ? catalog.samples.length : 0,
          fileBodyCount: Array.isArray(catalog.sources) ? catalog.sources.length : 0,
          paths: Array.isArray(catalog.paths) ? catalog.paths : [],
        }
      : null,
  };

  storeCrossPhaseArtifact(execution, 'finish', 'storedArtifacts', artifactBundle);
  // User-review store only — not Delivery (PR ship is settle-pipeline exclusive).
  storeCrossPhaseArtifact(execution, 'finish', 'uploadForReview', {
    success: true,
    kind: 'bitcode-review-upload',
    review: {
      surface: '/deposits',
      reviewFor: 'deposit-admission',
      decision: 'pending-user-review',
    },
    options: assetPacks,
    artifacts: artifactBundle,
    summary: `Stored ${assetPacks.length} AssetPack artifact(s) for deposit review.`,
  });
  storeCrossPhaseArtifact(execution, 'finish', 'reviewUpload', 'bitcode-review-upload');

  // Durable write hook (Supabase / DB) — Host/dispatch injects deposit:persistArtifacts.
  let persistResult: { ok: boolean; mode: string; detail?: string } = {
    ok: true,
    mode: 'execution-store-only',
    detail: 'No deposit:persistArtifacts hook; artifacts remain on Execution for route upsert.',
  };
  const persist = findValue(execution, 'deposit', 'persistArtifacts');
  if (typeof persist === 'function') {
    try {
      const out = await persist({
        runId,
        repository,
        artifactBundle,
        assetPacks,
      });
      persistResult = {
        ok: out?.ok !== false,
        mode: 'hook',
        detail: typeof out?.detail === 'string' ? out.detail : 'persistArtifacts hook completed',
      };
    } catch (err) {
      persistResult = {
        ok: false,
        mode: 'hook-failed',
        detail: err instanceof Error ? err.message : String(err),
      };
    }
  }
  storeCrossPhaseArtifact(execution, 'finish', 'persistResult', persistResult);

  return {
    ...(input || {}),
    success: persistResult.ok,
    storedArtifacts: artifactBundle,
    persistResult,
  };
}
