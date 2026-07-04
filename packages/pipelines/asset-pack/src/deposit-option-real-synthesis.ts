import {
  applyExclusionsToInventory,
  isPathExcluded,
  normalizeProtectedIpExclusions,
  synthesizeAssetPackCandidates,
  type AssetPackCandidate,
  type AssetPacksSynthesisInferenceAccounting,
  type AssetPacksSynthesisResult,
  type AssetPacksSynthesisSourceInventory,
} from './asset-packs-synthesis';
import type {
  DepositAssetPackOption,
  DepositAssetPackOptionKind,
  DepositAssetPackOptionMeasurement,
  DepositAssetPackOptionSynthesis,
  DepositOptionSynthesisRequest,
} from './deposit-asset-pack-options';

/**
 * Deposit lens adapter over AssetPacksSynthesis (V48 Gate 2, QA ledger F12/F14).
 *
 * The single AssetPacksSynthesis pipeline measures source into candidates;
 * this adapter steers it with the deposit lens (depositor instructions,
 * protected-IP exclusions, depository demand context) and translates the
 * resulting candidates into the V43/V47 deposit option law: the emitted
 * synthesis keeps the `bitcode.deposit.asset-pack-option-synthesis` schema,
 * root format, review boundaries, and source-safety posture, so the
 * existing policy and admission builders consume it unchanged.
 */

export { applyExclusionsToInventory, isPathExcluded, normalizeProtectedIpExclusions };
export type { AssetPacksSynthesisSourceInventory as DepositOptionSourceInventory };

const DEPOSIT_OPTION_KINDS: DepositAssetPackOptionKind[] = [
  'capability-slice',
  'implementation-pattern',
  'proof-operations-slice',
];

export interface RealDepositAssetPackOptionSynthesis extends DepositAssetPackOptionSynthesis {
  synthesisMode: 'real-bounded-inference';
  pipelineCore: 'AssetPacksSynthesis';
  inference: AssetPacksSynthesisInferenceAccounting;
  exclusionPosture: {
    protectedIpExclusionCount: number;
    exclusionRoots: string[];
    excludedPathCount: number;
    droppedCandidateCount: number;
  };
}

export interface DepositOptionReviewProjection {
  optionId: string;
  title: string;
  coveredSourcePaths: string[];
  measurementRationale: string;
}

export async function synthesizeRealDepositOptionCandidates(input: {
  repositoryFullName: string;
  sourceBranch: string | null;
  sourceCommit: string | null;
  obfuscations: string | null;
  protectedIpExclusions: string[];
  demandContext: string[];
  inventory: AssetPacksSynthesisSourceInventory;
  execution?: import('@bitcode/execution-generics/Execution').Execution | null;
}): Promise<AssetPacksSynthesisResult> {
  return synthesizeAssetPackCandidates({
    lens: 'deposit',
    repositoryFullName: input.repositoryFullName,
    sourceBranch: input.sourceBranch,
    sourceCommit: input.sourceCommit,
    steering: {
      instructions: input.obfuscations,
      protectedIpExclusions: input.protectedIpExclusions,
      demandContext: input.demandContext,
    },
    inventory: input.inventory,
    candidateKinds: DEPOSIT_OPTION_KINDS,
    maxCandidates: 4,
    execution: input.execution ?? null,
  });
}

// Root machinery mirrors deposit-asset-pack-options.ts exactly so real and
// blueprint syntheses share one root format (`prefix:hex8`).
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

function normalizedSignals(value: DepositOptionSynthesisRequest['depositoryDemandSignals']) {
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

function candidateKind(candidate: AssetPackCandidate): DepositAssetPackOptionKind {
  return DEPOSIT_OPTION_KINDS.includes(candidate.kind as DepositAssetPackOptionKind)
    ? (candidate.kind as DepositAssetPackOptionKind)
    : 'capability-slice';
}

export function buildRealDepositAssetPackOptionSynthesis(
  request: DepositOptionSynthesisRequest & { protectedIpExclusions?: string[] | null },
  result: AssetPacksSynthesisResult,
  inventory: AssetPacksSynthesisSourceInventory,
): { synthesis: RealDepositAssetPackOptionSynthesis; reviewProjections: DepositOptionReviewProjection[] } {
  const repositoryFullName = normalizedText(request.repositoryFullName);
  const sourceBranch = normalizedText(request.sourceBranch);
  const sourceCommit = normalizedText(request.sourceCommit);
  const obfuscations = normalizedText(request.obfuscations);
  const protectedIpExclusions = normalizeProtectedIpExclusions(request.protectedIpExclusions);
  const depositoryDemandSignals = normalizedSignals(request.depositoryDemandSignals);
  const readingDemandSignals = normalizedSignals(request.readingDemandSignals);
  const existingDepositorySignals = normalizedSignals(request.existingDepositorySignals);
  const exclusionRoots = protectedIpExclusions.map((entry) => root('deposit-option-ip-exclusion', entry));
  const createdAt = normalizedText(request.createdAt) || new Date().toISOString();

  const requestRoot = root('deposit-option-request', {
    repositoryFullName,
    sourceBranch,
    sourceCommit,
    depositorInstructionRoot: obfuscations
      ? root('deposit-option-instructions', obfuscations)
      : null,
    synthesisMode: 'real-bounded-inference',
    pipelineCore: 'AssetPacksSynthesis',
    exclusionRoots,
    inventoryPathCount: inventory.paths.length,
    depositoryDemandSignals,
    readingDemandSignals,
    existingDepositorySignals,
  });

  const reviewProjections: DepositOptionReviewProjection[] = [];
  const options = result.candidates.map((candidate, index): DepositAssetPackOption => {
    const sourcePathRoots = candidate.coveredSourcePaths.map((path) => root('deposit-option-source-path', path));
    const optionId = `deposit-option-real-${index + 1}-${stableHash({
      kind: candidate.kind,
      title: candidate.title,
      repositoryFullName,
      sourceBranch,
      sourceCommit,
      sourcePathRoots,
    })}`;
    const measurements: DepositAssetPackOptionMeasurement[] = candidate.measurements.map((measurement) => ({
      id: `${optionId}:${measurement.measurementKind}`,
      label: measurement.label,
      measurementKind: measurement.measurementKind,
      weight: measurement.weight,
      volume: measurement.volume,
      // V48 Gate 3: carry the absolutes provenance (category + size magnitude/unit).
      ...(measurement.category ? { category: measurement.category } : {}),
      ...(typeof measurement.magnitude === 'number' ? { magnitude: measurement.magnitude } : {}),
      ...(measurement.unit ? { unit: measurement.unit } : {}),
      evidenceRoot: root('deposit-option-measurement', {
        measurementKind: measurement.measurementKind,
        weight: measurement.weight,
        volume: measurement.volume,
        rationaleRoot: root('deposit-option-measurement-rationale', candidate.measurementRationale),
        coveredSourcePathRoots: sourcePathRoots,
      }),
    }));
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
      confidence: candidate.confidence,
    };
    const reviewBoundary = {
      state: 'reviewable-source-safe-option' as const,
      decision: 'pending-depositor-review' as const,
      depositAdmissionBoundary: 'not-admitted-until-depositor-approval' as const,
      btdMintBoundary: 'not-minted-by-deposit-option' as const,
      settlementBoundary: 'future-reader-settlement-required-for-source-bearing-assetpack' as const,
    };
    // Deposit neediness preview (v0): carry the read-demand estimate the
    // depository-search lens produced for this candidate (computed by
    // validateDepositSynthesisOptions). Null when no signal was produced.
    const neediness = candidate.neediness
      ? {
          volume: candidate.neediness.volume,
          demand: candidate.neediness.demand,
          saturation: candidate.neediness.saturation,
          rationale: candidate.neediness.rationale,
        }
      : null;
    // The deposit-decision payload: what Bitcode RECEIVES if deposited — the
    // synthesized AP contents (source-safe patch descriptor) + the provenant source
    // (covered files). Shown to the depositor; source-safe (path+op + summary + the
    // depositor's own paths).
    const contents = {
      patchSummary: candidate.patch?.patchSummary ?? '',
      fileChanges: (candidate.patch?.fileChanges ?? []).map((fc) => ({ path: fc.path, op: fc.op })),
      provenantSourcePaths: candidate.coveredSourcePaths,
      provenantSourceCount: candidate.coveredSourcePaths.length,
    };
    const optionBase = {
      optionId,
      kind: candidateKind(candidate),
      title: candidate.title,
      summary: candidate.summary,
      sourceBinding,
      demandAlignment,
      measurements,
      contents,
      neediness,
      reviewBoundary,
    };

    reviewProjections.push({
      optionId,
      title: candidate.title,
      coveredSourcePaths: candidate.coveredSourcePaths,
      measurementRationale: candidate.measurementRationale,
    });

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
        contentsRoot: root('deposit-option-contents', contents),
        needinessRoot: neediness ? root('deposit-option-neediness', neediness) : null,
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

  const synthesis: RealDepositAssetPackOptionSynthesis = {
    schema: 'bitcode.deposit.asset-pack-option-synthesis',
    pipeline: 'DepositAssetPackOptionSynthesis',
    requestId: requestRoot,
    createdAt,
    request: {
      repositoryFullName,
      sourceBranch,
      sourceCommit,
      depositorInstructionRoot: obfuscations
        ? root('deposit-option-instructions', obfuscations)
        : null,
      sourcePathRoots: [...new Set(options.flatMap((option) => option.sourceBinding.sourcePathRoots))],
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
    synthesisMode: 'real-bounded-inference',
    pipelineCore: 'AssetPacksSynthesis',
    inference: result.inference,
    exclusionPosture: {
      protectedIpExclusionCount: protectedIpExclusions.length,
      exclusionRoots,
      excludedPathCount: inventory.excludedPathCount,
      droppedCandidateCount: result.droppedCandidateCount,
    },
  };

  return { synthesis, reviewProjections };
}
