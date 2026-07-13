/**
 * Deposit-read evidence row builders facade (stable re-exports).
 */

export { buildDisclosureRows, buildSourceSafePreviewSummaryRows } from './deposit-read-evidence-disclosure-rows';
export {
  buildAssetPackPreviewBoundaryRows,
  buildAssetPackSettlementBoundaryRows,
  buildReadingLocalStagingRehearsalRows,
} from './deposit-read-evidence-asset-pack-rows';
export {
  buildReadNeedRows,
  buildReadNeedRuntimeRows,
  buildHarnessIdentifierRows,
} from './deposit-read-evidence-need-rows';
