/**
 * Deposit-mode AssetPack synthesis agent (V48 Gate 3).
 *
 * The deposit lens of the SynthesizeAssetPacks Implementation phase: synthesize
 * reviewable AssetPacks from the DEPOSITOR's repository. Per spec, each AssetPack
 * is a completely synthesized artifact = a MEASURED PATCH (patch + measurements +
 * metadata): the existing measured option fields PLUS a source-safe patch
 * descriptor. The agent reasons over the Discovery comprehension stores (codebase
 * comprehension, depository-fit search, inherent regurgitation) and obfuscation
 * guidance — not raw source. Runs on the formal PTRR machinery
 * (factoryAgentWithPTRR → Plan/Try/Refine/Retry, each a Failsafe × Thinkings
 * generation) so every call renders in the SDIVF telemetry. Each synthesized
 * patch is then recorded through the formal AssetPackPatchWriteTool code-edit
 * primitive (a tracked materialization, not an fs-write).
 *
 * Output is the measured-patch AssetPacks (options[]); the same array is stored as
 * both implementation:assetPacks and implementation:options. The /deposit review
 * surface consumes the measured option fields and ignores the patch field; the
 * surrounding pipeline (Setup clone, Discovery exploration, Validation, Finish
 * upload-for-review) wraps it.
 *
 * Source-safety (hard constraint): NO raw patch code ever reaches telemetry or any
 * store. AssetPacks carry source-safe metadata (knowledge + capability) and a
 * source-safe patch DESCRIPTOR (file paths + change ops + a natural-language
 * patchSummary) — never raw source, code, diffs, or contents. Depositor
 * obfuscations and protected-IP exclusions are honored absolutely.
 */

import { factoryAgentWithPTRR } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import { DEPOSIT_MEASUREMENT_CATALOG } from '../../asset-packs-synthesis';
import { AssetPackPatchWriteTool } from './asset-pack-patch-write-tool';

const part = (content: string): PromptPart => content as PromptPart;

const DEPOSIT_OPTION_KINDS = ['capability-slice', 'implementation-pattern', 'proof-operations-slice'] as const;

// The SOURCE-SAFE patch descriptor: which files the AssetPack creates/modifies as
// code edits (path + change op), plus a source-safe natural-language summary of
// the synthesized knowledge. NEVER raw code, file contents, or diffs.
const patchSchema = z.object({
  fileChanges: z
    .array(
      z.object({
        path: z.string(),
        op: z.enum(['create', 'modify', 'delete']),
      }),
    )
    .min(1),
  patchSummary: z.string(),
});

// Neediness preview signal (v0): the read-demand inputs from which neediness is
// COMPUTED downstream (validateDepositSynthesisOptions). demand = estimated
// reading demand for this pack's knowledge; saturation = how much the Depository
// already supplies it. Source-safe: scalars + a topic-level rationale, never source.
const needinessSignalSchema = z.object({
  demand: z.coerce.number().min(0).max(1),
  saturation: z.coerce.number().min(0).max(1),
  rationale: z.string().min(10).max(400),
});

const candidateSchema = z.object({
  kind: z.string().min(1),
  title: z.string().min(8).max(160),
  summary: z.string().min(40).max(900),
  coveredSourcePaths: z.array(z.string().min(1)).min(1).max(40),
  measurements: z.record(z.string(), z.coerce.number().min(0).max(1)),
  measurementRationale: z.string().min(20).max(700),
  confidence: z.coerce.number().min(0).max(1),
  // Each AssetPack is a MEASURED PATCH: the measured option fields above PLUS the
  // source-safe patch descriptor below (patch + measurements + metadata).
  patch: patchSchema,
  // Deposit neediness preview (v0): the read-demand signal for this pack.
  needinessSignal: needinessSignalSchema.optional(),
});

const candidateSetSchema = z.object({
  options: z.array(candidateSchema).min(1).max(4),
});

export type DepositSynthesisOptions = z.infer<typeof candidateSetSchema>;

const DEPOSIT_IDENTITY = part(
  'You are SynthesizeAssetPacks in DEPOSIT mode. A depositor supplies their ' +
    'repository knowledge as AssetPacks — bounded, source-safe slices the ' +
    'Depository holds as supply, where future readers find Need-fitting packs. ' +
    'Each AssetPack is a completely synthesized artifact = a MEASURED PATCH ' +
    '(patch + measurements + metadata). Synthesize 2-4 DISTINCT, measured ' +
    'AssetPack patches from the explored repository the depositor can review and ' +
    'admit, reasoning over the Discovery comprehension (codebase comprehension, ' +
    'depository-fit search, inherent regurgitation) and obfuscation guidance you ' +
    'are given. Describe knowledge and capability and the SHAPE of the patch — ' +
    'never quote raw source, code, secrets, or file contents. Honor the depositor ' +
    'obfuscations and protected-IP exclusions absolutely.',
);

const DEPOSIT_REQUIREMENTS = part(
  [
    'Ground every candidate in the provided Discovery comprehension — the codebase',
    'comprehension, the depository-fit search, and the inherent regurgitation — and',
    'honor the obfuscation guidance and protected-IP exclusions absolutely.',
    'Each candidate is a distinct, commercially-legible knowledge slice — a MEASURED',
    'PATCH (measured option fields + a source-safe patch descriptor):',
    `- kind: one of ${DEPOSIT_OPTION_KINDS.join(', ')}.`,
    '- title + source-safe summary (knowledge/capability, never raw text).',
    '- coveredSourcePaths: chosen ONLY from the provided inventory paths, exactly as written.',
    '- measurements: an object with EXACTLY these 0..1 keys, each an honest volume:',
    ...DEPOSIT_MEASUREMENT_CATALOG.map((spec) => `    ${spec.measurementKind}: ${spec.guidance}`),
    '- measurementRationale justifying every measurement; confidence 0..1.',
    '- patch: the SOURCE-SAFE patch DESCRIPTOR for this AssetPack — the code edits it',
    '  contributes, derived from your Discovery comprehension:',
    '    - fileChanges: a non-empty list of { path, op } where op is create | modify | delete,',
    '      naming which files the AssetPack creates/modifies/deletes (paths from the inventory,',
    '      honoring obfuscations + exclusions). Provide ONLY path + op — NEVER code, diffs, or contents.',
    '    - patchSummary: a source-safe natural-language summary of the synthesized knowledge the',
    '      patch encodes (what it does and why it is legible to a buyer) — NEVER raw source or code.',
    '- needinessSignal: the read-demand preview for this pack, GROUNDED in the depository-search',
    '  Discovery guidance (likelyReadTopics / demandAlignment / underservedTopics):',
    '    - demand (0..1): how much reading demand this pack’s knowledge would satisfy (higher when it',
    '      matches likelyReadTopics / demandAlignment).',
    '    - saturation (0..1): how much the Depository already supplies this topic (LOWER when the pack',
    '      addresses an underservedTopic — scarce, therefore more needed).',
    '    - rationale: a short source-safe justification. (Neediness is COMPUTED from these downstream.)',
    'Return ONLY {"options":[ ... ]} — the top-level key MUST be "options".',
  ].join('\n'),
);

const DEPOSIT_PLAN = part(
  'Plan: from the explored repository inventory, the Discovery comprehension, and ' +
    'depositor steering, identify the distinct, buyer-legible AssetPack patches the ' +
    'repository supports.',
);
const DEPOSIT_TRY = part(
  'Try: synthesize each candidate as a measured patch — kind, title, source-safe ' +
    'summary, covered source paths, honest measurements, a measurement rationale, ' +
    'and the source-safe patch descriptor (fileChanges path+op + patchSummary).',
);
const DEPOSIT_REFINE = part(
  'Refine: ensure each option is distinct, source-safe, obfuscation- and ' +
    'exclusion-honoring, and legible to a future buyer; verify the patch descriptor ' +
    'names only inventory paths (no code/contents) and measurements are honest 0..1 volumes.',
);
const DEPOSIT_RETRY = part(
  'Retry: complete any missing option as a minimal valid source-safe measured patch ' +
    '(at least one fileChange + a patchSummary) rather than failing the synthesis.',
);

function createDepositSynthesisPrompt(): Prompt {
  const prompt = new Prompt();
  prompt.set('agent:identity', DEPOSIT_IDENTITY);
  prompt.set('agent:requirements', DEPOSIT_REQUIREMENTS);
  prompt.set('ptrr:plan', DEPOSIT_PLAN);
  prompt.set('ptrr:try', DEPOSIT_TRY);
  prompt.set('ptrr:refine', DEPOSIT_REFINE);
  prompt.set('ptrr:retry', DEPOSIT_RETRY);
  prompt.require('agent:identity');
  prompt.require('agent:requirements');
  prompt.requirePattern('ptrr:*');
  return prompt;
}

const depositPrompt = createDepositSynthesisPrompt();

export const DepositAssetPackSynthesisAgent = factoryAgentWithPTRR<any, DepositSynthesisOptions>({
  name: 'DepositAssetPackSynthesisAgent',
  description:
    'Synthesizes reviewable, source-safe, measured AssetPack candidate options from the depositor repository source (deposit lens).',
  outputSchema: candidateSetSchema,
  tools: [],
  prompt: depositPrompt,
  stepPrompts: {
    plan: () => depositPrompt,
    try: () => depositPrompt,
    refine: () => depositPrompt,
    retry: () => depositPrompt,
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

export default async function runDepositAssetPackSynthesisAgent(input: any, execution: any) {
  const repository = input?.repository ?? findValue(execution, 'deposit', 'repository') ?? {};
  const obfuscations = input?.instructions ?? findValue(execution, 'deposit', 'obfuscations') ?? null;
  const protectedIpExclusions =
    input?.protectedIpExclusions ?? findValue(execution, 'deposit', 'protectedIpExclusions') ?? [];
  const inventory = input?.inventory ?? findValue(execution, 'deposit', 'inventory');
  const demandContext = input?.demandContext ?? findValue(execution, 'deposit', 'demandContext') ?? [];

  // Read the Discovery + obfuscation comprehension stores: each AssetPack is a
  // measured PATCH synthesized FROM this comprehension (not from raw source).
  const codebaseComprehension = findValue(execution, 'discovery', 'codebaseComprehension');
  const depositorySearch = findValue(execution, 'discovery', 'depositorySearch');
  const inherentRegurgitation = findValue(execution, 'discovery', 'inherentRegurgitation');
  const obfuscationGuidance =
    input?.obfuscationGuidance ?? findValue(execution, 'setup', 'inputComprehension');

  const raw = await DepositAssetPackSynthesisAgent(
    {
      ...input,
      repository,
      instructions: obfuscations,
      protectedIpExclusions,
      demandContext,
      inventory,
      inventoryPaths: inventory?.paths,
      excerpts: inventory?.samples,
      obfuscationGuidance,
      discovery: {
        context: execution?.get?.('discovery', 'context'),
        plan: execution?.get?.('discovery', 'plan'),
        codebase: codebaseComprehension,
        depository: depositorySearch,
        regurgitation: inherentRegurgitation,
      },
    },
    execution,
  );
  // factoryAgentWithPTRR returns an envelope ({ context, output, finalOutput });
  // unwrap it to the agent's typed structured output (F27) — otherwise the
  // synthesized options are dropped and the route falls back to bounded synthesis.
  const result = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;

  const options = Array.isArray((result as any)?.options) ? (result as any).options : [];

  // Record each AssetPack's patch through the formal code-edit tool. The tool is a
  // tracked materialization: it RECORDS the SOURCE-SAFE descriptor (path + op) and
  // returns it — it does not fs-write (physical workspace materialization is the
  // delivery context). Both the tool args and result are path/op-only, so the
  // tool's telemetry stays source-safe.
  try {
    (execution as any)?.tools?.registerTool?.('asset-pack-patch-write', new AssetPackPatchWriteTool());
  } catch {}
  for (const option of options) {
    const fileChanges = (option as any)?.patch?.fileChanges;
    if (!Array.isArray(fileChanges)) continue;
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

  const output = {
    success: true,
    semanticKind: 'asset-pack-written-asset' as const,
    options,
    summary: `Synthesized ${options.length} measured deposit AssetPack patch(es).`,
    assetPack: { repository },
  };

  try {
    // Full measured-patch AssetPacks (each option = measured fields + source-safe patch).
    execution.store('implementation', 'assetPacks', options);
    // Reviewable options — the SAME array; the route's validateDepositSynthesisOptions
    // reads only the measured fields and ignores the extra patch field.
    execution.store('implementation', 'options', options);
    execution.store('implementation', 'assetPack', output.assetPack);
    execution.store('implementation', 'summary', output.summary);
  } catch {}

  return output;
}
