'use client';

/**
 * Empty-state shell for the deposit/read workbench when no live snapshot is ready.
 */


import React from 'react';

import BitcodeWorkspaceCard from '@/components/bitcode/pipeline/BitcodeWorkspaceCard/BitcodeWorkspaceCard';
import { TERMINAL_WORKSPACE_EXPLAINERS } from '@/components/bitcode/pipeline/models/workspace-explainers';
import { TERMINAL_ENTERPRISE_READING_STEPS } from '@/components/reads/models/deposit-read-workbench';

export default function ReadsDepositReadWorkbenchEmpty() {
  return (
    <BitcodeWorkspaceCard
      id="terminalDepositReadWorkbench"
      kicker="Deposit + read chain"
      title="Read supply, read measurement, and fit together"
      summary="Reading the live deposit-side source, read measurement, and asset-pack fit posture."
      explainer={TERMINAL_WORKSPACE_EXPLAINERS.depositReadChain}
    >
      <p className="mt-4 text-sm leading-6 text-neutral-300">
        Reading the live Bitcode workbench. The enterprise Reading path runs ReadNeedComprehensionSynthesis
        before ReadFitsFindingSynthesis, and it remains visible even before a repository is selected.
      </p>
      <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {TERMINAL_ENTERPRISE_READING_STEPS.map((stage) => (
          <li key={stage.id} className="border-l border-sky-300/30 pl-3">
            <p className="text-sm font-semibold text-neutral-100">{stage.label}</p>
            <p className="mt-1 text-xs leading-5 text-neutral-400">{stage.lowDetailGuidance}</p>
          </li>
        ))}
      </ol>
    </BitcodeWorkspaceCard>
  );
}
