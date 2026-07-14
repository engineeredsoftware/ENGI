'use client';

/**
 * Compact commercial testnet strip under the landing micro-blog.
 * Content-height only (~half the prior expanded fill) so left/right lower edges can align.
 */

import React from 'react';
import Link from 'next/link';

import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';

export function MarketingLandingTestnetSection() {
  const copy = BITCODE_PUBLIC_COPY.testnetLaunch;

  return (
    <section
      data-testid="landing-testnet-launch"
      aria-label="Commercial testnet launch readiness"
      className="relative mt-auto w-full pt-3"
    >
      <div className="rounded-none border border-emerald-300/16 bg-emerald-300/[0.045] px-3 py-3 backdrop-blur-sm phone:px-3.5 phone:py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-none border border-emerald-300/35 bg-emerald-300/12 px-2.5 py-0.5 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-emerald-100">
            {copy.badge}
          </span>
        </div>
        <h2 className="mt-2 text-[15px] font-semibold leading-snug text-white phone:text-base">
          {copy.title}
        </h2>
        <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-neutral-300">{copy.meaning}</p>
        <ol className="mt-2.5 grid grid-cols-1 gap-1.5" aria-label="Core launch flow">
          {copy.flow.map((entry) => (
            <li key={entry.step}>
              <Link
                href={entry.href}
                className="block rounded-none border border-white/10 bg-black/25 px-2.5 py-2 transition hover:border-emerald-300/35 hover:bg-emerald-300/[0.07]"
              >
                <span className="inline-flex items-baseline gap-2">
                  <span className="text-[0.58rem] font-medium uppercase tracking-[0.18em] text-emerald-200/85">
                    {entry.step}
                  </span>
                  <span className="text-[12px] font-semibold text-white">{entry.label}</span>
                </span>
                <span className="mt-0.5 block line-clamp-1 text-[10px] leading-4 text-neutral-400">
                  {entry.detail}
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="mt-2 grid gap-1 border-t border-white/8 pt-2 text-[10px] leading-4 text-neutral-400">
          <p className="line-clamp-1">{copy.trust}</p>
          <p className="line-clamp-1">{copy.sourceSafety}</p>
        </div>
      </div>
    </section>
  );
}
