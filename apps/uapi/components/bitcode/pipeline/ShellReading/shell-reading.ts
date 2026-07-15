/**
 * Shared shell section helpers (jump anchors, panel tones).
 * Relocated from product experience components/shell-reading.
 */

'use client';

export type KeyValueRow = {
  label: string;
  value: string;
};

export type Metric = {
  label: string;
  value: string;
};

export type NativeCard = {
  title: string;
  eyebrow: string;
  subtitle: string;
  help: string;
  badge: string;
  metrics: Metric[];
  rows: KeyValueRow[];
};

export type NativePanel = {
  id: string;
  label: string;
  badge: string;
  cards: NativeCard[];
};

export function jumpToShellSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
}

export function toneForPanel(id: string) {
  if (id === 'panelOperatingPicture') return 'border-cyan-400/20 bg-cyan-400/5';
  if (id === 'panelDepositing') return 'border-emerald-400/20 bg-emerald-400/5';
  if (id === 'panelReading') return 'border-sky-400/20 bg-sky-400/5';
  if (id === 'panelFit') return 'border-amber-400/20 bg-amber-400/5';
  if (id === 'panelEvaluations') return 'border-lime-400/20 bg-lime-400/5';
  if (id === 'panelBranchArtifacts') return 'border-violet-400/20 bg-violet-400/5';
  if (id === 'panelSettlement') return 'border-emerald-300/20 bg-emerald-300/5';
  if (id === 'panelLedger') return 'border-slate-300/20 bg-slate-300/5';
  return 'border-white/8 bg-white/5';
}
