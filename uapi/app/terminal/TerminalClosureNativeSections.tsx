'use client';

import { useMemo } from 'react';

import BitcodeChipCloud from '@/components/bitcode/execution/BitcodeChipCloud';
import BitcodeDetailRowList from '@/components/bitcode/execution/BitcodeDetailRowList';
import BitcodeMetricGrid from '@/components/bitcode/execution/BitcodeMetricGrid';

import TerminalWorkspaceCard from './TerminalWorkspaceCard';
import { TERMINAL_WORKSPACE_EXPLAINERS } from './terminal-workspace-explainers';
import { CLOSURE_PANEL_SUBSTRUCTURE, getActivityDetailSection } from './terminal-experience-architecture';
import { useTerminalShellBridge } from './terminal-shell-bridge';
import { jumpToShellSection, toneForPanel } from './terminal-shell-reading';
import {
  normalizeTerminalClosureState,
  type TerminalClosurePanel,
  type TerminalClosureState,
} from './terminal-closure-state';

const PANEL_IDS: Record<TerminalClosurePanel['id'], string> = {
  'read-review': 'panelReading',
  verification: 'panelEvaluations',
  branch: 'panelBranchArtifacts',
  settlement: 'panelSettlement',
  ledger: 'panelLedger',
};

function panelRows(panel: TerminalClosurePanel) {
  const extras: { label: string; value: string }[] = [];

  if (panel.candidates?.length) {
    panel.candidates.forEach((candidate) => {
      extras.push({
        label: candidate.title,
        value: [candidate.artifactKind, `score ${candidate.score}`, candidate.rights].filter(Boolean).join(' · '),
      });
    });
  }

  if (panel.proofFamilies?.length) {
    panel.proofFamilies.forEach((family) => {
      extras.push({
        label: family.label,
        value: `${family.theoremStatus} · replay ${family.replayArtifacts} · ${family.artifactPath}`,
      });
    });
  }

  if (panel.fitQualities?.length) {
    panel.fitQualities.forEach((quality) => {
      extras.push({
        label: quality.label,
        value: `${quality.value} · ${quality.detail}`,
      });
    });
  }

  if (panel.recentRuns?.length) {
    panel.recentRuns.forEach((run) => {
      extras.push({
        label: run.label,
        value: run.summary,
      });
    });
  }

  return [...panel.rows, ...extras].slice(0, 8);
}

function renderClosurePanelCard(panel: TerminalClosurePanel) {
  const shellPanelId = PANEL_IDS[panel.id];
  const substructureId = CLOSURE_PANEL_SUBSTRUCTURE[shellPanelId];
  const substructure = substructureId ? getActivityDetailSection(substructureId) : null;
  const rows = panelRows(panel);

  return (
    <article id={shellPanelId} key={panel.id} className={`rounded-[1.75rem] border px-5 py-5 ${toneForPanel(shellPanelId)}`}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 max-w-3xl">
          <p className="text-[0.68rem] uppercase tracking-[0.2em] text-neutral-400">Closure Bitcode section</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">{panel.label}</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-300">{panel.summary}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 text-[0.66rem] uppercase tracking-[0.18em] text-neutral-300">
          {substructure ? (
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-emerald-100">
              {substructure.label}
            </span>
          ) : null}
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{panel.id}</span>
          <button
            type="button"
            onClick={() => jumpToShellSection(shellPanelId)}
            className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/15"
          >
            Focus live detail
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <div className="space-y-4">
          <BitcodeMetricGrid
            metrics={panel.metrics}
            columnsClassName="sm:grid-cols-2"
            itemClassName="rounded-[1.15rem] border border-white/8 bg-black/20 px-4 py-4"
            labelClassName="text-[0.64rem] uppercase tracking-[0.16em] text-neutral-500"
            valueClassName="text-base font-semibold text-white"
          />

          {panel.chips.length ? (
            <div className="rounded-[1.15rem] border border-white/8 bg-black/20 px-4 py-4">
              <p className="text-[0.64rem] uppercase tracking-[0.16em] text-neutral-500">Surfaced reads</p>
              <BitcodeChipCloud
                chips={panel.chips}
                className="mt-3"
                chipClassName="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.66rem] uppercase tracking-[0.18em] text-neutral-200"
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.2rem] border border-white/8 bg-black/20 px-4 py-4 text-sm">
          <BitcodeDetailRowList rows={rows} />
        </div>
      </div>
    </article>
  );
}

export default function TerminalClosureNativeSections() {
  const { snapshot } = useTerminalShellBridge();
  const closureState = useMemo<TerminalClosureState | null>(
    () => normalizeTerminalClosureState(snapshot),
    [snapshot],
  );

  const panels = useMemo(() => {
    if (!closureState) return [];
    return [
      closureState.readReview,
      closureState.verification,
      closureState.branch,
      closureState.settlement,
      closureState.ledger,
    ];
  }, [closureState]);

  if (!closureState) {
    return (
      <TerminalWorkspaceCard
        id="terminalClosureSequence"
        kicker="Closure map"
        title="Read review, verification, asset pack, settlement, and ledger"
        summary="Reading the current review-to-settlement sequence, asset-pack synthesis posture, and source-to-shares runtime."
        explainer={TERMINAL_WORKSPACE_EXPLAINERS.closureMap}
      >
        <p className="mt-4 text-sm leading-6 text-neutral-300">Reading the live Bitcode closure snapshot…</p>
      </TerminalWorkspaceCard>
    );
  }

  return (
    <TerminalWorkspaceCard
      id="terminalClosureSequence"
      kicker="Closure map"
      title="Read review, verification, asset pack, settlement, and ledger"
      summary="Read closure as one sequence from reviewable Read admission through verification, asset-pack branch materialization, source-to-shares settlement, and ledger continuity."
      explainer={TERMINAL_WORKSPACE_EXPLAINERS.closureMap}
      headerAside={
        <BitcodeMetricGrid
          metrics={[
            { label: 'Read posture', value: 'closure sequence' },
            { label: 'Closure surfaces', value: String(panels.length) },
          ]}
          columnsClassName="tablet:grid-cols-2"
          itemClassName="rounded-2xl border border-white/8 bg-black/20 px-4 py-4"
          labelClassName="text-[0.62rem] uppercase tracking-[0.16em] text-emerald-300/85"
          valueClassName="text-sm font-semibold text-neutral-200"
        />
      }
    >

      <div className="mt-6 grid gap-5">
        {panels.map((panel) => renderClosurePanelCard(panel))}
      </div>
    </TerminalWorkspaceCard>
  );
}
