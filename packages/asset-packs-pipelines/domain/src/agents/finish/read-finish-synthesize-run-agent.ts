/**
 * finish:finish-synthesize-asset-packs-for-read-run
 * Selection envelope for /reads → user picks options → SettleAssetPacks.
 */

import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
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

  const selectionEnvelope = {
    schema: 'bitcode.read.synthesize-asset-packs.selection-envelope',
    surface: '/reads',
    purpose: 'user-select-options-to-settle',
    nextPipeline: 'settle-asset-packs',
    need: need || null,
    repositoryFullName:
      repository.fullName ||
      (repository.owner && repository.name ? `${repository.owner}/${repository.name}` : null),
    options: (Array.isArray(options) ? options : []).map((opt: any, index: number) => ({
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
    })),
    readyToPresent: Boolean(ready?.recommendation === 'finish' || ready?.readyToFinish !== false),
    validationSummary: ready?.summary ?? null,
  };

  const completion = {
    schema: 'bitcode.read.synthesize-asset-packs.completion',
    completedAt: new Date().toISOString(),
    success: true,
    optionCount: selectionEnvelope.options.length,
    selectionEnvelope,
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
      productPipeline: 'synthesize-read-asset-packs',
    },
  };

  storeCrossPhaseArtifact(execution, 'finish', 'completion', completion);
  storeCrossPhaseArtifact(execution, 'finish', 'selectionEnvelope', selectionEnvelope);
  storeCrossPhaseArtifact(execution, 'finish', 'summary', {
    optionCount: selectionEnvelope.options.length,
    message: `Synthesize read AssetPacks finished with ${selectionEnvelope.options.length} option(s) for settle selection.`,
  });

  return {
    ...(input || {}),
    success: true,
    completion,
    selectionEnvelope,
  };
}
