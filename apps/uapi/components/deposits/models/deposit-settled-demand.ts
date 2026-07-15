/**
 * Settled-Depository demand estimate shapes for the deposit experience.
 *
 * Demand is search-grounded only. When not estimatable, UI and policy must say
 * Unestimatable — never invent demand percentages (V48 Gate 3 law).
 */

export type DepositSettledDemandEstimate = {
  estimatable: boolean;
  demand: number | null;
  saturation: number | null;
  needinessVolume: number | null;
  settledPackCount: number;
  matchedPackCount: number;
  rationale: string;
};

export type DepositSettledDemandSignal = {
  id: string;
  label: string;
  weight: number;
};

export type DepositSettledDemandSignals = {
  depositoryDemandSignals: DepositSettledDemandSignal[];
  readingDemandSignals: DepositSettledDemandSignal[];
  existingDepositorySignals: DepositSettledDemandSignal[];
  unfitNeedOpportunitySignals: DepositSettledDemandSignal[];
};

export const EMPTY_SETTLED_DEMAND_SIGNALS: DepositSettledDemandSignals = {
  depositoryDemandSignals: [],
  readingDemandSignals: [],
  existingDepositorySignals: [],
  unfitNeedOpportunitySignals: [],
};

export function unestimatableDemand(
  rationale: string,
): DepositSettledDemandEstimate {
  return {
    estimatable: false,
    demand: null,
    saturation: null,
    needinessVolume: null,
    settledPackCount: 0,
    matchedPackCount: 0,
    rationale,
  };
}
