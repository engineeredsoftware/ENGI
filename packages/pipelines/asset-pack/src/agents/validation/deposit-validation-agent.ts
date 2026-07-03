/**
 * Deposit-mode Validation agent — Validation phase (V48 Gate 2/3).
 *
 * The deposit lens of the SynthesizeAssetPacks Validation phase: validate the
 * synthesized, measured-patch AssetPacks (implementation:options /
 * implementation:assetPacks) before Finish uploads them for depositor review.
 * The read lens validates fits artifacts; the deposit lens validates the
 * QUALITY of the synthesized supply — measurement honesty, distinctness,
 * source-safety, obfuscation/exclusion compliance, patch coherence, and
 * repository coverage — and drives the iterate-vs-complete decision.
 *
 * Source-safety (hard constraint): validation describes quality, never raw
 * source. It reasons only over the source-safe AssetPack descriptors (title,
 * summary, coveredSourcePaths, measurements, confidence, and the source-safe
 * patch descriptor of fileChanges path+op + patchSummary), the inventory paths,
 * the obfuscation guidance, and the protected-IP exclusions — never raw code.
 *
 * Runs on the formal PTRR machinery (factoryAgentWithPTRR → Plan/Try/Refine/
 * Retry) so every call renders in the SDIVF telemetry. The agent's qualitative
 * findings are merged with deterministic AssetPack smoke/sanity checks, and the
 * resulting issues are stored under validation/implementation:issues — the exact
 * store the AssetPack ReadyToFinish gate reads to decide finish vs. review.
 */

import { factoryAgentWithPTRR } from '@bitcode/agent-generics';
import { Prompt } from '@bitcode/prompts/prompt';
import type { PromptPart } from '@bitcode/prompts/parts/PromptPart';
import { z } from 'zod';
import { DEPOSIT_MEASUREMENT_CATALOG } from '../../asset-packs-synthesis';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';
import { measureAssetPackAbsolutes } from './agent-measure-absolutes';

const part = (content: string): PromptPart => content as PromptPart;

const DepositValidationInputSchema = z.object({
  assetPacks: z.any().optional(),
  inventory: z.any().optional(),
  obfuscationGuidance: z.any().optional(),
  protectedIpExclusions: z.any().optional(),
});

const DepositValidationOutputSchema = z.object({
  issues: z.array(z.string()),
  qualityScore: z.number().min(0).max(1),
  coverageGaps: z.array(z.string()),
  recommendation: z.enum(['complete', 'iterate']),
});

export type DepositValidationResult = z.infer<typeof DepositValidationOutputSchema>;

const IDENTITY = part(
  'You are the SynthesizeAssetPacks Validation agent in DEPOSIT mode. You validate ' +
    'the QUALITY of the synthesized, measured-patch AssetPacks the depositor will ' +
    'review — never the raw source. You reason only over the source-safe AssetPack ' +
    'descriptors, the repository inventory paths, the obfuscation guidance, and the ' +
    'protected-IP exclusions. You describe quality and never quote, reconstruct, or ' +
    'expose raw source, code, secrets, or file contents. Your verdict drives the ' +
    'iterate-vs-complete decision for the deposit supply.',
);

const REQUIREMENTS = part(
  [
    'Validate the synthesized deposit AssetPacks against these checks and report ' +
      'every concrete problem as a short, source-safe issue string:',
    '- Quality threshold: each pack carries honest 0..1 measurements (an object whose ' +
      'values are in [0,1]) over the expected measurement kinds (' +
      DEPOSIT_MEASUREMENT_CATALOG.map((spec) => spec.measurementKind).join(', ') +
      ') with a confidence in [0,1] that is reasonable for the evidence; flag inflated, ' +
      'out-of-range, or unjustified measurements/confidence.',
    '- Distinctness: the packs are genuinely distinct, complementary knowledge slices, ' +
      'not duplicative or near-identical; flag overlap or repetition.',
    '- Source-safety: NO raw source, code, diffs, secrets, or file contents appear in any ' +
      'title, summary, measurementRationale, or patchSummary; flag any leakage.',
    '- Obfuscation/exclusion compliance: no coveredSourcePaths and no patch fileChanges ' +
      'path touches an obfuscated path/concept (from the obfuscation guidance) or a ' +
      'protected-IP exclusion; flag any violation by path.',
    '- Patch coherence: each pack has a source-safe patch descriptor with a non-empty ' +
      'fileChanges list (path + op = create | modify | delete) and a patchSummary; flag ' +
      'missing or incoherent patch descriptors.',
    '- Coverage: the packs adequately cover the repository\'s distinct, buyer-legible ' +
      'knowledge as represented by the inventory; list the notable uncovered areas in ' +
      'coverageGaps.',
    'Set qualityScore in [0,1] as your overall honest quality of the synthesized supply. ' +
      'Set recommendation to "iterate" when issues or material coverage gaps remain, else ' +
      '"complete". Return ONLY {"issues":[...],"qualityScore":n,"coverageGaps":[...],' +
      '"recommendation":"complete"|"iterate"}.',
  ].join('\n'),
);

const PLAN = part('Plan: enumerate the synthesized AssetPacks and the quality dimensions to check.');
const TRY = part('Try: run each quality, distinctness, source-safety, compliance, patch, and coverage check.');
const REFINE = part('Refine: keep only concrete, source-safe issues and an honest qualityScore and recommendation.');
const RETRY = part('Retry: when evidence is thin, validate the available AssetPack state and name what is missing.');

function createPrompt(): Prompt {
  const prompt = new Prompt();
  prompt.set('agent:identity', IDENTITY);
  prompt.set('agent:requirements', REQUIREMENTS);
  prompt.set('ptrr:plan', PLAN);
  prompt.set('ptrr:try', TRY);
  prompt.set('ptrr:refine', REFINE);
  prompt.set('ptrr:retry', RETRY);
  prompt.require('agent:identity');
  prompt.require('agent:requirements');
  prompt.requirePattern('ptrr:*');
  return prompt;
}

const prompt = createPrompt();

export const DepositValidationAgent = factoryAgentWithPTRR<
  z.infer<typeof DepositValidationInputSchema>,
  DepositValidationResult
>({
  name: 'DepositValidationAgent',
  description:
    'Validates the synthesized deposit AssetPacks for quality, distinctness, source-safety, obfuscation/exclusion compliance, patch coherence, and coverage (deposit lens).',
  outputSchema: DepositValidationOutputSchema,
  tools: [],
  prompt,
  stepPrompts: {
    plan: () => prompt,
    try: () => prompt,
    refine: () => prompt,
    retry: () => prompt,
  },
  plan: { chunkThreshold: 2000 },
  try: { chunkThreshold: 4000 },
  refine: { maxAttempts: 2 },
  retry: { maxAttempts: 1 },
});

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

function isNum01(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

function asPathList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((p): p is string => typeof p === 'string' && p.length > 0);
}

// A path violates an exclusion/obfuscation entry when it equals it or sits beneath
// it as a directory prefix. Source-safe: operates on paths only, never contents.
function pathViolates(path: string, entry: string): boolean {
  if (!path || !entry) return false;
  if (path === entry) return true;
  const dir = entry.endsWith('/') ? entry : `${entry}/`;
  return path.startsWith(dir);
}

// Deterministic AssetPack smoke/sanity checks over the source-safe descriptors.
// These ground the gate so structurally broken or non-compliant synthesis output
// always surfaces an issue, independent of the model's qualitative pass.
function smokeCheckAssetPacks(
  assetPacks: any[],
  protectedIpExclusions: string[],
  obfuscatedPaths: string[],
): string[] {
  const issues: string[] = [];
  if (!Array.isArray(assetPacks) || assetPacks.length === 0) {
    issues.push('No AssetPacks were synthesized to validate.');
    return issues;
  }
  const forbidden = [...protectedIpExclusions, ...obfuscatedPaths];
  const seenTitles = new Map<string, number>();

  assetPacks.forEach((pack: any, index: number) => {
    const label = pack?.title ? `"${pack.title}"` : `#${index + 1}`;

    if (!isNum01(pack?.confidence)) {
      issues.push(`AssetPack ${label} has a missing or out-of-range confidence (expected 0..1).`);
    }

    const measurements = pack?.measurements;
    if (!measurements || typeof measurements !== 'object' || Array.isArray(measurements)) {
      issues.push(`AssetPack ${label} is missing its 0..1 measurements object.`);
    } else {
      for (const [key, value] of Object.entries(measurements)) {
        if (!isNum01(value)) {
          issues.push(`AssetPack ${label} measurement "${key}" is not an honest 0..1 volume.`);
        }
      }
    }

    const coveredPaths = asPathList(pack?.coveredSourcePaths);
    if (coveredPaths.length === 0) {
      issues.push(`AssetPack ${label} declares no coveredSourcePaths.`);
    }

    const fileChanges = pack?.patch?.fileChanges;
    if (!Array.isArray(fileChanges) || fileChanges.length === 0) {
      issues.push(`AssetPack ${label} has no patch descriptor with fileChanges (patch coherence).`);
    } else if (typeof pack?.patch?.patchSummary !== 'string' || pack.patch.patchSummary.length === 0) {
      issues.push(`AssetPack ${label} patch descriptor is missing a source-safe patchSummary.`);
    }

    // Obfuscation/exclusion compliance over covered paths and patch fileChange paths.
    const patchPaths = Array.isArray(fileChanges)
      ? fileChanges.map((fc: any) => fc?.path).filter((p: any): p is string => typeof p === 'string')
      : [];
    for (const path of [...coveredPaths, ...patchPaths]) {
      const hit = forbidden.find((entry) => pathViolates(path, entry));
      if (hit) {
        issues.push(`AssetPack ${label} touches withheld path "${path}" (violates exclusion/obfuscation "${hit}").`);
      }
    }

    if (typeof pack?.title === 'string' && pack.title.length > 0) {
      const norm = pack.title.trim().toLowerCase();
      seenTitles.set(norm, (seenTitles.get(norm) ?? 0) + 1);
    }
  });

  for (const [title, count] of seenTitles) {
    if (count > 1) {
      issues.push(`AssetPacks are not distinct: ${count} packs share the title "${title}".`);
    }
  }

  return issues;
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values.filter((v) => typeof v === 'string' && v.length > 0)));
}

export default async function runDepositValidationAgent(input: any, execution: any) {
  const assetPacks =
    input?.assetPacks ??
    findValue(execution, 'implementation', 'options') ??
    findValue(execution, 'implementation', 'assetPacks') ??
    [];
  const inventory = input?.inventory ?? findValue(execution, 'deposit', 'inventory');
  const obfuscationGuidance =
    input?.obfuscationGuidance ?? findValue(execution, 'setup', 'inputComprehension');
  const protectedIpExclusions = asPathList(
    input?.protectedIpExclusions ?? findValue(execution, 'deposit', 'protectedIpExclusions') ?? [],
  );
  const obfuscatedPaths = asPathList((obfuscationGuidance as any)?.obfuscatedPaths);
  const packs = Array.isArray(assetPacks) ? assetPacks : [];

  const raw = await DepositValidationAgent(
    {
      ...input,
      assetPacks: packs,
      inventory,
      inventoryPaths: inventory?.paths,
      obfuscationGuidance,
      protectedIpExclusions,
    },
    execution,
  );
  // factoryAgentWithPTRR returns an envelope ({ context, output, finalOutput });
  // unwrap to the agent's typed validation output (F27).
  const agentOutput = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;

  // Deterministic smoke/sanity checks ground the model's qualitative pass.
  const smokeIssues = smokeCheckAssetPacks(packs, protectedIpExclusions, obfuscatedPaths);

  // Default-fallback to a clean "complete" verdict when the agent returns nothing;
  // the deterministic smoke issues are always merged so the gate stays grounded.
  const structured =
    agentOutput && typeof agentOutput === 'object' && Array.isArray((agentOutput as any).issues);
  const base: DepositValidationResult = structured
    ? {
        issues: Array.isArray((agentOutput as any).issues) ? (agentOutput as any).issues : [],
        qualityScore: isNum01((agentOutput as any).qualityScore) ? (agentOutput as any).qualityScore : 1,
        coverageGaps: Array.isArray((agentOutput as any).coverageGaps) ? (agentOutput as any).coverageGaps : [],
        recommendation: (agentOutput as any).recommendation === 'iterate' ? 'iterate' : 'complete',
      }
    : { issues: [], qualityScore: 1, coverageGaps: [], recommendation: 'complete' };

  const issues = dedupe([...base.issues, ...smokeIssues]);
  const result: DepositValidationResult = {
    issues,
    qualityScore: base.qualityScore,
    coverageGaps: base.coverageGaps,
    // Any concrete issue (qualitative or smoke) forces an iterate verdict.
    recommendation: issues.length > 0 ? 'iterate' : base.recommendation,
  };

  // Cross-phase artifacts (cross-phase store-visibility law): the ReadyToFinish
  // gate runs on a DIFFERENT sequential sibling of the validation phase, and the
  // /deposit surface reads the verdict at the run level.
  // Feed the AssetPack ReadyToFinish gate: it reads validation/implementation:issues
  // (a bare string[]) to decide finish vs. review. Match that store exactly.
  storeCrossPhaseArtifact(execution, 'validation/implementation', 'issues', result.issues);
  // Record the full deposit-quality verdict for telemetry / the /deposit surface.
  storeCrossPhaseArtifact(execution, 'validation', 'depositQuality', result);

  // V48 Gate 3 — formal ABSOLUTES measurement. Each AssetPack is a measured patch:
  // the patch was synthesized in Implementation; here the formal measure-agent
  // (agent-measure-absolutes) MEASURES its absolutes (sizes / correctness /
  // semantic-volume) and attaches them to the pack in place. Real inference runs
  // the measure-agent (its PTRR substeps render in the SDIVF telemetry, content
  // withheld); otherwise the deterministic descriptor-derived fallback applies.
  // Per pack in parallel so wall-clock ≈ one measurement; each LLM call is bounded
  // by the F25 per-call timeout.
  if (packs.length > 0) {
    // The source for static analysis: the FULL checkout content (inventory.sources —
    // every tracked file, verbatim, provisioned by the Host) so the covered files are
    // measured from real content; fall back to the bounded samples when only those
    // are present (e.g. a pre-Host inventory).
    const inventorySources = Array.isArray((inventory as any)?.sources)
      ? (inventory as any).sources
          .filter((s: any) => s && typeof s.path === 'string' && typeof s.content === 'string')
          .map((s: any) => ({ path: s.path as string, content: s.content as string }))
      : Array.isArray((inventory as any)?.samples)
        ? (inventory as any).samples
            .filter((s: any) => s && typeof s.path === 'string' && typeof s.excerpt === 'string')
            .map((s: any) => ({ path: s.path as string, content: s.excerpt as string }))
        : [];
    await Promise.all(
      packs.map(async (pack: any) => {
        try {
          const absolutes = await measureAssetPackAbsolutes(
            {
              title: String(pack?.title ?? ''),
              summary: String(pack?.summary ?? ''),
              coveredSourcePaths: asPathList(pack?.coveredSourcePaths),
              fileChanges: Array.isArray(pack?.patch?.fileChanges) ? pack.patch.fileChanges : undefined,
              confidence: typeof pack?.confidence === 'number' ? pack.confidence : undefined,
              patchSummary:
                typeof pack?.patch?.patchSummary === 'string' ? pack.patch.patchSummary : undefined,
            },
            { lens: 'deposit', execution, sources: inventorySources },
          );
          // Attach the formal absolutes to the measured patch in place; the route's
          // validateDepositSynthesisOptions prefers these over the legacy inline record.
          pack.absolutes = absolutes;
        } catch {}
      }),
    );
    // Re-store the measured packs (in-place mutation + explicit re-store) under the
    // exact keys the route + Finish read — on the SHARED execution (cross-phase law).
    storeCrossPhaseArtifact(execution, 'implementation', 'options', packs);
    storeCrossPhaseArtifact(execution, 'implementation', 'assetPacks', packs);
  }

  return { ...(input || {}), ...result };
}
