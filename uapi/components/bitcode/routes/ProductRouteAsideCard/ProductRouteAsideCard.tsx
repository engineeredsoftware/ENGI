'use client';

/**
 * Collapsible product-route aside card — kicker + title header with top-right
 * chevron. Defaults collapsed (title chrome only); expand to show body rows.
 * Shared by Deposit and Read route state asides.
 *
 * Header is CSS grid (1fr | auto) so long titles + explainer never cover the
 * chevron (absolute positioning failed on Earnings' long title).
 */

import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type ProductRouteAsideCardTone = 'emerald' | 'orange' | 'violet' | 'neutral';

const KICKER_TONE: Record<ProductRouteAsideCardTone, string> = {
  emerald: 'text-emerald-200/80',
  orange: 'text-orange-200/80',
  violet: 'text-violet-200/80',
  neutral: 'text-neutral-500',
};

const CHEVRON_TONE: Record<ProductRouteAsideCardTone, string> = {
  emerald: 'text-emerald-200/70 hover:text-emerald-100',
  orange: 'text-orange-200/70 hover:text-orange-100',
  violet: 'text-violet-200/70 hover:text-violet-100',
  neutral: 'text-neutral-400 hover:text-neutral-200',
};

export type ProductRouteAsideCardProps = {
  kicker: string;
  title: string;
  tone?: ProductRouteAsideCardTone;
  /** Optional control next to the title (e.g. BitcodeInlineExplainer). Sibling of the toggle — not nested. */
  titleAccessory?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function ProductRouteAsideCard({
  kicker,
  title,
  tone = 'emerald',
  titleAccessory,
  defaultOpen = false,
  children,
  className = '',
}: ProductRouteAsideCardProps) {
  // Always start from prop; do not re-open on parent re-render.
  const [open, setOpen] = useState(() => Boolean(defaultOpen));
  const panelId = useId();
  const toggle = () => setOpen((value) => !value);

  return (
    <section
      className={`border border-white/10 bg-white/[0.035] px-4 py-4 ${className}`.trim()}
      data-aside-card-open={open ? 'true' : 'false'}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2">
        <div className="min-w-0">
          <button
            type="button"
            className="w-full min-w-0 text-left"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={toggle}
          >
            <p
              className={`text-[0.68rem] uppercase tracking-[0.22em] ${KICKER_TONE[tone]}`}
            >
              {kicker}
            </p>
          </button>
          <div className="mt-2 flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="min-w-0 flex-1 truncate text-left text-lg font-semibold text-white"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={toggle}
              title={title}
            >
              {title}
            </button>
            {titleAccessory ? (
              <span className="shrink-0">{titleAccessory}</span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className={`mt-0.5 shrink-0 self-start rounded-sm p-0.5 transition-colors ${CHEVRON_TONE[tone]}`}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
          onClick={toggle}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              open ? 'rotate-0' : '-rotate-90'
            }`}
            aria-hidden="true"
          />
        </button>
      </div>

      {open ? (
        <div id={panelId} className="mt-4">
          {children}
        </div>
      ) : (
        <div id={panelId} hidden />
      )}
    </section>
  );
}
