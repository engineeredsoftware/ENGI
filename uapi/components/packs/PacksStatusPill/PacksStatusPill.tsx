/**
 * Compact uppercase status chip used in packs master rows and detail states.
 */
"use client";

import React from "react";

export type PacksStatusPillProps = {
  value: string | null;
  fallback?: string;
};

export function PacksStatusPill({
  value,
  fallback = "not recorded",
}: PacksStatusPillProps) {
  const label = value || fallback;
  return (
    <span className="inline-flex min-h-7 items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.68rem] uppercase tracking-[0.16em] text-neutral-300">
      {label}
    </span>
  );
}
