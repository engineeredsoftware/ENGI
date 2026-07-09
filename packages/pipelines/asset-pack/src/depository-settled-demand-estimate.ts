/**
 * Depository settled-AssetPack demand estimation (V48 Gate 3).
 *
 * Demand estimates for deposit earnings / option neediness must be grounded in
 * the Depository's *settled* (or admitted-and-settlement-ready) AssetPack corpus.
 * Hardcoded placeholder weights are forbidden. When the settled corpus is too
 * thin to support a defensible estimate, return estimatable=false and let UI
 * say "Unestimatable".
 */

export type SettledDemandEstimateState =
  | 'strong-likely-demand'
  | 'moderate-likely-demand'
  | 'weak-likely-demand'
  | 'unestimatable-demand';

/** Minimal source-safe settled pack row used for estimation (no raw source). */
export interface SettledDepositoryPackSummary {
  id: string;
  title?: string | null;
  summary?: string | null;
  kind?: string | null;
  repositoryFullName?: string | null;
  /** When known: admitted-to-depository, settled, etc. */
  lifecycleState?: string | null;
  /** Optional free-text tags/topics (source-safe labels only). */
  topics?: string[] | null;
}

export interface DepositorySettledDemandEstimateInput {
  /** Settled / admitted Depository AssetPacks to search over. */
  settledPacks: SettledDepositoryPackSummary[];
  /** Optional focus for option-level estimates (title/summary/kind/repo). */
  focus?: {
    title?: string | null;
    summary?: string | null;
    kind?: string | null;
    repositoryFullName?: string | null;
    coveredSourcePaths?: string[] | null;
  } | null;
  /**
   * Minimum settled packs required before any numeric demand is admitted.
   * Below this floor the estimate is unestimatable (fail-closed honesty).
   */
  minSettledPacks?: number;
}

export interface DepositorySettledDemandEstimate {
  schema: 'bitcode.depository.settled-demand-estimate';
  estimatable: boolean;
  state: SettledDemandEstimateState;
  /** 0..1 when estimatable; null when unestimatable. */
  demand: number | null;
  /** 0..1 saturation of similar settled supply; null when unestimatable. */
  saturation: number | null;
  /**
   * Read-demand preview volume: demand × (0.5 + 0.5·(1−saturation)).
   * Null when unestimatable.
   */
  needinessVolume: number | null;
  settledPackCount: number;
  matchedPackCount: number;
  rationale: string;
  /** Source-safe pack ids that contributed to the match (bounded). */
  matchedPackIds: string[];
}

const DEFAULT_MIN_SETTLED = 3;
const MAX_MATCHED_IDS = 12;

function clamp01(value: number) {
  return Number(Math.max(0, Math.min(1, value)).toFixed(2));
}

function normalizeText(value: string | null | undefined) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function tokenize(...parts: Array<string | null | undefined>): Set<string> {
  const tokens = new Set<string>();
  for (const part of parts) {
    const text = normalizeText(part);
    if (!text) continue;
    for (const raw of text.split(/[^a-z0-9]+/g)) {
      if (raw.length < 3) continue;
      // Drop ultra-common noise.
      if (
        raw === 'the' ||
        raw === 'and' ||
        raw === 'for' ||
        raw === 'with' ||
        raw === 'from' ||
        raw === 'asset' ||
        raw === 'pack' ||
        raw === 'bitcode'
      ) {
        continue;
      }
      tokens.add(raw);
    }
  }
  return tokens;
}

function packTokens(pack: SettledDepositoryPackSummary): Set<string> {
  return tokenize(
    pack.title,
    pack.summary,
    pack.kind,
    pack.repositoryFullName,
    ...(Array.isArray(pack.topics) ? pack.topics : []),
  );
}

function focusTokens(focus: DepositorySettledDemandEstimateInput['focus']): Set<string> {
  if (!focus) return new Set();
  const pathBits = Array.isArray(focus.coveredSourcePaths)
    ? focus.coveredSourcePaths.flatMap((path) => path.split(/[\/._-]+/))
    : [];
  return tokenize(
    focus.title,
    focus.summary,
    focus.kind,
    focus.repositoryFullName,
    ...pathBits,
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const token of a) {
    if (b.has(token)) inter += 1;
  }
  const union = a.size + b.size - inter;
  return union > 0 ? inter / union : 0;
}

function isSettledLifecycle(state: string | null | undefined): boolean {
  const normalized = normalizeText(state);
  if (!normalized) return true; // caller already filtered the corpus
  return (
    normalized.includes('settled') ||
    normalized.includes('admitted') ||
    normalized.includes('depository') ||
    normalized.includes('indexed') ||
    normalized.includes('completed')
  );
}

function stateForDemand(demand: number): SettledDemandEstimateState {
  if (demand >= 0.76) return 'strong-likely-demand';
  if (demand >= 0.56) return 'moderate-likely-demand';
  return 'weak-likely-demand';
}

/**
 * Estimate demand by searching the settled Depository AssetPack corpus.
 * Pure + source-safe: only pack metadata, never raw source.
 */
export function estimateDepositorySettledDemand(
  input: DepositorySettledDemandEstimateInput,
): DepositorySettledDemandEstimate {
  const minSettled = Math.max(1, input.minSettledPacks ?? DEFAULT_MIN_SETTLED);
  const settled = (Array.isArray(input.settledPacks) ? input.settledPacks : []).filter(
    (pack) => pack && typeof pack.id === 'string' && pack.id.trim() && isSettledLifecycle(pack.lifecycleState),
  );
  const settledPackCount = settled.length;

  if (settledPackCount < minSettled) {
    return {
      schema: 'bitcode.depository.settled-demand-estimate',
      estimatable: false,
      state: 'unestimatable-demand',
      demand: null,
      saturation: null,
      needinessVolume: null,
      settledPackCount,
      matchedPackCount: 0,
      rationale:
        settledPackCount === 0
          ? 'Unestimatable: the Depository has no settled AssetPacks to search for comparable demand.'
          : `Unestimatable: only ${settledPackCount} settled AssetPack(s) available; need at least ${minSettled} for a defensible estimate.`,
      matchedPackIds: [],
    };
  }

  const focus = focusTokens(input.focus);
  // Without a focus (aggregate all-repos panel), use whole-corpus activity as
  // a coarse demand prior: more settled packs ⇒ some network read activity,
  // but saturation also rises — never invent a "strong" signal from thin air.
  const hasFocus = focus.size > 0;
  const scored = settled
    .map((pack) => {
      const tokens = packTokens(pack);
      const similarity = hasFocus ? jaccard(focus, tokens) : 0.35;
      const repoBoost =
        hasFocus &&
        input.focus?.repositoryFullName &&
        pack.repositoryFullName &&
        normalizeText(pack.repositoryFullName) === normalizeText(input.focus.repositoryFullName)
          ? 0.15
          : 0;
      const kindBoost =
        hasFocus &&
        input.focus?.kind &&
        pack.kind &&
        normalizeText(pack.kind) === normalizeText(input.focus.kind)
          ? 0.12
          : 0;
      return {
        id: pack.id,
        score: clamp01(similarity + repoBoost + kindBoost),
      };
    })
    .sort((left, right) => right.score - left.score);

  const matchThreshold = hasFocus ? 0.12 : 0.2;
  const matches = scored.filter((entry) => entry.score >= matchThreshold);
  const matchedPackCount = matches.length;
  const matchedPackIds = matches.slice(0, MAX_MATCHED_IDS).map((entry) => entry.id);

  if (hasFocus && matchedPackCount === 0) {
    return {
      schema: 'bitcode.depository.settled-demand-estimate',
      estimatable: false,
      state: 'unestimatable-demand',
      demand: null,
      saturation: null,
      needinessVolume: null,
      settledPackCount,
      matchedPackCount: 0,
      rationale:
        'Unestimatable: no settled Depository AssetPacks match this supply topic closely enough to infer demand.',
      matchedPackIds: [],
    };
  }

  // Demand: strength of topic affinity among settled packs (mean of top matches),
  // tempered by how rare strong matches are in the corpus.
  const top = matches.slice(0, Math.min(8, matches.length));
  const meanTop =
    top.reduce((sum, entry) => sum + entry.score, 0) / Math.max(1, top.length);
  const coverage = matchedPackCount / settledPackCount;
  // High match share ⇒ topic is already well-supplied (lower *new* demand).
  // Sparse but strong matches ⇒ clearer demand signal for more of that knowledge.
  const demand = clamp01(meanTop * (0.55 + 0.45 * (1 - coverage * 0.85)));
  // Saturation: how much of the settled corpus already covers this topic.
  const saturation = clamp01(0.15 + coverage * 0.75);
  const needinessVolume = clamp01(demand * (0.5 + 0.5 * (1 - saturation)));

  return {
    schema: 'bitcode.depository.settled-demand-estimate',
    estimatable: true,
    state: stateForDemand(demand),
    demand,
    saturation,
    needinessVolume,
    settledPackCount,
    matchedPackCount,
    rationale: hasFocus
      ? `Estimated from ${matchedPackCount} of ${settledPackCount} settled Depository AssetPacks with topic affinity (mean match ${meanTop.toFixed(2)}; saturation ${saturation.toFixed(2)}).`
      : `Aggregate estimate from ${settledPackCount} settled Depository AssetPacks (coarse corpus prior; refine by selecting a repository or synthesizing options).`,
    matchedPackIds,
  };
}

/** Map a settled demand estimate into deposit demand-signal weights (or empty when unestimatable). */
export function settledDemandEstimateToSignals(
  estimate: DepositorySettledDemandEstimate,
): {
  depositoryDemandSignals: Array<{ id: string; label: string; weight: number }>;
  readingDemandSignals: Array<{ id: string; label: string; weight: number }>;
  existingDepositorySignals: Array<{ id: string; label: string; weight: number }>;
  unfitNeedOpportunitySignals: Array<{ id: string; label: string; weight: number }>;
} {
  if (!estimate.estimatable || estimate.demand == null) {
    return {
      depositoryDemandSignals: [],
      readingDemandSignals: [],
      existingDepositorySignals: [],
      unfitNeedOpportunitySignals: [],
    };
  }
  const demand = estimate.demand;
  const saturation = estimate.saturation ?? 0.5;
  const scarcity = clamp01(1 - saturation);
  return {
    depositoryDemandSignals: [
      {
        id: 'settled-depository-topic-demand',
        label: estimate.rationale,
        weight: demand,
      },
    ],
    readingDemandSignals: [
      {
        id: 'settled-reading-demand-from-depository',
        label: `Reading demand inferred from settled Depository AssetPack affinity (${estimate.matchedPackCount} matches).`,
        weight: demand,
      },
    ],
    existingDepositorySignals: [
      {
        id: 'settled-depository-supply-saturation',
        label: `Existing settled supply saturation ${saturation.toFixed(2)} across ${estimate.settledPackCount} packs.`,
        weight: saturation,
      },
    ],
    unfitNeedOpportunitySignals:
      scarcity >= 0.35
        ? [
            {
              id: 'settled-unfit-need-scarcity',
              label: `Settled corpus shows under-served topic space (scarcity ${scarcity.toFixed(2)}).`,
              weight: clamp01(demand * scarcity),
            },
          ]
        : [],
  };
}

/**
 * Map a settled demand estimate into deposit option neediness (or unestimatable
 * sentinel). Prefer this over LLM-invented needinessSignal scalars.
 */
export function settledDemandEstimateToNeediness(
  estimate: DepositorySettledDemandEstimate,
): {
  estimatable: boolean;
  volume: number | null;
  demand: number | null;
  saturation: number | null;
  rationale: string;
} {
  if (
    !estimate.estimatable ||
    estimate.demand == null ||
    estimate.saturation == null ||
    estimate.needinessVolume == null
  ) {
    return {
      estimatable: false,
      volume: null,
      demand: null,
      saturation: null,
      rationale: estimate.rationale.startsWith('Unestimatable')
        ? estimate.rationale
        : `Unestimatable: ${estimate.rationale}`,
    };
  }
  return {
    estimatable: true,
    volume: estimate.needinessVolume,
    demand: estimate.demand,
    saturation: estimate.saturation,
    rationale: estimate.rationale,
  };
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
}

function needinessRootFor(neediness: {
  volume: number;
  demand: number;
  saturation: number;
  rationale: string;
}) {
  const text = stableStringify(neediness);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `deposit-option-neediness:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

/**
 * Ground each deposit option's neediness from settled Depository AssetPacks.
 * Replaces LLM-invented neediness when a settled corpus is available to search;
 * marks neediness unestimatable (zeroed + "Unestimatable:" rationale) when thin.
 */
export function groundOptionNeedinessFromSettledDepository<
  T extends {
    title?: string | null;
    summary?: string | null;
    kind?: string | null;
    neediness?: {
      volume: number;
      demand: number;
      saturation: number;
      rationale: string;
    } | null;
    contents?: { provenantSourcePaths?: string[] | null } | null;
    sourceBinding?: { repositoryFullName?: string | null } | null;
    roots?: { needinessRoot?: string | null } | null;
  },
>(
  options: T[],
  settledPacks: SettledDepositoryPackSummary[],
  minSettledPacks?: number,
): T[] {
  return options.map((option) => {
    const estimate = estimateDepositorySettledDemand({
      settledPacks,
      minSettledPacks,
      focus: {
        title: option.title,
        summary: option.summary,
        kind: option.kind,
        repositoryFullName: option.sourceBinding?.repositoryFullName,
        coveredSourcePaths: option.contents?.provenantSourcePaths || null,
      },
    });
    const grounded = settledDemandEstimateToNeediness(estimate);
    const neediness = grounded.estimatable
      ? {
          volume: grounded.volume as number,
          demand: grounded.demand as number,
          saturation: grounded.saturation as number,
          rationale: grounded.rationale,
        }
      : {
          volume: 0,
          demand: 0,
          saturation: 0,
          rationale: grounded.rationale,
        };
    return {
      ...option,
      neediness,
      ...(option.roots
        ? {
            roots: {
              ...option.roots,
              needinessRoot: needinessRootFor(neediness),
            },
          }
        : {}),
    };
  });
}
