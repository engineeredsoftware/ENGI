'use client';

/**
 * Packs portfolio positions + market intelligence overview cards.
 */

import React from "react";
import { Building2, LineChart, SlidersHorizontal } from "lucide-react";
import { ProductRouteStatePanel } from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import type { PackPortfolioMarketIntelligence } from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import { formatCount, formatSats } from "@/components/packs/models/packs-format";

export type PacksPortfolioOverviewProps = {
  marketIntelligence: PackPortfolioMarketIntelligence | null;
  isLoading: boolean;
  onWriteParams: (updates: Record<string, string | null>) => void;
};

export function PacksPortfolioOverview({
  marketIntelligence,
  isLoading,
  onWriteParams,
}: PacksPortfolioOverviewProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="border border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-emerald-200/80">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Portfolio positions
        </div>
        <div className="mt-4 grid gap-3 tablet:grid-cols-2">
          {(marketIntelligence?.positions || []).slice(0, 4).map((position) => (
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
              className="min-h-[120px] border border-white/10 bg-black/18 p-3 text-left outline-none transition hover:border-emerald-300/35 focus-visible:ring-2 focus-visible:ring-emerald-300/55"
            >
              <span className="block truncate text-sm font-medium text-white">
                {position.assetPackTitle}
              </span>
              <span className="mt-1 block truncate text-xs text-neutral-500">
                {position.repository}
              </span>
              <span className="mt-3 grid grid-cols-3 gap-2 text-[0.66rem] uppercase tracking-[0.14em] text-neutral-500">
                <span>
                  <strong className="block font-mono text-neutral-100">
                    {position.activityCount}
                  </strong>
                  rows
                </span>
                <span>
                  <strong className="block font-mono text-neutral-100">
                    {formatCount(position.btdEstimate)}
                  </strong>
                  BTD
                </span>
                <span>
                  <strong className="block font-mono text-neutral-100">
                    {position.proofRootCount}
                  </strong>
                  roots
                </span>
              </span>
              <span className="mt-3 block text-xs text-neutral-400">
                {formatSats(position.valueTotalSats)}
              </span>
            </button>
          ))}
          {!marketIntelligence?.positions.length && (
            <ProductRouteStatePanel
              compact
              variant={isLoading ? "loading" : "empty"}
              title={isLoading ? "Reading portfolio" : "No positions yet"}
              message="Portfolio positions appear when pack activity has AssetPack identifiers."
            />
          )}
        </div>
      </div>

      <div className="border border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-emerald-200/80">
          <LineChart className="h-4 w-4" aria-hidden="true" />
          Market intelligence
        </div>
        <div className="mt-4 grid gap-3 tablet:grid-cols-2">
          {(marketIntelligence?.signals || []).slice(0, 4).map((signal) => (
            <button
              key={signal.id}
              type="button"
              onClick={() =>
                onWriteParams({
                  q: signal.kind === "unfit-need" ? "unfit" : signal.kind,
                })
              }
              className="min-h-[120px] border border-white/10 bg-black/18 p-3 text-left outline-none transition hover:border-emerald-300/35 focus-visible:ring-2 focus-visible:ring-emerald-300/55"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-white">
                  {signal.label}
                </span>
                <span className="font-mono text-xs text-emerald-100">
                  {signal.strength}
                </span>
              </span>
              <span className="mt-2 line-clamp-2 block text-xs leading-5 text-neutral-400">
                {signal.description}
              </span>
              <span className="mt-3 block truncate text-[0.66rem] uppercase tracking-[0.14em] text-neutral-500">
                {signal.repository || "network"} / {signal.state}
              </span>
            </button>
          ))}
          {!marketIntelligence?.signals.length && (
            <ProductRouteStatePanel
              compact
              variant={isLoading ? "loading" : "empty"}
              title={isLoading ? "Reading signals" : "No signals yet"}
              message="Demand, supply, settlement, compensation, delivery, and repair signals appear from source-safe activity."
            />
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(marketIntelligence?.savedFilters || []).map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => onWriteParams(filter.query)}
              className="inline-flex min-h-9 items-center gap-2 border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-neutral-300 transition hover:border-emerald-300/35 hover:text-emerald-100"
              title={filter.description}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
