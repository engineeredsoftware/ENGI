/**
 * Shared pure value helpers used by deposit-read evidence row builders.
 */
import {
  countList,
  numericValue,
  objectValue,
  shortIdentifier,
  stringList,
  terminalReadNeed,
  textValue,
  type TerminalReadNeedReviewRuntimeState,
  type TerminalReadNeedState,
} from './read-workbench-values';
import type {
  DepositReadCompletedEvidence,
  WorkbenchKeyValueRow,
} from './deposit-read-evidence-types';

export function buildDisclosureRows(evidence: DepositReadCompletedEvidence): WorkbenchKeyValueRow[] {
  const {
    disclosureAccess,
    disclosurePolicy,
    disclosureRoots,
    disclosureLeakage,
    protectedSourceUnlock,
    sourceSafePreview,
  } = evidence;
  return [
    {
      label: 'Visibility',
      value: textValue(disclosureAccess?.sourceVisibility) || 'withheld before settlement',
    },
    {
      label: 'Reader action',
      value: textValue(disclosureAccess?.readerAction) || 'pay to unlock',
    },
    {
      label: 'Policy root',
      value:
        shortIdentifier(disclosurePolicy?.accessPolicyHash) ||
        shortIdentifier(objectValue(sourceSafePreview?.accessPolicy)?.accessPolicyHash) ||
        'pending',
    },
    {
      label: 'Review root',
      value: shortIdentifier(disclosureRoots?.reviewRoot) || 'pending',
    },
    {
      label: 'Visible facts',
      value: `${countList(disclosurePolicy?.visibleBeforeSettlement)} before payment`,
    },
    {
      label: 'Withheld facts',
      value: `${countList(disclosurePolicy?.withheldBeforeSettlement)} until paid`,
    },
    {
      label: 'Leakage',
      value:
        disclosureLeakage?.protectedSourceDetected === true
          ? `${String(disclosureLeakage.findingCount || 'detected')} finding(s)`
          : disclosureLeakage
            ? 'none detected'
            : 'pending',
    },
    {
      label: 'Source',
      value: protectedSourceUnlock?.sourceAvailable === true ? 'available after settlement' : 'withheld',
    },
  ];
}

export function buildSourceSafePreviewSummaryRows(
  evidence: DepositReadCompletedEvidence,
): WorkbenchKeyValueRow[] {
  const {
    sourceSafePreview,
    previewFeeQuote,
    ledgerSettlement,
    protectedSourceUnlock,
    previewDelivery,
    assetPackDeliveryPosture,
  } = evidence;
  return [
    { label: 'AssetPack', value: textValue(sourceSafePreview?.assetPackId) || 'pending' },
    {
      label: 'Fee quote',
      value: numericValue(previewFeeQuote?.sats) ? `${String(previewFeeQuote?.sats)} sats` : 'pending',
    },
    { label: 'Quote root', value: shortIdentifier(previewFeeQuote?.quoteRoot) || 'pending' },
    {
      label: 'Range projection',
      value: objectValue(sourceSafePreview?.rangeProjection)?.tokenCount
        ? `${String(objectValue(sourceSafePreview?.rangeProjection)?.tokenCount)} cells`
        : 'pending',
    },
    { label: 'Ledger', value: textValue(ledgerSettlement?.status) || 'pending' },
    {
      label: 'Access',
      value:
        textValue(objectValue(sourceSafePreview?.accessPolicy)?.readRightState) || 'pending settlement',
    },
    {
      label: 'Unlock',
      value:
        protectedSourceUnlock?.sourceAvailable === true
          ? 'source available'
          : textValue(protectedSourceUnlock?.state) || 'withheld',
    },
    {
      label: 'Read license',
      value: shortIdentifier(ledgerSettlement?.readLicenseId) || 'pending',
    },
    {
      label: 'BTC fee',
      value: shortIdentifier(ledgerSettlement?.btcFeeReceiptId) || 'pending',
    },
    {
      label: 'PR target',
      value:
        textValue(previewDelivery?.pullRequestTarget) ||
        textValue(assetPackDeliveryPosture?.pullRequestTarget) ||
        'pending',
    },
  ];
}

