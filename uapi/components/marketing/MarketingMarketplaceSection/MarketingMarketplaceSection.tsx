/* eslint-disable react/no-multi-comp */

"use client";

/**
 * Live marketplace ticker section shell for marketing.
 * Order book, detail card, ticker, candles, and narrative grids are co-located.
 */

import React, { useEffect, useRef, useState } from "react";
import "./marketing-marketplace-section.module.css";
import {
  generateListing,
  EXAMPLE_LISTINGS,
  type Listing,
} from "./marketing-marketplace-data";
import { MarketingMarketplaceCandles } from "./MarketingMarketplaceCandles";
import { MarketingMarketplaceTicker } from "./MarketingMarketplaceTicker";
import { MarketingMarketplaceOrderBook } from "./MarketingMarketplaceOrderBook";
import { MarketingMarketplaceDetailCard } from "./MarketingMarketplaceDetailCard";
import { MarketingMarketplaceNarrativeGrid } from "./MarketingMarketplaceNarrativeGrid";
import { MarketingMarketplaceActionPad } from "./MarketingMarketplaceActionPad";

interface MarketplaceSectionProps {
  disableTickerFetch?: boolean;
}

export default function MarketingMarketplaceSection({
  disableTickerFetch = false,
}: MarketplaceSectionProps) {
  const [listings, setListings] = useState<Listing[]>(() => [
    ...EXAMPLE_LISTINGS,
    generateListing(),
    generateListing(),
    generateListing(),
  ]);

  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      {
        rootMargin: "200px 0px",
        threshold: 0,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isVisible || disableTickerFetch) return;

    intervalRef.current = setInterval(() => {
      setListings((prev) => {
        if (prev.length === 0) return prev;
        const idx = Math.floor(Math.random() * prev.length);
        const actionPick = Math.random();
        return prev.map((l, i) =>
          i === idx ? { ...l, flash: actionPick < 0.5 ? "trade" : "add" } : l,
        );
      });
    }, 2800);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isVisible, disableTickerFetch]);

  useEffect(() => {
    if (listings.some((l) => l.flash)) {
      const t = setTimeout(() => {
        setListings((prev) =>
          prev.map((l) => (l.flash ? { ...l, flash: undefined } : l)),
        );
      }, 800);
      return () => clearTimeout(t);
    }
  }, [listings]);

  const tableWrapperClass =
    "relative tablet:overflow-hidden overflow-x-auto rounded-2xl border border-white/15 bg-black/40 backdrop-blur-md shadow-2xl h-full self-stretch";
  const tickerBarClass =
    "absolute bottom-0 left-0 w-full overflow-hidden -z-20 select-none pointer-events-none bg-black/40 backdrop-blur-md border-t border-emerald-400/20 shadow-[0_-4px_12px_rgba(0,0,0,0.4)]";
  const gridWrapperClass =
    "relative grid laptop:grid-cols-2 laptop:grid-rows-2 gap-8 items-start";

  const [detail, setDetail] = useState<Listing | null>(listings[0] ?? null);

  useEffect(() => {
    const flashed = listings.find((l) => l.flash);
    if (flashed) {
      setDetail(flashed);
    }
  }, [listings]);

  return (
    <>
      <section
        ref={sectionRef}
        className="relative w-full overflow-hidden py-28"
        id="marketplace-section"
        style={{ contain: "layout style" } as React.CSSProperties}
      >
        <div className="absolute inset-0 -z-40 bg-gradient-to-br from-emerald-950/60 via-emerald-900/70 to-emerald-800/80" />

        <div className="absolute inset-0 -z-30 pointer-events-none">
          <div className="w-full h-full bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22140%22 viewBox=%220 0 160 140%22 fill=%22none%22 stroke=%2267feb712%22 stroke-width=%221%22><path d=%22M40 0L120 0L160 70L120 140L40 140L0 70Z%22/></svg>')] opacity-20 animate-[mesh-scroll_40s_linear_infinite]" />
        </div>

        <div className="absolute inset-0 -z-35 pointer-events-none opacity-15">
          <svg
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
            className="w-full h-full text-white/[0.15]"
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <line
                key={"h" + i}
                x1={0}
                x2={1440}
                y1={i * 40}
                y2={i * 40}
                stroke="currentColor"
                strokeWidth={0.6}
              />
            ))}
            {Array.from({ length: 18 }).map((_, i) => (
              <line
                key={"v" + i}
                y1={0}
                y2={800}
                x1={i * 80}
                x2={i * 80}
                stroke="currentColor"
                strokeWidth={0.6}
              />
            ))}
            <polyline
              points="0,600 240,520 480,440 720,360 960,260 1200,200 1440,140"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.4"
              strokeWidth="1.5"
            />
            <polyline
              points="0,200 180,260 360,300 540,340 720,400 900,460 1080,540 1260,620 1440,700"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.2"
              strokeWidth="1.2"
              strokeDasharray="4 6"
            />
          </svg>
        </div>

        <MarketingMarketplaceCandles />
        <MarketingMarketplaceTicker listings={listings} className={tickerBarClass} />

        <div className="absolute inset-0 -z-30 opacity-10 [mask-image:linear-gradient(to_bottom,transparent,white,white,transparent)] bg-[repeating-linear-gradient(90deg,#ffffff0d_0_40px,transparent_40px_80px)] bg-[length:160px_160px] animate-[grid-scroll_60s_linear_infinite]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl laptop:text-5xl !leading-[normal] font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-emerald-500 to-teal-300 mb-4">
              Answers Beyond Public Data — Premium Knowledge Procurement
            </h2>
            <p className="text-base laptop:text-lg text-emerald-100 max-w-3xl mx-auto">
              Public datasets leave blind spots. Bitcode fills them in real&nbsp;time
              - settling $BTD against proprietary research, niche domain files,
              and expert answers the moment they become available. No waiting, no
              manual sourcing - just source-attributed knowledge that keeps your
              build moving.
            </p>
          </div>

          <div className={gridWrapperClass}>
            <MarketingMarketplaceOrderBook
              listings={listings}
              className={tableWrapperClass}
            />
            <MarketingMarketplaceNarrativeGrid />
            <MarketingMarketplaceDetailCard detail={detail} />
            <MarketingMarketplaceActionPad />
          </div>
        </div>
      </section>
    </>
  );
}
