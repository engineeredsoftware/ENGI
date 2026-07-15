/**
 * Real AssetPacksSynthesis (deposit lens) result shapes for the deposit UI.
 *
 * Produced by POST /api/deposit/synthesize-options and stored on the execution
 * row. When present, replaces deterministic blueprint synthesis in the route
 * session (V48 Gate 2 / F12).
 */

import type { DepositRouteSession } from "@/components/deposits/models/deposit-route-model";

export type DepositRealSynthesis = {
  synthesis: DepositRouteSession["synthesis"] & {
    synthesisMode?: string;
    inference?: {
      provider: string | null;
      model: string | null;
      totalTokens: number | null;
      durationMs: number | null;
    };
    exclusionPosture?: {
      impermissibleSourceCount: number;
      excludedPathCount: number;
      droppedCandidateCount: number;
    };
  };
  reviewProjections: Array<{
    optionId: string;
    title: string;
    coveredSourcePaths: string[];
    measurementRationale: string;
  }>;
} | null;

export type DepositRealSynthesisOption =
  DepositRouteSession["synthesis"]["options"][number];
