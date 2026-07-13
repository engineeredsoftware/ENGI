/**
 * 3×3 action-pad icon grid for marketplace surface labels.
 */
"use client";

import React from "react";
import {
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  RocketLaunchIcon,
  ArrowsUpDownIcon,
  CodeBracketIcon,
  ClipboardDocumentListIcon,
  PuzzlePieceIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { MARKETPLACE_ACTION_PAD } from "./marketing-marketplace-data";

const ICON_MAP = {
  wrench: WrenchScrewdriverIcon,
  rocket: RocketLaunchIcon,
  code: CodeBracketIcon,
  clipboard: ClipboardDocumentListIcon,
  path: ArrowPathIcon,
  currency: CurrencyDollarIcon,
  banknotes: BanknotesIcon,
  arrows: ArrowsUpDownIcon,
  puzzle: PuzzlePieceIcon,
} as const;

export function MarketingMarketplaceActionPad() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {MARKETPLACE_ACTION_PAD.map(({ label, iconKey }) => {
        const IconC = ICON_MAP[iconKey];
        return (
          <div
            key={label}
            className="flex flex-col items-center gap-1 bg-white/5 rounded-md py-2 px-1 select-none"
          >
            <div className="flex items-center justify-center w-8 h-8 tablet:w-10 tablet:h-10 rounded-md bg-black/50 text-emerald-300 shadow-inner shadow-black/30">
              <IconC className="h-4 w-4 tablet:h-5 tablet:w-5" />
            </div>
            <span className="text-[0.6rem] tablet:text-[0.7rem] laptop:text-xs leading-snug text-gray-200">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
