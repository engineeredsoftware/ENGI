/**
 * AssetPacksSynthesis — formal pipeline execution (V48 Gate 3).
 *
 * Generation hierarchy used here:
 *   generation-generics → generic-generations/{failsafes,thinkings}
 *     → agent-generics (createFailsafeGenerationSequence / factoryAgent)
 *     → this product pipeline (SynthesizeAssetPacks measurement)
 *
 * Runtime path:
 *   PipelineExecution → phase → factoryAgent (AgentExecution) → step
 *     → createFailsafeGenerationSequence  (Failsafe[prepare|chunk|stitch] ∘
 *        Thinkings[reason|judge|structured_output])
 *
 * Product does not reimplement failsafe/thinkings bases; it supplies
 * measurement catalogs, schemas, and PromptParts. Source-safety: LLM substeps
 * store full prompt/response content, withheld by sourceSafeStreamEvent;
 * assertSourceSafeCandidates is local defense-in-depth.
 */

import { z } from 'zod';
import type { Execution } from '@bitcode/execution-generics/Execution';
import { PipelineExecution } from '@bitcode/pipelines-generics';
import {
  factoryAgent,
  createFailsafeGenerationSequence,
  ExecutionTool,
  type AgentStep,
} from '@bitcode/agent-generics';
import { resolveDefaultLLMConfig } from '@bitcode/generic-llms';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';

import { measurementCatalogForLens } from './asset-packs-synthesis-catalogs';
import { applyExclusionsToInventory } from './asset-packs-synthesis-inventory';
import type {
  AssetPackMeasurementSpec,
  AssetPacksSynthesisLens,
  AssetPacksSynthesisSourceInventory,
  AssetPacksSynthesisSourceSample,
  AssetPacksSynthesisSteering,
} from './asset-packs-synthesis-types';

const part = (content: string): PromptPart => content as PromptPart;

// ---- Layered system PromptParts (composed by buildHierarchicalPrompt) -------

const PIPELINE_IDENTITY = part(
  'You are AssetPacksSynthesis, the single Bitcode synthesis and measurement pipeline. ' +
    'Depositing and Reading are the same operation at the core: measuring source knowledge ' +
    'into commercially legible AssetPack candidates; the lens carries the variance.',
);

const PIPELINE_SOURCE_SAFETY = part(
  'Source-safety law (mandatory): never quote source code, secrets, or file contents in any ' +
    'title, summary, or rationale. Describe knowledge and capability, never raw text. Honor the ' +
    'protected-IP exclusions absolutely — never cover, reference, or describe excluded material.',
);

const LENS_ROLE: Record<AssetPacksSynthesisLens, PromptPart> = {
  deposit: part(
    'Lens: deposit. Depositors supply AssetPacks (bounded, source-safe slices of repository ' +
      'knowledge) into a Depository where future buyers find Need-fitting packs. Synthesize ' +
      'distinct deposit AssetPack options the depositor can review and admit.',
  ),
  read: part(
    'Lens: read. Readers ask Bitcode to satisfy a reviewed Need by finding and synthesizing ' +
      'Need-fitting AssetPacks from Depository source. Synthesize distinct Need-fitting ' +
      'AssetPack candidates the reader can review and buy.',
  ),
};

function buildCatalogPart(catalog: AssetPackMeasurementSpec[]): PromptPart {
  return part(
    [
      'measurements is an object with EXACTLY these keys, each an honest 0..1 volume:',
      ...catalog.map((spec) => `  ${spec.measurementKind}: ${spec.guidance}`),
      'Justify every measurement in measurementRationale.',
    ].join('\n'),
  );
}

function buildRulesPart(candidateKinds: string[], maxCandidates: number): PromptPart {
  return part(
    [
      `Synthesize 2-${maxCandidates} DISTINCT candidates from the repository inventory.`,
      '- coveredSourcePaths must be chosen ONLY from the provided inventory paths, exactly as written.',
      '- Each candidate is a distinct knowledge slice (different kind and coverage), commercially legible to a buyer.',
      `- candidate kind must be one of: ${candidateKinds.join(', ')}.`,
    ].join('\n'),
  );
}

function buildShapePart(catalog: AssetPackMeasurementSpec[], maxCandidates: number): PromptPart {
  return part(
    [
      'Return ONLY a JSON object with this EXACT top-level shape (no markdown, no prose, no other top-level key):',
      `{"options":[{"kind":string,"title":string,"summary":string,"coveredSourcePaths":[string],"measurements":{${catalog
        .map((spec) => `"${spec.measurementKind}":number`)
        .join(',')}},"measurementRationale":string,"confidence":number}]}`,
      `The top-level key MUST be "options" — an array of 2-${maxCandidates} candidate objects. Never return a bare array or any other wrapper key.`,
    ].join('\n'),
  );
}

export interface SynthesisPromptLayer {
  /** setSpecificExecution path under the agent's ExecutionPrompt. */
  path: string;
  part: PromptPart;
}

/**
 * The layered synthesis system prompt, in hierarchical order:
 *   pipeline identity → pipeline source-safety → phase lens-role →
 *   agent measurement-catalog → agent rules → step candidate-shape.
 * Registered on the AgentExecution.prompt via setSpecificExecution and composed
 * upwards by buildHierarchicalPrompt / hierarchicalFormatter. Pure + exported so
 * the registry build-up and formatting correctness are unit-tested (Gate 3
 * chunk F: PromptPart/Prompt sanity-check).
 */
export function buildSynthesisPromptLayers(
  lens: AssetPacksSynthesisLens,
  catalog: AssetPackMeasurementSpec[],
  candidateKinds: string[],
  maxCandidates: number,
): SynthesisPromptLayer[] {
  return [
    { path: 'pipeline:asset-packs-synthesis:identity', part: PIPELINE_IDENTITY },
    { path: 'pipeline:asset-packs-synthesis:source-safety', part: PIPELINE_SOURCE_SAFETY },
    { path: `phase:${lens}:role`, part: LENS_ROLE[lens] },
    { path: 'agent:measure:catalog', part: buildCatalogPart(catalog) },
    { path: 'agent:measure:rules', part: buildRulesPart(candidateKinds, maxCandidates) },
    { path: 'step:candidate:shape', part: buildShapePart(catalog, maxCandidates) },
  ];
}

// ---- Formal source-inventory Tool ------------------------------------------

type InventoryToolArgs = {
  paths: string[];
  samples: AssetPacksSynthesisSourceSample[];
  exclusions: string[];
};

export class AssetPackInventoryTool extends ExecutionTool<
  (args: InventoryToolArgs) => Promise<AssetPacksSynthesisSourceInventory>
> {
  use = async (args: InventoryToolArgs): Promise<AssetPacksSynthesisSourceInventory> => {
    return applyExclusionsToInventory(
      { paths: args.paths, samples: args.samples },
      args.exclusions,
    );
  };
}

// ---- The formal synthesis run ----------------------------------------------

export interface FormalSynthesisRequest {
  lens: AssetPacksSynthesisLens;
  repositoryFullName: string;
  sourceBranch: string | null;
  sourceCommit: string | null;
  steering: AssetPacksSynthesisSteering;
  inventory: AssetPacksSynthesisSourceInventory;
  candidateKinds: string[];
  maxCandidates: number;
}

export interface FormalSynthesisRawOption {
  kind: string;
  title: string;
  summary: string;
  coveredSourcePaths: string[];
  measurements: Record<string, number>;
  measurementRationale: string;
  confidence: number;
}

export interface FormalSynthesisOutcome {
  options: FormalSynthesisRawOption[];
  provider: string | null;
  model: string | null;
  totalTokens: number | null;
}

/**
 * Sum LLM usage across an Execution tree (Map children + array fallbacks).
 * Used by formal synthesis and by the deposit synthesize-options route so
 * nested PTRR/Failsafe generation usage is not missed.
 */
export function sumLlmTokensFromExecutionTree(execution: {
  get?: (namespace: string, key: string) => unknown;
  children?: Map<string, unknown> | unknown[] | { values?: () => IterableIterator<unknown> };
}): number | null {
  let total = 0;
  let seen = false;
  const walk = (node: any) => {
    if (!node) return;
    try {
      const usage = node.get?.('llm', 'usage') as Record<string, number> | undefined;
      if (usage && typeof usage === 'object') {
        const prompt =
          usage.promptTokens ?? usage.prompt_tokens ?? usage.inputTokens ?? usage.input_tokens ?? 0;
        const completion =
          usage.completionTokens ??
          usage.completion_tokens ??
          usage.outputTokens ??
          usage.output_tokens ??
          0;
        const t =
          typeof usage.totalTokens === 'number'
            ? usage.totalTokens
            : typeof usage.total_tokens === 'number'
              ? usage.total_tokens
              : Number(prompt) + Number(completion);
        if (Number.isFinite(t) && t > 0) {
          total += t;
          seen = true;
        }
      }
    } catch {}
    const children = node.children;
    if (!children) return;
    if (typeof children.values === 'function') {
      for (const child of children.values()) walk(child);
      return;
    }
    if (Array.isArray(children)) {
      for (const child of children) walk(child);
    }
  };
  walk(execution);
  return seen ? total : null;
}

/** @deprecated alias — use sumLlmTokensFromExecutionTree */
function sumLlmTokens(execution: Execution): number | null {
  return sumLlmTokensFromExecutionTree(execution);
}

export async function synthesizeAssetPackCandidatesFormal(
  request: FormalSynthesisRequest,
  candidateSetSchema: z.ZodType<{ options: FormalSynthesisRawOption[] }>,
  execution: Execution,
): Promise<FormalSynthesisOutcome> {
  const catalog = measurementCatalogForLens(request.lens);

  // Execution spine: Pipeline → Phase → Agent → Step → Generation (real nodes).
  const pipelineExec = new PipelineExecution(
    'pipeline:asset-packs-synthesis',
    execution,
    {
      pipelineName: 'asset-packs-synthesis',
      family: 'asset_pack',
      posture: 'live',
      admittedSurface: request.lens,
    } as any,
  );
  const phaseExec = pipelineExec.child(`phase:${request.lens}`);

  // A custom orchestration step (register layered prompts + run the formal
  // Failsafe∘Thinkings generation). Typed as a plain Executor; factoryAgent
  // only invokes it as a function, so it is cast to AgentStep at the call site.
  const measureStep = async (
    _input: unknown,
    agentExec: Execution,
  ): Promise<{ options: FormalSynthesisRawOption[] }> => {
    // Formal Tool: produce the exclusion-filtered inventory and track it.
    try {
      (agentExec as any).tools?.registerTool?.('source-inventory', new AssetPackInventoryTool());
    } catch {}
    let inventory = request.inventory;
    try {
      const tool = (agentExec as any).tools?.getTool?.('source-inventory');
      if (tool) {
        inventory = await tool.execute({
          paths: request.inventory.paths,
          samples: request.inventory.samples,
          exclusions: request.steering.forcedExclusions,
        });
      }
    } catch {}

    // Layered system prompt parts on the AgentExecution.prompt — composed
    // upwards by buildHierarchicalPrompt. Built by the pure, tested factory.
    try {
      const p = (agentExec as any).prompt;
      if (p?.setSpecificExecution) {
        for (const layer of buildSynthesisPromptLayers(
          request.lens,
          catalog,
          request.candidateKinds,
          request.maxCandidates,
        )) {
          p.setSpecificExecution(layer.path, layer.part);
        }
      }
    } catch {}

    // The structured context the generation reasons over (becomes the user prompt).
    const generationInput = {
      repository: request.repositoryFullName,
      branch: request.sourceBranch ?? 'unknown',
      commit: request.sourceCommit ?? 'unknown',
      steeringInstructions: request.steering.instructions,
      forcedExclusions: request.steering.forcedExclusions,
      demandContext: request.steering.demandContext,
      inventoryPaths: inventory.paths,
      excerpts: inventory.samples,
    };

    const generated: any = await createFailsafeGenerationSequence<
      typeof generationInput,
      { options: FormalSynthesisRawOption[] }
    >({ outputSchema: candidateSetSchema })(generationInput, agentExec);

    const out = generated?.finalOutput ?? generated?.output ?? generated;
    return (out && Array.isArray(out.options) ? out : { options: [] }) as {
      options: FormalSynthesisRawOption[];
    };
  };

  const agent = factoryAgent<unknown, { options: FormalSynthesisRawOption[] }>({
    name: 'asset-packs-measure',
    description: 'Measure repository source into source-safe AssetPack candidates.',
    steps: [measureStep as unknown as AgentStep<any, any>],
  });

  const parsed = await agent(null, phaseExec);
  const { provider, model } = resolveDefaultLLMConfig();

  return {
    options: Array.isArray((parsed as any)?.options) ? (parsed as any).options : [],
    provider: provider ?? null,
    model: model ?? null,
    totalTokens: sumLlmTokens(pipelineExec),
  };
}
