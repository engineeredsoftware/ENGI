/**
 * Enterprise Reading UX state builders (active step, blockers, source-safety assert).
 * Types and step catalog: enterprise-reading-ux-types.ts (re-exported for stable imports).
 */

import {
  PRODUCT_ENTERPRISE_READING_FORBIDDEN_FIELDS,
  PRODUCT_ENTERPRISE_READING_STEPS,
  type ProductEnterpriseReadingFailureKind,
  type EnterpriseReadingStepId,
  type ProductEnterpriseReadingStepState,
  type EnterpriseReadingUxState,
  type EnterpriseReadingUxStateInput,
} from './enterprise-reading-ux-types';

export type {
  EnterpriseReadingStepId,
  ProductEnterpriseReadingStepState,
  ProductEnterpriseReadingFailureKind,
  ProductEnterpriseReadingSourceSafeField,
  ProductEnterpriseReadingForbiddenField,
  ProductEnterpriseReadingStepDefinition,
  ProductEnterpriseReadingStepView,
  EnterpriseReadingUxStateInput,
  EnterpriseReadingRouteState,
  EnterpriseReadingUxState,
} from './enterprise-reading-ux-types';
export {
  PRODUCT_ENTERPRISE_READING_FORBIDDEN_FIELDS,
  PRODUCT_ENTERPRISE_READING_STEPS,
} from './enterprise-reading-ux-types';

const STEP_ORDER = PRODUCT_ENTERPRISE_READING_STEPS.map((step) => step.id);

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function inferTerminalEnterpriseReadingActiveStep(
  input: EnterpriseReadingUxStateInput,
): EnterpriseReadingStepId {
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

function routeStageOrNull(
  value: EnterpriseReadingStepId | null | undefined,
): EnterpriseReadingStepId | null {
  return value && STEP_ORDER.includes(value) ? value : null;
}

function chooseActiveStep(input: EnterpriseReadingUxStateInput): {
  activeStepId: EnterpriseReadingStepId;
  routeReadingStage: EnterpriseReadingStepId | null;
} {
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

function failureKindFor(input: EnterpriseReadingUxStateInput): ProductEnterpriseReadingFailureKind {
  if (input.disclosureLeakageDetected) return 'source_safety_blocked';
  if (input.sourceSafePreviewBlocked) return 'asset_pack_preview_blocked';
  return input.failureKind || 'none';
}

function repairActionsForFailure(kind: ProductEnterpriseReadingFailureKind): string[] {
  if (kind === 'none') return [];
  if (kind === 'read_request_invalid') return ['repair-read-request'];
  if (kind === 'need_review_required') return ['review-or-resynthesize-need'];
  if (kind === 'fits_finding_failed') return ['retry-finding-fits-from-accepted-need'];
  if (kind === 'asset_pack_preview_blocked') return ['repair-source-safe-preview'];
  if (kind === 'settlement_blocked') return ['repair-settlement-readback'];
  if (kind === 'delivery_blocked') return ['repair-repository-delivery'];
  return ['repair-source-safety-disclosure'];
}

function blockersFor(stepId: EnterpriseReadingStepId, input: EnterpriseReadingUxStateInput) {
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

export function buildEnterpriseReadingUxState(
  input: EnterpriseReadingUxStateInput = {},
): EnterpriseReadingUxState {
  const { activeStepId, routeReadingStage } = chooseActiveStep(input);
  const activeIndex = STEP_ORDER.indexOf(activeStepId);
  const transactionId = normalizeTransactionId(input.transactionId);
  const failureKind = failureKindFor(input);
  const steps = PRODUCT_ENTERPRISE_READING_STEPS.map((step, index) => {
    const blockers = blockersFor(step.id, input);
    const state: ProductEnterpriseReadingStepState =
      step.id === activeStepId
        ? 'current'
        : index < activeIndex && blockers.length === 0
          ? 'complete'
          : 'blocked';
    return { ...step, state, blockers };
  });
  const visibleBeforeSettlement = Array.from(
    new Set(PRODUCT_ENTERPRISE_READING_STEPS.flatMap((step) => step.sourceSafeVisibleFields)),
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
      hiddenBeforeSettlement: PRODUCT_ENTERPRISE_READING_FORBIDDEN_FIELDS,
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

export function assertEnterpriseReadingUxStateSourceSafe(state: EnterpriseReadingUxState) {
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
    PRODUCT_ENTERPRISE_READING_FORBIDDEN_FIELDS.every((field) =>
      state.disclosure.hiddenBeforeSettlement.includes(field),
    );

  return {
    admitted: sourceSafe,
    reason: sourceSafe
      ? 'source_safe_enterprise_reading_ux_metadata'
      : 'enterprise_reading_ux_source_safety_boundary_violation',
  };
}
