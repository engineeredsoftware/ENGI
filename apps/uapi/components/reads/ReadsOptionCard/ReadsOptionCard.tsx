/**
 * Read AssetPack option card — unpaid commercial disclosure only.
 *
 * Pre-settle law (V48-Gate5-F01): title + summary + measurements (absolutes /
 * needinesses / need-fit / confidence) + optional coverage % of request-SHA
 * catalog. Forbidden: covered path names, path-ops, patch bodies, patchfile
 * download, host source. Full material unlocks after settle (PR/delivery +
 * entitled Packs download).
 */
"use client";

import React, { useState } from "react";
import type { ReadSynthesizedOption } from "@/components/reads/ReadPageClient/hooks/use-read-option-synthesis";

function asReadings(value: unknown): Array<{
  measurementKind?: string;
  kind?: string;
  label?: string;
  volume?: number;
  magnitude?: number;
  unit?: string;
  rationale?: string;
}> {
  return Array.isArray(value) ? value : [];
}

export function ReadsOptionCard(props: {
  option: ReadSynthesizedOption;
  selected: boolean;
  onToggleSelect: (index: number) => void;
}) {
  const { option, selected, onToggleSelect } = props;
  const [showMeasures, setShowMeasures] = useState(true);
  const absolutes = asReadings(option.measurements?.absolutes);
  const needinesses = asReadings(option.measurements?.needinesses);
  const coveragePercent =
    typeof option.coveragePercent === "number"
      ? option.coveragePercent
      : typeof option.coverageRatio === "number"
        ? Math.round(option.coverageRatio * 1000) / 10
        : null;

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

      <p
        className="text-[0.7rem] leading-5 text-neutral-500"
        data-testid={`reads-option-unlock-hint-${option.index}`}
      >
        Source material unlocks only after settle — PR delivery on a{" "}
        <span className="font-mono text-neutral-400">bitcode/</span> branch from
        your request SHA, plus entitled downloads on Packs.
      </p>

      <div className="flex flex-wrap items-center gap-2 text-[0.65rem] text-neutral-400">
        <span className="border border-white/10 px-2 py-0.5">
          absolutes {absolutes.length}
        </span>
        <span className="border border-white/10 px-2 py-0.5">
          needinesses (*-fit) {needinesses.length}
        </span>
        {typeof option.needFit === "number" ? (
          <span className="border border-emerald-300/25 bg-emerald-400/10 px-2 py-0.5 text-emerald-100">
            need-fit {option.needFit.toFixed(3)}
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
          onClick={() => setShowMeasures((v) => !v)}
          className="border border-white/10 px-2 py-0.5 text-neutral-300"
        >
          {showMeasures ? "Hide measures" : "Show measures"}
        </button>
      </div>

      {showMeasures ? (
        <div className="grid gap-2 text-[0.7rem] text-neutral-400">
          {absolutes.length > 0 ? (
            <div>
              <p className="text-[0.6rem] uppercase tracking-wide text-neutral-500">
                Absolutes
              </p>
              <ul className="mt-1 space-y-0.5">
                {absolutes.slice(0, 12).map((row, i) => (
                  <li key={`abs-${i}`}>
                    {row.label || row.measurementKind || row.kind || "absolute"}
                    {typeof row.volume === "number"
                      ? ` · ${row.volume.toFixed(3)}`
                      : ""}
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
                {needinesses.slice(0, 12).map((row, i) => (
                  <li key={`need-${i}`}>
                    {row.label || row.measurementKind || row.kind || "fit"}
                    {typeof row.volume === "number"
                      ? ` · ${row.volume.toFixed(3)}`
                      : ""}
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
