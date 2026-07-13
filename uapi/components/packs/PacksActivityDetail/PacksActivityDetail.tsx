/**
 * Packs detail aside: source-safe overview, measurements, states, accounting,
 * governance, and proof roots for the selected PackActivity row.
 */
"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import {
  ProductRouteProofDetail,
  ProductRouteStatePanel,
} from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import type { PackActivityDetailProjection } from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import {
  formatSats,
  formatTimestamp,
  formatType,
  statusPill,
} from "@/components/packs/models/packs-format";
import { PacksDetailSection as DetailSection } from "@/components/packs/PacksDetailSection/PacksDetailSection";

export type PacksActivityDetailProps = {
  detail: PackActivityDetailProjection | null;
};

export function PacksActivityDetail({ detail }: PacksActivityDetailProps) {
  if (!detail) {
    return (
      <aside className="min-w-0 border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-5">
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

  return (
    <aside className="min-w-0 border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-5">
      <div className="grid gap-5">
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

        <DetailSection title="Overview">
          <dl className="grid gap-3 text-sm tablet:grid-cols-2">
            <div>
              <dt className="text-neutral-500">Type</dt>
              <dd className="mt-1 text-neutral-100">
                {formatType(detail.type)}
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
          </dl>
        </DetailSection>

        <DetailSection title="Measurements">
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
        </DetailSection>

        <DetailSection title="State readback">
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              {statusPill(detail.states.settlement, "settlement not recorded")}
            </div>
            <div className="flex items-center justify-between gap-3">
              {statusPill(detail.states.rights, "BTD rights not recorded")}
            </div>
            <div className="flex items-center justify-between gap-3">
              {statusPill(
                detail.states.compensation,
                "compensation not recorded",
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              {statusPill(detail.states.delivery, "delivery not recorded")}
            </div>
            <div className="flex items-center justify-between gap-3">
              {statusPill(detail.states.repair, "repair not recorded")}
            </div>
          </div>
        </DetailSection>

        {detail.commodityState?.repairRequired ||
        detail.commodityState?.blockers?.length ? (
          <DetailSection title="Repair surface">
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                {statusPill(
                  detail.states.repair || "repair-required",
                  "repair posture pending",
                )}
              </div>
              <ul className="grid gap-1 text-xs text-neutral-400">
                {(detail.commodityState?.blockers || []).map((blocker) => (
                  <li key={blocker} className="break-words">
                    {blocker}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-neutral-500">
                State advances only through proof-backed readback; repair fails
                closed until the missing or contradictory evidence above is
                reconciled.
              </p>
            </div>
          </DetailSection>
        ) : null}

        {detail.accounting && (
          <DetailSection title="Accounting">
            <dl className="grid gap-3 text-sm tablet:grid-cols-2">
              <div>
                <dt className="text-neutral-500">BTD/BTC state</dt>
                <dd className="mt-1 text-neutral-100">
                  {detail.accounting.state || "not recorded"}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">BTD range</dt>
                <dd className="mt-1 text-neutral-100">
                  {detail.accounting.btdRangeState || "not recorded"}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">BTC settlement</dt>
                <dd className="mt-1 text-neutral-100">
                  {detail.accounting.btcSettlementState || "not recorded"}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Treasury route</dt>
                <dd className="mt-1 text-neutral-100">
                  {detail.accounting.treasuryRouteState || "not recorded"}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Contributors</dt>
                <dd className="mt-1 font-mono text-neutral-100">
                  {detail.accounting.contributorCount}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Allocated</dt>
                <dd className="mt-1 font-mono text-neutral-100">
                  {formatSats(detail.accounting.allocatedContributorSats)}
                </dd>
              </div>
              {detail.accounting.statementRoot && (
                <div className="tablet:col-span-2">
                  <dt className="text-neutral-500">Accounting root</dt>
                  <dd className="mt-1 break-all font-mono text-xs text-emerald-100">
                    {detail.accounting.statementRoot}
                  </dd>
                </div>
              )}
            </dl>
          </DetailSection>
        )}

        {detail.governance && (
          <DetailSection title="Governance">
            <dl className="grid gap-3 text-sm tablet:grid-cols-2">
              <div>
                <dt className="text-neutral-500">Authority</dt>
                <dd className="mt-1 text-neutral-100">
                  {detail.governance.state || "not recorded"}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Route</dt>
                <dd className="mt-1 text-neutral-100">
                  {detail.governance.route || "not recorded"}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Wallet</dt>
                <dd className="mt-1 text-neutral-100">
                  {detail.governance.walletState || "not recorded"}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Spend</dt>
                <dd className="mt-1 text-neutral-100">
                  {detail.governance.spendState || "not recorded"}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Deposit</dt>
                <dd className="mt-1 text-neutral-100">
                  {detail.governance.depositState || "not recorded"}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Required denials</dt>
                <dd className="mt-1 font-mono text-neutral-100">
                  {detail.governance.requiredDeniedActionCount}
                </dd>
              </div>
              {detail.governance.authorityRoot && (
                <div className="tablet:col-span-2">
                  <dt className="text-neutral-500">Authority root</dt>
                  <dd className="mt-1 break-all font-mono text-xs text-emerald-100">
                    {detail.governance.authorityRoot}
                  </dd>
                </div>
              )}
            </dl>
          </DetailSection>
        )}

        <DetailSection title="Proof roots">
          <ProductRouteProofDetail
            testId="packs-expandable-proof-detail"
            title="Expandable proof detail"
            tone="emerald"
            defaultOpen
            roots={[
              ...detail.proofRoots.map((proofRoot) => ({
                id: proofRoot.id,
                label: proofRoot.label,
                root: proofRoot.root,
              })),
              {
                id: "accounting-root",
                label: "Accounting root",
                root: detail.accounting?.statementRoot,
              },
              {
                id: "authority-root",
                label: "Authority root",
                root: detail.governance?.authorityRoot,
              },
            ]}
          />
        </DetailSection>
      </div>
    </aside>
  );
}
