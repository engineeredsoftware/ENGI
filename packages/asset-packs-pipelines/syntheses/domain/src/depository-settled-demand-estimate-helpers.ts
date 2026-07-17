/**
 * Pure helpers for settled-Depository demand estimation.
 *
 * Tokenization, Jaccard affinity, lifecycle filters, and neediness roots —
 * never touches raw source bodies.
 */

import type {
  DepositorySettledDemandEstimateInput,
  SettledDemandEstimateState,
  SettledDepositoryPackSummary,
} from './depository-settled-demand-estimate-types';
import { root } from './deposit-source-safe-utils';

export const DEFAULT_MIN_SETTLED = 3;
export const MAX_MATCHED_IDS = 12;

export function clamp01(value: number) {
  return Number(Math.max(0, Math.min(1, value)).toFixed(2));
}

export function normalizeText(value: string | null | undefined) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function tokenize(...parts: Array<string | null | undefined>): Set<string> {
  const tokens = new Set<string>();
  for (const part of parts) {
    const text = normalizeText(part);
    if (!text) continue;
    for (const raw of text.split(/[^a-z0-9]+/g)) {
      if (raw.length < 3) continue;
      // Drop ultra-common noise.
      if (
        raw === 'the' ||
        raw === 'and' ||
        raw === 'for' ||
        raw === 'with' ||
        raw === 'from' ||
        raw === 'asset' ||
        raw === 'pack' ||
        raw === 'bitcode'
      ) {
        continue;
      }
      tokens.add(raw);
    }
  }
  return tokens;
}

export function packTokens(pack: SettledDepositoryPackSummary): Set<string> {
  return tokenize(
    pack.title,
    pack.summary,
    pack.kind,
    pack.repositoryFullName,
    ...(Array.isArray(pack.topics) ? pack.topics : []),
  );
}

export function focusTokens(focus: DepositorySettledDemandEstimateInput['focus']): Set<string> {
  if (!focus) return new Set();
  const pathBits = Array.isArray(focus.coveredSourcePaths)
    ? focus.coveredSourcePaths.flatMap((path) => path.split(/[\/._-]+/))
    : [];
  return tokenize(focus.title, focus.summary, focus.kind, focus.repositoryFullName, ...pathBits);
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const token of a) {
    if (b.has(token)) inter += 1;
  }
  const union = a.size + b.size - inter;
  return union > 0 ? inter / union : 0;
}

export function isSettledLifecycle(state: string | null | undefined): boolean {
  const normalized = normalizeText(state);
  if (!normalized) return true; // caller already filtered the corpus
  return (
    normalized.includes('settled') ||
    normalized.includes('admitted') ||
    normalized.includes('depository') ||
    normalized.includes('indexed') ||
    normalized.includes('completed')
  );
}

export function stateForDemand(demand: number): SettledDemandEstimateState {
  if (demand >= 0.76) return 'strong-likely-demand';
  if (demand >= 0.56) return 'moderate-likely-demand';
  return 'weak-likely-demand';
}

export function needinessRootFor(neediness: {
  volume: number;
  demand: number;
  saturation: number;
  rationale: string;
}) {
  return root('deposit-option-neediness', neediness);
}
