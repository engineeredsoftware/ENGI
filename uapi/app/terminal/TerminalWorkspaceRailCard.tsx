'use client';

import React, { type ReactNode } from 'react';

import type { BitcodeExplainer } from '@/components/bitcode/pipeline/bitcode-transaction-types';

import TerminalWorkspaceCard from './TerminalWorkspaceCard';

interface TerminalWorkspaceRailCardProps {
  kicker: string;
  title: string;
  summary?: string;
  children: ReactNode;
  tone?: 'default' | 'emerald';
  explainer?: BitcodeExplainer;
}

export default function TerminalWorkspaceRailCard({
  kicker,
  title,
  summary,
  children,
  tone = 'default',
  explainer,
}: TerminalWorkspaceRailCardProps) {
  return (
    <TerminalWorkspaceCard
      kicker={kicker}
      title={title}
      summary={summary}
      tone={tone}
      size="compact"
      childrenClassName="mt-5"
      explainer={explainer}
    >
      {children}
    </TerminalWorkspaceCard>
  );
}
