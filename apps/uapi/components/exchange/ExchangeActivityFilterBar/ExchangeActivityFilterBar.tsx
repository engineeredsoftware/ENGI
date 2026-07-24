'use client';

/**
 * Packs master filter bar — Deposit/Read twin of BitcodeTransactionsFilterBar.
 * Flat mosaic (no nested card chrome). URL writes via onWriteParams.
 *
 * Absolute facet: multi-clause (kind + compare op + volume 0..1), AND-combined.
 * URL SSOT: absoluteFilters=kind:op:volume,…
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Plus,
  Search,
  X,
} from "lucide-react";
import type {
  PackActivitySortDirection,
  PackActivitySortKey,
} from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import type { BitcodeExplainer } from "@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types";
import {
  ABSOLUTE_FILTER_CLAUSE_LIMIT,
  ABSOLUTE_VOLUME_COMPARE_OPS,
  ABSOLUTE_VOLUME_COMPARE_OP_LABELS,
  type AbsoluteMeasurementFilterClause,
  type AbsoluteVolumeCompareOp,
  clampAbsoluteVolume,
  isAbsoluteVolumeCompareOp,
  resolveAbsoluteMeasurementFiltersFromParams,
  serializeAbsoluteMeasurementFilters,
} from "@/components/exchange/models/absolute-measurement-filters";
import {
  PACKS_ABSOLUTE_KIND_OPTIONS,
  PACKS_FACET_FILTERS,
  PACKS_SORT_OPTIONS as SORT_OPTIONS,
  PACKS_TYPE_OPTIONS as TYPE_OPTIONS,
  readParam,
  type PacksTypeFilter,
} from "@/components/exchange/models/exchange-format";
import {
  PACKS_FILTER_EXPLAINERS,
  type PacksFilterExplainerKey,
} from "@/components/exchange/models/exchange-filter-explainers";

export type ExchangeActivityFilterBarProps = {
  routeParams: URLSearchParams;
  search: string;
  type: PacksTypeFilter;
  state: string;
  sort: PackActivitySortKey;
  direction: PackActivitySortDirection;
  onWriteParams: (updates: Record<string, string | null>) => void;
};

/** Match BitcodeTransactionsFilterBar field chrome (gap owned by FilterCell). */
const FIELD_CLASS =
  "h-9 w-full min-w-0 max-w-full overflow-hidden border border-white/10 bg-[rgba(10,15,30,0.88)] px-2.5 text-sm text-white outline-none transition placeholder:truncate placeholder:text-neutral-500 focus:border-emerald-400/40 phone:px-3";

const COMPACT_FIELD_CLASS =
  "h-9 min-w-0 border border-white/10 bg-[rgba(10,15,30,0.88)] px-2 text-sm text-white outline-none transition focus:border-emerald-400/40";

function FilterCell({
  label,
  explainerKey,
  children,
  className = "",
}: {
  label: string;
  explainerKey: PacksFilterExplainerKey;
  children: React.ReactNode;
  className?: string;
}) {
  const explainer: BitcodeExplainer = PACKS_FILTER_EXPLAINERS[explainerKey];
  return (
    <div className={["flex min-w-0 max-w-full flex-col gap-1.5", className].filter(Boolean).join(" ")}>
      <span className="flex h-4 min-w-0 items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500">
        <span className="min-w-0 truncate" title={label}>
          {label}
        </span>
        <BitcodeInlineExplainer
          explainer={explainer}
          side="bottom"
          className="shrink-0"
          triggerAriaLabel={`More info about the ${label} filter`}
        />
      </span>
      <div className="min-w-0 w-full">{children}</div>
    </div>
  );
}

/** Kind options without the "all" sentinel for clause rows. */
function absoluteKindChoices() {
  return PACKS_ABSOLUTE_KIND_OPTIONS.filter((o) => o.value && o.value !== "all");
}

function writeAbsoluteFilters(
  onWriteParams: (updates: Record<string, string | null>) => void,
  clauses: AbsoluteMeasurementFilterClause[],
) {
  onWriteParams({
    absoluteFilters: serializeAbsoluteMeasurementFilters(clauses),
    // Clear legacy single-kind params when writing multi-clause SSOT.
    absoluteKind: null,
    minAbsoluteVolume: null,
  });
}

/** Volume field with local draft so intermediate typing (e.g. "0.") is not clobbered. */
function AbsoluteVolumeInput({
  volume,
  index,
  onCommit,
}: {
  volume: number;
  index: number;
  onCommit: (next: number) => void;
}) {
  const [draft, setDraft] = useState(String(volume));
  useEffect(() => {
    setDraft(String(volume));
  }, [volume]);

  const commit = () => {
    const n = Number(draft);
    if (!Number.isFinite(n)) {
      setDraft(String(volume));
      return;
    }
    const clamped = clampAbsoluteVolume(n);
    setDraft(String(clamped));
    if (clamped !== volume) onCommit(clamped);
  };

  return (
    <input
      type="number"
      min={0}
      max={1}
      step={0.01}
      value={draft}
      onChange={(event) => setDraft(event.currentTarget.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
      className={`${COMPACT_FIELD_CLASS} tabular-nums`}
      aria-label={`Volume 0 to 1 for filter ${index + 1}`}
      title="Volume 0–1 (Enter or blur to apply)"
    />
  );
}

function AbsoluteFiltersEditor({
  routeParams,
  onWriteParams,
}: {
  routeParams: URLSearchParams;
  onWriteParams: (updates: Record<string, string | null>) => void;
}) {
  const clauses = useMemo(
    () =>
      resolveAbsoluteMeasurementFiltersFromParams({
        absoluteFilters: readParam(routeParams, "absoluteFilters", "") || null,
        absoluteKind: readParam(routeParams, "absoluteKind", "all") || null,
        minAbsoluteVolume: readParam(routeParams, "minAbsoluteVolume", "") || null,
      }),
    [routeParams],
  );

  const kindChoices = absoluteKindChoices();
  const canAdd = clauses.length < ABSOLUTE_FILTER_CLAUSE_LIMIT;

  const updateClause = (
    index: number,
    patch: Partial<AbsoluteMeasurementFilterClause>,
  ) => {
    const next = clauses.map((c, i) => {
      if (i !== index) return c;
      const kind = String(patch.kind ?? c.kind)
        .toLowerCase()
        .trim();
      const op: AbsoluteVolumeCompareOp = isAbsoluteVolumeCompareOp(patch.op)
        ? patch.op
        : c.op;
      const volume =
        typeof patch.volume === "number" && Number.isFinite(patch.volume)
          ? clampAbsoluteVolume(patch.volume)
          : c.volume;
      return { kind, op, volume };
    }).filter((c) => c.kind.length > 0);
    writeAbsoluteFilters(onWriteParams, next);
  };

  const removeClause = (index: number) => {
    writeAbsoluteFilters(
      onWriteParams,
      clauses.filter((_, i) => i !== index),
    );
  };

  const addClause = () => {
    if (!canAdd) return;
    // Default first unused kind (or first catalogue kind) with gte 0 (presence).
    const used = new Set(clauses.map((c) => c.kind));
    const nextKind =
      kindChoices.find((o) => !used.has(o.value))?.value ||
      kindChoices[0]?.value ||
      "";
    if (!nextKind) return;
    writeAbsoluteFilters(onWriteParams, [
      ...clauses,
      { kind: nextKind, op: "gte", volume: 0 },
    ]);
  };

  return (
    <div className="flex flex-col gap-1.5" data-testid="packs-absolute-filters">
      {clauses.length === 0 ? (
        <p className="text-[0.7rem] leading-snug text-neutral-500">
          No absolute volume constraints. Add one or more kind · operator · value
          (0–1) clauses; all must match.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5" role="list">
          {clauses.map((clause, index) => (
            <li
              key={`${clause.kind}-${clause.op}-${index}`}
              className="grid min-w-0 grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)_minmax(4.5rem,0.7fr)_auto] items-center gap-1.5"
              data-testid={`packs-absolute-filter-row-${index}`}
            >
              <select
                value={clause.kind}
                onChange={(event) =>
                  updateClause(index, { kind: event.currentTarget.value })
                }
                className={COMPACT_FIELD_CLASS}
                aria-label={`Absolute kind for filter ${index + 1}`}
              >
                {kindChoices.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={clause.op}
                onChange={(event) =>
                  updateClause(index, {
                    op: event.currentTarget.value as AbsoluteVolumeCompareOp,
                  })
                }
                className={COMPACT_FIELD_CLASS}
                aria-label={`Comparison for filter ${index + 1}`}
              >
                {ABSOLUTE_VOLUME_COMPARE_OPS.map((op) => (
                  <option key={op} value={op}>
                    {ABSOLUTE_VOLUME_COMPARE_OP_LABELS[op]}
                  </option>
                ))}
              </select>
              <AbsoluteVolumeInput
                volume={clause.volume}
                index={index}
                onCommit={(next) => updateClause(index, { volume: next })}
              />
              <button
                type="button"
                onClick={() => removeClause(index)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 bg-white/[0.04] text-neutral-300 transition hover:border-rose-300/35 hover:bg-rose-400/10 hover:text-rose-100"
                aria-label={`Remove absolute filter ${index + 1}`}
                title="Remove"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={addClause}
        disabled={!canAdd}
        className="inline-flex h-9 w-full items-center justify-center gap-1.5 border border-dashed border-emerald-400/30 bg-emerald-400/5 px-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/12 disabled:cursor-not-allowed disabled:opacity-40"
        data-testid="packs-absolute-filter-add"
        aria-label="Add absolute measurement filter"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        {clauses.length === 0
          ? "Add absolute filter"
          : canAdd
            ? "Add another absolute"
            : `Limit ${ABSOLUTE_FILTER_CLAUSE_LIMIT}`}
      </button>
    </div>
  );
}

export function ExchangeActivityFilterBar({
  routeParams,
  search,
  type,
  state,
  sort,
  direction,
  onWriteParams,
}: ExchangeActivityFilterBarProps) {
  return (
    // Compact mosaic twin of BitcodeTransactionsFilterBar — no nested card.
    // Parent list card owns vertical spacing (title chrome is a sibling card).
    <div
      className="grid w-full min-w-0 max-w-full grid-cols-2 items-start gap-2 tablet:grid-cols-4 xl:grid-cols-5"
      data-testid="packs-activity-filter-bar"
    >
      <FilterCell label="Search" explainerKey="search" className="col-span-2">
        <label className="relative mt-0 block min-w-0 max-w-full">
          <span className="sr-only">Search pack activity</span>
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 phone:left-3"
            aria-hidden="true"
          />
          <input
            value={search}
            onChange={(event) =>
              onWriteParams({ q: event.currentTarget.value })
            }
            className={`${FIELD_CLASS} mt-0 pl-9 pr-2.5 phone:pl-10 phone:pr-3`}
            placeholder="Search packs…"
            title="Search packs, measurements, absolutes, proofs, states…"
          />
        </label>
      </FilterCell>

      <FilterCell label="Type" explainerKey="type">
        <select
          value={type}
          onChange={(event) =>
            onWriteParams({ type: event.currentTarget.value })
          }
          className={FIELD_CLASS}
          aria-label="Activity type"
        >
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FilterCell>

      <FilterCell label="State" explainerKey="state">
        <input
          value={state === "all" ? "" : state}
          onChange={(event) =>
            onWriteParams({ state: event.currentTarget.value || null })
          }
          className={FIELD_CLASS}
          placeholder="State"
          aria-label="State filter"
        />
      </FilterCell>

      <FilterCell label="Sort" explainerKey="sort">
        <select
          value={sort}
          onChange={(event) =>
            onWriteParams({ sort: event.currentTarget.value })
          }
          className={FIELD_CLASS}
          aria-label="Sort column"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              Sort: {option.label}
            </option>
          ))}
        </select>
      </FilterCell>

      <FilterCell label="Direction" explainerKey="direction">
        <button
          type="button"
          onClick={() =>
            onWriteParams({
              direction: direction === "asc" ? "desc" : "asc",
            })
          }
          className="inline-flex h-9 w-full min-w-0 items-center justify-center gap-2 border border-emerald-400/25 bg-emerald-400/10 px-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/16 phone:px-3"
          aria-label={`Sort direction ${direction}`}
        >
          {direction === "asc" ? (
            <ArrowUpWideNarrow className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ArrowDownWideNarrow className="h-4 w-4" aria-hidden="true" />
          )}
          {direction}
        </button>
      </FilterCell>

      <FilterCell
        label="Absolutes"
        explainerKey="absoluteKind"
        className="col-span-2 tablet:col-span-4 xl:col-span-5"
      >
        <AbsoluteFiltersEditor
          routeParams={routeParams}
          onWriteParams={onWriteParams}
        />
      </FilterCell>

      {PACKS_FACET_FILTERS.map(([key, label]) => {
        const shortLabel = label.replace(/ facet$/i, "");
        return (
          <FilterCell
            key={key}
            label={shortLabel}
            explainerKey={key as PacksFilterExplainerKey}
          >
            <input
              value={
                readParam(routeParams, key, "all") === "all"
                  ? ""
                  : readParam(routeParams, key)
              }
              onChange={(event) =>
                onWriteParams({ [key]: event.currentTarget.value || null })
              }
              className={FIELD_CLASS}
              placeholder={shortLabel}
              title={label}
              aria-label={label}
            />
          </FilterCell>
        );
      })}
    </div>
  );
}
