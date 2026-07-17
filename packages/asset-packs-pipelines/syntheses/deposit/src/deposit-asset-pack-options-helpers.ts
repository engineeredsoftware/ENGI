/**
 * Pure helpers for deterministic deposit AssetPack option blueprint synthesis.
 *
 * Normalizes request inputs, scores confidence, and builds measurement rows
 * without side effects. Shared root/hash utilities live in deposit-source-safe-utils.
 */

import type {
  DepositAssetPackOptionKind,
  DepositAssetPackOptionMeasurement,
  DepositOptionDemandSignal,
} from './deposit-asset-pack-options-types';
import { normalizedText, root } from '@bitcode/asset-packs-pipelines-syntheses-domain/deposit-source-safe-utils';

export const OPTION_BLUEPRINTS: Array<{
  kind: DepositAssetPackOptionKind;
  title: string;
  summary: string;
  measurementBias: number;
}> = [
  {
    kind: 'capability-slice',
    title: 'Repository capability AssetPack option',
    summary:
      'A source-safe option describing a bounded capability slice that may satisfy future Reading demand without exposing protected source before settlement.',
    measurementBias: 0.72,
  },
  {
    kind: 'implementation-pattern',
    title: 'Implementation pattern AssetPack option',
    summary:
      'A source-safe option describing reusable implementation patterns, integration constraints, and reviewable measurements for future Need-Fit use.',
    measurementBias: 0.66,
  },
  {
    kind: 'proof-operations-slice',
    title: 'Proof and operations AssetPack option',
    summary:
      'A source-safe option describing proof, telemetry, operational, or validation material that can improve future AssetPack synthesis quality.',
    measurementBias: 0.61,
  },
];

export function normalizedList(value: string[] | null | undefined) {
  return [...new Set((value || []).map((entry) => entry.trim()).filter(Boolean))].sort();
}

export function normalizedSignals(value: DepositOptionDemandSignal[] | null | undefined) {
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

export function confidenceFor(input: {
  blueprintBias: number;
  hasRepository: boolean;
  hasRevision: boolean;
  sourcePathCount: number;
  signalCount: number;
}) {
  const repositoryBoost = input.hasRepository ? 0.08 : -0.18;
  const revisionBoost = input.hasRevision ? 0.08 : -0.12;
  const sourceBoost = Math.min(0.08, input.sourcePathCount * 0.02);
  const demandBoost = Math.min(0.08, input.signalCount * 0.015);
  return Number(
    Math.max(
      0.1,
      Math.min(0.98, input.blueprintBias + repositoryBoost + revisionBoost + sourceBoost + demandBoost),
    ).toFixed(2),
  );
}

export function measurementsFor(input: {
  optionId: string;
  confidence: number;
  sourcePathCount: number;
  signalCount: number;
}): DepositAssetPackOptionMeasurement[] {
  const sourceCoverage = Number(Math.min(1, 0.42 + input.sourcePathCount * 0.08).toFixed(2));
  const demandAlignment = Number(
    Math.min(1, 0.38 + input.signalCount * 0.06 + input.confidence * 0.2).toFixed(2),
  );
  const reuseLikelihood = Number(Math.min(1, 0.36 + input.confidence * 0.45).toFixed(2));
  const rows: Array<Omit<DepositAssetPackOptionMeasurement, 'evidenceRoot'>> = [
    {
      id: `${input.optionId}:source-coverage`,
      label: 'Source coverage',
      measurementKind: 'source-coverage',
      weight: 0.36,
      volume: sourceCoverage,
    },
    {
      id: `${input.optionId}:demand-alignment`,
      label: 'Demand alignment',
      measurementKind: 'demand-alignment',
      weight: 0.4,
      volume: demandAlignment,
    },
    {
      id: `${input.optionId}:reuse-likelihood`,
      label: 'Reuse likelihood',
      measurementKind: 'reuse-likelihood',
      weight: 0.24,
      volume: reuseLikelihood,
    },
  ];

  return rows.map((row) => ({
    ...row,
    evidenceRoot: root('deposit-option-measurement', row),
  }));
}
