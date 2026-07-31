/**
 * Shared Implementation host 3/4 — DataPack absolute measurements (V48).
 *
 * Product shells (deposit/read packages) call this domain host. Absolutes law is
 * product-agnostic; optional `implementation.productLens` only selects the
 * measure-agent product factory when real inference runs (legacy measure API
 * field name `lens` — not dual-pipeline mode). Never import product packages.
 *
 * Tool-rich host (no free-form volume invention):
 *   1. Register SourceStaticAnalysisTool + absolute measure tools on execution
 *   2. measureDataPackAbsolutesAndIdentity (quantity tool-authoritative; quality
 *      inference when enabled)
 *   3. STAB-B1: path-only / empty / catch fallbacks use honest statuses +
 *      measureReport.mode=path-only — never present path heuristics as full measured
 *   4. Build measured pack via allowlist constructor
 *
 * Validation never re-measures. Weak measurements → Validation iterates Implementation.
 */

import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import type { MeasurableAssetPackPatch } from '../validation/agent-measure-absolutes';
import type {
  DepositAbsoluteReading,
  DepositMeasuredPack,
  DepositMeasureReport,
  DepositMeasurementReportRow,
  DepositMeasurementsPhaseOutput,
  DepositPatchfilePack,
} from './asset-packs-implementation-pack-types';
import {
  countSalvagedPacks,
  hasPatchArtifact,
  isDepositPresentablePack,
  toDepositMeasuredPack,
} from './asset-packs-implementation-pack-types';

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

/** Prefer options that already have formal patchfile artifacts from write agent. */
function resolvePatchfileOptions(input: any, execution: any): DepositPatchfilePack[] {
  const candidates =
    (Array.isArray(input?.options) && input.options) ||
    findValue(execution, 'implementation', 'options') ||
    findValue(execution, 'implementation', 'assetPacks') ||
    [];
  if (!Array.isArray(candidates)) return [];
  return candidates.filter(
    (o) =>
      o &&
      typeof o === 'object' &&
      typeof o.title === 'string' &&
      o.patch &&
      hasPatchArtifact(o),
  ) as DepositPatchfilePack[];
}

function toMeasurablePatch(option: DepositPatchfilePack): MeasurableAssetPackPatch {
  // Prefer artifact files as path scope when present (single source of truth).
  const artifactFiles = option.patchArtifact?.files;
  const fileChanges =
    Array.isArray(artifactFiles) && artifactFiles.length > 0
      ? artifactFiles.map((c) => ({ path: String(c.path), op: String(c.op ?? 'modify') }))
      : option.patch.fileChanges.map((c) => ({
          path: String(c.path),
          op: String(c.op ?? 'modify'),
        }));
  return {
    title: option.title,
    summary: option.summary,
    coveredSourcePaths: option.coveredSourcePaths,
    fileChanges,
    confidence: option.confidence,
    patchSummary: option.patchArtifact?.patchSummary || option.patch.patchSummary,
  };
}

export default async function runDepositImplementationAgentAssetPacksMeasurementsSynthesis(
  input: any,
  execution: any,
): Promise<DepositMeasurementsPhaseOutput> {
  const repository =
    input?.assetPack?.repository ??
    input?.repository ??
    findValue(execution, 'deposit', 'repository') ??
    findValue(execution, 'implementation', 'assetPack')?.repository ??
    {};

  const patchfiles = resolvePatchfileOptions(input, execution);

  const { ensureDepositCheckoutSourceFiles } = await import(
    '../../ensure-checkout-source-files'
  );
  const { resolveSourceCheckoutCatalog } = await import(
    '@bitcode/asset-packs-pipelines-syntheses-domain/resolve-source-checkout-catalog'
  );
  const sourceCheckoutCatalog = await ensureDepositCheckoutSourceFiles(
    execution,
    resolveSourceCheckoutCatalog(execution, input?.sourceCheckoutCatalog),
  );

  const bodies = Array.isArray((sourceCheckoutCatalog as any)?.sources)
    ? (sourceCheckoutCatalog as any).sources
        .filter((s: any) => s && typeof s.path === 'string' && typeof s.content === 'string')
        .map((s: any) => ({ path: s.path as string, content: s.content as string }))
    : [];

  const {
    measureDataPackAbsolutesAndIdentity,
    computeHonestPathOnlyAbsolutes,
    markPathOnlyAbsoluteHonesty,
    normalizeAbsoluteHonestyStatuses,
    registerSourceStaticAnalysisTool,
  } = await import('../validation/agent-measure-absolutes');
  const {
    hasRequiredAbsolutes,
    hasDepositAbsolutesOnlyShape,
    buildDataPackMeasureReport,
  } = await import(
    '@bitcode/asset-packs-pipelines-syntheses-domain/asset-pack-measurements'
  );

  // Formal static-analysis + absolute measure tools on the execution registry.
  try {
    if (execution) {
      registerSourceStaticAnalysisTool(execution);
      const { registerAbsoluteMeasureTools } = await import(
        '@bitcode/generic-agents-agent-measure-absolutes'
      );
      registerAbsoluteMeasureTools(execution);
    }
  } catch {
    /* optional if execution has no tools registry */
  }

  const measuredOptions: DepositMeasuredPack[] = [];
  const measurementReports: DepositMeasurementReportRow[] = [];

  const { resolveMeasureSourceSet } = await import(
    '../../../../domain/src/resolve-measure-source-set'
  );

  for (const patchfile of patchfiles) {
    const patchDescriptor = toMeasurablePatch(patchfile);
    // Deep measure source set: covered + patch paths + manifests + sibling tests.
    const measureSet = resolveMeasureSourceSet({
      coveredSourcePaths: patchDescriptor.coveredSourcePaths,
      fileChanges: patchDescriptor.fileChanges,
      availableBodies: bodies,
    });
    const scopedBodies = measureSet.sources;
    const pathScopeSize = measureSet.pathScope.length;

    let absolutes: DepositAbsoluteReading[] = [];
    let materialIdentity: Record<string, unknown> | null = null;
    let measureReport: DepositMeasureReport | null = null;
    let usedPathOnlyFallback = false;
    try {
      // Tool-rich measure: bare absolutes + material identity + quality inference.
      // productLens selects measure-agent product factory only (shell-set); default deposit.
      const product =
        findValue(execution, 'implementation', 'productLens') === 'read' ? 'read' : 'deposit';
      const measured = await measureDataPackAbsolutesAndIdentity(patchDescriptor, {
        // Legacy measure API field; deposit|read product — not dual-pipeline mode.
        lens: product,
        execution,
        sources: scopedBodies,
        preferQualityInference: true,
      });
      const emptyAbsolutes =
        !Array.isArray(measured.absolutes) || measured.absolutes.length === 0;
      if (emptyAbsolutes) {
        // STAB-B1: empty measure must not look fully measured.
        absolutes = computeHonestPathOnlyAbsolutes(
          patchDescriptor,
        ) as DepositAbsoluteReading[];
        usedPathOnlyFallback = true;
      } else {
        absolutes = measured.absolutes as DepositAbsoluteReading[];
        // No bodies in measure set → strip false "measured" claims.
        if (measureSet.measuredFromBodies === 0 || measureSet.mode === 'path-only') {
          absolutes = markPathOnlyAbsoluteHonesty(
            absolutes as any,
          ) as DepositAbsoluteReading[];
          usedPathOnlyFallback = true;
        } else {
          absolutes = normalizeAbsoluteHonestyStatuses(
            absolutes as any,
          ) as DepositAbsoluteReading[];
        }
      }
      materialIdentity =
        measured.materialIdentity && typeof measured.materialIdentity === 'object'
          ? (measured.materialIdentity as Record<string, unknown>)
          : null;
      measureReport =
        measured.measureReport && typeof measured.measureReport === 'object'
          ? (measured.measureReport as DepositMeasureReport)
          : null;
      // Prefer host measureReport; enrich with deep-set telemetry when host thin.
      if (measureReport) {
        const mode: DepositMeasureReport['mode'] = usedPathOnlyFallback
          ? 'path-only'
          : measureSet.mode === 'deep' || measureReport.mode === 'deep'
            ? 'deep'
            : measureSet.mode === 'thin' || measureReport.mode === 'thin'
              ? 'thin'
              : 'path-only';
        measureReport = {
          ...measureReport,
          measuredFromBodies: usedPathOnlyFallback
            ? 0
            : Math.max(measureReport.measuredFromBodies, measureSet.measuredFromBodies),
          coveredPathCount: Math.max(
            measureReport.coveredPathCount,
            measureSet.coveredPathCount,
          ),
          mode,
          measuredKindCount: absolutes.filter(
            (a) => a.status === 'measured' || a.status === 'estimated',
          ).length,
          expandedFillCount: absolutes.filter((a) => a.status === 'expanded-fill').length,
        };
      } else {
        measureReport = buildDataPackMeasureReport({
          measuredFromBodies: usedPathOnlyFallback ? 0 : measureSet.measuredFromBodies,
          coveredPathCount: measureSet.coveredPathCount,
          bodyCoverageRatio:
            usedPathOnlyFallback || measureSet.coveredPathCount === 0
              ? 0
              : Number(
                  (measureSet.measuredFromBodies / measureSet.coveredPathCount).toFixed(4),
                ),
          absolutes: absolutes as any,
        });
        if (usedPathOnlyFallback) {
          measureReport = { ...measureReport, mode: 'path-only' };
        }
      }
    } catch {
      // STAB-B1: catch path always honest path-only + report (never silent measured).
      absolutes = computeHonestPathOnlyAbsolutes(patchDescriptor) as DepositAbsoluteReading[];
      usedPathOnlyFallback = true;
      measureReport = buildDataPackMeasureReport({
        measuredFromBodies: 0,
        coveredPathCount: Math.max(
          measureSet.coveredPathCount,
          patchDescriptor.coveredSourcePaths?.length ?? 0,
        ),
        bodyCoverageRatio: 0,
        absolutes: absolutes as any,
      });
      measureReport = { ...measureReport, mode: 'path-only' };
    }

    // Allowlist constructor — legal deposit shape (absolutes + identity + report).
    const pack = toDepositMeasuredPack(
      patchfile,
      absolutes,
      materialIdentity,
      measureReport,
    );
    measuredOptions.push(pack);

    const shapeOk = hasDepositAbsolutesOnlyShape(pack);
    const artOk = hasPatchArtifact(pack);
    const ok = hasRequiredAbsolutes(pack) && shapeOk && artOk;
    measurementReports.push({
      title: patchfile.title.slice(0, 120),
      pathScopeSize,
      absoluteCount: absolutes.length,
      measuredFromBodies: scopedBodies.length > 0,
      depositShapeOk: shapeOk,
      hasPatchArtifact: artOk,
      patchArtifactId: pack.patchArtifact?.artifactId,
      salvaged: pack.salvaged === true,
      ok,
    });
  }

  const salvageCount = countSalvagedPacks(measuredOptions);
  const allMeasured =
    measuredOptions.length > 0 &&
    measuredOptions.every((o) => hasRequiredAbsolutes(o) && hasPatchArtifact(o));
  const presentable =
    allMeasured &&
    salvageCount === 0 &&
    measuredOptions.every((o) => isDepositPresentablePack(o));

  let summary: string;
  if (patchfiles.length === 0) {
    summary =
      'Measurements synthesis failed: no packs with formal patchfile artifacts from write agent.';
  } else if (presentable) {
    summary = `Synthesized absolute measurements for ${measuredOptions.length} presentable deposit AssetPack(s) (patchfile artifact + absolutes + metadata).`;
  } else if (allMeasured && salvageCount > 0) {
    summary = `Measured ${measuredOptions.length} deposit AssetPack(s) including ${salvageCount} salvaged (NOT presentable).`;
  } else if (allMeasured) {
    summary = `Measured ${measuredOptions.length} deposit AssetPack(s) but presentable gate failed.`;
  } else {
    summary = `Measurements incomplete for ${measuredOptions.length} option(s); missing absolutes or patch artifact.`;
  }

  const output: DepositMeasurementsPhaseOutput = {
    success: allMeasured,
    semanticKind: 'asset-pack-written-asset',
    options: measuredOptions,
    summary,
    assetPack: { repository },
    patchPlanComplete: true,
    patchfileWritten: measuredOptions.every((o) => hasPatchArtifact(o)),
    measured: allMeasured,
    presentable,
    salvaged: salvageCount > 0,
    salvageCount,
    measurementReports,
  };

  storeCrossPhaseArtifact(execution, 'implementation', 'options', measuredOptions);
  storeCrossPhaseArtifact(execution, 'implementation', 'assetPacks', measuredOptions);
  storeCrossPhaseArtifact(execution, 'implementation', 'assetPack', output.assetPack);
  storeCrossPhaseArtifact(execution, 'implementation', 'summary', summary);
  storeCrossPhaseArtifact(execution, 'implementation', 'measured', allMeasured);
  storeCrossPhaseArtifact(execution, 'implementation', 'presentable', presentable);
  storeCrossPhaseArtifact(execution, 'implementation', 'salvaged', salvageCount > 0);
  storeCrossPhaseArtifact(execution, 'implementation', 'salvageCount', salvageCount);
  storeCrossPhaseArtifact(execution, 'implementation', 'measurementReports', measurementReports);
  storeCrossPhaseArtifact(execution, 'implementation', 'patchfileWritten', output.patchfileWritten);

  return output;
}

export const DepositImplementationAgentAssetPacksMeasurementsSynthesis =
  runDepositImplementationAgentAssetPacksMeasurementsSynthesis;
