/**
 * Read route session facade — stage helpers, session assembly, source-safety assert.
 *
 * Types: read-route-session-types.ts
 * Procurement / fit / settlement builders: sibling modules (re-exported here).
 */

import {
  TERMINAL_ENTERPRISE_READING_FORBIDDEN_FIELDS,
  TERMINAL_ENTERPRISE_READING_STEPS,
  assertTerminalEnterpriseReadingUxStateSourceSafe,
  buildTerminalEnterpriseReadingUxState,
} from '@/components/reads/models/enterprise-reading-ux-state';
import {
  assertOrganizationPolicyWalletAuthoritySourceSafe,
  buildOrganizationPolicyWalletAuthority,
} from '@bitcode/pipeline-asset-pack/organization-policy-wallet-authority';

import { buildReadFitMeasurementReview } from './read-fit-measurement-review';
import { buildReadProcurementGovernance } from './read-procurement-governance';
import { normalizedText, stableHash } from './read-route-helpers';
import type {
  ReadRouteSession,
  ReadRouteSessionInput,
  ReadRouteStepId,
} from './read-route-session-types';
import { buildReadSettlementRightsDelivery } from './read-settlement-rights-delivery';

export type {
  ReadRouteStepId,
  ReadRouteSessionInput,
  ReadFitMeasurementVisualizationId,
  ReadFitMeasurementRow,
  ReadFitMeasurementReview,
  ReadSettlementRightsDelivery,
  ReadProcurementBudgetState,
  ReadProcurementQuoteState,
  ReadProcurementSettlementReadiness,
  ReadProcurementGovernance,
  ReadRouteSession,
} from './read-route-session-types';

export { buildReadProcurementGovernance } from './read-procurement-governance';
export { buildReadFitMeasurementReview } from './read-fit-measurement-review';
export { buildReadSettlementRightsDelivery } from './read-settlement-rights-delivery';

const READ_ROUTE_STAGE_IDS = TERMINAL_ENTERPRISE_READING_STEPS.map((step) => step.id);

export function readReadRouteStage(params: URLSearchParams): ReadRouteStepId | null {
  const stage = params.get('readingStage')?.trim();
  return READ_ROUTE_STAGE_IDS.includes(stage as ReadRouteStepId)
    ? (stage as ReadRouteStepId)
    : null;
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
    walletId:
      normalizedText(input.walletId) ||
      (input.walletAuthorityPresent ? 'connected-reader-wallet' : null),
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
    targetAnchor:
      normalizedText(input.settlementQuoteId) ||
      normalizedText(input.transactionId) ||
      '/reads',
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
    steps: enterpriseState.steps.map((step) => ({
      id: step.id,
      state: step.state,
      blockers: step.blockers,
    })),
    procurementGovernance,
    fitMeasurementReviewRoot: fitMeasurementReview.reviewRoot,
    settlementRightsDeliveryRoot: settlementRightsDelivery.readbackRoot,
    organizationPolicyWalletAuthorityRoot:
      organizationPolicyWalletAuthority.roots.authorityRoot,
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
    session.organizationPolicyWalletAuthority.schema ===
      'bitcode.organization.policy-wallet-authority' &&
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
    reason: sourceSafe
      ? 'source_safe_read_route_metadata'
      : 'read_route_source_safety_boundary_violation',
  };
}
