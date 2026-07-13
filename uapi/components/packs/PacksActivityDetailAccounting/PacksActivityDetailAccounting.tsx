/**
 * Packs detail accounting readback (BTD/BTC, allocation, statement root).
 */
"use client";

import React from "react";
import type { PackActivityDetailProjection } from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import { formatSats } from "@/components/packs/models/packs-format";
import { PacksDetailSection } from "@/components/packs/PacksDetailSection/PacksDetailSection";

export type PacksActivityDetailAccountingProps = {
  accounting: NonNullable<PackActivityDetailProjection["accounting"]>;
};

export function PacksActivityDetailAccounting({
  accounting,
}: PacksActivityDetailAccountingProps) {
  return (
    <PacksDetailSection title="Accounting">
      <dl className="grid gap-3 text-sm tablet:grid-cols-2">
        <div>
          <dt className="text-neutral-500">BTD/BTC state</dt>
          <dd className="mt-1 text-neutral-100">
            {accounting.state || "not recorded"}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">BTD range</dt>
          <dd className="mt-1 text-neutral-100">
            {accounting.btdRangeState || "not recorded"}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">BTC settlement</dt>
          <dd className="mt-1 text-neutral-100">
            {accounting.btcSettlementState || "not recorded"}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Treasury route</dt>
          <dd className="mt-1 text-neutral-100">
            {accounting.treasuryRouteState || "not recorded"}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Contributors</dt>
          <dd className="mt-1 font-mono text-neutral-100">
            {accounting.contributorCount}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Allocated</dt>
          <dd className="mt-1 font-mono text-neutral-100">
            {formatSats(accounting.allocatedContributorSats)}
          </dd>
        </div>
        {accounting.statementRoot && (
          <div className="tablet:col-span-2">
            <dt className="text-neutral-500">Accounting root</dt>
            <dd className="mt-1 break-all font-mono text-xs text-emerald-100">
              {accounting.statementRoot}
            </dd>
          </div>
        )}
      </dl>
    </PacksDetailSection>
  );
}
