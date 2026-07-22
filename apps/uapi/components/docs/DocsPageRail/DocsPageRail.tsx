/**
 * Sticky chapter/page rail for the docs article layout.
 * Accordion page selector: collapsed by default; collapses again on route change.
 * When open, scrolls the active page entry into view.
 */
'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon } from '@radix-ui/react-icons';

import {
  BITCODE_DOCS_CHAPTERS,
  type BitcodeDocsPage,
} from '@/components/docs/models/bitcode-docs-content';

export function DocsPageRail({ page }: { page: BitcodeDocsPage }) {
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null);
  const panelId = useId();
  // Collapsed by default; any page navigation re-collapses (see effect below).
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [page.slug, page.href]);

  useEffect(() => {
    if (!isOpen) return;
    const active = activeLinkRef.current;
    if (!active || typeof active.scrollIntoView !== 'function') return;
    // Scroll the open rail's overflow container so the active page is visible.
    active.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [isOpen, page.slug, page.href]);

  return (
    <nav
      aria-label="Bitcode docs table of contents"
      className="min-w-0 max-w-full overflow-x-clip rounded-none border border-white/10 bg-black/24 backdrop-blur-xl"
      data-docs-rail-open={isOpen ? 'true' : 'false'}
    >
      <div className="flex min-w-0 items-stretch gap-px border-b border-white/8">
        <Link
          href="/docs"
          className="shrink-0 border-r border-white/8 px-2.5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70 transition hover:bg-emerald-400/[0.06] hover:text-emerald-50 phone:px-3 phone:tracking-[0.16em]"
        >
          Docs home
        </Link>
        <button
          type="button"
          id={`${panelId}-trigger`}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((open) => !open)}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 overflow-hidden px-2.5 py-3 text-left transition hover:bg-emerald-400/[0.06] phone:px-3"
          data-testid="docs-page-rail-toggle"
        >
          <span className="min-w-0">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-emerald-200/70">
              {isOpen ? 'Hide pages' : 'Pages'}
            </span>
            <span className="mt-0.5 block truncate text-[0.82rem] font-semibold leading-5 text-white/88">
              {page.title}
            </span>
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 shrink-0 text-emerald-200/80 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>
      </div>

      <div
        id={panelId}
        role="region"
        aria-labelledby={`${panelId}-trigger`}
        hidden={!isOpen}
        className={
          isOpen
            ? 'max-h-[min(28rem,calc(100vh-10rem))] overflow-y-auto p-3'
            : undefined
        }
      >
        {isOpen ? (
          <div className="grid gap-4">
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
                        <div key={item.href} data-docs-rail-page={item.slug}>
                          <Link
                            ref={active ? activeLinkRef : undefined}
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            data-docs-rail-active={active ? 'true' : undefined}
                            className={`block rounded-none border px-3 py-2.5 transition ${
                              active
                                ? 'border-emerald-300/28 bg-emerald-400/10 text-emerald-50'
                                : 'border-white/8 bg-white/[0.025] text-white/66 hover:border-emerald-300/20 hover:bg-emerald-400/[0.06] hover:text-emerald-50'
                            }`}
                          >
                            <span className="block text-[10px] uppercase tracking-[0.18em] text-emerald-200/58">
                              {item.eyebrow}
                            </span>
                            <span className="mt-1 block text-[0.82rem] font-semibold leading-5">
                              {item.title}
                            </span>
                          </Link>
                          {active ? (
                            <div className="ml-3 mt-2 grid gap-1 border-l border-emerald-300/14 pl-3">
                              {item.sections.map((section, index) => (
                                <a
                                  key={section.id}
                                  href={`#${section.id}`}
                                  className="rounded-none px-2 py-1.5 text-[0.76rem] leading-5 text-white/52 transition hover:bg-white/[0.04] hover:text-emerald-100"
                                >
                                  {String(index + 1).padStart(2, '0')} {section.title}
                                </a>
                              ))}
                              {item.apiReference?.map((section) => (
                                <a
                                  key={section.id}
                                  href={`#${section.id}`}
                                  className="rounded-none px-2 py-1.5 text-[0.76rem] leading-5 text-white/52 transition hover:bg-white/[0.04] hover:text-emerald-100"
                                >
                                  API / {section.title}
                                </a>
                              ))}
                              {item.slug === 'product-actions' ? (
                                <a
                                  href="#product-actions"
                                  className="rounded-none px-2 py-1.5 text-[0.76rem] leading-5 text-white/52 transition hover:bg-white/[0.04] hover:text-emerald-100"
                                >
                                  Action manual
                                </a>
                              ) : null}
                              {item.slug === 'read-results' ? (
                                <a
                                  href="#product-reads"
                                  className="rounded-none px-2 py-1.5 text-[0.76rem] leading-5 text-white/52 transition hover:bg-white/[0.04] hover:text-emerald-100"
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
        ) : null}
      </div>
    </nav>
  );
}
