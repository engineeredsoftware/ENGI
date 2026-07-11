/**
 * Reads enterprise reading UX state machine (source-safe step views).
 * Relocated from app/terminal/terminal-enterprise-reading-ux-state.
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 */

export type TerminalEnterpriseReadingStepId =
  | 'request-read'
  | 'review-synthesized-need'
  | 'request-fit'
  | 'review-synthesized-asset-pack'
  | 'buy-asset-pack-settle';

export type TerminalEnterpriseReadingStepState = 'complete' | 'current' | 'blocked';

export type TerminalEnterpriseReadingFailureKind =
  | 'none'
  | 'read_request_invalid'
  | 'need_review_required'
  | 'fits_finding_failed'
  | 'asset_pack_preview_blocked'
  | 'settlement_blocked'
  | 'delivery_blocked'
  | 'source_safety_blocked';

export type TerminalEnterpriseReadingSourceSafeField =
  | 'read_request_summary'
  | 'read_need_measurements'
  | 'need_feedback_history'
  | 'depository_candidate_counts'
  | 'selected_fit_ids'
  | 'asset_pack_measurements'
  | 'quality_posture'
  | 'proof_roots'
  | 'btc_fee_quote'
  | 'settlement_state'
  | 'delivery_posture';

export type TerminalEnterpriseReadingForbiddenField =
  | 'protected_source_payload'
  | 'raw_protected_prompt'
  | 'raw_provider_response'
  | 'unpaid_assetpack_source'
  | 'wallet_private_material'
  | 'settlement_private_payload'
  | 'ledger_write_authority';

export type TerminalEnterpriseReadingStepDefinition = {
  id: TerminalEnterpriseReadingStepId;
  ordinal: number;
  label: string;
  lowDetailGuidance: string;
  expandableDetail: string;
  primaryAction: string;
  sourceSafeVisibleFields: TerminalEnterpriseReadingSourceSafeField[];
  forbiddenFields: TerminalEnterpriseReadingForbiddenField[];
};

export type TerminalEnterpriseReadingStepView = TerminalEnterpriseReadingStepDefinition & {
  state: TerminalEnterpriseReadingStepState;
  blockers: string[];
};

export type TerminalEnterpriseReadingUxStateInput = {
  transactionId?: string | null;
  routeReadingStage?: TerminalEnterpriseReadingStepId | null;
  hasRepositorySource?: boolean;
  hasReadMeasurement?: boolean;
  hasSynthesizedNeed?: boolean;
  hasAcceptedNeed?: boolean;
  findingFitsRunning?: boolean;
  hasSourceSafePreview?: boolean;
  hasSettlementReadback?: boolean;
  hasDeliveryReadback?: boolean;
  retryRequested?: boolean;
  restartRequested?: boolean;
  failureKind?: TerminalEnterpriseReadingFailureKind | null;
  sourceSafePreviewBlocked?: boolean;
  disclosureLeakageDetected?: boolean;
};

export type TerminalEnterpriseReadingRouteState = {
  transactionId: string | null;
  transactionIdPresent: boolean;
  transactionIdRequiredForRecovery: true;
  readingStageQueryParam: 'readingStage';
  activeStageHydratedFromRoute: boolean;
  routeReadingStage: TerminalEnterpriseReadingStepId | null;
  restartRequested: boolean;
  restartRestoresActiveStage: true;
  retryRequested: boolean;
  retryPreservesNeedLineage: true;
  retryPreservesSettlementBoundary: true;
  failureKind: TerminalEnterpriseReadingFailureKind;
  failureStateSourceSafe: true;
  failureRepairActions: string[];
};

export type TerminalEnterpriseReadingUxState = {
  schema: 'bitcode.terminal.enterprise-reading-ux-state';
  activeStepId: TerminalEnterpriseReadingStepId;
  stageCount: 5;
  steps: TerminalEnterpriseReadingStepView[];
  disclosure: {
    sourceSafetyClass: 'source_safe_enterprise_reading_ux_metadata';
    lowDetailDefault: true;
    expandableSourceSafeDetail: true;
    protectedSourceVisible: false;
    unpaidAssetPackSourceVisible: false;
    walletPrivateMaterialVisible: false;
    settlementPrivatePayloadVisible: false;
    ledgerAuthorityClaimed: false;
    visibleBeforeSettlement: TerminalEnterpriseReadingSourceSafeField[];
    hiddenBeforeSettlement: TerminalEnterpriseReadingForbiddenField[];
  };
  routeContract: {
    terminalOwnsTransactionAuthority: true;
    conversationMayHandoffIntent: true;
    transactionRouteRequiredForRecovery: true;
    acceptedNeedRequiredBeforeFindingFits: true;
    sourceSafePreviewRequiredBeforeSettlement: true;
    deliveryRequiresSettlementUnlock: true;
    restartRestoresReadingStage: true;
    retryPreservesSourceSafeLineage: true;
    failureStatesSourceSafe: true;
  };
  routeState: TerminalEnterpriseReadingRouteState;
  proofRoot: string;
};

export const TERMINAL_ENTERPRISE_READING_FORBIDDEN_FIELDS: TerminalEnterpriseReadingForbiddenField[] = [
  'protected_source_payload',
  'raw_protected_prompt',
  'raw_provider_response',
  'unpaid_assetpack_source',
  'wallet_private_material',
  'settlement_private_payload',
  'ledger_write_authority',
];

export const TERMINAL_ENTERPRISE_READING_STEPS: TerminalEnterpriseReadingStepDefinition[] = [
  {
    id: 'request-read',
    ordinal: 1,
    label: '1. Request Read',
    lowDetailGuidance: 'Frame repository, branch, commit, and the reader request.',
    expandableDetail:
      'Reading captures source anchors, enterprise intent, constraints, disclosure posture, target artifact kinds, and the measured Read posture that can be reviewed before Need synthesis.',
    primaryAction: 'Record read posture',
    sourceSafeVisibleFields: ['read_request_summary', 'proof_roots'],
    forbiddenFields: TERMINAL_ENTERPRISE_READING_FORBIDDEN_FIELDS,
  },
  {
    id: 'review-synthesized-need',
    ordinal: 2,
    label: '2. Review synthesized Need',
    lowDetailGuidance: 'Review Bitcode Need comprehension before any Depository search.',
    expandableDetail:
      'The reviewed Need exposes requirements, measurements, constraints, target artifact kinds, proof expectations, and feedback lineage; Finding Fits remains blocked until the Need is accepted.',
    primaryAction: 'Accept or resynthesize Need',
    sourceSafeVisibleFields: ['read_need_measurements', 'need_feedback_history', 'proof_roots'],
    forbiddenFields: TERMINAL_ENTERPRISE_READING_FORBIDDEN_FIELDS,
  },
  {
    id: 'request-fit',
    ordinal: 3,
    label: '3. Request Finding Fits',
    lowDetailGuidance: 'Run Finding Fits only from an accepted Need.',
    expandableDetail:
      'Reading hands the accepted Need, deposit/source anchors, proof roots, measurement roots, and source-safe search posture to ReadFitsFindingSynthesis without exposing protected deposit source.',
    primaryAction: 'Request Finding Fits',
    sourceSafeVisibleFields: ['read_need_measurements', 'depository_candidate_counts', 'proof_roots'],
    forbiddenFields: TERMINAL_ENTERPRISE_READING_FORBIDDEN_FIELDS,
  },
  {
    id: 'review-synthesized-asset-pack',
    ordinal: 4,
    label: '4. Review synthesized AssetPack',
    lowDetailGuidance: 'Inspect source-safe AssetPack measurements and quote before payment.',
    expandableDetail:
      'Preview can show selected fit ids, quality posture, measurement roots, proof roots, deterministic fee quote, disclosure verdict, and delivery posture; source-bearing AssetPack contents remain withheld.',
    primaryAction: 'Review preview and quote',
    sourceSafeVisibleFields: [
      'selected_fit_ids',
      'asset_pack_measurements',
      'quality_posture',
      'proof_roots',
      'btc_fee_quote',
      'delivery_posture',
    ],
    forbiddenFields: TERMINAL_ENTERPRISE_READING_FORBIDDEN_FIELDS,
  },
  {
    id: 'buy-asset-pack-settle',
    ordinal: 5,
    label: '5. Buy AssetPack, settle',
    lowDetailGuidance: 'Pay the BTC quote, transfer BTD read rights, then unlock delivery.',
    expandableDetail:
      'Settlement readback, BTD rights transfer, ledger/database/storage synchronization, and pull-request delivery are visible after payment while private wallet and settlement payloads stay hidden.',
    primaryAction: 'Settle and unlock delivery',
    sourceSafeVisibleFields: ['btc_fee_quote', 'settlement_state', 'delivery_posture', 'proof_roots'],
    forbiddenFields: TERMINAL_ENTERPRISE_READING_FORBIDDEN_FIELDS,
  },
];

const STEP_ORDER = TERMINAL_ENTERPRISE_READING_STEPS.map((step) => step.id);

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function inferTerminalEnterpriseReadingActiveStep(
  input: TerminalEnterpriseReadingUxStateInput,
): TerminalEnterpriseReadingStepId {
  if (input.hasDeliveryReadback || input.hasSettlementReadback) return 'buy-asset-pack-settle';
  if (input.hasSourceSafePreview && !input.sourceSafePreviewBlocked && !input.disclosureLeakageDetected) {
    return 'review-synthesized-asset-pack';
  }
  if (input.findingFitsRunning || input.hasAcceptedNeed) return 'request-fit';
  if (input.hasSynthesizedNeed) return 'review-synthesized-need';
  return 'request-read';
}

function normalizeTransactionId(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function routeStageOrNull(value: TerminalEnterpriseReadingStepId | null | undefined): TerminalEnterpriseReadingStepId | null {
  return value && STEP_ORDER.includes(value) ? value : null;
}

function chooseActiveStep(
  input: TerminalEnterpriseReadingUxStateInput,
): { activeStepId: TerminalEnterpriseReadingStepId; routeReadingStage: TerminalEnterpriseReadingStepId | null } {
  const inferredStep = inferTerminalEnterpriseReadingActiveStep(input);
  const routeReadingStage = routeStageOrNull(input.routeReadingStage);
  if (!routeReadingStage) return { activeStepId: inferredStep, routeReadingStage };

  const inferredIndex = STEP_ORDER.indexOf(inferredStep);
  const routeIndex = STEP_ORDER.indexOf(routeReadingStage);
  return {
    activeStepId: routeIndex > inferredIndex ? routeReadingStage : inferredStep,
    routeReadingStage,
  };
}

function failureKindFor(input: TerminalEnterpriseReadingUxStateInput): TerminalEnterpriseReadingFailureKind {
  if (input.disclosureLeakageDetected) return 'source_safety_blocked';
  if (input.sourceSafePreviewBlocked) return 'asset_pack_preview_blocked';
  return input.failureKind || 'none';
}

function repairActionsForFailure(kind: TerminalEnterpriseReadingFailureKind): string[] {
  if (kind === 'none') return [];
  if (kind === 'read_request_invalid') return ['repair-read-request'];
  if (kind === 'need_review_required') return ['review-or-resynthesize-need'];
  if (kind === 'fits_finding_failed') return ['retry-finding-fits-from-accepted-need'];
  if (kind === 'asset_pack_preview_blocked') return ['repair-source-safe-preview'];
  if (kind === 'settlement_blocked') return ['repair-settlement-readback'];
  if (kind === 'delivery_blocked') return ['repair-repository-delivery'];
  return ['repair-source-safety-disclosure'];
}

function blockersFor(stepId: TerminalEnterpriseReadingStepId, input: TerminalEnterpriseReadingUxStateInput) {
  const blockers: string[] = [];
  if (stepId === 'request-read' && !input.hasRepositorySource) blockers.push('repository source required');
  if (stepId !== 'request-read' && !input.hasReadMeasurement) blockers.push('measured Read required');
  if (['request-fit', 'review-synthesized-asset-pack', 'buy-asset-pack-settle'].includes(stepId) && !input.hasAcceptedNeed) {
    blockers.push('accepted Need required');
  }
  if (
    ['review-synthesized-asset-pack', 'buy-asset-pack-settle'].includes(stepId) &&
    !input.hasSourceSafePreview &&
    !input.hasDeliveryReadback
  ) {
    blockers.push('source-safe AssetPack preview required');
  }
  if (stepId === 'buy-asset-pack-settle' && !input.hasSettlementReadback && !input.hasDeliveryReadback) {
    blockers.push('settlement readback required');
  }
  if (input.disclosureLeakageDetected) blockers.push('source-safety disclosure review blocked');
  if (input.sourceSafePreviewBlocked) blockers.push('source-safe preview blocked');
  return blockers;
}

export function buildTerminalEnterpriseReadingUxState(
  input: TerminalEnterpriseReadingUxStateInput = {},
): TerminalEnterpriseReadingUxState {
  const { activeStepId, routeReadingStage } = chooseActiveStep(input);
  const activeIndex = STEP_ORDER.indexOf(activeStepId);
  const transactionId = normalizeTransactionId(input.transactionId);
  const failureKind = failureKindFor(input);
  const steps = TERMINAL_ENTERPRISE_READING_STEPS.map((step, index) => {
    const blockers = blockersFor(step.id, input);
    const state: TerminalEnterpriseReadingStepState =
      step.id === activeStepId
        ? 'current'
        : index < activeIndex && blockers.length === 0
          ? 'complete'
          : 'blocked';
    return { ...step, state, blockers };
  });
  const visibleBeforeSettlement = Array.from(
    new Set(TERMINAL_ENTERPRISE_READING_STEPS.flatMap((step) => step.sourceSafeVisibleFields)),
  );
  const seed = JSON.stringify({
    activeStepId,
    steps: steps.map((step) => ({ id: step.id, state: step.state, blockers: step.blockers })),
    hasRepositorySource: Boolean(input.hasRepositorySource),
    hasReadMeasurement: Boolean(input.hasReadMeasurement),
    hasAcceptedNeed: Boolean(input.hasAcceptedNeed),
    hasSourceSafePreview: Boolean(input.hasSourceSafePreview),
    hasSettlementReadback: Boolean(input.hasSettlementReadback),
    hasDeliveryReadback: Boolean(input.hasDeliveryReadback),
    transactionId,
    routeReadingStage,
    retryRequested: Boolean(input.retryRequested),
    failureKind,
  });

  return {
    schema: 'bitcode.terminal.enterprise-reading-ux-state',
    activeStepId,
    stageCount: 5,
    steps,
    disclosure: {
      sourceSafetyClass: 'source_safe_enterprise_reading_ux_metadata',
      lowDetailDefault: true,
      expandableSourceSafeDetail: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      ledgerAuthorityClaimed: false,
      visibleBeforeSettlement,
      hiddenBeforeSettlement: TERMINAL_ENTERPRISE_READING_FORBIDDEN_FIELDS,
    },
    routeContract: {
      terminalOwnsTransactionAuthority: true,
      conversationMayHandoffIntent: true,
      transactionRouteRequiredForRecovery: true,
      acceptedNeedRequiredBeforeFindingFits: true,
      sourceSafePreviewRequiredBeforeSettlement: true,
      deliveryRequiresSettlementUnlock: true,
      restartRestoresReadingStage: true,
      retryPreservesSourceSafeLineage: true,
      failureStatesSourceSafe: true,
    },
    routeState: {
      transactionId,
      transactionIdPresent: Boolean(transactionId),
      transactionIdRequiredForRecovery: true,
      readingStageQueryParam: 'readingStage',
      activeStageHydratedFromRoute: routeReadingStage === activeStepId,
      routeReadingStage,
      restartRequested: Boolean(input.restartRequested),
      restartRestoresActiveStage: true,
      retryRequested: Boolean(input.retryRequested),
      retryPreservesNeedLineage: true,
      retryPreservesSettlementBoundary: true,
      failureKind,
      failureStateSourceSafe: true,
      failureRepairActions: repairActionsForFailure(failureKind),
    },
    proofRoot: `terminal-enterprise-reading-ux:${stableHash(seed)}`,
  };
}

export function assertTerminalEnterpriseReadingUxStateSourceSafe(state: TerminalEnterpriseReadingUxState) {
  const sourceSafe =
    state.schema === 'bitcode.terminal.enterprise-reading-ux-state' &&
    state.stageCount === 5 &&
    state.disclosure.sourceSafetyClass === 'source_safe_enterprise_reading_ux_metadata' &&
    state.disclosure.lowDetailDefault === true &&
    state.disclosure.expandableSourceSafeDetail === true &&
    state.disclosure.protectedSourceVisible === false &&
    state.disclosure.unpaidAssetPackSourceVisible === false &&
    state.disclosure.walletPrivateMaterialVisible === false &&
    state.disclosure.settlementPrivatePayloadVisible === false &&
    state.disclosure.ledgerAuthorityClaimed === false &&
    state.routeContract.terminalOwnsTransactionAuthority === true &&
    state.routeContract.conversationMayHandoffIntent === true &&
    state.routeContract.transactionRouteRequiredForRecovery === true &&
    state.routeContract.acceptedNeedRequiredBeforeFindingFits === true &&
    state.routeContract.sourceSafePreviewRequiredBeforeSettlement === true &&
    state.routeContract.deliveryRequiresSettlementUnlock === true &&
    state.routeContract.restartRestoresReadingStage === true &&
    state.routeContract.retryPreservesSourceSafeLineage === true &&
    state.routeContract.failureStatesSourceSafe === true &&
    state.routeState.transactionIdRequiredForRecovery === true &&
    state.routeState.readingStageQueryParam === 'readingStage' &&
    state.routeState.restartRestoresActiveStage === true &&
    state.routeState.retryPreservesNeedLineage === true &&
    state.routeState.retryPreservesSettlementBoundary === true &&
    state.routeState.failureStateSourceSafe === true &&
    TERMINAL_ENTERPRISE_READING_FORBIDDEN_FIELDS.every((field) =>
      state.disclosure.hiddenBeforeSettlement.includes(field),
    );

  return {
    admitted: sourceSafe,
    reason: sourceSafe
      ? 'source_safe_enterprise_reading_ux_metadata'
      : 'enterprise_reading_ux_source_safety_boundary_violation',
  };
}
