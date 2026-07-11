/**
 * Simple titled section shell used in Packs detail drawers.
 */
"use client";

import React from "react";

export function PacksDetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-white/10 pt-4">
      <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-emerald-200/80">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

