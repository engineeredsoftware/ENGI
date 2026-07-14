/**
 * agent-measure-absolutes — pipeline host for SynthesizeAssetPacksAbsolutesMeasureAgent
 * (product factory in @bitcode/generic-asset-packs-synthesis) + static-analysis quantity tools.
 *
 * Bases factoryMeasureAgentAbsolutes with the asset-pack ABSOLUTES catalog —
 * material properties of digital material:
 *   quantity (Tool): function/type/file sizes, symbolic richness, modularity
 *   quality  (Agent): correctness, objectives fidelity, computational usage
 *
 * Lens-parameterized (deposit | read). Run in Validation over each synthesized
 * AssetPack patch: Implementation synthesizes the patch; this measurer MEASURES it.
 *
 * Quantity magnitudes are MEASURED by SourceStaticAnalysisTool (deterministic
 * static analysis). Quality volumes are judgment from the measure-agent, grounded
 * in those counts + the source-safe descriptor — never raw source in telemetry.
 */

import type { MeasureAgent } from '@bitcode/generic-measurements-measure-agent';
import {
  factorySynthesizeAssetPacksAbsolutesMeasureAgent,
} from '@bitcode/generic-asset-packs-synthesis';

import {
  ASSET_PACK_ABSOLUTES_CATALOG,
  type AssetPackAbsoluteSpec,
  type AssetPackCandidateMeasurement,
  type AssetPacksSynthesisLens,
} from '../../asset-packs-synthesis';
import { isAssetPackRealInferenceEnabled } from '../../runtime-inference-policy';
import {
  analyzeStaticSource,
  registerSourceStaticAnalysisTool,
  resolveSourceStaticAnalysisTool,
  SourceStaticAnalysisTool,
  type StaticAnalysisReport,
  type StaticAnalysisSourceFile,
} from './source-static-analysis-tool';

/** The source-safe descriptor of a synthesized patch this agent measures. */
export interface MeasurableAssetPackPatch {
  title: string;
  summary: string;
  coveredSourcePaths: string[];
  fileChanges?: Array<{ path: string; op: string }>;
  confidence?: number;
  patchSummary?: string;
}

/** Quantity kinds — Tool-authoritative (static analysis + patch descriptor). */
const QUANTITY_KINDS = new Set([
  'function-count',
  'type-count',
  'file-span',
  'symbolic-richness',
  'modularity',
]);
/** @deprecated alias — use QUANTITY_KINDS */
const SIZE_KINDS = QUANTITY_KINDS;

const LENS_SUBJECT: Record<AssetPacksSynthesisLens, string> = {
  deposit:
    'a synthesized source-safe deposit AssetPack patch the depositor will review and admit',
  read: 'a synthesized source-safe Need-fitting AssetPack the reader will review and buy',
};

/** Per-quantity normalizer: magnitude / divisor → 0..1 volume (saturates at the divisor). */
const QUANTITY_NORMALIZER: Record<string, number> = {
  'function-count': 40,
  'type-count': 24,
  'file-span': 10,
  'symbolic-richness': 200,
  modularity: 12,
};
/** @deprecated alias */
const SIZE_NORMALIZER = QUANTITY_NORMALIZER;

function clamp01(value: number): number {
  const n = Number.isFinite(value) ? value : 0;
  return Number(Math.max(0, Math.min(1, n)).toFixed(2));
}

/**
 * factoryAssetPackMeasureAbsolutesAgent — the lens-parameterized concrete
 * measurer. Bases factoryMeasureAgentAbsolutes with the absolutes catalog.
 */
/**
 * @deprecated Prefer factorySynthesizeAssetPacksAbsolutesMeasureAgent from
 * @bitcode/generic-asset-packs-synthesis. Kept as local alias for pipeline validation wiring.
 */
export function factoryAssetPackMeasureAbsolutesAgent(
  lens: AssetPacksSynthesisLens,
): MeasureAgent {
  return factorySynthesizeAssetPacksAbsolutesMeasureAgent(lens);
}

/** Hierarchy-encoded product factory (re-export). */
export { factorySynthesizeAssetPacksAbsolutesMeasureAgent };

/** Build the source-safe descriptor the measure-agent reasons over (counts only). */
function toDescriptor(patch: MeasurableAssetPackPatch, report: StaticAnalysisReport) {
  const fileChanges = (patch.fileChanges || []).map((change) => ({
    path: String(change.path),
    op: String(change.op),
  }));
  return {
    title: patch.title,
    knowledgeSummary: patch.summary,
    patchSummary: patch.patchSummary ?? null,
    // Source-safe descriptor signals (counts + path/op only — never raw source).
    fileChanges,
    fileChangeCount: fileChanges.length || patch.coveredSourcePaths.length,
    coveredSourcePathCount: patch.coveredSourcePaths.length,
    confidenceHint: patch.confidence ?? null,
    // The MEASURED static-analysis counts (source-safe) — ground the correctness +
    // semantic-volume judgment. Sizes are already authoritative from these.
    staticAnalysis: {
      functionCount: report.estimatedFunctionCount,
      typeCount: report.estimatedTypeCount,
      fileCount: report.targetFileCount,
      symbolCount: report.symbolCount,
      configKeyCount: report.configKeyCount,
      lineCount: report.lineCount,
      tokenCount: report.tokenCount,
      coverageRatio: report.coverageRatio,
      measuredFromSamples: report.measuredFromSamples,
      languages: Object.keys(report.targetLanguageBreakdown),
      moduleCount: report.moduleCount,
      symbolicRichness: report.estimatedSymbolCount,
    },
  };
}

/**
 * Absolutes from the static-analysis report. SIZES come from the measured report
 * (estimated counts; exact where the covered file was sampled). When no source was
 * available (measuredFromSamples=false), sizes fall back to a covered-path-span
 * heuristic so the preview is never empty. correctness = confidence; semantic-volume
 * is monotone in the sizes. This is both the deterministic fallback AND the size
 * source the agent path builds on.
 */
/**
 * Distinct top-level modules touched by the patch (path prefix before first `/`
 * or the full path when flat). Pure quantity signal for modularity.
 */
export function countModulesFromPaths(paths: string[]): number {
  const modules = new Set<string>();
  for (const raw of paths || []) {
    const path = String(raw || '').replace(/^\/+/, '').trim();
    if (!path) continue;
    const slash = path.indexOf('/');
    modules.add(slash === -1 ? path : path.slice(0, slash));
  }
  return modules.size;
}

export function computeAbsolutesFromReport(
  report: StaticAnalysisReport,
  patch: MeasurableAssetPackPatch,
): AssetPackCandidateMeasurement[] {
  const measured = report.measuredFromSamples;
  const functionCount = measured
    ? Math.max(0, report.estimatedFunctionCount)
    : Math.max(1, Math.round(patch.coveredSourcePaths.length * 3));
  const typeCount = measured
    ? Math.max(0, report.estimatedTypeCount)
    : Math.max(1, Math.round(patch.coveredSourcePaths.length * 1.5));
  const fileSpan =
    (patch.fileChanges?.length ?? 0) ||
    report.targetFileCount ||
    patch.coveredSourcePaths.length;
  const symbolCount = measured
    ? Math.max(0, report.estimatedSymbolCount ?? report.symbolCount)
    : Math.max(1, Math.round(patch.coveredSourcePaths.length * 8));
  const moduleCount = Math.max(
    1,
    report.moduleCount ||
      countModulesFromPaths([
        ...patch.coveredSourcePaths,
        ...(patch.fileChanges || []).map((c) => c.path),
      ]),
  );

  // Quality defaults (deterministic path): grounded in confidence + quantities.
  const correctness = clamp01(patch.confidence ?? 0.6);
  const quantityComposite = clamp01(
    (functionCount / QUANTITY_NORMALIZER['function-count'] +
      typeCount / QUANTITY_NORMALIZER['type-count'] +
      fileSpan / QUANTITY_NORMALIZER['file-span'] +
      symbolCount / QUANTITY_NORMALIZER['symbolic-richness'] +
      moduleCount / QUANTITY_NORMALIZER.modularity) /
      5,
  );
  const objectivesFidelity = clamp01(0.55 * correctness + 0.45 * quantityComposite);
  const computationalUsage = clamp01(
    0.4 * (symbolCount / QUANTITY_NORMALIZER['symbolic-richness']) +
      0.35 * (functionCount / QUANTITY_NORMALIZER['function-count']) +
      0.25 * (fileSpan / QUANTITY_NORMALIZER['file-span']),
  );

  const magnitudeByKind: Record<string, number> = {
    'function-count': functionCount,
    'type-count': typeCount,
    'file-span': fileSpan,
    'symbolic-richness': symbolCount,
    modularity: moduleCount,
  };
  const volumeByKind: Record<string, number> = {
    'function-count': clamp01(functionCount / QUANTITY_NORMALIZER['function-count']),
    'type-count': clamp01(typeCount / QUANTITY_NORMALIZER['type-count']),
    'file-span': clamp01(fileSpan / QUANTITY_NORMALIZER['file-span']),
    'symbolic-richness': clamp01(symbolCount / QUANTITY_NORMALIZER['symbolic-richness']),
    modularity: clamp01(moduleCount / QUANTITY_NORMALIZER.modularity),
    'correctness-estimate': correctness,
    'objectives-fidelity': objectivesFidelity,
    'computational-usage': computationalUsage,
  };

  return ASSET_PACK_ABSOLUTES_CATALOG.map((spec) =>
    buildMeasurement(spec, {
      volume: volumeByKind[spec.measurementKind] ?? 0,
      magnitude: magnitudeByKind[spec.measurementKind],
    }),
  );
}

/**
 * Deterministic absolutes from the patch descriptor alone (no source). Thin wrapper
 * over computeAbsolutesFromReport with an empty report — the path-only preview.
 */
export function computeDeterministicAbsolutes(
  patch: MeasurableAssetPackPatch,
): AssetPackCandidateMeasurement[] {
  const report = analyzeStaticSource({ files: [], targetPaths: patch.coveredSourcePaths });
  return computeAbsolutesFromReport(report, patch);
}

function buildMeasurement(
  spec: AssetPackAbsoluteSpec,
  reading: { volume: number; magnitude?: number },
): AssetPackCandidateMeasurement {
  const volume = clamp01(reading.volume);
  // Absolute law: magnitude AND volume always present.
  // Quantity: raw count. Quality: magnitude mirrors volume.
  let magnitude: number;
  if (spec.propertyClass === 'quantity' && Number.isFinite(reading.magnitude)) {
    magnitude = Math.max(0, Math.round(Number(reading.magnitude)));
  } else if (Number.isFinite(reading.magnitude)) {
    magnitude = Number(reading.magnitude);
  } else {
    magnitude = volume;
  }
  return {
    measurementKind: spec.measurementKind,
    label: spec.label,
    weight: spec.weight,
    volume,
    magnitude,
    category: 'absolute',
    unit: spec.unit,
  };
}

/**
 * Map measure-agent readings onto the absolutes catalog (one measurement per spec,
 * in catalog order). Missing/invalid readings fall back to the deterministic value
 * so the absolutes set is always complete.
 */
export function mapReadingsToAbsoluteMeasurements(
  readings: Array<{ measurementKind?: string; volume?: unknown; magnitude?: unknown }>,
  patch: MeasurableAssetPackPatch,
): AssetPackCandidateMeasurement[] {
  const byKind = new Map<string, { volume?: unknown; magnitude?: unknown }>();
  for (const reading of readings || []) {
    if (reading && typeof reading.measurementKind === 'string') {
      byKind.set(reading.measurementKind, reading);
    }
  }
  const deterministic = new Map(
    computeDeterministicAbsolutes(patch).map((m) => [m.measurementKind, m]),
  );
  return ASSET_PACK_ABSOLUTES_CATALOG.map((spec) => {
    const reading = byKind.get(spec.measurementKind);
    const volumeNum = Number(reading?.volume);
    if (!reading || !Number.isFinite(volumeNum)) {
      // Fall back to the deterministic reading for this measurement.
      return deterministic.get(spec.measurementKind)!;
    }
    return buildMeasurement(spec, {
      volume: volumeNum,
      magnitude: spec.hasMagnitude ? Number(reading.magnitude) : undefined,
    });
  });
}

/**
 * Merge tool-measured QUANTITY absolutes with agent QUALITY readings:
 * quantity kinds stay tool-authoritative; quality kinds take the agent volume
 * when valid, else the report-derived default.
 */
export function mergeReportAndReadings(
  reportAbsolutes: AssetPackCandidateMeasurement[],
  readings: Array<{ measurementKind?: string; volume?: unknown }>,
): AssetPackCandidateMeasurement[] {
  const byKind = new Map<string, { volume?: unknown }>();
  for (const reading of readings || []) {
    if (reading && typeof reading.measurementKind === 'string') byKind.set(reading.measurementKind, reading);
  }
  return reportAbsolutes.map((measurement) => {
    if (QUANTITY_KINDS.has(measurement.measurementKind)) return measurement; // tool-authoritative
    const reading = byKind.get(measurement.measurementKind);
    const volume = Number(reading?.volume);
    if (reading && Number.isFinite(volume)) return { ...measurement, volume: clamp01(volume) };
    return measurement;
  });
}

/** Resolve (or register) the static-analysis tool and measure the report. */
async function measureStaticAnalysis(
  patch: MeasurableAssetPackPatch,
  context: { execution?: any; sources?: StaticAnalysisSourceFile[] },
): Promise<StaticAnalysisReport> {
  const files = Array.isArray(context.sources) ? context.sources : [];
  // Register the base analyzer (priority 0; honors add/replace + parent override),
  // resolve local-then-parent, and call use() DIRECTLY (no raw-arg persistence).
  const tool = context.execution
    ? resolveSourceStaticAnalysisTool(context.execution) ?? registerSourceStaticAnalysisTool(context.execution)
    : new SourceStaticAnalysisTool();
  try {
    return await tool.use({ files, targetPaths: patch.coveredSourcePaths });
  } catch {
    return analyzeStaticSource({ files, targetPaths: patch.coveredSourcePaths });
  }
}

/**
 * Measure the absolutes of ONE synthesized patch.
 * Quantity: SourceStaticAnalysisTool (+ patch descriptor).
 * Quality: measure-agent judgment grounded in those quantities (when real
 * inference is enabled); otherwise report-derived quality defaults.
 * Always returns the complete absolutes catalog.
 */
export async function measureAssetPackAbsolutes(
  patch: MeasurableAssetPackPatch,
  context: { lens: AssetPacksSynthesisLens; execution?: any; sources?: StaticAnalysisSourceFile[] },
): Promise<AssetPackCandidateMeasurement[]> {
  const report = await measureStaticAnalysis(patch, context);
  const reportAbsolutes = computeAbsolutesFromReport(report, patch);

  if (!isAssetPackRealInferenceEnabled() || !context.execution) {
    return reportAbsolutes;
  }
  try {
    const agent = factoryAssetPackMeasureAbsolutesAgent(context.lens);
    const raw = await agent(toDescriptor(patch, report) as any, context.execution);
    // factoryPTRRAgent returns an envelope ({ context, output, finalOutput }) — unwrap (F27).
    const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;
    const readings = Array.isArray((result as any)?.measurements) ? (result as any).measurements : [];
    if (readings.length === 0) return reportAbsolutes;
    return mergeReportAndReadings(reportAbsolutes, readings);
  } catch {
    return reportAbsolutes;
  }
}
