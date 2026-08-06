'use client';

/**
 * Packs detail expandable proof-root list (activity + accounting + authority).
 */

import React from "react";
import { ProductRouteProofDetail } from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import type { PackActivityDetailProjection } from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import { ExchangeDetailSection } from "@/components/exchange/ExchangeDetailSection/ExchangeDetailSection";

export type ExchangeActivityDetailProofRootsProps = {
  detail: PackActivityDetailProjection;
};

export function ExchangeActivityDetailProofRoots({
  detail,
}: ExchangeActivityDetailProofRootsProps) {
  return (
    <ExchangeDetailSection title="Proof roots">
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
    </ExchangeDetailSection>
  );
}
