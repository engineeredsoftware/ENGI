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
          {detail.deliveryReference ? (
            <div className="mt-1 border border-white/10 bg-black/18 px-3 py-2 text-xs">
              <p className="text-[0.66rem] uppercase tracking-[0.16em] text-neutral-500">
                Delivery reference
              </p>
              {/^https?:\/\//u.test(detail.deliveryReference) ? (
                <a
                  href={detail.deliveryReference}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="packs-delivery-reference-link"
                  className="mt-1 block break-all font-mono text-emerald-200/90 underline-offset-2 hover:underline"
                >
                  {detail.deliveryReference}
                </a>
              ) : (
                <p
                  data-testid="packs-delivery-reference"
                  className="mt-1 break-all font-mono text-neutral-200"
                >
                  {detail.deliveryReference}
                </p>
              )}
            </div>
          ) : null}
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
