'use client';

/**
 * Reading route aside — reusable collapsible label/value rows section.
 * Mirrors DepositAsideRowsSection layout via ProductRouteAsideCard.
 */

import React from "react";
import { ProductRouteAsideCard } from "@/components/bitcode/routes/ProductRouteAsideCard/ProductRouteAsideCard";
import type { ReadLabelValueRow } from "@/components/reads/models/read-route-rows";

export type ReadsAsideRowsSectionProps = {
  kicker: string;
  title: string;
  rows: readonly ReadLabelValueRow[];
  children?: React.ReactNode;
  defaultOpen?: boolean;
};

export function ReadsAsideRowsSection({
  kicker,
  title,
  rows,
  children,
  defaultOpen = false,
}: ReadsAsideRowsSectionProps) {
  return (
    <ProductRouteAsideCard
      kicker={kicker}
      title={title}
      tone="orange"
      defaultOpen={defaultOpen}
    >
      <dl className="grid gap-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="border-b border-white/8 px-0 py-2 last:border-b-0"
          >
            <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
              {row.label}
            </dt>
            <dd className="mt-1 break-words font-mono text-[0.68rem] text-neutral-200">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      {children}
    </ProductRouteAsideCard>
  );
}
