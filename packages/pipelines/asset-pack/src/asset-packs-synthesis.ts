import { z } from 'zod';

import { Execution } from '@bitcode/execution-generics/Execution';
import type { MeasurementSpec } from '@bitcode/agent-generics';

import {
  synthesizeAssetPackCandidatesFormal,
  sumLlmTokensFromExecutionTree,
  type FormalSynthesisRawOption,
} from './asset-packs-synthesis-pipeline';
import { isAssetPackRealInferenceEnabled } from './runtime-inference-policy';

export { sumLlmTokensFromExecutionTree };

/**
 * AssetPacksSynthesis — the single Bitcode synthesis/measurement pipeline
 * (V48 architecture law, QA ledger F12).
 *
 * Depositing and Reading are the same operation at the core: measuring
 * source knowledge into commercially legible AssetPack candidates. The
 * variance between them is carried entirely by the lens:
 *   - steering (depositor instructions vs. read Need),
 *   - the available measurement catalog (deposit: source-coverage /
 *     demand-alignment / reuse-likelihood; read adds need-fit and friends),
 *   - candidate framing (deposit options vs. need-fitting packs).
 *
 * Measurement is the heart of Bitcode's commodification capability, so this
 * module is the one place measurement synthesis happens. Lens adapters
 * (deposit-option-real-synthesis.ts today; the reading lens when Track 3
 * migrates) translate lens-specific contracts to and from this core.
 *
 * The measurement itself runs on the real Bitcode execution/agent/prompt
 * primitives (asset-packs-synthesis-pipeline.ts): PipelineExecution → phase →
 * factoryAgent → createFailsafeGenerationSequence (Failsafe ∘ Thinkings). This
 * module owns the lens contract, the candidate schema, and the fail-closed
 * validation; the pipeline module owns the formal inference.
 *
 * Protected-IP exclusions are honored fail-closed at BOTH ends: excluded
 * paths are removed from the inventory before any prompt is built, and any
 * candidate whose covered paths violate the exclusions (or reference paths
 * outside the real inventory) is dropped after inference.
 */

export type AssetPacksSynthesisLens = 'deposit' | 'read';

export interface AssetPackMeasurementSpec {
  measurementKind: string;
  label: string;
  weight: number;
  guidance: string;
}

export const DEPOSIT_MEASUREMENT_CATALOG: AssetPackMeasurementSpec[] = [
  {
    measurementKind: 'source-coverage',
    label: 'Source coverage',
    weight: 0.36,
    guidance: 'How much of the meaningful source knowledge in the inventory this candidate covers.',
  },
  {
    measurementKind: 'demand-alignment',
    label: 'Demand alignment',
    weight: 0.4,
    guidance: 'Alignment with the demand context and depositor steering.',
  },
  {
    measurementKind: 'reuse-likelihood',
    label: 'Reuse likelihood',
    weight: 0.24,
    guidance: 'How reusable the covered knowledge is outside this repository.',
  },
];

// The reading lens extends the deposit catalog with Need-relative
// measurements; finalized when Track 3 migrates reading onto this core.
export const READ_MEASUREMENT_CATALOG: AssetPackMeasurementSpec[] = [
  {
    measurementKind: 'need-fit',
    label: 'Need fit',
    weight: 0.44,
    guidance: 'How directly the covered knowledge satisfies the reviewed read Need.',
  },
  {
    measurementKind: 'source-coverage',
    label: 'Source coverage',
    weight: 0.28,
    guidance: 'How much of the Need-relevant source knowledge this candidate covers.',
  },
  {
    measurementKind: 'reuse-likelihood',
    label: 'Reuse likelihood',
    weight: 0.28,
    guidance: 'How reusable the covered knowledge is in the buyer context beyond the immediate Need.',
  },
];

export function measurementCatalogForLens(lens: AssetPacksSynthesisLens): AssetPackMeasurementSpec[] {
  return lens === 'read' ? READ_MEASUREMENT_CATALOG : DEPOSIT_MEASUREMENT_CATALOG;
}

/**
 * The ABSOLUTES catalog (V48 Gate 3 — formalized non-needinesses).
 *
 * Bitcode law: **data is digital material; material that has properties.**
 *
 * Absolute measurements are INTRINSIC properties of that material (the synthesized
 * AssetPack patch), independent of any reader/Need/market:
 *
 *   - **Quantity properties** — size, symbolic richness, modularity, … (often
 *     count magnitudes from Tools such as SourceStaticAnalysisTool)
 *   - **Quality properties** — objectives fidelity, correctness, computational
 *     usage requirements, … (judgment readings from the measure-agent, grounded
 *     in tool-measured quantities + Discovery comprehension)
 *
 * Measured by agent-measure-absolutes (factoryMeasureAgentAbsolutes + static-
 * analysis Tool). Weights sum to 1. Lens-shared in Gate 3; Gate 4 finalizes read.
 */
export type AbsolutePropertyClass = 'quantity' | 'quality';

export interface AssetPackAbsoluteSpec extends MeasurementSpec {
  /** Weight in the absolute weighted composite (Σ = 1). */
  weight: number;
  /** Quantity (how much / how large) vs quality (how good / how fit-for-purpose). */
  propertyClass: AbsolutePropertyClass;
}

export const ASSET_PACK_ABSOLUTES_CATALOG: AssetPackAbsoluteSpec[] = [
  // —— Quantity properties (Tool-authoritative sizes / structure) ——
  {
    measurementKind: 'function-count',
    label: 'Functions',
    unit: 'functions',
    hasMagnitude: true,
    weight: 0.12,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · size: how many distinct functions/behaviors the synthesized patch encodes. magnitude = the count (static analysis).',
  },
  {
    measurementKind: 'type-count',
    label: 'Types',
    unit: 'types',
    hasMagnitude: true,
    weight: 0.1,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · size: how many distinct types/interfaces/schemas the patch defines. magnitude = the count (static analysis).',
  },
  {
    measurementKind: 'file-span',
    label: 'File span',
    unit: 'files',
    hasMagnitude: true,
    weight: 0.08,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · size: how many files the patch creates/modifies (patch descriptor). magnitude = the count.',
  },
  {
    measurementKind: 'symbolic-richness',
    label: 'Symbolic richness',
    unit: 'symbols',
    hasMagnitude: true,
    weight: 0.12,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · symbolic richness: how dense the material is in distinct symbols/identifiers (static analysis). magnitude = unique symbol count; volume normalizes richness per file.',
  },
  {
    measurementKind: 'modularity',
    label: 'Modularity',
    unit: 'modules',
    hasMagnitude: true,
    weight: 0.08,
    propertyClass: 'quantity',
    guidance:
      'QUANTITY · modularity: how modular the material is (distinct path modules / top-level packages touched). magnitude = module count; volume rewards multi-module structure without sprawl.',
  },
  // —— Quality properties (measure-agent judgment, grounded in quantities) ——
  {
    measurementKind: 'correctness-estimate',
    label: 'Correctness',
    unit: 'estimate',
    weight: 0.18,
    propertyClass: 'quality',
    guidance:
      'QUALITY · correctness: 0..1 fidelity and internal coherence of the synthesized knowledge — faithful to Discovery comprehension and buildable as described.',
  },
  {
    measurementKind: 'objectives-fidelity',
    label: 'Objectives fidelity',
    unit: 'estimate',
    weight: 0.16,
    propertyClass: 'quality',
    guidance:
      'QUALITY · objectives: 0..1 how well the pack serves the deposit/read objectives (obfuscation guidance, demand context, Discovery intent) without leaking withheld material.',
  },
  {
    measurementKind: 'computational-usage',
    label: 'Computational usage',
    unit: 'estimate',
    weight: 0.16,
    propertyClass: 'quality',
    guidance:
      'QUALITY · computational-usage requirements: 0..1 estimated computational demand of the material (complexity of the knowledge surface: denser/richer packs score higher usage requirements).',
  },
];

export const ASSET_PACK_ABSOLUTE_KINDS: string[] = ASSET_PACK_ABSOLUTES_CATALOG.map(
  (spec) => spec.measurementKind,
);

/**
 * Deposit neediness — the read-demand PREVIEW. NOT a member of
 * DEPOSIT_MEASUREMENT_CATALOG (it is not part of the absolute weighted composite);
 * it is a separate, forward-looking estimate previewed beside the absolutes.
 */
export const DEPOSIT_NEEDINESS_MEASUREMENT = {
  measurementKind: 'neediness',
  label: 'Neediness (est. read demand)',
  guidance:
    'Estimated reading demand the AssetPack would satisfy — the deposit-side preview of read Need-fit and earning potential. Computed from the depository-search demand signal and the supply scarcity it addresses.',
} as const;

/**
 * Compute neediness (v0): demand gates, scarcity boosts. A demanded, underserved
 * pack scores highest; a saturated or undemanded pack scores low.
 *   neediness = clamp01(demand × (0.5 + 0.5·(1 − saturation)))
 */
export function computeNeediness(demand: number, saturation: number): number {
  const d = clampVolume(Number.isFinite(demand) ? demand : 0);
  const s = clampVolume(Number.isFinite(saturation) ? saturation : 0);
  return clampVolume(d * (0.5 + 0.5 * (1 - s)));
}

/** Build the neediness preview from a raw per-pack signal (deposit lens). */
export function buildNeedinessFromSignal(signal: {
  demand?: unknown;
  saturation?: unknown;
  rationale?: unknown;
} | null | undefined): AssetPackNeediness | undefined {
  if (!signal || typeof signal !== 'object') return undefined;
  const demand = clampVolume(Number.isFinite(Number((signal as any).demand)) ? Number((signal as any).demand) : 0);
  const saturation = clampVolume(Number.isFinite(Number((signal as any).saturation)) ? Number((signal as any).saturation) : 0);
  return {
    volume: computeNeediness(demand, saturation),
    demand,
    saturation,
    rationale: String((signal as any).rationale ?? '').trim(),
  };
}

export interface AssetPacksSynthesisSourceSample {
  path: string;
  excerpt: string;
}

/** A full-content source file from the host checkout (every blob, verbatim). */
export interface AssetPacksSynthesisSourceFile {
  path: string;
  content: string;
}

export interface AssetPacksSynthesisSourceInventory {
  paths: string[];
  samples: AssetPacksSynthesisSourceSample[];
  /**
   * The FULL verbatim source of the host checkout (V48 Gate 3) — every tracked
   * file's content, provisioned by the primitive Host. Feeds measurement (the
   * static-analysis tool reads real full content); the bounded `samples` feed
   * prompts. Optional for back-compat (absent when only samples were available).
   */
  sources?: AssetPacksSynthesisSourceFile[];
  totalPathCount: number;
  excludedPathCount: number;
}

export interface AssetPacksSynthesisSteering {
  instructions: string | null;
  forcedExclusions: string[];
  demandContext: string[];
}

export interface AssetPacksSynthesisRequest {
  lens: AssetPacksSynthesisLens;
  repositoryFullName: string;
  sourceBranch: string | null;
  sourceCommit: string | null;
  steering: AssetPacksSynthesisSteering;
  inventory: AssetPacksSynthesisSourceInventory;
  candidateKinds: string[];
  maxCandidates?: number;
  /**
   * Optional execution-generics Execution node. When provided (the deposit
   * route passes a streaming Execution), the formal AssetPacksSynthesis
   * pipeline runs as REAL nested child nodes under it (Pipeline → Phase →
   * Agent → Step → Failsafe → Thinkings) and source-safe telemetry streams
   * live. Prompt and response CONTENT is withheld universally by the streaming
   * layer (sourceSafeStreamEvent), keeping rawPromptVisible /
   * rawProviderResponseVisible false by law. When absent, a detached root
   * Execution is created so synthesis still runs (without streaming).
   */
  execution?: Execution | null;
}

export interface AssetPackCandidateMeasurement {
  measurementKind: string;
  label: string;
  weight: number;
  /** Normalized 0..1 — the value the weighted composite uses. */
  volume: number;
  /**
   * Which measurement CATEGORY this reading belongs to. Absolutes are intrinsic
   * (sizes/correctness/volume) and form the weighted composite; needinesses are
   * reader-relative previews and are NEVER in the absolute composite. Optional
   * for back-compat with the legacy placeholder catalog (treated as 'absolute').
   */
  category?: 'absolute' | 'neediness';
  /** Raw count/quantity for size measurements (functions/types/files). */
  magnitude?: number;
  /** The reading's unit: functions | types | files | estimate | normalized. */
  unit?: string;
}

/**
 * Neediness — the deposit-lens PREVIEW of read Need-fit (v0). A 0..1 estimate of
 * the reading demand the pack would satisfy, derived from the depository-search
 * `demand` signal and the supply `saturation` it would address. SEPARATE from the
 * absolute deposit composite (it estimates a different, read, lens). Source-safe:
 * scalars + topic-level rationale only.
 */
export interface AssetPackNeediness {
  /** Computed 0..1 = demand × (0.5 + 0.5·(1−saturation)). */
  volume: number;
  /** 0..1 estimated reading demand for the pack's knowledge. */
  demand: number;
  /** 0..1 how much the Depository already supplies the topic. */
  saturation: number;
  /** Source-safe rationale for the demand/saturation estimate. */
  rationale: string;
}

/**
 * The source-safe patch descriptor — the synthesized AssetPack CONTENTS the
 * depositor reviews: which files the AP creates/modifies (path + op) and a
 * natural-language summary of the knowledge it encodes. NEVER raw source/code.
 */
export interface AssetPackPatchDescriptor {
  fileChanges: Array<{ path: string; op: string }>;
  patchSummary: string;
}

export interface AssetPackCandidate {
  kind: string;
  title: string;
  summary: string;
  coveredSourcePaths: string[];
  measurements: AssetPackCandidateMeasurement[];
  measurementRationale: string;
  confidence: number;
  /** The synthesized AP contents (source-safe patch descriptor) for the deposit decision. */
  patch?: AssetPackPatchDescriptor;
  /** Deposit lens only: the read-demand preview (v0). Absent on read candidates. */
  neediness?: AssetPackNeediness;
}

export interface AssetPacksSynthesisInferenceAccounting {
  provider: string | null;
  model: string | null;
  totalTokens: number | null;
  durationMs: number | null;
}

export interface AssetPacksSynthesisResult {
  lens: AssetPacksSynthesisLens;
  candidates: AssetPackCandidate[];
  droppedCandidateCount: number;
  exclusionViolations: string[];
  inference: AssetPacksSynthesisInferenceAccounting;
}

export function normalizeForcedPathList(value: string[] | string | null | undefined): string[] {
  const entries = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/\r?\n/) : [];
  return [...new Set(entries.map((entry) => entry.trim()).filter(Boolean))].sort();
}

export function isPathExcluded(path: string, exclusions: string[]): boolean {
  const normalizedPath = path.trim().toLowerCase();
  return exclusions.some((exclusion) => {
    const normalized = exclusion.trim().toLowerCase().replace(/^\.\//, '');
    if (!normalized) return false;
    const withoutGlob = normalized.replace(/\*+/g, '');
    if (!withoutGlob) return false;
    return normalizedPath.includes(withoutGlob);
  });
}

/**
 * Forced Inclusion (forcedInclusions): when non-empty, a path is in-scope only if
 * it equals or sits under one of the inclusion roots (prefix match). Empty
 * inclusions mean the full inventory remains in-scope (minus exclusions).
 */
export function isPathForcedIncluded(path: string, inclusions: string[]): boolean {
  if (!Array.isArray(inclusions) || inclusions.length === 0) return true;
  const normalizedPath = path.trim().replace(/^\.\//, '').toLowerCase();
  if (!normalizedPath) return false;
  return inclusions.some((inclusion) => {
    const normalized = inclusion
      .trim()
      .replace(/^\.\//, '')
      .toLowerCase()
      .replace(/\*+/g, '');
    if (!normalized) return false;
    const root = normalized.replace(/\/+$/, '');
    if (!root) return false;
    return normalizedPath === root || normalizedPath.startsWith(`${root}/`);
  });
}

export function applyExclusionsToInventory(
  inventory: {
    paths: string[];
    samples: AssetPacksSynthesisSourceSample[];
    sources?: AssetPacksSynthesisSourceFile[];
  },
  exclusions: string[],
): AssetPacksSynthesisSourceInventory {
  return applyInventoryScope(inventory, { exclusions });
}

/**
 * Prompt-safe inventory projection: paths + samples only. Never includes
 * `sources` (full verbatim checkout) — those are for measurement tools only.
 * Deposit agents must pass this into PTRR so PrepareConciseContext / reason /
 * judge / structured_output never JSON.stringify multi-hundred-MB sources.
 */
export function projectInventoryForPrompt(
  inventory: AssetPacksSynthesisSourceInventory | null | undefined,
): {
  paths: string[];
  pathCount: number;
  samples: AssetPacksSynthesisSourceSample[];
  totalPathCount: number;
  excludedPathCount: number;
  sourceFileCount: number;
} | null {
  if (!inventory || typeof inventory !== 'object') return null;
  const paths = Array.isArray(inventory.paths) ? inventory.paths : [];
  const samples = Array.isArray(inventory.samples) ? inventory.samples : [];
  const sources = Array.isArray(inventory.sources) ? inventory.sources : [];
  return {
    paths,
    pathCount: paths.length,
    samples,
    totalPathCount: inventory.totalPathCount ?? paths.length,
    excludedPathCount: inventory.excludedPathCount ?? 0,
    sourceFileCount: sources.length,
  };
}

/** Re-derive bounded prompt excerpts from in-scope sources after scoping. */
export function pickInventorySamples(
  sources: AssetPacksSynthesisSourceFile[],
  maxFiles = 24,
  maxChars = 4000,
): AssetPacksSynthesisSourceSample[] {
  if (!Array.isArray(sources) || sources.length === 0) return [];
  const byPath = new Map(sources.map((file) => [file.path, file.content]));
  const allPaths = sources.map((file) => file.path);
  const priority = [
    /^readme/i,
    /^package\.json$/i,
    /^pyproject\.toml$/i,
    /^cargo\.toml$/i,
    /^go\.mod$/i,
    /^setup\.(py|cfg)$/i,
    /^requirements.*\.txt$/i,
  ];
  const prioritized = allPaths.filter((path) =>
    priority.some((pattern) => pattern.test(path.split('/').pop() || '')),
  );
  const sourceLike = allPaths.filter(
    (path) =>
      !prioritized.includes(path) &&
      /\.(ts|tsx|js|jsx|py|rs|go|rb|java|cs|swift|sol|md)$/i.test(path) &&
      path.split('/').length <= 4,
  );
  return [...prioritized, ...sourceLike]
    .slice(0, maxFiles)
    .map((path) => ({ path, excerpt: (byPath.get(path) || '').slice(0, maxChars) }));
}

export function applyInventoryScope(
  inventory: {
    paths: string[];
    samples: AssetPacksSynthesisSourceSample[];
    sources?: AssetPacksSynthesisSourceFile[];
  },
  scope: {
    inclusions?: string[] | null;
    exclusions?: string[] | null;
  } = {},
): AssetPacksSynthesisSourceInventory {
  const inclusions = normalizeForcedPathList(scope.inclusions ?? []);
  const exclusions = normalizeForcedPathList(scope.exclusions ?? []);
  const inScope = (path: string) =>
    isPathForcedIncluded(path, inclusions) && !isPathExcluded(path, exclusions);
  const keptPaths = inventory.paths.filter(inScope);
  let keptSamples = inventory.samples.filter((sample) => inScope(sample.path));
  // Protected-IP exclusions + Forced Inclusion bounds are honored on the FULL
  // source too (fail-closed): out-of-scope files are never measured, sampled,
  // or otherwise carried forward.
  const keptSources = Array.isArray(inventory.sources)
    ? inventory.sources.filter((file) => inScope(file.path))
    : undefined;
  // After Forced Inclusion, pre-scope samples often drop to zero (they were
  // picked from monorepo manifests outside the inclusion roots). Re-sample
  // from the kept sources so deposit agents always get prompt excerpts.
  if (keptSources && keptSources.length > 0 && keptSamples.length === 0) {
    keptSamples = pickInventorySamples(keptSources);
  }
  return {
    ...(keptSources ? { sources: keptSources } : {}),
    paths: keptPaths,
    samples: keptSamples,
    totalPathCount: inventory.paths.length,
    excludedPathCount: inventory.paths.length - keptPaths.length,
  };
}

function clampVolume(value: number) {
  return Number(Math.max(0, Math.min(1, value)).toFixed(2));
}

/**
 * Defense-in-depth source-safety assertion (Garrett's "keep local assert"):
 * the universal streaming filter (sourceSafeStreamEvent) withholds raw
 * prompt/response content from telemetry, and this local check guarantees the
 * returned candidates themselves carry no verbatim source. A candidate is
 * commercially legible metadata, never raw text — if any non-trivial source
 * line (>= 40 chars) from the excerpts appears verbatim in a candidate's
 * prose, source leaked and synthesis fails closed.
 */
function assertSourceSafeCandidates(
  candidates: AssetPackCandidate[],
  inventory: AssetPacksSynthesisSourceInventory,
): void {
  const needles = [
    ...new Set(
      inventory.samples
        .flatMap((sample) => sample.excerpt.split(/\r?\n/))
        .map((line) => line.trim())
        .filter((line) => line.length >= 40),
    ),
  ];
  if (needles.length === 0) return;
  for (const candidate of candidates) {
    const haystack = `${candidate.title}\n${candidate.summary}\n${candidate.measurementRationale}`;
    for (const needle of needles) {
      if (haystack.includes(needle)) {
        throw new Error(
          `AssetPacksSynthesis source-safety assertion failed: candidate "${candidate.title}" leaked raw source.`,
        );
      }
    }
  }
}

export async function synthesizeAssetPackCandidates(
  request: AssetPacksSynthesisRequest,
): Promise<AssetPacksSynthesisResult> {
  if (!isAssetPackRealInferenceEnabled()) {
    throw new Error(
      'AssetPacksSynthesis requires BITCODE_ASSET_PACK_REAL_INFERENCE so candidates carry real measurements.',
    );
  }
  if (request.inventory.paths.length === 0) {
    throw new Error('Repository inventory is empty after protected-IP exclusions; nothing to synthesize.');
  }

  const catalog = measurementCatalogForLens(request.lens);
  const maxCandidates = Math.max(1, Math.min(4, request.maxCandidates ?? 4));
  const startedAt = Date.now();

  const candidateSchema = z.object({
    kind: z.string().min(1),
    title: z.string().min(8).max(160),
    summary: z.string().min(40).max(900),
    coveredSourcePaths: z.array(z.string().min(1)).min(1).max(40),
    measurements: z.record(z.string(), z.coerce.number().min(0).max(1)),
    measurementRationale: z.string().min(20).max(700),
    confidence: z.coerce.number().min(0).max(1),
  });
  const candidateSetSchema = z.object({
    options: z.array(candidateSchema).min(1).max(maxCandidates),
  });

  // Run the formal AssetPacksSynthesis pipeline on the real primitives. The
  // layered system prompt (pipeline identity + source-safety law, phase
  // lens-role, agent measurement-catalog + rules, step candidate-shape) is
  // composed inside the pipeline from the execution prompt registry; the
  // exclusion-filtered inventory context becomes the generation user prompt.
  const execution = request.execution ?? new Execution('asset-packs-synthesis');
  const outcome = await synthesizeAssetPackCandidatesFormal(
    {
      lens: request.lens,
      repositoryFullName: request.repositoryFullName,
      sourceBranch: request.sourceBranch,
      sourceCommit: request.sourceCommit,
      steering: request.steering,
      inventory: request.inventory,
      candidateKinds: request.candidateKinds,
      maxCandidates,
    },
    candidateSetSchema as unknown as z.ZodType<{ options: FormalSynthesisRawOption[] }>,
    execution,
  );

  const inventoryPathSet = new Set(request.inventory.paths);
  const allowedKinds = new Set(request.candidateKinds);
  const exclusionViolations: string[] = [];
  const candidates: AssetPackCandidate[] = [];
  for (const option of outcome.options) {
    const coveredSourcePaths = [...new Set(option.coveredSourcePaths.map((path) => path.trim()).filter(Boolean))];
    const unknownPaths = coveredSourcePaths.filter((path) => !inventoryPathSet.has(path));
    const excludedPaths = coveredSourcePaths.filter((path) =>
      isPathExcluded(path, request.steering.forcedExclusions),
    );
    if (unknownPaths.length > 0 || excludedPaths.length > 0 || coveredSourcePaths.length === 0) {
      exclusionViolations.push(
        `${option.title}: ${excludedPaths.length ? `excluded paths ${excludedPaths.join(', ')}` : ''}${
          unknownPaths.length ? ` unknown paths ${unknownPaths.join(', ')}` : ''
        }`.trim(),
      );
      continue;
    }

    const measurements = catalog.map((spec) => ({
      measurementKind: spec.measurementKind,
      label: spec.label,
      weight: spec.weight,
      volume: clampVolume(option.measurements[spec.measurementKind] ?? 0),
    }));

    candidates.push({
      kind: allowedKinds.has(option.kind) ? option.kind : request.candidateKinds[0],
      title: option.title.trim(),
      summary: option.summary.trim(),
      coveredSourcePaths,
      measurements,
      measurementRationale: option.measurementRationale.trim(),
      confidence: clampVolume(option.confidence),
    });
  }

  if (candidates.length === 0) {
    throw new Error(
      `AssetPacksSynthesis produced no admissible candidates${
        exclusionViolations.length ? ` (violations: ${exclusionViolations.join(' | ')})` : ''
      }.`,
    );
  }

  // Defense-in-depth: never return source-bearing candidates.
  assertSourceSafeCandidates(candidates, request.inventory);

  return {
    lens: request.lens,
    candidates,
    droppedCandidateCount: outcome.options.length - candidates.length,
    exclusionViolations,
    inference: {
      provider: outcome.provider,
      model: outcome.model,
      totalTokens: outcome.totalTokens,
      durationMs: Date.now() - startedAt,
    },
  };
}

/**
 * Validate raw synthesized candidate options (from the SynthesizeAssetPacks
 * pipeline's Implementation phase) into source-safe AssetPackCandidates,
 * fail-closed: drop any option whose covered paths are unknown to the inventory
 * or violate the protected-IP exclusions, and map measurements through the lens
 * catalog. Used by the deposit route to turn the pipeline output into the
 * deposit option synthesis (mirrors synthesizeAssetPackCandidates' validation).
 */
export function validateDepositSynthesisOptions(
  rawOptions: Array<{
    kind: string;
    title: string;
    summary: string;
    coveredSourcePaths: string[];
    measurements: Record<string, number>;
    measurementRationale: string;
    confidence: number;
    // V48 Gate 3: the FORMAL absolutes measured by agent-measure-absolutes in the
    // Validation phase. When present these are the candidate's measurements (the
    // legacy `measurements` record is the back-compat fallback only).
    absolutes?: AssetPackCandidateMeasurement[] | null;
    // The synthesized AP contents (source-safe patch descriptor) — carried to the
    // deposit card so the depositor sees what knowledge/edits the AP encodes.
    patch?: { fileChanges?: Array<{ path?: unknown; op?: unknown }>; patchSummary?: unknown } | null;
    // Deposit lens only: the read-demand preview signal (v0). neediness is
    // COMPUTED from this; absent/invalid signals yield no neediness preview.
    needinessSignal?: { demand?: number; saturation?: number; rationale?: string } | null;
  }>,
  context: {
    lens: AssetPacksSynthesisLens;
    inventoryPaths: string[];
    forcedExclusions: string[];
    candidateKinds: string[];
  },
): { candidates: AssetPackCandidate[]; droppedCandidateCount: number; exclusionViolations: string[] } {
  const inventoryPathSet = new Set(context.inventoryPaths);
  const allowedKinds = new Set(context.candidateKinds);
  const exclusionViolations: string[] = [];
  const candidates: AssetPackCandidate[] = [];
  for (const option of rawOptions || []) {
    const coveredSourcePaths = [
      ...new Set((option.coveredSourcePaths || []).map((path) => String(path).trim()).filter(Boolean)),
    ];
    const unknownPaths = coveredSourcePaths.filter((path) => !inventoryPathSet.has(path));
    const excludedPaths = coveredSourcePaths.filter((path) =>
      isPathExcluded(path, context.forcedExclusions),
    );
    if (unknownPaths.length > 0 || excludedPaths.length > 0 || coveredSourcePaths.length === 0) {
      exclusionViolations.push(
        `${option.title}: ${excludedPaths.length ? `excluded paths ${excludedPaths.join(', ')}` : ''}${
          unknownPaths.length ? ` unknown paths ${unknownPaths.join(', ')}` : ''
        }`.trim(),
      );
      continue;
    }
    // Product SDIVF Validation attaches formal absolutes (quantity Tool + quality
    // measure-agent). Fail closed when they are missing — never silently project
    // the legacy DEPOSIT_MEASUREMENT_CATALOG placeholder kinds onto deposit cards.
    const formalAbsolutes = Array.isArray(option.absolutes) ? option.absolutes : null;
    if (!formalAbsolutes || formalAbsolutes.length === 0) {
      exclusionViolations.push(
        `${option.title}: missing formal absolute measurements (Validation measure-agent)`,
      );
      continue;
    }
    const measurements: AssetPackCandidateMeasurement[] = formalAbsolutes.map((m) => ({
      measurementKind: String(m.measurementKind),
      label: String(m.label ?? m.measurementKind),
      weight: Number.isFinite(m.weight) ? Number(m.weight) : 0,
      volume: clampVolume(Number(m.volume) || 0),
      category: m.category === 'neediness' ? 'neediness' : 'absolute',
      ...(Number.isFinite(m.magnitude as number)
        ? { magnitude: Math.max(0, Math.round(Number(m.magnitude))) }
        : {}),
      ...(m.unit ? { unit: String(m.unit) } : {}),
    }));
    // Carry the source-safe patch descriptor (the synthesized AP contents) for the
    // deposit card — path+op + summary only, never raw source.
    const rawFileChanges = Array.isArray(option.patch?.fileChanges) ? option.patch!.fileChanges! : [];
    const patch: AssetPackPatchDescriptor | undefined = rawFileChanges.length
      ? {
          fileChanges: rawFileChanges
            .map((fc) => ({ path: String((fc as any)?.path ?? '').trim(), op: String((fc as any)?.op ?? '').trim() }))
            .filter((fc) => fc.path),
          patchSummary: String(option.patch?.patchSummary ?? '').trim(),
        }
      : undefined;
    candidates.push({
      kind: allowedKinds.has(option.kind) ? option.kind : context.candidateKinds[0],
      title: String(option.title).trim(),
      summary: String(option.summary).trim(),
      coveredSourcePaths,
      measurements,
      measurementRationale: String(option.measurementRationale).trim(),
      confidence: clampVolume(option.confidence),
      patch,
      // Deposit preview of read Need-fit (v0); read candidates carry no neediness.
      neediness: context.lens === 'deposit' ? buildNeedinessFromSignal(option.needinessSignal) : undefined,
    });
  }
  return {
    candidates,
    droppedCandidateCount: (rawOptions?.length || 0) - candidates.length,
    exclusionViolations,
  };
}
