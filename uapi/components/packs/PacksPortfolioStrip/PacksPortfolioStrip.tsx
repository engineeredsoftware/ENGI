"use client";

/**
 * Compact portfolio / market intelligence strip for Packs list master.
 * Deposit/Read parity: keep above-the-fold chrome short; full position cards
 * used to dominate vertical space before the activity table.
 */

import React from "react";
import { Building2, LineChart, SlidersHorizontal } from "lucide-react";
import type { PackPortfolioMarketIntelligence } from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import { formatCount, formatSats } from "@/components/packs/models/packs-format";

export type PacksPortfolioStripProps = {
  marketIntelligence: PackPortfolioMarketIntelligence | null;
  isLoading: boolean;
  onWriteParams: (updates: Record<string, string | null>) => void;
};

export function PacksPortfolioStrip({
  marketIntelligence,
  isLoading,
  onWriteParams,
}: PacksPortfolioStripProps) {
  const positions = marketIntelligence?.positions || [];
  const signals = marketIntelligence?.signals || [];
  const filters = marketIntelligence?.savedFilters || [];

  return (
    <section
      className="border border-white/10 bg-white/[0.035] px-4 py-3"
      aria-label="Portfolio and market strip"
      data-testid="packs-portfolio-strip"
    >
      <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.2em] text-emerald-200/75">
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
            Positions
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {positions.slice(0, 6).map((position) => (
              <button
                key={position.id}
                type="button"
                onClick={() =>
                  onWriteParams({
                    repository:
                      position.repository === "network"
                        ? null
                        : position.repository,
                    q: position.assetPackTitle,
                  })
                }
                className="max-w-[240px] border border-white/10 bg-black/20 px-2.5 py-1.5 text-left transition hover:border-emerald-300/35"
                title={`${position.assetPackTitle} · ${position.repository}`}
              >
                <span className="block truncate text-xs font-medium text-white">
                  {position.assetPackTitle}
                </span>
                <span className="mt-0.5 block font-mono text-[0.6rem] text-neutral-500">
                  {position.activityCount} rows · {formatCount(position.btdEstimate)}{" "}
                  BTD · {formatSats(position.valueTotalSats)}
                </span>
              </button>
            ))}
            {!positions.length ? (
              <span className="text-xs text-neutral-500">
                {isLoading ? "Reading portfolio…" : "No positions yet"}
              </span>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.2em] text-emerald-200/75">
            <LineChart className="h-3.5 w-3.5" aria-hidden="true" />
            Signals
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {signals.slice(0, 6).map((signal) => (
              <button
                key={signal.id}
                type="button"
                onClick={() =>
                  onWriteParams({
                    q: signal.kind === "unfit-need" ? "unfit" : signal.kind,
                  })
                }
                className="max-w-[220px] border border-white/10 bg-black/20 px-2.5 py-1.5 text-left transition hover:border-emerald-300/35"
                title={signal.description}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-medium text-white">
                    {signal.label}
                  </span>
                  <span className="shrink-0 font-mono text-[0.6rem] text-emerald-100/90">
                    {signal.strength}
                  </span>
                </span>
              </button>
            ))}
            {!signals.length ? (
              <span className="text-xs text-neutral-500">
                {isLoading ? "Reading signals…" : "No signals yet"}
              </span>
            ) : null}
          </div>
        </div>

        {filters.length ? (
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.2em] text-emerald-200/75">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              Saved
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => onWriteParams(filter.query)}
                  className="inline-flex min-h-8 items-center gap-1.5 border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-neutral-300 transition hover:border-emerald-300/35 hover:text-emerald-100"
                  title={filter.description}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
