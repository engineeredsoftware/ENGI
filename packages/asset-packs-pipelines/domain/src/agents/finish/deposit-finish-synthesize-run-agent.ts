/**
 * finish:finish-synthesize-asset-packs-for-deposit-run — last Finish agent.
 *
 * Builds the presentation envelope for UI option selection from full pipeline
 * execution state (no new content). Records completion metrics and cleanup posture.
 */

import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

export default async function runDepositFinishSynthesizeRunAgent(input: any, execution: any) {
  const stored = findValue(execution, 'finish', 'storedArtifacts');
  const ledgerize = findValue(execution, 'finish', 'ledgerize');
  const options =
    stored?.assetPacks ??
    findValue(execution, 'implementation', 'options') ??
    [];
  const ready = findValue(execution, 'validation', 'readyToFinish');
  const admission = findValue(execution, 'setup', 'admission');
  const repository = findValue(execution, 'deposit', 'repository') ?? {};
  const workspacePath = findValue(execution, 'repository', 'workspacePath');

  const selectionEnvelope = {
    schema: 'bitcode.deposit.synthesize-asset-packs.selection-envelope',
    surface: '/deposits',
    purpose: 'user-select-options-to-deposit',
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
      // patch + measurements + metadata (nested kinds; deposit needinesses empty)
      patch: opt?.patch ?? null,
      measurements:
        opt?.measurements && typeof opt.measurements === 'object' && !Array.isArray(opt.measurements)
          ? {
              absolutes: opt.measurements.absolutes ?? opt?.absolutes ?? [],
              needinesses: opt.measurements.needinesses ?? [],
            }
          : {
              absolutes: opt?.absolutes ?? [],
              needinesses: [],
            },
      metadata: {
        measurementRationale: opt?.measurementRationale ?? null,
      },
      selectable: true,
    })),
    readyToPresent: Boolean(ready?.recommendation === 'finish' || ready?.readyToFinish !== false),
    validationSummary: ready?.summary ?? null,
  };

  const completion = {
    schema: 'bitcode.deposit.synthesize-asset-packs.completion',
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
      note: 'Host workspace dispose is owned by dispatch after Finish returns.',
    },
    processingStats: {
      // Tokens rolled at dispatch from execution tree when available.
      phase: 'finish',
      productPipeline: 'synthesize-deposit-asset-packs',
    },
  };

  storeCrossPhaseArtifact(execution, 'finish', 'completion', completion);
  storeCrossPhaseArtifact(execution, 'finish', 'selectionEnvelope', selectionEnvelope);
  storeCrossPhaseArtifact(execution, 'finish', 'summary', {
    optionCount: selectionEnvelope.options.length,
    message: `Synthesize deposit AssetPacks finished with ${selectionEnvelope.options.length} option(s) for selection.`,
  });

  return {
    ...(input || {}),
    success: true,
    completion,
    selectionEnvelope,
  };
}
