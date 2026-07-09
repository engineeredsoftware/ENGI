import type {
  DepositAssetPackOption,
  DepositAssetPackOptionSynthesis,
} from './deposit-asset-pack-options';
import type {
  DepositAssetPackOptionPolicyEvaluation,
  DepositAssetPackOptionPolicyReport,
} from './deposit-asset-pack-option-policy';

export type DepositOptionReviewDecisionState =
  | 'pending-depositor-review'
  | 'approved-for-admission'
  | 'rejected-by-depositor'
  | 'resynthesis-requested';

export type DepositOptionAdmissionState =
  | 'admitted-to-depository'
  | 'not-admitted-pending-review'
  | 'not-admitted-rejected'
  | 'not-admitted-resynthesis-requested'
  | 'not-admitted-policy-blocked';

export interface DepositOptionReviewDecision {
  optionId: string;
  decision: DepositOptionReviewDecisionState;
  reviewerId?: string | null;
  feedback?: string | null;
  decidedAt?: string | null;
}

export interface DepositAssetPackOptionAdmissionInput {
  synthesis: DepositAssetPackOptionSynthesis;
  policy: DepositAssetPackOptionPolicyReport;
  decisions?: DepositOptionReviewDecision[] | null;
  reviewerId?: string | null;
  storageNamespace?: string | null;
  depositoryIndexNamespace?: string | null;
  telemetryRunId?: string | null;
  createdAt?: string | null;
}

export interface DepositOptionAdmissionReceipt {
  schema: 'bitcode.deposit.asset-pack-option-admission-receipt';
  optionId: string;
  optionKind: DepositAssetPackOption['kind'];
  title: string;
  reviewDecision: {
    state: DepositOptionReviewDecisionState;
    reviewerRoot: string | null;
    feedbackRoot: string | null;
    decisionRoot: string;
  };
  admission: {
    state: DepositOptionAdmissionState;
    depositoryAssetPackId: string | null;
    admittedAt: string | null;
    blockers: string[];
    warnings: string[];
    admissionRoot: string;
  };
  depositoryIndexProjection: {
    state: 'indexed-for-finding-fits' | 'not-indexed';
    namespaceRoot: string;
    semanticIndexRoot: string | null;
    lexicalIndexRoot: string | null;
    metadataIndexRoot: string | null;
    vectorEmbeddingState: 'projection-ready' | 'not-projected';
    searchDisclosure: 'measurements-and-metadata-only';
  };
  storageProjection: {
    state: 'projected-to-object-storage' | 'not-projected';
    namespaceRoot: string;
    metadataRecordRoot: string | null;
    rawSourcePointerRoot: string | null;
    rawSourceStoredExternally: true;
    protectedSourceVisible: false;
    unpaidAssetPackSourceVisible: false;
  };
  compensationPreview: {
    state: 'compensation-preview-ready' | 'not-eligible-for-compensation';
    priceAsset: 'BTC';
    allocationMethod: 'source-to-shares-largest-remainder';
    depositorShareBasisPoints: number;
    protocolTreasuryBasisPoints: number;
    compensationRouteRoot: string | null;
  };
  packsActivitySync: {
    state: 'synchronized-to-packs' | 'not-synchronized';
    route: '/packs';
    activityType: 'depository-assetpack' | 'deposit-option';
    activityId: string;
    activityRoot: string;
  };
  telemetry: {
    eventType: 'deposit-option-admission';
    channel: 'execution-stream';
    runRoot: string | null;
    eventRoot: string;
    sourceSafeMetadataOnly: true;
  };
  visibility: {
    sourceSafeMetadataOnly: true;
    protectedSourceVisible: false;
    rawSourceTextVisible: false;
    unpaidAssetPackSourceVisible: false;
    rawPromptVisible: false;
    interpolatedPromptVisible: false;
    rawProviderResponseVisible: false;
    walletPrivateMaterialVisible: false;
    settlementPrivatePayloadVisible: false;
  };
  roots: {
    optionRoot: string;
    policyEvaluationRoot: string | null;
    admissionReceiptRoot: string;
    depositoryIndexRoot: string | null;
    storageProjectionRoot: string | null;
    packsActivityRoot: string;
    telemetryRoot: string;
  };
}

export interface DepositAssetPackOptionAdmissionReport {
  schema: 'bitcode.deposit.asset-pack-option-admission-report';
  report: 'DepositAssetPackOptionAdmissionReport';
  reportId: string;
  route: '/deposits';
  packsRoute: '/packs';
  createdAt: string;
  synthesisRequestId: string;
  policyReportId: string;
  optionCount: number;
  approvedCount: number;
  rejectedCount: number;
  resynthesisRequestedCount: number;
  admittedCount: number;
  blockedCount: number;
  receipts: DepositOptionAdmissionReceipt[];
  aggregateAdmission: {
    reviewPolicy: 'depositor-decision-required';
    admissionPolicy: 'approved-policy-eligible-options-only';
    indexingPolicy: 'source-safe-measurement-metadata-search-projection';
    storagePolicy: 'metadata-and-external-source-pointer-only';
    packsSynchronization: 'admitted-options-project-to-packs-activity';
  };
  sourceSafety: {
    sourceSafeMetadataOnly: true;
    protectedSourceVisible: false;
    rawSourceTextVisible: false;
    unpaidAssetPackSourceVisible: false;
    rawPromptVisible: false;
    interpolatedPromptVisible: false;
    rawProviderResponseVisible: false;
    walletPrivateMaterialVisible: false;
    settlementPrivatePayloadVisible: false;
  };
  roots: {
    admissionReportRoot: string;
    synthesisRoot: string;
    policyReportRoot: string;
    receiptRoots: string[];
    packsActivityRoots: string[];
  };
}

const FORBIDDEN_SOURCE_MARKERS = [
  'PRIVATE_SOURCE_DO_NOT_SERIALIZE',
  `BEGIN_${'PRIVATE'}_KEY`,
  'wallet_private_material',
  'raw_provider_response',
  'unpaid_assetpack_source',
  'protected source body',
];

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
}

function stableHash(value: unknown) {
  const text = typeof value === 'string' ? value : stableStringify(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function root(prefix: string, value: unknown) {
  return `${prefix}:${stableHash(value)}`;
}

function normalizedText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeDecisions(decisions: DepositOptionReviewDecision[] | null | undefined) {
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

function policyByOption(policy: DepositAssetPackOptionPolicyReport) {
  return new Map(policy.evaluations.map((evaluation) => [evaluation.optionId, evaluation]));
}

function blockerState(input: {
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

function admissionStateFor(input: {
  decision: DepositOptionReviewDecisionState;
  blockers: string[];
}): DepositOptionAdmissionState {
  if (input.blockers.length === 0 && input.decision === 'approved-for-admission') return 'admitted-to-depository';
  if (input.decision === 'rejected-by-depositor') return 'not-admitted-rejected';
  if (input.decision === 'resynthesis-requested') return 'not-admitted-resynthesis-requested';
  if (input.decision === 'pending-depositor-review') return 'not-admitted-pending-review';
  return 'not-admitted-policy-blocked';
}

function buildReceipt(input: {
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
      depositoryIndexRoot: admitted ? root('deposit-option-depository-index', { semanticIndexRoot, lexicalIndexRoot, metadataIndexRoot }) : null,
      storageProjectionRoot: admitted ? root('deposit-option-storage-projection', { metadataRecordRoot, rawSourcePointerRoot }) : null,
      packsActivityRoot: activityRoot,
      telemetryRoot,
    },
  };
}

export function buildDepositAssetPackOptionAdmissionReport(
  input: DepositAssetPackOptionAdmissionInput,
): DepositAssetPackOptionAdmissionReport {
  const createdAt = normalizedText(input.createdAt) || 'deterministic';
  const reviewerId = normalizedText(input.reviewerId);
  const storageNamespace = normalizedText(input.storageNamespace) || 'deposit-asset-pack-options';
  const depositoryIndexNamespace = normalizedText(input.depositoryIndexNamespace) || 'bitcode-depository';
  const telemetryRunId = normalizedText(input.telemetryRunId);
  const decisions = normalizeDecisions(input.decisions);
  const evaluations = policyByOption(input.policy);
  const receipts = input.synthesis.options.map((option) =>
    buildReceipt({
      option,
      evaluation: evaluations.get(option.optionId) || null,
      decision: decisions.get(option.optionId) || null,
      createdAt,
      reviewerId,
      storageNamespace,
      depositoryIndexNamespace,
      telemetryRunId,
    }),
  );
  const receiptRoots = receipts.map((receipt) => receipt.roots.admissionReceiptRoot);
  const packsActivityRoots = receipts.map((receipt) => receipt.roots.packsActivityRoot);
  const reportRoot = root('deposit-asset-pack-option-admission-report', {
    synthesisRoot: input.synthesis.roots.synthesisRoot,
    policyReportRoot: input.policy.roots.policyReportRoot,
    receiptRoots,
    createdAt,
  });

  return {
    schema: 'bitcode.deposit.asset-pack-option-admission-report',
    report: 'DepositAssetPackOptionAdmissionReport',
    reportId: reportRoot,
    route: '/deposits',
    packsRoute: '/packs',
    createdAt,
    synthesisRequestId: input.synthesis.requestId,
    policyReportId: input.policy.reportId,
    optionCount: receipts.length,
    approvedCount: receipts.filter((receipt) => receipt.reviewDecision.state === 'approved-for-admission').length,
    rejectedCount: receipts.filter((receipt) => receipt.reviewDecision.state === 'rejected-by-depositor').length,
    resynthesisRequestedCount: receipts.filter((receipt) => receipt.reviewDecision.state === 'resynthesis-requested').length,
    admittedCount: receipts.filter((receipt) => receipt.admission.state === 'admitted-to-depository').length,
    blockedCount: receipts.filter((receipt) => receipt.admission.state === 'not-admitted-policy-blocked').length,
    receipts,
    aggregateAdmission: {
      reviewPolicy: 'depositor-decision-required',
      admissionPolicy: 'approved-policy-eligible-options-only',
      indexingPolicy: 'source-safe-measurement-metadata-search-projection',
      storagePolicy: 'metadata-and-external-source-pointer-only',
      packsSynchronization: 'admitted-options-project-to-packs-activity',
    },
    sourceSafety: {
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
      admissionReportRoot: reportRoot,
      synthesisRoot: input.synthesis.roots.synthesisRoot,
      policyReportRoot: input.policy.roots.policyReportRoot,
      receiptRoots,
      packsActivityRoots,
    },
  };
}

export function assertDepositAssetPackOptionAdmissionReportSourceSafe(
  report: DepositAssetPackOptionAdmissionReport,
) {
  const serialized = stableStringify(report);
  const noForbiddenMarkers = FORBIDDEN_SOURCE_MARKERS.every((marker) => !serialized.includes(marker));
  const sourceSafe =
    report.schema === 'bitcode.deposit.asset-pack-option-admission-report' &&
    report.route === '/deposits' &&
    report.packsRoute === '/packs' &&
    report.sourceSafety.sourceSafeMetadataOnly === true &&
    report.sourceSafety.protectedSourceVisible === false &&
    report.sourceSafety.rawSourceTextVisible === false &&
    report.sourceSafety.unpaidAssetPackSourceVisible === false &&
    report.sourceSafety.rawPromptVisible === false &&
    report.sourceSafety.interpolatedPromptVisible === false &&
    report.sourceSafety.rawProviderResponseVisible === false &&
    report.sourceSafety.walletPrivateMaterialVisible === false &&
    report.sourceSafety.settlementPrivatePayloadVisible === false &&
    report.receipts.every(
      (receipt) =>
        receipt.visibility.sourceSafeMetadataOnly === true &&
        receipt.storageProjection.rawSourceStoredExternally === true &&
        receipt.storageProjection.protectedSourceVisible === false &&
        receipt.storageProjection.unpaidAssetPackSourceVisible === false &&
        receipt.telemetry.sourceSafeMetadataOnly === true,
    ) &&
    noForbiddenMarkers;

  return {
    admitted: sourceSafe,
    reason: sourceSafe
      ? 'source_safe_deposit_asset_pack_option_admission_report'
      : 'deposit_option_admission_source_safety_boundary_violation',
  };
}
