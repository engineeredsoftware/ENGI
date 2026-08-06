import React from 'react';
import Link from 'next/link';

import Footer from '@/components/bitcode/layout/Footer/Footer';
import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';
import { BITCODE_PUBLIC_EXPLAINERS } from '@/components/bitcode/layout/BitcodePublicExplainers/bitcode-public-explainers';
import {
  BITCODE_DOCS_CHAPTERS,
  BITCODE_DOCS_PAGES,
  PRODUCT_ACTION_GUIDES,
  PRODUCT_READ_GUIDES,
} from '@/app/docs/bitcode-docs-content';

import MarketingOperatorGuideCard from '@/components/marketing/MarketingOperatorGuideCard/MarketingOperatorGuideCard';
import { GLOBAL_CONSTANT_BITCODE_WHITEPAPER_URL } from '@bitcode/global-constants';

type PublicDocsPageContentProps = {
  sourcePlayable: boolean;
};

const firstReadingPath = [
  {
    label: 'Understand the object',
    body: 'Start with DataPacks so Bitcode reads as measured technical intelligence, not a generic app.',
    href: '/docs/what-is-bitcode',
  },
  {
    label: 'Learn the product surfaces',
    body: 'Then learn /deposits, /reads, and /exchange before opening value-bearing controls.',
    href: '/docs/source-shares',
  },
  {
    label: 'Practice write/read discipline',
    body: 'Use the action guide to learn what every bounded write should make rereadable.',
    href: '/docs/product-actions',
  },
  {
    label: 'Audit the system',
    body: 'Finish with active Protocol canon, proofs, settlement, and interface docs so the under-the-hood system is clear.',
    href: '/docs/protocol',
  },
] as const;

const specCoverageCards = [
  {
    eyebrow: 'Protocol',
    title: 'Commercial protocol map (V48)',
    body: 'DataPack lifecycle, BTD volume and rights, Crypto settlement, proof readback, interface disclosure, and promotion truth.',
    href: '/docs/protocol',
  },
  {
    eyebrow: 'Proofs',
    title: 'Witnesses, replay, and disclosure',
    body: 'Proof families, witness artifacts, generated appendices, projection, redaction, and fail-closed posture.',
    href: '/docs/proofs',
  },
  {
    eyebrow: 'Settlement',
    title: 'BTD volume and Crypto settlement',
    body: 'Needs-fits scores, volume and rights, finality receipts, delivery unlock, compensation, and /exchange reread.',
    href: '/docs/settlement-btd',
  },
] as const;

const quickRouteCards = [
  {
    href: '/exchange',
    eyebrow: 'Exchange',
    title: 'Read the activity frame',
    summary: BITCODE_PUBLIC_EXPLAINERS.network.summary,
  },
  {
    href: '/reads',
    eyebrow: 'Read',
    title: 'Request Reading',
    summary: BITCODE_PUBLIC_EXPLAINERS.read.summary,
  },
  {
    href: '/deposits',
    eyebrow: 'Deposit',
    title: 'Prepare supply',
    summary: BITCODE_PUBLIC_EXPLAINERS.deposit.summary,
  },
  {
    href: GLOBAL_CONSTANT_BITCODE_WHITEPAPER_URL,
    eyebrow: 'Protocol',
    title: 'Audit the canon',
    summary: BITCODE_PUBLIC_EXPLAINERS.protocolSpec.summary,
    external: true,
  },
] as const;

const interfaceReferenceCards = [
  {
    href: '/docs/mcp-api',
    eyebrow: 'MCP API',
    title: 'Public machine interface reference',
    body: 'Active MCP tools are documented by feature, request shape, expected output, failure posture, and proof readback.',
  },
  {
    href: '/docs/chatgpt-app',
    eyebrow: 'ChatGPT App',
    title: 'Conversational interface reference',
    body: 'ChatGPT App tools list how to use each call, required inputs, returned metadata, and confirmation rules for writes.',
  },
] as const;

export default function PublicDocsPageContent({ sourcePlayable }: PublicDocsPageContentProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_16%_0%,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(34,211,238,0.1),transparent_28%),linear-gradient(180deg,#04101a_0%,#030816_45%,#02060d_100%)] text-white">
      <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 pb-16 pt-32 phone:px-5 tablet:px-6 laptop:px-8">
        <section className="grid gap-6 laptop:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <div className="rounded-none border border-white/10 bg-black/28 p-6 shadow-[0_34px_110px_rgba(0,0,0,0.44)] backdrop-blur-xl tablet:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-none border border-emerald-300/14 bg-emerald-400/[0.06] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-100/70">
                {BITCODE_PUBLIC_COPY.guideRoute.eyebrow}
              </span>
              <span className="rounded-none border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/55">
                Zero-to-hero
              </span>
            </div>
            <h1 className="mt-5 max-w-[14ch] text-[2.5rem] font-semibold leading-[0.96] tracking-[-0.025em] text-white phone:text-[3.15rem] tablet:text-[4.15rem]">
              Learn Bitcode from DataPacks to proof.
            </h1>
            <p className="mt-5 max-w-[58rem] text-[17px] leading-8 text-white/82">
              Bitcode docs teach the complete path: what a DataPack commodity is,
              how BTD measures scalar volume and rights, why Crypto settlement money and
              proof readback authority matter, and how /deposits, /reads, /exchange, MCP,
              ChatGPT App, and Bitcode Chat stay source-safe.
            </p>
            <div className="mt-6 grid gap-3 tablet:grid-cols-3">
              <div className="rounded-none border border-emerald-300/12 bg-emerald-400/[0.055] px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/70">For new readers</p>
                <p className="mt-2 text-sm leading-6 text-emerald-50/76">
                  Start from the DataPack before touching value-bearing controls.
                </p>
              </div>
              <div className="rounded-none border border-cyan-300/12 bg-cyan-400/[0.045] px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/70">For operators</p>
                <p className="mt-2 text-sm leading-6 text-cyan-50/76">
                  Learn every write, expected read, proof signal, and readiness blocker.
                </p>
              </div>
              <div className="rounded-none border border-amber-300/12 bg-amber-400/[0.045] px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/70">For builders</p>
                <p className="mt-2 text-sm leading-6 text-amber-50/76">
                  Map MCP, ChatGPT App, Bitcode Chat, GitHub, webhooks, compute, and storage into proof readback.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/docs/what-is-bitcode"
                className="inline-flex rounded-none border border-emerald-300/24 bg-emerald-400/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50 transition hover:border-emerald-300/42 hover:bg-emerald-400/18"
              >
                Start reading
              </Link>
              <Link
                href="/docs/product-actions"
                className="inline-flex rounded-none border border-white/12 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/78 transition hover:border-white/22 hover:bg-white/10"
              >
                Action manual
              </Link>
            </div>
          </div>

          <section
            id="walkthrough"
            className="overflow-hidden rounded-none border border-white/10 bg-black/28 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.42)] backdrop-blur-xl"
          >
            <MarketingOperatorGuideCard
              initialSourcePlayable={sourcePlayable}
              initialSourceResolved
            />
          </section>
        </section>

        <section className="rounded-none border border-white/10 bg-black/24 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-200/72">
              First-time path
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Read in this order if Bitcode is new.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/72">
              The docs are intentionally chaptered. You can jump anywhere, but the first path
              moves from concept to product to proof without assuming prior Bitcode context.
            </p>
          </div>
          <div className="mt-6 grid gap-3 laptop:grid-cols-4">
            {firstReadingPath.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-none border border-white/8 bg-white/[0.03] p-4 transition hover:border-emerald-300/22 hover:bg-emerald-400/[0.06]"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/68">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <p className="mt-2 text-base font-semibold text-white">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-white/68">{item.body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-5 laptop:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)]">
          <div className="rounded-none border border-white/10 bg-black/24 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-none border border-emerald-300/12 bg-emerald-400/6 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-100/70">
                Chapters
              </span>
              <span className="inline-flex items-center rounded-none border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
                {BITCODE_DOCS_PAGES.length} pages
              </span>
            </div>
            <div className="mt-5 grid gap-4">
              {BITCODE_DOCS_CHAPTERS.map((chapter) => (
                <article key={chapter.id} className="rounded-none border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-200/70">
                    {chapter.number} / {chapter.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/70">{chapter.summary}</p>
                  <div className="mt-4 grid gap-2 tablet:grid-cols-2">
                    {chapter.pages.map((page) => (
                      <Link
                        key={page.href}
                        href={page.href}
                        className="rounded-none border border-white/8 bg-black/18 px-3 py-3 transition hover:border-emerald-300/22 hover:bg-emerald-400/[0.06]"
                      >
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                          {page.eyebrow}
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-5 text-white">{page.title}</p>
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-none border border-white/10 bg-black/24 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-200/72">
              V45 / V46 claim boundary
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Product docs map back to the active canon.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/72">
              Protocol docs map back to active law. Public docs explain; proof readback decides.
              The public docs teach the current product routes in user order:
              DataPack commodity, BTD scalar volume and rights, Crypto settlement money,
              proof readback authority, /deposits, /reads, /exchange, interfaces, and configuration.
            </p>
            <div className="mt-5 grid gap-3">
              {specCoverageCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="rounded-none border border-cyan-300/10 bg-cyan-400/[0.035] p-4 transition hover:border-cyan-300/22 hover:bg-cyan-400/[0.06]"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/68">{card.eyebrow}</p>
                  <p className="mt-2 text-base font-semibold text-white">{card.title}</p>
                  <p className="mt-2 text-sm leading-6 text-cyan-50/70">{card.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-none border border-white/10 bg-black/24 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.24em] text-amber-200/72">
              Interface API references
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Build against Bitcode without losing proof readback authority.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/72">
              The interface docs now read like product-facing API docs: every feature says when
              to call it, what inputs it accepts, what should return, and which proof
              readback confirms the outcome.
            </p>
          </div>
          <div className="mt-6 grid gap-3 tablet:grid-cols-2">
            {interfaceReferenceCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="rounded-none border border-amber-300/10 bg-amber-400/[0.035] p-4 transition hover:border-amber-300/22 hover:bg-amber-400/[0.06]"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-100/68">{card.eyebrow}</p>
                <p className="mt-2 text-base font-semibold text-white">{card.title}</p>
                <p className="mt-2 text-sm leading-6 text-amber-50/70">{card.body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-none border border-white/10 bg-black/24 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="grid gap-6 laptop:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-200/72">
                Action map
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Every write has a read-back expectation.
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/72">
                The action guide documents the write actions operators can take and the
                exact read surfaces that should confirm the result before they move into
                proof, settlement, or history.
              </p>
              <Link
                href="/docs/product-actions"
                className="mt-5 inline-flex rounded-none border border-emerald-300/24 bg-emerald-400/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50 transition hover:border-emerald-300/42 hover:bg-emerald-400/18"
              >
                Open action guide
              </Link>
            </div>
            <div className="grid gap-3 tablet:grid-cols-2">
              {PRODUCT_ACTION_GUIDES.slice(0, 6).map((item) => (
                <article key={item.id} className="rounded-none border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/68">{item.location}</p>
                  <p className="mt-2 text-base font-semibold text-white">{item.action}</p>
                  <p className="mt-2 text-sm leading-6 text-white/68">{item.expectedRead}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 laptop:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <div className="rounded-none border border-white/10 bg-black/24 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-200/72">
              Proof and readiness reads
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Read what changed before trusting the flow.
            </h2>
            <div className="mt-5 grid gap-3">
              {PRODUCT_READ_GUIDES.slice(0, 5).map((item) => (
                <article key={item.id} className="rounded-none border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/68">{item.location}</p>
                  <p className="mt-2 text-base font-semibold text-white">{item.read}</p>
                  <p className="mt-2 text-sm leading-6 text-white/68">{item.expectedResult}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-none border border-white/10 bg-black/24 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-200/72">
              Fast routes
            </p>
            <div className="mt-4 grid gap-3">
              {quickRouteCards.map((card) => {
                const className =
                  'block rounded-none border border-white/8 bg-white/[0.03] p-4 transition hover:border-emerald-300/22 hover:bg-emerald-400/[0.06]';

                return 'external' in card && card.external ? (
                  <a
                    key={card.href}
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/70">
                      {card.eyebrow}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">{card.title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/70">{card.summary}</p>
                  </a>
                ) : (
                  <Link key={card.href} href={card.href} className={className}>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/70">
                      {card.eyebrow}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">{card.title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/70">{card.summary}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer showPrimaryContent={false} className="border-white/10 bg-[#02060d]/72 backdrop-blur-xl" />
    </div>
  );
}
