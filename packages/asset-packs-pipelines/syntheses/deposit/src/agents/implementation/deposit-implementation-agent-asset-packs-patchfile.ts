/**
 * Deposit Implementation agent — write singular patchfile artifact per pack.
 *
 * Registry: implementation:deposit-implementation-agent-asset-packs-patchfile
 *
 * Sequence: patch-plan → THIS agent → measurements.
 *
 * For each planned option (descriptor + metadata), builds exactly one
 * AssetPackPatchArtifact (path-op-json, no bodies) via
 * @bitcode/generic-asset-packs-synthesis and attaches it as pack.patchArtifact
 * (the 7th product field). Does not invent paths; uses plan agent fileChanges.
 *
 * Host agent (no PTRR). Workspace fs-apply of the patch is delivery-scope,
 * not this agent.
 */

import { randomUUID } from 'crypto';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import {
  buildAssetPackPatchArtifact,
  serializeAssetPackPatchArtifactJson,
  ASSET_PACK_PATCH_ARTIFACT_SCHEMA,
} from '@bitcode/generic-asset-packs-synthesis';
import type {
  DepositPatchArtifactHandle,
  DepositPatchfilePack,
  DepositPatchfileWritePhaseOutput,
  DepositPatchPlanPack,
} from './deposit-implementation-pack-types';
import {
  countSalvagedPacks,
  hasPatchArtifact,
  toDepositPatchPlanPack,
} from './deposit-implementation-pack-types';
import { AssetPackPatchWriteTool } from '../../../../domain/src/agents/implementation/asset-pack-patch-write-tool';

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

function resolvePlanOptions(input: any, execution: any): DepositPatchPlanPack[] {
  const candidates =
    (Array.isArray(input?.options) && input.options) ||
    findValue(execution, 'implementation', 'patchedPlans') ||
    findValue(execution, 'implementation', 'patchedOptions') ||
    findValue(execution, 'implementation', 'options') ||
    [];
  if (!Array.isArray(candidates)) return [];
  return candidates
    .filter((o) => o && typeof o === 'object' && typeof o.title === 'string' && o.patch)
    .map((o) =>
      toDepositPatchPlanPack({
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
    )
    .filter((p) => p.patch.fileChanges.length > 0 && p.patch.patchSummary.length > 0);
}

function slugId(title: string): string {
  const slug = String(title || 'pack')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return slug || 'pack';
}

/**
 * Write one formal patchfile artifact for a planned pack (path-op-json, no bodies).
 */
export function writeDepositPatchfileArtifact(plan: DepositPatchPlanPack): DepositPatchArtifactHandle {
  const assetPackId = `ap-${slugId(plan.title)}-${randomUUID().slice(0, 8)}`;
  const artifactId = `artifact-patch-${randomUUID()}`;
  const built = buildAssetPackPatchArtifact({
    artifactId,
    assetPackId,
    patchSummary: plan.patch.patchSummary,
    fileChanges: plan.patch.fileChanges.map((fc) => ({
      path: String(fc.path),
      op: (fc.op === 'create' || fc.op === 'delete' || fc.op === 'modify'
        ? fc.op
        : 'modify') as 'create' | 'modify' | 'delete',
    })),
    name: `${artifactId}.patch.json`,
  });
  const envelopeJson = serializeAssetPackPatchArtifactJson(built);
  return {
    artifactId: built.identity.artifactId,
    assetPackId: built.assetPackId,
    schema: String(built.identity.schema),
    productSchema: ASSET_PACK_PATCH_ARTIFACT_SCHEMA,
    format: String(built.format || 'path-op-json'),
    patchSummary: built.patchSummary,
    fileCount: built.fileCount,
    files: built.files.map((f) => ({ path: f.path, op: String(f.op) })),
    name: built.name,
    envelopeJson,
  };
}

export default async function runDepositImplementationAgentAssetPacksPatchfile(
  input: any,
  execution: any,
): Promise<DepositPatchfileWritePhaseOutput> {
  const repository =
    input?.assetPack?.repository ??
    input?.repository ??
    findValue(execution, 'deposit', 'repository') ??
    findValue(execution, 'implementation', 'assetPack')?.repository ??
    {};

  const plans = resolvePlanOptions(input, execution);

  // Telemetry spine: record path+op (descriptor) per pack — not a substitute for artifact write.
  try {
    (execution as any)?.tools?.registerTool?.('asset-pack-patch-write', new AssetPackPatchWriteTool());
  } catch {
    /* optional */
  }

  const options: DepositPatchfilePack[] = [];
  const patchArtifacts: DepositPatchArtifactHandle[] = [];

  for (const plan of plans) {
    try {
      const tool = (execution as any)?.tools?.getTool?.('asset-pack-patch-write');
      if (tool) {
        await tool.execute({
          fileChanges: plan.patch.fileChanges,
          assetPackTitle: plan.title,
        });
      }
    } catch {
      /* telemetry optional */
    }

    const patchArtifact = writeDepositPatchfileArtifact(plan);
    // Keep descriptor fileChanges aligned with artifact files (single source of truth).
    const pack: DepositPatchfilePack = {
      ...plan,
      patch: {
        patchSummary: plan.patch.patchSummary,
        fileChanges: patchArtifact.files.map((f) => ({
          path: f.path,
          op: f.op,
        })),
      },
      patchArtifact,
    };
    options.push(pack);
    patchArtifacts.push(patchArtifact);
  }

  const salvageCount = countSalvagedPacks(options);
  const allWritten =
    options.length > 0 && options.every((o) => hasPatchArtifact(o));
  const summary = allWritten
    ? `Wrote ${options.length} deposit patchfile artifact(s) (one path-op-json AssetPackPatchArtifact per pack).`
    : options.length === 0
      ? 'Patchfile write failed: no planned packs from patch-plan agent.'
      : `Patchfile write incomplete: ${options.filter((o) => !hasPatchArtifact(o)).length} pack(s) missing artifact.`;

  const output: DepositPatchfileWritePhaseOutput = {
    success: allWritten,
    semanticKind: 'asset-pack-patchfile-written',
    options,
    summary,
    assetPack: { repository },
    patchPlanComplete: true,
    patchfileWritten: allWritten,
    measured: false,
    salvaged: salvageCount > 0,
    salvageCount,
    patchArtifacts,
  };

  storeCrossPhaseArtifact(execution, 'implementation', 'options', options);
  storeCrossPhaseArtifact(execution, 'implementation', 'assetPacks', options);
  storeCrossPhaseArtifact(execution, 'implementation', 'patchedOptions', options);
  storeCrossPhaseArtifact(execution, 'implementation', 'patchArtifacts', patchArtifacts);
  storeCrossPhaseArtifact(execution, 'implementation', 'patchfileWritten', allWritten);
  storeCrossPhaseArtifact(execution, 'implementation', 'measured', false);
  storeCrossPhaseArtifact(execution, 'implementation', 'presentable', false);
  storeCrossPhaseArtifact(execution, 'implementation', 'summary', summary);
  storeCrossPhaseArtifact(execution, 'implementation', 'assetPack', output.assetPack);
  storeCrossPhaseArtifact(execution, 'implementation', 'salvaged', salvageCount > 0);
  storeCrossPhaseArtifact(execution, 'implementation', 'salvageCount', salvageCount);

  return output;
}

export const DepositImplementationAgentAssetPacksPatchfile =
  runDepositImplementationAgentAssetPacksPatchfile;
