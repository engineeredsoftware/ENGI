/**
 * finish:finish-synthesize-asset-packs-for-read-run
 * Selection envelope for /reads → user picks options → settle-asset-pack-pipeline.
 *
 * V48-Gate5-F01: browser envelope is unpaid-only (title+summary+measurements);
 * fullOptions stored server-side for settle rehydrate by index.
 */

import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import { buildUnpaidReadSelectionEnvelope } from '@bitcode/asset-packs-pipelines-syntheses-domain/unpaid-option-disclosure';

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

function resolveCatalogSourcePathCount(execution: any): number | null {
  const catalog =
    findValue(execution, 'read', 'sourceCheckoutCatalog') ||
    findValue(execution, 'deposit', 'sourceCheckoutCatalog') ||
    null;
  const total =
    typeof catalog?.totalPathCount === 'number'
      ? catalog.totalPathCount
      : Array.isArray(catalog?.paths)
        ? catalog.paths.length
        : null;
  return typeof total === 'number' && total > 0 ? total : null;
}

export default async function runReadFinishSynthesizeRunAgent(input: any, execution: any) {
  const stored = findValue(execution, 'finish', 'storedArtifacts');
  const ledgerize = findValue(execution, 'finish', 'ledgerize');
  const options =
    stored?.assetPacks ??
    findValue(execution, 'implementation', 'options') ??
    [];
  const ready = findValue(execution, 'validation', 'readyToFinish');
  const admission = findValue(execution, 'setup', 'admission');
  const repository =
    findValue(execution, 'read', 'repository') ??
    findValue(execution, 'deposit', 'repository') ??
    {};
  const need = findValue(execution, 'read', 'need');
  const workspacePath = findValue(execution, 'repository', 'workspacePath');
  const catalogSourcePathCount = resolveCatalogSourcePathCount(execution);

  const fullOptions = (Array.isArray(options) ? options : []).map((opt: any, index: number) => ({
    index,
    kind: opt?.kind ?? null,
    title: opt?.title ?? null,
    summary: opt?.summary ?? null,
    coveredSourcePaths: opt?.coveredSourcePaths ?? [],
    confidence: opt?.confidence ?? null,
    patch: opt?.patch ?? null,
    measurements:
      opt?.measurements && typeof opt.measurements === 'object' && !Array.isArray(opt.measurements)
        ? {
            absolutes: opt.measurements.absolutes ?? [],
            needinesses: opt.measurements.needinesses ?? [],
          }
        : { absolutes: opt?.absolutes ?? [], needinesses: [] },
    needFit: opt?.needFit ?? null,
    metadata: {
      measurementRationale: opt?.measurementRationale ?? null,
    },
    selectable: true,
    settleable: true,
  }));

  const { selectionEnvelope, unpaidOptions, fullOptions: retainedFull } =
    buildUnpaidReadSelectionEnvelope({
      options: fullOptions,
      need: need || null,
      repositoryFullName:
        repository.fullName ||
        (repository.owner && repository.name ? `${repository.owner}/${repository.name}` : null),
      readyToPresent: Boolean(ready?.recommendation === 'finish' || ready?.readyToFinish !== false),
      validationSummary: ready?.summary ?? null,
      catalogSourcePathCount,
    });

  const completion = {
    schema: 'bitcode.read.synthesize-asset-packs.completion',
    completedAt: new Date().toISOString(),
    success: true,
    optionCount: unpaidOptions.length,
    selectionEnvelope,
    // Server-only carrier — history redaction must strip before browser.
    fullOptions: retainedFull,
    catalogSourcePathCount,
    ledgerize: ledgerize
      ? { status: ledgerize.status, assetPackCount: ledgerize.assetPackCount }
      : null,
    admission: admission ? { safe: admission.safe, flags: admission.flags } : null,
    cleanup: {
      hostWorkspacePath: workspacePath || null,
      disposeRecommended: Boolean(workspacePath),
      note: 'Host dispose owned by dispatch after Finish; settle may re-provision for PR ship.',
    },
    processingStats: {
      phase: 'finish',
      productPipeline: 'synthesize-reads-asset-packs-pipeline',
    },
    disclosure: {
      class: 'unpaid-title-summary-measurements-only',
    },
  };

  storeCrossPhaseArtifact(execution, 'finish', 'completion', completion);
  storeCrossPhaseArtifact(execution, 'finish', 'selectionEnvelope', selectionEnvelope);
  storeCrossPhaseArtifact(execution, 'finish', 'fullOptions', retainedFull);
  storeCrossPhaseArtifact(execution, 'finish', 'catalogSourcePathCount', catalogSourcePathCount);
  storeCrossPhaseArtifact(execution, 'finish', 'summary', {
    optionCount: unpaidOptions.length,
    message: `Synthesize read AssetPacks finished with ${unpaidOptions.length} option(s) for settle selection.`,
  });

  return {
    ...(input || {}),
    success: true,
    completion,
    selectionEnvelope,
    // Browser carriers: unpaid only.
    options: unpaidOptions,
    // Server rehydrate carrier (dispatch must persist; history must redact).
    fullOptions: retainedFull,
    catalogSourcePathCount,
    resultState:
      unpaidOptions.length > 0 ? 'worthy_read_candidates' : 'no_worthy_read_candidates',
  };
}
