/**
 * Deposit-read evidence extraction and row builders (public facade).
 */

export type {
  WorkbenchKeyValueRow,
  DepositReadCompletedEvidence,
} from './deposit-read-evidence-types';

export {
  extractCompletedHostEvidence,
  deriveDepositReadCompletedEvidence,
} from './deposit-read-evidence-extract';

export {
  buildDisclosureRows,
  buildAssetPackPreviewBoundaryRows,
  buildAssetPackSettlementBoundaryRows,
  buildReadingLocalStagingRehearsalRows,
  buildReadNeedRows,
  buildReadNeedRuntimeRows,
  buildHostIdentifierRows,
  buildSourceSafePreviewSummaryRows,
} from './deposit-read-evidence-row-builders';
