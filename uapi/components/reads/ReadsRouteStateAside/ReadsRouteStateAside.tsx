'use client';

/**
 * Reading route state aside — session, authority, procurement, measurement,
 * settlement, and pack-activity panels. Presentational only.
 */

import React from "react";
import Link from "next/link";
import {
  BadgeDollarSign,
  Clock3,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  ProductRouteDisclosure,
  ProductRouteKeyboardHint,
  ProductRouteProofDetail,
  ProductRouteStatePanel,
} from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import { formatSats } from "@/components/reads/models/read-format";
import type { ReadRouteSession } from "@/components/reads/models/read-route-model";
import type { ReadLabelValueRow } from "@/components/reads/models/read-route-rows";

export type ReadsRouteStateAsideProps = {
  readRouteSession: ReadRouteSession;
  sessionRows: readonly ReadLabelValueRow[];
  authorityRows: readonly ReadLabelValueRow[];
  procurementRows: readonly ReadLabelValueRow[];
};

export function ReadsRouteStateAside({
  readRouteSession,
  sessionRows,
  authorityRows,
  procurementRows,
}: ReadsRouteStateAsideProps) {
  return (
    <aside className="grid h-fit gap-5" aria-label="Reading route state">
      <ProductRouteKeyboardHint
        testId="read-keyboard-navigation"
        tone="sky"
        shortcuts={[
          {
            keys: "Tab",
            label: "Move through the five Reading steps and source controls.",
          },
          {
            keys: "Enter",
            label: "Activate the focused step, refresh, or route action.",
          },
          {
            keys: "Space",
            label: "Open or close source-safe proof detail.",
          },
        ]}
      />

      <section className="border border-white/10 bg-white/[0.035] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-sky-200/80">
              Session
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Source-safe read state
            </h2>
          </div>
          <ShieldCheck className="h-5 w-5 text-emerald-200" aria-hidden="true" />
        </div>
        <dl className="mt-4 grid gap-2">
          {sessionRows.map((row) => (
            <div
              key={row.label}
              className="border border-white/8 bg-black/20 px-3 py-2"
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
        <div className="mt-3">
          <ProductRouteDisclosure title="Disclosure boundary" tone="sky">
            Visible: Need measurements, fit ids, proof roots, fee quotes,
            settlement readback, delivery posture. Withheld until paid rights:
            source-bearing AssetPack contents.
          </ProductRouteDisclosure>
        </div>
        <div className="mt-3">
          <ProductRouteProofDetail
            testId="read-expandable-proof-detail"
            title="Reading proof detail"
            tone="sky"
            roots={[
              {
                id: "route-session-root",
                label: "Route session root",
                root: readRouteSession.proofRoot,
              },
              {
                id: "budget-policy-root",
                label: "Budget policy root",
                root: readRouteSession.procurementGovernance.budgetPolicy
                  .policyRoot,
              },
              {
                id: "quote-root",
                label: "Quote root",
                root: readRouteSession.procurementGovernance.quotePolicy
                  .quoteRoot,
              },
              {
                id: "settlement-readiness-root",
                label: "Settlement readiness root",
                root: readRouteSession.procurementGovernance.settlement
                  .readinessRoot,
              },
              {
                id: "fit-measurement-review-root",
                label: "Fit measurement review root",
                root: readRouteSession.fitMeasurementReview.reviewRoot,
              },
              {
                id: "quote-basis-root",
                label: "Quote basis root",
                root: readRouteSession.fitMeasurementReview.quoteBasis.basisRoot,
              },
              {
                id: "rights-receipt-root",
                label: "BTD rights receipt root",
                root: readRouteSession.settlementRightsDelivery.btdRights
                  .rightsReceiptRoot,
              },
              {
                id: "delivery-receipt-root",
                label: "Delivery receipt root",
                root: readRouteSession.settlementRightsDelivery.delivery
                  .deliveryReceiptRoot,
              },
              {
                id: "authority-root",
                label: "Authority root",
                root: readRouteSession.organizationPolicyWalletAuthority.roots
                  .authorityRoot,
              },
            ]}
          />
        </div>
      </section>

      <section className="border border-white/10 bg-white/[0.035] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-sky-200/80">
              Governance
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Organization authority
            </h2>
          </div>
          <ShieldCheck className="h-5 w-5 text-sky-200" aria-hidden="true" />
        </div>
        <dl className="mt-4 grid gap-2">
          {authorityRows.map((row) => (
            <div
              key={row.label}
              className="border border-white/8 bg-black/20 px-3 py-2"
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
        {readRouteSession.organizationPolicyWalletAuthority.aggregate.blockers
          .length ? (
          <div className="mt-3">
            <ProductRouteDisclosure title="Authority blockers" tone="sky">
              {readRouteSession.organizationPolicyWalletAuthority.aggregate.blockers.join(
                "; ",
              )}
            </ProductRouteDisclosure>
          </div>
        ) : null}
      </section>

      <section className="border border-white/10 bg-white/[0.035] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-sky-200/80">
              Procurement
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Budget and quote
            </h2>
          </div>
          <BadgeDollarSign
            className="h-5 w-5 text-emerald-200"
            aria-hidden="true"
          />
        </div>
        <dl className="mt-4 grid gap-2">
          {procurementRows.map((row) => (
            <div
              key={row.label}
              className="border border-white/8 bg-black/20 px-3 py-2"
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
        <div className="mt-4 grid gap-2 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Clock3 className="h-3.5 w-3.5 text-sky-200" aria-hidden="true" />
            <span>
              {readRouteSession.procurementGovernance.quotePolicy.state.replace(
                /-/g,
                " ",
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="h-3.5 w-3.5 text-sky-200" aria-hidden="true" />
            <span>
              {readRouteSession.procurementGovernance.approval
                .walletAuthorityPresent
                ? "wallet authority present"
                : "wallet authority pending"}
            </span>
          </div>
        </div>
        {readRouteSession.procurementGovernance.settlement.blockers.length ? (
          <div className="mt-3">
            <ProductRouteDisclosure title="Procurement blockers" tone="sky">
              {readRouteSession.procurementGovernance.settlement.blockers.join(
                "; ",
              )}
            </ProductRouteDisclosure>
          </div>
        ) : null}
      </section>

      <section className="border border-white/10 bg-white/[0.035] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-sky-200/80">
              Measurement
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Fit measurement review
            </h2>
          </div>
          <ShieldCheck className="h-5 w-5 text-emerald-200" aria-hidden="true" />
        </div>
        <p className="mt-2 text-xs text-neutral-400">
          Source-safe Need-relative measurements decide the BTC-testnet quote
          before any payment. No measurement, no price.
        </p>
        {readRouteSession.fitMeasurementReview.visible ? (
          <>
            <dl className="mt-4 grid grid-cols-2 gap-2">
              {readRouteSession.fitMeasurementReview.measurements.map(
                (measurement) => (
                  <div
                    key={measurement.measurementId}
                    className="border border-white/8 bg-black/20 px-3 py-2"
                  >
                    <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                      {measurement.label}
                    </dt>
                    <dd className="mt-1 text-sm text-neutral-200">
                      {(measurement.measurementVolume * 100).toFixed(0)}% /
                      weight {measurement.weight.toFixed(2)}
                    </dd>
                  </div>
                ),
              )}
            </dl>
            <dl className="mt-2 grid gap-2">
              <div className="border border-white/8 bg-black/20 px-3 py-2">
                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                  Final BTD scalar
                </dt>
                <dd className="mt-1 text-sm text-neutral-200">
                  {readRouteSession.fitMeasurementReview.btdScalarVolume} BTD
                  knowledge-volume
                </dd>
              </div>
              <div className="border border-white/8 bg-black/20 px-3 py-2">
                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                  Quote basis
                </dt>
                <dd className="mt-1 text-sm text-neutral-200">
                  {formatSats(
                    readRouteSession.fitMeasurementReview.quoteBasis.grossSats,
                  )}{" "}
                  on {readRouteSession.fitMeasurementReview.quoteBasis.network}
                </dd>
              </div>
              <div className="border border-white/8 bg-black/20 px-3 py-2">
                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                  Selected Fit provenance
                </dt>
                <dd className="mt-1 break-words font-mono text-[0.68rem] text-neutral-200">
                  {
                    readRouteSession.fitMeasurementReview.selectedFitProvenance
                      .depositoryAssetPackCount
                  }{" "}
                  Depository AssetPack fit(s) /{" "}
                  {
                    readRouteSession.fitMeasurementReview.selectedFitProvenance
                      .provenanceRoot
                  }
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <div className="mt-4">
            <ProductRouteStatePanel
              compact
              variant="empty"
              title="Measurement review pending"
              message={
                readRouteSession.fitMeasurementReview.repairBlockers.join(
                  "; ",
                ) || "Accept a Need and request Finding Fits first."
              }
            />
          </div>
        )}
      </section>

      <section className="border border-white/10 bg-white/[0.035] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-sky-200/80">
              Settlement
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Settlement, rights, and delivery
            </h2>
          </div>
          <Wallet className="h-5 w-5 text-emerald-200" aria-hidden="true" />
        </div>
        <p className="mt-2 text-xs text-neutral-400">
          BTC-testnet finality precedes BTD rights; BTD rights precede
          source-bearing repository delivery.
        </p>
        <dl className="mt-4 grid gap-2">
          <div className="border border-white/8 bg-black/20 px-3 py-2">
            <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
              Payment observation
            </dt>
            <dd className="mt-1 text-sm text-neutral-200">
              {readRouteSession.settlementRightsDelivery.paymentObservation.state.replace(
                /-/g,
                " ",
              )}
            </dd>
          </div>
          <div className="border border-white/8 bg-black/20 px-3 py-2">
            <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
              Finality
            </dt>
            <dd className="mt-1 text-sm text-neutral-200">
              {readRouteSession.settlementRightsDelivery.finality.state.replace(
                /-/g,
                " ",
              )}
            </dd>
          </div>
          <div className="border border-white/8 bg-black/20 px-3 py-2">
            <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
              BTD rights receipt
            </dt>
            <dd className="mt-1 break-words font-mono text-[0.68rem] text-neutral-200">
              {readRouteSession.settlementRightsDelivery.btdRights.state.replace(
                /-/g,
                " ",
              )}{" "}
              /{" "}
              {
                readRouteSession.settlementRightsDelivery.btdRights
                  .rightsReceiptRoot
              }
            </dd>
          </div>
          <div className="border border-white/8 bg-black/20 px-3 py-2">
            <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
              Repository PR delivery
            </dt>
            <dd className="mt-1 break-words font-mono text-[0.68rem] text-neutral-200">
              {readRouteSession.settlementRightsDelivery.delivery.state.replace(
                /-/g,
                " ",
              )}
              {readRouteSession.settlementRightsDelivery.delivery
                .pullRequestReference
                ? ` / ${readRouteSession.settlementRightsDelivery.delivery.pullRequestReference}`
                : ""}
            </dd>
          </div>
        </dl>
        {readRouteSession.settlementRightsDelivery.blockers.length ? (
          <div className="mt-3">
            <ProductRouteDisclosure title="Settlement blockers" tone="sky">
              {readRouteSession.settlementRightsDelivery.blockers.join("; ")}
            </ProductRouteDisclosure>
          </div>
        ) : null}
        <Link
          href="/packs?type=settled-assetpack"
          className="mt-4 inline-flex w-full items-center justify-center border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-200/40 hover:bg-emerald-300/15"
        >
          Open settled pack activity
        </Link>
      </section>

      <section className="border border-white/10 bg-white/[0.035] px-4 py-4">
        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-neutral-500">
          Readback
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white">Pack activity</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Pipeline runs live in the Read pipelines table above; settled and
          previewed packs read back on the packs surface.
        </p>
        <Link
          href="/packs?type=read-need-fit-preview"
          className="mt-3 inline-flex w-full items-center justify-center border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-200/40 hover:bg-emerald-300/15"
        >
          Open pack activity
        </Link>
      </section>
    </aside>
  );
}
