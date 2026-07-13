/**
 * Pure builder for Need-relative fit measurement review (quote basis + provenance).
 */

import {
  normalizeSafeNumber,
  normalizedText,
  stableHash,
} from './read-route-helpers';
import type {
  ReadFitMeasurementReview,
  ReadFitMeasurementRow,
  ReadFitMeasurementVisualizationId,
  ReadRouteSessionInput,
} from './read-route-session-types';

const READ_FIT_MEASUREMENT_CATALOG: ReadonlyArray<{
  measurementId: ReadFitMeasurementRow['measurementId'];
  visualizationId: ReadFitMeasurementVisualizationId;
  label: string;
  weight: number;
}> = [
  { measurementId: 'coverage-measurement', visualizationId: 'need-coverage', label: 'Need coverage', weight: 0.2 },
  { measurementId: 'fit-measurement', visualizationId: 'fit-confidence', label: 'Fit confidence', weight: 0.2 },
  { measurementId: 'specificity-measurement', visualizationId: 'specificity', label: 'Specificity', weight: 0.1 },
  { measurementId: 'novelty-measurement', visualizationId: 'novelty', label: 'Novelty', weight: 0.125 },
  { measurementId: 'reuse-measurement', visualizationId: 'reuse', label: 'Reuse', weight: 0.075 },
  { measurementId: 'risk-measurement', visualizationId: 'risk', label: 'Risk', weight: 0.1 },
  { measurementId: 'evidence-measurement', visualizationId: 'evidence', label: 'Evidence', weight: 0.1 },
  { measurementId: 'delivery-measurement', visualizationId: 'delivery-readiness', label: 'Delivery readiness', weight: 0.1 },
];

function deterministicUnitFraction(seed: string, floor: number) {
  const span = 1 - floor;
  return floor + ((parseInt(stableHash(seed), 16) % 1_000) / 1_000) * span;
}

export function buildReadFitMeasurementReview(
  input: ReadRouteSessionInput = {},
): ReadFitMeasurementReview {
  const visible = Boolean(input.hasAcceptedNeed && input.hasSourceSafePreview);
  const btdScalarVolume = visible ? Math.max(1, normalizeSafeNumber(input.measuredBtd, 0)) : 0;
  const reviewSeed = `${normalizedText(input.transactionId) || 'read-fit-review'}:${btdScalarVolume}`;
  const rawRows = READ_FIT_MEASUREMENT_CATALOG.map((entry) => {
    const measurementVolume = visible
      ? deterministicUnitFraction(`${reviewSeed}:${entry.measurementId}:volume`, 0.35)
      : 0;
    const confidence = visible
      ? deterministicUnitFraction(`${reviewSeed}:${entry.measurementId}:confidence`, 0.6)
      : 0;
    const riskAdjustment = visible
      ? deterministicUnitFraction(`${reviewSeed}:${entry.measurementId}:risk`, 0.7)
      : 0;
    return {
      ...entry,
      measurementVolume,
      confidence,
      riskAdjustment,
      rawContribution: measurementVolume * confidence * riskAdjustment * entry.weight,
    };
  });
  const rawTotal = rawRows.reduce((sum, row) => sum + row.rawContribution, 0);
  let allocatedContribution = 0;
  const measurements: ReadFitMeasurementRow[] = rawRows.map((row, index) => {
    const isLastRow = index === rawRows.length - 1;
    const normalizedContribution = !visible
      ? 0
      : isLastRow
        ? Math.max(0, Number((btdScalarVolume - allocatedContribution).toFixed(4)))
        : Number(((row.rawContribution / rawTotal) * btdScalarVolume).toFixed(4));
    allocatedContribution += normalizedContribution;
    return {
      measurementId: row.measurementId,
      visualizationId: row.visualizationId,
      label: row.label,
      measurementVolume: Number(row.measurementVolume.toFixed(4)),
      confidence: Number(row.confidence.toFixed(4)),
      riskAdjustment: Number(row.riskAdjustment.toFixed(4)),
      weight: row.weight,
      normalizedContribution,
    };
  });
  const fitIds = (input.selectedFitIds || [])
    .map((fitId) => normalizedText(fitId))
    .filter((fitId): fitId is string => Boolean(fitId));
  const provenanceFitIds = fitIds.length
    ? fitIds
    : visible
      ? [`fit:${stableHash(`${reviewSeed}:selected-fit`)}`]
      : [];
  const measurementWeight = visible ? 1_000 : 0;
  const pricePerWeightedUnitSats = 25;
  const grossSats =
    input.quoteSats !== null && input.quoteSats !== undefined
      ? normalizeSafeNumber(input.quoteSats, 0)
      : Math.round((measurementWeight * btdScalarVolume * pricePerWeightedUnitSats) / 1_000);
  const repairBlockers = [
    !input.hasAcceptedNeed ? 'accepted Need required before Fit measurement review' : '',
    !input.hasSourceSafePreview ? 'source-safe AssetPack preview required' : '',
  ].filter(Boolean);
  const basisSeed = JSON.stringify({
    measurementWeight,
    btdScalarVolume,
    pricePerWeightedUnitSats,
    grossSats,
  });

  return {
    schema: 'bitcode.read.fit-measurement-review',
    visible,
    measurements,
    selectedFitProvenance: {
      fitIds: provenanceFitIds,
      depositoryAssetPackCount: provenanceFitIds.length,
      provenanceRoot: `read-selected-fit-provenance:${stableHash(JSON.stringify(provenanceFitIds))}`,
    },
    btdScalarVolume,
    quoteBasis: {
      measurementWeight,
      btdScalarVolume,
      pricePerWeightedUnitSats,
      grossSats,
      feeAsset: 'BTC',
      network: 'btc-testnet',
      deterministic: true,
      basisRoot: `read-quote-basis:${stableHash(basisSeed)}`,
    },
    repairBlockers,
    reviewRoot: `read-fit-measurement-review:${stableHash(`${reviewSeed}:${basisSeed}`)}`,
  };
}
