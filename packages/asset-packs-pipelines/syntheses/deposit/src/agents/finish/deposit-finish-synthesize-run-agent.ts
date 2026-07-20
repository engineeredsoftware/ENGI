/**
 * finish:finish-synthesize-asset-packs-for-deposit-run — last Finish agent.
 *
 * Builds the presentation envelope for UI option selection from full pipeline
 * execution state (no new content). Records completion metrics and cleanup posture.
 */

import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';

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
    readyToPresent: Boolean(
      ready?.finalApproval === true ||
        ready?.readyToFinish === true ||
        ready?.ready === true ||
        ready?.recommendation === 'finish' ||
        ready?.recommendation === 'complete',
    ),
    validationSummary: ready?.summary ?? null,
  };

  const validationGate = findValue(execution, 'validation', 'gateDecision');
  const depositQuality = findValue(execution, 'validation', 'depositQuality');
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
    // Validation admit path for run telemetry (deterministic short-circuit vs PTRR).
    validation: {
      ready: ready
        ? {
            recommendation: ready.recommendation ?? null,
            summary: ready.summary ?? null,
            issueCount: Array.isArray(ready.issues) ? ready.issues.length : 0,
          }
        : null,
      gateDecision: validationGate || null,
      qualityScore:
        typeof depositQuality?.qualityScore === 'number' ? depositQuality.qualityScore : null,
    },
    cleanup: {
      hostWorkspacePath: workspacePath || null,
      disposeRecommended: Boolean(workspacePath),
      note: 'Host workspace dispose is owned by dispatch after Finish returns.',
    },
    processingStats: {
      // Tokens rolled at dispatch from execution tree when available.
      phase: 'finish',
      productPipeline: 'synthesize-deposits-asset-packs-pipeline',
      optionCount: selectionEnvelope.options.length,
      readyToPresent: selectionEnvelope.readyToPresent,
    },
  };

  storeCrossPhaseArtifact(execution, 'finish', 'completion', completion);
  storeCrossPhaseArtifact(execution, 'finish', 'selectionEnvelope', selectionEnvelope);
  const finishMessage = `Synthesize deposit AssetPacks finished with ${selectionEnvelope.options.length} option(s) for selection.`;
  storeCrossPhaseArtifact(execution, 'finish', 'summary', {
    optionCount: selectionEnvelope.options.length,
    message: finishMessage,
  });
  // Formal Finish phase decision so the log always shows Finish closed even when
  // Finish agents are mostly deterministic packaging (no long LLM trail).
  storeCrossPhaseArtifact(execution, 'finish', 'phaseDecision', {
    schema: 'bitcode.pipeline.phase-decision',
    formalPhaseDecision: true,
    phase: 'finish',
    agent: 'finish-synthesize-asset-packs-for-deposit-run',
    step: 'decide',
    failsafe: 'selection-envelope',
    generation: 'structure',
    summary: finishMessage,
    message: finishMessage,
    optionCount: selectionEnvelope.options.length,
    readyToPresent: selectionEnvelope.readyToPresent,
  });

  return {
    ...(input || {}),
    success: true,
    completion,
    selectionEnvelope,
    // Top-level carriers for host evidence / depositor selection UI.
    options: selectionEnvelope.options,
    depositOptions: selectionEnvelope.options,
    // Deposit synthesis options — not fit (fit is exclusively post-read).
    resultState:
      selectionEnvelope.options.length > 0
        ? 'worthy_deposit_candidates'
        : 'no_worthy_deposit_candidates',
  };
}
