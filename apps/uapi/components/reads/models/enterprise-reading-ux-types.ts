/**
 * Types and step catalog for enterprise Reading UX state (source-safe step views).
 * Builders live in enterprise-reading-ux-state.ts; this module owns pure shape only.
 */

export type EnterpriseReadingStepId =
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
  id: EnterpriseReadingStepId;
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

export type EnterpriseReadingUxStateInput = {
  transactionId?: string | null;
  routeReadingStage?: EnterpriseReadingStepId | null;
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

export type EnterpriseReadingRouteState = {
  transactionId: string | null;
  transactionIdPresent: boolean;
  transactionIdRequiredForRecovery: true;
  readingStageQueryParam: 'readingStage';
  activeStageHydratedFromRoute: boolean;
  routeReadingStage: EnterpriseReadingStepId | null;
  restartRequested: boolean;
  restartRestoresActiveStage: true;
  retryRequested: boolean;
  retryPreservesNeedLineage: true;
  retryPreservesSettlementBoundary: true;
  failureKind: TerminalEnterpriseReadingFailureKind;
  failureStateSourceSafe: true;
  failureRepairActions: string[];
};

export type EnterpriseReadingUxState = {
  schema: 'bitcode.terminal.enterprise-reading-ux-state';
  activeStepId: EnterpriseReadingStepId;
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
  routeState: EnterpriseReadingRouteState;
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
