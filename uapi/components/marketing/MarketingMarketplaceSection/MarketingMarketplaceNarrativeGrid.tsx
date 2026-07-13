'use client';

/**
 * 2×2 narrative card grid describing marketplace value props.
 */

import React from "react";
import {
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  ChartBarIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { MARKETPLACE_NARRATIVE_CARDS } from "./marketing-marketplace-data";

const ICON_MAP = {
  trending: ArrowTrendingUpIcon,
  globe: GlobeAltIcon,
  banknotes: BanknotesIcon,
  chart: ChartBarIcon,
} as const;

export function MarketingMarketplaceNarrativeGrid() {
  return (
    <div className="relative grid grid-cols-2 grid-rows-2 gap-3 h-full self-stretch">
      {MARKETPLACE_NARRATIVE_CARDS.map(({ iconKey, title, body }) => {
        const IconC = ICON_MAP[iconKey];
        return (
          <div
            key={title}
            className="flex flex-col p-4 bg-black/30 backdrop-blur-md border border-emerald-400/20 rounded-lg shadow-md select-none h-full pr-3"
          >
            <div className="flex items-center gap-2">
              <IconC className="h-5 w-5 text-emerald-300 shrink-0" />
              <span className="text-base text-white font-medium leading-tight">
                {title}
              </span>
            </div>
            <span className="text-emerald-200 text-sm leading-snug mt-1">{body}</span>
          </div>
        );
      })}
    </div>
  );
}
