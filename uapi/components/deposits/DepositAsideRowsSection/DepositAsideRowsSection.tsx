'use client';

/**
 * Deposit route aside — reusable label/value rows section with explainers.
 * Used for Governance (authority) and Session panels; optional footer slots.
 */

import React from "react";
import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import { TelemetryExplainerTrigger } from "@/components/bitcode/pipeline/TelemetryExplainerTrigger/TelemetryExplainerTrigger";
import type { DepositLabelValueRow } from "@/components/deposits/models/deposit-route-rows";
import type { BitcodeExplainer } from "@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types";

export type DepositAsideRowsSectionProps = {
  kicker: string;
  title: string;
  sectionExplainer: BitcodeExplainer;
  rows: readonly DepositLabelValueRow[];
  rowExplainerKicker: string;
  rowExplainers: Record<string, string>;
  rowFallbackExplainer: string;
  genericTooltip: string;
  tooltipPoints: readonly string[];
  tooltipSourceRefs: readonly string[];
  tooltipCanonRefs: readonly string[];
  children?: React.ReactNode;
};

export function DepositAsideRowsSection({
  kicker,
  title,
  sectionExplainer,
  rows,
  rowExplainerKicker,
  rowExplainers,
  rowFallbackExplainer,
  genericTooltip,
  tooltipPoints,
  tooltipSourceRefs,
  tooltipCanonRefs,
  children,
}: DepositAsideRowsSectionProps) {
  return (
    <section className="border border-white/10 bg-white/[0.035] px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
            {kicker}
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
            <span>{title}</span>
            <span
              onClick={(event) => event.stopPropagation()}
              className="shrink-0"
            >
              <BitcodeInlineExplainer explainer={sectionExplainer} />
            </span>
          </h2>
        </div>
      </div>
      <dl className="mt-4 grid gap-2">
        {rows.map((row) => (
          <TelemetryExplainerTrigger
            key={row.label}
            as="div"
            className="border-b border-white/8 px-0 py-2 last:border-b-0"
            explainer={{
              kicker: rowExplainerKicker,
              title: row.label,
              specific: rowExplainers[row.label] ?? rowFallbackExplainer,
              generic: genericTooltip,
              points: [...tooltipPoints],
              references: {
                source: [...tooltipSourceRefs],
                canon: [...tooltipCanonRefs],
              },
            }}
          >
            <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
              {row.label}
            </dt>
            <dd className="mt-1 break-words font-mono text-[0.68rem] text-neutral-200">
              {row.value}
            </dd>
          </TelemetryExplainerTrigger>
        ))}
      </dl>
      {children}
    </section>
  );
}
