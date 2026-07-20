/**
 * finish:finish-synthesize-asset-packs-for-deposit-run — last Finish agent.
 *
 * Builds the presentation envelope for UI option selection from full pipeline
 * execution state (no new content). Records completion metrics and cleanup posture.
 *
 * Presentable law:
 *   - Validation approved (finalApproval / recommendation complete|finish)
 *   - implementation:measured === true
 *   - implementation:presentable === true (or computed: no salvage, legal shape)
 *   - each selectable option passes isDepositPresentablePack
 *
 * Salvaged packs are never selectable. readyToPresent stays false if salvage
 * or incomplete measurements — depositor must re-run Implementation via iterate.
 */

import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import { isDepositPresentablePack } from '../implementation/deposit-implementation-pack-types';

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

function projectOption(opt: any, index: number) {
  const nestedAbsolutes =
    opt?.measurements &&
    typeof opt.measurements === 'object' &&
    !Array.isArray(opt.measurements) &&
    Array.isArray(opt.measurements.absolutes)
      ? opt.measurements.absolutes
      : null;
  const absolutes =
    Array.isArray(opt?.absolutes) && opt.absolutes.length > 0
      ? opt.absolutes
      : nestedAbsolutes || [];

  const presentable = isDepositPresentablePack(opt);
  const salvaged = opt?.salvaged === true;

  return {
    index,
    kind: opt?.kind ?? null,
    title: opt?.title ?? null,
    summary: opt?.summary ?? null,
    coveredSourcePaths: opt?.coveredSourcePaths ?? [],
    confidence: opt?.confidence ?? null,
    absolutes,
    patch: opt?.patch ?? null,
    // 7th field: formal patchfile artifact handle (no bodies in selection envelope).
    patchArtifact: opt?.patchArtifact
      ? {
          artifactId: opt.patchArtifact.artifactId,
          assetPackId: opt.patchArtifact.assetPackId,
          format: opt.patchArtifact.format,
          fileCount: opt.patchArtifact.fileCount,
          patchSummary: opt.patchArtifact.patchSummary,
          files: opt.patchArtifact.files,
          name: opt.patchArtifact.name,
        }
      : null,
    measurements: { absolutes },
    metadata: {
      measurementRationale: opt?.measurementRationale ?? null,
      salvaged,
      salvageReason: salvaged ? opt?.salvageReason ?? 'host-salvage' : null,
    },
    salvaged,
    selectable: presentable,
    presentable,
  };
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

  const implMeasured = findValue(execution, 'implementation', 'measured') === true;
  const implPresentable = findValue(execution, 'implementation', 'presentable') === true;
  const implSalvaged = findValue(execution, 'implementation', 'salvaged') === true;
  const salvageCount = Number(findValue(execution, 'implementation', 'salvageCount') ?? 0) || 0;

  const projected = (Array.isArray(options) ? options : []).map(projectOption);
  const presentableCount = projected.filter((o) => o.presentable).length;
  const selectableCount = projected.filter((o) => o.selectable).length;

  const validationApproved = Boolean(
    ready?.finalApproval === true ||
      ready?.readyToFinish === true ||
      ready?.ready === true ||
      ready?.recommendation === 'finish' ||
      ready?.recommendation === 'complete',
  );

  const readyToPresent =
    validationApproved &&
    implMeasured &&
    (implPresentable || (presentableCount > 0 && salvageCount === 0 && !implSalvaged)) &&
    selectableCount > 0 &&
    salvageCount === 0 &&
    !implSalvaged &&
    projected.every((o) => !o.salvaged);

  const selectionEnvelope = {
    schema: 'bitcode.deposit.synthesize-asset-packs.selection-envelope',
    surface: '/deposits',
    purpose: 'user-select-options-to-deposit',
    repositoryFullName:
      repository.fullName ||
      (repository.owner && repository.name ? `${repository.owner}/${repository.name}` : null),
    options: projected,
    readyToPresent,
    presentableCount,
    selectableCount,
    implementationMeasured: implMeasured,
    implementationPresentable: implPresentable,
    salvaged: implSalvaged || salvageCount > 0,
    salvageCount,
    validationSummary: ready?.summary ?? null,
  };

  const validationGate = findValue(execution, 'validation', 'gateDecision');
  const depositQuality = findValue(execution, 'validation', 'depositQuality');
  const completion = {
    schema: 'bitcode.deposit.synthesize-asset-packs.completion',
    completedAt: new Date().toISOString(),
    success: true,
    optionCount: selectionEnvelope.options.length,
    presentableCount,
    selectableCount,
    readyToPresent,
    selectionEnvelope,
    ledgerize: ledgerize
      ? { status: ledgerize.status, assetPackCount: ledgerize.assetPackCount }
      : null,
    admission: admission ? { safe: admission.safe, flags: admission.flags } : null,
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
      phase: 'finish',
      productPipeline: 'synthesize-deposits-asset-packs-pipeline',
      optionCount: selectionEnvelope.options.length,
      readyToPresent: selectionEnvelope.readyToPresent,
      presentableCount,
      salvaged: selectionEnvelope.salvaged,
    },
  };

  storeCrossPhaseArtifact(execution, 'finish', 'completion', completion);
  storeCrossPhaseArtifact(execution, 'finish', 'selectionEnvelope', selectionEnvelope);
  storeCrossPhaseArtifact(execution, 'finish', 'readyToPresent', readyToPresent);

  const finishMessage = readyToPresent
    ? `Synthesize deposit AssetPacks finished with ${selectableCount} presentable option(s) for selection.`
    : `Synthesize deposit AssetPacks finished with ${selectionEnvelope.options.length} option(s); readyToPresent=false (measured=${implMeasured}, salvage=${salvageCount}, selectable=${selectableCount}).`;

  storeCrossPhaseArtifact(execution, 'finish', 'summary', {
    optionCount: selectionEnvelope.options.length,
    presentableCount,
    readyToPresent,
    message: finishMessage,
  });
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
    options: selectionEnvelope.options,
    depositOptions: selectionEnvelope.options,
    readyToPresent,
    resultState:
      selectionEnvelope.options.length > 0
        ? readyToPresent
          ? 'worthy_deposit_candidates'
          : 'deposit_candidates_not_presentable'
        : 'no_worthy_deposit_candidates',
  };
}
