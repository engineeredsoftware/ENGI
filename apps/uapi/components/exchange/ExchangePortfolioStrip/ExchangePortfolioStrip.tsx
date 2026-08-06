"use client";

/**
 * Compact portfolio / market intelligence strip for Packs list master.
 * Deposit/Read parity: keep above-the-fold chrome short; full position cards
 * used to dominate vertical space before the activity table.
 */

import React from "react";
import { Building2, LineChart, SlidersHorizontal } from "lucide-react";
import type { PackPortfolioMarketIntelligence } from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import { formatCount, formatSats } from "@/components/exchange/models/exchange-format";

export type ExchangePortfolioStripProps = {
  marketIntelligence: PackPortfolioMarketIntelligence | null;
  isLoading: boolean;
  onWriteParams: (updates: Record<string, string | null>) => void;
};

export function ExchangePortfolioStrip({
  marketIntelligence,
  isLoading,
  onWriteParams,
}: ExchangePortfolioStripProps) {
  const positions = marketIntelligence?.positions || [];
  const signals = marketIntelligence?.signals || [];
  const filters = marketIntelligence?.savedFilters || [];

  return (
    <section
      className="min-w-0 max-w-full overflow-x-clip border border-white/10 bg-white/[0.035] px-3 py-3 phone:px-4"
      aria-label="Portfolio and market strip"
      data-testid="packs-portfolio-strip"
    >
      {/*
        Phone: stack Positions → Signals → Saved (side-by-side flex-1 collided).
        Tablet+: two columns then Saved; laptop keeps original wrap density.
      */}
      <div className="grid min-w-0 grid-cols-1 gap-4 tablet:grid-cols-2 tablet:gap-x-6 tablet:gap-y-3 laptop:flex laptop:flex-wrap laptop:items-start laptop:gap-x-8">
        <div className="min-w-0 laptop:flex-1">
          <p className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.2em] text-emerald-200/75">
            <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Positions
          </p>
          <div className="mt-2 flex flex-col gap-2 phone:flex-row phone:flex-wrap">
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
                className="w-full min-w-0 max-w-full border border-white/10 bg-black/20 px-2.5 py-1.5 text-left transition hover:border-emerald-300/35 phone:w-auto phone:max-w-[240px]"
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

        <div className="min-w-0 laptop:flex-1">
          <p className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.2em] text-emerald-200/75">
            <LineChart className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Signals
          </p>
          <div className="mt-2 flex flex-col gap-2 phone:flex-row phone:flex-wrap">
            {signals.slice(0, 6).map((signal) => (
              <button
                key={signal.id}
                type="button"
                onClick={() =>
                  onWriteParams({
                    q: signal.kind === "unfit-need" ? "unfit" : signal.kind,
                  })
                }
                className="w-full min-w-0 max-w-full border border-white/10 bg-black/20 px-2.5 py-1.5 text-left transition hover:border-emerald-300/35 phone:w-auto phone:max-w-[220px]"
                title={signal.description}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-xs font-medium text-white">
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
          <div className="min-w-0 tablet:col-span-2 laptop:col-span-1">
            <p className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.2em] text-emerald-200/75">
              <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Saved
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 phone:flex phone:flex-wrap">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => onWriteParams(filter.query)}
                  className="inline-flex min-h-8 min-w-0 items-center justify-center gap-1.5 border border-white/10 bg-white/[0.04] px-2.5 py-1 text-center text-[0.62rem] uppercase tracking-[0.14em] text-neutral-300 transition hover:border-emerald-300/35 hover:text-emerald-100 phone:justify-start"
                  title={filter.description}
                >
                  <span className="truncate">{filter.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
