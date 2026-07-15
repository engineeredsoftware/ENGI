"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import styles from './marketing-btd-share-metrics-section.module.css';
import BitcodePill from "@/components/bitcode/branding/BitcodePill/BitcodePill";
import RevealingSoonOverlay from "@/components/bitcode/overlays/RevealingSoonOverlay/RevealingSoonOverlay";

export default function MarketingBtdShareMetricsSection() {
  // ------------------------------------------------------------------
  // Pause animation-heavy presentation when the section scrolls out of view.
  // ------------------------------------------------------------------

  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '0px 0px -200px 0px' }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  // Reused class names (SRP/DRY) – identical visuals
  const roundedContainer = "relative overflow-hidden rounded-3xl shadow-2xl";
  const darkGlassOverlay = "absolute inset-0 bg-black/80 backdrop-blur-md";

  const bullets = useMemo(
    () => [
      {
        t: "Read Share Rights",
        c: <>
          Wallet-readable <span className="text-emerald-300 drop-shadow-[0_0_12px_rgba(101,254,183,0.9)] animate-pulse-slow">$BTD</span>{' '}
          represents non-fungible AssetPack share/read-right holdings, not checkout currency.
        </>,
      },
      {
        t: "Pay Fees in BTC",
        c: <>
          BTC remains the fee-liquidity asset for settlement and connected-interface execution.
        </>,
      },
      {
        t: "Measure Content Amount",
        c: <>
          Accepted content records measured Bitcode amount and fit evidence before later Terminal minting flows.
        </>,
      },
      {
        t: "21M Mintable Ceiling",
        c: <>
          Later tokenomics preserve a 21,000,000 mintable <span className="text-emerald-300 drop-shadow-[0_0_12px_rgba(101,254,183,0.9)] animate-pulse-slow">$BTD</span>{' '}
          ceiling while V26 keeps read posture explicit.
        </>,
      },
      {
        t: "Acquire Through Fit",
        c: <>
          Future Terminal flows can mint after accepted Read/Fit work; Exchange flows can transfer existing holdings.
        </>,
      },
      {
        t: "AssetPack-Bound Rights",
        c: <>
          Each <span className="text-emerald-300 drop-shadow-[0_0_12px_rgba(101,254,183,0.9)] animate-pulse-slow">$BTD</span>{' '}
          position remains tied to the AssetPack evidence and read-right context it represents.
        </>,
      },
    ],
    []
  );

  // -------------------------------------------------- helpers
  const renderQuantumDot = (idx: number) => (
    <span className="relative mt-0.5 flex items-center justify-center h-4 w-4">
      <span className="absolute inset-0 rounded-full bg-orange-400/70 opacity-30" />
      <span
        className={`absolute inset-0 rounded-full border border-orange-400/60 ${styles.btdShareOrbitRing}`}
        style={{
          animationDuration: `${18 - idx * 2}s`,
          animationPlayState: inView ? 'running' : 'paused',
        }}
      />
      <span className="relative h-[6px] w-[6px] bg-orange-400 rounded-full" />
    </span>
  );

  // ---------------------------------------------------------------------
  // Animated currents component
  // ---------------------------------------------------------------------

  // (Animated currents / light-beams temporarily disabled)

  return (
    <section
      ref={sectionRef}
      className="relative w-screen overflow-hidden py-24"
      /* Removing `content-visibility: auto` avoids a 1-2-frame flash when the
         user quickly scrolls this heavy section back into view. */
      style={{ contain: 'layout style' } as any}
    >
      {/* CSS modules encapsulate animation + overlay tweaks */}
      {/* ember gradient backdrop */}
      <div className="absolute inset-0 -z-50 bg-gradient-to-br from-[#2b1200] via-[#602100] to-[#9c3300]" />

      {/* Subtle dotted ledger grid */}
      <svg
        className="absolute inset-0 -z-45 pointer-events-none text-orange-300/30 opacity-25 scale-[1.35] origin-center"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
      >
        {/* horizontal dotted lines */}
        {Array.from({ length: 18 }).map((_, i) => (
          <line
            key={"h" + i}
            x1={0}
            x2={1440}
            y1={i * 44}
            y2={i * 44}
            stroke="currentColor"
            strokeWidth={0.5}
            strokeDasharray="2 8"
          />
        ))}
        {/* vertical dotted lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <line
            key={"v" + i}
            y1={0}
            y2={800}
            x1={i * 72}
            x2={i * 72}
            stroke="currentColor"
            strokeWidth={0.5}
            strokeDasharray="2 8"
          />
        ))}
        {/* subtle coin symbol */}
        <circle
          cx="720"
          cy="400"
          r="160"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeOpacity={0.25}
          fill="none"
        />
        <text
          x="720"
          y="425"
          textAnchor="middle"
          fontSize="48"
          fontWeight="700"
          fill="currentColor"
          opacity="0.15"
        >
          $BTD
        </text>
      </svg>

      {/* circuit-board backdrop – scaled slightly larger than section */}
      {/* motherboard backdrop */}
      <svg
        className="absolute inset-0 scale-[1.5] origin-center -z-30 text-white/[0.2] pointer-events-none"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
        strokeLinecap="butt"
        strokeLinejoin="round"
      >
        {/* fine-grained horizontal/vertical grid lines removed – only scoped traces remain */}

        {/* ensure stroke thickness stays crisp after scaling */}
        <g vectorEffect="non-scaling-stroke">

          {/* ────────────────────────────────────────────── COMPONENTS ───────────────────────────────────────────── */}

          {/* GPU */}
          <rect x="60" y="470" width="240" height="160" rx="10" stroke="currentColor" strokeWidth="1.2" fill="none" />
          {/* GPU cooling fins */}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={"gpu_f" + i} y1={485 + i * 18} y2={485 + i * 18} x1={75} x2={285} stroke="currentColor" strokeWidth="0.9" />
          ))}
          {/* GPU PCI connector */}
          <rect x="90" y="640" width="180" height="8" fill="currentColor" />

          {/* RAM modules */}
          {Array.from({ length: 4 }).map((_, i) => (
            <rect
              key={"ram" + i}
              x={340 + i * 70}
              y={110}
              width="60"
              height="120"
              rx="5"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            />
          ))}

          {/* Power supply */}
          <rect x="1120" y="80" width="200" height="180" rx="12" stroke="currentColor" strokeWidth="1.2" fill="none" />
          {/* power grill lines */}
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={"psu" + i}
              x1={1135}
              x2={1305}
              y1={100 + i * 26}
              y2={100 + i * 26}
              stroke="currentColor"
              strokeWidth="0.9"
            />
          ))}

          {/* Cooling fan */}
          <circle cx="500" cy="640" r="80" stroke="currentColor" strokeWidth="1.2" fill="none" />
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={"fan_blade" + i}
              x1={500}
              y1={640}
              x2={500 + 80 * Math.cos((Math.PI / 3) * i)}
              y2={640 + 80 * Math.sin((Math.PI / 3) * i)}
              stroke="currentColor"
              strokeWidth="0.9"
            />
          ))}
          {/* additional chips */}
          <rect x="200" y="150" width="100" height="80" rx="6" stroke="currentColor" strokeWidth="1" fill="none" />
          <rect x="1140" y="520" width="120" height="90" rx="6" stroke="currentColor" strokeWidth="1" fill="none" />

          {/* small top-left ancillary chip to RAM bus – drop to chip centre then out */}
          {/* ancillary chip → CPU – flush with pin edge (x = 602) */}
          <path d="M250 230 V304 H602" stroke="currentColor" strokeWidth="1" fill="none" />
          {/* small chip (bottom-right) to CPU – start at centre of chip bottom edge */}
          <path d="M1200 610 H900 V440" stroke="currentColor" strokeWidth="1" fill="none" />

          {/* CPU chip */}
          <rect x="620" y="280" width="200" height="160" rx="8" stroke="currentColor" strokeWidth="1.2" fill="none" />
          {/* CPU die */}
          <rect x="670" y="320" width="100" height="80" rx="4" stroke="currentColor" strokeWidth="0.8" fill="none" />
          {/* CPU grid dots */}
          {Array.from({ length: 5 }).map((_, r) =>
            Array.from({ length: 6 }).map((_, c) => (
              <rect
                key={"cpu_die_" + r + "_" + c}
                x={684 + c * 14}
                y={326 + r * 16}
                width="3"
                height="3"
                fill="currentColor"
              />
            ))
          )}
          {/* pins */}
          {Array.from({ length: 6 }).map((_, i) => (
            // CPU top pins – moved 2 px down so their lower edge sits flush with
            // the CPU package border (y = 280)
            <rect key={"pt" + i} x={640 + i * 24} y={262} width="8" height="18" fill="currentColor" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={"pb" + i} x={640 + i * 24} y={440} width="8" height="18" fill="currentColor" />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            // CPU left pins – shifted right 2 px so their right edge meets the
            // CPU border (x = 620)
            <rect key={"pl" + i} y={300 + i * 24} x={602} width="18" height="8" fill="currentColor" />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <rect key={"pr" + i} y={300 + i * 24} x={820} width="18" height="8" fill="currentColor" />
          ))}

          {/* traces */}
          {/* top CPU trace – flush with pin top (y = 262) */}
          <path d="M716 262 V180 H200" stroke="currentColor" strokeWidth="1" fill="none" />
          <path d="M760 460 V620 H1300" stroke="currentColor" strokeWidth="1" fill="none" />

          {/* new traces to additional components */}
          {/* CPU to RAM bus */}
          <path d="M820 360 H1000 V110" stroke="currentColor" strokeWidth="1" fill="none" />
          {/* CPU to GPU – flush with pin edge (x = 602) */}
          <path d="M602 352 H180 V470" stroke="currentColor" strokeWidth="1" fill="none" />
          {/* CPU to Power – connect to middle of PSU bottom edge (x = 1220, y = 260) */}
          <path d="M820 320 H1220 V260" stroke="currentColor" strokeWidth="1" fill="none" />
        </g>
      </svg>


      {/* animated electrical currents disabled */}

      {/* content grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 grid desktop:grid-cols-2 gap-[5.5rem] items-center">
        {/* narrative side */}
        <div>
          <h2 className="text-4xl desktop:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-orange-100 to-white/80 drop-shadow-sm">
            Read BTC Fees and{' '}
            <span className="text-emerald-300 drop-shadow-[0_0_12px_rgba(101,254,183,0.9)] animate-pulse-slow">$BTD</span>
          </h2>
          <p className="text-lg laptop:text-xl text-white/90 mb-10 max-w-xl">
            The Bitcode balance surface separates BTC fee liquidity from non-fungible $BTD share/read-right holdings so users can see fee readiness and AssetPack ownership at a glance.
          </p>

          {/* benefits list – displayed in a responsive 2×2 grid instead of a vertical stack */}
          <ul className="grid grid-cols-1 tablet:grid-cols-2 gap-x-12 gap-y-10">
            {bullets.map((b, idx) => (
              <li key={idx} className="flex items-start gap-4">
                {renderQuantumDot(idx)}
                <div>
                  <h3 className="text-white font-semibold mb-1 leading-tight">
                    {b.t}
                  </h3>
                  <p className="text-orange-100/90 text-sm leading-relaxed max-w-md">
                    {b.c}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-4 mt-12">
            <BitcodePill className="opacity-50 pointer-events-none">
              Whitepaper ↗
            </BitcodePill>
            <BitcodePill className="opacity-50 pointer-events-none">
              Dashboard ↗
            </BitcodePill>
            <BitcodePill className="opacity-50 pointer-events-none">
              Etherscan ↗
            </BitcodePill>
          </div>
        </div>

        {/* metrics HUD */}
        <div className="relative w-full max-w-lg mx-auto overflow-visible">

          {/* grid background card – 10% larger, flat, with fading inner border */}
          <div
            className="absolute inset-0 -z-10 scale-[1.175] rounded-3xl overflow-hidden pointer-events-none bg-white/70"
            style={{
              boxShadow:
                'inset 2px 2px 8px 2px rgba(0,0,0,0.9), 2px 2px 14px 2px rgba(0,0,0,0.35)',
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent 0 27px, rgba(0,0,0,0.6) 28px), repeating-linear-gradient(90deg, transparent 0 27px, rgba(0,0,0,0.6) 28px)",
                maskImage: "radial-gradient(circle 480px at center, white 80%, transparent)",
                WebkitMaskImage: "radial-gradient(circle 480px at center, white 80%, transparent)",
              }}
            />
          </div>

          {/* wallet posture card container */}
          <div className={roundedContainer}>
            {/* black translucent backdrop */}
            <div className={darkGlassOverlay} />

            <div className="relative p-11 space-y-9">
              {/* wallet readiness */}
              <div>
                <p className="text-[15px] text-orange-200 mb-1">BTC Fee Liquidity</p>
                <p className="text-[2.125rem] font-semibold text-white flex items-baseline">
                  0.042 BTC
                  <span className="ml-3 text-[17px] font-medium text-green-400">ready</span>
                </p>
              </div>

              {/* measured source bar */}
              <div>
                <p className="text-[15px] text-orange-200 mb-1 flex items-center gap-2">
                  Measured Source Amount
                </p>
                <div className="relative w-full h-3 rounded-full overflow-hidden bg-white/10">

                  <span className={`${styles.btdShareBar} absolute left-0 top-0 h-full bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500`} />
                  {[25, 50, 75].map((m) => (
                    <div
                      key={m}
                      className="absolute top-0 h-full w-px bg-white/20"
                      style={{ left: `${m}%` }}
                    />
                  ))}
                </div>
                <p className="text-[13px] text-orange-100/80 mt-1">12,480 measured $BTD across accepted AssetPacks</p>
              </div>

              {/* total evidence */}
              <div>
                <p className="text-[15px] text-orange-200 mb-1">AssetPack Evidence Records</p>
                <p className="text-lg font-semibold text-white">4,187</p>
              </div>

              {/* posture summary */}
              <div className="text-center">
                <p className="text-[19px] font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white via-orange-100 to-white/80">
                  BTC fees and $BTD read-rights stay distinct as of {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <button className="relative overflow-hidden rounded-md w-full h-11 group">
                <span className="absolute inset-0 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 transition-transform group-hover:scale-105" />
                <span className="relative z-10 font-semibold text-black">Review in Terminal ↗</span>
              </button>
            </div>

            <div className="absolute inset-0 rounded-3xl border border-orange-400/40 pointer-events-none" />
          </div>{/* end card container */}

          {/* glass overlay – particles only, lighter blur, rounded edges, no darkening */}
          <RevealingSoonOverlay
            className={`scale-[1.175] rounded-3xl ${styles.glassOverlay}`}
          />
        </div>
      </div>
    </section>
  );
}
