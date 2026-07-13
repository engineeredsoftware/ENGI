/**
 * Deposit route aside — Earnings / all-repositories supply estimate panel.
 */
"use client";

import React from "react";
import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import { TelemetryExplainerTrigger } from "@/components/bitcode/pipeline/TelemetryExplainerTrigger/TelemetryExplainerTrigger";
import { formatSats } from "@/components/deposits/models/deposit-format";
import { DEPOSIT_SECTION_EXPLAINERS } from "@/components/deposits/models/deposit-explainers";
import {
  DEPOSIT_STAT_TOOLTIP_GENERICS,
  DEPOSIT_STAT_TOOLTIP_SECTIONS,
  DEPOSIT_EARNING_ROW_EXPLAINERS,
  DEPOSIT_OPPORTUNITY_ROOT_EXPLAINER,
} from "@/components/deposits/models/deposit-stat-explainers";
import type { DepositRouteSession } from "@/components/deposits/models/deposit-route-model";
import type { DepositSettledDemandEstimate } from "@/components/deposits/models/deposit-settled-demand";

export type DepositAsideEarningsPanelProps = {
  depositRouteSession: DepositRouteSession;
  settledDemandEstimate: DepositSettledDemandEstimate | null;
};

export function DepositAsideEarningsPanel({
  depositRouteSession,
  settledDemandEstimate,
}: DepositAsideEarningsPanelProps) {
  const intelligence = depositRouteSession.earningSupplyIntelligence;

  return (
    <section className="border border-white/10 bg-white/[0.035] px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
            Earnings
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
            <span>All-repositories supply estimate</span>
            <span
              onClick={(event) => event.stopPropagation()}
              className="shrink-0"
            >
              <BitcodeInlineExplainer
                explainer={DEPOSIT_SECTION_EXPLAINERS.earnings}
              />
            </span>
          </h2>
        </div>
      </div>
      <dl className="mt-4 grid gap-2">
        <TelemetryExplainerTrigger
          as="div"
          className="border-b border-emerald-300/15 px-0 py-2"
          explainer={{
            kicker: "Earning intelligence",
            title: "Likely demand",
            specific: DEPOSIT_EARNING_ROW_EXPLAINERS["Likely demand"],
            generic: DEPOSIT_STAT_TOOLTIP_GENERICS.earningIntelligence,
            points: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.points],
            references: {
              source: [
                ...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.references
                  .source,
              ],
              canon: [
                ...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.references
                  .canon,
              ],
            },
          }}
        >
          <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
            Likely demand
          </dt>
          <dd className="mt-1 text-sm text-emerald-100">
            {intelligence.likelyDemand.state === "unestimatable-demand" ? (
              <span className="text-amber-100/95">
                Unestimatable
                {settledDemandEstimate?.rationale ? (
                  <span className="mt-1 block text-[0.7rem] leading-5 text-neutral-400">
                    {settledDemandEstimate.rationale}
                  </span>
                ) : null}
              </span>
            ) : (
              <>
                {intelligence.likelyDemand.state} /{" "}
                {Math.round(intelligence.likelyDemand.averageConfidence * 100)}%
                {settledDemandEstimate?.estimatable ? (
                  <span className="mt-1 block text-[0.7rem] leading-5 text-neutral-400">
                    From {settledDemandEstimate.settledPackCount} settled
                    Depository AssetPack
                    {settledDemandEstimate.settledPackCount === 1 ? "" : "s"}
                    {settledDemandEstimate.matchedPackCount
                      ? ` · ${settledDemandEstimate.matchedPackCount} topic match${settledDemandEstimate.matchedPackCount === 1 ? "" : "es"}`
                      : ""}
                  </span>
                ) : null}
              </>
            )}
          </dd>
        </TelemetryExplainerTrigger>
        <TelemetryExplainerTrigger
          as="div"
          className="border-b border-white/8 px-0 py-2 last:border-b-0"
          explainer={{
            kicker: "Earning intelligence",
            title: "Unfit Need opportunities",
            specific: DEPOSIT_EARNING_ROW_EXPLAINERS["Unfit Need opportunities"],
            generic: DEPOSIT_STAT_TOOLTIP_GENERICS.earningIntelligence,
            points: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.points],
            references: {
              source: [
                ...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.references
                  .source,
              ],
              canon: [
                ...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.references
                  .canon,
              ],
            },
          }}
        >
          <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
            Unfit Need opportunities
          </dt>
          <dd className="mt-1 text-sm text-neutral-200">
            {intelligence.unfitNeedOpportunities.state ===
            "unestimatable-demand" ? (
              <span className="text-amber-100/95">
                Unestimatable
                {settledDemandEstimate?.rationale ? (
                  <span className="mt-1 block text-[0.7rem] leading-5 text-neutral-400">
                    {settledDemandEstimate.rationale}
                  </span>
                ) : null}
              </span>
            ) : (
              <>
                {intelligence.unfitNeedOpportunities.opportunityCount} /{" "}
                {intelligence.unfitNeedOpportunities.state}
              </>
            )}
          </dd>
        </TelemetryExplainerTrigger>
        <TelemetryExplainerTrigger
          as="div"
          className="border-b border-white/8 px-0 py-2 last:border-b-0"
          explainer={{
            kicker: "Earning intelligence",
            title: "Expected compensation",
            specific: DEPOSIT_EARNING_ROW_EXPLAINERS["Expected compensation"],
            generic: DEPOSIT_STAT_TOOLTIP_GENERICS.earningIntelligence,
            points: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.points],
            references: {
              source: [
                ...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.references
                  .source,
              ],
              canon: [
                ...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.references
                  .canon,
              ],
            },
          }}
        >
          <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
            Expected compensation
          </dt>
          <dd className="mt-1 text-sm text-neutral-200">
            {intelligence.earningStatements.some(
              (statement) => statement.state === "unestimatable-demand",
            ) || intelligence.likelyDemand.state === "unestimatable-demand" ? (
              <span className="text-amber-100/95">
                Unestimatable
                {settledDemandEstimate?.rationale ? (
                  <span className="mt-1 block text-[0.7rem] leading-5 text-neutral-400">
                    {settledDemandEstimate.rationale}
                  </span>
                ) : null}
              </span>
            ) : (
              <>
                {formatSats(
                  intelligence.aggregate.expectedCompensationRangeSats.low,
                )}{" "}
                -{" "}
                {formatSats(
                  intelligence.aggregate.expectedCompensationRangeSats.high,
                )}
              </>
            )}
          </dd>
        </TelemetryExplainerTrigger>
        <TelemetryExplainerTrigger
          as="div"
          className="border-b border-white/8 px-0 py-2 last:border-b-0"
          explainer={{
            kicker: "Earning intelligence",
            title: "Supply recommendations",
            specific: DEPOSIT_EARNING_ROW_EXPLAINERS["Supply recommendations"],
            generic: DEPOSIT_STAT_TOOLTIP_GENERICS.earningIntelligence,
            points: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.points],
            references: {
              source: [
                ...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.references
                  .source,
              ],
              canon: [
                ...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.references
                  .canon,
              ],
            },
          }}
        >
          <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
            Supply recommendations
          </dt>
          <dd className="mt-1 text-sm text-neutral-200">
            {intelligence.aggregate.sourceSafeSupplyRecommendationCount}{" "}
            approve-ready / {intelligence.aggregate.repairRequiredCount} repair
          </dd>
        </TelemetryExplainerTrigger>
      </dl>
      <details className="mt-3 border border-emerald-300/15 bg-emerald-300/[0.04] px-3 py-3">
        <summary className="cursor-pointer text-[0.62rem] uppercase tracking-[0.16em] text-emerald-100/85">
          Opportunity roots
        </summary>
        <dl className="mt-2 grid gap-2">
          {intelligence.unfitNeedOpportunities.opportunities.map(
            (opportunity) => (
              <TelemetryExplainerTrigger
                key={opportunity.id}
                as="div"
                explainer={{
                  kicker: "Opportunity root",
                  title: opportunity.label,
                  specific: DEPOSIT_OPPORTUNITY_ROOT_EXPLAINER,
                  generic: DEPOSIT_STAT_TOOLTIP_GENERICS.opportunityRoot,
                  points: [
                    ...DEPOSIT_STAT_TOOLTIP_SECTIONS.opportunityRoot.points,
                  ],
                  references: {
                    source: [
                      ...DEPOSIT_STAT_TOOLTIP_SECTIONS.opportunityRoot.references
                        .source,
                    ],
                    canon: [
                      ...DEPOSIT_STAT_TOOLTIP_SECTIONS.opportunityRoot.references
                        .canon,
                    ],
                  },
                }}
              >
                <dt className="text-[0.56rem] uppercase tracking-[0.12em] text-neutral-500">
                  {opportunity.label}
                </dt>
                <dd className="break-all font-mono text-[0.66rem] text-neutral-300">
                  {opportunity.opportunityRoot}
                </dd>
              </TelemetryExplainerTrigger>
            ),
          )}
        </dl>
      </details>
    </section>
  );
}
