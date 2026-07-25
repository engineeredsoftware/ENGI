/**
 * Deposit Implementation agent — write singular patchfile artifact per pack.
 *
 * Registry: implementation:deposit-implementation-agent-asset-packs-patchfile
 *
 * Sequence: patch-plan → THIS agent → measurements.
 *
 * For each planned option (descriptor + metadata), builds exactly one
 * AssetPackPatchArtifact via @bitcode/generic-asset-packs-synthesis and attaches
 * it as pack.patchArtifact (7th field). Binds full file bodies from the run
 * checkout catalog when available — that material is what is admitted/settled.
 * Also emits unified-diff text for depositor `.patch` download.
 *
 * Does not invent paths; uses plan agent fileChanges. Host agent (no PTRR).
 * Workspace PR apply is settle delivery-scope, not this agent.
 */

import { randomUUID } from 'crypto';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import {
  buildAssetPackPatchArtifact,
  serializeAssetPackPatchArtifactJson,
  ASSET_PACK_PATCH_ARTIFACT_SCHEMA,
} from '@bitcode/generic-asset-packs-synthesis';
import {
  buildUnifiedDiffFromPatchFiles,
  patchFilesHaveBodies,
} from '@bitcode/generic-artifacts-patch-kind';
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

function normalizeRepoPath(p: string): string {
  return String(p || '')
    .replace(/\\/g, '/')
    .replace(/^\.?\//, '')
    .trim();
}

/** Index checkout bodies by normalized path. */
export function indexCheckoutBodies(
  sources: Array<{ path?: string; content?: string }> | null | undefined,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const s of sources || []) {
    if (!s || typeof s.path !== 'string' || typeof s.content !== 'string') continue;
    const key = normalizeRepoPath(s.path);
    if (key && !map.has(key)) map.set(key, s.content);
  }
  return map;
}

/**
 * Write one formal patchfile artifact for a planned pack.
 * Binds full bodies from checkout when present → unified-diff for depositor.
 */
export function writeDepositPatchfileArtifact(
  plan: DepositPatchPlanPack,
  bodiesByPath?: Map<string, string> | null,
): DepositPatchArtifactHandle {
  const assetPackId = `ap-${slugId(plan.title)}-${randomUUID().slice(0, 8)}`;
  const artifactId = `artifact-patch-${randomUUID()}`;
  const bodies = bodiesByPath || new Map<string, string>();
  const bodiesRecord: Record<string, string> = {};
  for (const fc of plan.patch.fileChanges) {
    const path = normalizeRepoPath(String(fc.path));
    if (!path) continue;
    const op = String(fc.op || 'modify').toLowerCase();
    if (op === 'delete') continue;
    const body = bodies.get(path);
    if (typeof body === 'string') bodiesRecord[path] = body;
  }
  const built = buildAssetPackPatchArtifact({
    artifactId,
    assetPackId,
    patchSummary: plan.patch.patchSummary,
    fileChanges: plan.patch.fileChanges.map((fc) => ({
      path: normalizeRepoPath(String(fc.path)),
      op: (fc.op === 'create' || fc.op === 'delete' || fc.op === 'modify'
        ? fc.op
        : 'modify') as 'create' | 'modify' | 'delete',
    })),
    bodiesByPath: Object.keys(bodiesRecord).length > 0 ? bodiesRecord : null,
    name: `${artifactId}.patch.json`,
  });
  const files = built.files.map((f) => ({
    path: f.path,
    op: String(f.op),
    ...(typeof f.body === 'string' ? { body: f.body } : {}),
  }));
  const hasBodies = patchFilesHaveBodies(files);
  const nonDelete = files.filter((f) => String(f.op).toLowerCase() !== 'delete');
  const bodiesComplete =
    nonDelete.length === 0 ||
    nonDelete.every((f) => typeof f.body === 'string' && f.body.length >= 0);
  const unifiedDiff = hasBodies
    ? buildUnifiedDiffFromPatchFiles(files, {
        patchSummary: built.patchSummary,
      })
    : null;
  const envelopeJson = serializeAssetPackPatchArtifactJson({
    ...built,
    format: hasBodies ? 'unified-diff' : built.format,
  });
  return {
    artifactId: built.identity.artifactId,
    assetPackId: built.assetPackId,
    schema: String(built.identity.schema),
    productSchema: ASSET_PACK_PATCH_ARTIFACT_SCHEMA,
    format: hasBodies ? 'unified-diff' : String(built.format || 'path-op-json'),
    patchSummary: built.patchSummary,
    fileCount: built.fileCount,
    files,
    name: hasBodies ? `${artifactId}.patch` : built.name,
    envelopeJson,
    unifiedDiff,
    bodiesComplete,
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

  // Bind full file bodies from this run's checkout (depositor-owned material).
  let bodiesByPath = new Map<string, string>();
  try {
    const { ensureDepositCheckoutSourceFiles } = await import(
      '../../ensure-deposit-checkout-source-files'
    );
    const { resolveSourceCheckoutCatalog } = await import(
      '@bitcode/asset-packs-pipelines-syntheses-domain/resolve-source-checkout-catalog'
    );
    const catalog = await ensureDepositCheckoutSourceFiles(
      execution,
      resolveSourceCheckoutCatalog(execution, input?.sourceCheckoutCatalog),
    );
    bodiesByPath = indexCheckoutBodies(
      Array.isArray((catalog as any)?.sources) ? (catalog as any).sources : [],
    );
  } catch {
    bodiesByPath = new Map();
  }

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

    const patchArtifact = writeDepositPatchfileArtifact(plan, bodiesByPath);
    // Descriptor carries content for settle/download (single source of truth).
    const pack: DepositPatchfilePack = {
      ...plan,
      patch: {
        patchSummary: plan.patch.patchSummary,
        fileChanges: patchArtifact.files.map((f) => ({
          path: f.path,
          op: f.op,
          ...(typeof f.body === 'string' ? { content: f.body } : {}),
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
