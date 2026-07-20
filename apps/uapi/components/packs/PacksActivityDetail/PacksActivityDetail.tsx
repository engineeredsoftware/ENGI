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
  formatActivityValue,
  formatPackKind,
  formatTimestamp,
} from "@/components/packs/models/packs-format";
import { PacksDetailSection } from "@/components/packs/PacksDetailSection/PacksDetailSection";
import { PacksActivityDetailStates } from "@/components/packs/PacksActivityDetailStates/PacksActivityDetailStates";
import { PacksActivityDetailAccounting } from "@/components/packs/PacksActivityDetailAccounting/PacksActivityDetailAccounting";
import { PacksActivityDetailGovernance } from "@/components/packs/PacksActivityDetailGovernance/PacksActivityDetailGovernance";
import { PacksActivityDetailProofRoots } from "@/components/packs/PacksActivityDetailProofRoots/PacksActivityDetailProofRoots";
import {
  PacksActivityDetailPayout,
  type PacksPendingPayout,
} from "@/components/packs/PacksActivityDetailPayout/PacksActivityDetailPayout";

export type PacksActivityDetailProps = {
  detail: PackActivityDetailProjection | null;
  /** Column role in the deposit/read-style detail grid. */
  layout?: "main" | "aside" | "full";
  /** Current user ethereum address (lowercased) for seller/buyer role. */
  viewerEthereumAddress?: string | null;
  onPayoutFinalized?: () => void;
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
            <dt className="text-neutral-500">Kind</dt>
            <dd className="mt-1 text-neutral-100">
              {formatPackKind(detail.assetPackKind || detail.overview.assetPackKind)}
              {(detail.assetPackKind || detail.overview.assetPackKind) ? (
                <span className="mt-0.5 block font-mono text-[0.68rem] text-neutral-500">
                  {detail.assetPackKind || detail.overview.assetPackKind}
                </span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">BTD (unsettled estimate)</dt>
            <dd className="mt-1 font-mono text-neutral-100">
              {formatActivityValue(detail)}
            </dd>
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
          <div>
            <dt className="text-neutral-500">Activity</dt>
            <dd className="mt-1 text-neutral-500">{detail.type}</dd>
          </div>
        </dl>
      </PacksDetailSection>

      <PacksDetailSection title="Measurements">
        <div className="grid gap-3">
          {detail.measurements.length ? (
            detail.measurements.map((measurement) => (
              <div
                key={`${measurement.id}:${measurement.value}`}
                className="grid gap-2 border border-white/10 bg-black/18 px-3 py-3 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium text-neutral-200">
                    {measurement.label}
                  </span>
                  <span className="shrink-0 font-mono text-neutral-100">
                    {measurement.value} {measurement.unit || ""}
                  </span>
                </div>
                {typeof measurement.weight === "number" ? (
                  <p className="font-mono text-[0.68rem] text-neutral-500">
                    weight {measurement.weight.toFixed(2)}
                    {typeof measurement.volume === "number"
                      ? ` · volume ${(measurement.volume * 100).toFixed(0)}%`
                      : ""}
                  </p>
                ) : null}
                {measurement.descriptor ? (
                  <p className="text-xs leading-5 text-neutral-400">
                    {measurement.descriptor}
                  </p>
                ) : null}
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

function PayoutFromDetail({
  detail,
  viewerEthereumAddress,
  onPayoutFinalized,
}: {
  detail: PackActivityDetailProjection;
  viewerEthereumAddress?: string | null;
  onPayoutFinalized?: () => void;
}) {
  const meta = detail.metadata || {};
  const pending = (meta.pendingPayout || meta.payout) as PacksPendingPayout | undefined;
  if (!pending || typeof pending !== "object") return null;

  const viewer = (viewerEthereumAddress || "").toLowerCase();
  const seller = String(pending.sellerAccount || "").toLowerCase();
  const buyer = String(pending.buyerAccount || "").toLowerCase();
  const canFinalize = Boolean(viewer && seller && viewer === seller);
  const isBuyer = Boolean(viewer && buyer && viewer === buyer);
  const settleRunId =
    typeof meta.settleRunId === "string"
      ? meta.settleRunId
      : typeof detail.id === "string"
        ? detail.id
        : "";

  if (!settleRunId) return null;

  return (
    <PacksActivityDetailPayout
      settleRunId={settleRunId}
      pendingPayout={pending}
      canFinalize={canFinalize}
      isBuyer={isBuyer}
      entitledPatchSummary={
        typeof meta.entitledPatchSummary === "string"
          ? meta.entitledPatchSummary
          : typeof pending.patchSummary === "string"
            ? pending.patchSummary
            : null
      }
      onFinalized={onPayoutFinalized}
    />
  );
}

export function PacksActivityDetail({
  detail,
  layout = "full",
  viewerEthereumAddress = null,
  onPayoutFinalized,
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
          <PayoutFromDetail
            detail={detail}
            viewerEthereumAddress={viewerEthereumAddress}
            onPayoutFinalized={onPayoutFinalized}
          />
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
