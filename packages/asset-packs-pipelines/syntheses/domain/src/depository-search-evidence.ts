/**
 * Depository-search fit evidence, query-plan, and search-receipt builders.
 * Source-safe summarization of ranked candidates for pipeline store/readback.
 */
import { buildAssetPackEmbeddingPolicy } from './embedding-config';
import {
  READ_FITS_FINDING_SYNTHESIS,
  READ_FITS_FINDING_SYNTHESIS_CONTRACT,
  listReadingPipelineTelemetryTrace,
} from '../../read/src/reading-pipeline-contract';
import {
  measurementRootFor,
  proofRootFor,
  reconciliationReadbackRootFor,
  sha256,
  stableStringify,
  tokensFrom,
} from './depository-search-scoring';
import {
  READ_FITS_FINDING_SYNTHESIS_SEARCH_CHANNEL_IDS,
  READ_FITS_FINDING_SYNTHESIS_SEARCH_CHANNELS,
  type DepositoryCandidate,
  type DepositoryCandidateFitEvidence,
  type DepositoryFitResultEvidence,
  type DepositorySearchQueryPlan,
  type DepositorySearchRead,
  type DepositorySearchResult,
  type DepositorySearchThresholds,
  type ReadFitsFindingSynthesisSearchReceipt,
} from './depository-search-types';

export function summarizeDepositoryCandidateForFitEvidence(
  candidate: DepositoryCandidate
): DepositoryCandidateFitEvidence {
  const providerIds = [
    ...new Set(
      candidate.recall.providerMatches
        .map((match) => match.providerId || match.channelId)
        .filter((providerId): providerId is string => Boolean(providerId))
    ),
  ].sort();

  return {
    assetId: candidate.assetId,
    title: candidate.title,
    artifactKind: candidate.asset.artifactKind,
    useTier: candidate.useTier,
    sourceBinding: {
      repositoryFullName: candidate.asset.repositoryFullName || null,
      sourceBranch: candidate.asset.sourceBranch || null,
      sourceCommit: candidate.asset.sourceCommit || null,
      contentRoot: candidate.asset.contentRoot || null,
    },
    selectedUnits: candidate.selectedUnits.map((unit) => ({
      unitId: unit.unitId,
      unitKind: unit.unitKind,
      path: unit.path || null,
      unitHash: unit.unitHash || null,
    })),
    scores: {
      finalScore: candidate.ranking.finalScore,
      semanticScore: candidate.ranking.semanticScore,
      textScore: candidate.ranking.textScore,
      unitScore: candidate.ranking.unitScore,
      repositoryScore: candidate.ranking.repositoryScore,
      revisionScore: candidate.ranking.revisionScore,
      artifactKindScore: candidate.ranking.artifactKindScore,
      proofScore: candidate.ranking.proofScore,
      measurementScore: candidate.ranking.measurementScore,
      providerScore: candidate.ranking.providerScore,
      penaltyMass: candidate.ranking.penaltyMass,
    },
    verification: candidate.verification,
    recall: {
      matchedTerms: candidate.recall.matchedTerms,
      matchedTargetKinds: candidate.ranking.explainability.matchedTargetKinds,
      matchedUnitIds: candidate.recall.matchedUnitIds,
      providerMatchCount: candidate.recall.providerMatches.length,
      providerIds,
    },
    proofEvidence: {
      hasWalletOrAttestationProof: candidate.verification.hasWalletOrAttestationProof,
      attestationCount: candidate.asset.attestations?.length || 0,
      signingSurfacePresent: Boolean(candidate.asset.signingSurface),
      identitySurfacePresent: Boolean(candidate.asset.identitySurface),
      githubBoundaryPresent: Boolean(candidate.asset.githubBoundary),
      githubAppAuthSurfacePresent: Boolean(candidate.asset.githubAppAuthSurface),
      proofRoot: proofRootFor(candidate.asset),
    },
    measurementEvidence: {
      hasAssetMeasurementEvidence: candidate.verification.hasAssetMeasurementEvidence,
      assetMeasurementPresent: Boolean(candidate.asset.assetMeasurement),
      measurementProvenanceCount: candidate.asset.measurementProvenance?.length || 0,
      measurementRoot: measurementRootFor(candidate.asset),
    },
    readbackEvidence: {
      proofRootRequired: candidate.verification.proofRootRequired,
      proofRootPresent: candidate.verification.proofRootPresent,
      reconciliationReadbackRequired: candidate.verification.reconciliationReadbackRequired,
      reconciliationReadbackPresent: candidate.verification.reconciliationReadbackPresent,
      reconciliationReadbackRoot: reconciliationReadbackRootFor(candidate.asset),
    },
    rejectionReasons: candidate.rejectionReasons,
  };
}

export function buildDepositoryFitResultEvidence(
  result: DepositorySearchResult
): DepositoryFitResultEvidence {
  return {
    schema: 'bitcode.asset-pack.fit-result',
    resultState: result.resultState,
    resultReasons: result.resultReasons,
    fitDepositAssetIds: result.fitDepositAssetIds,
    selectedCandidateAssetIds: result.selectedCandidateAssetIds,
    queryRoot: result.queryRoot,
    rankingRoot: result.rankingRoot,
    searchedAssetCount: result.searchedAssetCount,
    embeddingPolicy: result.embeddingPolicy,
    ...(result.depositorySupplyIndex ? { depositorySupplyIndexRoot: result.depositorySupplyIndex.roots.indexRoot } : {}),
    selectionTrace: {
      selectedCandidates: result.selectedCandidates.map(summarizeDepositoryCandidateForFitEvidence),
      fitDeposits: result.fitDeposits.map(summarizeDepositoryCandidateForFitEvidence),
      blockedCandidates: result.blockedCandidates.map(summarizeDepositoryCandidateForFitEvidence),
      candidateRanking: result.candidateRanking.map(summarizeDepositoryCandidateForFitEvidence),
      rejectedCandidateCount: result.rejectedCandidates.length,
    },
  };
}

export function buildDepositorySearchQueryPlan(input: {
  read: DepositorySearchRead;
  thresholds: DepositorySearchThresholds;
  embeddingPolicy: ReturnType<typeof buildAssetPackEmbeddingPolicy>;
  providerIds: string[];
}): DepositorySearchQueryPlan {
  const queryTermCount = tokensFrom([
    input.read.prompt,
    ...input.read.targetArtifactKinds,
    ...input.read.closureCriteria,
    ...input.read.failureModes,
  ].join(' ')).length;
  const queryPlanRoot = `sha256:${sha256(stableStringify({
    pipelineName: READ_FITS_FINDING_SYNTHESIS,
    channelIds: READ_FITS_FINDING_SYNTHESIS_SEARCH_CHANNEL_IDS,
    queryTermCount,
    targetArtifactKindCount: input.read.targetArtifactKinds.length,
    closureCriteriaCount: input.read.closureCriteria.length,
    failureModeCount: input.read.failureModes.length,
    repositoryConstraintPresent: Boolean(input.read.repositoryFullName),
    sourceRevisionConstraintPresent: Boolean(input.read.sourceBranch || input.read.sourceCommit),
    providerIds: input.providerIds,
    thresholds: input.thresholds,
    embeddingPolicy: input.embeddingPolicy,
  }))}`;

  return {
    schema: 'bitcode.asset-pack.depository-search.query-plan',
    pipelineName: READ_FITS_FINDING_SYNTHESIS,
    derivedFrom: 'accepted-read-need',
    channelIds: [...READ_FITS_FINDING_SYNTHESIS_SEARCH_CHANNEL_IDS],
    channels: READ_FITS_FINDING_SYNTHESIS_SEARCH_CHANNELS.map((channel) => ({ ...channel })),
    queryTermCount,
    targetArtifactKindCount: input.read.targetArtifactKinds.length,
    closureCriteriaCount: input.read.closureCriteria.length,
    failureModeCount: input.read.failureModes.length,
    repositoryConstraintPresent: Boolean(input.read.repositoryFullName),
    sourceRevisionConstraintPresent: Boolean(input.read.sourceBranch || input.read.sourceCommit),
    providerIds: [...input.providerIds].sort(),
    embeddingPolicy: input.embeddingPolicy,
    queryPlanRoot,
  };
}

export function selectedFitProvenanceRootFor(input: {
  selected: DepositoryCandidate[];
  blocked: DepositoryCandidate[];
  rejected: DepositoryCandidate[];
}): string {
  return `sha256:${sha256(stableStringify({
    selected: input.selected.map((candidate) => ({
      assetId: candidate.assetId,
      useTier: candidate.useTier,
      sourceBinding: {
        repositoryFullName: candidate.asset.repositoryFullName || null,
        sourceBranch: candidate.asset.sourceBranch || null,
        sourceCommit: candidate.asset.sourceCommit || null,
        contentRoot: candidate.asset.contentRoot || null,
      },
      selectedUnitIds: candidate.selectedUnits.map((unit) => unit.unitId),
      finalScore: candidate.ranking.finalScore,
      semanticScore: candidate.ranking.semanticScore,
      proofRoot: proofRootFor(candidate.asset),
      measurementRoot: measurementRootFor(candidate.asset),
      reconciliationReadbackRoot: reconciliationReadbackRootFor(candidate.asset),
    })),
    blockedAssetIds: input.blocked.map((candidate) => candidate.assetId),
    rejectedAssetIds: input.rejected.map((candidate) => candidate.assetId),
  }))}`;
}

export function buildReadFitsFindingSynthesisSearchReceipt(input: {
  thresholds: DepositorySearchThresholds;
  queryPlan: DepositorySearchQueryPlan;
  queryRoot: string;
  rankingRoot: string;
  searchedAssetCount: number;
  ranked: DepositoryCandidate[];
  selected: DepositoryCandidate[];
  fitDeposits: DepositoryCandidate[];
  blocked: DepositoryCandidate[];
  rejected: DepositoryCandidate[];
  selectedFitProvenanceRoot: string;
  embeddingPolicy: ReturnType<typeof buildAssetPackEmbeddingPolicy>;
}): ReadFitsFindingSynthesisSearchReceipt {
  const trace = listReadingPipelineTelemetryTrace(READ_FITS_FINDING_SYNTHESIS_CONTRACT);
  const phaseIds = READ_FITS_FINDING_SYNTHESIS_CONTRACT.phases.map((phase) => phase.phaseId);
  const agentIds = READ_FITS_FINDING_SYNTHESIS_CONTRACT.phases.flatMap((phase) =>
    phase.agents.map((agent) => agent.agentId)
  );
  const ptrrStepIds = trace.map((entry) => entry.ptrrStepId);
  const thinkingsGenerationIds = trace.flatMap((entry) => entry.thinkingsGenerationIds);
  const toolIds = [...new Set(trace.flatMap((entry) => entry.toolIds))];
  const receiptRoot = `sha256:${sha256(stableStringify({
    pipelineName: READ_FITS_FINDING_SYNTHESIS,
    phaseIds,
    agentIds,
    ptrrStepIds,
    thinkingsGenerationIds,
    toolIds,
    searchChannelIds: input.queryPlan.channelIds,
    providerIds: input.queryPlan.providerIds,
    thresholds: input.thresholds,
    queryPlanRoot: input.queryPlan.queryPlanRoot,
    queryRoot: input.queryRoot,
    rankingRoot: input.rankingRoot,
    searchedAssetCount: input.searchedAssetCount,
    candidateCounts: {
      ranked: input.ranked.length,
      selected: input.selected.length,
      fitDeposits: input.fitDeposits.length,
      blocked: input.blocked.length,
      rejected: input.rejected.length,
    },
    selectedFitProvenanceRoot: input.selectedFitProvenanceRoot,
    embeddingPolicy: input.embeddingPolicy,
  }))}`;

  return {
    schema: 'bitcode.read-fits-finding-synthesis.search-receipt',
    pipelineName: READ_FITS_FINDING_SYNTHESIS,
    receiptMode: 'source-safe-depository-search-and-embeddings',
    phaseIds,
    agentIds,
    ptrrStepIds,
    failsafeSequenceIds: [...thinkingsGenerationIds],
    thinkingsGenerationIds,
    toolIds,
    searchChannelIds: [...input.queryPlan.channelIds],
    providerIds: [...input.queryPlan.providerIds],
    thresholdPosture: input.thresholds,
    queryPlanRoot: input.queryPlan.queryPlanRoot,
    queryRoot: input.queryRoot,
    rankingRoot: input.rankingRoot,
    searchedAssetCount: input.searchedAssetCount,
    candidateCounts: {
      ranked: input.ranked.length,
      selected: input.selected.length,
      fitDeposits: input.fitDeposits.length,
      blocked: input.blocked.length,
      rejected: input.rejected.length,
    },
    selectedFitProvenanceRoot: input.selectedFitProvenanceRoot,
    embeddingPolicy: input.embeddingPolicy,
    sourceSafety: {
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawProviderResponseVisible: false,
      unpaidAssetPackSourceVisible: false,
      credentialsSerialized: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
    },
    roots: {
      receiptRoot,
      queryPlanRoot: input.queryPlan.queryPlanRoot,
      queryRoot: input.queryRoot,
      rankingRoot: input.rankingRoot,
      selectedFitProvenanceRoot: input.selectedFitProvenanceRoot,
    },
  };
}
