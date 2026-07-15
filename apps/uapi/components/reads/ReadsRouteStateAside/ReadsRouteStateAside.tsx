'use client';

/**
 * Reading route state band — Session / Governance / Procurement only.
 * Full-width row under compose (laptop: 1×3). Measurement, settlement, and
 * pack activity review live on AssetPack options, matching Deposits.
 */

import React from "react";
import { Clock3, Wallet } from "lucide-react";
import {
  ProductRouteDisclosure,
  ProductRouteProofDetail,
} from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import type { ReadRouteSession } from "@/components/reads/models/read-route-model";
import type { ReadLabelValueRow } from "@/components/reads/models/read-route-rows";
import { ReadsAsideRowsSection } from "@/components/reads/ReadsAsideRowsSection/ReadsAsideRowsSection";

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
    <aside
      // Full-width band under compose: one row, three equal panels on laptop+.
      className="grid h-fit min-w-0 items-start gap-4 phone:gap-5 laptop:grid-cols-3"
      aria-label="Reading route state"
    >
      <ReadsAsideRowsSection
        kicker="Session"
        title="Source-safe read state"
        rows={sessionRows}
      >
        <div className="mt-3">
          <ProductRouteDisclosure title="Disclosure boundary" tone="orange">
            Visible: Need measurements, fit ids, proof roots, fee quotes,
            settlement readback, delivery posture. Withheld until paid rights:
            source-bearing AssetPack contents.
          </ProductRouteDisclosure>
        </div>
        <div className="mt-3">
          <ProductRouteProofDetail
            testId="read-expandable-proof-detail"
            title="Reading proof detail"
            tone="orange"
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
                root: readRouteSession.fitMeasurementReview.quoteBasis
                  .basisRoot,
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
      </ReadsAsideRowsSection>

      <ReadsAsideRowsSection
        kicker="Governance"
        title="Organization authority"
        rows={authorityRows}
      >
        <div className="mt-3">
          {readRouteSession.organizationPolicyWalletAuthority.aggregate.blockers
            .length ? (
            <ProductRouteDisclosure title="Authority blockers" tone="orange">
              {readRouteSession.organizationPolicyWalletAuthority.aggregate.blockers.join(
                "; ",
              )}
            </ProductRouteDisclosure>
          ) : (
            <ProductRouteDisclosure
              title="Authority blockers"
              tone="orange"
              empty
            />
          )}
        </div>
      </ReadsAsideRowsSection>

      <ReadsAsideRowsSection
        kicker="Procurement"
        title="Budget and quote"
        rows={procurementRows}
      >
        <div className="mt-4 grid gap-2 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Clock3
              className="h-3.5 w-3.5 text-orange-200"
              aria-hidden="true"
            />
            <span>
              {readRouteSession.procurementGovernance.quotePolicy.state.replace(
                /-/g,
                " ",
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet
              className="h-3.5 w-3.5 text-orange-200"
              aria-hidden="true"
            />
            <span>
              {readRouteSession.procurementGovernance.approval
                .walletAuthorityPresent
                ? "wallet authority present"
                : "wallet authority pending"}
            </span>
          </div>
        </div>
        <div className="mt-3">
          {readRouteSession.procurementGovernance.settlement.blockers
            .length ? (
            <ProductRouteDisclosure
              title="Procurement blockers"
              tone="orange"
            >
              {readRouteSession.procurementGovernance.settlement.blockers.join(
                "; ",
              )}
            </ProductRouteDisclosure>
          ) : (
            <ProductRouteDisclosure
              title="Procurement blockers"
              tone="orange"
              empty
            />
          )}
        </div>
      </ReadsAsideRowsSection>
    </aside>
  );
}
