/**
 * Single guide section card within a docs article.
 */
import React from 'react';
import type { BitcodeDocsPage } from '@/components/docs/models/bitcode-docs-types';

export function DocsGuideCard({
  card,
  index,
}: {
  card: BitcodeDocsPage['sections'][number];
  index: number;
}) {
  return (
    <article
      id={card.id}
      className="scroll-mt-32 rounded-none border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-200/72">{card.eyebrow}</p>
        <span className="rounded-none border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] text-white/45">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">{card.title}</h2>
      <p className="mt-3 text-sm leading-7 text-white/80">{card.summary}</p>
      <p className="mt-3 text-sm leading-7 text-emerald-50/64">{card.detail}</p>
      {card.reason ? (
        <div className="mt-4 rounded-none border border-emerald-300/10 bg-emerald-400/[0.045] px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/70">Why this matters</p>
          <p className="mt-2 text-sm leading-6 text-emerald-50/76">{card.reason}</p>
        </div>
      ) : null}
      {card.points?.length ? (
        <ul className="mt-4 grid gap-2">
          {card.points.map((point) => (
            <li
              key={point}
              className="rounded-none border border-white/8 bg-white/[0.03] px-3 py-2 text-sm leading-6 text-white/74"
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
              className="grid gap-3 rounded-none border border-cyan-300/10 bg-cyan-400/[0.035] px-3 py-2 text-sm leading-6 text-cyan-50/74 tablet:grid-cols-[2.75rem_1fr]"
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
