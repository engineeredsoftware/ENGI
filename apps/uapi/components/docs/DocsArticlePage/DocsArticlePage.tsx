/**
 * Docs article page shell — composes rail, guide cards, specimens, and manuals.
 */
import React from 'react';
import Link from 'next/link';

import Footer from '@/components/bitcode/layout/Footer/Footer';
import { BITCODE_GITHUB_APP_PUBLIC_URL } from '@/lib/github-app-url';
import {
  BITCODE_DOCS_CHAPTERS,
  type BitcodeDocsPage,
} from '@/components/docs/models/bitcode-docs-content';
import { DocsPageRail } from '@/components/docs/DocsPageRail/DocsPageRail';
import { DocsGuideCard } from '@/components/docs/DocsGuideCard/DocsGuideCard';
import { DocsEmbeddedUiSection } from '@/components/docs/DocsEmbeddedUiSection/DocsEmbeddedUiSection';
import { DocsInterfaceApiReferenceSection } from '@/components/docs/DocsInterfaceApiReferenceSection/DocsInterfaceApiReferenceSection';
import { DocsProductActionsSection } from '@/components/docs/DocsProductActionsSection/DocsProductActionsSection';
import { DocsProductReadsSection } from '@/components/docs/DocsProductReadsSection/DocsProductReadsSection';
import { DocsNextReadingCards } from '@/components/docs/DocsNextReadingCards/DocsNextReadingCards';

type DocsArticlePageProps = {
  page: BitcodeDocsPage;
};

export default function DocsArticlePage({ page }: DocsArticlePageProps) {
  const activeChapter = BITCODE_DOCS_CHAPTERS.find((chapter) => chapter.id === page.chapterId);

  return (
    <div className="min-h-screen min-w-0 max-w-[100vw] overflow-x-clip bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(34,211,238,0.1),transparent_26%),linear-gradient(180deg,#04101a_0%,#030816_42%,#02060d_100%)] text-white">
      <main className="mx-auto grid w-full min-w-0 max-w-[1400px] gap-8 px-4 pb-16 pt-32 phone:px-5 tablet:px-6 laptop:grid-cols-[minmax(0,320px)_minmax(0,1fr)] laptop:px-8">
        <aside className="min-w-0 max-w-full laptop:sticky laptop:top-28 laptop:self-start">
          <DocsPageRail page={page} />
        </aside>
        <div className="min-w-0 max-w-full space-y-8 overflow-x-clip">
          <section className="min-w-0 max-w-full overflow-hidden rounded-none border border-white/10 bg-black/24 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.34)] backdrop-blur-xl phone:p-6 tablet:p-8">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="max-w-full truncate rounded-none border border-emerald-300/14 bg-emerald-400/[0.06] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-100/70">
                {activeChapter ? `${activeChapter.number} / ${activeChapter.title}` : page.eyebrow}
              </span>
              <span className="max-w-full truncate rounded-none border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/55">
                {page.eyebrow}
              </span>
            </div>
            <h1 className="mt-4 max-w-full break-words text-[2.1rem] font-semibold leading-[1.02] tracking-[-0.025em] text-white phone:text-[2.45rem] tablet:max-w-[14ch] tablet:text-[3rem] tablet:leading-[0.98] laptop:text-[4rem]">
              {page.title}
            </h1>
            <p className="mt-5 max-w-3xl break-words text-base leading-8 text-white/80">{page.summary}</p>
            <p className="mt-4 max-w-3xl break-words text-sm leading-7 text-emerald-50/65">{page.detail}</p>
            <div className="mt-5 min-w-0 rounded-none border border-cyan-300/10 bg-cyan-400/[0.035] px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-200/70">After reading</p>
              <p className="mt-2 break-words text-sm leading-6 text-cyan-50/76">{page.learningOutcome}</p>
            </div>
            <div className="mt-6 flex min-w-0 flex-wrap gap-3">
              <Link
                href={page.primaryCta.href}
                className="inline-flex max-w-full rounded-none border border-emerald-300/24 bg-emerald-400/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50 transition hover:border-emerald-300/42 hover:bg-emerald-400/18"
              >
                {page.primaryCta.label}
              </Link>
              <Link
                href="/docs"
                className="inline-flex rounded-none border border-white/12 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/76 transition hover:border-white/22 hover:bg-white/10"
              >
                Docs hub
              </Link>
              {page.slug === 'auxillaries' || page.slug === 'commercial-interfaces' ? (
                <a
                  href={BITCODE_GITHUB_APP_PUBLIC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-none border border-cyan-300/22 bg-cyan-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-50 transition hover:border-cyan-300/42 hover:bg-cyan-400/16"
                >
                  Install GitHub App
                </a>
              ) : null}
            </div>
          </section>

          <section className="grid min-w-0 gap-4">
            {page.sections.map((card, index) => (
              <DocsGuideCard key={card.id} card={card} index={index} />
            ))}
          </section>

          <DocsEmbeddedUiSection specimens={page.embeddedUi ?? []} />
          <DocsInterfaceApiReferenceSection sections={page.apiReference ?? []} />
          {page.slug === 'product-actions' ? <DocsProductActionsSection /> : null}
          {page.slug === 'read-results' ? <DocsProductReadsSection /> : null}
          <DocsNextReadingCards page={page} />
        </div>
      </main>
      <Footer showPrimaryContent={false} className="border-white/10 bg-[#02060d]/72 backdrop-blur-xl" />
    </div>
  );
}
