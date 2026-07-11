'use client';

import React, { type ReactNode } from 'react';

import BitcodeInlineExplainer from '@/components/bitcode/execution/BitcodeInlineExplainer';
import type { BitcodeExplainer } from '@/components/bitcode/execution/bitcode-transaction-types';

interface TerminalWorkspaceCardProps {
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

export default function TerminalWorkspaceCard({
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
}: TerminalWorkspaceCardProps) {
  const toneClassName =
    tone === 'emerald'
      ? 'border-emerald-400/15 bg-[linear-gradient(180deg,rgba(8,14,28,0.96),rgba(4,8,18,0.94))] shadow-[0_24px_80px_rgba(0,0,0,0.42)]'
      : 'border-white/10 bg-[linear-gradient(180deg,rgba(7,11,22,0.96),rgba(4,8,18,0.94))] shadow-[0_24px_80px_rgba(0,0,0,0.38)]';
  const sizeClassName = size === 'compact' ? 'rounded-[1.75rem] p-5' : 'rounded-[2rem] px-6 py-6';
  const titleClassName = size === 'compact' ? 'text-xl' : 'text-2xl tablet:text-[2.05rem]';
  const summaryClassName =
    size === 'compact' ? 'text-sm leading-6 text-neutral-300' : 'text-sm leading-7 text-neutral-300';

  return (
    <section
      id={id}
      className={`overflow-hidden border ${sizeClassName} ${toneClassName} ${className || ''}`.trim()}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[0.72rem] uppercase tracking-[0.3em] text-emerald-300/80">{kicker}</p>
            {explainer ? (
              <BitcodeInlineExplainer
                explainer={explainer}
                side="bottom"
                triggerClassName="h-4.5 w-4.5 border-emerald-400/20 bg-emerald-400/8 text-[0.58rem] text-emerald-100"
              />
            ) : null}
          </div>
          <h3 className={`mt-3 font-semibold tracking-tight text-white ${titleClassName}`.trim()}>{title}</h3>
          {summary ? <p className={`mt-3 max-w-3xl ${summaryClassName}`.trim()}>{summary}</p> : null}
        </div>
        {headerAside ? <div className="shrink-0">{headerAside}</div> : null}
      </div>

      <div className={`mt-6 ${childrenClassName || 'space-y-6'}`.trim()}>{children}</div>
    </section>
  );
}
