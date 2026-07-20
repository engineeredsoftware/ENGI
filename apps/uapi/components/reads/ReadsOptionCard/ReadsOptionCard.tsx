/**
 * Read AssetPack option card — richer deposit-style layout for source-safe review.
 * Shows patch summary, absolute + neediness (*-fit) measurements, need-fit composite.
 * Patchfile download is path-op JSON only (never unpaid raw source).
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

function downloadReadOptionPatchfile(option: ReadSynthesizedOption) {
  const safeTitle = String(option.title || `option-${option.index + 1}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const body = JSON.stringify(
    {
      schema: "bitcode.read.asset-pack-patchfile",
      index: option.index,
      kind: option.kind,
      title: option.title,
      summary: option.summary,
      patch: option.patch ?? null,
      coveredSourcePaths: option.coveredSourcePaths ?? [],
      measurements: option.measurements ?? null,
    },
    null,
    2,
  );
  const blob = new Blob([body], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeTitle || "read-option"}-patchfile.json`;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
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
  const paths = Array.isArray(option.coveredSourcePaths) ? option.coveredSourcePaths : [];
  const fileChanges = Array.isArray((option.patch as any)?.fileChanges)
    ? (option.patch as any).fileChanges
    : [];
  const patchSummary =
    typeof (option.patch as any)?.patchSummary === "string"
      ? (option.patch as any).patchSummary
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

      {patchSummary || fileChanges.length > 0 ? (
        <div className="border border-white/8 bg-white/[0.03] px-3 py-2">
          <p className="text-[0.6rem] uppercase tracking-wide text-neutral-500">
            Patch summary
          </p>
          {patchSummary ? (
            <p className="mt-1 text-xs leading-5 text-neutral-300">{patchSummary}</p>
          ) : null}
          {fileChanges.length > 0 ? (
            <p className="mt-2 font-mono text-[0.6rem] text-neutral-500">
              {fileChanges.length} file change(s)
              {fileChanges
                .slice(0, 4)
                .map((c: any) => ` · ${c?.op || "?"} ${c?.path || "?"}`)
                .join("")}
              {fileChanges.length > 4 ? " · …" : ""}
            </p>
          ) : null}
          <button
            type="button"
            data-testid={`reads-option-download-patch-${option.index}`}
            onClick={() => downloadReadOptionPatchfile(option)}
            className="mt-3 border border-orange-300/30 bg-orange-300/10 px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-orange-100 transition hover:border-orange-200/50 hover:bg-orange-300/16"
          >
            Download patchfile
          </button>
        </div>
      ) : (
        <button
          type="button"
          data-testid={`reads-option-download-patch-fallback-${option.index}`}
          onClick={() => downloadReadOptionPatchfile(option)}
          className="border border-orange-300/30 bg-orange-300/10 px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-orange-100 transition hover:border-orange-200/50 hover:bg-orange-300/16"
        >
          Download patchfile
        </button>
      )}

      {paths.length > 0 ? (
        <p className="font-mono text-[0.6rem] leading-4 text-neutral-500">
          covered: {paths.slice(0, 6).join(", ")}
          {paths.length > 6 ? ` (+${paths.length - 6})` : ""}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 text-[0.65rem] text-neutral-400">
        <span className="border border-white/10 px-2 py-0.5">
          absolutes {absolutes.length}
        </span>
        <span className="border border-white/10 px-2 py-0.5">
          needinesses (*-fit) {needinesses.length}
        </span>
        {typeof option.needFit === "number" ? (
          <span className="border border-orange-300/25 bg-orange-400/10 px-2 py-0.5 text-orange-100">
            need-fit {option.needFit.toFixed(2)}
          </span>
        ) : null}
        {typeof option.totalBtd === "number" ? (
          <span className="border border-emerald-300/25 bg-emerald-400/10 px-2 py-0.5 text-emerald-100">
            total BTD {option.totalBtd.toFixed(4)}
          </span>
        ) : null}
        {typeof option.confidence === "number" ? (
          <span className="border border-white/10 px-2 py-0.5">
            confidence {option.confidence.toFixed(2)}
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => setShowMeasures((v) => !v)}
          className="border border-white/10 px-2 py-0.5 text-neutral-300"
        >
          {showMeasures ? "Hide measurements" : "Show measurements"}
        </button>
      </div>

      {showMeasures ? (
        <div className="grid gap-3 border border-white/8 bg-black/20 px-3 py-3 text-xs">
          <div>
            <p className="text-[0.6rem] uppercase tracking-wide text-emerald-200/70">
              Absolutes
            </p>
            <ul className="mt-2 grid gap-1">
              {absolutes.map((row) => {
                const key = row.measurementKind || row.kind || row.label || "absolute";
                return (
                  <li
                    key={key}
                    className="flex justify-between gap-2 font-mono text-neutral-400"
                  >
                    <span>{row.label || row.measurementKind || row.kind}</span>
                    <span>
                      {typeof row.magnitude === "number"
                        ? `${row.magnitude}${row.unit ? ` ${row.unit}` : ""}`
                        : typeof row.volume === "number"
                          ? row.volume.toFixed(2)
                          : "—"}
                      {typeof row.magnitude === "number" &&
                      typeof row.volume === "number"
                        ? ` · ${(row.volume * 100).toFixed(0)}%`
                        : ""}
                    </span>
                  </li>
                );
              })}
              {absolutes.length === 0 ? (
                <li className="text-neutral-500">None attached</li>
              ) : null}
            </ul>
          </div>
          <div>
            <p className="text-[0.6rem] uppercase tracking-wide text-orange-200/70">
              Needinesses (*-fit) — reader-relative
            </p>
            <ul className="mt-2 grid gap-1">
              {needinesses.map((row) => {
                const key =
                  row.measurementKind || row.kind || row.label || "neediness";
                return (
                  <li
                    key={key}
                    className="flex justify-between gap-2 font-mono text-neutral-400"
                  >
                    <span>{row.label || row.measurementKind || row.kind}</span>
                    <span>
                      {typeof row.volume === "number"
                        ? `${(row.volume * 100).toFixed(0)}% fit`
                        : "—"}
                    </span>
                  </li>
                );
              })}
              {needinesses.length === 0 ? (
                <li className="text-neutral-500">
                  None attached — neediness is the Read measurement delta
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </article>
  );
}
