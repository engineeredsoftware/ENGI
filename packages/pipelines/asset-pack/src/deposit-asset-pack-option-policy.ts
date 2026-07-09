import type {
  DepositAssetPackOption,
  DepositAssetPackOptionSynthesis,
  DepositOptionDemandSignal,
} from './deposit-asset-pack-options';

export type DepositOptionCriticalityState =
  | 'sub-critical'
  | 'review-warning'
  | 'blocked-critical-source';

export type DepositOptionDemandState =
  | 'strong-likely-demand'
  | 'moderate-likely-demand'
  | 'weak-likely-demand'
  | 'unestimatable-demand';

export type DepositOptionRoiState =
  | 'positive-expected-value'
  | 'marginal-expected-value'
  | 'negative-expected-value'
  | 'blocked-criticality';

export type DepositOptionBtdPotentialState =
  | 'high-potential'
  | 'moderate-potential'
  | 'low-potential'
  | 'blocked-until-policy-repair';

export type DepositOptionCompensationState =
  | 'eligible-if-approved-and-selected'
  | 'repair-required-before-compensation'
  | 'blocked-before-compensation';

export interface DepositOptionCriticalitySignal {
  id?: string | null;
  label?: string | null;
  severity?: 'sub-critical' | 'warning' | 'critical' | null;
  weight?: number | null;
}

export interface DepositAssetPackOptionPolicyInput {
  synthesis: DepositAssetPackOptionSynthesis;
  sourceCriticalitySignals?: DepositOptionCriticalitySignal[] | null;
  developmentCostSats?: number | null;
  expectedSettlementSats?: number | null;
  depositorWalletId?: string | null;
  createdAt?: string | null;
  /** Ground demand in settled Depository AssetPack search; unestimatable fails closed. */
  settledDemand?: { estimatable: boolean; demand: number | null } | null;
}

export interface DepositAssetPackOptionPolicyEvaluation {
  schema: 'bitcode.deposit.asset-pack-option-policy-evaluation';
  optionId: string;
  optionKind: DepositAssetPackOption['kind'];
  title: string;
  policyDecision:
    | 'reviewable-positive-roi'
    | 'review-warning-before-admission'
    | 'blocked-before-admission';
  sourceCriticality: {
    state: DepositOptionCriticalityState;
    score: number;
    signalRoots: string[];
    blockers: string[];
    warnings: string[];
  };
  demand: {
    state: DepositOptionDemandState;
    confidence: number;
    weightedDemand: number;
    demandRoot: string;
  };
  roi: {
    state: DepositOptionRoiState;
    estimatedGrossSats: number;
    estimatedDevelopmentCostSats: number;
    expectedNetSats: number;
    roiMultiple: number;
    roiRoot: string;
  };
  btdPotential: {
    state: DepositOptionBtdPotentialState;
    estimatedKnowledgeVolume: number;
    estimatedBtdCells: number;
    estimateOnly: true;
    btdMintBoundary: 'not-minted-until-future-need-fit-settlement';
    rightsBoundary: 'depositor-retains-rights-until-paid-reader-settlement-transfer';
    btdPotentialRoot: string;
  };
  compensation: {
    state: DepositOptionCompensationState;
    payer: 'future-reader-after-settlement';
    payee: 'depositing-wallet';
    priceAsset: 'BTC';
    allocationMethod: 'source-to-shares-largest-remainder';
    depositorShareBasisPoints: number;
    protocolTreasuryBasisPoints: number;
    sourceToSharesProofState: 'not-created-until-accepted-need-fit-and-settlement';
    eligibleIfApprovedAndSelected: boolean;
    blockers: string[];
    warnings: string[];
    compensationRouteRoot: string;
  };
  admissionBoundary: {
    depositApprovalRequired: true;
    admissionAndIndexingOwnedBy: 'future-gate7-deposit-option-review';
    sourceBearingDisclosureBeforeSettlementVisible: false;
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
    policyEvaluationRoot: string;
    sourceCriticalityRoot: string;
    demandRoot: string;
    roiRoot: string;
    btdPotentialRoot: string;
    compensationRouteRoot: string;
  };
}

export interface DepositAssetPackOptionPolicyReport {
  schema: 'bitcode.deposit.asset-pack-option-policy-report';
  policy: 'DepositAssetPackOptionPolicy';
  reportId: string;
  createdAt: string;
  route: '/deposits';
  synthesisRequestId: string;
  optionCount: number;
  reviewablePositiveRoiCount: number;
  warningCount: number;
  blockedCount: number;
  evaluations: DepositAssetPackOptionPolicyEvaluation[];
  aggregatePolicy: {
    criticalityPolicy: 'source-safe-criticality-signals-with-depositor-review';
    demandPolicy: 'weighted-depository-reading-and-existing-supply-signals';
    roiPolicy: 'deterministic-estimated-gross-minus-development-cost';
    compensationPolicy: 'future-reader-btc-source-to-shares-route-preview';
    admissionAndIndexingOwnedBy: 'future-gate7-deposit-option-review';
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
    policyReportRoot: string;
    synthesisRoot: string;
    evaluationRoots: string[];
    aggregatePolicyRoot: string;
  };
}

const FORBIDDEN_SOURCE_MARKERS = [
  'PRIVATE_SOURCE_DO_NOT_SERIALIZE',
  `BEGIN_${'PRIVATE'}_KEY`,
  'wallet_private_material',
  'raw_provider_response',
  'unpaid_assetpack_source',
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

function boundedUnit(value: number | null | undefined, fallback: number) {
  const numeric = Number(value ?? fallback);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(1, numeric));
}

function positiveInteger(value: number | null | undefined, fallback: number) {
  const numeric = Number(value ?? fallback);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.round(numeric));
}

function normalizedCriticalitySignals(value: DepositOptionCriticalitySignal[] | null | undefined) {
  return (value || [])
    .map((signal, index) => ({
      id: normalizedText(signal.id) || `criticality-signal-${index + 1}`,
      label: normalizedText(signal.label) || `Criticality signal ${index + 1}`,
      severity: signal.severity || 'warning',
      weight: boundedUnit(signal.weight, 0.5),
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

function sumSignalWeights(signals: DepositOptionDemandSignal[] | undefined) {
  return (signals || []).reduce((sum, signal) => sum + boundedUnit(signal.weight, 0.5), 0);
}

function optionMeasurementVolume(option: DepositAssetPackOption) {
  if (!option.measurements.length) return 0;
  const weighted = option.measurements.reduce(
    (sum, measurement) => sum + boundedUnit(measurement.volume, 0) * boundedUnit(measurement.weight, 0),
    0,
  );
  const weights = option.measurements.reduce((sum, measurement) => sum + boundedUnit(measurement.weight, 0), 0);
  return Number((weights ? weighted / weights : 0).toFixed(4));
}

function sourceCriticalityFor(input: {
  option: DepositAssetPackOption;
  signals: ReturnType<typeof normalizedCriticalitySignals>;
}) {
  const signalRoots = input.signals.map((signal) => root('deposit-policy-criticality-signal', signal));
  const criticalWeight = input.signals
    .filter((signal) => signal.severity === 'critical')
    .reduce((sum, signal) => sum + signal.weight, 0);
  const warningWeight = input.signals
    .filter((signal) => signal.severity === 'warning')
    .reduce((sum, signal) => sum + signal.weight, 0);
  const subCriticalWeight = input.signals
    .filter((signal) => signal.severity === 'sub-critical')
    .reduce((sum, signal) => sum + signal.weight, 0);
  const sourceBreadthRisk = Math.min(0.2, input.option.sourceBinding.sourcePathCount * 0.025);
  const score = Number(Math.max(0, Math.min(1, 0.22 + criticalWeight * 0.55 + warningWeight * 0.22 - subCriticalWeight * 0.18 + sourceBreadthRisk)).toFixed(2));
  const state: DepositOptionCriticalityState = criticalWeight >= 0.75 || score >= 0.78
    ? 'blocked-critical-source'
    : score >= 0.48 || warningWeight > subCriticalWeight
      ? 'review-warning'
      : 'sub-critical';
  const blockers = state === 'blocked-critical-source' ? ['critical_source_policy_block'] : [];
  const warnings = [
    ...(state === 'review-warning' ? ['depositor_review_required_for_source_criticality'] : []),
    ...(!input.signals.length ? ['source_criticality_signals_missing'] : []),
  ];

  return {
    state,
    score,
    signalRoots,
    blockers,
    warnings,
  };
}

function demandFor(
  option: DepositAssetPackOption,
  settledDemand?: { estimatable: boolean; demand: number | null } | null,
) {
  // Prefer settled-Depository search. If unestimatable, do not fall back to
  // synthetic confidence from hardcoded demand signals.
  if (settledDemand && settledDemand.estimatable === false) {
    return {
      state: 'unestimatable-demand' as const,
      confidence: 0,
      weightedDemand: 0,
      demandRoot: root('deposit-policy-demand', {
        optionId: option.optionId,
        estimatable: false,
        depositorySignalRoots: option.demandAlignment.depositorySignalRoots,
      }),
    };
  }
  const settled =
    settledDemand?.estimatable && typeof settledDemand.demand === 'number'
      ? Math.max(0, Math.min(1, settledDemand.demand))
      : null;
  // Blend option alignment confidence with settled-corpus demand when present.
  const base = option.demandAlignment.confidence;
  const weightedDemand = Number(
    Math.max(
      0,
      Math.min(1, settled == null ? base : settled * 0.72 + base * 0.28),
    ).toFixed(2),
  );
  const state: DepositOptionDemandState =
    weightedDemand >= 0.76
      ? 'strong-likely-demand'
      : weightedDemand >= 0.56
        ? 'moderate-likely-demand'
        : 'weak-likely-demand';

  return {
    state,
    confidence: weightedDemand,
    weightedDemand,
    demandRoot: root('deposit-policy-demand', {
      optionId: option.optionId,
      confidence: weightedDemand,
      settledDemand: settled,
      depositorySignalRoots: option.demandAlignment.depositorySignalRoots,
      readingSignalRoots: option.demandAlignment.readingSignalRoots,
      existingDepositorySignalRoots: option.demandAlignment.existingDepositorySignalRoots,
    }),
  };
}

function roiFor(input: {
  option: DepositAssetPackOption;
  demand: ReturnType<typeof demandFor>;
  criticality: ReturnType<typeof sourceCriticalityFor>;
  developmentCostSats: number;
  expectedSettlementSats: number;
}) {
  const measurementVolume = optionMeasurementVolume(input.option);
  const kindMultiplier =
    input.option.kind === 'capability-slice'
      ? 1
      : input.option.kind === 'implementation-pattern'
        ? 0.92
        : 0.84;
  const criticalityDiscount = input.criticality.state === 'sub-critical'
    ? 1
    : input.criticality.state === 'review-warning'
      ? 0.76
      : 0;
  // Demand honesty: when settled demand is unestimatable, do not invent a demand
  // percentage — but still rank ROI from measurement volume × provisional
  // settlement so reviewable options are not all forced to negative ROI (full-stack
  // incompleteness: option roots > 0 with positive ROI options stuck at 0).
  const demandUnestimatable = input.demand.state === 'unestimatable-demand';
  const demandWeight = demandUnestimatable
    ? Math.max(0.45, measurementVolume)
    : input.demand.weightedDemand;
  const settlementBase = demandUnestimatable
    ? Math.max(
        input.expectedSettlementSats,
        Math.round(input.developmentCostSats * 1.55 + 900),
      )
    : input.expectedSettlementSats;
  const estimatedGrossSats = Math.round(
    settlementBase * demandWeight * (0.62 + measurementVolume * 0.38) * kindMultiplier * criticalityDiscount,
  );
  const expectedNetSats = estimatedGrossSats - input.developmentCostSats;
  const roiMultiple = Number((input.developmentCostSats > 0 ? estimatedGrossSats / input.developmentCostSats : 0).toFixed(2));
  const state: DepositOptionRoiState = input.criticality.state === 'blocked-critical-source'
    ? 'blocked-criticality'
    : expectedNetSats < 0
      ? 'negative-expected-value'
      : roiMultiple < 1.25
        ? 'marginal-expected-value'
        : 'positive-expected-value';
  const roiRoot = root('deposit-policy-roi', {
    optionId: input.option.optionId,
    state,
    estimatedGrossSats,
    estimatedDevelopmentCostSats: input.developmentCostSats,
    expectedNetSats,
    roiMultiple,
    demandUnestimatable,
  });

  return {
    state,
    estimatedGrossSats,
    estimatedDevelopmentCostSats: input.developmentCostSats,
    expectedNetSats,
    roiMultiple,
    roiRoot,
  };
}

function btdPotentialFor(input: {
  option: DepositAssetPackOption;
  demand: ReturnType<typeof demandFor>;
  roi: ReturnType<typeof roiFor>;
  criticality: ReturnType<typeof sourceCriticalityFor>;
}) {
  const estimatedKnowledgeVolume = Number((optionMeasurementVolume(input.option) * input.demand.weightedDemand).toFixed(4));
  const estimatedBtdCells = Math.max(0, Math.round(estimatedKnowledgeVolume * 1000));
  const state: DepositOptionBtdPotentialState = input.criticality.state === 'blocked-critical-source' || input.roi.state === 'negative-expected-value'
    ? 'blocked-until-policy-repair'
    : estimatedKnowledgeVolume >= 0.64
      ? 'high-potential'
      : estimatedKnowledgeVolume >= 0.42
        ? 'moderate-potential'
        : 'low-potential';
  const btdPotentialRoot = root('deposit-policy-btd-potential', {
    optionId: input.option.optionId,
    state,
    estimatedKnowledgeVolume,
    estimatedBtdCells,
  });

  return {
    state,
    estimatedKnowledgeVolume,
    estimatedBtdCells,
    estimateOnly: true as const,
    btdMintBoundary: 'not-minted-until-future-need-fit-settlement' as const,
    rightsBoundary: 'depositor-retains-rights-until-paid-reader-settlement-transfer' as const,
    btdPotentialRoot,
  };
}

function compensationFor(input: {
  option: DepositAssetPackOption;
  criticality: ReturnType<typeof sourceCriticalityFor>;
  roi: ReturnType<typeof roiFor>;
  depositorWalletId: string | null;
  demandUnestimatable?: boolean;
}) {
  const blockers = [
    ...input.criticality.blockers,
    ...(input.roi.state === 'negative-expected-value' ? ['negative_expected_value'] : []),
    ...(input.roi.state === 'blocked-criticality' ? ['criticality_blocks_compensation'] : []),
    ...(!input.depositorWalletId ? ['depositor_wallet_missing'] : []),
    ...(input.option.reviewBoundary.state !== 'reviewable-source-safe-option' ? ['option_not_reviewable'] : []),
    // Demand unestimatable is honesty for earnings display — not a hard admission
    // block (warn only). Settlement compensation remains estimate-labeled.
  ];
  const warnings = [
    ...input.criticality.warnings,
    ...(input.roi.state === 'marginal-expected-value' ? ['marginal_expected_value'] : []),
    ...(input.demandUnestimatable
      ? ['demand_unestimatable_from_settled_depository']
      : []),
  ];
  const eligibleIfApprovedAndSelected = blockers.length === 0;
  const state: DepositOptionCompensationState = eligibleIfApprovedAndSelected
    ? 'eligible-if-approved-and-selected'
    : input.criticality.state === 'blocked-critical-source' ||
        input.roi.state === 'negative-expected-value'
      ? 'blocked-before-compensation'
      : 'repair-required-before-compensation';
  const compensationRoute = {
    optionId: input.option.optionId,
    state,
    payer: 'future-reader-after-settlement',
    payee: 'depositing-wallet',
    priceAsset: 'BTC',
    allocationMethod: 'source-to-shares-largest-remainder',
    depositorShareBasisPoints: 8000,
    protocolTreasuryBasisPoints: 2000,
    sourceToSharesProofState: 'not-created-until-accepted-need-fit-and-settlement',
    depositorWalletRoot: input.depositorWalletId ? root('deposit-policy-wallet', input.depositorWalletId) : null,
    blockers,
    warnings,
  };

  return {
    state,
    payer: 'future-reader-after-settlement' as const,
    payee: 'depositing-wallet' as const,
    priceAsset: 'BTC' as const,
    allocationMethod: 'source-to-shares-largest-remainder' as const,
    depositorShareBasisPoints: 8000,
    protocolTreasuryBasisPoints: 2000,
    sourceToSharesProofState: 'not-created-until-accepted-need-fit-and-settlement' as const,
    eligibleIfApprovedAndSelected,
    blockers: [...new Set(blockers)].sort(),
    warnings: [...new Set(warnings)].sort(),
    compensationRouteRoot: root('deposit-policy-compensation-route', compensationRoute),
  };
}

function policyDecisionFor(input: {
  criticality: ReturnType<typeof sourceCriticalityFor>;
  roi: ReturnType<typeof roiFor>;
  compensation: ReturnType<typeof compensationFor>;
}): DepositAssetPackOptionPolicyEvaluation['policyDecision'] {
  if (
    input.criticality.state === 'blocked-critical-source' ||
    input.roi.state === 'negative-expected-value' ||
    input.roi.state === 'blocked-criticality' ||
    input.compensation.state === 'blocked-before-compensation'
  ) {
    return 'blocked-before-admission';
  }
  // Demand-unestimatable is honesty for earnings, not a demotion of measured
  // options out of reviewable-positive-roi (full-stack completeness).
  const materialWarnings = input.compensation.warnings.filter(
    (warning) => warning !== 'demand_unestimatable_from_settled_depository',
  );
  if (
    input.criticality.state === 'review-warning' ||
    input.roi.state === 'marginal-expected-value' ||
    materialWarnings.length
  ) {
    return 'review-warning-before-admission';
  }
  return 'reviewable-positive-roi';
}

export function buildDepositAssetPackOptionPolicyReport(
  input: DepositAssetPackOptionPolicyInput,
): DepositAssetPackOptionPolicyReport {
  const createdAt = normalizedText(input.createdAt) || 'deterministic';
  const sourceCriticalitySignals = normalizedCriticalitySignals(input.sourceCriticalitySignals);
  const demandSignalWeight =
    input.synthesis.options.reduce((sum, option) => sum + option.demandAlignment.confidence, 0) +
    sumSignalWeights(input.synthesis.options.flatMap((option) => option.measurements.map((measurement) => ({
      id: measurement.id,
      label: measurement.label,
      weight: measurement.volume * measurement.weight,
    }))));
  const developmentCostSats = positiveInteger(
    input.developmentCostSats,
    Math.max(1200, Math.round(850 + input.synthesis.optionCount * 275 + input.synthesis.request.sourcePathRoots.length * 180)),
  );
  const expectedSettlementSats = positiveInteger(
    input.expectedSettlementSats,
    Math.max(2500, Math.round(2800 + demandSignalWeight * 450 + input.synthesis.request.sourcePathRoots.length * 220)),
  );
  const depositorWalletId = normalizedText(input.depositorWalletId);

  const evaluations = input.synthesis.options.map((option): DepositAssetPackOptionPolicyEvaluation => {
    const sourceCriticality = sourceCriticalityFor({ option, signals: sourceCriticalitySignals });
    const demand = demandFor(option, input.settledDemand);
    const roi = roiFor({
      option,
      demand,
      criticality: sourceCriticality,
      developmentCostSats,
      expectedSettlementSats,
    });
    const btdPotential = btdPotentialFor({ option, demand, roi, criticality: sourceCriticality });
    const compensation = compensationFor({
      option,
      criticality: sourceCriticality,
      roi,
      depositorWalletId,
      demandUnestimatable: demand.state === 'unestimatable-demand',
    });
    const policyDecision = policyDecisionFor({ criticality: sourceCriticality, roi, compensation });
    const admissionBoundary = {
      depositApprovalRequired: true as const,
      admissionAndIndexingOwnedBy: 'future-gate7-deposit-option-review' as const,
      sourceBearingDisclosureBeforeSettlementVisible: false as const,
    };
    const visibility = {
      sourceSafeMetadataOnly: true as const,
      protectedSourceVisible: false as const,
      rawSourceTextVisible: false as const,
      unpaidAssetPackSourceVisible: false as const,
      rawPromptVisible: false as const,
      interpolatedPromptVisible: false as const,
      rawProviderResponseVisible: false as const,
      walletPrivateMaterialVisible: false as const,
      settlementPrivatePayloadVisible: false as const,
    };
    const policyEvaluationRoot = root('deposit-policy-evaluation', {
      optionId: option.optionId,
      policyDecision,
      sourceCriticality,
      demand,
      roi,
      btdPotential,
      compensation,
      admissionBoundary,
      visibility,
    });

    return {
      schema: 'bitcode.deposit.asset-pack-option-policy-evaluation',
      optionId: option.optionId,
      optionKind: option.kind,
      title: option.title,
      policyDecision,
      sourceCriticality,
      demand,
      roi,
      btdPotential,
      compensation,
      admissionBoundary,
      visibility,
      roots: {
        policyEvaluationRoot,
        sourceCriticalityRoot: root('deposit-policy-criticality', sourceCriticality),
        demandRoot: demand.demandRoot,
        roiRoot: roi.roiRoot,
        btdPotentialRoot: btdPotential.btdPotentialRoot,
        compensationRouteRoot: compensation.compensationRouteRoot,
      },
    };
  });
  const aggregatePolicy = {
    criticalityPolicy: 'source-safe-criticality-signals-with-depositor-review' as const,
    demandPolicy: 'weighted-depository-reading-and-existing-supply-signals' as const,
    roiPolicy: 'deterministic-estimated-gross-minus-development-cost' as const,
    compensationPolicy: 'future-reader-btc-source-to-shares-route-preview' as const,
    admissionAndIndexingOwnedBy: 'future-gate7-deposit-option-review' as const,
  };
  const evaluationRoots = evaluations.map((evaluation) => evaluation.roots.policyEvaluationRoot);
  const aggregatePolicyRoot = root('deposit-policy-aggregate', aggregatePolicy);
  const policyReportRoot = root('deposit-policy-report', {
    synthesisRequestId: input.synthesis.requestId,
    evaluationRoots,
    aggregatePolicyRoot,
    createdAt,
  });

  return {
    schema: 'bitcode.deposit.asset-pack-option-policy-report',
    policy: 'DepositAssetPackOptionPolicy',
    reportId: policyReportRoot,
    createdAt,
    route: '/deposits',
    synthesisRequestId: input.synthesis.requestId,
    optionCount: evaluations.length,
    reviewablePositiveRoiCount: evaluations.filter((evaluation) => evaluation.policyDecision === 'reviewable-positive-roi').length,
    warningCount: evaluations.filter((evaluation) => evaluation.policyDecision === 'review-warning-before-admission').length,
    blockedCount: evaluations.filter((evaluation) => evaluation.policyDecision === 'blocked-before-admission').length,
    evaluations,
    aggregatePolicy,
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
      policyReportRoot,
      synthesisRoot: input.synthesis.roots.synthesisRoot,
      evaluationRoots,
      aggregatePolicyRoot,
    },
  };
}

export function assertDepositAssetPackOptionPolicyReportSourceSafe(
  report: DepositAssetPackOptionPolicyReport,
) {
  const serialized = stableStringify(report);
  const noForbiddenMarkers = FORBIDDEN_SOURCE_MARKERS.every((marker) => !serialized.includes(marker));
  const sourceSafe =
    report.schema === 'bitcode.deposit.asset-pack-option-policy-report' &&
    report.policy === 'DepositAssetPackOptionPolicy' &&
    report.route === '/deposits' &&
    report.aggregatePolicy.admissionAndIndexingOwnedBy === 'future-gate7-deposit-option-review' &&
    report.sourceSafety.sourceSafeMetadataOnly === true &&
    report.sourceSafety.protectedSourceVisible === false &&
    report.sourceSafety.rawSourceTextVisible === false &&
    report.sourceSafety.unpaidAssetPackSourceVisible === false &&
    report.sourceSafety.rawPromptVisible === false &&
    report.sourceSafety.interpolatedPromptVisible === false &&
    report.sourceSafety.rawProviderResponseVisible === false &&
    report.sourceSafety.walletPrivateMaterialVisible === false &&
    report.sourceSafety.settlementPrivatePayloadVisible === false &&
    report.evaluations.every(
      (evaluation) =>
        evaluation.admissionBoundary.admissionAndIndexingOwnedBy === 'future-gate7-deposit-option-review' &&
        evaluation.admissionBoundary.sourceBearingDisclosureBeforeSettlementVisible === false &&
        evaluation.btdPotential.estimateOnly === true &&
        evaluation.btdPotential.btdMintBoundary === 'not-minted-until-future-need-fit-settlement' &&
        evaluation.compensation.priceAsset === 'BTC' &&
        evaluation.compensation.sourceToSharesProofState === 'not-created-until-accepted-need-fit-and-settlement' &&
        evaluation.visibility.sourceSafeMetadataOnly === true &&
        evaluation.visibility.protectedSourceVisible === false &&
        evaluation.visibility.rawSourceTextVisible === false &&
        evaluation.visibility.unpaidAssetPackSourceVisible === false &&
        evaluation.visibility.walletPrivateMaterialVisible === false,
    ) &&
    noForbiddenMarkers;

  return {
    admitted: sourceSafe,
    reason: sourceSafe ? 'source_safe_deposit_asset_pack_option_policy' : 'deposit_option_policy_source_safety_boundary_violation',
  };
}
