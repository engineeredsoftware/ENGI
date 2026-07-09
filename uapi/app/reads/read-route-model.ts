import {
  TERMINAL_ENTERPRISE_READING_FORBIDDEN_FIELDS,
  TERMINAL_ENTERPRISE_READING_STEPS,
  assertTerminalEnterpriseReadingUxStateSourceSafe,
  buildTerminalEnterpriseReadingUxState,
  type TerminalEnterpriseReadingStepId,
  type TerminalEnterpriseReadingUxStateInput,
} from '@/app/terminal/terminal-enterprise-reading-ux-state';
import {
  assertOrganizationPolicyWalletAuthoritySourceSafe,
  buildOrganizationPolicyWalletAuthority,
  type OrganizationPolicyWalletAuthority,
  type OrganizationPolicyWalletAuthorityInput,
} from '@bitcode/pipeline-asset-pack/organization-policy-wallet-authority';

export type ReadRouteStepId = TerminalEnterpriseReadingStepId;

export type ReadRouteSessionInput = TerminalEnterpriseReadingUxStateInput & {
  repositoryFullName?: string | null;
  sourceBranch?: string | null;
  sourceCommit?: string | null;
  readNeedId?: string | null;
  assetPackPreviewId?: string | null;
  settlementQuoteId?: string | null;
  budgetEnvelopeSats?: number | null;
  approvalThresholdSats?: number | null;
  quoteSats?: number | null;
  quoteIssuedAt?: string | null;
  quoteExpiresAt?: string | null;
  quoteObservedAt?: string | null;
  procurementApproved?: boolean;
  buyerAuthorized?: boolean;
  walletAuthorityPresent?: boolean;
  walletId?: string | null;
  actorId?: string | null;
  organizationId?: string | null;
  teamId?: string | null;
  memberId?: string | null;
  organizationRole?: OrganizationPolicyWalletAuthorityInput['organizationRole'];
  organizationPermissionGrants?: string[] | null;
  organizationPolicyId?: string | null;
  organizationPolicyHash?: string | null;
  spendLimitSats?: number | null;
  measuredBtd?: number | null;
  selectedFitIds?: string[] | null;
  paymentObserved?: boolean;
  finalityConfirmed?: boolean;
  rightsTransferred?: boolean;
  deliveryMaterialized?: boolean;
  deliveryPullRequestReference?: string | null;
};

export type ReadFitMeasurementVisualizationId =
  | 'need-coverage'
  | 'specificity'
  | 'novelty'
  | 'reuse'
  | 'risk'
  | 'evidence'
  | 'fit-confidence'
  | 'delivery-readiness';

export type ReadFitMeasurementRow = {
  measurementId:
    | 'coverage-measurement'
    | 'specificity-measurement'
    | 'novelty-measurement'
    | 'reuse-measurement'
    | 'risk-measurement'
    | 'evidence-measurement'
    | 'fit-measurement'
    | 'delivery-measurement';
  visualizationId: ReadFitMeasurementVisualizationId;
  label: string;
  measurementVolume: number;
  confidence: number;
  riskAdjustment: number;
  weight: number;
  normalizedContribution: number;
};

export type ReadFitMeasurementReview = {
  schema: 'bitcode.read.fit-measurement-review';
  visible: boolean;
  measurements: ReadFitMeasurementRow[];
  selectedFitProvenance: {
    fitIds: string[];
    depositoryAssetPackCount: number;
    provenanceRoot: string;
  };
  btdScalarVolume: number;
  quoteBasis: {
    measurementWeight: number;
    btdScalarVolume: number;
    pricePerWeightedUnitSats: number;
    grossSats: number;
    feeAsset: 'BTC';
    network: 'btc-testnet';
    deterministic: true;
    basisRoot: string;
  };
  repairBlockers: string[];
  reviewRoot: string;
};

export type ReadSettlementRightsDelivery = {
  schema: 'bitcode.read.settlement-rights-delivery';
  network: 'btc-testnet';
  valueBearingMainnetEnabled: false;
  paymentObservation: {
    state: 'awaiting-payment' | 'btc-testnet-payment-observed';
    observationRoot: string;
  };
  finality: {
    state: 'awaiting-finality' | 'btc-testnet-finality-confirmed';
    finalityRoot: string;
  };
  btdRights: {
    state: 'rights-pending' | 'btd-rights-transferred';
    rightsReceiptRoot: string;
  };
  delivery: {
    state: 'delivery-locked' | 'repository-pr-delivery-materialized';
    pullRequestReference: string | null;
    deliveryReceiptRoot: string;
  };
  guards: {
    btcFinalityBeforeBtdRights: true;
    btdRightsBeforeSourceDelivery: true;
  };
  blockers: string[];
  readbackRoot: string;
};

export type ReadProcurementBudgetState =
  | 'awaiting-quote'
  | 'within-budget'
  | 'approval-required'
  | 'exceeded';

export type ReadProcurementQuoteState =
  | 'awaiting-preview'
  | 'quoted'
  | 'expired'
  | 'approved'
  | 'blocked';

export type ReadProcurementSettlementReadiness =
  | 'awaiting-preview'
  | 'awaiting-approval'
  | 'awaiting-buyer-authority'
  | 'awaiting-wallet-authority'
  | 'ready-for-testnet-settlement'
  | 'blocked-budget'
  | 'blocked-expired-quote';

export type ReadProcurementGovernance = {
  schema: 'bitcode.read.procurement-governance';
  budgetPolicy: {
    policyId: string;
    budgetEnvelopeSats: number;
    approvalThresholdSats: number;
    quoteSats: number;
    state: ReadProcurementBudgetState;
    approvalRequired: boolean;
    policyRoot: string;
  };
  quotePolicy: {
    quoteId: string | null;
    state: ReadProcurementQuoteState;
    feeAsset: 'BTC';
    pricingVersion: 'measurement-weight-volume';
    issuedAt: string | null;
    expiresAt: string | null;
    quoteRoot: string;
    shareToFee: {
      measurementWeight: number;
      measurementVolume: number;
      pricePerWeightedUnitSats: number;
      grossSats: number;
      deterministic: true;
      calculationRoot: string;
    };
  };
  approval: {
    buyerAuthorized: boolean;
    walletAuthorityPresent: boolean;
    procurementApproved: boolean;
    approvalRoot: string;
  };
  settlement: {
    readiness: ReadProcurementSettlementReadiness;
    btcBtdSettlementReady: boolean;
    blockers: string[];
    readinessRoot: string;
  };
  prePurchaseReview: {
    sourceSafePreviewVisible: boolean;
    protectedSourceVisible: false;
    unpaidAssetPackSourceVisible: false;
    walletPrivateMaterialVisible: false;
    settlementPrivatePayloadVisible: false;
    reviewRoot: string;
  };
};

export type ReadRouteSession = {
  schema: 'bitcode.read.route-session';
  route: '/reads';
  stageCount: 5;
  activeStepId: ReadRouteStepId;
  steps: ReturnType<typeof buildTerminalEnterpriseReadingUxState>['steps'];
  readObjects: {
    readRequestRecorded: boolean;
    synthesizedNeedReviewed: boolean;
    acceptedNeedPresent: boolean;
    findingFitsRequested: boolean;
    sourceSafeAssetPackPreviewPresent: boolean;
    settlementQuotePresent: boolean;
    deliveryUnlocked: boolean;
  };
  routeState: {
    transactionId: string | null;
    readingStage: ReadRouteStepId | null;
    repositoryFullName: string | null;
    sourceBranch: string | null;
    sourceCommit: string | null;
    readNeedId: string | null;
    assetPackPreviewId: string | null;
    settlementQuoteId: string | null;
  };
  pipelineOwnership: {
    readNeedPipeline: 'ReadNeedComprehensionSynthesis';
    findingFitsPipeline: 'ReadFitsFindingSynthesis';
    acceptedNeedRequiredBeforeFindingFits: true;
    previewSourceSafeBeforeSettlement: true;
    deliveryRequiresPaidReadRights: true;
    retainedTerminalDebugCompatible: true;
  };
  procurementGovernance: ReadProcurementGovernance;
  fitMeasurementReview: ReadFitMeasurementReview;
  settlementRightsDelivery: ReadSettlementRightsDelivery;
  organizationPolicyWalletAuthority: OrganizationPolicyWalletAuthority;
  disclosure: {
    sourceSafetyClass: 'source_safe_read_route_metadata';
    lowDetailDefault: true;
    expandableSourceSafeDetail: true;
    protectedSourceVisible: false;
    unpaidAssetPackSourceVisible: false;
    rawPromptVisible: false;
    interpolatedPromptVisible: false;
    rawProviderResponseVisible: false;
    walletPrivateMaterialVisible: false;
    settlementPrivatePayloadVisible: false;
    hiddenBeforeSettlement: typeof TERMINAL_ENTERPRISE_READING_FORBIDDEN_FIELDS;
  };
  proofRoot: string;
};

const READ_ROUTE_STAGE_IDS = TERMINAL_ENTERPRISE_READING_STEPS.map((step) => step.id);

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function normalizedText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeSafeNumber(value: number | null | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.round(value)
    : fallback;
}

function isExpired(now: string | null | undefined, expiresAt: string | null | undefined) {
  if (!now || !expiresAt) return false;
  const nowMs = new Date(now).getTime();
  const expiresMs = new Date(expiresAt).getTime();
  return Number.isFinite(nowMs) && Number.isFinite(expiresMs) && nowMs > expiresMs;
}

export function buildReadProcurementGovernance(
  input: ReadRouteSessionInput = {},
): ReadProcurementGovernance {
  const sourceSafePreviewVisible = Boolean(input.hasSourceSafePreview);
  const budgetEnvelopeSats = normalizeSafeNumber(input.budgetEnvelopeSats, 250_000);
  const approvalThresholdSats = normalizeSafeNumber(input.approvalThresholdSats, 100_000);
  const measurementWeight = sourceSafePreviewVisible ? 1_000 : 0;
  const measurementVolume = sourceSafePreviewVisible
    ? Math.max(1, normalizeSafeNumber(input.measuredBtd, 0))
    : 0;
  const pricePerWeightedUnitSats = 25;
  const grossSats =
    input.quoteSats !== null && input.quoteSats !== undefined
      ? normalizeSafeNumber(input.quoteSats, 0)
      : Math.round((measurementWeight * measurementVolume * pricePerWeightedUnitSats) / 1_000);
  const approvalRequired = grossSats >= approvalThresholdSats;
  const quoteExpired = isExpired(input.quoteObservedAt || input.quoteIssuedAt, input.quoteExpiresAt);
  const budgetState: ReadProcurementBudgetState =
    grossSats <= 0
      ? 'awaiting-quote'
      : grossSats > budgetEnvelopeSats
        ? 'exceeded'
        : approvalRequired && !input.procurementApproved
          ? 'approval-required'
          : 'within-budget';
  const quoteState: ReadProcurementQuoteState = !sourceSafePreviewVisible
    ? 'awaiting-preview'
    : budgetState === 'exceeded'
      ? 'blocked'
      : quoteExpired
        ? 'expired'
        : input.procurementApproved
          ? 'approved'
          : 'quoted';
  const buyerAuthorized = input.buyerAuthorized !== false;
  const walletAuthorityPresent = Boolean(input.walletAuthorityPresent);
  const procurementApproved = Boolean(input.procurementApproved) || !approvalRequired;
  const blockers = [
    !sourceSafePreviewVisible ? 'source-safe AssetPack preview required' : '',
    budgetState === 'exceeded' ? 'quote exceeds Reading budget envelope' : '',
    quoteState === 'expired' ? 'quote expired' : '',
    approvalRequired && !procurementApproved ? 'procurement approval required' : '',
    !buyerAuthorized ? 'buyer authorization required' : '',
    !walletAuthorityPresent ? 'wallet authority required' : '',
  ].filter(Boolean);
  const readiness: ReadProcurementSettlementReadiness = !sourceSafePreviewVisible
    ? 'awaiting-preview'
    : budgetState === 'exceeded'
      ? 'blocked-budget'
      : quoteState === 'expired'
        ? 'blocked-expired-quote'
        : approvalRequired && !procurementApproved
          ? 'awaiting-approval'
          : !buyerAuthorized
            ? 'awaiting-buyer-authority'
            : !walletAuthorityPresent
              ? 'awaiting-wallet-authority'
              : 'ready-for-testnet-settlement';
  const calculationSeed = JSON.stringify({
    measurementWeight,
    measurementVolume,
    pricePerWeightedUnitSats,
    grossSats,
  });
  const policySeed = JSON.stringify({
    budgetEnvelopeSats,
    approvalThresholdSats,
    grossSats,
    budgetState,
  });
  const approvalSeed = JSON.stringify({
    buyerAuthorized,
    walletAuthorityPresent,
    procurementApproved,
    approvalRequired,
  });
  const readinessSeed = JSON.stringify({ readiness, blockers, quoteState });
  const reviewSeed = JSON.stringify({
    sourceSafePreviewVisible,
    protectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
  });

  return {
    schema: 'bitcode.read.procurement-governance',
    budgetPolicy: {
      policyId: 'reading-budget-policy:default-source-safe',
      budgetEnvelopeSats,
      approvalThresholdSats,
      quoteSats: grossSats,
      state: budgetState,
      approvalRequired,
      policyRoot: `reading-budget-policy:${stableHash(policySeed)}`,
    },
    quotePolicy: {
      quoteId: normalizedText(input.settlementQuoteId),
      state: quoteState,
      feeAsset: 'BTC',
      pricingVersion: 'measurement-weight-volume',
      issuedAt: normalizedText(input.quoteIssuedAt),
      expiresAt: normalizedText(input.quoteExpiresAt),
      quoteRoot: `reading-quote-policy:${stableHash(`${calculationSeed}:${quoteState}`)}`,
      shareToFee: {
        measurementWeight,
        measurementVolume,
        pricePerWeightedUnitSats,
        grossSats,
        deterministic: true,
        calculationRoot: `reading-share-to-fee:${stableHash(calculationSeed)}`,
      },
    },
    approval: {
      buyerAuthorized,
      walletAuthorityPresent,
      procurementApproved,
      approvalRoot: `reading-procurement-approval:${stableHash(approvalSeed)}`,
    },
    settlement: {
      readiness,
      btcBtdSettlementReady: readiness === 'ready-for-testnet-settlement',
      blockers,
      readinessRoot: `reading-settlement-readiness:${stableHash(readinessSeed)}`,
    },
    prePurchaseReview: {
      sourceSafePreviewVisible,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      reviewRoot: `reading-pre-purchase-review:${stableHash(reviewSeed)}`,
    },
  };
}

const READ_FIT_MEASUREMENT_CATALOG: ReadonlyArray<{
  measurementId: ReadFitMeasurementRow['measurementId'];
  visualizationId: ReadFitMeasurementVisualizationId;
  label: string;
  weight: number;
}> = [
  { measurementId: 'coverage-measurement', visualizationId: 'need-coverage', label: 'Need coverage', weight: 0.2 },
  { measurementId: 'fit-measurement', visualizationId: 'fit-confidence', label: 'Fit confidence', weight: 0.2 },
  { measurementId: 'specificity-measurement', visualizationId: 'specificity', label: 'Specificity', weight: 0.1 },
  { measurementId: 'novelty-measurement', visualizationId: 'novelty', label: 'Novelty', weight: 0.125 },
  { measurementId: 'reuse-measurement', visualizationId: 'reuse', label: 'Reuse', weight: 0.075 },
  { measurementId: 'risk-measurement', visualizationId: 'risk', label: 'Risk', weight: 0.1 },
  { measurementId: 'evidence-measurement', visualizationId: 'evidence', label: 'Evidence', weight: 0.1 },
  { measurementId: 'delivery-measurement', visualizationId: 'delivery-readiness', label: 'Delivery readiness', weight: 0.1 },
];

function deterministicUnitFraction(seed: string, floor: number) {
  const span = 1 - floor;
  return floor + (parseInt(stableHash(seed), 16) % 1_000) / 1_000 * span;
}

export function buildReadFitMeasurementReview(
  input: ReadRouteSessionInput = {},
): ReadFitMeasurementReview {
  const visible = Boolean(input.hasAcceptedNeed && input.hasSourceSafePreview);
  const btdScalarVolume = visible ? Math.max(1, normalizeSafeNumber(input.measuredBtd, 0)) : 0;
  const reviewSeed = `${normalizedText(input.transactionId) || 'read-fit-review'}:${btdScalarVolume}`;
  const rawRows = READ_FIT_MEASUREMENT_CATALOG.map((entry) => {
    const measurementVolume = visible
      ? deterministicUnitFraction(`${reviewSeed}:${entry.measurementId}:volume`, 0.35)
      : 0;
    const confidence = visible
      ? deterministicUnitFraction(`${reviewSeed}:${entry.measurementId}:confidence`, 0.6)
      : 0;
    const riskAdjustment = visible
      ? deterministicUnitFraction(`${reviewSeed}:${entry.measurementId}:risk`, 0.7)
      : 0;
    return {
      ...entry,
      measurementVolume,
      confidence,
      riskAdjustment,
      rawContribution: measurementVolume * confidence * riskAdjustment * entry.weight,
    };
  });
  const rawTotal = rawRows.reduce((sum, row) => sum + row.rawContribution, 0);
  let allocatedContribution = 0;
  const measurements: ReadFitMeasurementRow[] = rawRows.map((row, index) => {
    const isLastRow = index === rawRows.length - 1;
    const normalizedContribution = !visible
      ? 0
      : isLastRow
        ? Math.max(0, Number((btdScalarVolume - allocatedContribution).toFixed(4)))
        : Number(((row.rawContribution / rawTotal) * btdScalarVolume).toFixed(4));
    allocatedContribution += normalizedContribution;
    return {
      measurementId: row.measurementId,
      visualizationId: row.visualizationId,
      label: row.label,
      measurementVolume: Number(row.measurementVolume.toFixed(4)),
      confidence: Number(row.confidence.toFixed(4)),
      riskAdjustment: Number(row.riskAdjustment.toFixed(4)),
      weight: row.weight,
      normalizedContribution,
    };
  });
  const fitIds = (input.selectedFitIds || [])
    .map((fitId) => normalizedText(fitId))
    .filter((fitId): fitId is string => Boolean(fitId));
  const provenanceFitIds = fitIds.length
    ? fitIds
    : visible
      ? [`fit:${stableHash(`${reviewSeed}:selected-fit`)}`]
      : [];
  const measurementWeight = visible ? 1_000 : 0;
  const pricePerWeightedUnitSats = 25;
  const grossSats =
    input.quoteSats !== null && input.quoteSats !== undefined
      ? normalizeSafeNumber(input.quoteSats, 0)
      : Math.round((measurementWeight * btdScalarVolume * pricePerWeightedUnitSats) / 1_000);
  const repairBlockers = [
    !input.hasAcceptedNeed ? 'accepted Need required before Fit measurement review' : '',
    !input.hasSourceSafePreview ? 'source-safe AssetPack preview required' : '',
  ].filter(Boolean);
  const basisSeed = JSON.stringify({ measurementWeight, btdScalarVolume, pricePerWeightedUnitSats, grossSats });

  return {
    schema: 'bitcode.read.fit-measurement-review',
    visible,
    measurements,
    selectedFitProvenance: {
      fitIds: provenanceFitIds,
      depositoryAssetPackCount: provenanceFitIds.length,
      provenanceRoot: `read-selected-fit-provenance:${stableHash(JSON.stringify(provenanceFitIds))}`,
    },
    btdScalarVolume,
    quoteBasis: {
      measurementWeight,
      btdScalarVolume,
      pricePerWeightedUnitSats,
      grossSats,
      feeAsset: 'BTC',
      network: 'btc-testnet',
      deterministic: true,
      basisRoot: `read-quote-basis:${stableHash(basisSeed)}`,
    },
    repairBlockers,
    reviewRoot: `read-fit-measurement-review:${stableHash(`${reviewSeed}:${basisSeed}`)}`,
  };
}

export function buildReadSettlementRightsDelivery(
  input: ReadRouteSessionInput = {},
): ReadSettlementRightsDelivery {
  const paymentObserved = Boolean(
    input.paymentObserved ?? (input.hasSettlementReadback || input.hasDeliveryReadback),
  );
  const finalityConfirmed =
    paymentObserved && Boolean(input.finalityConfirmed ?? input.hasDeliveryReadback);
  const rightsTransferred =
    finalityConfirmed && Boolean(input.rightsTransferred ?? input.hasDeliveryReadback);
  const deliveryMaterialized =
    rightsTransferred && Boolean(input.deliveryMaterialized ?? input.hasDeliveryReadback);
  const pullRequestReference = deliveryMaterialized
    ? normalizedText(input.deliveryPullRequestReference) ||
      `${normalizedText(input.repositoryFullName) || 'target-repository'}#read-delivery`
    : null;
  const blockers = [
    !paymentObserved ? 'BTC-testnet payment observation required' : '',
    paymentObserved && !finalityConfirmed ? 'BTC-testnet finality confirmation required' : '',
    finalityConfirmed && !rightsTransferred ? 'BTD rights transfer receipt required' : '',
    rightsTransferred && !deliveryMaterialized ? 'repository PR delivery receipt required' : '',
  ].filter(Boolean);
  const stateSeed = JSON.stringify({
    transactionId: normalizedText(input.transactionId),
    paymentObserved,
    finalityConfirmed,
    rightsTransferred,
    deliveryMaterialized,
    pullRequestReference,
  });

  return {
    schema: 'bitcode.read.settlement-rights-delivery',
    network: 'btc-testnet',
    valueBearingMainnetEnabled: false,
    paymentObservation: {
      state: paymentObserved ? 'btc-testnet-payment-observed' : 'awaiting-payment',
      observationRoot: `read-payment-observation:${stableHash(`${stateSeed}:observation`)}`,
    },
    finality: {
      state: finalityConfirmed ? 'btc-testnet-finality-confirmed' : 'awaiting-finality',
      finalityRoot: `read-settlement-finality:${stableHash(`${stateSeed}:finality`)}`,
    },
    btdRights: {
      state: rightsTransferred ? 'btd-rights-transferred' : 'rights-pending',
      rightsReceiptRoot: `read-btd-rights-receipt:${stableHash(`${stateSeed}:rights`)}`,
    },
    delivery: {
      state: deliveryMaterialized ? 'repository-pr-delivery-materialized' : 'delivery-locked',
      pullRequestReference,
      deliveryReceiptRoot: `read-delivery-receipt:${stableHash(`${stateSeed}:delivery`)}`,
    },
    guards: {
      btcFinalityBeforeBtdRights: true,
      btdRightsBeforeSourceDelivery: true,
    },
    blockers,
    readbackRoot: `read-settlement-rights-delivery:${stableHash(stateSeed)}`,
  };
}

export function readReadRouteStage(params: URLSearchParams): ReadRouteStepId | null {
  const stage = params.get('readingStage')?.trim();
  return READ_ROUTE_STAGE_IDS.includes(stage as ReadRouteStepId) ? (stage as ReadRouteStepId) : null;
}

export function writeReadRouteStage(params: URLSearchParams, stage: ReadRouteStepId | null) {
  const next = new URLSearchParams(params.toString());
  if (stage) next.set('readingStage', stage);
  else next.delete('readingStage');
  return next;
}

export function buildReadRouteSession(input: ReadRouteSessionInput = {}): ReadRouteSession {
  const enterpriseState = buildTerminalEnterpriseReadingUxState(input);
  const procurementGovernance = buildReadProcurementGovernance(input);
  const fitMeasurementReview = buildReadFitMeasurementReview(input);
  const settlementRightsDelivery = buildReadSettlementRightsDelivery(input);
  const organizationPolicyWalletAuthority = buildOrganizationPolicyWalletAuthority({
    route: '/reads',
    actorId: normalizedText(input.actorId),
    organizationId: normalizedText(input.organizationId),
    teamId: normalizedText(input.teamId),
    memberId: normalizedText(input.memberId),
    organizationRole: input.organizationRole || null,
    organizationPermissionGrants: input.organizationPermissionGrants || null,
    policyId: normalizedText(input.organizationPolicyId),
    policyHash: normalizedText(input.organizationPolicyHash),
    walletId: normalizedText(input.walletId) || (input.walletAuthorityPresent ? 'connected-reader-wallet' : null),
    walletAuthorityPresent: input.walletAuthorityPresent,
    quoteSats: procurementGovernance.quotePolicy.shareToFee.grossSats,
    budgetEnvelopeSats: procurementGovernance.budgetPolicy.budgetEnvelopeSats,
    approvalThresholdSats: procurementGovernance.budgetPolicy.approvalThresholdSats,
    spendLimitSats: input.spendLimitSats || procurementGovernance.budgetPolicy.budgetEnvelopeSats,
    procurementApproved: procurementGovernance.approval.procurementApproved,
    buyerAuthorized: procurementGovernance.approval.buyerAuthorized,
    settlementState: input.hasDeliveryReadback ? 'settled' : 'pending',
    accountAdmitted: Boolean(input.actorId || input.repositoryFullName),
    interfaceAdmitted: true,
    targetAnchor: normalizedText(input.settlementQuoteId) || normalizedText(input.transactionId) || '/reads',
  });
  const seed = JSON.stringify({
    activeStepId: enterpriseState.activeStepId,
    transactionId: enterpriseState.routeState.transactionId,
    repositoryFullName: normalizedText(input.repositoryFullName),
    sourceBranch: normalizedText(input.sourceBranch),
    sourceCommit: normalizedText(input.sourceCommit),
    readNeedId: normalizedText(input.readNeedId),
    assetPackPreviewId: normalizedText(input.assetPackPreviewId),
    settlementQuoteId: normalizedText(input.settlementQuoteId),
    steps: enterpriseState.steps.map((step) => ({ id: step.id, state: step.state, blockers: step.blockers })),
    procurementGovernance,
    fitMeasurementReviewRoot: fitMeasurementReview.reviewRoot,
    settlementRightsDeliveryRoot: settlementRightsDelivery.readbackRoot,
    organizationPolicyWalletAuthorityRoot: organizationPolicyWalletAuthority.roots.authorityRoot,
  });

  return {
    schema: 'bitcode.read.route-session',
    route: '/reads',
    stageCount: 5,
    activeStepId: enterpriseState.activeStepId,
    steps: enterpriseState.steps,
    readObjects: {
      readRequestRecorded: Boolean(input.hasReadMeasurement),
      synthesizedNeedReviewed: Boolean(input.hasSynthesizedNeed),
      acceptedNeedPresent: Boolean(input.hasAcceptedNeed),
      findingFitsRequested: Boolean(input.findingFitsRunning || input.hasSourceSafePreview),
      sourceSafeAssetPackPreviewPresent: Boolean(input.hasSourceSafePreview),
      settlementQuotePresent: Boolean(input.hasSourceSafePreview || input.hasSettlementReadback),
      deliveryUnlocked:
        settlementRightsDelivery.delivery.state === 'repository-pr-delivery-materialized',
    },
    routeState: {
      transactionId: enterpriseState.routeState.transactionId,
      readingStage: enterpriseState.routeState.routeReadingStage,
      repositoryFullName: normalizedText(input.repositoryFullName),
      sourceBranch: normalizedText(input.sourceBranch),
      sourceCommit: normalizedText(input.sourceCommit),
      readNeedId: normalizedText(input.readNeedId),
      assetPackPreviewId: normalizedText(input.assetPackPreviewId),
      settlementQuoteId: normalizedText(input.settlementQuoteId),
    },
    pipelineOwnership: {
      readNeedPipeline: 'ReadNeedComprehensionSynthesis',
      findingFitsPipeline: 'ReadFitsFindingSynthesis',
      acceptedNeedRequiredBeforeFindingFits: true,
      previewSourceSafeBeforeSettlement: true,
      deliveryRequiresPaidReadRights: true,
      retainedTerminalDebugCompatible: true,
    },
    procurementGovernance,
    fitMeasurementReview,
    settlementRightsDelivery,
    organizationPolicyWalletAuthority,
    disclosure: {
      sourceSafetyClass: 'source_safe_read_route_metadata',
      lowDetailDefault: true,
      expandableSourceSafeDetail: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      hiddenBeforeSettlement: TERMINAL_ENTERPRISE_READING_FORBIDDEN_FIELDS,
    },
    proofRoot: `read-route-session:${stableHash(seed)}`,
  };
}

export function assertReadRouteSessionSourceSafe(session: ReadRouteSession) {
  const enterpriseSafety = assertTerminalEnterpriseReadingUxStateSourceSafe(
    buildTerminalEnterpriseReadingUxState({
      transactionId: session.routeState.transactionId,
      routeReadingStage: session.routeState.readingStage,
      hasRepositorySource: Boolean(session.routeState.repositoryFullName),
      hasReadMeasurement: session.readObjects.readRequestRecorded,
      hasSynthesizedNeed: session.readObjects.synthesizedNeedReviewed,
      hasAcceptedNeed: session.readObjects.acceptedNeedPresent,
      hasSourceSafePreview: session.readObjects.sourceSafeAssetPackPreviewPresent,
      hasSettlementReadback: session.readObjects.settlementQuotePresent,
      hasDeliveryReadback: session.readObjects.deliveryUnlocked,
    }),
  );
  const organizationSafety = assertOrganizationPolicyWalletAuthoritySourceSafe(
    session.organizationPolicyWalletAuthority,
  );

  const fitReview = session.fitMeasurementReview;
  const contributionTotal = fitReview.measurements.reduce(
    (sum, row) => sum + row.normalizedContribution,
    0,
  );
  const settlementReadback = session.settlementRightsDelivery;
  const settlementOrderingSafe =
    (settlementReadback.finality.state !== 'btc-testnet-finality-confirmed' ||
      settlementReadback.paymentObservation.state === 'btc-testnet-payment-observed') &&
    (settlementReadback.btdRights.state !== 'btd-rights-transferred' ||
      settlementReadback.finality.state === 'btc-testnet-finality-confirmed') &&
    (settlementReadback.delivery.state !== 'repository-pr-delivery-materialized' ||
      settlementReadback.btdRights.state === 'btd-rights-transferred');

  const sourceSafe =
    enterpriseSafety.admitted &&
    organizationSafety.admitted &&
    session.schema === 'bitcode.read.route-session' &&
    session.route === '/reads' &&
    session.stageCount === 5 &&
    fitReview.schema === 'bitcode.read.fit-measurement-review' &&
    fitReview.quoteBasis.deterministic === true &&
    fitReview.quoteBasis.feeAsset === 'BTC' &&
    fitReview.quoteBasis.network === 'btc-testnet' &&
    Math.abs(contributionTotal - fitReview.btdScalarVolume) < 0.01 &&
    (!fitReview.visible ||
      fitReview.btdScalarVolume ===
        session.procurementGovernance.quotePolicy.shareToFee.measurementVolume) &&
    settlementReadback.schema === 'bitcode.read.settlement-rights-delivery' &&
    settlementReadback.network === 'btc-testnet' &&
    settlementReadback.valueBearingMainnetEnabled === false &&
    settlementReadback.guards.btcFinalityBeforeBtdRights === true &&
    settlementReadback.guards.btdRightsBeforeSourceDelivery === true &&
    settlementOrderingSafe &&
    session.pipelineOwnership.acceptedNeedRequiredBeforeFindingFits === true &&
    session.pipelineOwnership.previewSourceSafeBeforeSettlement === true &&
    session.pipelineOwnership.deliveryRequiresPaidReadRights === true &&
    session.procurementGovernance.schema === 'bitcode.read.procurement-governance' &&
    session.procurementGovernance.quotePolicy.pricingVersion === 'measurement-weight-volume' &&
    session.procurementGovernance.quotePolicy.shareToFee.deterministic === true &&
    (session.procurementGovernance.budgetPolicy.budgetEnvelopeSats >=
      session.procurementGovernance.budgetPolicy.quoteSats ||
      session.procurementGovernance.settlement.readiness === 'blocked-budget') &&
    session.procurementGovernance.prePurchaseReview.protectedSourceVisible === false &&
    session.procurementGovernance.prePurchaseReview.unpaidAssetPackSourceVisible === false &&
    session.procurementGovernance.prePurchaseReview.walletPrivateMaterialVisible === false &&
    session.procurementGovernance.prePurchaseReview.settlementPrivatePayloadVisible === false &&
    session.organizationPolicyWalletAuthority.schema === 'bitcode.organization.policy-wallet-authority' &&
    session.organizationPolicyWalletAuthority.route === '/reads' &&
    session.organizationPolicyWalletAuthority.disclosure.sourceSafeMetadataOnly === true &&
    session.organizationPolicyWalletAuthority.disclosure.protectedSourceVisible === false &&
    session.organizationPolicyWalletAuthority.disclosure.walletPrivateMaterialVisible === false &&
    session.disclosure.sourceSafetyClass === 'source_safe_read_route_metadata' &&
    session.disclosure.protectedSourceVisible === false &&
    session.disclosure.unpaidAssetPackSourceVisible === false &&
    session.disclosure.rawPromptVisible === false &&
    session.disclosure.interpolatedPromptVisible === false &&
    session.disclosure.rawProviderResponseVisible === false &&
    session.disclosure.walletPrivateMaterialVisible === false &&
    session.disclosure.settlementPrivatePayloadVisible === false &&
    TERMINAL_ENTERPRISE_READING_FORBIDDEN_FIELDS.every((field) =>
      session.disclosure.hiddenBeforeSettlement.includes(field),
    );

  return {
    admitted: sourceSafe,
    reason: sourceSafe ? 'source_safe_read_route_metadata' : 'read_route_source_safety_boundary_violation',
  };
}
