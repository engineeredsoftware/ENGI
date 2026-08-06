/**
 * Base Implementation host 4/4 — commercial natural-language synthesis.
 *
 * Owned by synthesis domain (shared base). Product shells live in deposit/ and
 * read/ packages; they must re-implement product deltas against this base and
 * must never import each other.
 *
 * Registry (deposit product key):
 *   implementation:deposit-implementation-agent-asset-packs-commercial-nl
 * Registry (read product key uses its own shell → this base).
 *
 * Sequence: patch-plan → patchfile → measurements → THIS agent.
 *
 * LLM providers receive the REAL commercial .patch material (file bodies +
 * unifiedDiff + measurements). Source-safety is a PRODUCT disclosure law
 * (what users/API surfaces may show unpaid) — not a provider-input constraint.
 * Pre-launch third-party LLMs and launch self-hosted models both get full
 * content so commercial prose is grounded in the actual DataPack.
 *
 * Writes commercialTitle + commercialDescription for buyer product surfaces
 * (rich, exhaustive, useful for purchase). Full .patch bodies remain
 * rights-gated on unpaid Exchange until settle.
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import {
  depositCommercialNlSetSchemaNormalized,
  type DepositCommercialNlItem,
  type DepositCommercialNlSet,
} from './asset-packs-commercial-nl-schema';
import { createDepositCommercialNlPrompt } from './asset-packs-commercial-nl-prompts';
import { createReadCommercialNlPrompt } from './asset-packs-commercial-nl-prompts-read';
import type {
  DepositCommercialNlPhaseOutput,
  DepositCommercialPack,
  DepositMeasuredPack,
} from './asset-packs-implementation-pack-types';
import {
  countSalvagedPacks,
  hasCommercialNl,
  isDepositPresentablePack,
  toDepositCommercialPack,
} from './asset-packs-implementation-pack-types';
import { projectDepositoryHitsForImplementation } from './implementation-agent-asset-packs-patch-plan';

const commercialPrompt = createDepositCommercialNlPrompt();
const readCommercialPrompt = createReadCommercialNlPrompt();

export const DepositImplementationAgentAssetPacksCommercialNl = factoryPTRRAgent<
  any,
  DepositCommercialNlSet
>({
  name: 'DepositImplementationAgentAssetPacksCommercialNl',
  description:
    'Implementation commercial-NL (deposit): buyer title + description grounded in full .patch + measurements.',
  outputSchema: depositCommercialNlSetSchemaNormalized,
  tools: [],
  prompt: commercialPrompt,
  stepPrompts: {
    plan: () => commercialPrompt,
    try: () => commercialPrompt,
    refine: () => commercialPrompt,
    retry: () => commercialPrompt,
  },
  plan: { chunkThreshold: 3000 },
  try: { chunkThreshold: 6000 },
  refine: { maxAttempts: 1 },
  retry: { maxAttempts: 1 },
});

export const ReadImplementationAgentAssetPacksCommercialNl = factoryPTRRAgent<
  any,
  DepositCommercialNlSet
>({
  name: 'ReadImplementationAgentAssetPacksCommercialNl',
  description:
    'Implementation commercial-NL (read): Need-first buyer brief grounded in patch + measurements + fit.',
  outputSchema: depositCommercialNlSetSchemaNormalized,
  tools: [],
  prompt: readCommercialPrompt,
  stepPrompts: {
    plan: () => readCommercialPrompt,
    try: () => readCommercialPrompt,
    refine: () => readCommercialPrompt,
    retry: () => readCommercialPrompt,
  },
  plan: { chunkThreshold: 3000 },
  try: { chunkThreshold: 6000 },
  refine: { maxAttempts: 1 },
  retry: { maxAttempts: 1 },
});

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

function resolveMeasuredOptions(input: any, execution: any): DepositMeasuredPack[] {
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
      o.measurements,
  ) as DepositMeasuredPack[];
}

/**
 * Full DataPack packet for commercial-NL LLM input.
 *
 * Includes real file bodies and unifiedDiff — providers may receive full
 * commercial material. Product surfaces later gate bodies by rights; this
 * packet is synthesis-only (not an unpaid API response).
 */
export function buildCommercialNlPacket(packs: DepositMeasuredPack[]): unknown {
  return {
    disclosureNote:
      'SYNTHESIS_PROVIDER_INPUT: full .patch bodies included. Product/API source-safety applies only to user-visible unpaid surfaces, not to this LLM packet.',
    packs: packs.map((p, index) => {
      const absolutes = p.measurements?.absolutes || p.absolutes || [];
      const measured = absolutes.filter(
        (a) => a.status === 'measured' || a.status === 'estimated',
      );
      const fills = absolutes.filter((a) => a.status === 'expanded-fill');
      // Prefer artifact files (authoritative bodies); fall back to descriptor content.
      const artifactFiles = Array.isArray(p.patchArtifact?.files)
        ? p.patchArtifact!.files!
        : [];
      const descriptorChanges = Array.isArray(p.patch?.fileChanges)
        ? p.patch.fileChanges
        : [];
      const bodyByPath = new Map<string, string>();
      for (const f of artifactFiles) {
        if (typeof f.body === 'string') bodyByPath.set(String(f.path), f.body);
      }
      for (const fc of descriptorChanges) {
        const path = String(fc.path || '');
        if (!path || bodyByPath.has(path)) continue;
        if (typeof fc.content === 'string') bodyByPath.set(path, fc.content);
      }
      const fileChanges = (
        artifactFiles.length > 0
          ? artifactFiles.map((f) => ({
              path: String(f.path),
              op: String(f.op || 'modify'),
              body:
                typeof f.body === 'string'
                  ? f.body
                  : bodyByPath.get(String(f.path)) ?? null,
            }))
          : descriptorChanges.map((fc) => ({
              path: String(fc.path),
              op: String(fc.op || 'modify'),
              body:
                typeof fc.content === 'string'
                  ? fc.content
                  : bodyByPath.get(String(fc.path)) ?? null,
            }))
      );
      const createCount = fileChanges.filter(
        (f) => String(f.op).toLowerCase() === 'create',
      ).length;
      const modifyCount = fileChanges.filter(
        (f) => String(f.op).toLowerCase() !== 'create',
      ).length;
      const bodiesBound = fileChanges.filter((f) => typeof f.body === 'string').length;
      const unifiedDiff =
        typeof p.patchArtifact?.unifiedDiff === 'string'
          ? p.patchArtifact.unifiedDiff
          : null;
      return {
        packIndex: index,
        kind: p.kind,
        title: p.title,
        summary: p.summary,
        confidence: p.confidence,
        coveredSourcePaths: p.coveredSourcePaths,
        patch: {
          patchSummary: p.patch?.patchSummary || p.patchArtifact?.patchSummary,
          fileChanges,
          createCount,
          modifyCount,
          bodiesBound,
          bodiesComplete: p.patchArtifact?.bodiesComplete ?? null,
          /** Full commercial .patch text when available — primary grounding material. */
          unifiedDiff,
        },
        measurements: {
          absoluteCount: absolutes.length,
          measuredKindCount: measured.length,
          expandedFillCount: fills.length,
          mode: p.measureReport?.mode || p.measurements?.measureReport?.mode || null,
          measuredFromBodies:
            p.measureReport?.measuredFromBodies ??
            p.measurements?.measureReport?.measuredFromBodies ??
            null,
          bodyCoverageRatio:
            p.measureReport?.bodyCoverageRatio ??
            p.measurements?.measureReport?.bodyCoverageRatio ??
            null,
          // Full absolute rows (including descriptors) for commercial grounding.
          absolutes: absolutes.map((a) => ({
            measurementKind: a.measurementKind,
            label: a.label,
            volume: a.volume,
            magnitude: a.magnitude,
            unit: a.unit,
            status: a.status,
            descriptor: a.descriptor,
            weight: a.weight,
            category: a.category,
          })),
          materialIdentity:
            p.materialIdentity || p.measurements?.materialIdentity || null,
        },
      };
    }),
  };
}

function unwrapCommercialSet(raw: unknown): DepositCommercialNlItem[] {
  if (!raw || typeof raw !== 'object') return [];
  const r = raw as Record<string, unknown>;
  const candidates = [r, r.output, r.finalOutput, r.result];
  for (const c of candidates) {
    if (!c || typeof c !== 'object') continue;
    const opts = (c as { options?: unknown }).options;
    if (Array.isArray(opts)) return opts as DepositCommercialNlItem[];
  }
  return [];
}

/**
 * Deterministic commercial prose when LLM fails — grounded in real bodies when bound.
 */
export function buildFallbackCommercialNl(
  pack: DepositMeasuredPack,
): { commercialTitle: string; commercialDescription: string } {
  const artifactFiles = Array.isArray(pack.patchArtifact?.files)
    ? pack.patchArtifact!.files!
    : [];
  const fileChanges =
    artifactFiles.length > 0
      ? artifactFiles.map((f) => ({
          path: String(f.path),
          op: String(f.op || 'modify'),
          body: typeof f.body === 'string' ? f.body : null,
        }))
      : (pack.patch?.fileChanges || []).map((fc) => ({
          path: String(fc.path),
          op: String(fc.op || 'modify'),
          body: typeof fc.content === 'string' ? fc.content : null,
        }));
  const creates = fileChanges.filter((f) => String(f.op).toLowerCase() === 'create');
  const modifies = fileChanges.filter((f) => String(f.op).toLowerCase() !== 'create');
  const absolutes = pack.measurements?.absolutes || pack.absolutes || [];
  const measured = absolutes.filter(
    (a) => a.status === 'measured' || a.status === 'estimated',
  );
  const fills = absolutes.filter((a) => a.status === 'expanded-fill');
  const mode =
    pack.measureReport?.mode || pack.measurements?.measureReport?.mode || 'path-only';
  const paths = (pack.coveredSourcePaths || []).slice(0, 12).join(', ') || 'repository surfaces';
  const bodyNotes = fileChanges
    .filter((f) => typeof f.body === 'string' && f.body.length > 0)
    .slice(0, 8)
    .map((f) => {
      const body = f.body as string;
      const lines = body.split('\n').filter((l) => l.trim().length > 0);
      const preview = lines.slice(0, 4).join(' · ').slice(0, 220);
      return `${f.op} ${f.path} (${body.length} chars): ${preview}`;
    });
  const commercialTitle =
    pack.title.length >= 8 ? pack.title : `${pack.title} knowledge pack`.slice(0, 160);
  const commercialDescription = [
    pack.summary,
    '',
    `Commercial thesis: ${pack.patch?.patchSummary || pack.summary}`,
    '',
    `Scope: ${paths}.`,
    `Patch shape: ${modifies.length} modify path(s), ${creates.length} create path(s) — commercial deposit law allows create|modify only (no deletions).`,
    bodyNotes.length > 0
      ? `Material previews (from bound bodies):\n${bodyNotes.map((n) => `- ${n}`).join('\n')}`
      : 'File bodies were not bound on this pack; commercial brief is metadata-limited until patchfile hydration completes.',
    '',
    `Measurements: ${absolutes.length} absolute kind(s) in catalogue; ${measured.length} measured/estimated; ${fills.length} expanded-fill honesty placeholders; measure mode=${mode}.`,
    measured.length > 0
      ? `Strong measured signals include: ${measured
          .slice(0, 8)
          .map((a) => a.label || a.measurementKind)
          .join('; ')}.`
      : 'Absolute volumes rely on path-scope and expanded catalogue honesty until deeper body measure.',
    '',
    'Purchase posture: full .patch file bodies remain rights-gated on unpaid product surfaces until BTC settlement and BTD rights transfer. This commercial brief is the pre-purchase readable grounded in synthesized material.',
    'Buyer value: reusable technical knowledge encoded as a depositor-owned change set plus honest absolute measurements for needs-fits comparison on the exchange.',
  ].join('\n');
  return { commercialTitle, commercialDescription };
}

function matchCommercialItem(
  pack: DepositMeasuredPack,
  index: number,
  items: DepositCommercialNlItem[],
): DepositCommercialNlItem | null {
  const byIndex = items.find((i) => i.packIndex === index);
  if (byIndex) return byIndex;
  const byTitle = items.find(
    (i) =>
      typeof i.packTitle === 'string' &&
      i.packTitle.trim().toLowerCase() === pack.title.trim().toLowerCase(),
  );
  if (byTitle) return byTitle;
  return items[index] || null;
}

export default async function runDepositImplementationAgentAssetPacksCommercialNl(
  input: any,
  execution: any,
): Promise<DepositCommercialNlPhaseOutput> {
  const productLens =
    input?.productLens === 'read' ||
    findValue(execution, 'implementation', 'productLens') === 'read'
      ? 'read'
      : 'deposit';
  const repository =
    input?.assetPack?.repository ??
    input?.repository ??
    findValue(execution, 'deposit', 'repository') ??
    findValue(execution, 'read', 'repository') ??
    findValue(execution, 'implementation', 'assetPack')?.repository ??
    {};

  const measured = resolveMeasuredOptions(input, execution);
  const basePacket = buildCommercialNlPacket(measured) as Record<string, unknown>;
  const needComprehension =
    input?.needComprehension ??
    findValue(execution, 'setup', 'needComprehension') ??
    findValue(execution, 'read', 'needComprehension');
  const needText =
    input?.need ??
    findValue(execution, 'implementation', 'need') ??
    findValue(execution, 'read', 'need') ??
    (typeof needComprehension?.summary === 'string' ? needComprehension.summary : null);
  const toolResult =
    findValue(execution, 'discovery', 'depositorySearchToolResult') ??
    findValue(execution, 'tools', 'depository-asset-pack-search');
  const depositoryHits =
    findValue(execution, 'implementation', 'depositoryHits') ??
    projectDepositoryHitsForImplementation(toolResult);

  const packet =
    productLens === 'read'
      ? {
          ...basePacket,
          productLens: 'read',
          need: needText,
          needComprehension: needComprehension
            ? {
                summary: needComprehension.summary,
                needTopics: needComprehension.needTopics,
                acceptanceCriteria: needComprehension.acceptanceCriteria,
              }
            : null,
          depositoryHits,
        }
      : { ...basePacket, productLens: 'deposit', depositoryHits };

  const commercialAgent =
    productLens === 'read'
      ? ReadImplementationAgentAssetPacksCommercialNl
      : DepositImplementationAgentAssetPacksCommercialNl;

  let items: DepositCommercialNlItem[] = [];
  try {
    const raw = await commercialAgent(
      { commercialNlPacket: packet, packs: packet, need: needText, productLens },
      execution,
    );
    items = unwrapCommercialSet(raw);
  } catch {
    items = [];
  }

  const options: DepositCommercialPack[] = measured.map((pack, index) => {
    const item = matchCommercialItem(pack, index, items);
    const commercial =
      item &&
      typeof item.commercialTitle === 'string' &&
      typeof item.commercialDescription === 'string' &&
      item.commercialTitle.trim().length >= 8 &&
      item.commercialDescription.trim().length >= 80
        ? {
            commercialTitle: item.commercialTitle.trim(),
            commercialDescription: item.commercialDescription.trim(),
          }
        : buildFallbackCommercialNl(pack);
    return toDepositCommercialPack(pack, commercial);
  });

  const salvageCount = countSalvagedPacks(options);
  const commercialNlComplete =
    options.length > 0 && options.every((o) => hasCommercialNl(o));
  const presentable =
    options.length > 0 &&
    salvageCount === 0 &&
    options.every((o) => isDepositPresentablePack(o));
  const measuredOk =
    options.length > 0 &&
    options.every((o) => Array.isArray(o.measurements?.absolutes));

  const productLabel = productLens === 'read' ? 'read' : 'deposit';
  const summary = commercialNlComplete
    ? `Attached commercial title + description for ${options.length} ${productLabel} DataPack(s).`
    : options.length === 0
      ? 'Commercial NL failed: no measured packs from measurements agent.'
      : `Commercial NL partial: ${options.filter((o) => hasCommercialNl(o)).length}/${options.length} packs have rich commercial prose.`;

  const output: DepositCommercialNlPhaseOutput = {
    success: commercialNlComplete,
    semanticKind: 'asset-pack-commercial-nl',
    options,
    summary,
    assetPack: { repository },
    patchPlanComplete: true,
    patchfileWritten: options.every((o) => !!o.patchArtifact),
    measured: measuredOk,
    presentable,
    salvaged: salvageCount > 0,
    salvageCount,
    commercialNlComplete,
  };

  storeCrossPhaseArtifact(execution, 'implementation', 'options', options);
  storeCrossPhaseArtifact(execution, 'implementation', 'assetPacks', options);
  storeCrossPhaseArtifact(execution, 'implementation', 'assetPack', output.assetPack);
  storeCrossPhaseArtifact(execution, 'implementation', 'summary', summary);
  storeCrossPhaseArtifact(execution, 'implementation', 'presentable', presentable);
  storeCrossPhaseArtifact(
    execution,
    'implementation',
    'commercialNlComplete',
    commercialNlComplete,
  );
  storeCrossPhaseArtifact(execution, 'implementation', 'salvaged', salvageCount > 0);
  storeCrossPhaseArtifact(execution, 'implementation', 'salvageCount', salvageCount);

  return output;
}

export const DepositImplementationAgentAssetPacksCommercialNlRun =
  runDepositImplementationAgentAssetPacksCommercialNl;
