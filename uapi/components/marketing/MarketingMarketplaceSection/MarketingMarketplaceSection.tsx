/* eslint-disable react/no-multi-comp */

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import './marketing-marketplace-section.module.css';
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import BitcodePill from "@/components/bitcode/branding/BitcodePill/BitcodePill";
import {
  ArrowTrendingUpIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  RocketLaunchIcon,
  ArrowsUpDownIcon,
  CodeBracketIcon,
  ClipboardDocumentListIcon,
  PuzzlePieceIcon,
  GlobeAltIcon,
  ChartBarIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import {
  SiReact,
  SiRust,
  SiPython,
  SiSolidity,
  SiTypescript,
  SiSwift,
} from "react-icons/si";

import BitcodeSoftwareSvgLogo from "@/components/bitcode/branding/BitcodeSoftwareSvgLogo/BitcodeSoftwareSvgLogo";

/* ------------------------------------------------------------------
   Marketplace Color Constants - Design System Integration
------------------------------------------------------------------- */
const MARKETPLACE_COLORS = {
  bullish: {
    wick: 'rgba(103, 254, 183, 0.2)',
    body: 'rgba(103, 254, 183, 0.4)',
  },
  bearish: {
    wick: 'rgba(239, 68, 68, 0.2)',
    body: 'rgba(239, 68, 68, 0.4)',
  },
} as const;

/* ------------------------------------------------------------------
   Background hex mesh keyframes
------------------------------------------------------------------- */

function TechIcon({ tech }: { tech: string }) {
  const size = 16;
  switch (tech) {
    case "react":
      return <SiReact size={size} className="text-sky-400" />;
    case "rust":
      return <SiRust size={size} className="text-orange-400" />;
    case "python":
      return <SiPython size={size} className="text-yellow-300" />;
    case "solidity":
      return <SiSolidity size={size} className="text-gray-300" />;
    case "typescript":
      return <SiTypescript size={size} className="text-blue-400" />;
    case "swift":
      return <SiSwift size={size} className="text-orange-300" />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

type Side = "buy" | "sell";
type ListingType = "shippable" | "evidence_document";
type Asset = "pr" | "knowledge_extension";

interface Listing {
  id: string;
  type: ListingType;
  asset: Asset;
  side: Side;
  price: number;
  title: string;
  tech: Array<"react" | "rust" | "python" | "solidity" | "typescript" | "swift">;
  /**
   * Amount of Bitcode `$BTD` involved in this listing. This will be highlighted
   * in the detail card together with the glowing "e" logo.
   */
  measuredBtd: number;

  /** Remaining quantity for this listing */
  available: number;

  /** Quick quality/measure indicator shown in the order book */
  measure: number;

  flash?: "add" | "trade";
}

const randomElement = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const owners = [
  "@stellar-ai",
  "@openbuild",
  "@infra-gurus",
  "@low-latency",
  "@frontend-speed",
  "@vision-labs",
  "@ops-bot",
  "@algo-kings",
  "@qa-reviewers",
];

let idCounter = 1;
const genId = () => `L${idCounter++}`;

function generateListing(): Listing {
  const type = randomElement(["shippable", "evidence_document"] as const);
  const asset = type === "shippable" ? "pr" : "knowledge_extension";
  const side = randomElement(["buy", "sell"] as const);
  const titles = {
    pr: [
      "Auth Refactor PR",
      "Next.js 14 Routes",
      "Payment Gateway",
      "CI Optimization",
    ],
    knowledge_extension: [
      "Rust Error Fixes",
      "OpenCV Snippets",
      "Terraform Modules",
      "SwiftUI Cheatsheet",
    ],
  };
  const techSets = {
    react: ["react", "typescript"],
    rust: ["rust"],
    python: ["python"],
    solidity: ["solidity", "typescript"],
    swift: ["swift"],
  } as const;
  const techPool = Object.keys(techSets) as Array<keyof typeof techSets>;
  const chosen = randomElement(techPool);
  return {
    id: genId(),
    type,
    asset,
    side,
    price: randomInt(80, 600),
    title: randomElement(titles[asset]),
    tech: [...techSets[chosen]],
    measuredBtd: randomInt(40, 600),
    available: randomInt(1, 20),
    measure: randomInt(60, 99),
    flash: "add",
  };
}

// ---------------------------------------------------------------------------
// Section component
// ---------------------------------------------------------------------------

const ROW_VARIANTS = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
} as const;

interface MarketplaceSectionProps {
  disableTickerFetch?: boolean;
}
export default function MarketingMarketplaceSection({ disableTickerFetch = false }: MarketplaceSectionProps) {
  const EXAMPLES: Listing[] = [
    {
      id: "1",
      type: "shippable",
      asset: "pr",
      side: "buy",
      title: "Auth Refactor PR",
      tech: ["react", "typescript"],
      price: 420,
      measuredBtd: 420,
      available: 3,
      measure: 95,
    },
    {
      id: "2",
      type: "shippable",
      asset: "pr",
      side: "sell",
      title: "CI Optimisation PR",
      tech: ["python"],
      price: 280,
      measuredBtd: 280,
      available: 7,
      measure: 91,
    },
    {
      id: "3",
      type: "evidence_document",
      asset: "knowledge_extension",
      side: "buy",
      title: "Rust Error Patterns",
      tech: ["rust"],
      price: 140,
      measuredBtd: 140,
      available: 12,
      measure: 88,
    },
    {
      id: "4",
      type: "evidence_document",
      asset: "knowledge_extension",
      side: "sell",
      title: "OpenCV Snippets",
      tech: ["python"],
      price: 190,
      measuredBtd: 190,
      available: 5,
      measure: 92,
    },
  ];

  // ---------------------------------------------------------------------
  // Local state – listings & active status
  // ---------------------------------------------------------------------

  // Start with 7 rows (4 presets + 3 random for variety)
  const [listings, setListings] = useState<Listing[]>(() => [
    ...EXAMPLES,
    generateListing(),
    generateListing(),
    generateListing(),
  ]);

  /* -------------------------------------------------------------------
   * Pause the simulated live-market loop when the section is off-screen
   * -------------------------------------------------------------------
   * Rather than keeping the JavaScript interval running for the entire
   * lifetime of the page we observe the section with a tiny
   * IntersectionObserver.  When it scrolls out of view the interval is
   * cancelled which prevents unneeded React renders and saves both CPU and
   * battery while the user is reading other parts of the site.
   */

  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      setIsVisible(true); // Fallback – always run when unsupported
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      {
        rootMargin: "200px 0px", // start a bit before we fully enter view
        threshold: 0,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Simulate live market: new listings & trades (runs only while visible)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Clear any previous interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isVisible || disableTickerFetch) return; // Skip when off-screen or explicitly disabled

    intervalRef.current = setInterval(() => {
      setListings((prev) => {
        if (prev.length === 0) return prev;
        const idx = Math.floor(Math.random() * prev.length);
        const actionPick = Math.random();
        return prev.map((l, i) =>
          i === idx ? { ...l, flash: actionPick < 0.5 ? "trade" : "add" } : l
        );
      });
    }, 2800);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isVisible]);

  // Clean flash flags after animation
  useEffect(() => {
    if (listings.some((l) => l.flash)) {
      const t = setTimeout(() => {
        setListings((prev) =>
          prev.map((l) => (l.flash ? { ...l, flash: undefined } : l))
        );
      }, 800);
      return () => clearTimeout(t);
    }
  }, [listings]);

  // Reused class names (SRP/DRY) – strictly className deduping, no visual change
  const tableWrapperClass = "relative tablet:overflow-hidden overflow-x-auto rounded-2xl border border-white/15 bg-black/40 backdrop-blur-md shadow-2xl h-full self-stretch";
  const tickerBarClass = "absolute bottom-0 left-0 w-full overflow-hidden -z-20 select-none pointer-events-none bg-black/40 backdrop-blur-md border-t border-emerald-400/20 shadow-[0_-4px_12px_rgba(0,0,0,0.4)]";
  const gridWrapperClass = "relative grid laptop:grid-cols-2 laptop:grid-rows-2 gap-8 items-start";

  // Detail card content – follow most recently flashed listing
  const [detail, setDetail] = useState<Listing | null>(listings[0] ?? null);

  useEffect(() => {
    const flashed = listings.find((l) => l.flash);
    if (flashed) {
      setDetail(flashed);
    }
  }, [listings]);

  /* -------------------------------------------------------------
   * BACKGROUND GRID SCROLL
   * -------------------------------------------------------------
   * A previous implementation used a continuous requestAnimationFrame loop
   * to manually update the `background-position` of an element – waking up
   * the JS thread 60 times per second for a purely visual effect.  We replace
   * that with a tiny CSS `@keyframes` animation handled entirely by the
   * compositor.  This removes ~3 ms of main-thread time per frame and lets
   * the browser throttle the animation automatically when the tab is in the
   * background.
   */

  //-----------------------------------------------------------------------
  // BACKGROUND DATA BLOCKS (lightweight – pure CSS)
  //-----------------------------------------------------------------------

  // ---------------------------------------------------------------------
  // Live ticker listings (duplicate for seamless marquee)
  // ---------------------------------------------------------------------
  const tickerListings = useMemo(() => listings.slice(0, 10).flatMap((l) => [l, l]), [listings]);


  // ---------------------------------------------------------------------
  // Animated candlestick chart overlay (bullish & bearish)
  // ---------------------------------------------------------------------
  type Candle = {
    id: number;
    left: string;
    wickTop: string;
    wickHeight: string;
    bodyTop: string;
    bodyHeight: string;
    bullish: boolean;
    delay: string;
    duration: string;
  };

  const CANDLES: Candle[] = useMemo(() => {
    const total = 70;
    const sticks: Candle[] = [];
    for (let i = 0; i < total; i++) {
      const bullish = Math.random() > 0.5;
      // Generate candlestick data in percentage space (0 at top)
      const high = Math.random() * 65 + 5; // 5% – 70%
      const low = high + Math.random() * 20 + 5; // at least 5% below high

      // Generate open & close within high..low
      let open = high + Math.random() * (low - high - 4) + 2;
      let close = high + Math.random() * (low - high - 4) + 2;

      // Ensure bullish / bearish relationship
      if (bullish && close < open) [open, close] = [close, open];
      if (!bullish && close > open) [open, close] = [close, open];

      const bodyTop = Math.min(open, close);
      const bodyBottom = Math.max(open, close);

      sticks.push({
        id: i,
        left: `${(i / total) * 100}%`,
        wickTop: `${high}%`,
        wickHeight: `${low - high}%`,
        bodyTop: `${bodyTop}%`,
        bodyHeight: `${bodyBottom - bodyTop}%`,
        bullish,
        delay: `${Math.random() * 4}s`,
        duration: `${4 + Math.random() * 4}s`,
      });
    }
    return sticks;
  }, []);

  const CandlestickOverlay = useMemo(() => {
    const Candles = () => (
      <div className="absolute top-[-20%] left-0 w-full h-[140%] -z-28 pointer-events-none overflow-hidden">
        {CANDLES.map((c) => (
          <React.Fragment key={c.id}>
            {/* wick */}
            <span
              style={{
                position: 'absolute',
                top: c.wickTop,
                left: `calc(${c.left} + 3px)`,
                width: '2px',
                height: c.wickHeight,
                backgroundColor: c.bullish ? MARKETPLACE_COLORS.bullish.wick : MARKETPLACE_COLORS.bearish.wick,
                transformOrigin: 'center',
                animation: `candle-breathe ${c.duration} ease-in-out ${c.delay} infinite alternate`,
              }}
            />
            {/* body */}
            <span
              style={{
                position: 'absolute',
                top: c.bodyTop,
                left: c.left,
                width: '8px',
                height: c.bodyHeight,
                borderRadius: '2px',
                backgroundColor: c.bullish ? MARKETPLACE_COLORS.bullish.body : MARKETPLACE_COLORS.bearish.body,
                transformOrigin: 'center',
                animation: `candle-breathe ${c.duration} ease-in-out ${c.delay} infinite alternate`,
              }}
            />
          </React.Fragment>
        ))}
      </div>
    );
    return Candles;
  }, []);

  // hex mesh background now – blocks removed

  return (
    <>
      {/*
        * Use full-width without explicit viewport sizing or negative margins so
        * the section lines up with the other alternating-theme blocks and
        * avoids introducing its own scroll context.  Horizontal overflow is
        * still clipped to contain the candlestick animation.
        */}
      <section
        ref={sectionRef}
        className="relative w-full overflow-hidden py-28"
        id="marketplace-section"
        // Layout & style containment prevents other parts of the page from
        // reflowing or being considered during style recalculation while this
        // section animates.  Combined with `content-visibility` it tells the
        // browser to skip painting when off-screen which pairs nicely with
        // the JS interval gating implemented above.
        /* Drop `content-visibility: auto` to prevent a brief repaint delay
           when the section re-enters the viewport after fast scrolls. */
        style={{ contain: 'layout style' } as any}
      >
        {/* gradient backdrop */}
        <div className="absolute inset-0 -z-40 bg-gradient-to-br from-emerald-950/60 via-emerald-900/70 to-emerald-800/80" />

        {/* emerald hex mesh */}
        <div className="absolute inset-0 -z-30 pointer-events-none">
          {/* Keyframes provided via CSS Modules */}
          <div className="w-full h-full bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22140%22 viewBox=%220 0 160 140%22 fill=%22none%22 stroke=%2267feb712%22 stroke-width=%221%22><path d=%22M40 0L120 0L160 70L120 140L40 140L0 70Z%22/></svg>')] opacity-20 animate-[mesh-scroll_40s_linear_infinite]" />
        </div>

        {/* subtle market grid backdrop (soft white lines) */}
        <div className="absolute inset-0 -z-35 pointer-events-none opacity-15">
          <svg
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
            className="w-full h-full text-white/[0.15]"
          >
            {/* horizontal lines */}
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
            {/* vertical lines */}
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
            {/* simple upward trend polyline */}
            <polyline
              points="0,600 240,520 480,440 720,360 960,260 1200,200 1440,140"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.4"
              strokeWidth="1.5"
            />
            {/* downward trend polyline */}
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

        {/* Animated candlestick chart overlay */}
        <CandlestickOverlay />

        {/* ------------------------------------------------------------ */}
        {/* Marketplace ticker tape */}
        {/* ------------------------------------------------------------ */}
        <div className={tickerBarClass}>
          <div
            className="whitespace-nowrap flex gap-12 px-8 py-2 will-change-transform text-sm tablet:text-base"
            style={{ animation: 'marketplace-ticker 40s linear infinite' }}
          >
            {tickerListings.map((l, i) => (
              <div key={i} className="inline-flex items-center gap-2">
                <span className={l.side === 'buy' ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                  {l.side.toUpperCase()}
                </span>
                <span className="opacity-85">{l.title}</span>
                <span className="flex items-center gap-1">
                  {l.tech.map((t, j) => (
                    <TechIcon key={j} tech={t} />
                  ))}
                </span>
                <span className="text-blue-300 font-semibold">${l.price}</span>
                <span className="text-teal-300 font-semibold">{l.measuredBtd.toLocaleString()} $BTD</span>
                <span className="opacity-85">Avail:{l.available}</span>
                <span className="text-orange-400 font-semibold">{(l.measure / 100).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* no custom keyframes needed after mesh change */}

        {/* ticker background */}
        {/* Subtle moving grid backdrop handled purely in CSS keyframes */}
        <div
          className="absolute inset-0 -z-30 opacity-10 [mask-image:linear-gradient(to_bottom,transparent,white,white,transparent)] bg-[repeating-linear-gradient(90deg,#ffffff0d_0_40px,transparent_40px_80px)] bg-[length:160px_160px] animate-[grid-scroll_60s_linear_infinite]"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl laptop:text-5xl !leading-[normal] font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-emerald-500 to-teal-300 mb-4">
              Answers Beyond Public Data — Premium Knowledge Procurement
            </h2>
            <p className="text-base laptop:text-lg text-emerald-100 max-w-3xl mx-auto">
              Public datasets leave blind spots. Bitcode fills them in real&nbsp;time - settling $BTD against proprietary research, niche domain files, and expert answers the moment they become available. No waiting, no manual sourcing - just source-attributed knowledge that keeps your build moving.
            </p>
          </div>

          <div className={gridWrapperClass}>
            {/* ----------------------------- */}
            {/* Top-Left – Order Book Table   */}
            {/* ----------------------------- */}
            <div className={tableWrapperClass}>
              <table className="min-w-full text-sm text-left">
                <thead className="bg-white/5">
                  <tr className="text-gray-300">
                    {[
                      "Bid/Ask",
                      "bitcode",
                      "Tech",
                      "Price",
                      "Type",
                    ].map((h) => (
                      <th key={h} className="px-4 py-2 font-semibold whitespace-nowrap text-left">
                        {h === "bitcode" ? (
                          <BitcodeSoftwareSvgLogo
                            width="60px"
                            softwareClassName="hidden"
                            className="mx-auto"
                          />
                        ) : (
                          h
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {listings.slice(0, 5).map((l) => (
                      <motion.tr
                        key={l.id}
                        layout
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={ROW_VARIANTS}
                        className={`border-t border-white/5 ${l.flash === "add"
                          ? "bg-emerald-600/10"
                          : l.flash === "trade"
                            ? l.side === "buy"
                              ? "bg-green-500/10"
                              : "bg-red-500/10"
                            : ""
                          }`}
                      >
                        {/* Bid/Ask */}
                        <td
                          className={`px-4 py-2 font-semibold capitalize ${l.side === "buy" ? "text-green-400" : "text-red-400"
                            }`}
                        >
                          {l.side}
                        </td>

                        {/* Bitcode measure */}
                        <td className="px-4 py-2 font-semibold text-emerald-300">{l.measure}</td>

                        {/* Tech */}
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1">
                            {l.tech.map((t, idx) => (
                              <TechIcon key={t + idx} tech={t} />
                            ))}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-2">${l.price}</td>

                        {/* Type */}
                        <td className="px-4 py-2 capitalize">
                          {l.type === "evidence_document" ? (
                            <BitcodePill className="bg-amber-500/20 text-amber-300">Evidence Document</BitcodePill>
                          ) : (
                            <BitcodePill className="bg-sky-500/20 text-sky-300">Shippable</BitcodePill>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* ----------------------------- */}
            {/* Top-Right – Narrative Grid     */}
            {/* ----------------------------- */}

            <div className="relative grid grid-cols-2 grid-rows-2 gap-3 h-full self-stretch">
              {[
                {
                  icon: ArrowTrendingUpIcon,
                  title: 'Read Gap Procurement',
                  body: 'Bitcode identifies persistent and severe gaps and purchases the expertise required to unblock a Read.',
                },
                {
                  icon: GlobeAltIcon,
                  title: 'Beyond Public Data Layer',
                  body: 'For a price, proprietary code, private research, and expert datasets surface to meet innovative demand.',
                },
                {
                  icon: BanknotesIcon,
                  title: 'Granular Budgets',
                  body: 'Topical procurement allowances can help Finding Fits decide when paid knowledge is worth the spend.',
                },
                {
                  icon: ChartBarIcon,
                  title: 'Visible Impactfulness',
                  body: 'Procured evidence documents are benchmarked as usage in subsequent Reads and AssetPacks.',
                },
              ].map(({ icon: IconC, title, body }) => (
                <div
                  key={title}
                  className="flex flex-col p-4 bg-black/30 backdrop-blur-md border border-emerald-400/20 rounded-lg shadow-md select-none h-full pr-3"
                >
                  <div className="flex items-center gap-2">
                    <IconC className="h-5 w-5 text-emerald-300 shrink-0" />
                    <span className="text-base text-white font-medium leading-tight">{title}</span>
                  </div>
                  <span className="text-emerald-200 text-sm leading-snug mt-1">{body}</span>
                </div>
              ))}
            </div>

            {/* ----------------------------- */}
            {/* Bottom-Left – Detail Card      */}
            {/* ----------------------------- */}

            <AnimatePresence initial={false} mode="wait">
              {detail && (
                <motion.div
                  key={detail.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="relative flex flex-col justify-between bg-gradient-to-br from-black/40 via-black/20 to-black/40 backdrop-blur-md border border-emerald-400/20 rounded-2xl p-6 shadow-2xl h-full self-stretch"
                >
                  {/* Header */}
                  <div className="flex items-center">
                    {/* Title */}
                    <h3 className="text-2xl laptop:text-3xl font-semibold text-white leading-tight">
                      {detail.title}
                    </h3>
                    {/* Tech Icons */}
                    <div className="flex items-center gap-2 ml-4">
                      {detail.tech.map((t, i) => (
                        <span key={t + i} className="transform scale-125">
                          <TechIcon tech={t} />
                        </span>
                      ))}
                    </div>
                    {/* Type & Side */}
                    <div className="flex items-center gap-3 ml-auto text-sm tablet:text-base text-gray-100">
                      {detail.type === "evidence_document" ? (
                        <BitcodePill className="px-3 py-1 border-amber-500/30 bg-amber-500/20 text-amber-300">Evidence Document</BitcodePill>
                      ) : (
                        <BitcodePill className="px-3 py-1 border-sky-500/30 bg-sky-500/20 text-sky-300">Shippable</BitcodePill>
                      )}
                      <span className={`px-3 py-1 rounded-full ${detail.side === "buy" ? "bg-green-600/20 text-green-400 text-sm tablet:text-base" : "bg-red-600/20 text-red-400 text-sm tablet:text-base"}`}>{detail.side}</span>
                    </div>
                  </div>

                  {/* Price / Bitcode amount / Avail row (center-anchored) */}
                  <div className="flex flex-col tablet:flex-row items-center my-6 select-none gap-4 tablet:gap-0">
                    {/* Price (left, aligned to center) */}
                    <div className="flex-1 flex justify-end items-center gap-1">
                      <span className="opacity-70 text-gray-400">Price:</span>
                      <span className="font-semibold text-gray-300 text-xl">
                        {'$' + detail.price.toLocaleString()}
                      </span>
                    </div>
                    {/* Bitcode amount centre (always centered) */}
                    <div className="flex-none flex items-center px-8">
                      <Image
                        src="/icons/logo.svg"
                        width={60}
                        height={60}
                        alt="Bitcode BTD unit"
                        className="w-12 h-12 drop-shadow-glow-emerald animate-pulse-slow"
                      />
                      <span className="ml-3 text-6xl laptop:text-7xl font-extrabold text-emerald-300 drop-shadow-glow-emerald">
                        {detail.measuredBtd.toLocaleString()}
                      </span>
                    </div>
                    {/* Available (right, aligned to center) */}
                    <div className="flex-1 flex justify-start items-center gap-1">
                      <span className="opacity-70 text-gray-400">Avail:</span>
                      <span className="font-semibold text-gray-300 text-xl">
                        {detail.available}
                      </span>
                    </div>
                  </div>

                  {/* Tokens & Relevancy row */}
                  <div className="flex items-center justify-center gap-12 text-lg tablet:text-xl">
                    {/* Tokens */}
                    <div className="flex items-center gap-1">
                      <span className="opacity-70 text-orange-400">Measured $BTD:</span>
                      <span className="font-semibold text-orange-300">
                        {detail.measuredBtd.toLocaleString()}
                      </span>
                    </div>
                    {/* Relevancy */}
                    <div className="flex items-center gap-1">
                      <span className="opacity-70 text-purple-400">Relevancy:</span>
                      <span className="font-semibold text-purple-300">
                        {(detail.measure / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ----------------------------- */}
            {/* Bottom-Right – Action Pad      */}
            {/* ----------------------------- */}

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Procured Evidence', icon: WrenchScrewdriverIcon },
                { label: 'Industrial Knowledge', icon: RocketLaunchIcon },
                { label: 'Innovation Exchange', icon: CodeBracketIcon },
                { label: 'List, Order, Fill', icon: ClipboardDocumentListIcon },
                { label: 'Recycled Code', icon: ArrowPathIcon },
                { label: 'Passive Satisfaction', icon: CurrencyDollarIcon },
                { label: 'Trades Measured $BTD', icon: BanknotesIcon },
                { label: 'Managed Activity', icon: ArrowsUpDownIcon },
                { label: 'Invisible Marketplace', icon: PuzzlePieceIcon },
              ].map(({ label, icon: IconC }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 bg-white/5 rounded-md py-2 px-1 select-none">
                  <div className="flex items-center justify-center w-8 h-8 tablet:w-10 tablet:h-10 rounded-md bg-black/50 text-emerald-300 shadow-inner shadow-black/30">
                    <IconC className="h-4 w-4 tablet:h-5 tablet:w-5" />
                  </div>
                  <span className="text-[0.6rem] tablet:text-[0.7rem] laptop:text-xs leading-snug text-gray-200">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
// Route-scoped marketing component (presentational only).
// Do not reuse cross-route; shared helpers live under components/bitcode.
