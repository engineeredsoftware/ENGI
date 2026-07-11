"use client";

/*
 * ComputeSection – Alt marketing section highlighting Bitcode’s on-demand
 * virtual workstations (build & run).  Visual signature: deep-blue gradient
 * backdrop, subtle ‘code-matrix’ columns drifting upwards and a cyan scan-
 * line sweep.  Layout is a responsive split-pane: a live-typing terminal on
 * the left and three feature cards on the right.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from './marketing-compute-section.module.css';
import {
  CpuChipIcon,
  GlobeAltIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";

/* -------------------------------------------------------------------------
   Feature card copy – keep concise for readability.
------------------------------------------------------------------------- */

type Card = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
};

const CARDS: Card[] = [
  {
    icon: CpuChipIcon,
    title: "On-Demand Virtual Workstations",
    desc: "Bitcode provisions GPU or CPU boxes in seconds, pre-loaded with your exact stack - zero tickets, zero wait.",
  },
  {
    icon: GlobeAltIcon,
    title: "Full Local SWE Experience",
    desc: "Compile, test, debug and profile exactly as a dev would locally — the full workstation experience, triggered by AI when required.",
  },
  {
    icon: CommandLineIcon,
    title: "Beyond the Terminal",
    desc: "Read Chrome for UI tests or a custom debugger? Bitcode can run GUI apps or prepare helper tools when a Read requires workstation evidence.",
  },
];

/* -------------------------------------------------------------------------
   Code-matrix background helpers
------------------------------------------------------------------------- */

const GLYPHS = ["░", "▒", "▓", "▞", "▚", "█", "▇", "▋", "▌"];

// Pre-generate column strings so React doesn’t re-compute on every render.
function makeColumnLines(lines = 180): string {
  let str = "";
  for (let i = 0; i < lines; i++) {
    const char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    str += char + "\n";
  }
  return str;
}

/* -------------------------------------------------------------------------
   Simple typewriter effect for the demo terminal
------------------------------------------------------------------------- */

const DEMO_LINES = [
  "$ tsc -p .\n",
  "⠴ compiling 312 TypeScript files…\n",
  "✔ build complete in 4.2 s\n",
  "\n$ npm test\n",
  "running 87 unit tests on Node 20…\n",
  "✓ user-auth.spec.ts (9 ms)\n",
  "✓ payment.processor.spec.ts (21 ms)\n",
  "✓ notifications.queue.spec.ts (31 ms)\n",
  "\n$ playwright test --browser=firefox\n",
  "launching agent-ws-42GPU…\n",
  "› checkout.spec.ts (passed) 8 s\n",
  "taking screenshots…\n",
  "stored artifacts to s3://bitcode-runs/42GPU/checkout/\n",
];

function useTypewriter(active: boolean) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!active) return;

    const fullText = DEMO_LINES.join("");
    if (idx >= fullText.length) {
      // small pause then restart
      const timeout = setTimeout(() => setIdx(0), 2500);
      return () => clearTimeout(timeout);
    }
    const handle = setTimeout(() => setIdx((n) => n + 1), 28);
    return () => clearTimeout(handle);
  }, [idx, active]);

  return DEMO_LINES.join("").slice(0, idx);
}

/* -------------------------------------------------------------------------
   Component
------------------------------------------------------------------------- */

export default function MarketingComputeSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  // IntersectionObserver to pause animations when off-screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "0px 0px -200px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Toggle play state without React re-rendering columns (avoids wiping custom nodes)
  useEffect(() => {
    columnRefs.current.forEach((el) => {
      if (el) el.style.animationPlayState = inView ? 'running' : 'paused';
    });
  }, [inView]);

  const typedText = useTypewriter(inView);

  // auto-scroll terminal
  const preRef = useRef<HTMLPreElement | null>(null);
  useEffect(() => {
    preRef.current?.scrollTo({ top: preRef.current.scrollHeight });
  }, [typedText]);

  /* --------------------------------------------- code-matrix columns */
  const COLUMN_COUNT = 18;

  // Pre-compute randomised animation settings once per mount so columns are
  // de-synchronised while still beginning their scroll immediately.  We use
  // negative animation delays (between –duration and 0) which starts each
  // column part-way through its cycle on first paint – avoiding the current
  // “wave” / cascading start while ensuring the movement is continuous.

  const columns = useMemo(() => {
    return Array.from({ length: COLUMN_COUNT }).map(() => makeColumnLines());
  }, []);

  const fgMeta = useMemo(() => {
    return Array.from({ length: COLUMN_COUNT }).map(() => {
      const duration = 12 + Math.random() * 8; // 12-20 s
      // Negative delay so animation is already in progress – hence no initial
      // flicker or chain-start.
      const delay = -Math.random() * duration;
      return { duration, delay };
    });
  }, []);

  const bgMeta = useMemo(() => {
    return Array.from({ length: COLUMN_COUNT }).map(() => {
      const duration = 18 + Math.random() * 10; // 18-28 s
      const delay = -Math.random() * duration;
      return { duration, delay };
    });
  }, []);

  // Precompute static style objects so Memo columns don’t re-render due to
  // new object identity each render.
  const fgStyles = useMemo(() => {
    return Array.from({ length: COLUMN_COUNT }).map((_, i) => ({
      left: `${(i * 100) / COLUMN_COUNT}%`,
      animationDelay: `${fgMeta[i].delay}s`,
      animationDuration: `${fgMeta[i].duration}s`,
    })) as React.CSSProperties[];
  }, [fgMeta]);

  const bgStyles = useMemo(() => {
    return Array.from({ length: COLUMN_COUNT }).map((_, i) => ({
      left: `${(i * 100) / COLUMN_COUNT}%`,
      animationDelay: `${bgMeta[i].delay}s`,
      animationDuration: `${bgMeta[i].duration}s`,
    })) as React.CSSProperties[];
  }, [bgMeta]);

  // Reused class names (SRP/DRY)
  const terminalPaneClass = "relative laptop:flex-1 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md overflow-hidden shadow-lg flex flex-col";
  const featureCardClass = "card flex items-start p-5 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md rounded-xl border border-white/10 hover:ring-1 hover:ring-cyan-200/30";
  const featureIconClass = "mr-4 p-2 bg-white/10 rounded-md";

  /* --------------------------------------------- Column component (memo) */

  const CodeColumn = React.useMemo(() => {
    return React.forwardRef<HTMLPreElement, { col: string; style: React.CSSProperties; className: string }>(({ col, style, className }, ref) => (
      <pre ref={ref} className={className} style={style}>
        {col}
      </pre>
    ));
  }, []);

  /* --------------------------------------------- matrix pop effect */

  // Keep refs to each code column so we can attach pop elements as children
  const columnRefs = useRef<Array<HTMLPreElement | null>>([]);

  // Helper to spawn a single pop burst inside a random column & row
  const CHAR_HEIGHT = 13; // px (matches leading-[13px])

  function spawnPop() {
    const colIdx = Math.floor(Math.random() * COLUMN_COUNT);
    const colEl = columnRefs.current[colIdx];
    if (!colEl) return;

    const rect = colEl.getBoundingClientRect();
    // If column not visible, skip
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    // Determine visible row range within viewport
    const visibleStartPx = Math.max(0, 0 - rect.top);
    const visibleEndPx = Math.min(rect.height, window.innerHeight - rect.top);
    const visibleRows = Math.floor((visibleEndPx - visibleStartPx) / CHAR_HEIGHT);
    if (visibleRows <= 0) return;

    const rowIdx = Math.floor(visibleStartPx / CHAR_HEIGHT) + Math.floor(Math.random() * visibleRows);

    // Determine glyph at that row so pop matches underlying block
    let glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    const lines = colEl.textContent?.split('\n');
    if (lines && lines[rowIdx % lines.length]) glyph = lines[rowIdx % lines.length];

    const span = document.createElement('span');
    span.className = styles.matrixPop;
    span.textContent = glyph;
    span.style.top = `${rowIdx * CHAR_HEIGHT}px`;
    span.style.left = `0px`;

    colEl.appendChild(span);

    // (Particle burst removed – focusing on subtle glow only)

    // After burst ends (~0.6s) freeze animation so it stays green until
    // naturally scrolling off-screen. Remove after ~60 s to avoid DOM bloat.
    // After burst completes freeze the glyph in its final glowing state.
    span.addEventListener('animationend', () => {
      span.style.animation = 'none';
    }, { once: true });
  }

  // Interval to trigger pops while section is in view
  useEffect(() => {
    if (!inView) return;

    // Base interval (ms)
    // Higher frequency in dev (or with ?popdebug=1 in URL) so designers can
    // preview the effect without waiting.
    const isDev = process.env.NODE_ENV === 'development' ||
      (typeof window !== 'undefined' && window.location.search.includes('popdebug'));

    const PROBABILITY = isDev ? 0.9 : 0.25;
    const INTERVAL_MS = isDev ? 400 : 1200;

    const interval = setInterval(() => {
      if (Math.random() < PROBABILITY) spawnPop();
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, [inView]);

  return (
    <section
      ref={sectionRef}
      className="relative w-screen overflow-hidden py-24"
      /*
         Removing `content-visibility: auto` fixes a visible flash that could
         occur when the section re-enters the viewport after a fast scroll.
         The browser sometimes withholds rasterisation for an extra frame
         while recomputing paint for very large, complex DOM sub-trees.
         Layout & style containment remain for perf gains, but we let the
         section paint off-screen so pixels are immediately ready. */
      style={{ contain: "layout style" } as any}
    >
      {/* Gradient backdrop */}
      <div className="absolute inset-0 -z-50 bg-gradient-to-br from-[#0B0623] via-[#06345c] to-[#00B8FF]" />

      {/* Subtle blueprint grid (static) */}
      <svg
        className="absolute inset-0 -z-45 pointer-events-none text-cyan-200/15 opacity-15 scale-[1.25] origin-center"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
      >
        {/* diagonal blueprint grid – 45° lines */}
        {Array.from({ length: 40 }).map((_, i) => (
          <line
            key={"d1" + i}
            x1={-800 + i * 80}
            y1={800}
            x2={i * 80}
            y2={0}
            stroke="currentColor"
            strokeWidth={0.6}
          />
        ))}
        {Array.from({ length: 40 }).map((_, i) => (
          <line
            key={"d2" + i}
            x1={-800 + i * 80}
            y1={0}
            x2={i * 80}
            y2={800}
            stroke="currentColor"
            strokeWidth={0.6}
          />
        ))}
        {/* subtle processor outline */}
        <rect
          x="540"
          y="220"
          width="360"
          height="360"
          rx="12"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeOpacity={0.25}
          fill="none"
        />
        {/* inner die */}
        <rect
          x="660"
          y="340"
          width="120"
          height="120"
          rx="4"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeOpacity={0.25}
          fill="none"
        />
      </svg>

      {/* Code columns (dual layer for depth) */}
      <div className="pointer-events-none absolute inset-0 -z-40" aria-hidden="true">
        {columns.map((col, i) => (
          <CodeColumn
            key={`fg-${i}`}
            ref={(el: HTMLPreElement | null) => {
              columnRefs.current[i] = el;
            }}
            className={`${styles.codeColumn} font-mono text-[11px] leading-[13px] text-cyan-100/10 whitespace-pre`}
            style={fgStyles[i]}
            col={col}
          />
        ))}

        {columns.map((col, i) => (
          <CodeColumn
            key={`bg-${i}`}
            className={`${styles.codeColumn} font-mono text-[11px] leading-[13px] text-cyan-100/5 whitespace-pre blur-[1px]`}
            style={bgStyles[i]}
            col={col}
          />
        ))}

        {/* Scan-line */}
        <div className={`absolute inset-x-0 top-0 h-full pointer-events-none ${styles.scanLine}`} style={{ animationPlayState: inView ? 'running' : 'paused' }} />
      </div>

      {/* Content wrapper */}
      <div className="relative mx-auto max-w-6xl px-6 tablet:px-8 desktop:px-12">
        <h2 className={`text-3xl tablet:text-4xl laptop:text-5xl font-extrabold tracking-tight leading-snug mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 via-teal-50 to-white ${styles.animateGradientPan} text-center max-w-4xl mx-auto`}>
          On-Demand Workstations — Ship Faster, Build Smarter
        </h2>
        <p className="text-base tablet:text-lg laptop:text-xl text-cyan-100/90 mb-8 max-w-2xl mx-auto text-center">
          Bitcode silently provisions full-stack workstations the moment an agent needs them—unlocking real-world tools so your software ships faster and with greater quality.
        </p>

        {/* Split pane */}
        <div className="laptop:flex laptop:items-stretch gap-10">
          {/* Terminal pane */}
          <div className={terminalPaneClass}>
            {/* macOS style chrome */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border-b border-white/10">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <pre
              ref={preRef}
              className="flex-1 overflow-y-auto p-4 laptop:p-6 text-[13px] leading-[20px] text-teal-100 font-mono whitespace-pre-wrap break-words"
            >
              {typedText}
              <span className={`inline-block w-2 h-5 ml-0.5 bg-teal-200 ${styles.animateCursor}`} />
          </pre>
          </div>

          {/* Feature cards */}
          <div className="mt-10 laptop:mt-0 laptop:w-[38%] flex flex-col gap-6">
            {CARDS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className={featureCardClass}>
                <div className={featureIconClass}>
                  <Icon className="h-6 w-6 text-cyan-200" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-cyan-100 mb-1">
                    {title}
                  </h4>
                  <p className="text-sm text-cyan-100/90 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Modules handle animations and classes */}
    </section>
  );
}
