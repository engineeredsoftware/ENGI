/**
 * Packs detail governance / authority readback panel.
 */
"use client";

import React from "react";
import type { PackActivityDetailProjection } from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import { PacksDetailSection } from "@/components/packs/PacksDetailSection/PacksDetailSection";

export type PacksActivityDetailGovernanceProps = {
  governance: NonNullable<PackActivityDetailProjection["governance"]>;
};

export function PacksActivityDetailGovernance({
  governance,
}: PacksActivityDetailGovernanceProps) {
  return (
    <PacksDetailSection title="Governance">
      <dl className="grid gap-3 text-sm tablet:grid-cols-2">
        <div>
          <dt className="text-neutral-500">Authority</dt>
          <dd className="mt-1 text-neutral-100">
            {governance.state || "not recorded"}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Route</dt>
          <dd className="mt-1 text-neutral-100">
            {governance.route || "not recorded"}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Wallet</dt>
          <dd className="mt-1 text-neutral-100">
            {governance.walletState || "not recorded"}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Spend</dt>
          <dd className="mt-1 text-neutral-100">
            {governance.spendState || "not recorded"}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Deposit</dt>
          <dd className="mt-1 text-neutral-100">
            {governance.depositState || "not recorded"}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Required denials</dt>
          <dd className="mt-1 font-mono text-neutral-100">
            {governance.requiredDeniedActionCount}
          </dd>
        </div>
        {governance.authorityRoot && (
          <div className="tablet:col-span-2">
            <dt className="text-neutral-500">Authority root</dt>
            <dd className="mt-1 break-all font-mono text-xs text-emerald-100">
              {governance.authorityRoot}
            </dd>
          </div>
        )}
      </dl>
    </PacksDetailSection>
  );
}
