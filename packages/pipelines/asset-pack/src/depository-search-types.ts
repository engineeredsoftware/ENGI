/**
 * Depository-search public types, channel constants, and default thresholds.
 * Shared contract surface for ranking, evidence, normalize, and run modules.
 */
import type { buildAssetPackEmbeddingPolicy } from './embedding-config';
import { READ_FITS_FINDING_SYNTHESIS } from './reading-pipeline-contract';
import type { DepositorySupplyIndex } from './depository-supply-index';

export type AssetPackFitResultState =
  | 'worthy_fit'
  | 'no_worthy_fit'
  | 'blocked_readiness';

export type DepositoryCandidateUseTier =
  | 'settlement-eligible'
  | 'patch-eligible'
  | 'context-only'
  | 'rank-only'
  | 'reject';

export interface DepositorySearchThresholds {
  reviewScore: number;
  worthyScore: number;
  semanticScore: number;
  maxSelectedCandidates: number;
}

export type DepositorySearchChannelId =
  | 'lexical'
  | 'symbolic'
  | 'path'
  | 'metadata'
  | 'measurement'
  | 'embedding-vector'
  | 'provider-specific';

export interface DepositorySearchQueryPlan {
  schema: 'bitcode.asset-pack.depository-search.query-plan';
  pipelineName: typeof READ_FITS_FINDING_SYNTHESIS;
  derivedFrom: 'accepted-read-need';
  channelIds: DepositorySearchChannelId[];
  channels: Array<{
    channelId: DepositorySearchChannelId;
    scoreField: string;
    sourceSafeEvidence: string;
  }>;
  queryTermCount: number;
  targetArtifactKindCount: number;
  closureCriteriaCount: number;
  failureModeCount: number;
  repositoryConstraintPresent: boolean;
  sourceRevisionConstraintPresent: boolean;
  providerIds: string[];
  embeddingPolicy: ReturnType<typeof buildAssetPackEmbeddingPolicy>;
  queryPlanRoot: string;
}

export interface DepositorySearchRead {
  id?: string | null;
  prompt: string;
  repositoryFullName?: string | null;
  sourceBranch?: string | null;
  sourceCommit?: string | null;
  targetArtifactKinds: string[];
  closureCriteria: string[];
  failureModes: string[];
}

export interface DepositoryContentUnit {
  unitId: string;
  unitKind: string;
  text: string;
  unitHash?: string | null;
  path?: string | null;
  codeAnalysisFacts?: {
    symbols?: string[];
    paths?: string[];
    configKeys?: string[];
    stackTags?: string[];
    constraints?: string[];
  } | null;
}

export interface DepositoryAsset {
  assetId: string;
  title: string;
  summary?: string | null;
  artifactKind: string;
  artifactType?: string | null;
  repositoryFullName?: string | null;
  sourceBranch?: string | null;
  sourceCommit?: string | null;
  contentRoot?: string | null;
  contentUnits: DepositoryContentUnit[];
  metadata?: Record<string, unknown> | null;
  provenanceBinding?: Record<string, unknown> | null;
  sourceMaterialBinding?: Record<string, unknown> | null;
  artifactSelectionSurface?: Record<string, unknown> | null;
  addressingSurface?: Record<string, unknown> | null;
  githubBoundary?: Record<string, unknown> | null;
  githubAppAuthSurface?: Record<string, unknown> | null;
  identitySurface?: Record<string, unknown> | null;
  signingSurface?: Record<string, unknown> | null;
  attestations?: unknown[];
  assetMeasurement?: unknown;
  measurementProvenance?: unknown[];
  verificationEvidence?: Record<string, unknown> | null;
  hasWalletOrAttestationProof?: boolean;
  hasAssetMeasurementEvidence?: boolean;
  createdAt?: string | null;
}

export interface DepositoryProviderMatch {
  providerId: string;
  channelId: string;
  assetId: string;
  unitIds?: string[];
  score: number;
  evidenceRefs?: string[];
  matchedValues?: string[];
}

export interface DepositorySearchProvider {
  id: string;
  search(input: {
    read: DepositorySearchRead;
    assets: DepositoryAsset[];
  }): Promise<DepositoryProviderMatch[]> | DepositoryProviderMatch[];
}

export interface DepositoryCandidateRanking {
  finalScore: number;
  semanticScore: number;
  textScore: number;
  unitScore: number;
  repositoryScore: number;
  revisionScore: number;
  artifactKindScore: number;
  proofScore: number;
  measurementScore: number;
  providerScore: number;
  penaltyMass: number;
  channelScores: Record<string, number>;
  explainability: {
    strongestScoreDrivers: Array<{ label: string; value: number }>;
    penaltiesApplied: string[];
    matchedTerms: string[];
    matchedTargetKinds: string[];
    providerMatches: DepositoryProviderMatch[];
  };
}

export interface DepositoryCandidate {
  assetId: string;
  title: string;
  asset: DepositoryAsset;
  selectedUnits: DepositoryContentUnit[];
  useTier: DepositoryCandidateUseTier;
  ranking: DepositoryCandidateRanking;
  verification: {
    repositoryBound: boolean;
    sourceRevisionBound: boolean;
    hasWalletOrAttestationProof: boolean;
    hasAssetMeasurementEvidence: boolean;
    proofRootRequired: boolean;
    proofRootPresent: boolean;
    reconciliationReadbackRequired: boolean;
    reconciliationReadbackPresent: boolean;
    blockers: string[];
    warnings: string[];
  };
  recall: {
    queryTerms: string[];
    matchedTerms: string[];
    matchedUnitIds: string[];
    providerMatches: DepositoryProviderMatch[];
  };
  rejectionReasons: string[];
}

export interface DepositoryCandidateFitEvidence {
  assetId: string;
  title: string;
  artifactKind: string;
  useTier: DepositoryCandidateUseTier;
  sourceBinding: {
    repositoryFullName: string | null;
    sourceBranch: string | null;
    sourceCommit: string | null;
    contentRoot: string | null;
  };
  selectedUnits: Array<{
    unitId: string;
    unitKind: string;
    path: string | null;
    unitHash: string | null;
  }>;
  scores: Pick<
    DepositoryCandidateRanking,
    | 'finalScore'
    | 'semanticScore'
    | 'textScore'
    | 'unitScore'
    | 'repositoryScore'
    | 'revisionScore'
    | 'artifactKindScore'
    | 'proofScore'
    | 'measurementScore'
    | 'providerScore'
    | 'penaltyMass'
  >;
  verification: DepositoryCandidate['verification'];
  recall: {
    matchedTerms: string[];
    matchedTargetKinds: string[];
    matchedUnitIds: string[];
    providerMatchCount: number;
    providerIds: string[];
  };
  proofEvidence: {
    hasWalletOrAttestationProof: boolean;
    attestationCount: number;
    signingSurfacePresent: boolean;
    identitySurfacePresent: boolean;
    githubBoundaryPresent: boolean;
    githubAppAuthSurfacePresent: boolean;
    proofRoot: string | null;
  };
  measurementEvidence: {
    hasAssetMeasurementEvidence: boolean;
    assetMeasurementPresent: boolean;
    measurementProvenanceCount: number;
    measurementRoot: string | null;
  };
  readbackEvidence: {
    proofRootRequired: boolean;
    proofRootPresent: boolean;
    reconciliationReadbackRequired: boolean;
    reconciliationReadbackPresent: boolean;
    reconciliationReadbackRoot: string | null;
  };
  rejectionReasons: string[];
}

export interface DepositorySearchResult {
  schema: 'bitcode.asset-pack.depository-search';
  resultState: AssetPackFitResultState;
  resultReasons: string[];
  read: DepositorySearchRead;
  thresholds: DepositorySearchThresholds;
  queryPlan: DepositorySearchQueryPlan;
  searchedAssetCount: number;
  fitDepositAssetIds: string[];
  fitDeposits: DepositoryCandidate[];
  selectedCandidateAssetIds: string[];
  selectedCandidates: DepositoryCandidate[];
  rejectedCandidates: DepositoryCandidate[];
  blockedCandidates: DepositoryCandidate[];
  candidateRanking: DepositoryCandidate[];
  embeddingPolicy: ReturnType<typeof buildAssetPackEmbeddingPolicy>;
  depositorySupplyIndex?: DepositorySupplyIndex;
  queryRoot: string;
  rankingRoot: string;
  searchReceipt: ReadFitsFindingSynthesisSearchReceipt;
  createdAt: string;
}

export type DepositoryFitsResult = DepositorySearchResult;

export interface DepositoryFitResultEvidence {
  schema: 'bitcode.asset-pack.fit-result';
  resultState: AssetPackFitResultState;
  resultReasons: string[];
  fitDepositAssetIds: string[];
  selectedCandidateAssetIds: string[];
  queryRoot: string;
  rankingRoot: string;
  searchedAssetCount: number;
  embeddingPolicy: ReturnType<typeof buildAssetPackEmbeddingPolicy>;
  selectionTrace: {
    selectedCandidates: DepositoryCandidateFitEvidence[];
    fitDeposits: DepositoryCandidateFitEvidence[];
    blockedCandidates: DepositoryCandidateFitEvidence[];
    candidateRanking: DepositoryCandidateFitEvidence[];
    rejectedCandidateCount: number;
  };
}

export interface DepositorySearchInput {
  read: DepositorySearchRead;
  assets: DepositoryAsset[];
  depositorySupplyIndex?: DepositorySupplyIndex;
  providers?: DepositorySearchProvider[];
  thresholds?: Partial<DepositorySearchThresholds>;
  createdAt?: string;
}

export interface ReadFitsFindingSynthesisSearchReceipt {
  schema: 'bitcode.read-fits-finding-synthesis.search-receipt';
  pipelineName: typeof READ_FITS_FINDING_SYNTHESIS;
  receiptMode: 'source-safe-depository-search-and-embeddings';
  phaseIds: string[];
  agentIds: string[];
  ptrrStepIds: string[];
  failsafeSequenceIds: string[];
  thinkingsGenerationIds: string[];
  toolIds: string[];
  searchChannelIds: DepositorySearchChannelId[];
  providerIds: string[];
  thresholdPosture: DepositorySearchThresholds;
  queryPlanRoot: string;
  queryRoot: string;
  rankingRoot: string;
  searchedAssetCount: number;
  candidateCounts: {
    ranked: number;
    selected: number;
    fitDeposits: number;
    blocked: number;
    rejected: number;
  };
  selectedFitProvenanceRoot: string;
  embeddingPolicy: ReturnType<typeof buildAssetPackEmbeddingPolicy>;
  sourceSafety: {
    sourceSafeMetadataOnly: true;
    protectedSourceVisible: false;
    rawProviderResponseVisible: false;
    unpaidAssetPackSourceVisible: false;
    credentialsSerialized: false;
    walletPrivateMaterialVisible: false;
    settlementPrivatePayloadVisible: false;
  };
  roots: {
    receiptRoot: string;
    queryPlanRoot: string;
    queryRoot: string;
    rankingRoot: string;
    selectedFitProvenanceRoot: string;
  };
}

/** Default ranking floors shared by search scoring and blocked-result builders. */
export const DEFAULT_THRESHOLDS: DepositorySearchThresholds = {
  reviewScore: 0.44,
  worthyScore: 0.62,
  semanticScore: 0.18,
  maxSelectedCandidates: 12,
};

export const READ_FITS_FINDING_SYNTHESIS_TOOL_IDS = {
  lexicalDepositorySearch: 'ReadFitsFindingSynthesis.tool.lexical-depository-search',
  vectorDepositorySearch: 'ReadFitsFindingSynthesis.tool.vector-depository-search',
} as const;

export const READ_FITS_FINDING_SYNTHESIS_SEARCH_CHANNEL_IDS: DepositorySearchChannelId[] = [
  'lexical',
  'symbolic',
  'path',
  'metadata',
  'measurement',
  'embedding-vector',
  'provider-specific',
];

/** Channel descriptors used when materializing a query plan. */
export const READ_FITS_FINDING_SYNTHESIS_SEARCH_CHANNELS: DepositorySearchQueryPlan['channels'] = [
  {
    channelId: 'lexical',
    scoreField: 'channelScores.lexical',
    sourceSafeEvidence: 'overlap between Need query terms and source-safe asset corpus terms',
  },
  {
    channelId: 'symbolic',
    scoreField: 'channelScores.symbolic',
    sourceSafeEvidence: 'symbols, configuration keys, stack tags, and constraints extracted from deposited content units',
  },
  {
    channelId: 'path',
    scoreField: 'channelScores.path',
    sourceSafeEvidence: 'source paths, content-unit paths, and source path metadata',
  },
  {
    channelId: 'metadata',
    scoreField: 'channelScores.metadata',
    sourceSafeEvidence: 'deposit metadata tags, declared stacks, constraints, and artifact kind descriptors',
  },
  {
    channelId: 'measurement',
    scoreField: 'channelScores.measurement',
    sourceSafeEvidence: 'source-safe measurement and proof-readback root presence, never raw source',
  },
  {
    channelId: 'embedding-vector',
    scoreField: 'channelScores.embeddingVector',
    sourceSafeEvidence: 'embedding policy and vector similarity posture bound to query and ranking roots',
  },
  {
    channelId: 'provider-specific',
    scoreField: 'channelScores.providerSpecific',
    sourceSafeEvidence: 'external provider match ids, scores, and evidence refs without provider secrets or raw payloads',
  },
];
