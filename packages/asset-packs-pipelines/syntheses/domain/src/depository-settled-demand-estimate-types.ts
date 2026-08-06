/**
 * Depository settled-AssetPack demand estimate types (V48 Gate 3).
 *
 * Source-safe pack summaries and estimate/neediness contracts — no builders.
 */

export type SettledDemandEstimateState =
  | 'strong-likely-demand'
  | 'moderate-likely-demand'
  | 'weak-likely-demand'
  | 'unestimatable-demand';

/** Minimal source-safe settled pack row used for estimation (no raw source). */
export interface SettledDepositoryPackSummary {
  id: string;
  title?: string | null;
  summary?: string | null;
  kind?: string | null;
  repositoryFullName?: string | null;
  /** When known: admitted-to-depository, settled, etc. */
  lifecycleState?: string | null;
  /** Optional free-text tags/topics (source-safe labels only). */
  topics?: string[] | null;
}

export interface DepositorySettledDemandEstimateInput {
  /** Settled / admitted Depository AssetPacks to search over. */
  settledPacks: SettledDepositoryPackSummary[];
  /** Optional focus for option-level estimates (title/summary/kind/repo). */
  focus?: {
    title?: string | null;
    summary?: string | null;
    kind?: string | null;
    repositoryFullName?: string | null;
    coveredSourcePaths?: string[] | null;
  } | null;
  /**
   * Minimum settled packs required before any numeric demand is admitted.
   * Below this floor the estimate is unestimatable (fail-closed honesty).
   */
  minSettledPacks?: number;
}

export interface DepositorySettledDemandEstimate {
  schema: 'bitcode.depository.settled-demand-estimate';
  estimatable: boolean;
  state: SettledDemandEstimateState;
  /** 0..1 when estimatable; null when unestimatable. */
  demand: number | null;
  /** 0..1 saturation of similar settled supply; null when unestimatable. */
  saturation: number | null;
  /**
   * Read-demand preview volume: demand × (0.5 + 0.5·(1−saturation)).
   * Null when unestimatable.
   */
  needinessVolume: number | null;
  settledPackCount: number;
  matchedPackCount: number;
  rationale: string;
  /** Source-safe pack ids that contributed to the match (bounded). */
  matchedPackIds: string[];
}
