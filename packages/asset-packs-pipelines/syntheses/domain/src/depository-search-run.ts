/**
 * Depository-search execution entrypoints and pipeline store helpers.
 * Runs asset-space ranking, blocked-readiness paths, and execution evidence writes.
 */
import { buildAssetPackEmbeddingPolicy } from './embedding-config';
import {
  admitReadFitsFinding,
} from '../../read/src/read-need';
import {
  buildDepositorySupplyIndex,
  type DepositorySupplyIndex,
} from './depository-supply-index';
import {
  buildDepositoryFitResultEvidence,
  buildDepositorySearchQueryPlan,
  buildReadFitsFindingSynthesisSearchReceipt,
  selectedFitProvenanceRootFor,
} from './depository-search-evidence';
import {
  createLexicalDepositorySearchProvider,
  normalizeDepositoryAsset,
  normalizeDepositorySearchRead,
  normalizePipelineDepositoryAssets,
} from './depository-search-normalize';
import {
  clamp01,
  rankAsset,
  readLooksBroad,
  recordValue,
  sha256,
  stableStringify,
} from './depository-search-scoring';
import {
  DEFAULT_THRESHOLDS,
  READ_FITS_FINDING_SYNTHESIS_TOOL_IDS,
  type AssetPackFitResultState,
  type DepositoryAsset,
  type DepositoryCandidate,
  type DepositoryProviderMatch,
  type DepositorySearchInput,
  type DepositorySearchRead,
  type DepositorySearchResult,
  type DepositorySearchThresholds,
} from './depository-search-types';

function resultStateFor(input: {
  read: DepositorySearchRead;
  candidates: DepositoryCandidate[];
  selected: DepositoryCandidate[];
  blocked: DepositoryCandidate[];
  assets: DepositoryAsset[];
  thresholds: DepositorySearchThresholds;
}): { resultState: AssetPackFitResultState; resultReasons: string[] } {
  if (!input.assets.length) {
    return {
      resultState: 'blocked_readiness',
      resultReasons: ['No depository assets were supplied to the AssetPack pipeline search input.'],
    };
  }

  if (readLooksBroad(input.read)) {
    return {
      resultState: 'blocked_readiness',
      resultReasons: ['Read is too broad for fit selection without closure criteria or target artifact kinds.'],
    };
  }

  const blocker = input.blocked[0];
  if (!input.selected.length && blocker) {
    return {
      resultState: 'blocked_readiness',
      resultReasons: [
        `Candidate ${blocker.assetId} matched the Read but is blocked: ${blocker.verification.blockers.join(', ')}.`,
      ],
    };
  }

  const worthy = input.selected.filter(
    (candidate) =>
      candidate.ranking.finalScore >= input.thresholds.worthyScore &&
      candidate.verification.hasWalletOrAttestationProof &&
      candidate.verification.hasAssetMeasurementEvidence &&
      !candidate.verification.warnings.includes('proof_root_readback_missing') &&
      !candidate.verification.warnings.includes('reconciliation_readback_missing') &&
      !candidate.verification.blockers.length
  );
  if (worthy.length) {
    return {
      resultState: 'worthy_fit',
      resultReasons: [
        `Selected ${worthy.length} proof-bearing fit deposit${worthy.length === 1 ? '' : 's'} for this Read.`,
      ],
    };
  }

  if (input.selected.some((candidate) => candidate.ranking.finalScore >= input.thresholds.reviewScore)) {
    const missing = input.selected.flatMap((candidate) => candidate.verification.warnings);
    return {
      resultState: 'blocked_readiness',
      resultReasons: [
        'Candidate recall found source-bound evidence, but fit remains blocked until proof, measurement, or worthy-score requirements are satisfied.',
        ...[...new Set(missing)].map((warning) => `Warning: ${warning}`),
      ],
    };
  }

  return {
    resultState: 'no_worthy_fit',
    resultReasons: ['No deposited AssetPack candidate met the Read semantic, ranking, and source-bound review floors.'],
  };
}

export async function searchDepositoryAssetSpace(
  input: DepositorySearchInput
): Promise<DepositorySearchResult> {
  const thresholds = { ...DEFAULT_THRESHOLDS, ...(input.thresholds || {}) };
  const assets = input.assets.map(normalizeDepositoryAsset).filter(Boolean) as DepositoryAsset[];
  const providerMatches = new Map<string, DepositoryProviderMatch[]>();
  const providerIds = (input.providers || []).map((provider) => provider.id).sort();
  const embeddingPolicy = buildAssetPackEmbeddingPolicy();
  const queryPlan = buildDepositorySearchQueryPlan({
    read: input.read,
    thresholds,
    embeddingPolicy,
    providerIds,
  });

  for (const provider of input.providers || []) {
    const matches = await provider.search({ read: input.read, assets });
    for (const match of matches || []) {
      const list = providerMatches.get(match.assetId) || [];
      list.push({
        ...match,
        providerId: match.providerId || provider.id,
        score: clamp01(match.score),
      });
      providerMatches.set(match.assetId, list);
    }
  }

  const ranked = assets
    .map((asset) => rankAsset(input.read, asset, providerMatches.get(asset.assetId) || [], thresholds))
    .sort(
      (left, right) =>
        right.ranking.finalScore - left.ranking.finalScore ||
        right.ranking.semanticScore - left.ranking.semanticScore ||
        left.assetId.localeCompare(right.assetId)
    );

  const selected = ranked
    .filter(
      (candidate) =>
        !candidate.verification.blockers.length &&
        candidate.ranking.finalScore >= thresholds.reviewScore &&
        candidate.ranking.semanticScore >= thresholds.semanticScore
    )
    .slice(0, thresholds.maxSelectedCandidates);
  const blocked = ranked.filter(
    (candidate) =>
      candidate.verification.blockers.length &&
      candidate.ranking.semanticScore >= thresholds.semanticScore
  );
  const rejected = ranked.filter((candidate) => !selected.includes(candidate) && !blocked.includes(candidate));
  const state = resultStateFor({
    read: input.read,
    candidates: ranked,
    selected,
    blocked,
    assets,
    thresholds,
  });
  const createdAt = input.createdAt || new Date().toISOString();
  const queryRoot = `sha256:${sha256(stableStringify({ read: input.read, thresholds, embeddingPolicy, queryPlan }))}`;
  const rankingRoot = `sha256:${sha256(stableStringify(ranked.map((candidate) => ({
    assetId: candidate.assetId,
    ranking: candidate.ranking,
    blockers: candidate.verification.blockers,
    warnings: candidate.verification.warnings,
    useTier: candidate.useTier,
  }))))}`;
  const selectedFitProvenanceRoot = selectedFitProvenanceRootFor({
    selected,
    blocked,
    rejected,
  });
  const searchReceipt = buildReadFitsFindingSynthesisSearchReceipt({
    thresholds,
    queryPlan,
    queryRoot,
    rankingRoot,
    searchedAssetCount: assets.length,
    ranked,
    selected,
    fitDeposits: selected,
    blocked,
    rejected,
    selectedFitProvenanceRoot,
    embeddingPolicy,
  });

  return {
    schema: 'bitcode.asset-pack.depository-search',
    resultState: state.resultState,
    resultReasons: state.resultReasons,
    read: input.read,
    thresholds,
    queryPlan,
    searchedAssetCount: assets.length,
    fitDepositAssetIds: selected.map((candidate) => candidate.assetId),
    fitDeposits: selected,
    selectedCandidateAssetIds: selected.map((candidate) => candidate.assetId),
    selectedCandidates: selected,
    rejectedCandidates: rejected,
    blockedCandidates: blocked,
    candidateRanking: ranked,
    embeddingPolicy,
    depositorySupplyIndex: input.depositorySupplyIndex,
    queryRoot,
    rankingRoot,
    searchReceipt,
    createdAt,
  };
}

function storeDepositorySearchToolResult(
  execution: { store?: (namespace: string, key: string, value: unknown) => void } | undefined,
  input: {
    read: DepositorySearchRead;
    assets: DepositoryAsset[];
    result: DepositorySearchResult;
    providerIds: string[];
  }
): void {
  if (!execution?.store) return;
  const { read, assets, result, providerIds } = input;
  const toolInput = {
    read: {
      id: read.id || null,
      repositoryFullName: read.repositoryFullName || null,
      sourceBranch: read.sourceBranch || null,
      sourceCommit: read.sourceCommit || null,
      targetArtifactKinds: read.targetArtifactKinds,
      closureCriteriaCount: read.closureCriteria.length,
      failureModeCount: read.failureModes.length,
    },
    assetCount: assets.length,
    providerIds,
  };
  const toolOutput = {
    schema: result.schema,
    resultState: result.resultState,
    resultReasons: result.resultReasons,
    searchedAssetCount: result.searchedAssetCount,
    fitDepositAssetIds: result.fitDepositAssetIds,
    fitDepositCount: result.fitDeposits.length,
    selectedCandidateAssetIds: result.selectedCandidateAssetIds,
    selectedCandidateCount: result.selectedCandidates.length,
    blockedCandidateCount: result.blockedCandidates.length,
    rejectedCandidateCount: result.rejectedCandidates.length,
    queryRoot: result.queryRoot,
    rankingRoot: result.rankingRoot,
    queryPlanRoot: result.queryPlan.queryPlanRoot,
    selectedFitProvenanceRoot: result.searchReceipt.selectedFitProvenanceRoot,
    embeddingPolicy: result.embeddingPolicy,
  };
  const lexicalTelemetry = {
    tool: READ_FITS_FINDING_SYNTHESIS_TOOL_IDS.lexicalDepositorySearch,
    ok: true,
    input: toolInput,
    output: toolOutput,
    phase: 'ReadFitsFindingSynthesis.discovery',
    agent: 'ReadFitsFindingSynthesis.discovery.finding-fits',
    step: 'ReadFitsFindingSynthesis.discovery.finding-fits.try',
    generation: 'tools_execution',
  };
  const vectorTelemetry = {
    tool: READ_FITS_FINDING_SYNTHESIS_TOOL_IDS.vectorDepositorySearch,
    ok: true,
    input: toolInput,
    output: {
      resultState: 'embedding_policy_declared',
      selectedCandidateAssetIds: result.selectedCandidateAssetIds,
      fitDepositAssetIds: result.fitDepositAssetIds,
      queryRoot: result.queryRoot,
      rankingRoot: result.rankingRoot,
      queryPlanRoot: result.queryPlan.queryPlanRoot,
      selectedFitProvenanceRoot: result.searchReceipt.selectedFitProvenanceRoot,
      embeddingPolicy: result.embeddingPolicy,
      vectorStore: result.embeddingPolicy.vectorStore,
    },
    phase: 'ReadFitsFindingSynthesis.discovery',
    agent: 'ReadFitsFindingSynthesis.discovery.finding-fits',
    step: 'ReadFitsFindingSynthesis.discovery.finding-fits.try',
    generation: 'tools_execution',
  };

  execution.store('tools', 'result', lexicalTelemetry);
  execution.store('tools', 'lexical-depository-search', lexicalTelemetry);
  execution.store('tools', 'vector-depository-search', vectorTelemetry);
  execution.store('depository/search', 'toolTelemetry', [lexicalTelemetry, vectorTelemetry]);
}

function buildBlockedReadFitsFindingResult(input: {
  read: DepositorySearchRead;
  assets: DepositoryAsset[];
  blockers: string[];
  depositorySupplyIndex?: DepositorySupplyIndex;
}): DepositorySearchResult {
  const embeddingPolicy = buildAssetPackEmbeddingPolicy();
  const createdAt = new Date().toISOString();
  const thresholds = { ...DEFAULT_THRESHOLDS };
  const queryPlan = buildDepositorySearchQueryPlan({
    read: input.read,
    thresholds,
    embeddingPolicy,
    providerIds: ['lexical-depository-search'],
  });
  const queryRoot = `sha256:${sha256(stableStringify({
    read: input.read,
    thresholds,
    embeddingPolicy,
    queryPlan,
    blockers: input.blockers,
  }))}`;
  const rankingRoot = `sha256:${sha256(stableStringify({
    blockedBeforeRanking: true,
    blockers: input.blockers,
    assetCount: input.assets.length,
  }))}`;
  const selectedFitProvenanceRoot = selectedFitProvenanceRootFor({
    selected: [],
    blocked: [],
    rejected: [],
  });
  const searchReceipt = buildReadFitsFindingSynthesisSearchReceipt({
    thresholds,
    queryPlan,
    queryRoot,
    rankingRoot,
    searchedAssetCount: input.assets.length,
    ranked: [],
    selected: [],
    fitDeposits: [],
    blocked: [],
    rejected: [],
    selectedFitProvenanceRoot,
    embeddingPolicy,
  });

  return {
    schema: 'bitcode.asset-pack.depository-search',
    resultState: 'blocked_readiness',
    resultReasons: [
      'Finding Fits search requires an accepted Read-Need before depository discovery.',
      ...input.blockers,
    ],
    read: input.read,
    thresholds,
    queryPlan,
    searchedAssetCount: input.assets.length,
    fitDepositAssetIds: [],
    fitDeposits: [],
    selectedCandidateAssetIds: [],
    selectedCandidates: [],
    rejectedCandidates: [],
    blockedCandidates: [],
    candidateRanking: [],
    embeddingPolicy,
    depositorySupplyIndex: input.depositorySupplyIndex,
    queryRoot,
    rankingRoot,
    searchReceipt,
    createdAt,
  };
}

export async function runDepositorySearchForPipelineInput(
  input: unknown,
  execution?: { store?: (namespace: string, key: string, value: unknown) => void; parent?: unknown }
): Promise<DepositorySearchResult> {
  const admission = admitReadFitsFinding(input);
  const read = normalizeDepositorySearchRead(input);
  const sourceInput = recordValue(input) || {};
  const suppliedSupplyIndex = recordValue(sourceInput.depositorySupplyIndex) || recordValue(sourceInput.depositorySupply);
  const depositorySupplyIndex = suppliedSupplyIndex
    ? (suppliedSupplyIndex as unknown as DepositorySupplyIndex)
    : buildDepositorySupplyIndex({
        deposits: [
          ...((Array.isArray(sourceInput.depositoryAssets) ? sourceInput.depositoryAssets : []) as unknown[]),
          ...((Array.isArray(sourceInput.depositCandidates) ? sourceInput.depositCandidates : []) as unknown[]),
          ...((Array.isArray(sourceInput.candidateAssets) ? sourceInput.candidateAssets : []) as unknown[]),
          ...(recordValue(sourceInput.deposit) ? [sourceInput.deposit] : []),
        ],
        sourceRevision: sourceInput.sourceRevision,
        createdAt: new Date(0).toISOString(),
      });
  const assets = normalizePipelineDepositoryAssets({
    ...(sourceInput as Record<string, unknown>),
    depositorySupplyIndex,
  });
  const providers = [createLexicalDepositorySearchProvider()];
  const result = admission.admitted
    ? await searchDepositoryAssetSpace({
        read,
        assets,
        depositorySupplyIndex,
        providers,
      })
    : buildBlockedReadFitsFindingResult({
        read,
        assets,
        blockers: admission.blockers,
        depositorySupplyIndex,
      });

  const fitResult = buildDepositoryFitResultEvidence(result);
  const storeEvidence = (target?: { store?: (namespace: string, key: string, value: unknown) => void }) => {
    if (!target?.store) return;
    if (admission.acceptedNeed) {
      target.store('read/need', 'accepted', admission.acceptedNeed);
      target.store('read/need', 'measurementRoot', admission.acceptedNeed.measurementRoot);
      target.store('read/need', 'needId', admission.acceptedNeed.needId);
    }
    target.store('read/finding-fits', 'admission', admission);
    target.store('depository/search', 'result', result);
    target.store('depository/search', 'candidateRanking', result.candidateRanking);
    target.store('depository/search', 'selectedCandidates', result.selectedCandidates);
    target.store('depository/search', 'selectionTrace', fitResult.selectionTrace);
    target.store('depository/search', 'embeddingPolicy', result.embeddingPolicy);
    if (result.depositorySupplyIndex) {
      target.store('depository/supply', 'index', result.depositorySupplyIndex);
      target.store('depository/supply', 'indexRoot', result.depositorySupplyIndex.roots.indexRoot);
      target.store('depository/supply', 'recordCount', result.depositorySupplyIndex.recordCount);
      target.store('depository/supply', 'searchableRecordCount', result.depositorySupplyIndex.searchableRecordCount);
    }
    target.store('depository/search', 'queryPlan', result.queryPlan);
    target.store('depository/search', 'queryPlanRoot', result.queryPlan.queryPlanRoot);
    target.store('depository/search', 'searchReceipt', result.searchReceipt);
    target.store('depository/search', 'selectedFitProvenanceRoot', result.searchReceipt.selectedFitProvenanceRoot);
    target.store('fit', 'result', fitResult);
    target.store('fit', 'resultState', result.resultState);
    target.store('fit', 'resultReasons', result.resultReasons);
    target.store('fit', 'candidateRanking', result.candidateRanking);
    target.store('fit', 'selectionTrace', fitResult.selectionTrace);
  };

  if (execution?.store) {
    storeEvidence(execution);
    storeEvidence(execution.parent as { store?: (namespace: string, key: string, value: unknown) => void });
    const toolEvidence = {
      read,
      assets,
      result,
      providerIds: providers.map((provider) => provider.id),
    };
    storeDepositorySearchToolResult(execution, toolEvidence);
    storeDepositorySearchToolResult(
      execution.parent as { store?: (namespace: string, key: string, value: unknown) => void },
      toolEvidence
    );
  }

  return result;
}
