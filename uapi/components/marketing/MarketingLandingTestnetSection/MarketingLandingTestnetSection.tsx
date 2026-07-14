'use client';

/**
 * Commercial product strip (left column). Outer y-margins come from the hero stack wrapper.
 */

import React from 'react';
import Link from 'next/link';

import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';

export function MarketingLandingTestnetSection() {
  const copy = BITCODE_PUBLIC_COPY.testnetLaunch;

  return (
    <section
      data-testid="landing-testnet-launch"
      aria-label="Commercial product launch readiness"
      className="relative w-full"
    >
      <div className="rounded-none border border-emerald-300/16 bg-emerald-300/[0.045] px-4 py-4 backdrop-blur-sm phone:px-5 phone:py-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-none border border-emerald-300/35 bg-emerald-300/12 px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-emerald-100">
            {copy.badge}
          </span>
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-snug text-white phone:text-xl">
          {copy.title}
        </h2>
        <p className="mt-2 text-[13px] leading-5 text-neutral-300 phone:text-[14px]">{copy.meaning}</p>
        <ol className="mt-3 grid grid-cols-1 gap-2.5" aria-label="Core product flow">
          {copy.flow.map((entry) => (
            <li key={entry.step}>
              <Link
                href={entry.href}
                className="block rounded-none border border-white/10 bg-black/25 px-3 py-3 transition hover:border-emerald-300/35 hover:bg-emerald-300/[0.07]"
              >
                <span className="inline-flex items-baseline gap-2">
                  <span className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-emerald-200/85">
                    {entry.step}
                  </span>
                  <span className="text-[13px] font-semibold text-white">{entry.label}</span>
                </span>
                <span className="mt-1 block text-[11px] leading-4 text-neutral-400">{entry.detail}</span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="mt-3 grid gap-1.5 border-t border-white/8 pt-3 text-[11px] leading-5 text-neutral-400">
          <p>{copy.trust}</p>
          <p>{copy.sourceSafety}</p>
        </div>
      </div>
    </section>
  );
}
