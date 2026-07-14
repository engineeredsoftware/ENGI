/**
 * Read-mode AssetPack synthesis — deposit twin with needinesses.
 *
 * AssetPack = patch + measurements + metadata
 * measurements: {
 *   absolutes: [...],
 *   needinesses: [ static *-fit + dynamic needs-*-fit ]
 * }
 *
 * LLM synthesizes patch + metadata; host attaches absolutes + needinesses.
 * BTC/PR settlement is settle-asset-pack-pipeline, not this agent.
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';
import { AssetPackPatchWriteTool } from './asset-pack-patch-write-tool';
import {
  DEPOSIT_OPTION_KINDS,
  depositCandidateSetSchema,
  type DepositSynthesisOptions,
} from './deposit-asset-pack-synthesis-schema';
import { createDepositSynthesisPrompt } from './deposit-asset-pack-synthesis-prompts';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';

const part = (content: string): PromptPart => content as PromptPart;

/** Read synthesis prompt: same option shape as deposit; host adds needinesses. */
function createReadSynthesisPrompt(): Prompt {
  const base = createDepositSynthesisPrompt();
  // Overlay identity for read (Need-grounded, still no invent volumes).
  const identity = part(
    'You are SynthesizeAssetPacks Implementation for read. A reader supplies a ' +
      'repository + Need. Synthesize 2-4 DISTINCT AssetPack options (patch descriptors + ' +
      'metadata) that help satisfy the Need using Discovery (codebase, depository, ' +
      'regurgitation) and Need guidance. Absolute + neediness (*-fit) measurements are ' +
      'ATTACHED by the host after your output — do NOT invent measurement volumes. ' +
      `Kinds: ${DEPOSIT_OPTION_KINDS.join(', ')}. Source-safe only; never raw code.`,
  );
  base.set('agent:identity', identity);
  return base;
}

const readPrompt = createReadSynthesisPrompt();

export const ReadAssetPackSynthesisAgent = factoryPTRRAgent<any, DepositSynthesisOptions>({
  name: 'ReadAssetPackSynthesisAgent',
  description:
    'Synthesizes read AssetPack options (patch + metadata); host attaches absolutes + *-fit needinesses.',
  outputSchema: depositCandidateSetSchema,
  tools: [],
  prompt: readPrompt,
  stepPrompts: {
    plan: () => readPrompt,
    try: () => readPrompt,
    refine: () => readPrompt,
    retry: () => readPrompt,
  },
  plan: { chunkThreshold: 2000 },
  try: { chunkThreshold: 5000 },
  refine: { maxAttempts: 2 },
  retry: { maxAttempts: 1 },
});

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

export default async function runReadAssetPackSynthesisAgent(input: any, execution: any) {
  const repository =
    input?.repository ??
    findValue(execution, 'read', 'repository') ??
    findValue(execution, 'deposit', 'repository') ??
    {};
  const needComprehension =
    findValue(execution, 'setup', 'needComprehension') ??
    findValue(execution, 'setup', 'inputComprehension');
  const needText = findValue(execution, 'read', 'need') ?? input?.need ?? '';

  const { ensureDepositCheckoutSourceFiles } = await import(
    '../../ensure-deposit-checkout-source-files'
  );
  const { resolveSourceCheckoutCatalog } = await import('../../resolve-source-checkout-catalog');
  const sourceCheckoutCatalog = await ensureDepositCheckoutSourceFiles(
    execution,
    resolveSourceCheckoutCatalog(
      execution,
      input?.sourceCheckoutCatalog ?? input?.inventory,
    ),
  );
  const { projectInventoryForPrompt } = await import('../../asset-packs-synthesis');
  const catalogForPrompt = projectInventoryForPrompt(sourceCheckoutCatalog);
  const sourceMeasurements = findValue(execution, 'discovery', 'sourceMeasurements') ?? [];

  const raw = await ReadAssetPackSynthesisAgent(
    {
      ...input,
      repository,
      need: needText,
      needComprehension,
      sourceCheckoutCatalog: catalogForPrompt,
      inventory: catalogForPrompt,
      inventoryPaths: catalogForPrompt?.paths ?? sourceCheckoutCatalog?.paths,
      discovery: {
        codebase: findValue(execution, 'discovery', 'codebaseComprehension'),
        depository: findValue(execution, 'discovery', 'depositorySearch'),
        regurgitation: findValue(execution, 'discovery', 'inherentRegurgitation'),
        sourceMeasurements,
      },
    },
    execution,
  );
  const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;
  const options = Array.isArray((result as any)?.options) ? (result as any).options : [];

  try {
    (execution as any)?.tools?.registerTool?.('asset-pack-patch-write', new AssetPackPatchWriteTool());
  } catch {}

  const bodies = Array.isArray((sourceCheckoutCatalog as any)?.sources)
    ? (sourceCheckoutCatalog as any).sources
        .filter((s: any) => s && typeof s.path === 'string' && typeof s.content === 'string')
        .map((s: any) => ({ path: s.path as string, content: s.content as string }))
    : [];
  const { measureAssetPackAbsolutes } = await import('../validation/agent-measure-absolutes');
  const { attachNestedAbsolutes } = await import('../../asset-pack-measurements');
  const { measureReadNeedinesses, computeNeedFitVolume } = await import(
    '../../read-neediness-measurements'
  );
  const dynamicKinds = Array.isArray(needComprehension?.dynamicNeedinessKinds)
    ? needComprehension.dynamicNeedinessKinds
    : [];

  for (const option of options) {
    delete (option as any).needinessSignal;
    const fileChanges = (option as any)?.patch?.fileChanges;
    if (Array.isArray(fileChanges)) {
      try {
        const tool = (execution as any)?.tools?.getTool?.('asset-pack-patch-write');
        if (tool) {
          const descriptor = await tool.execute({
            fileChanges,
            assetPackTitle: (option as any)?.title,
          });
          (option as any).patch.fileChanges = descriptor.fileChanges;
        }
      } catch {}
    }

    let absolutes: any[] = [];
    try {
      if (Array.isArray(sourceMeasurements) && sourceMeasurements.length > 0) {
        absolutes = sourceMeasurements;
      } else {
        absolutes = await measureAssetPackAbsolutes(
          {
            title: String((option as any)?.title ?? ''),
            summary: String((option as any)?.summary ?? ''),
            coveredSourcePaths: Array.isArray((option as any)?.coveredSourcePaths)
              ? (option as any).coveredSourcePaths
              : [],
            fileChanges: Array.isArray((option as any)?.patch?.fileChanges)
              ? (option as any).patch.fileChanges
              : undefined,
            confidence:
              typeof (option as any)?.confidence === 'number'
                ? (option as any).confidence
                : undefined,
            patchSummary:
              typeof (option as any)?.patch?.patchSummary === 'string'
                ? (option as any).patch.patchSummary
                : undefined,
          },
          { lens: 'read', execution, sources: bodies },
        );
      }
    } catch {
      absolutes = [];
    }

    const needinesses = await measureReadNeedinesses({
      title: String((option as any)?.title ?? ''),
      summary: String((option as any)?.summary ?? ''),
      confidence: (option as any)?.confidence,
      needSummary: needComprehension?.summary || String(needText || ''),
      dynamicKinds,
      execution,
    });
    const needFit = computeNeedFitVolume(needinesses);

    attachNestedAbsolutes(option as any, absolutes);
    (option as any).measurements = {
      absolutes,
      needinesses,
    };
    (option as any).needFit = needFit;
    (option as any).absolutes = absolutes;
  }

  const output = {
    success: true,
    semanticKind: 'asset-pack-written-asset' as const,
    options,
    summary: `Synthesized ${options.length} measured read AssetPack(s) (patch + absolutes + *-fit needinesses).`,
    assetPack: { repository },
  };

  storeCrossPhaseArtifact(execution, 'implementation', 'assetPacks', options);
  storeCrossPhaseArtifact(execution, 'implementation', 'options', options);
  storeCrossPhaseArtifact(execution, 'implementation', 'summary', output.summary);
  storeCrossPhaseArtifact(execution, 'implementation', 'assetPack', output.assetPack);

  return output;
}
