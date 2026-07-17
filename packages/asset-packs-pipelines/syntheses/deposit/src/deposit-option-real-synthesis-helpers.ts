/**
 * Pure helpers for real deposit option synthesis adaptation.
 *
 * Kind coercion and demand-signal normalization shared with the blueprint
 * root format so real and blueprint syntheses stay root-compatible.
 */

import type { AssetPackCandidate } from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis';
import type {
  DepositAssetPackOptionKind,
  DepositOptionSynthesisRequest,
} from './deposit-asset-pack-options-types';
import { normalizedText, root } from '@bitcode/asset-packs-pipelines-syntheses-domain/deposit-source-safe-utils';

export const DEPOSIT_OPTION_KINDS: DepositAssetPackOptionKind[] = [
  'capability-slice',
  'implementation-pattern',
  'proof-operations-slice',
];

export function normalizedSignals(value: DepositOptionSynthesisRequest['depositoryDemandSignals']) {
  return (value || [])
    .map((signal, index) => ({
      id: normalizedText(signal.id) || `signal-${index + 1}`,
      label: normalizedText(signal.label) || normalizedText(signal.summary) || `Demand signal ${index + 1}`,
      summary: normalizedText(signal.summary) || normalizedText(signal.label) || 'Source-safe demand signal',
      weight: Math.max(0, Math.min(1, Number(signal.weight ?? 0.5))),
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function signalRoots(prefix: string, signals: ReturnType<typeof normalizedSignals>) {
  return signals.map((signal) => root(prefix, signal));
}

export function candidateKind(candidate: AssetPackCandidate): DepositAssetPackOptionKind {
  return DEPOSIT_OPTION_KINDS.includes(candidate.kind as DepositAssetPackOptionKind)
    ? (candidate.kind as DepositAssetPackOptionKind)
    : 'capability-slice';
}
