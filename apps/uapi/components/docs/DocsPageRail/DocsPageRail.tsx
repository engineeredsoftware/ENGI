/**
 * Sticky chapter/page rail for the docs article layout.
 * Scrolls the active page entry into view when the route changes (e.g. landing → /docs/mcp-api).
 */
'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

import {
  BITCODE_DOCS_CHAPTERS,
  type BitcodeDocsPage,
} from '@/components/docs/models/bitcode-docs-content';

export function DocsPageRail({ page }: { page: BitcodeDocsPage }) {
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const active = activeLinkRef.current;
    const nav = navRef.current;
    if (!active || !nav) return;
    // Scroll the sticky rail's own overflow container so MCP/API (etc.) is visible.
    active.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [page.slug, page.href]);

  return (
    <nav
      ref={navRef}
      aria-label="Bitcode docs table of contents"
      className="max-h-[calc(100vh-8rem)] overflow-y-auto rounded-none border border-white/10 bg-black/24 p-3 backdrop-blur-xl"
    >
      <Link
        href="/docs"
        className="block rounded-none border border-white/8 bg-white/[0.03] px-3 py-3 text-sm font-semibold text-white/82 transition hover:border-emerald-300/20 hover:bg-emerald-400/[0.06] hover:text-emerald-50"
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
                        <span className="mt-1 block text-[0.82rem] font-semibold leading-5">{item.title}</span>
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
    </nav>
  );
}
