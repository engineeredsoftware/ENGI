/**
 * Deposit Implementation agent 2/2 — DataPack measurements synthesis (V48).
 *
 * Deposit DataPack = patchfile + absolute measurements + metadata.
 *
 * Tool-rich host agent (no free-form volume invention):
 *   1. Register SourceStaticAnalysisTool + absolute measure tools on execution
 *   2. measureDataPackAbsolutes(patch, { lens:'deposit', preferQualityInference:true })
 *      - QUANTITY kinds: static analysis + bare absolute packages (authoritative)
 *      - QUALITY kinds: measure-agent inference grounded in static report,
 *        slotted into DATA_PACK_ABSOLUTES weighted catalogue only
 *   3. Build DepositMeasuredPack via allowlist constructor
 *
 * Validation never re-measures. Weak measurements → Validation iterates Implementation.
 */

import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import type { MeasurableAssetPackPatch } from '../../../../domain/src/agents/validation/agent-measure-absolutes';
import type {
  DepositAbsoluteReading,
  DepositMeasuredPack,
  DepositMeasurementReportRow,
  DepositMeasurementsPhaseOutput,
  DepositPatchfilePack,
} from './deposit-implementation-pack-types';
import {
  countSalvagedPacks,
  hasPatchArtifact,
  isDepositPresentablePack,
  toDepositMeasuredPack,
} from './deposit-implementation-pack-types';

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
    '../../ensure-deposit-checkout-source-files'
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
    measureDataPackAbsolutes,
    computeDeterministicAbsolutes,
    registerSourceStaticAnalysisTool,
  } = await import('../../../../domain/src/agents/validation/agent-measure-absolutes');
  const { hasRequiredAbsolutes, hasDepositAbsolutesOnlyShape } = await import(
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

  for (const patchfile of patchfiles) {
    const patchDescriptor = toMeasurablePatch(patchfile);
    const pathScope = new Set<string>(
      [
        ...patchDescriptor.coveredSourcePaths,
        ...(patchDescriptor.fileChanges || []).map((c) => c.path),
      ].filter(Boolean),
    );
    const scopedBodies =
      pathScope.size > 0
        ? bodies.filter((b: { path: string; content: string }) => pathScope.has(b.path))
        : bodies;

    let absolutes: DepositAbsoluteReading[] = [];
    try {
      // Tool-rich measure: bare absolutes + static analysis + quality inference.
      const measured = await measureDataPackAbsolutes(patchDescriptor, {
        lens: 'deposit',
        execution,
        sources: scopedBodies,
        preferQualityInference: true,
      });
      absolutes =
        Array.isArray(measured) && measured.length > 0
          ? (measured as DepositAbsoluteReading[])
          : (computeDeterministicAbsolutes(patchDescriptor) as DepositAbsoluteReading[]);
    } catch {
      absolutes = computeDeterministicAbsolutes(patchDescriptor) as DepositAbsoluteReading[];
    }

    // Allowlist constructor — legal deposit shape only.
    const pack = toDepositMeasuredPack(patchfile, absolutes);
    measuredOptions.push(pack);

    const shapeOk = hasDepositAbsolutesOnlyShape(pack);
    const artOk = hasPatchArtifact(pack);
    const ok = hasRequiredAbsolutes(pack) && shapeOk && artOk;
    measurementReports.push({
      title: patchfile.title.slice(0, 120),
      pathScopeSize: pathScope.size,
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
