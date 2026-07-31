/**
 * Pipeline host for product AbsolutesMeasureAgents (deposit | read).
 *
 * Hierarchy (canon):
 *   bare: generic-measurements/absolutes/<kind>
 *   tool: generic-tools/tool-measure-<kind>
 *   base agent: generic-agents/agent-measure-absolutes (owns tool registry)
 *   product: factoryDeposit|ReadAbsolutesMeasureAgent
 *   host (this file): static analysis + measureDataPackAbsolutes merge law
 *
 * Quantity magnitudes: tool/bare-measure authoritative (static analysis signals).
 * Quality volumes: product measure-agent judgment over source-safe descriptors.
 * Never invent volumes in synthesis LLMs; never emit raw source in telemetry.
 */

import type { MeasureAgent } from '@bitcode/generic-agents-agent-measure';
import {
  factoryDepositAbsolutesMeasureAgent,
  factoryReadAbsolutesMeasureAgent,
  factorySynthesizeAssetPacksAbsolutesMeasureAgent,
} from '@bitcode/generic-asset-packs-synthesis';

import {
  DATA_PACK_ABSOLUTES_PRODUCT_CATALOG,
  type AssetPackAbsoluteSpec,
  type AssetPackCandidateMeasurement,
} from '../../asset-packs-synthesis';
import type { SynthesizeAssetPacksMode } from '../../synthesize-asset-packs';
import { isAssetPackRealInferenceEnabled } from '../../runtime-inference-policy';
import {
  buildSourceSafeAbsoluteDescriptor,
  buildSourceSafePackStructureProfile,
  type SourceSafePackStructureProfile,
} from '../../source-safe-absolute-descriptor';
import { buildDataPackMeasureReport } from '../../asset-pack-measurements';
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

/**
 * Quantity kinds — tool/bare-count authoritative.
 * Derived from product catalog propertyClass so all structure quantities stay
 * in the 46-kind law (never a legacy 8-kind hand list).
 */
const QUANTITY_KINDS = new Set(
  DATA_PACK_ABSOLUTES_PRODUCT_CATALOG.filter((s) => s.propertyClass === 'quantity').map(
    (s) => s.measurementKind,
  ),
);

/**
 * Quantity kinds the static-analysis report actually materializes.
 * Full-catalog report rows with volume 0 must NOT override bare/identity measures.
 */
const REPORT_OWNED_QUANTITY_KINDS = new Set([
  'function-count',
  'type-count',
  'file-span',
  'symbolic-richness',
  'modularity',
  'lang-span',
  'test-surface',
  'api-surface',
  'dependency-span',
  'doc-signal',
  'config-surface',
]);
const LENS_SUBJECT: Record<SynthesizeAssetPacksMode, string> = {
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
  'lang-span': 4,
  'test-surface': 30,
  'api-surface': 16,
  'dependency-span': 20,
  'doc-signal': 1,
  'data-flow-depth': 24,
  'symbol-connectivity': 32,
  'control-complexity': 60,
  'config-surface': 24,
};
function clamp01(value: number): number {
  const n = Number.isFinite(value) ? value : 0;
  return Number(Math.max(0, Math.min(1, n)).toFixed(2));
}

export {
  factorySynthesizeAssetPacksAbsolutesMeasureAgent,
  factoryDepositAbsolutesMeasureAgent,
  factoryReadAbsolutesMeasureAgent,
} from '@bitcode/generic-asset-packs-synthesis';

/** Static-analysis helpers used by deposit measure paths (re-export). */
export {
  analyzeStaticSource,
  registerSourceStaticAnalysisTool,
  resolveSourceStaticAnalysisTool,
  SourceStaticAnalysisTool,
} from './source-static-analysis-tool';

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
  const langSpan = Math.max(
    0,
    report.languageCount ||
      Object.keys(report.targetLanguageBreakdown || {}).filter(Boolean).length ||
      0,
  );
  // test-surface magnitude: path hits + test-like function counts.
  const testSurface = Math.max(
    0,
    (report.testPathCount ?? 0) + Math.round((report.estimatedTestFunctionCount ?? 0) * 0.5),
  );
  const apiSurface = Math.max(0, report.estimatedExportCount ?? 0);
  const dependencySpan = Math.max(0, report.estimatedDependencyCount ?? 0);
  const docSignal = clamp01(report.estimatedDocSignal ?? 0);
  const configSurface = Math.max(0, report.estimatedConfigSurface ?? report.configKeyCount ?? 0);

  // Quality defaults (deterministic path): grounded in confidence + quantities.
  const correctness = clamp01(patch.confidence ?? 0.6);
  const quantityComposite = clamp01(
    (functionCount / QUANTITY_NORMALIZER['function-count'] +
      typeCount / QUANTITY_NORMALIZER['type-count'] +
      fileSpan / QUANTITY_NORMALIZER['file-span'] +
      symbolCount / QUANTITY_NORMALIZER['symbolic-richness'] +
      moduleCount / QUANTITY_NORMALIZER.modularity +
      langSpan / QUANTITY_NORMALIZER['lang-span'] +
      testSurface / QUANTITY_NORMALIZER['test-surface'] +
      apiSurface / QUANTITY_NORMALIZER['api-surface']) /
      8,
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
    'lang-span': langSpan,
    'test-surface': testSurface,
    'api-surface': apiSurface,
    'dependency-span': dependencySpan,
    'doc-signal': docSignal,
    'config-surface': configSurface,
  };
  const volumeByKind: Record<string, number> = {
    'function-count': clamp01(functionCount / QUANTITY_NORMALIZER['function-count']),
    'type-count': clamp01(typeCount / QUANTITY_NORMALIZER['type-count']),
    'file-span': clamp01(fileSpan / QUANTITY_NORMALIZER['file-span']),
    'symbolic-richness': clamp01(symbolCount / QUANTITY_NORMALIZER['symbolic-richness']),
    modularity: clamp01(moduleCount / QUANTITY_NORMALIZER.modularity),
    'lang-span': clamp01(langSpan / QUANTITY_NORMALIZER['lang-span']),
    'test-surface': clamp01(testSurface / QUANTITY_NORMALIZER['test-surface']),
    'api-surface': clamp01(apiSurface / QUANTITY_NORMALIZER['api-surface']),
    'dependency-span': clamp01(dependencySpan / QUANTITY_NORMALIZER['dependency-span']),
    'doc-signal': docSignal,
    'config-surface': clamp01(configSurface / QUANTITY_NORMALIZER['config-surface']),
    'correctness-estimate': correctness,
    'objectives-fidelity': objectivesFidelity,
    'computational-usage': computationalUsage,
  };

  // Instance structure profile for this pack (path/lang/op + quantity shape).
  const structure = buildSourceSafePackStructureProfile({
    coveredSourcePaths: patch.coveredSourcePaths,
    fileChanges: patch.fileChanges,
    languages: Object.keys(report.targetLanguageBreakdown || {}),
    functionCount,
    typeCount,
    fileSpan,
    symbolCount,
    moduleCount,
    measuredFromSamples: measured,
  });

  return DATA_PACK_ABSOLUTES_PRODUCT_CATALOG.map((spec) =>
    buildMeasurement(
      spec,
      {
        volume: volumeByKind[spec.measurementKind] ?? 0,
        magnitude: magnitudeByKind[spec.measurementKind],
      },
      patch,
      structure,
    ),
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
  reading: {
    volume: number;
    magnitude?: number;
    status?: AssetPackCandidateMeasurement['status'];
  },
  patch?: Pick<MeasurableAssetPackPatch, 'title'>,
  structure?: SourceSafePackStructureProfile | null,
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
  const measuredFromSamples = structure?.measuredFromSamples === true;
  let status: AssetPackCandidateMeasurement['status'] = reading.status;
  if (!status) {
    // Structure quantities from samples → measured (incl. true zeros).
    // Path-only quantity heuristic → estimated only when volume > 0; else insufficient.
    // Quality/other: never claim estimated with volume 0 (buyer honesty).
    if (spec.propertyClass === 'quantity') {
      if (measuredFromSamples) {
        status = 'measured';
      } else {
        status = volume > 0 ? 'estimated' : 'insufficient_evidence';
      }
    } else if (volume > 0) {
      status = 'estimated';
    } else {
      status = 'insufficient_evidence';
    }
  }
  const measurement: AssetPackCandidateMeasurement = {
    measurementKind: spec.measurementKind,
    label: spec.label,
    weight: spec.weight,
    volume,
    magnitude,
    category: 'absolute',
    unit: spec.unit,
    status,
  };
  // Instance descriptor — this pack’s numbers + structure profile (source-safe).
  measurement.descriptor = buildSourceSafeAbsoluteDescriptor({
    measurementKind: spec.measurementKind,
    label: measurement.label,
    unit: measurement.unit || 'normalized',
    magnitude,
    volume,
    weight: measurement.weight,
    packTitle: patch?.title,
    structure: structure ?? null,
  });
  return measurement;
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
  // Rebuild structure once from deterministic quantities + patch paths.
  const det = [...deterministic.values()];
  const structure = buildSourceSafePackStructureProfile({
    coveredSourcePaths: patch.coveredSourcePaths,
    fileChanges: patch.fileChanges,
    functionCount: det.find((m) => m.measurementKind === 'function-count')?.magnitude ?? 0,
    typeCount: det.find((m) => m.measurementKind === 'type-count')?.magnitude ?? 0,
    fileSpan: det.find((m) => m.measurementKind === 'file-span')?.magnitude ?? 0,
    symbolCount: det.find((m) => m.measurementKind === 'symbolic-richness')?.magnitude ?? 0,
    moduleCount: det.find((m) => m.measurementKind === 'modularity')?.magnitude ?? 1,
    measuredFromSamples: false,
  });
  return DATA_PACK_ABSOLUTES_PRODUCT_CATALOG.map((spec) => {
    const reading = byKind.get(spec.measurementKind);
    const volumeNum = Number(reading?.volume);
    if (!reading || !Number.isFinite(volumeNum)) {
      // Fall back to the deterministic reading for this measurement.
      return deterministic.get(spec.measurementKind)!;
    }
    return buildMeasurement(
      spec,
      {
        volume: volumeNum,
        magnitude: spec.hasMagnitude ? Number(reading.magnitude) : undefined,
      },
      patch,
      structure,
    );
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
    if (reading && Number.isFinite(volume)) {
      const nextVolume = clamp01(volume);
      // Quality volume changed — refresh instance descriptor; keep prior structure
      // clause by re-parsing is not available here, so rebuild from sibling quantities.
      const byKindAll = new Map(reportAbsolutes.map((m) => [m.measurementKind, m]));
      const structure = buildSourceSafePackStructureProfile({
        functionCount: byKindAll.get('function-count')?.magnitude ?? 0,
        typeCount: byKindAll.get('type-count')?.magnitude ?? 0,
        fileSpan: byKindAll.get('file-span')?.magnitude ?? 0,
        symbolCount: byKindAll.get('symbolic-richness')?.magnitude ?? 0,
        moduleCount: byKindAll.get('modularity')?.magnitude ?? 1,
        measuredFromSamples: true,
      });
      const descriptor = buildSourceSafeAbsoluteDescriptor({
        measurementKind: measurement.measurementKind,
        label: measurement.label || measurement.measurementKind,
        unit: measurement.unit || 'normalized',
        magnitude: nextVolume,
        volume: nextVolume,
        weight: measurement.weight,
        structure,
      });
      return {
        ...measurement,
        volume: nextVolume,
        magnitude: nextVolume,
        descriptor,
        // Quality agent volumes are estimates; zero is not a measured clean score.
        status: nextVolume > 0 ? ('estimated' as const) : ('insufficient_evidence' as const),
      };
    }
    return measurement;
  });
}

/**
 * Buyer-facing honesty pass: never leave volume-0 rows as `estimated`
 * (looks like a soft quality claim). Prefer insufficient_evidence.
 * Does not downgrade `measured` or rewrite non-zero estimated scores.
 */
export function normalizeAbsoluteHonestyStatuses(
  absolutes: AssetPackCandidateMeasurement[],
): AssetPackCandidateMeasurement[] {
  return (absolutes || []).map((row) => {
    const volume =
      typeof row.volume === 'number' && Number.isFinite(row.volume) ? row.volume : 0;
    const status = row.status;
    if (status === 'measured' || status === 'expanded-fill') return row;
    if (
      status === 'insufficient_evidence' ||
      status === 'not_run' ||
      status === 'not_implemented'
    ) {
      return row;
    }
    // estimated | missing | unknown
    if (volume <= 0) {
      return { ...row, status: 'insufficient_evidence' as const };
    }
    if (!status) {
      return { ...row, status: 'estimated' as const };
    }
    return row;
  });
}

/**
 * Path-only / host-fallback honesty (STAB-B1): no sample bodies means no row may
 * claim `measured`. Non-zero stays `estimated`; zeros → `insufficient_evidence`.
 * Product-agnostic — deposit and read share this absolute honesty law.
 * Does not invent a dual-pipeline "lens"; applies whenever evidence is path-only.
 */
export function markPathOnlyAbsoluteHonesty(
  absolutes: AssetPackCandidateMeasurement[],
): AssetPackCandidateMeasurement[] {
  return normalizeAbsoluteHonestyStatuses(absolutes).map((row) => {
    if (row.status !== 'measured') return row;
    const volume =
      typeof row.volume === 'number' && Number.isFinite(row.volume) ? row.volume : 0;
    return {
      ...row,
      status: volume > 0 ? ('estimated' as const) : ('insufficient_evidence' as const),
    };
  });
}

/**
 * Deterministic path-only absolute catalogue with honest statuses (STAB-B1).
 * Prefer this over bare `computeDeterministicAbsolutes` when the host is in
 * fallback after measure failure / empty readings — never present path heuristics
 * as full measured quality.
 */
export function computeHonestPathOnlyAbsolutes(
  patch: MeasurableAssetPackPatch,
): AssetPackCandidateMeasurement[] {
  return markPathOnlyAbsoluteHonesty(computeDeterministicAbsolutes(patch));
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

export type MeasureDataPackAbsolutesContext = {
  lens: SynthesizeAssetPacksMode;
  execution?: any;
  sources?: StaticAnalysisSourceFile[];
  /**
   * Deposit Implementation: attempt quality inference when execution is available.
   * Quantity remains tool/bare-measure authoritative.
   */
  preferQualityInference?: boolean;
  /** Optional corpus-relative substitution density (index-time). */
  substitutionDensity?: number | null;
};

export type MeasureDataPackAbsolutesAndIdentityResult = {
  absolutes: AssetPackCandidateMeasurement[];
  materialIdentity: import('@bitcode/generic-measurements-domain-data-pack-material-identity').DataPackMaterialIdentity;
  measureReport: import('@bitcode/measurement-generics').DataPackMeasureReport;
};

/**
 * Measure ONE synthesized **DataPack** patch: full absolute catalogue +
 * material identity (compositions, inventories, tags, companion scalars).
 *
 * Hierarchy:
 *   bare packages → agent-measure-absolutes registry
 *   material-identity domain extract (host-authoritative for companion volumes)
 *   optional product quality inference refine
 */
function finishMeasureResult(
  absolutes: AssetPackCandidateMeasurement[],
  materialIdentity: import('@bitcode/generic-measurements-domain-data-pack-material-identity').DataPackMaterialIdentity,
  report: StaticAnalysisReport,
  context: MeasureDataPackAbsolutesContext,
): MeasureDataPackAbsolutesAndIdentityResult {
  const honestAbsolutes = normalizeAbsoluteHonestyStatuses(absolutes);
  const bodyCount = Array.isArray(context.sources) ? context.sources.length : 0;
  const covered =
    report.targetFileCount ||
    (Array.isArray(context.sources) ? context.sources.length : 0) ||
    0;
  const measureReport = buildDataPackMeasureReport({
    measuredFromBodies: bodyCount,
    coveredPathCount: covered,
    bodyCoverageRatio: report.coverageRatio,
    absolutes: honestAbsolutes,
  });
  return { absolutes: honestAbsolutes, materialIdentity, measureReport };
}

export async function measureDataPackAbsolutesAndIdentity(
  patch: MeasurableAssetPackPatch,
  context: MeasureDataPackAbsolutesContext,
): Promise<MeasureDataPackAbsolutesAndIdentityResult> {
  const report = await measureStaticAnalysis(patch, context);
  const { measureDataPackMaterialIdentity } = await import(
    '@bitcode/generic-measurements-domain-data-pack-material-identity'
  );
  const materialIdentity = measureDataPackMaterialIdentity({
    title: patch.title,
    summary: patch.summary,
    coveredSourcePaths: patch.coveredSourcePaths,
    fileChanges: patch.fileChanges,
    sources: (context.sources || []).map((s) => ({ path: s.path, content: s.content })),
    substitutionDensity: context.substitutionDensity,
  });

  // Companion scalar volumes from material identity ground bare packages.
  const identitySignals: Record<string, number> = {
    ...materialIdentity.scalarVolumes,
  };

  try {
    const { measureDataPackAbsoluteReadings } = await import(
      '@bitcode/generic-agents-agent-measure-absolutes'
    );
    const readings = measureDataPackAbsoluteReadings({
      dataPack: {
        title: patch.title,
        summary: patch.summary,
        patchSummary: patch.patchSummary,
        coveredSourcePaths: patch.coveredSourcePaths,
        fileChanges: patch.fileChanges,
        confidence: patch.confidence,
      },
      sources: (context.sources || []).map((s) => ({ path: s.path, content: s.content })),
      staticSignals: {
        'function-count': report.estimatedFunctionCount,
        'type-count': report.estimatedTypeCount,
        'symbolic-richness': report.estimatedSymbolCount,
        'lang-span': report.languageCount,
        'test-surface':
          (report.testPathCount ?? 0) + (report.estimatedTestFunctionCount ?? 0) * 0.5,
        'api-surface': report.estimatedExportCount,
        modularity: report.moduleCount,
        'dependency-span': report.estimatedDependencyCount,
        'doc-signal': report.estimatedDocSignal,
        'config-surface': report.estimatedConfigSurface ?? report.configKeyCount,
        ...identitySignals,
      },
    });
    const reportAbsolutes = computeAbsolutesFromReport(report, patch);
    const byKindReport = new Map(reportAbsolutes.map((m) => [m.measurementKind, m]));
    // Prefer static-analysis only for REPORT_OWNED quantity kinds (not every
    // quantity catalog row expanded to volume 0). Material-identity companions
    // and bare packages fill the rest. Always preserve honesty status.
    let bareAbsolutes: AssetPackCandidateMeasurement[] = readings.map((r) => {
      const prior = byKindReport.get(r.measurementKind);
      const preferReport =
        REPORT_OWNED_QUANTITY_KINDS.has(r.measurementKind) && Boolean(prior);
      const identityVol = identitySignals[r.measurementKind];
      const hasIdentity =
        typeof identityVol === 'number' && Number.isFinite(identityVol);
      let status: AssetPackCandidateMeasurement['status'] =
        (r.status as AssetPackCandidateMeasurement['status']) ||
        prior?.status ||
        'insufficient_evidence';
      if (preferReport) {
        status = prior?.status || (report.measuredFromSamples ? 'measured' : 'estimated');
      } else if (hasIdentity) {
        status = 'measured';
      }
      return {
        measurementKind: r.measurementKind,
        label: r.label,
        weight: r.weight,
        volume: preferReport
          ? prior!.volume
          : hasIdentity
            ? clamp01(identityVol)
            : r.volume,
        magnitude: preferReport
          ? prior!.magnitude
          : hasIdentity
            ? identityVol
            : r.magnitude,
        unit: r.unit,
        category: 'absolute' as const,
        rationale: r.rationale,
        descriptor: preferReport ? prior?.descriptor : undefined,
        status,
      };
    });

    // Ensure companion kinds with identity volumes win even when quantity set misses them.
    bareAbsolutes = bareAbsolutes.map((m) => {
      const idVol = identitySignals[m.measurementKind];
      if (typeof idVol !== 'number' || !Number.isFinite(idVol)) return m;
      // Do not override classic structure quantities that static analysis owns.
      if (
        [
          'function-count',
          'type-count',
          'file-span',
          'symbolic-richness',
          'modularity',
          'lang-span',
          'test-surface',
          'api-surface',
        ].includes(m.measurementKind)
      ) {
        return m;
      }
      return {
        ...m,
        volume: clamp01(idVol),
        magnitude: idVol,
        status: 'measured' as const,
      };
    });

    const mayInfer =
      Boolean(context.execution) &&
      (context.preferQualityInference === true || isAssetPackRealInferenceEnabled());
    if (!mayInfer) {
      return finishMeasureResult(bareAbsolutes, materialIdentity, report, context);
    }
    try {
      try {
        const { registerAbsoluteMeasureTools } = await import(
          '@bitcode/generic-agents-agent-measure-absolutes'
        );
        registerAbsoluteMeasureTools(context.execution);
      } catch {
        /* tools optional */
      }
      const agent =
        context.lens === 'read'
          ? factoryReadAbsolutesMeasureAgent()
          : factoryDepositAbsolutesMeasureAgent();
      const raw = await agent(toDescriptor(patch, report) as any, context.execution);
      const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;
      const agentReadings = Array.isArray((result as any)?.measurements)
        ? (result as any).measurements
        : [];
      if (agentReadings.length === 0) {
        return finishMeasureResult(bareAbsolutes, materialIdentity, report, context);
      }
      return finishMeasureResult(
        mergeReportAndReadings(bareAbsolutes, agentReadings),
        materialIdentity,
        report,
        context,
      );
    } catch {
      return finishMeasureResult(bareAbsolutes, materialIdentity, report, context);
    }
  } catch {
    // Fallback: report + identity scalars only.
    const reportOnly = computeAbsolutesFromReport(report, patch);
    const byKind = new Map(reportOnly.map((m) => [m.measurementKind, m]));
    const fallback = DATA_PACK_ABSOLUTES_PRODUCT_CATALOG.map((spec) => {
      const prior = byKind.get(spec.measurementKind);
      const idVol = identitySignals[spec.measurementKind];
      if (prior) {
        if (
          typeof idVol === 'number' &&
          Number.isFinite(idVol) &&
          !QUANTITY_KINDS.has(spec.measurementKind)
        ) {
          return {
            ...prior,
            volume: clamp01(idVol),
            magnitude: idVol,
            status: 'measured' as const,
          };
        }
        return prior;
      }
      const vol =
        typeof idVol === 'number' && Number.isFinite(idVol) ? clamp01(idVol) : 0;
      return {
        measurementKind: spec.measurementKind,
        label: spec.label,
        weight: spec.weight,
        volume: vol,
        magnitude: vol,
        unit: spec.unit,
        category: 'absolute' as const,
        status: vol > 0 ? ('measured' as const) : ('insufficient_evidence' as const),
      };
    });
    return finishMeasureResult(fallback, materialIdentity, report, context);
  }
}

/**
 * Measure the absolutes of ONE synthesized **DataPack** patch.
 * Prefer `measureDataPackAbsolutesAndIdentity` when the product needs the bag.
 */
export async function measureDataPackAbsolutes(
  patch: MeasurableAssetPackPatch,
  context: MeasureDataPackAbsolutesContext,
): Promise<AssetPackCandidateMeasurement[]> {
  const { absolutes } = await measureDataPackAbsolutesAndIdentity(patch, context);
  return absolutes;
}
