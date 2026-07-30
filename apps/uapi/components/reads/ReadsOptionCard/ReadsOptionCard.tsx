/**
 * Read AssetPack option card — unpaid commercial disclosure only.
 *
 * Pre-settle law (V48-Gate5-F01): title + summary + measurements (absolutes /
 * needinesses / need-fit / confidence) + optional coverage % of request-SHA
 * catalog. Forbidden: covered path names, path-ops, patch bodies, patchfile
 * download, host source.
 *
 * Commercial buy/no-buy: needinesses (*-fit) first; absolute gates/quality
 * second; full catalogue behind expand.
 */
"use client";

import React, { useMemo, useState } from "react";
import type { ReadSynthesizedOption } from "@/components/reads/ReadPageClient/hooks/use-read-option-synthesis";
import {
  buildReadBuyerMeasurementProjection,
  recommendationLabel,
  type AbsoluteHonestyStatus,
  type BuyerAbsoluteChip,
  type BuyerFitRow,
} from "@/components/reads/models/read-buyer-measurement-projection";

function asReadings(value: unknown): Array<{
  measurementKind?: string;
  kind?: string;
  label?: string;
  volume?: number;
  magnitude?: number;
  unit?: string;
  status?: string;
  weight?: number;
  rationale?: string;
}> {
  return Array.isArray(value) ? value : [];
}

function fmtVol(v: number | null | undefined): string {
  if (typeof v !== "number" || !Number.isFinite(v)) return "—";
  return `${(v * 100).toFixed(0)}%`;
}

function statusClass(status: AbsoluteHonestyStatus | null): string {
  if (status === "measured") return "text-emerald-200/90";
  if (status === "estimated") return "text-amber-200/80";
  if (
    status === "insufficient_evidence" ||
    status === "expanded-fill" ||
    status === "not_run"
  ) {
    return "text-rose-200/80";
  }
  return "text-neutral-500";
}

function FitBar(props: { row: BuyerFitRow }) {
  const { row } = props;
  const pct =
    typeof row.volume === "number" ? Math.round(clamp01(row.volume) * 100) : 0;
  return (
    <div
      className="min-w-0"
      data-testid={`reads-fit-bar-${row.measurementKind}`}
    >
      <div className="flex items-center justify-between gap-2 text-[0.65rem]">
        <span className="truncate text-neutral-300">{row.label}</span>
        <span className={`shrink-0 font-mono ${statusClass(row.status)}`}>
          {fmtVol(row.volume)}
          {row.status ? ` · ${row.status}` : row.present ? "" : " · missing"}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-sm bg-white/10">
        <div
          className={`h-full ${
            !row.present
              ? "bg-neutral-600"
              : pct >= 55
                ? "bg-emerald-400/80"
                : pct >= 35
                  ? "bg-amber-400/70"
                  : "bg-rose-400/70"
          }`}
          style={{ width: `${row.present ? pct : 0}%` }}
        />
      </div>
    </div>
  );
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function Chip(props: { chip: BuyerAbsoluteChip }) {
  const { chip } = props;
  const tone = chip.hardBlock
    ? "border-rose-400/40 bg-rose-500/15 text-rose-100"
    : chip.softWarn
      ? "border-amber-400/35 bg-amber-500/10 text-amber-50"
      : "border-white/10 bg-black/20 text-neutral-300";
  return (
    <span
      className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[0.65rem] ${tone}`}
      title={[chip.label, chip.status, chip.volume != null ? `vol ${chip.volume}` : ""]
        .filter(Boolean)
        .join(" · ")}
      data-testid={`reads-abs-chip-${chip.measurementKind}`}
    >
      <span className="truncate max-w-[9rem]">{chip.label}</span>
      <span className="font-mono opacity-90">{fmtVol(chip.volume)}</span>
    </span>
  );
}

export function ReadsOptionCard(props: {
  option: ReadSynthesizedOption;
  selected: boolean;
  onToggleSelect: (index: number) => void;
}) {
  const { option, selected, onToggleSelect } = props;
  const [showFullCatalogue, setShowFullCatalogue] = useState(false);

  const absolutes = asReadings(option.measurements?.absolutes);
  const needinesses = asReadings(option.measurements?.needinesses);
  const coveragePercent =
    typeof option.coveragePercent === "number"
      ? option.coveragePercent
      : typeof option.coverageRatio === "number"
        ? Math.round(option.coverageRatio * 1000) / 10
        : null;

  const projection = useMemo(
    () =>
      buildReadBuyerMeasurementProjection({
        needinesses,
        absolutes,
        needFit: option.needFit,
      }),
    // option identity drives recompute; lists are derived each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [option.index, option.needFit, option.measurements, option.title],
  );

  const recTone =
    projection.recommendation === "buy_recommended"
      ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-50"
      : projection.recommendation === "buy_with_caution"
        ? "border-amber-400/40 bg-amber-500/15 text-amber-50"
        : projection.recommendation === "do_not_buy"
          ? "border-rose-400/40 bg-rose-500/15 text-rose-50"
          : "border-white/15 bg-white/5 text-neutral-300";

  return (
    <article
      data-testid={`reads-option-card-${option.index}`}
      className={`grid min-w-0 gap-3 border px-4 py-4 ${
        selected
          ? "border-orange-300/50 bg-orange-400/10"
          : "border-white/10 bg-black/25"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500">
            {option.kind || "option"}
          </p>
          <h3 className="mt-2 text-base font-semibold text-white">
            {option.title || `Option ${option.index + 1}`}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onToggleSelect(option.index)}
          className={`shrink-0 border px-2 py-1 text-xs ${
            selected
              ? "border-orange-300/50 bg-orange-400/20 text-orange-50"
              : "border-white/15 text-neutral-200"
          }`}
        >
          {selected ? "Selected" : "Select"}
        </button>
      </div>

      <p className="text-sm leading-6 text-neutral-300">
        {option.summary || "No summary."}
      </p>

      {/* P0: measurement-only buy recommendation */}
      <div
        className={`border px-3 py-2 text-[0.75rem] leading-5 ${recTone}`}
        data-testid={`reads-option-buy-rec-${option.index}`}
        data-recommendation={projection.recommendation}
      >
        <p className="font-medium">{recommendationLabel(projection.recommendation)}</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[0.7rem] opacity-95">
          {projection.recommendationReasons.slice(0, 4).map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        {typeof projection.needFitVolume === "number" ? (
          <p className="mt-2 font-mono text-[0.7rem]">
            need-fit {projection.needFitVolume.toFixed(3)}
            <span className="ml-2 opacity-70">
              ({projection.needFitSource})
            </span>
            {" · "}
            BTD volume tracks needinesses only
          </p>
        ) : null}
      </div>

      {/* P0: fit trio bars */}
      <div
        className="grid gap-2 border border-white/10 bg-black/20 px-3 py-3"
        data-testid={`reads-option-fit-panel-${option.index}`}
      >
        <p className="text-[0.6rem] uppercase tracking-[0.14em] text-neutral-500">
          Need fit (buy signal)
        </p>
        <div className="grid gap-2.5">
          {projection.fitRows.map((row) => (
            <FitBar key={row.measurementKind} row={row} />
          ))}
        </div>
      </div>

      {/* P1/P2: gates + quality */}
      <div className="grid gap-2">
        {projection.gateChips.some((c) => c.hardBlock || c.volume != null) ? (
          <div data-testid={`reads-option-gates-${option.index}`}>
            <p className="text-[0.6rem] uppercase tracking-[0.14em] text-neutral-500">
              Safety / license gates
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {projection.gateChips.map((c) => (
                <Chip key={c.measurementKind} chip={c} />
              ))}
            </div>
          </div>
        ) : null}
        {projection.qualityChips.length > 0 ? (
          <div data-testid={`reads-option-quality-${option.index}`}>
            <p className="text-[0.6rem] uppercase tracking-[0.14em] text-neutral-500">
              Quality (top commercial absolutes)
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {projection.qualityChips.map((c) => (
                <Chip key={c.measurementKind} chip={c} />
              ))}
            </div>
          </div>
        ) : null}
        {projection.penaltyChips.some((c) => c.softWarn) ? (
          <div data-testid={`reads-option-penalties-${option.index}`}>
            <p className="text-[0.6rem] uppercase tracking-[0.14em] text-neutral-500">
              Risk cautions
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {projection.penaltyChips
                .filter((c) => c.softWarn)
                .map((c) => (
                  <Chip key={c.measurementKind} chip={c} />
                ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[0.65rem] text-neutral-400">
        <span className="border border-white/10 px-2 py-0.5">
          absolutes {projection.absoluteCount || absolutes.length}
        </span>
        <span className="border border-white/10 px-2 py-0.5">
          needinesses {projection.needinessCount || needinesses.length}
        </span>
        {projection.honesty.total > 0 ? (
          <span
            className="border border-white/10 px-2 py-0.5"
            data-testid={`reads-option-honesty-${option.index}`}
          >
            honesty m{projection.honesty.measured}/e
            {projection.honesty.estimated}/?
            {projection.honesty.insufficient}
          </span>
        ) : null}
        {typeof option.confidence === "number" ? (
          <span className="border border-white/10 px-2 py-0.5">
            conf {(option.confidence * 100).toFixed(0)}%
          </span>
        ) : null}
        {coveragePercent !== null ? (
          <span
            className="border border-sky-300/25 bg-sky-400/10 px-2 py-0.5 text-sky-100"
            data-testid={`reads-option-coverage-${option.index}`}
          >
            coverage {coveragePercent}%
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => setShowFullCatalogue((v) => !v)}
          className="border border-white/10 px-2 py-0.5 text-neutral-300"
          data-testid={`reads-option-toggle-catalogue-${option.index}`}
        >
          {showFullCatalogue ? "Hide full catalogue" : "Show full catalogue"}
        </button>
      </div>

      <p
        className="text-[0.7rem] leading-5 text-neutral-500"
        data-testid={`reads-option-unlock-hint-${option.index}`}
      >
        Source material unlocks only after settle — PR delivery on a{" "}
        <span className="font-mono text-neutral-400">bitcode/</span> branch from
        your request SHA, plus entitled downloads on Packs. Buy/no-buy above is
        measurement-only (needinesses + absolute gates), not legal advice.
      </p>

      {showFullCatalogue ? (
        <div
          className="grid gap-2 text-[0.7rem] text-neutral-400"
          data-testid={`reads-option-full-catalogue-${option.index}`}
        >
          {absolutes.length > 0 ? (
            <div>
              <p className="text-[0.6rem] uppercase tracking-wide text-neutral-500">
                Absolutes (full)
              </p>
              <ul className="mt-1 max-h-48 space-y-0.5 overflow-y-auto">
                {absolutes.map((row, i) => (
                  <li key={`abs-${i}`}>
                    {row.label || row.measurementKind || row.kind || "absolute"}
                    {typeof row.volume === "number"
                      ? ` · ${row.volume.toFixed(3)}`
                      : ""}
                    {row.status ? ` · ${row.status}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {needinesses.length > 0 ? (
            <div>
              <p className="text-[0.6rem] uppercase tracking-wide text-neutral-500">
                Needinesses (*-fit)
              </p>
              <ul className="mt-1 space-y-0.5">
                {needinesses.map((row, i) => (
                  <li key={`need-${i}`}>
                    {row.label || row.measurementKind || row.kind || "fit"}
                    {typeof row.volume === "number"
                      ? ` · ${row.volume.toFixed(3)}`
                      : ""}
                    {row.status ? ` · ${row.status}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
