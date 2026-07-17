/**
 * Deposit AssetPack option admission public entry.
 *
 * Builds admission reports from synthesis + policy + depositor decisions and
 * asserts source-safety. Package export path unchanged.
 */

import type {
  DepositAssetPackOptionAdmissionInput,
  DepositAssetPackOptionAdmissionReport,
} from './deposit-asset-pack-option-admission-types';
import {
  ADMISSION_EXTRA_FORBIDDEN_MARKERS,
  buildReceipt,
  normalizeDecisions,
  policyByOption,
} from './deposit-asset-pack-option-admission-helpers';
import {
  hasNoForbiddenSourceMarkers,
  normalizedText,
  root,
  stableStringify,
} from './deposit-source-safe-utils';

export type {
  DepositAssetPackOptionAdmissionInput,
  DepositAssetPackOptionAdmissionReport,
  DepositOptionAdmissionReceipt,
  DepositOptionAdmissionState,
  DepositOptionReviewDecision,
  DepositOptionReviewDecisionState,
} from './deposit-asset-pack-option-admission-types';

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
    approvedCount: receipts.filter((receipt) => receipt.reviewDecision.state === 'approved-for-admission')
      .length,
    rejectedCount: receipts.filter((receipt) => receipt.reviewDecision.state === 'rejected-by-depositor')
      .length,
    resynthesisRequestedCount: receipts.filter(
      (receipt) => receipt.reviewDecision.state === 'resynthesis-requested',
    ).length,
    admittedCount: receipts.filter((receipt) => receipt.admission.state === 'admitted-to-depository').length,
    blockedCount: receipts.filter((receipt) => receipt.admission.state === 'not-admitted-policy-blocked')
      .length,
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
  const noForbiddenMarkers = hasNoForbiddenSourceMarkers(serialized, ADMISSION_EXTRA_FORBIDDEN_MARKERS);
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
