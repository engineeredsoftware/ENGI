import React from 'react';
import Link from 'next/link';

import TerminalWorkspaceCard from '@/components/bitcode/pipeline/BitcodeWorkspaceCard/BitcodeWorkspaceCard';
import Footer from '@/components/bitcode/layout/footer';
import { BITCODE_GITHUB_APP_PUBLIC_URL } from '@/lib/github-app-url';

import {
  BITCODE_DOCS_CHAPTERS,
  TERMINAL_ACTION_GUIDES,
  TERMINAL_READ_GUIDES,
  type BitcodeDocsPage,
  type DocsEmbeddedUiSpecimen,
  type DocsInterfaceApiSection,
} from './bitcode-docs-content';

type DocsArticlePageProps = {
  page: BitcodeDocsPage;
};

function signalToneClassName(tone: NonNullable<DocsEmbeddedUiSpecimen['signals']>[number]['tone']) {
  if (tone === 'emerald') {
    return 'border-emerald-300/16 bg-emerald-400/[0.06] text-emerald-50';
  }
  if (tone === 'amber') {
    return 'border-amber-300/16 bg-amber-400/[0.06] text-amber-50';
  }
  if (tone === 'cyan') {
    return 'border-cyan-300/16 bg-cyan-400/[0.06] text-cyan-50';
  }
  return 'border-white/10 bg-white/[0.045] text-white/78';
}

function DocsPageRail({ page }: { page: BitcodeDocsPage }) {
  return (
    <nav
      aria-label="Bitcode docs table of contents"
      className="max-h-[calc(100vh-8rem)] overflow-y-auto rounded-[28px] border border-white/10 bg-black/24 p-3 backdrop-blur-xl"
    >
      <Link
        href="/docs"
        className="block rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 text-sm font-semibold text-white/82 transition hover:border-emerald-300/20 hover:bg-emerald-400/[0.06] hover:text-emerald-50"
      >
        Docs home
      </Link>
      <div className="mt-4 grid gap-4">
        {BITCODE_DOCS_CHAPTERS.map((chapter) => {
          const isActiveChapter = chapter.id === page.chapterId;
          return (
            <section key={chapter.id} aria-labelledby={`docs-chapter-${chapter.id}`}>
              <p
                id={`docs-chapter-${chapter.id}`}
                className={`px-3 text-[10px] uppercase tracking-[0.22em] ${
                  isActiveChapter ? 'text-emerald-200' : 'text-white/42'
                }`}
              >
                {chapter.number} / {chapter.title}
              </p>
              <div className="mt-2 grid gap-1.5">
                {chapter.pages.map((item) => {
                  const active = item.href === page.href;
                  return (
                    <div key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={`block rounded-2xl border px-3 py-2.5 transition ${
                          active
                            ? 'border-emerald-300/28 bg-emerald-400/10 text-emerald-50'
                            : 'border-white/8 bg-white/[0.025] text-white/66 hover:border-emerald-300/20 hover:bg-emerald-400/[0.06] hover:text-emerald-50'
                        }`}
                      >
                        <span className="block text-[10px] uppercase tracking-[0.18em] text-emerald-200/58">
                          {item.eyebrow}
                        </span>
                        <span className="mt-1 block text-[0.82rem] font-semibold leading-5">{item.title}</span>
                      </Link>
                      {active ? (
                        <div className="ml-3 mt-2 grid gap-1 border-l border-emerald-300/14 pl-3">
                          {item.sections.map((section, index) => (
                            <a
                              key={section.id}
                              href={`#${section.id}`}
                              className="rounded-xl px-2 py-1.5 text-[0.76rem] leading-5 text-white/52 transition hover:bg-white/[0.04] hover:text-emerald-100"
                            >
                              {String(index + 1).padStart(2, '0')} {section.title}
                            </a>
                          ))}
                          {item.apiReference?.map((section) => (
                            <a
                              key={section.id}
                              href={`#${section.id}`}
                              className="rounded-xl px-2 py-1.5 text-[0.76rem] leading-5 text-white/52 transition hover:bg-white/[0.04] hover:text-emerald-100"
                            >
                              API / {section.title}
                            </a>
                          ))}
                          {item.slug === 'terminal-actions' ? (
                            <a
                              href="#terminal-actions"
                              className="rounded-xl px-2 py-1.5 text-[0.76rem] leading-5 text-white/52 transition hover:bg-white/[0.04] hover:text-emerald-100"
                            >
                              Action manual
                            </a>
                          ) : null}
                          {item.slug === 'read-results' ? (
                            <a
                              href="#terminal-reads"
                              className="rounded-xl px-2 py-1.5 text-[0.76rem] leading-5 text-white/52 transition hover:bg-white/[0.04] hover:text-emerald-100"
                            >
                              Read guide
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </nav>
  );
}

function GuideCard({
  card,
  index,
}: {
  card: BitcodeDocsPage['sections'][number];
  index: number;
}) {
  return (
    <article
      id={card.id}
      className="scroll-mt-32 rounded-[28px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-200/72">{card.eyebrow}</p>
        <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] text-white/45">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">{card.title}</h2>
      <p className="mt-3 text-sm leading-7 text-white/80">{card.summary}</p>
      <p className="mt-3 text-sm leading-7 text-emerald-50/64">{card.detail}</p>
      {card.reason ? (
        <div className="mt-4 rounded-2xl border border-emerald-300/10 bg-emerald-400/[0.045] px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/70">Why this matters</p>
          <p className="mt-2 text-sm leading-6 text-emerald-50/76">{card.reason}</p>
        </div>
      ) : null}
      {card.points?.length ? (
        <ul className="mt-4 grid gap-2">
          {card.points.map((point) => (
            <li
              key={point}
              className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm leading-6 text-white/74"
            >
              {point}
            </li>
          ))}
        </ul>
      ) : null}
      {card.steps?.length ? (
        <ol className="mt-4 grid gap-2">
          {card.steps.map((step, stepIndex) => (
            <li
              key={step}
              className="grid gap-3 rounded-2xl border border-cyan-300/10 bg-cyan-400/[0.035] px-3 py-2 text-sm leading-6 text-cyan-50/74 tablet:grid-cols-[2.75rem_1fr]"
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/58">
                {String(stepIndex + 1).padStart(2, '0')}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </article>
  );
}

function EmbeddedUiSpecimen({ specimen }: { specimen: DocsEmbeddedUiSpecimen }) {
  return (
    <TerminalWorkspaceCard
      id={specimen.id}
      kicker={specimen.eyebrow}
      title={specimen.title}
      summary={specimen.summary}
      explainer={specimen.explainer}
      size="compact"
      tone="emerald"
      className="scroll-mt-32"
      childrenClassName="space-y-4"
    >
      {specimen.signals?.length ? (
        <div className="grid gap-3 tablet:grid-cols-3">
          {specimen.signals.map((signal) => (
            <div
              key={`${specimen.id}-${signal.label}`}
              className={`rounded-2xl border px-4 py-3 ${signalToneClassName(signal.tone)}`}
            >
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-65">{signal.label}</p>
              <p className="mt-2 text-sm font-semibold">{signal.value}</p>
            </div>
          ))}
        </div>
      ) : null}
      {specimen.steps?.length ? (
        <div className="grid gap-3 tablet:grid-cols-3">
          {specimen.steps.map((step, index) => (
            <article
              key={`${specimen.id}-${step.label}`}
              className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/62">
                {String(index + 1).padStart(2, '0')} / {step.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/76">{step.body}</p>
            </article>
          ))}
        </div>
      ) : null}
    </TerminalWorkspaceCard>
  );
}

function EmbeddedUiSection({ specimens }: { specimens: readonly DocsEmbeddedUiSpecimen[] }) {
  if (!specimens.length) return null;

  return (
    <section className="grid gap-4">
      <div className="rounded-[28px] border border-cyan-300/10 bg-cyan-400/[0.035] p-5">
        <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-200/72">Interface preview</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          Learn with the same UI grammar used in Terminal
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-cyan-50/72">
          These embedded specimens reuse the Terminal card and explainer pattern so docs readers
          become familiar with the real product surfaces before they operate against them.
        </p>
      </div>
      {specimens.map((specimen) => (
        <EmbeddedUiSpecimen key={specimen.id} specimen={specimen} />
      ))}
    </section>
  );
}

function InterfaceApiReferenceSection({ sections }: { sections: readonly DocsInterfaceApiSection[] }) {
  if (!sections.length) return null;

  return (
    <section className="grid gap-5">
      <div className="rounded-[32px] border border-emerald-300/12 bg-emerald-400/[0.045] p-5">
        <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-200/72">API reference</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Usage features, inputs, and expected outputs
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-50/72">
          These references are grounded in the package code. Read them like API docs: when to call
          the feature, how to shape the payload, what should come back, and where Terminal or
          Exchange should verify the result.
        </p>
      </div>

      {sections.map((section) => (
        <article
          key={section.id}
          id={section.id}
          className="scroll-mt-32 rounded-[32px] border border-white/10 bg-black/24 p-5 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-3 tablet:flex-row tablet:items-start tablet:justify-between">
            <div className="max-w-3xl">
              <h3 className="text-2xl font-semibold tracking-tight text-white">{section.title}</h3>
              <p className="mt-2 text-sm leading-7 text-white/70">{section.summary}</p>
            </div>
            <code className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[0.68rem] text-emerald-100/74">
              {section.packagePath}
            </code>
          </div>

          <div className="mt-5 grid gap-4">
            {section.features.map((feature) => (
              <div
                key={`${section.id}-${feature.name}`}
                className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
              >
                <div className="flex flex-col gap-3 tablet:flex-row tablet:items-start tablet:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="break-all rounded-full border border-cyan-300/12 bg-cyan-400/[0.06] px-3 py-1.5 text-[0.72rem] text-cyan-50">
                        {feature.name}
                      </code>
                      {feature.method ? (
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/52">
                          {feature.method}
                        </span>
                      ) : null}
                      {feature.requiresConfirmation ? (
                        <span className="rounded-full border border-amber-300/20 bg-amber-400/[0.08] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-100/72">
                          confirmed write
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/76">{feature.useWhen}</p>
                  </div>
                  <code className="rounded-full border border-white/8 bg-black/20 px-3 py-1.5 text-[0.66rem] text-white/45">
                    {feature.packagePath}
                  </code>
                </div>

                <div className="mt-4 rounded-2xl border border-emerald-300/10 bg-emerald-400/[0.035] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/70">How to use</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-50/76">{feature.howToUse}</p>
                </div>

                <div className="mt-4 grid gap-3 laptop:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-black/18 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Inputs</p>
                    <ul className="mt-3 grid gap-2">
                      {feature.inputs.map((input) => (
                        <li key={`${feature.name}-input-${input}`} className="text-sm leading-6 text-white/70">
                          {input}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/18 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/62">Expected outputs</p>
                    <ul className="mt-3 grid gap-2">
                      {feature.outputs.map((output) => (
                        <li key={`${feature.name}-output-${output}`} className="text-sm leading-6 text-cyan-50/72">
                          {output}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {feature.verifyInTerminal || feature.failureModes?.length ? (
                  <div className="mt-4 grid gap-3 laptop:grid-cols-2">
                    {feature.verifyInTerminal ? (
                      <div className="rounded-2xl border border-emerald-300/10 bg-emerald-400/[0.035] p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/68">Verify</p>
                        <p className="mt-2 text-sm leading-6 text-emerald-50/70">{feature.verifyInTerminal}</p>
                      </div>
                    ) : null}
                    {feature.failureModes?.length ? (
                      <div className="rounded-2xl border border-amber-300/12 bg-amber-400/[0.045] p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-100/72">Failure posture</p>
                        <ul className="mt-3 grid gap-2">
                          {feature.failureModes.map((mode) => (
                            <li key={`${feature.name}-failure-${mode}`} className="text-sm leading-6 text-amber-50/72">
                              {mode}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

function TerminalActionsSection() {
  return (
    <section id="terminal-actions" className="scroll-mt-32 rounded-[32px] border border-white/10 bg-black/24 p-5 backdrop-blur-xl">
      <div className="max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-200/72">Action manual</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Write deliberately, then read the result
        </h2>
        <p className="mt-3 text-sm leading-7 text-white/72">
          The Terminal is not a button pile. Each write changes a bounded part of Bitcode state,
          and each expected read tells you whether to continue, stop, or open exact proof detail.
        </p>
      </div>
      <div className="mt-6 grid gap-3">
        {TERMINAL_ACTION_GUIDES.map((item, index) => (
          <article
            id={item.id}
            key={item.id}
            className="grid scroll-mt-32 gap-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-4 tablet:grid-cols-[0.7fr_1fr_1fr]"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-200/70">
                {String(index + 1).padStart(2, '0')} / {item.location}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">{item.action}</h3>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Write</p>
              <p className="mt-2 text-sm leading-6 text-white/76">{item.write}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/65">
                Expected read
              </p>
              <p className="mt-2 text-sm leading-6 text-emerald-50/76">{item.expectedRead}</p>
              <p className="mt-3 rounded-2xl border border-emerald-300/10 bg-emerald-400/[0.045] px-3 py-2 text-xs leading-5 text-emerald-50/64">
                {item.proofSignal}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TerminalReadsSection() {
  return (
    <section id="terminal-reads" className="scroll-mt-32 rounded-[32px] border border-white/10 bg-black/24 p-5 backdrop-blur-xl">
      <div className="max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-200/72">Read guide</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Expected results and proof-bearing reads
        </h2>
        <p className="mt-3 text-sm leading-7 text-white/72">
          These are the read surfaces a Terminal user should trust before moving from source
          supply into fit, closure, settlement, or ledger history.
        </p>
      </div>
      <div className="mt-6 grid gap-3 tablet:grid-cols-2">
        {TERMINAL_READ_GUIDES.map((item) => (
          <article key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/68">{item.location}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{item.read}</h3>
            <p className="mt-2 text-sm leading-6 text-white/74">{item.tellsYou}</p>
            <p className="mt-3 rounded-2xl border border-cyan-300/10 bg-cyan-400/[0.045] px-3 py-2 text-xs leading-5 text-cyan-50/68">
              {item.expectedResult}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function NextReadingCards({ page }: { page: BitcodeDocsPage }) {
  if (page.slug === 'terminal') {
    return (
      <div className="grid gap-4 tablet:grid-cols-2">
        <Link
          href="/docs/terminal-actions"
          className="rounded-[28px] border border-emerald-300/14 bg-emerald-400/[0.06] p-5 transition hover:border-emerald-300/28 hover:bg-emerald-400/[0.1]"
        >
          <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-200/70">Next</p>
          <p className="mt-2 text-xl font-semibold text-white">Read every Terminal write action</p>
          <p className="mt-2 text-sm leading-6 text-white/68">
            Continue into the action manual when you want exact operator writes and expected results.
          </p>
        </Link>
        <Link
          href="/docs/read-results"
          className="rounded-[28px] border border-cyan-300/14 bg-cyan-400/[0.05] p-5 transition hover:border-cyan-300/28 hover:bg-cyan-400/[0.09]"
        >
          <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-200/70">Audit</p>
          <p className="mt-2 text-xl font-semibold text-white">Read proofs and readiness</p>
          <p className="mt-2 text-sm leading-6 text-white/68">
            Move to read surfaces when you read to verify state before trusting the flow.
          </p>
        </Link>
      </div>
    );
  }

  return null;
}

export default function DocsArticlePage({ page }: DocsArticlePageProps) {
  const activeChapter = BITCODE_DOCS_CHAPTERS.find((chapter) => chapter.id === page.chapterId);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(34,211,238,0.1),transparent_26%),linear-gradient(180deg,#04101a_0%,#030816_42%,#02060d_100%)] text-white">
      <main className="mx-auto grid w-full max-w-[1400px] gap-8 px-4 pb-16 pt-32 phone:px-5 tablet:px-6 laptop:grid-cols-[320px_minmax(0,1fr)] laptop:px-8">
        <aside className="laptop:sticky laptop:top-28 laptop:self-start">
          <DocsPageRail page={page} />
        </aside>
        <div className="min-w-0 space-y-8">
          <section className="overflow-hidden rounded-[36px] border border-white/10 bg-black/24 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.34)] backdrop-blur-xl tablet:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-300/14 bg-emerald-400/[0.06] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-100/70">
                {activeChapter ? `${activeChapter.number} / ${activeChapter.title}` : page.eyebrow}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/55">
                {page.eyebrow}
              </span>
            </div>
            <h1 className="mt-4 max-w-[14ch] text-[2.45rem] font-semibold leading-[0.98] tracking-[-0.025em] text-white phone:text-[3rem] tablet:text-[4rem]">
              {page.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/80">{page.summary}</p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50/65">{page.detail}</p>
            <div className="mt-5 rounded-[24px] border border-cyan-300/10 bg-cyan-400/[0.035] px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-200/70">After reading</p>
              <p className="mt-2 text-sm leading-6 text-cyan-50/76">{page.learningOutcome}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={page.primaryCta.href}
                className="inline-flex rounded-full border border-emerald-300/24 bg-emerald-400/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50 transition hover:border-emerald-300/42 hover:bg-emerald-400/18"
              >
                {page.primaryCta.label}
              </Link>
              <Link
                href="/docs"
                className="inline-flex rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/76 transition hover:border-white/22 hover:bg-white/10"
              >
                Docs hub
              </Link>
              {page.slug === 'auxillaries' || page.slug === 'commercial-interfaces' ? (
                <a
                  href={BITCODE_GITHUB_APP_PUBLIC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-cyan-300/22 bg-cyan-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-50 transition hover:border-cyan-300/42 hover:bg-cyan-400/16"
                >
                  Install GitHub App
                </a>
              ) : null}
            </div>
          </section>

          <section className="grid gap-4">
            {page.sections.map((card, index) => (
              <GuideCard key={card.id} card={card} index={index} />
            ))}
          </section>

          <EmbeddedUiSection specimens={page.embeddedUi ?? []} />
          <InterfaceApiReferenceSection sections={page.apiReference ?? []} />
          {page.slug === 'terminal-actions' ? <TerminalActionsSection /> : null}
          {page.slug === 'read-results' ? <TerminalReadsSection /> : null}
          <NextReadingCards page={page} />
        </div>
      </main>
      <Footer showPrimaryContent={false} className="border-white/10 bg-[#02060d]/72 backdrop-blur-xl" />
    </div>
  );
}
