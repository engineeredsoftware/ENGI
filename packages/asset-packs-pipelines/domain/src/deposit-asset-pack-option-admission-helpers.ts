/**
 * Pure helpers for deposit option admission receipts and decision normalization.
 *
 * Maps depositor review decisions + policy evaluations into source-safe
 * depository/index/storage/Packs projections (roots and pointers only).
 */

import type { DepositAssetPackOption } from './deposit-asset-pack-options-types';
import type { DepositAssetPackOptionPolicyEvaluation, DepositAssetPackOptionPolicyReport } from './deposit-asset-pack-option-policy-types';
import type {
  DepositOptionAdmissionReceipt,
  DepositOptionAdmissionState,
  DepositOptionReviewDecision,
  DepositOptionReviewDecisionState,
} from './deposit-asset-pack-option-admission-types';
import { normalizedText, root, stableHash } from './deposit-source-safe-utils';

/** Extra markers beyond the shared base set for admission reports. */
export const ADMISSION_EXTRA_FORBIDDEN_MARKERS = ['protected source body'] as const;

export function normalizeDecisions(decisions: DepositOptionReviewDecision[] | null | undefined) {
  return new Map(
    (decisions || [])
      .filter((decision) => normalizedText(decision.optionId))
      .map((decision) => [
        normalizedText(decision.optionId) as string,
        {
          optionId: normalizedText(decision.optionId) as string,
          decision: decision.decision || 'pending-depositor-review',
          reviewerId: normalizedText(decision.reviewerId),
          feedback: normalizedText(decision.feedback),
          decidedAt: normalizedText(decision.decidedAt),
        },
      ]),
  );
}

export function policyByOption(policy: DepositAssetPackOptionPolicyReport) {
  return new Map(policy.evaluations.map((evaluation) => [evaluation.optionId, evaluation]));
}

export function blockerState(input: {
  option: DepositAssetPackOption;
  evaluation: DepositAssetPackOptionPolicyEvaluation | null;
  decision: DepositOptionReviewDecisionState;
}) {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (input.option.reviewBoundary.state !== 'reviewable-source-safe-option') {
    blockers.push(input.option.reviewBoundary.state);
  }

  if (!input.evaluation) {
    blockers.push('missing-policy-evaluation');
  } else {
    blockers.push(...input.evaluation.sourceCriticality.blockers);
    blockers.push(...input.evaluation.compensation.blockers);
    warnings.push(...input.evaluation.sourceCriticality.warnings);
    warnings.push(...input.evaluation.compensation.warnings);
    if (input.evaluation.policyDecision === 'blocked-before-admission') {
      blockers.push('policy-blocked-before-admission');
    }
    if (input.evaluation.compensation.state !== 'eligible-if-approved-and-selected') {
      blockers.push('compensation-route-repair-required-before-admission');
    }
  }

  if (input.decision === 'pending-depositor-review') blockers.push('depositor-review-required');
  if (input.decision === 'rejected-by-depositor') blockers.push('depositor-rejected-option');
  if (input.decision === 'resynthesis-requested') blockers.push('depositor-requested-resynthesis');

  return { blockers: [...new Set(blockers)], warnings: [...new Set(warnings)] };
}

export function admissionStateFor(input: {
  decision: DepositOptionReviewDecisionState;
  blockers: string[];
}): DepositOptionAdmissionState {
  if (input.blockers.length === 0 && input.decision === 'approved-for-admission') return 'admitted-to-depository';
  if (input.decision === 'rejected-by-depositor') return 'not-admitted-rejected';
  if (input.decision === 'resynthesis-requested') return 'not-admitted-resynthesis-requested';
  if (input.decision === 'pending-depositor-review') return 'not-admitted-pending-review';
  return 'not-admitted-policy-blocked';
}

export function buildReceipt(input: {
  option: DepositAssetPackOption;
  evaluation: DepositAssetPackOptionPolicyEvaluation | null;
  decision: DepositOptionReviewDecision | null;
  createdAt: string;
  reviewerId: string | null;
  storageNamespace: string;
  depositoryIndexNamespace: string;
  telemetryRunId: string | null;
}): DepositOptionAdmissionReceipt {
  const decisionState = input.decision?.decision || 'pending-depositor-review';
  const reviewerId = input.decision?.reviewerId || input.reviewerId;
  const feedback = input.decision?.feedback || null;
  const { blockers, warnings } = blockerState({
    option: input.option,
    evaluation: input.evaluation,
    decision: decisionState,
  });
  const admissionState = admissionStateFor({ decision: decisionState, blockers });
  const admitted = admissionState === 'admitted-to-depository';
  const reviewerRoot = reviewerId ? root('deposit-option-reviewer', reviewerId) : null;
  const feedbackRoot = feedback ? root('deposit-option-review-feedback', feedback) : null;
  const decisionRoot = root('deposit-option-review-decision', {
    optionId: input.option.optionId,
    decisionState,
    reviewerRoot,
    feedbackRoot,
    decidedAt: input.decision?.decidedAt || input.createdAt,
  });
  const depositoryAssetPackId = admitted
    ? `depository-assetpack-${stableHash({
        optionId: input.option.optionId,
        optionRoot: input.option.roots.optionRoot,
        decisionRoot,
      })}`
    : null;
  const admissionRoot = root('deposit-option-admission', {
    optionId: input.option.optionId,
    depositoryAssetPackId,
    admissionState,
    blockers,
    warnings,
    decisionRoot,
  });
  const namespaceRoot = root('deposit-option-admission-namespace', {
    storageNamespace: input.storageNamespace,
    depositoryIndexNamespace: input.depositoryIndexNamespace,
  });
  const semanticIndexRoot = admitted
    ? root('deposit-option-semantic-index', {
        optionRoot: input.option.roots.optionRoot,
        measurementRoot: input.option.roots.measurementRoot,
        demandRoot: input.option.roots.demandAlignmentRoot,
      })
    : null;
  const lexicalIndexRoot = admitted
    ? root('deposit-option-lexical-index', {
        title: input.option.title,
        kind: input.option.kind,
        sourceBindingRoot: input.option.roots.sourceBindingRoot,
      })
    : null;
  const metadataIndexRoot = admitted
    ? root('deposit-option-metadata-index', {
        depositoryAssetPackId,
        sourceBindingRoot: input.option.roots.sourceBindingRoot,
        policyEvaluationRoot: input.evaluation?.roots.policyEvaluationRoot || null,
      })
    : null;
  const metadataRecordRoot = admitted
    ? root('deposit-option-storage-metadata-record', {
        depositoryAssetPackId,
        optionRoot: input.option.roots.optionRoot,
        policyEvaluationRoot: input.evaluation?.roots.policyEvaluationRoot || null,
        admissionRoot,
      })
    : null;
  const rawSourcePointerRoot = admitted
    ? root('deposit-option-external-source-pointer', {
        depositoryAssetPackId,
        sourceBindingRoot: input.option.roots.sourceBindingRoot,
        sourcePathRoots: input.option.sourceBinding.sourcePathRoots,
      })
    : null;
  const compensationRouteRoot =
    admitted && input.evaluation?.compensation.state === 'eligible-if-approved-and-selected'
      ? input.evaluation.compensation.compensationRouteRoot
      : null;
  const activityType = admitted ? 'depository-assetpack' : 'deposit-option';
  const activityId = `${activityType}:${input.option.optionId}`;
  const activityRoot = root('deposit-option-packs-activity', {
    activityId,
    activityType,
    depositoryAssetPackId,
    admissionRoot,
    compensationRouteRoot,
  });
  const telemetryRoot = root('deposit-option-admission-telemetry', {
    eventType: 'deposit-option-admission',
    telemetryRunId: input.telemetryRunId,
    optionId: input.option.optionId,
    admissionState,
    activityRoot,
  });
  const receiptRoot = root('deposit-option-admission-receipt', {
    optionRoot: input.option.roots.optionRoot,
    policyEvaluationRoot: input.evaluation?.roots.policyEvaluationRoot || null,
    admissionRoot,
    activityRoot,
    telemetryRoot,
  });

  return {
    schema: 'bitcode.deposit.asset-pack-option-admission-receipt',
    optionId: input.option.optionId,
    optionKind: input.option.kind,
    title: input.option.title,
    reviewDecision: {
      state: decisionState,
      reviewerRoot,
      feedbackRoot,
      decisionRoot,
    },
    admission: {
      state: admissionState,
      depositoryAssetPackId,
      admittedAt: admitted ? input.createdAt : null,
      blockers,
      warnings,
      admissionRoot,
    },
    depositoryIndexProjection: {
      state: admitted ? 'indexed-for-finding-fits' : 'not-indexed',
      namespaceRoot,
      semanticIndexRoot,
      lexicalIndexRoot,
      metadataIndexRoot,
      vectorEmbeddingState: admitted ? 'projection-ready' : 'not-projected',
      searchDisclosure: 'measurements-and-metadata-only',
    },
    storageProjection: {
      state: admitted ? 'projected-to-object-storage' : 'not-projected',
      namespaceRoot,
      metadataRecordRoot,
      rawSourcePointerRoot,
      rawSourceStoredExternally: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
    },
    compensationPreview: {
      state: compensationRouteRoot ? 'compensation-preview-ready' : 'not-eligible-for-compensation',
      priceAsset: 'BTC',
      allocationMethod: 'source-to-shares-largest-remainder',
      depositorShareBasisPoints: input.evaluation?.compensation.depositorShareBasisPoints ?? 0,
      protocolTreasuryBasisPoints: input.evaluation?.compensation.protocolTreasuryBasisPoints ?? 0,
      compensationRouteRoot,
    },
    packsActivitySync: {
      state: admitted ? 'synchronized-to-packs' : 'not-synchronized',
      route: '/packs',
      activityType,
      activityId,
      activityRoot,
    },
    telemetry: {
      eventType: 'deposit-option-admission',
      channel: 'execution-stream',
      runRoot: input.telemetryRunId ? root('deposit-option-admission-run', input.telemetryRunId) : null,
      eventRoot: telemetryRoot,
      sourceSafeMetadataOnly: true,
    },
    visibility: {
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
    },
    roots: {
      optionRoot: input.option.roots.optionRoot,
      policyEvaluationRoot: input.evaluation?.roots.policyEvaluationRoot || null,
      admissionReceiptRoot: receiptRoot,
      depositoryIndexRoot: admitted
        ? root('deposit-option-depository-index', { semanticIndexRoot, lexicalIndexRoot, metadataIndexRoot })
        : null,
      storageProjectionRoot: admitted
        ? root('deposit-option-storage-projection', { metadataRecordRoot, rawSourcePointerRoot })
        : null,
      packsActivityRoot: activityRoot,
      telemetryRoot,
    },
  };
}
