'use client';

/**
 * Animated candlestick chart overlay for the marketplace section backdrop.
 */

import React, { useMemo } from "react";
import {
  generateCandles,
  MARKETPLACE_COLORS,
  type Candle,
} from "./marketing-marketplace-data";

export function MarketingMarketplaceCandles() {
  const candles: Candle[] = useMemo(() => generateCandles(70), []);

  return (
    <div className="absolute top-[-20%] left-0 w-full h-[140%] -z-28 pointer-events-none overflow-hidden">
      {candles.map((c) => (
        <React.Fragment key={c.id}>
          <span
            style={{
              position: "absolute",
              top: c.wickTop,
              left: `calc(${c.left} + 3px)`,
              width: "2px",
              height: c.wickHeight,
              backgroundColor: c.bullish
                ? MARKETPLACE_COLORS.bullish.wick
                : MARKETPLACE_COLORS.bearish.wick,
              transformOrigin: "center",
              animation: `candle-breathe ${c.duration} ease-in-out ${c.delay} infinite alternate`,
            }}
          />
          <span
            style={{
              position: "absolute",
              top: c.bodyTop,
              left: c.left,
              width: "8px",
              height: c.bodyHeight,
              borderRadius: "2px",
              backgroundColor: c.bullish
                ? MARKETPLACE_COLORS.bullish.body
                : MARKETPLACE_COLORS.bearish.body,
              transformOrigin: "center",
              animation: `candle-breathe ${c.duration} ease-in-out ${c.delay} infinite alternate`,
            }}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
