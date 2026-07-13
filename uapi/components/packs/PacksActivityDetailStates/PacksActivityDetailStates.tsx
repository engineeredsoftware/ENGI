'use client';

/**
 * Packs detail state readback + conditional repair surface.
 */

import React from "react";
import type { PackActivityDetailProjection } from "@/components/bitcode/activity/PackActivityModel/pack-activity-model";
import { PacksDetailSection } from "@/components/packs/PacksDetailSection/PacksDetailSection";
import { PacksStatusPill } from "@/components/packs/PacksStatusPill/PacksStatusPill";

export type PacksActivityDetailStatesProps = {
  detail: PackActivityDetailProjection;
};

export function PacksActivityDetailStates({
  detail,
}: PacksActivityDetailStatesProps) {
  const showRepair =
    Boolean(detail.commodityState?.repairRequired) ||
    Boolean(detail.commodityState?.blockers?.length);

  return (
    <>
      <PacksDetailSection title="State readback">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <PacksStatusPill
              value={detail.states.settlement}
              fallback="settlement not recorded"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <PacksStatusPill
              value={detail.states.rights}
              fallback="BTD rights not recorded"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <PacksStatusPill
              value={detail.states.compensation}
              fallback="compensation not recorded"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <PacksStatusPill
              value={detail.states.delivery}
              fallback="delivery not recorded"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <PacksStatusPill
              value={detail.states.repair}
              fallback="repair not recorded"
            />
          </div>
        </div>
      </PacksDetailSection>

      {showRepair ? (
        <PacksDetailSection title="Repair surface">
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <PacksStatusPill
                value={detail.states.repair || "repair-required"}
                fallback="repair posture pending"
              />
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
        </PacksDetailSection>
      ) : null}
    </>
  );
}
