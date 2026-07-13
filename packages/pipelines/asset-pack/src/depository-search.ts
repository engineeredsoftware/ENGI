/**
 * Depository-search public barrel.
 * Re-exports the split SRP modules so `./depository-search` and package
 * `./depository-search` entrypoints keep an identical public surface.
 */
export type {
  AssetPackFitResultState,
  DepositoryCandidateUseTier,
  DepositorySearchThresholds,
  DepositorySearchChannelId,
  DepositorySearchQueryPlan,
  DepositorySearchRead,
  DepositoryContentUnit,
  DepositoryAsset,
  DepositoryProviderMatch,
  DepositorySearchProvider,
  DepositoryCandidateRanking,
  DepositoryCandidate,
  DepositoryCandidateFitEvidence,
  DepositorySearchResult,
  DepositoryFitsResult,
  DepositoryFitResultEvidence,
  DepositorySearchInput,
  ReadFitsFindingSynthesisSearchReceipt,
} from './depository-search-types';
export {
  READ_FITS_FINDING_SYNTHESIS_TOOL_IDS,
  READ_FITS_FINDING_SYNTHESIS_SEARCH_CHANNEL_IDS,
} from './depository-search-types';
export {
  summarizeDepositoryCandidateForFitEvidence,
  buildDepositoryFitResultEvidence,
} from './depository-search-evidence';
export {
  createLexicalDepositorySearchProvider,
  normalizeDepositorySearchRead,
  normalizeDepositoryAsset,
  normalizePipelineDepositoryAssets,
} from './depository-search-normalize';
export {
  searchDepositoryAssetSpace,
  runDepositorySearchForPipelineInput,
} from './depository-search-run';
