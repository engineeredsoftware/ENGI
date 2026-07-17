/**
 * Deposit AssetPack option admission and review decision types.
 *
 * Receipts project approved options into depository index, storage, Packs
 * activity, and telemetry — source-safe metadata only.
 */

import type { DepositAssetPackOption, DepositAssetPackOptionSynthesis } from './deposit-asset-pack-options-types';
import type { DepositAssetPackOptionPolicyReport } from './deposit-asset-pack-option-policy-types';

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
