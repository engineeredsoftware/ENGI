export type DepositAssetPackOptionKind =
  | 'capability-slice'
  | 'implementation-pattern'
  | 'proof-operations-slice';

export type DepositAssetPackOptionReviewState =
  | 'reviewable-source-safe-option'
  | 'blocked-source-binding'
  | 'blocked-empty-source';

export interface DepositOptionDemandSignal {
  id?: string | null;
  label?: string | null;
  summary?: string | null;
  weight?: number | null;
}

export interface DepositOptionSynthesisRequest {
  repositoryFullName?: string | null;
  sourceBranch?: string | null;
  sourceCommit?: string | null;
  obfuscations?: string | null;
  forcedInclusions?: string[] | null;
  depositoryDemandSignals?: DepositOptionDemandSignal[] | null;
  readingDemandSignals?: DepositOptionDemandSignal[] | null;
  existingDepositorySignals?: DepositOptionDemandSignal[] | null;
  createdAt?: string | null;
}

export interface DepositAssetPackOptionMeasurement {
  id: string;
  label: string;
  // V48 Gate 3: widened to the absolutes catalog kinds (function-count, type-count,
  // file-span, correctness-estimate, semantic-volume) — the formal measurements —
  // as well as the legacy placeholder kinds the deterministic blueprint emits.
  measurementKind: string;
  weight: number;
  volume: number;
  /** Which measurement category — absolutes form the weighted composite. */
  category?: 'absolute' | 'neediness';
  /** Raw count for size measurements (functions / types / files). */
  magnitude?: number;
  /** functions | types | files | estimate | normalized. */
  unit?: string;
  evidenceRoot: string;
}

export interface DepositAssetPackOption {
  schema: 'bitcode.deposit.asset-pack-option';
  optionId: string;
  kind: DepositAssetPackOptionKind;
  title: string;
  summary: string;
  sourceBinding: {
    repositoryFullName: string | null;
    sourceBranch: string | null;
    sourceCommit: string | null;
    sourcePathRoots: string[];
    sourcePathCount: number;
    rawSourceStoredExternally: true;
    protectedSourceVisibleInOption: false;
  };
  demandAlignment: {
    posture: 'source-safe-demand-signals-only';
    depositorySignalRoots: string[];
    readingSignalRoots: string[];
    existingDepositorySignalRoots: string[];
    confidence: number;
  };
  measurements: DepositAssetPackOptionMeasurement[];
  // V48 Gate 3 — the deposit-decision payload: what Bitcode RECEIVES if this AP is
  // deposited. The synthesized AP CONTENTS (source-safe patch descriptor) and the
  // PROVENANT SOURCE (covered files that become available for future reader
  // settlement). Shown to the depositor, who owns the source. Source-safe: path+op
  // + summary + the depositor's own paths only — never raw source/code. Absent
  // (null) on the deterministic blueprint synthesis.
  contents?: {
    patchSummary: string;
    fileChanges: Array<{ path: string; op: string }>;
    provenantSourcePaths: string[];
    provenantSourceCount: number;
  } | null;
  // Deposit neediness PREVIEW (v0): the read-demand estimate (0..1) — the
  // deposit-side preview of read Need-fit / earning potential. Separate from the
  // absolute `measurements` composite; absent (null) when no signal was produced.
  neediness?: {
    volume: number;
    demand: number;
    saturation: number;
    rationale: string;
  } | null;
  reviewBoundary: {
    state: DepositAssetPackOptionReviewState;
    decision: 'pending-depositor-review';
    depositAdmissionBoundary: 'not-admitted-until-depositor-approval';
    btdMintBoundary: 'not-minted-by-deposit-option';
    settlementBoundary: 'future-reader-settlement-required-for-source-bearing-assetpack';
  };
  policyBoundary: {
    sourceCriticalityPolicy: 'deferred-to-gate6';
    demandRoiPolicy: 'deferred-to-gate6';
    compensationPolicy: 'deferred-to-gate6';
  };
  visibility: {
    sourceSafeMetadataOnly: true;
    protectedSourceVisible: false;
    rawSourceTextVisible: false;
    unpaidAssetPackSourceVisible: false;
    rawPromptVisible: false;
    interpolatedPromptVisible: false;
    rawProviderResponseVisible: false;
    walletPrivateMaterialVisible: false;
  };
  roots: {
    optionRoot: string;
    sourceBindingRoot: string;
    demandAlignmentRoot: string;
    measurementRoot: string;
    contentsRoot?: string | null;
    needinessRoot?: string | null;
    reviewBoundaryRoot: string;
  };
}

export interface DepositAssetPackOptionSynthesis {
  schema: 'bitcode.deposit.asset-pack-option-synthesis';
  pipeline: 'DepositAssetPackOptionSynthesis';
  requestId: string;
  createdAt: string;
  request: {
    repositoryFullName: string | null;
    sourceBranch: string | null;
    sourceCommit: string | null;
    depositorInstructionRoot: string | null;
    sourcePathRoots: string[];
  };
  options: DepositAssetPackOption[];
  optionCount: number;
  sourceSafety: {
    sourceSafeMetadataOnly: true;
    protectedSourceVisible: false;
    rawSourceTextVisible: false;
    unpaidAssetPackSourceVisible: false;
    rawPromptVisible: false;
    interpolatedPromptVisible: false;
    rawProviderResponseVisible: false;
    walletPrivateMaterialVisible: false;
  };
  reviewBoundary: {
    route: '/deposits';
    defaultDecisionState: 'pending-depositor-review';
    approvedOptionsAdmittedBy: 'future-gate7-deposit-option-review';
    sourceCriticalityDemandRoiPolicyOwnedBy: 'future-gate6-policy';
  };
  roots: {
    requestRoot: string;
    synthesisRoot: string;
    optionRoots: string[];
  };
}

const OPTION_BLUEPRINTS: Array<{
  kind: DepositAssetPackOptionKind;
  title: string;
  summary: string;
  measurementBias: number;
}> = [
  {
    kind: 'capability-slice',
    title: 'Repository capability AssetPack option',
    summary:
      'A source-safe option describing a bounded capability slice that may satisfy future Reading demand without exposing protected source before settlement.',
    measurementBias: 0.72,
  },
  {
    kind: 'implementation-pattern',
    title: 'Implementation pattern AssetPack option',
    summary:
      'A source-safe option describing reusable implementation patterns, integration constraints, and reviewable measurements for future Need-Fit use.',
    measurementBias: 0.66,
  },
  {
    kind: 'proof-operations-slice',
    title: 'Proof and operations AssetPack option',
    summary:
      'A source-safe option describing proof, telemetry, operational, or validation material that can improve future AssetPack synthesis quality.',
    measurementBias: 0.61,
  },
];

const FORBIDDEN_SOURCE_MARKERS = [
  'PRIVATE_SOURCE_DO_NOT_SERIALIZE',
  'BEGIN_PRIVATE_KEY',
  'wallet_private_material',
  'raw_provider_response',
  'unpaid_assetpack_source',
];

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
}

function stableHash(value: unknown) {
  const text = typeof value === 'string' ? value : stableStringify(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function root(prefix: string, value: unknown) {
  return `${prefix}:${stableHash(value)}`;
}

function normalizedText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizedList(value: string[] | null | undefined) {
  return [...new Set((value || []).map((entry) => entry.trim()).filter(Boolean))].sort();
}

function normalizedSignals(value: DepositOptionDemandSignal[] | null | undefined) {
  return (value || [])
    .map((signal, index) => ({
      id: normalizedText(signal.id) || `signal-${index + 1}`,
      label: normalizedText(signal.label) || normalizedText(signal.summary) || `Demand signal ${index + 1}`,
      summary: normalizedText(signal.summary) || normalizedText(signal.label) || 'Source-safe demand signal',
      weight: Math.max(0, Math.min(1, Number(signal.weight ?? 0.5))),
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

function signalRoots(prefix: string, signals: ReturnType<typeof normalizedSignals>) {
  return signals.map((signal) => root(prefix, signal));
}

function confidenceFor(input: {
  blueprintBias: number;
  hasRepository: boolean;
  hasRevision: boolean;
  sourcePathCount: number;
  signalCount: number;
}) {
  const repositoryBoost = input.hasRepository ? 0.08 : -0.18;
  const revisionBoost = input.hasRevision ? 0.08 : -0.12;
  const sourceBoost = Math.min(0.08, input.sourcePathCount * 0.02);
  const demandBoost = Math.min(0.08, input.signalCount * 0.015);
  return Number(Math.max(0.1, Math.min(0.98, input.blueprintBias + repositoryBoost + revisionBoost + sourceBoost + demandBoost)).toFixed(2));
}

function measurementsFor(input: {
  optionId: string;
  confidence: number;
  sourcePathCount: number;
  signalCount: number;
}): DepositAssetPackOptionMeasurement[] {
  const sourceCoverage = Number(Math.min(1, 0.42 + input.sourcePathCount * 0.08).toFixed(2));
  const demandAlignment = Number(Math.min(1, 0.38 + input.signalCount * 0.06 + input.confidence * 0.2).toFixed(2));
  const reuseLikelihood = Number(Math.min(1, 0.36 + input.confidence * 0.45).toFixed(2));
  const rows: Array<Omit<DepositAssetPackOptionMeasurement, 'evidenceRoot'>> = [
    {
      id: `${input.optionId}:source-coverage`,
      label: 'Source coverage',
      measurementKind: 'source-coverage',
      weight: 0.36,
      volume: sourceCoverage,
    },
    {
      id: `${input.optionId}:demand-alignment`,
      label: 'Demand alignment',
      measurementKind: 'demand-alignment',
      weight: 0.4,
      volume: demandAlignment,
    },
    {
      id: `${input.optionId}:reuse-likelihood`,
      label: 'Reuse likelihood',
      measurementKind: 'reuse-likelihood',
      weight: 0.24,
      volume: reuseLikelihood,
    },
  ];

  return rows.map((row) => ({
    ...row,
    evidenceRoot: root('deposit-option-measurement', row),
  }));
}

export function buildDepositAssetPackOptionSynthesis(
  request: DepositOptionSynthesisRequest = {},
): DepositAssetPackOptionSynthesis {
  const repositoryFullName = normalizedText(request.repositoryFullName);
  const sourceBranch = normalizedText(request.sourceBranch);
  const sourceCommit = normalizedText(request.sourceCommit);
  const obfuscations = normalizedText(request.obfuscations);
  const forcedInclusions = normalizedList(request.forcedInclusions);
  const depositoryDemandSignals = normalizedSignals(request.depositoryDemandSignals);
  const readingDemandSignals = normalizedSignals(request.readingDemandSignals);
  const existingDepositorySignals = normalizedSignals(request.existingDepositorySignals);
  const sourcePathRoots = forcedInclusions.map((path) => root('deposit-option-source-path', path));
  const hasRepository = Boolean(repositoryFullName);
  const hasRevision = Boolean(sourceBranch && sourceCommit);
  const signalCount =
    depositoryDemandSignals.length + readingDemandSignals.length + existingDepositorySignals.length;
  const createdAt = normalizedText(request.createdAt) || 'deterministic';
  const requestRoot = root('deposit-option-request', {
    repositoryFullName,
    sourceBranch,
    sourceCommit,
    depositorInstructionRoot: obfuscations ? root('deposit-option-instructions', obfuscations) : null,
    sourcePathRoots,
    depositoryDemandSignals,
    readingDemandSignals,
    existingDepositorySignals,
  });

  const options = OPTION_BLUEPRINTS.map((blueprint, index): DepositAssetPackOption => {
    const optionId = `deposit-option-${index + 1}-${stableHash({
      kind: blueprint.kind,
      repositoryFullName,
      sourceBranch,
      sourceCommit,
      sourcePathRoots,
    })}`;
    const confidence = confidenceFor({
      blueprintBias: blueprint.measurementBias,
      hasRepository,
      hasRevision,
      sourcePathCount: sourcePathRoots.length,
      signalCount,
    });
    const measurements = measurementsFor({
      optionId,
      confidence,
      sourcePathCount: sourcePathRoots.length,
      signalCount,
    });
    const reviewState: DepositAssetPackOptionReviewState = !hasRepository
      ? 'blocked-source-binding'
      : sourcePathRoots.length === 0
        ? 'blocked-empty-source'
        : 'reviewable-source-safe-option';
    const sourceBinding = {
      repositoryFullName,
      sourceBranch,
      sourceCommit,
      sourcePathRoots,
      sourcePathCount: sourcePathRoots.length,
      rawSourceStoredExternally: true as const,
      protectedSourceVisibleInOption: false as const,
    };
    const demandAlignment = {
      posture: 'source-safe-demand-signals-only' as const,
      depositorySignalRoots: signalRoots('deposit-option-depository-demand-signal', depositoryDemandSignals),
      readingSignalRoots: signalRoots('deposit-option-reading-demand-signal', readingDemandSignals),
      existingDepositorySignalRoots: signalRoots('deposit-option-existing-supply-signal', existingDepositorySignals),
      confidence,
    };
    const reviewBoundary = {
      state: reviewState,
      decision: 'pending-depositor-review' as const,
      depositAdmissionBoundary: 'not-admitted-until-depositor-approval' as const,
      btdMintBoundary: 'not-minted-by-deposit-option' as const,
      settlementBoundary: 'future-reader-settlement-required-for-source-bearing-assetpack' as const,
    };
    const optionBase = {
      optionId,
      kind: blueprint.kind,
      title: blueprint.title,
      summary: blueprint.summary,
      sourceBinding,
      demandAlignment,
      measurements,
      reviewBoundary,
    };

    return {
      schema: 'bitcode.deposit.asset-pack-option',
      ...optionBase,
      policyBoundary: {
        sourceCriticalityPolicy: 'deferred-to-gate6',
        demandRoiPolicy: 'deferred-to-gate6',
        compensationPolicy: 'deferred-to-gate6',
      },
      visibility: {
        sourceSafeMetadataOnly: true,
        protectedSourceVisible: false,
        rawSourceTextVisible: false,
        unpaidAssetPackSourceVisible: false,
        rawPromptVisible: false,
        interpolatedPromptVisible: false,
        rawProviderResponseVisible: false,
        walletPrivateMaterialVisible: false,
      },
      roots: {
        optionRoot: root('deposit-asset-pack-option', optionBase),
        sourceBindingRoot: root('deposit-option-source-binding', sourceBinding),
        demandAlignmentRoot: root('deposit-option-demand-alignment', demandAlignment),
        measurementRoot: root('deposit-option-measurements', measurements),
        reviewBoundaryRoot: root('deposit-option-review-boundary', reviewBoundary),
      },
    };
  });
  const optionRoots = options.map((option) => option.roots.optionRoot);
  const synthesisRoot = root('deposit-asset-pack-option-synthesis', {
    requestRoot,
    optionRoots,
    createdAt,
  });

  return {
    schema: 'bitcode.deposit.asset-pack-option-synthesis',
    pipeline: 'DepositAssetPackOptionSynthesis',
    requestId: requestRoot,
    createdAt,
    request: {
      repositoryFullName,
      sourceBranch,
      sourceCommit,
      depositorInstructionRoot: obfuscations ? root('deposit-option-instructions', obfuscations) : null,
      sourcePathRoots,
    },
    options,
    optionCount: options.length,
    sourceSafety: {
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      walletPrivateMaterialVisible: false,
    },
    reviewBoundary: {
      route: '/deposits',
      defaultDecisionState: 'pending-depositor-review',
      approvedOptionsAdmittedBy: 'future-gate7-deposit-option-review',
      sourceCriticalityDemandRoiPolicyOwnedBy: 'future-gate6-policy',
    },
    roots: {
      requestRoot,
      synthesisRoot,
      optionRoots,
    },
  };
}

export function assertDepositAssetPackOptionSynthesisSourceSafe(
  synthesis: DepositAssetPackOptionSynthesis,
) {
  const serialized = stableStringify(synthesis);
  const noForbiddenMarkers = FORBIDDEN_SOURCE_MARKERS.every((marker) => !serialized.includes(marker));
  const sourceSafe =
    synthesis.schema === 'bitcode.deposit.asset-pack-option-synthesis' &&
    synthesis.pipeline === 'DepositAssetPackOptionSynthesis' &&
    synthesis.reviewBoundary.route === '/deposits' &&
    synthesis.sourceSafety.sourceSafeMetadataOnly === true &&
    synthesis.sourceSafety.protectedSourceVisible === false &&
    synthesis.sourceSafety.rawSourceTextVisible === false &&
    synthesis.sourceSafety.unpaidAssetPackSourceVisible === false &&
    synthesis.sourceSafety.rawPromptVisible === false &&
    synthesis.sourceSafety.interpolatedPromptVisible === false &&
    synthesis.sourceSafety.rawProviderResponseVisible === false &&
    synthesis.sourceSafety.walletPrivateMaterialVisible === false &&
    synthesis.options.every(
      (option) =>
        option.visibility.sourceSafeMetadataOnly === true &&
        option.visibility.protectedSourceVisible === false &&
        option.visibility.rawSourceTextVisible === false &&
        option.visibility.unpaidAssetPackSourceVisible === false &&
        option.sourceBinding.protectedSourceVisibleInOption === false &&
        option.reviewBoundary.decision === 'pending-depositor-review' &&
        option.reviewBoundary.depositAdmissionBoundary === 'not-admitted-until-depositor-approval' &&
        option.reviewBoundary.btdMintBoundary === 'not-minted-by-deposit-option',
    ) &&
    noForbiddenMarkers;

  return {
    admitted: sourceSafe,
    reason: sourceSafe ? 'source_safe_deposit_asset_pack_option_synthesis' : 'deposit_option_source_safety_boundary_violation',
  };
}
