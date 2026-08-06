/**
 * Packs activity API payload types for the /exchange experience.
 */

import type {
  PackActivityDetailProjection,
  PackActivityRecord,
  PackActivitySummary,
  PackPortfolioMarketIntelligence,
} from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";

export type PacksActivityPayload = {
  ok: boolean;
  records: PackActivityRecord[];
  detail: PackActivityDetailProjection | null;
  summary: PackActivitySummary;
  marketIntelligence: PackPortfolioMarketIntelligence;
  error?: string;
};
