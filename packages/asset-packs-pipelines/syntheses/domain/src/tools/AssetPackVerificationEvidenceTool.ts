import { executionContext } from '@bitcode/generic-tools-editing/execution-context';
import { Tool } from '@bitcode/tools-generics';
import {
  runDepositorySearchForPipelineInput,
  type DepositoryCandidate,
  type DepositorySearchResult,
} from '../depository-search';

type VerificationEvidenceInput = Record<string, unknown> | undefined;

const ASSET_PACK_VERIFICATION_DOC_CODE_TOOL_PROMPT = {
  format() {
    return [
      'Tool: bitcode.asset-pack.verification',
      'Purpose: read back source, proof, measurement, and fit-readiness evidence for the current AssetPack Read/Fit pipeline run.',
      'Inputs: optional read, repositoryFullName, sourceBranch, sourceCommit, queryTerms, assets, or depositoryAssets.',
      'Output: verification-only evidence summary, fit deposit blockers, proof/measurement/readback readiness, query root, ranking root, and fit deposit ids.',
      'Use during risk admission or readiness review when an agent needs evidence without mutating state, delivering assets, or exposing private AssetPack source.',
    ].join('\n');
  },
};

function unique(values: unknown[]): string[] {
  return [
    ...new Set(
      values
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => String(value || '').trim())
        .filter(Boolean),
    ),
  ].sort();
}

function readStoredSearch(execution: any): DepositorySearchResult | null {
  return (
    execution?.findUp?.('depository/search', 'result') ||
    execution?.get?.('depository/search', 'result') ||
    execution?.findUp?.('pipeline', 'input')?.depositorySearchResult ||
    execution?.get?.('pipeline', 'input')?.depositorySearchResult ||
    null
  );
}

function readPipelineInput(execution: any): Record<string, unknown> {
  return (
    execution?.findUp?.('pipeline', 'input') ||
    execution?.get?.('pipeline', 'input') ||
    {}
  );
}

function summarizeCandidate(candidate: DepositoryCandidate): Record<string, unknown> {
  const verification = (candidate.verification || {}) as Record<string, any>;
  return {
    assetId: candidate.assetId,
    title: candidate.title,
    useTier: candidate.useTier,
    sourceBinding: {
      repositoryFullName: candidate.asset?.repositoryFullName || null,
      sourceBranch: candidate.asset?.sourceBranch || null,
      sourceCommit: candidate.asset?.sourceCommit || null,
      contentRoot: candidate.asset?.contentRoot || null,
    },
    scores: {
      finalScore: candidate.ranking?.finalScore ?? null,
      semanticScore: candidate.ranking?.semanticScore ?? null,
      proofScore: candidate.ranking?.proofScore ?? null,
      measurementScore: candidate.ranking?.measurementScore ?? null,
      penaltyMass: candidate.ranking?.penaltyMass ?? null,
    },
    verification: {
      repositoryBound: Boolean(verification.repositoryBound),
      sourceRevisionBound: Boolean(verification.sourceRevisionBound),
      hasWalletOrAttestationProof: Boolean(verification.hasWalletOrAttestationProof),
      hasAssetMeasurementEvidence: Boolean(verification.hasAssetMeasurementEvidence),
      proofRootPresent: Boolean(verification.proofRootPresent),
      reconciliationReadbackPresent: Boolean(verification.reconciliationReadbackPresent),
      blockers: verification.blockers || [],
      warnings: verification.warnings || [],
    },
    recall: {
      matchedTerms: candidate.recall?.matchedTerms || [],
      matchedUnitIds: candidate.recall?.matchedUnitIds || [],
      providerMatchCount: candidate.recall?.providerMatches?.length || 0,
    },
  };
}

function summarizeVerification(result: DepositorySearchResult): Record<string, unknown> {
  const fitDepositSource: DepositoryCandidate[] = Array.isArray((result as any).fitDeposits)
    ? (result as any).fitDeposits as DepositoryCandidate[]
    : result.selectedCandidates || [];
  const blockedCandidateSource: DepositoryCandidate[] = result.blockedCandidates || [];
  const rankingSource: DepositoryCandidate[] = result.candidateRanking || fitDepositSource;
  const fitDeposits = fitDepositSource.map(summarizeCandidate);
  const blockedCandidates = blockedCandidateSource.map(summarizeCandidate);
  const fitDepositRanking = rankingSource.slice(0, 10).map(summarizeCandidate);
  const fitDepositVerification = fitDepositSource.map((deposit: DepositoryCandidate) => deposit.verification);
  const allVerification = [
    ...fitDepositSource,
    ...blockedCandidateSource,
    ...(result.rejectedCandidates || []),
  ].map((deposit: DepositoryCandidate) => deposit.verification);

  return {
    schema: 'bitcode.asset-pack.verification-evidence-tool-result',
    resultState: result.resultState,
    resultReasons: result.resultReasons,
    searchedAssetCount: result.searchedAssetCount,
    fitDepositAssetIds: result.fitDepositAssetIds || result.selectedCandidateAssetIds || [],
    selectedCandidateAssetIds: result.selectedCandidateAssetIds,
    queryRoot: result.queryRoot,
    rankingRoot: result.rankingRoot,
    embeddingPolicy: result.embeddingPolicy,
    readiness: {
      fitDepositCount: fitDepositSource.length,
      selectedCandidateCount: (result.selectedCandidates || fitDepositSource).length,
      blockedFitDepositCount: blockedCandidateSource.length,
      settlementEligibleFitDepositCount: fitDepositSource.filter(
        (deposit) => deposit.useTier === 'settlement-eligible',
      ).length,
      sourceBoundFitDepositCount: fitDepositSource.filter(
        (deposit) => deposit.verification?.repositoryBound && deposit.verification?.sourceRevisionBound,
      ).length,
      proofReadyFitDepositCount: fitDepositSource.filter(
        (deposit) => deposit.verification?.hasWalletOrAttestationProof && deposit.verification?.proofRootPresent,
      ).length,
      measurementReadyFitDepositCount: fitDepositSource.filter(
        (deposit) => deposit.verification?.hasAssetMeasurementEvidence,
      ).length,
      readbackReadyFitDepositCount: fitDepositSource.filter(
        (deposit) =>
          !deposit.verification?.reconciliationReadbackRequired ||
          deposit.verification?.reconciliationReadbackPresent,
      ).length,
      settlementEligibleCandidateCount: fitDepositSource.filter(
        (deposit) => deposit.useTier === 'settlement-eligible',
      ).length,
      sourceBoundCandidateCount: fitDepositSource.filter(
        (deposit) => deposit.verification?.repositoryBound && deposit.verification?.sourceRevisionBound,
      ).length,
      proofReadyCandidateCount: fitDepositSource.filter(
        (deposit) => deposit.verification?.hasWalletOrAttestationProof && deposit.verification?.proofRootPresent,
      ).length,
      measurementReadyCandidateCount: fitDepositSource.filter(
        (deposit) => deposit.verification?.hasAssetMeasurementEvidence,
      ).length,
      readbackReadyCandidateCount: fitDepositSource.filter(
        (deposit) =>
          !deposit.verification?.reconciliationReadbackRequired ||
          deposit.verification?.reconciliationReadbackPresent,
      ).length,
      selectedWarnings: unique(fitDepositVerification.map((verification) => verification?.warnings)),
      selectedBlockers: unique(fitDepositVerification.map((verification) => verification?.blockers)),
      fitDepositWarnings: unique(fitDepositVerification.map((verification) => verification?.warnings)),
      fitDepositBlockers: unique(fitDepositVerification.map((verification) => verification?.blockers)),
      allWarnings: unique(allVerification.map((verification) => verification?.warnings)),
      allBlockers: unique(allVerification.map((verification) => verification?.blockers)),
    },
    fitDeposits,
    selectedCandidates: fitDeposits,
    blockedCandidates,
    fitDepositRanking,
    candidateRanking: fitDepositRanking,
  };
}

/**
 * @doc-code-tool
 * @prompt ASSET_PACK_VERIFICATION_DOC_CODE_TOOL_PROMPT
 */
class AssetPackVerificationEvidenceTool extends Tool<
  (input?: VerificationEvidenceInput) => Promise<Record<string, unknown>>
> {
  name = 'bitcode.asset-pack.verification';

  use = async (input?: VerificationEvidenceInput) => {
    const execution = executionContext.getStore() as any;
    const stored = readStoredSearch(execution);
    const result = stored || await runDepositorySearchForPipelineInput({
      ...readPipelineInput(execution),
      ...(input || {}),
    }, execution);

    return {
      ...summarizeVerification(result),
      readbackSource: stored ? 'execution-store' : 'tool-rerun',
    };
  };
}

export const assetPackVerificationEvidenceTool = new AssetPackVerificationEvidenceTool();
(assetPackVerificationEvidenceTool as any).__docCodePrompt = ASSET_PACK_VERIFICATION_DOC_CODE_TOOL_PROMPT;
