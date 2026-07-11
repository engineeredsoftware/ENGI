import React from 'react';
import Link from 'next/link';

import Footer from '@/components/bitcode/layout/footer';
import { FEATURE_FLAGS } from '@/config/features';

import { EDGETIMES_TOPOLOGY, getEdgetimesTopologySummary } from './edgetimes-topology';

export default function EdgetimesPageContent() {
  const summary = getEdgetimesTopologySummary();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.14),transparent_28%),linear-gradient(180deg,#03101a_0%,#020915_48%,#01050c_100%)] text-white">
      <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 px-4 py-16 phone:px-5 tablet:px-6 laptop:px-8">
        <section className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.26em] text-cyan-100/72">
            {EDGETIMES_TOPOLOGY.eyebrow}
          </p>
          <h1 className="max-w-[16ch] text-[2.35rem] font-semibold leading-[0.96] tracking-[-0.025em] text-white phone:text-[2.9rem] tablet:text-[3.6rem]">
            {EDGETIMES_TOPOLOGY.heading}
          </h1>
          <p className="max-w-[58rem] text-[17px] leading-8 text-white/80">
            {EDGETIMES_TOPOLOGY.body}
          </p>
        </section>

        <section className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-4">
          <article className="rounded-[24px] border border-cyan-300/14 bg-cyan-400/[0.07] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/72">Ownership bands</p>
            <p className="mt-3 text-3xl font-semibold text-white">{summary.ownershipBands}</p>
          </article>
          <article className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Admitted packages</p>
            <p className="mt-3 text-3xl font-semibold text-white">{summary.admittedPackages}</p>
          </article>
          <article className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Model groups</p>
            <p className="mt-3 text-3xl font-semibold text-white">{summary.modelGroups}</p>
          </article>
          <article className="rounded-[24px] border border-orange-300/14 bg-orange-400/[0.07] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-orange-100/72">Unresolved tables</p>
            <p className="mt-3 text-3xl font-semibold text-white">{summary.unresolvedTables}</p>
          </article>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-black/24 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-cyan-300/12 bg-cyan-400/6 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100/70">
              {EDGETIMES_TOPOLOGY.baselineMigration.label}
            </span>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
              retained baseline
            </span>
          </div>
          <p className="mt-4 font-mono text-sm text-cyan-100/84">
            {EDGETIMES_TOPOLOGY.baselineMigration.path}
          </p>
          <p className="mt-3 max-w-[58rem] text-sm leading-7 text-white/78">
            {EDGETIMES_TOPOLOGY.baselineMigration.detail}
          </p>
        </section>

        <section className="grid gap-5 laptop:grid-cols-2">
          {EDGETIMES_TOPOLOGY.ownershipBands.map((band) => (
            <article
              key={band.title}
              className="rounded-[28px] border border-white/10 bg-black/24 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/72">Ownership band</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{band.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/78">{band.detail}</p>
              <ul className="mt-4 grid gap-2">
                {band.owners.map((owner) => (
                  <li
                    key={owner}
                    className="rounded-[16px] border border-white/8 bg-white/[0.03] px-3 py-2 font-mono text-[12px] leading-6 text-white/76"
                  >
                    {owner}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="grid gap-5 laptop:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <article className="rounded-[28px] border border-white/10 bg-black/24 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/72">Typed model posture</p>
            <div className="mt-4 grid gap-4 tablet:grid-cols-2">
              {EDGETIMES_TOPOLOGY.modelGroups.map((group) => (
                <section
                  key={group.title}
                  className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4"
                >
                  <h2 className="text-lg font-semibold text-white">{group.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/75">{group.detail}</p>
                  <ul className="mt-3 grid gap-2">
                    {group.models.map((model) => (
                      <li key={model} className="font-mono text-[12px] leading-6 text-cyan-50/82">
                        {model}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </article>

          <div className="grid gap-5">
            <article className="rounded-[28px] border border-orange-300/16 bg-orange-400/[0.07] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-[0.18em] text-orange-100/72">Still unowned enough</p>
              <ul className="mt-4 grid gap-2">
                {EDGETIMES_TOPOLOGY.unresolvedTables.map((tableName) => (
                  <li
                    key={tableName}
                    className="rounded-[16px] border border-orange-200/12 bg-black/18 px-3 py-2 font-mono text-[12px] leading-6 text-orange-50/86"
                  >
                    {tableName}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-[28px] border border-white/10 bg-black/24 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/72">Fourth-gate next obligations</p>
              <ul className="mt-4 grid gap-3">
                {EDGETIMES_TOPOLOGY.nextObligations.map((obligation) => (
                  <li
                    key={obligation}
                    className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-white/78"
                  >
                    {obligation}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="flex flex-wrap gap-3">
          <Link
            href="/docs"
            className="inline-flex items-center rounded-full border border-cyan-300/22 bg-cyan-400/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-50 transition hover:border-cyan-300/38 hover:bg-cyan-400/18"
          >
            Return to docs
          </Link>
          <Link
            href="/terminal"
            className="inline-flex items-center rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/84 transition hover:border-white/20 hover:bg-white/10"
          >
            Open Bitcode Terminal
          </Link>
          {!FEATURE_FLAGS.DISABLE_CONVERSATIONS_ROUTE ? (
            <Link
              href="/conversations"
              className="inline-flex items-center rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/84 transition hover:border-white/20 hover:bg-white/10"
            >
              Open conversations
            </Link>
          ) : null}
        </section>
      </main>

      <Footer showPrimaryContent={false} className="border-white/10 bg-[#02060d]/72 backdrop-blur-xl" />
    </div>
  );
}
