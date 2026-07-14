"use client";

/**
 * Packs detail shell for drill-in master-detail.
 * - layout="main": overview, measurements, states, accounting (primary column)
 * - layout="aside": governance + proof roots (route-state twin)
 * - layout="full": legacy single-column stack (tests / compact embeds)
 */

import React from "react";
import { ShieldCheck } from "lucide-react";
import { ProductRouteStatePanel } from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import type { PackActivityDetailProjection } from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import {
  formatTimestamp,
  formatType,
} from "@/components/packs/models/packs-format";
import { PacksDetailSection } from "@/components/packs/PacksDetailSection/PacksDetailSection";
import { PacksActivityDetailStates } from "@/components/packs/PacksActivityDetailStates/PacksActivityDetailStates";
import { PacksActivityDetailAccounting } from "@/components/packs/PacksActivityDetailAccounting/PacksActivityDetailAccounting";
import { PacksActivityDetailGovernance } from "@/components/packs/PacksActivityDetailGovernance/PacksActivityDetailGovernance";
import { PacksActivityDetailProofRoots } from "@/components/packs/PacksActivityDetailProofRoots/PacksActivityDetailProofRoots";

export type PacksActivityDetailProps = {
  detail: PackActivityDetailProjection | null;
  /** Column role in the deposit/read-style detail grid. */
  layout?: "main" | "aside" | "full";
};

function DetailHeader({ detail }: { detail: PackActivityDetailProjection }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        Source-safe detail
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
        {detail.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-neutral-300">
        {detail.description}
      </p>
    </div>
  );
}

function OverviewAndMeasurements({
  detail,
}: {
  detail: PackActivityDetailProjection;
}) {
  return (
    <>
      <PacksDetailSection title="Overview">
        <dl className="grid gap-3 text-sm tablet:grid-cols-2">
          <div>
            <dt className="text-neutral-500">Type</dt>
            <dd className="mt-1 text-neutral-100">{formatType(detail.type)}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">State</dt>
            <dd className="mt-1 text-neutral-100">
              {detail.overview.state || "not recorded"}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Repository</dt>
            <dd className="mt-1 text-neutral-100">
              {detail.overview.repository || "not recorded"}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Time</dt>
            <dd className="mt-1 text-neutral-100">
              {formatTimestamp(detail.timestamp)}
            </dd>
          </div>
        </dl>
      </PacksDetailSection>

      <PacksDetailSection title="Measurements">
        <div className="grid gap-2">
          {detail.measurements.length ? (
            detail.measurements.map((measurement) => (
              <div
                key={`${measurement.id}:${measurement.value}`}
                className="flex items-center justify-between gap-3 border border-white/10 bg-black/18 px-3 py-2 text-sm"
              >
                <span className="text-neutral-400">{measurement.label}</span>
                <span className="font-mono text-neutral-100">
                  {measurement.value} {measurement.unit || ""}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-500">
              No source-safe measurements recorded.
            </p>
          )}
        </div>
      </PacksDetailSection>
    </>
  );
}

export function PacksActivityDetail({
  detail,
  layout = "full",
}: PacksActivityDetailProps) {
  if (!detail) {
    return (
      <aside
        className="min-w-0 border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-5"
        data-testid={
          layout === "aside" ? "packs-detail-aside" : "packs-detail-main"
        }
      >
        <div className="py-12">
          <ProductRouteStatePanel
            variant="empty"
            title="No activity selected"
            message="Choose a row to inspect measurements, proof roots, settlement, compensation, delivery, and repair."
          />
        </div>
      </aside>
    );
  }

  if (layout === "aside") {
    return (
      <aside
        className="grid h-fit items-start gap-5"
        aria-label="Pack route state"
        data-testid="packs-detail-aside"
      >
        <div className="min-w-0 border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-5">
          <div className="grid gap-5">
            {detail.governance ? (
              <PacksActivityDetailGovernance governance={detail.governance} />
            ) : null}
            <PacksActivityDetailProofRoots detail={detail} />
          </div>
        </div>
      </aside>
    );
  }

  if (layout === "main") {
    return (
      <div
        className="min-w-0 border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-5"
        data-testid="packs-detail-main"
      >
        <div className="grid gap-5">
          <DetailHeader detail={detail} />
          <OverviewAndMeasurements detail={detail} />
          <PacksActivityDetailStates detail={detail} />
          {detail.accounting ? (
            <PacksActivityDetailAccounting accounting={detail.accounting} />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <aside
      className="min-w-0 border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-5"
      data-testid="packs-detail-full"
    >
      <div className="grid gap-5">
        <DetailHeader detail={detail} />
        <OverviewAndMeasurements detail={detail} />
        <PacksActivityDetailStates detail={detail} />
        {detail.accounting ? (
          <PacksActivityDetailAccounting accounting={detail.accounting} />
        ) : null}
        {detail.governance ? (
          <PacksActivityDetailGovernance governance={detail.governance} />
        ) : null}
        <PacksActivityDetailProofRoots detail={detail} />
      </div>
    </aside>
  );
}
