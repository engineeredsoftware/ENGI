'use client';

/**
 * Shared square refresh control for deposit source-selection lists
 * (connection, repositories, branches, commits).
 */

import React from "react";
import { RefreshCw } from "lucide-react";
import { TelemetryExplainerTrigger } from "@/components/bitcode/pipeline/TelemetryExplainerTrigger/TelemetryExplainerTrigger";
import {
  DEPOSIT_SECTION_EXPLAINERS,
  toRichHoverExplainer,
} from "@/components/deposits/models/deposit-explainers";

export type DepositSourceListRefreshButtonProps = {
  ariaLabel: string;
  explainer: (typeof DEPOSIT_SECTION_EXPLAINERS)[keyof typeof DEPOSIT_SECTION_EXPLAINERS];
  disabled?: boolean;
  loading?: boolean;
  onRefresh: () => void;
};

export function DepositSourceListRefreshButton({
  ariaLabel,
  explainer,
  disabled,
  loading,
  onRefresh,
}: DepositSourceListRefreshButtonProps) {
  return (
    <TelemetryExplainerTrigger
      side="bottom"
      explainer={toRichHoverExplainer(explainer)}
    >
      <button
        type="button"
        aria-label={loading ? `Refreshing ${ariaLabel}` : ariaLabel}
        disabled={disabled || loading}
        onClick={onRefresh}
        className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-neutral-200 transition hover:border-emerald-300/35 hover:bg-emerald-300/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <RefreshCw
          className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          aria-hidden="true"
        />
      </button>
    </TelemetryExplainerTrigger>
  );
}
