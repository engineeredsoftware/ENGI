/**
 * Deposit Implementation agent 2/2 — AssetPacks measurements synthesis (V48).
 *
 * Deposit AssetPack = patchfile + absolute measurements + metadata.
 *
 * Tool-rich host agent (no free-form volume invention):
 *   1. Register SourceStaticAnalysisTool on the execution (telemetry spine)
 *   2. measureAssetPackAbsolutes(patch, { lens:'deposit', preferQualityInference:true })
 *      - QUANTITY kinds: static analysis tool-authoritative
 *      - QUALITY kinds: measure-agent inference grounded in static report,
 *        still slotted into ASSET_PACK_ABSOLUTES_CATALOG only
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
  isDepositPresentablePack,
  toDepositMeasuredPack,
  toDepositPatchfilePack,
} from './deposit-implementation-pack-types';

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

function resolvePatchfileOptions(input: any, execution: any): DepositPatchfilePack[] {
  const candidates =
    (Array.isArray(input?.options) && input.options) ||
    findValue(execution, 'implementation', 'patchedOptions') ||
    findValue(execution, 'implementation', 'options') ||
    findValue(execution, 'implementation', 'assetPacks') ||
    [];
  if (!Array.isArray(candidates)) return [];
  // Re-project through allowlist so agent 2/2 never inherits non-patchfile fields.
  return candidates
    .filter((o) => o && typeof o === 'object' && typeof o.title === 'string' && o.patch)
    .map((o) =>
      toDepositPatchfilePack({
        kind: o.kind,
        title: o.title,
        summary: String(o.summary ?? ''),
        coveredSourcePaths: Array.isArray(o.coveredSourcePaths) ? o.coveredSourcePaths : [],
        confidence: typeof o.confidence === 'number' ? o.confidence : 0.5,
        patch: {
          fileChanges: Array.isArray(o.patch?.fileChanges) ? o.patch.fileChanges : [],
          patchSummary: String(o.patch?.patchSummary ?? ''),
        },
        salvaged: o.salvaged === true ? true : undefined,
        salvageReason: typeof o.salvageReason === 'string' ? o.salvageReason : undefined,
      }),
    );
}

function toMeasurablePatch(option: DepositPatchfilePack): MeasurableAssetPackPatch {
  return {
    title: option.title,
    summary: option.summary,
    coveredSourcePaths: option.coveredSourcePaths,
    fileChanges: option.patch.fileChanges.map((c) => ({
      path: String(c.path),
      op: String(c.op ?? 'modify'),
    })),
    confidence: option.confidence,
    patchSummary: option.patch.patchSummary,
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
    measureAssetPackAbsolutes,
    computeDeterministicAbsolutes,
    registerSourceStaticAnalysisTool,
  } = await import('../../../../domain/src/agents/validation/agent-measure-absolutes');
  const { hasRequiredAbsolutes, hasDepositAbsolutesOnlyShape } = await import(
    '@bitcode/asset-packs-pipelines-syntheses-domain/asset-pack-measurements'
  );

  // Formal static-analysis tool on the execution registry (tool telemetry spine).
  try {
    if (execution) {
      registerSourceStaticAnalysisTool(execution);
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
      // Tool-rich measure: static analysis (quantity) + quality inference into catalog.
      const measured = await measureAssetPackAbsolutes(patchDescriptor, {
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
    const ok = hasRequiredAbsolutes(pack) && shapeOk;
    measurementReports.push({
      title: patchfile.title.slice(0, 120),
      pathScopeSize: pathScope.size,
      absoluteCount: absolutes.length,
      measuredFromBodies: scopedBodies.length > 0,
      depositShapeOk: shapeOk,
      salvaged: pack.salvaged === true,
      ok,
    });
  }

  const salvageCount = countSalvagedPacks(measuredOptions);
  const allMeasured =
    measuredOptions.length > 0 && measuredOptions.every((o) => hasRequiredAbsolutes(o));
  const presentable =
    allMeasured &&
    salvageCount === 0 &&
    measuredOptions.every((o) => isDepositPresentablePack(o));

  let summary: string;
  if (measuredOptions.length === 0) {
    summary = 'Measurements synthesis failed: no patchfile options from agent 1/2.';
  } else if (presentable) {
    summary = `Synthesized absolute measurements for ${measuredOptions.length} presentable deposit AssetPack(s) (patch + absolutes + metadata).`;
  } else if (allMeasured && salvageCount > 0) {
    summary = `Measured ${measuredOptions.length} deposit AssetPack(s) including ${salvageCount} salvaged (NOT presentable for deposit review).`;
  } else if (allMeasured) {
    summary = `Measured ${measuredOptions.length} deposit AssetPack(s) but presentable gate failed.`;
  } else {
    summary = `Measurements synthesis incomplete for ${measuredOptions.length} option(s); missing required absolutes.`;
  }

  const output: DepositMeasurementsPhaseOutput = {
    success: allMeasured,
    semanticKind: 'asset-pack-written-asset',
    options: measuredOptions,
    summary,
    assetPack: { repository },
    patchfilePhaseComplete: true,
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

  if (!findValue(execution, 'implementation', 'patchedOptions')) {
    storeCrossPhaseArtifact(execution, 'implementation', 'patchedOptions', patchfiles);
  }

  return output;
}

export const DepositImplementationAgentAssetPacksMeasurementsSynthesis =
  runDepositImplementationAgentAssetPacksMeasurementsSynthesis;
