"use client";

/**
 * Purchase flow scaffold on Exchange DataPack detail.
 *
 * Hardens the path: market discovery on /exchange → purchase decision →
 * /reads settle (BTC/ETH rails, BTD rights) → entitled delivery readback.
 *
 * Does not invent settlement; links into the existing Read settle path with
 * optional synthesis/run context when present.
 */

import React from "react";
import { ExchangeDetailSection } from "@/components/exchange/ExchangeDetailSection/ExchangeDetailSection";

export type ExchangeActivityDetailPurchaseProps = {
  activityId?: string | null;
  title?: string | null;
  commercialTitle?: string | null;
  commercialDescription?: string | null;
  summary?: string | null;
  settlementState?: string | null;
  rightsState?: string | null;
  synthesisRunId?: string | null;
  optionIndex?: number | null;
  viewerRole?: string | null;
  isDepositor?: boolean;
  isSettledBuyer?: boolean;
};

function isSettledState(state?: string | null): boolean {
  const s = String(state || "").toLowerCase();
  return s.includes("settled") || s === "finalized" || s.includes("delivered");
}

export function ExchangeActivityDetailPurchase({
  activityId,
  title,
  commercialTitle,
  commercialDescription,
  summary,
  settlementState,
  rightsState,
  synthesisRunId,
  optionIndex,
  viewerRole,
  isDepositor = false,
  isSettledBuyer = false,
}: ExchangeActivityDetailPurchaseProps) {
  const settled = isSettledState(settlementState) || isSettledBuyer;
  const displayTitle = commercialTitle || title || "DataPack";
  const displayDescription =
    commercialDescription ||
    summary ||
    "Source-safe commercial brief for purchase consideration.";

  const readHref = (() => {
    const params = new URLSearchParams();
    params.set("intent", "purchase");
    if (activityId) params.set("exchangeActivityId", activityId);
    if (synthesisRunId) params.set("synthesisRunId", synthesisRunId);
    if (optionIndex != null && Number.isFinite(optionIndex)) {
      params.set("selectedIndex", String(optionIndex));
    }
    if (title) params.set("packTitle", title.slice(0, 120));
    return `/reads?${params.toString()}`;
  })();

  if (isDepositor) {
    return (
      <div data-testid="exchange-purchase-depositor">
        <ExchangeDetailSection title="Purchase">
          <p className="text-sm leading-6 text-neutral-300">
            You are the depositor for this DataPack. Full .patch material is available
            under depositor rights. Buyers purchase via Read settle; compensation and
            BTD rights transfer appear after settlement finality.
          </p>
          <p className="mt-2 text-[0.7rem] text-neutral-500">
            Rights state: {rightsState || "depositor-owned"} · Settlement:{" "}
            {settlementState || "unsettled supply"}
          </p>
        </ExchangeDetailSection>
      </div>
    );
  }

  if (settled) {
    return (
      <div data-testid="exchange-purchase-settled">
        <ExchangeDetailSection title="Purchase">
          <p className="text-sm leading-6 text-emerald-100/90">
            Settlement complete for this viewer. Entitled delivery and .patch download
            are available under post-settled purchaser rights.
          </p>
          <p className="mt-2 text-[0.7rem] text-neutral-500">
            Settlement: {settlementState || "settled"} · Rights:{" "}
            {rightsState || "btd-rights-transferred"}
          </p>
        </ExchangeDetailSection>
      </div>
    );
  }

  return (
    <div data-testid="exchange-purchase-cta">
      <ExchangeDetailSection title="Purchase">
        <div className="grid gap-3">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
              Commercial brief
            </p>
            <h3 className="mt-1 text-base font-medium text-white">{displayTitle}</h3>
            <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-neutral-300">
              {displayDescription}
            </p>
          </div>
          <p className="text-[0.72rem] leading-5 text-neutral-400">
            Purchase settles money (BTC/ETH testnet rails) then transfers BTD volume
            and rights. Protected .patch bodies unlock only after finality. Continue on
            Read to quote and settle this DataPack.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={readHref}
              data-testid="exchange-purchase-continue-reads"
              className="inline-flex border border-emerald-300/40 bg-emerald-400/15 px-4 py-2 text-sm font-medium text-emerald-50 transition hover:border-emerald-200/55 hover:bg-emerald-300/20"
            >
              Continue to Read · quote &amp; settle
            </a>
            {viewerRole ? (
              <span className="text-[0.65rem] text-neutral-500">
                Viewer role: {viewerRole}
              </span>
            ) : null}
          </div>
        </div>
      </ExchangeDetailSection>
    </div>
  );
}
