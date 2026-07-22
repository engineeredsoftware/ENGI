'use client';

/**
 * Shared workspace card chrome for pipeline/read panels.
 * Relocated from productWorkspaceCard.
 */


import React, { type ReactNode } from 'react';

import BitcodeInlineExplainer from '@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer';
import type { BitcodeExplainer } from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';

interface BitcodeWorkspaceCardProps {
  id?: string;
  kicker: string;
  title: string;
  summary?: string;
  children: ReactNode;
  tone?: 'default' | 'emerald';
  size?: 'default' | 'compact';
  className?: string;
  childrenClassName?: string;
  headerAside?: ReactNode;
  explainer?: BitcodeExplainer;
}

export default function BitcodeWorkspaceCard({
  id,
  kicker,
  title,
  summary,
  children,
  tone = 'default',
  size = 'default',
  className,
  childrenClassName,
  headerAside,
  explainer,
}: BitcodeWorkspaceCardProps) {
  const toneClassName =
    tone === 'emerald'
      ? 'border-emerald-400/15 bg-[linear-gradient(180deg,rgba(8,14,28,0.96),rgba(4,8,18,0.94))] shadow-[0_24px_80px_rgba(0,0,0,0.42)]'
      : 'border-white/10 bg-[linear-gradient(180deg,rgba(7,11,22,0.96),rgba(4,8,18,0.94))] shadow-[0_24px_80px_rgba(0,0,0,0.38)]';
  const sizeClassName = size === 'compact' ? 'rounded-none p-5' : 'rounded-none px-6 py-6';
  const titleClassName = size === 'compact' ? 'text-xl' : 'text-2xl tablet:text-[2.05rem]';
  const summaryClassName =
    size === 'compact' ? 'text-sm leading-6 text-neutral-300' : 'text-sm leading-7 text-neutral-300';

  return (
    <section
      id={id}
      className={`min-w-0 max-w-full overflow-hidden border ${sizeClassName} ${toneClassName} ${className || ''}`.trim()}
    >
      <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 max-w-3xl">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="min-w-0 text-[0.72rem] uppercase tracking-[0.22em] text-emerald-300/80 phone:tracking-[0.3em]">
              {kicker}
            </p>
            {explainer ? (
              <BitcodeInlineExplainer
                explainer={explainer}
                side="bottom"
                triggerClassName="h-4.5 w-4.5 shrink-0 border-emerald-400/20 bg-emerald-400/8 text-[0.58rem] text-emerald-100"
              />
            ) : null}
          </div>
          <h3 className={`mt-3 break-words font-semibold tracking-tight text-white ${titleClassName}`.trim()}>
            {title}
          </h3>
          {summary ? (
            <p className={`mt-3 max-w-3xl break-words ${summaryClassName}`.trim()}>{summary}</p>
          ) : null}
        </div>
        {headerAside ? <div className="min-w-0 shrink-0">{headerAside}</div> : null}
      </div>

      <div className={`mt-6 min-w-0 ${childrenClassName || 'space-y-6'}`.trim()}>{children}</div>
    </section>
  );
}

