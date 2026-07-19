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
    <div className={`grid gap-px ${gridClassName}`}>
      {items.map((item) => {
        const tooltip = item.detail ? `${item.value} - ${item.detail}` : item.value;

        return (
        <article
          key={`${item.label}-${item.value}`}
          className="auxillaries-glass-nested min-w-0 rounded-none border border-white/8 px-2.5 py-2"
          title={tooltip}
          aria-label={`${item.label}: ${tooltip}`}
        >
          <div className="flex min-w-0 items-center justify-between gap-1.5">
            <p className={`min-w-0 text-[10px] font-semibold uppercase tracking-[0.14em] leading-none ${TONE_ACCENTS[item.tone || "default"]}`}>
              {item.label}
            </p>
            {item.detail ? (
              <span
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-none border border-white/10 bg-white/5 text-[10px] font-semibold leading-none text-white/58"
                aria-hidden="true"
              >
                i
              </span>
            ) : null}
          </div>
          <p
            className={`mt-1.5 min-w-0 break-words text-[15px] font-semibold leading-snug [overflow-wrap:anywhere] ${TONE_VALUE_ACCENTS[item.tone || "default"]}`}
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
