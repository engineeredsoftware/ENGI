/**
 * Marquee ticker tape of marketplace listings.
 */
"use client";

import React from "react";
import type { Listing } from "./marketing-marketplace-data";
import { MarketingMarketplaceTechIcon as TechIcon } from "./MarketingMarketplaceTechIcon";

export interface MarketingMarketplaceTickerProps {
  listings: Listing[];
  className: string;
}

export function MarketingMarketplaceTicker({
  listings,
  className,
}: MarketingMarketplaceTickerProps) {
  const tickerListings = listings.slice(0, 10).flatMap((l) => [l, l]);

  return (
    <div className={className}>
      <div
        className="whitespace-nowrap flex gap-12 px-8 py-2 will-change-transform text-sm tablet:text-base"
        style={{ animation: "marketplace-ticker 40s linear infinite" }}
      >
        {tickerListings.map((l, i) => (
          <div key={i} className="inline-flex items-center gap-2">
            <span
              className={
                l.side === "buy"
                  ? "text-green-400 font-semibold"
                  : "text-red-400 font-semibold"
              }
            >
              {l.side.toUpperCase()}
            </span>
            <span className="opacity-85">{l.title}</span>
            <span className="flex items-center gap-1">
              {l.tech.map((t, j) => (
                <TechIcon key={j} tech={t} />
              ))}
            </span>
            <span className="text-blue-300 font-semibold">${l.price}</span>
            <span className="text-teal-300 font-semibold">
              {l.measuredBtd.toLocaleString()} $BTD
            </span>
            <span className="opacity-85">Avail:{l.available}</span>
            <span className="text-orange-400 font-semibold">
              {(l.measure / 100).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
