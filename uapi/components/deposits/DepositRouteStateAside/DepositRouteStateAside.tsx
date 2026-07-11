/**
 * Deposit route state aside — Earnings, Governance, and Session panels.
 * Presentational only; parent owns route session and estimate state.
 */
"use client";

import React from "react";
import {
  ProductRouteDisclosure,
  ProductRouteProofDetail,
} from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import { TelemetryExplainerTrigger } from "@/components/bitcode/pipeline/TelemetryExplainerTrigger/TelemetryExplainerTrigger";
import { formatSats } from "@/components/deposits/models/deposit-format";
import { DEPOSIT_SECTION_EXPLAINERS } from "@/components/deposits/models/deposit-explainers";
import {
  DEPOSIT_AUTHORITY_BLOCKERS_EXPLAINER,
  DEPOSIT_STAT_TOOLTIP_GENERICS,
  DEPOSIT_STAT_TOOLTIP_SECTIONS,
  DEPOSIT_AUTHORITY_ROW_EXPLAINERS,
  DEPOSIT_DISCLOSURE_BOUNDARY_EXPLAINER,
  DEPOSIT_EARNING_ROW_EXPLAINERS,
  DEPOSIT_OPPORTUNITY_ROOT_EXPLAINER,
  DEPOSIT_PROOF_ROOT_EXPLAINERS,
  DEPOSIT_SESSION_ROW_EXPLAINERS,
} from "@/components/deposits/models/deposit-stat-explainers";
import type { DepositRouteSession } from "@/components/deposits/models/deposit-route-model";

export type DepositSettledDemandEstimate = {
  estimatable?: boolean;
  demand?: number;
  saturation?: number;
  needinessVolume?: number;
  settledPackCount?: number;
  matchedPackCount?: number;
  rationale?: string;
} | null;

export type DepositLabelValueRow = {
  label: string;
  value: string;
};

export type DepositRouteStateAsideProps = {
  depositRouteSession: DepositRouteSession;
  settledDemandEstimate: DepositSettledDemandEstimate;
  authorityRows: readonly DepositLabelValueRow[];
  sessionRows: readonly DepositLabelValueRow[];
};

export function DepositRouteStateAside({
  depositRouteSession,
  settledDemandEstimate,
  authorityRows,
  sessionRows,
}: DepositRouteStateAsideProps) {
  return (
    <aside
      className="grid h-fit items-start gap-5 tablet:grid-cols-3 xl:grid-cols-1"
      aria-label="Deposit route state"
    >
            <section className="border border-white/10 bg-white/[0.035] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
                    Earnings
                  </p>
                  <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                    <span>All-repositories supply estimate</span>
                    <span onClick={(event) => event.stopPropagation()} className="shrink-0">
                      <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.earnings} />
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
                      source: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.references.source],
                      canon: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.references.canon],
                    },
                  }}
                >
                  <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                    Likely demand
                  </dt>
                  <dd className="mt-1 text-sm text-emerald-100">
                    {depositRouteSession.earningSupplyIntelligence.likelyDemand
                      .state === "unestimatable-demand" ? (
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
                        {
                          depositRouteSession.earningSupplyIntelligence
                            .likelyDemand.state
                        }{" "}
                        /{" "}
                        {Math.round(
                          depositRouteSession.earningSupplyIntelligence
                            .likelyDemand.averageConfidence * 100,
                        )}
                        %
                        {settledDemandEstimate?.estimatable ? (
                          <span className="mt-1 block text-[0.7rem] leading-5 text-neutral-400">
                            From {settledDemandEstimate.settledPackCount} settled
                            Depository AssetPack
                            {settledDemandEstimate.settledPackCount === 1
                              ? ""
                              : "s"}
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
                      source: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.references.source],
                      canon: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.references.canon],
                    },
                  }}
                >
                  <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                    Unfit Need opportunities
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-200">
                    {depositRouteSession.earningSupplyIntelligence
                      .unfitNeedOpportunities.state === "unestimatable-demand" ? (
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
                        {
                          depositRouteSession.earningSupplyIntelligence
                            .unfitNeedOpportunities.opportunityCount
                        }{" "}
                        /{" "}
                        {
                          depositRouteSession.earningSupplyIntelligence
                            .unfitNeedOpportunities.state
                        }
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
                      source: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.references.source],
                      canon: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.references.canon],
                    },
                  }}
                >
                  <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                    Expected compensation
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-200">
                    {depositRouteSession.earningSupplyIntelligence.earningStatements.some(
                      (statement) => statement.state === "unestimatable-demand",
                    ) ||
                    depositRouteSession.earningSupplyIntelligence.likelyDemand
                      .state === "unestimatable-demand" ? (
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
                          depositRouteSession.earningSupplyIntelligence.aggregate
                            .expectedCompensationRangeSats.low,
                        )}{" "}
                        -{" "}
                        {formatSats(
                          depositRouteSession.earningSupplyIntelligence.aggregate
                            .expectedCompensationRangeSats.high,
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
                      source: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.references.source],
                      canon: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.earningIntelligence.references.canon],
                    },
                  }}
                >
                  <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                    Supply recommendations
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-200">
                    {
                      depositRouteSession.earningSupplyIntelligence.aggregate
                        .sourceSafeSupplyRecommendationCount
                    }{" "}
                    approve-ready /{" "}
                    {
                      depositRouteSession.earningSupplyIntelligence.aggregate
                        .repairRequiredCount
                    }{" "}
                    repair
                  </dd>
                </TelemetryExplainerTrigger>
              </dl>
              <details className="mt-3 border border-emerald-300/15 bg-emerald-300/[0.04] px-3 py-3">
                <summary className="cursor-pointer text-[0.62rem] uppercase tracking-[0.16em] text-emerald-100/85">
                  Opportunity roots
                </summary>
                <dl className="mt-2 grid gap-2">
                  {depositRouteSession.earningSupplyIntelligence.unfitNeedOpportunities.opportunities.map(
                    (opportunity) => (
                      <TelemetryExplainerTrigger
                        key={opportunity.id}
                        as="div"
                        explainer={{
                          kicker: "Opportunity root",
                          title: opportunity.label,
                          specific: DEPOSIT_OPPORTUNITY_ROOT_EXPLAINER,
                          generic: DEPOSIT_STAT_TOOLTIP_GENERICS.opportunityRoot,
                          points: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.opportunityRoot.points],
                          references: {
                            source: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.opportunityRoot.references.source],
                            canon: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.opportunityRoot.references.canon],
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

            <section className="border border-white/10 bg-white/[0.035] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
                    Governance
                  </p>
                  <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                    <span>Organization authority</span>
                    <span onClick={(event) => event.stopPropagation()} className="shrink-0">
                      <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.governance} />
                    </span>
                  </h2>
                </div>
              </div>
              <dl className="mt-4 grid gap-2">
                {authorityRows.map((row) => (
                  <TelemetryExplainerTrigger
                    key={row.label}
                    as="div"
                    className="border-b border-white/8 px-0 py-2 last:border-b-0"
                    explainer={{
                      kicker: "Governance",
                      title: row.label,
                      specific:
                        DEPOSIT_AUTHORITY_ROW_EXPLAINERS[row.label] ??
                        "Organization authority state for this deposit route.",
                      generic: DEPOSIT_STAT_TOOLTIP_GENERICS.governance,
                      points: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.governance.points],
                      references: {
                        source: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.governance.references.source],
                        canon: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.governance.references.canon],
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
              {depositRouteSession.organizationPolicyWalletAuthority.aggregate
                .blockers.length ? (
                <div className="mt-3">
                  <ProductRouteDisclosure
                    title="Authority blockers"
                    tone="emerald"
                    summaryDescription={DEPOSIT_AUTHORITY_BLOCKERS_EXPLAINER}
                  >
                    {depositRouteSession.organizationPolicyWalletAuthority.aggregate.blockers.join(
                      "; ",
                    )}
                  </ProductRouteDisclosure>
                </div>
              ) : null}
            </section>

            <section className="border border-white/10 bg-white/[0.035] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
                    Session
                  </p>
                  <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                    <span>Source-safe deposit state</span>
                    <span onClick={(event) => event.stopPropagation()} className="shrink-0">
                      <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.session} />
                    </span>
                  </h2>
                </div>
              </div>
              <dl className="mt-4 grid gap-2">
                {sessionRows.map((row) => (
                  <TelemetryExplainerTrigger
                    key={row.label}
                    as="div"
                    className="border-b border-white/8 px-0 py-2 last:border-b-0"
                    explainer={{
                      kicker: "Session state",
                      title: row.label,
                      specific:
                        DEPOSIT_SESSION_ROW_EXPLAINERS[row.label] ??
                        "Source-safe session state for this deposit route.",
                      generic: DEPOSIT_STAT_TOOLTIP_GENERICS.sessionState,
                      points: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.sessionState.points],
                      references: {
                        source: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.sessionState.references.source],
                        canon: [...DEPOSIT_STAT_TOOLTIP_SECTIONS.sessionState.references.canon],
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
              <div className="mt-3">
                <ProductRouteDisclosure
                  title="Disclosure boundary"
                  tone="emerald"
                  summaryDescription={DEPOSIT_DISCLOSURE_BOUNDARY_EXPLAINER}
                >
                  Visible: measurements, demand roots, source path roots, policy
                  roots, estimated ROI, BTD potential, compensation metadata.
                  Withheld: raw source, unpaid AssetPack source, prompts,
                  provider responses, settlement private payloads, wallet
                  private material.
                </ProductRouteDisclosure>
              </div>
              <div className="mt-3">
                <ProductRouteProofDetail
                  testId="deposit-expandable-proof-detail"
                  title="Deposit proof detail"
                  tone="emerald"
                  roots={[
                    {
                      id: "route-session-root",
                      description: DEPOSIT_PROOF_ROOT_EXPLAINERS["route-session-root"],
                      label: "Route session root",
                      root: depositRouteSession.proofRoot,
                    },
                    {
                      id: "synthesis-root",
                      description: DEPOSIT_PROOF_ROOT_EXPLAINERS["synthesis-root"],
                      label: "Synthesis root",
                      root: depositRouteSession.synthesis.roots.synthesisRoot,
                    },
                    {
                      id: "policy-root",
                      description: DEPOSIT_PROOF_ROOT_EXPLAINERS["policy-root"],
                      label: "Policy root",
                      root: depositRouteSession.policy.roots.policyReportRoot,
                    },
                    {
                      id: "admission-root",
                      description: DEPOSIT_PROOF_ROOT_EXPLAINERS["admission-root"],
                      label: "Admission root",
                      root:
                        depositRouteSession.admission.roots.admissionReportRoot,
                    },
                    {
                      id: "earning-root",
                      description: DEPOSIT_PROOF_ROOT_EXPLAINERS["earning-root"],
                      label: "Earning intelligence root",
                      root:
                        depositRouteSession.earningSupplyIntelligence.roots
                          .intelligenceRoot,
                    },
                    {
                      id: "authority-root",
                      description: DEPOSIT_PROOF_ROOT_EXPLAINERS["authority-root"],
                      label: "Authority root",
                      root:
                        depositRouteSession.organizationPolicyWalletAuthority
                          .roots.authorityRoot,
                    },
                  ]}
                />
              </div>
            </section>
          </aside>

  );
}
