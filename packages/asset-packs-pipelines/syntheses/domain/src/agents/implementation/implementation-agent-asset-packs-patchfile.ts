/**
 * Deposit Implementation agent — write singular patchfile artifact per pack.
 *
 * Registry: implementation:deposit-implementation-agent-asset-packs-patchfile
 *
 * Sequence: patch-plan → THIS agent → measurements → commercial-nl.
 *
 * For each planned option (descriptor + metadata), builds exactly one
 * AssetPackPatchArtifact via @bitcode/generic-asset-packs-synthesis and attaches
 * it as pack.patchArtifact. Body bind hybrid:
 *   - modify: depositor checkout full file body
 *   - create: LLM (or deterministic fallback) full new-file body
 * Commercial law: create|modify only — no deletions.
 * Emits unified-diff text for depositor `.patch` download.
 *
 * Does not invent paths; uses plan agent fileChanges. Host agent (create-body
 * sub-agent is PTRR). Workspace PR apply is settle delivery-scope.
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
} from './asset-packs-implementation-pack-types';
import {
  countSalvagedPacks,
  hasPatchArtifact,
  toDepositPatchPlanPack,
} from './asset-packs-implementation-pack-types';
import { AssetPackPatchWriteTool } from './asset-pack-patch-write-tool';
import { hydrateMissingCreateBodies } from './asset-packs-create-body-hydrate';

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
  // Commercial law: create|modify only — drop delete ops entirely.
  const legalChanges = plan.patch.fileChanges
    .map((fc) => {
      const path = normalizeRepoPath(String(fc.path));
      if (!path) return null;
      const opRaw = String(fc.op || 'modify').toLowerCase();
      if (opRaw === 'delete') return null;
      const op = (opRaw === 'create' ? 'create' : 'modify') as 'create' | 'modify';
      return { path, op };
    })
    .filter(Boolean) as Array<{ path: string; op: 'create' | 'modify' }>;

  for (const fc of legalChanges) {
    // modify: checkout body; create: hydrated body (LLM or deterministic).
    const body = bodies.get(fc.path);
    if (typeof body === 'string') bodiesRecord[fc.path] = body;
  }
  const built = buildAssetPackPatchArtifact({
    artifactId,
    assetPackId,
    patchSummary: plan.patch.patchSummary,
    fileChanges: legalChanges,
    bodiesByPath: Object.keys(bodiesRecord).length > 0 ? bodiesRecord : null,
    name: `${artifactId}.patch.json`,
  });
  const files = built.files
    .filter((f) => String(f.op).toLowerCase() !== 'delete')
    .map((f) => ({
      path: f.path,
      op: String(f.op).toLowerCase() === 'create' ? 'create' : 'modify',
      ...(typeof f.body === 'string' ? { body: f.body } : {}),
    }));
  const hasBodies = patchFilesHaveBodies(files);
  const bodiesComplete =
    files.length > 0 && files.every((f) => typeof f.body === 'string');
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
      '../../ensure-checkout-source-files'
    ); // domain/src/ensure-checkout-source-files.ts
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

    // Hybrid bodies: modify from checkout; create via LLM/deterministic fill.
    // Clone map per pack so create fills do not leak across packs.
    const packBodies = new Map(bodiesByPath);
    try {
      await hydrateMissingCreateBodies(plan, packBodies, execution);
    } catch {
      /* bodiesComplete may stay false; presentable gate enforces */
    }

    const patchArtifact = writeDepositPatchfileArtifact(plan, packBodies);
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
