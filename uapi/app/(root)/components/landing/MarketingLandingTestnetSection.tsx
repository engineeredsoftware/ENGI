'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/bitcode-public-copy';

export function MarketingLandingTestnetSection() {
  const copy = BITCODE_PUBLIC_COPY.testnetLaunch;

  return (
    <section
      data-testid="landing-testnet-launch"
      aria-label="Commercial testnet launch readiness"
      className="relative z-20 mx-auto w-full max-w-[1380px] px-4 pb-14 phone:px-5 tablet:px-6 laptop:px-8 desktop:px-12"
    >
      <div className="rounded-[1.6rem] border border-emerald-300/16 bg-emerald-300/[0.045] px-5 py-6 backdrop-blur-sm tablet:px-7 tablet:py-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-emerald-300/35 bg-emerald-300/12 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.2em] text-emerald-100">
            {copy.badge}
          </span>
          <ShieldCheckIcon className="h-4 w-4 text-emerald-200" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-white tablet:text-2xl">{copy.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-300">{copy.meaning}</p>
        <ol className="mt-6 grid gap-3 tablet:grid-cols-3" aria-label="Core launch flow">
          {copy.flow.map((entry) => (
            <li key={entry.step}>
              <Link
                href={entry.href}
                className="block h-full rounded-[1.2rem] border border-white/10 bg-black/25 px-4 py-4 transition hover:border-emerald-300/35 hover:bg-emerald-300/[0.07]"
              >
                <span className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-emerald-200/85">
                  {entry.step}
                </span>
                <span className="mt-2 block text-sm font-semibold text-white">{entry.label}</span>
                <span className="mt-2 block text-xs leading-5 text-neutral-400">{entry.detail}</span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="mt-6 grid gap-2 text-xs leading-5 text-neutral-400 tablet:grid-cols-2">
          <p>{copy.trust}</p>
          <p>{copy.sourceSafety}</p>
        </div>
      </div>
    </section>
  );
}
