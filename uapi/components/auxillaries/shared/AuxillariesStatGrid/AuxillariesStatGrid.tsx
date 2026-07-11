"use client";

import React from "react";

type AuxillariesStatTone = "default" | "emerald" | "sky" | "violet" | "amber";

const TONE_ACCENTS: Record<AuxillariesStatTone, string> = {
  default: "text-white/72",
  emerald: "text-emerald-200/76",
  sky: "text-sky-200/76",
  violet: "text-violet-200/76",
  amber: "text-amber-200/76",
};

const TONE_VALUE_ACCENTS: Record<AuxillariesStatTone, string> = {
  default: "text-white",
  emerald: "text-emerald-100 drop-shadow-[0_0_14px_rgba(52,211,153,0.18)]",
  sky: "text-sky-100 drop-shadow-[0_0_14px_rgba(56,189,248,0.18)]",
  violet: "text-violet-100 drop-shadow-[0_0_14px_rgba(167,139,250,0.18)]",
  amber: "text-amber-100 drop-shadow-[0_0_14px_rgba(251,191,36,0.2)]",
};

export interface AuxillariesStatItem {
  label: string;
  value: string;
  detail?: string;
  tone?: AuxillariesStatTone;
}

interface AuxillariesStatGridProps {
  items: AuxillariesStatItem[];
  columns?: 2 | 3 | 4;
}

export default function AuxillariesStatGrid({
  items,
  columns = 2,
}: AuxillariesStatGridProps) {
  const gridClassName =
    columns === 4
      ? "tablet:grid-cols-2 desktop:grid-cols-4"
      : columns === 3
        ? "tablet:grid-cols-3"
        : "tablet:grid-cols-2";

  return (
    <div className={`grid gap-3 ${gridClassName}`}>
      {items.map((item) => {
        const tooltip = item.detail ? `${item.value} - ${item.detail}` : item.value;

        return (
        <article
          key={`${item.label}-${item.value}`}
          className="min-w-0 rounded-[20px] border border-white/8 bg-black/20 p-4"
          title={tooltip}
          aria-label={`${item.label}: ${tooltip}`}
        >
          <div className="flex min-w-0 items-center justify-between gap-2">
            <p className={`min-w-0 text-[11px] font-semibold uppercase tracking-[0.18em] ${TONE_ACCENTS[item.tone || "default"]}`}>
              {item.label}
            </p>
            {item.detail ? (
              <span
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold text-white/58"
                aria-hidden="true"
              >
                i
              </span>
            ) : null}
          </div>
          <p
            className={`mt-3 min-w-0 break-words text-lg font-semibold leading-snug [overflow-wrap:anywhere] ${TONE_VALUE_ACCENTS[item.tone || "default"]}`}
            title={tooltip}
          >
            {item.value}
          </p>
        </article>
        );
      })}
    </div>
  );
}
