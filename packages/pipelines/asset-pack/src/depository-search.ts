import { createHash } from 'node:crypto';
import { buildAssetPackEmbeddingPolicy } from './embedding-config';
import {
  admitNeedFitSearch,
  isAcceptedReadNeed,
  readNeedToDepositorySearchRead,
  resolveReadNeedFromPipelineInput,
} from './read-need';

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
  searchedAssetCount: number;
  selectedCandidateAssetIds: string[];
  selectedCandidates: DepositoryCandidate[];
  rejectedCandidates: DepositoryCandidate[];
  blockedCandidates: DepositoryCandidate[];
  candidateRanking: DepositoryCandidate[];
  embeddingPolicy: ReturnType<typeof buildAssetPackEmbeddingPolicy>;
  queryRoot: string;
  rankingRoot: string;
  createdAt: string;
}

export interface DepositoryFitResultEvidence {
  schema: 'bitcode.asset-pack.fit-result';
  resultState: AssetPackFitResultState;
  resultReasons: string[];
  selectedCandidateAssetIds: string[];
  queryRoot: string;
  rankingRoot: string;
  searchedAssetCount: number;
  embeddingPolicy: ReturnType<typeof buildAssetPackEmbeddingPolicy>;
  selectionTrace: {
    selectedCandidates: DepositoryCandidateFitEvidence[];
    blockedCandidates: DepositoryCandidateFitEvidence[];
    candidateRanking: DepositoryCandidateFitEvidence[];
    rejectedCandidateCount: number;
  };
}

export interface DepositorySearchInput {
  read: DepositorySearchRead;
  assets: DepositoryAsset[];
  providers?: DepositorySearchProvider[];
  thresholds?: Partial<DepositorySearchThresholds>;
  createdAt?: string;
}

const DEFAULT_THRESHOLDS: DepositorySearchThresholds = {
  reviewScore: 0.44,
  worthyScore: 0.62,
  semanticScore: 0.18,
  maxSelectedCandidates: 3,
};

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'that',
  'this',
  'into',
  'onto',
  'then',
  'than',
  'when',
  'where',
  'whether',
  'contains',
  'contain',
  'through',
  'against',
  'available',
  'current',
  'should',
  'would',
  'could',
  'must',
  'need',
  'needs',
  'read',
  'bitcode',
]);

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return Number(value.toFixed(4));
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  }
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
}

function recordValue(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function getPath(value: unknown, path: string[]): unknown {
  let cursor: unknown = value;
  for (const part of path) {
    if (!cursor || typeof cursor !== 'object' || Array.isArray(cursor)) return undefined;
    cursor = (cursor as Record<string, unknown>)[part];
  }
  return cursor;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    const candidate = stringValue(value);
    if (candidate) return candidate;
  }
  return null;
}

function tokensFrom(value: unknown): string[] {
  const text = Array.isArray(value) ? value.join(' ') : String(value ?? '');
  const pieces = text
    .toLowerCase()
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
  return [...new Set(pieces)].sort();
}

function overlapScore(left: string[] | string, right: string[] | string): number {
  const leftTokens = Array.isArray(left) ? left : tokensFrom(left);
  const rightSet = new Set(Array.isArray(right) ? right : tokensFrom(right));
  if (!leftTokens.length || !rightSet.size) return 0;
  const matches = leftTokens.filter((token) => rightSet.has(token));
  return clamp01(matches.length / Math.max(1, leftTokens.length));
}

function intersection(left: string[], right: string[]): string[] {
  const rightSet = new Set(right);
  return [...new Set(left.filter((token) => rightSet.has(token)))].sort();
}

function normalizeRepository(value?: string | null): string | null {
  const normalized = stringValue(value).toLowerCase();
  return normalized.includes('/') ? normalized : null;
}

function normalizeArtifactKind(value?: string | null): string {
  return (stringValue(value) || 'asset-pack-evidence')
    .toLowerCase()
    .replace(/[_\s]+/g, '-');
}

function contentUnitText(unit: DepositoryContentUnit): string {
  return [
    unit.text,
    unit.path,
    ...(unit.codeAnalysisFacts?.symbols || []),
    ...(unit.codeAnalysisFacts?.paths || []),
    ...(unit.codeAnalysisFacts?.configKeys || []),
    ...(unit.codeAnalysisFacts?.stackTags || []),
    ...(unit.codeAnalysisFacts?.constraints || []),
  ].join(' ');
}

function hashVector(text: string, dimensions = 48): number[] {
  const vector = Array.from({ length: dimensions }, () => 0);
  for (const token of tokensFrom(text)) {
    const digest = sha256(token);
    const index = parseInt(digest.slice(0, 8), 16) % dimensions;
    vector[index] += parseInt(digest.slice(8, 10), 16) % 2 === 0 ? 1 : -1;
  }
  return vector;
}

function cosine(left: number[], right: number[]): number {
  let dot = 0;
  let leftMag = 0;
  let rightMag = 0;
  const length = Math.min(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    dot += left[i] * right[i];
    leftMag += left[i] * left[i];
    rightMag += right[i] * right[i];
  }
  if (!leftMag || !rightMag) return 0;
  return clamp01((dot / (Math.sqrt(leftMag) * Math.sqrt(rightMag)) + 1) / 2);
}

function assetCorpus(asset: DepositoryAsset): string {
  return [
    asset.assetId,
    asset.title,
    asset.summary,
    asset.artifactKind,
    asset.artifactType,
    asset.repositoryFullName,
    asset.sourceBranch,
    asset.sourceCommit,
    asset.contentRoot,
    ...(asset.contentUnits || []).map(contentUnitText),
    ...(stringArray(asset.metadata?.tags)),
    ...(stringArray(asset.metadata?.declaredStacks)),
    ...(stringArray(asset.metadata?.declaredConstraints)),
    ...(stringArray(asset.metadata?.sourcePaths)),
  ].join(' ');
}

function repositoryScore(read: DepositorySearchRead, asset: DepositoryAsset): number {
  const readRepo = normalizeRepository(read.repositoryFullName);
  const assetRepo = normalizeRepository(asset.repositoryFullName);
  if (!readRepo) return assetRepo ? 0.6 : 0.35;
  if (!assetRepo) return 0.2;
  return readRepo === assetRepo ? 1 : 0;
}

function revisionScore(read: DepositorySearchRead, asset: DepositoryAsset): number {
  const branchMatches =
    !!read.sourceBranch &&
    !!asset.sourceBranch &&
    read.sourceBranch.toLowerCase() === asset.sourceBranch.toLowerCase();
  const commitMatches =
    !!read.sourceCommit &&
    !!asset.sourceCommit &&
    read.sourceCommit.toLowerCase() === asset.sourceCommit.toLowerCase();
  if (commitMatches && branchMatches) return 1;
  if (commitMatches) return 0.82;
  if (branchMatches) return 0.58;
  if (!read.sourceBranch && !read.sourceCommit) return 0.45;
  return 0;
}

function hasProofEvidence(asset: DepositoryAsset): boolean {
  return Boolean(
    asset.hasWalletOrAttestationProof ||
      asset.attestations?.length ||
      asset.signingSurface ||
      asset.identitySurface ||
      asset.githubBoundary ||
      asset.githubAppAuthSurface ||
      asset.verificationEvidence?.proofRoot ||
      asset.verificationEvidence?.proofLogs
  );
}

function hasMeasurementEvidence(asset: DepositoryAsset): boolean {
  return Boolean(
    asset.hasAssetMeasurementEvidence ||
      asset.assetMeasurement ||
      asset.measurementProvenance?.length ||
      asset.verificationEvidence?.measurementRoot ||
      asset.verificationEvidence?.measurementLogs
  );
}

function readRequirementText(read: DepositorySearchRead): string {
  return [
    read.prompt,
    ...read.targetArtifactKinds,
    ...read.closureCriteria,
    ...read.failureModes,
  ].join(' ').toLowerCase();
}

function readRequiresProofRoot(read: DepositorySearchRead): boolean {
  const text = readRequirementText(read);
  return /\bproof[-\s]?root\b/.test(text) || /\bproof\/finality\s+readback\b/.test(text);
}

function readRequiresReconciliationReadback(read: DepositorySearchRead): boolean {
  const text = readRequirementText(read);
  return (
    /\breconciliation[-\s]?readback\b/.test(text) ||
    /\bledger\s+reconciliation\b/.test(text) ||
    /\bfinality\s+readback\b/.test(text) ||
    /\bproof\/finality\s+readback\b/.test(text)
  );
}

function proofRootFor(asset: DepositoryAsset): string | null {
  const verificationEvidence = asset.verificationEvidence || {};
  return firstString(
    verificationEvidence.proofRoot,
    verificationEvidence.proof_root,
    getPath(asset.assetMeasurement, ['proofRoot']),
    getPath(asset.assetMeasurement, ['proof_root'])
  );
}

function measurementRootFor(asset: DepositoryAsset): string | null {
  const verificationEvidence = asset.verificationEvidence || {};
  return firstString(
    verificationEvidence.measurementRoot,
    verificationEvidence.measurement_root,
    getPath(asset.assetMeasurement, ['measurementRoot']),
    getPath(asset.assetMeasurement, ['measurement_root'])
  );
}

function reconciliationReadbackRootFor(asset: DepositoryAsset): string | null {
  const verificationEvidence = asset.verificationEvidence || {};
  return firstString(
    verificationEvidence.reconciliationReadbackRoot,
    verificationEvidence.reconciliation_readback_root,
    verificationEvidence.ledgerReadbackRoot,
    verificationEvidence.ledger_readback_root,
    verificationEvidence.settlementReadbackRoot,
    verificationEvidence.settlement_readback_root,
    verificationEvidence.finalityReadbackRoot,
    verificationEvidence.finality_readback_root,
    verificationEvidence.terminalJournalRoot,
    verificationEvidence.terminal_journal_root
  );
}

function detectMockOrFrontier(asset: DepositoryAsset): string[] {
  const blockers: string[] = [];
  const repo = normalizeRepository(asset.repositoryFullName) || '';
  const provider = stringValue(asset.githubBoundary?.sourceProvider).toLowerCase();
  if (repo.startsWith('frontier/')) blockers.push('frontier_repository_reference');
  if (repo.startsWith('mock/')) blockers.push('mock_repository_reference');
  if (provider === 'mock' || provider === 'demo') blockers.push('mock_source_provider');
  return blockers;
}

function readLooksBroad(read: DepositorySearchRead): boolean {
  const terms = tokensFrom([
    read.prompt,
    ...read.targetArtifactKinds,
    ...read.closureCriteria,
    ...read.failureModes,
  ].join(' '));
  if (terms.length < 4) return true;
  const prompt = read.prompt.toLowerCase();
  const broadPhrase = /\b(everything|anything|all\s+the\s+things|make\s+it\s+better|improve\s+it|fix\s+this)\b/.test(prompt);
  return broadPhrase && !read.targetArtifactKinds.length && !read.closureCriteria.length;
}

function selectedUnitsFor(readTerms: string[], asset: DepositoryAsset): DepositoryContentUnit[] {
  return [...asset.contentUnits]
    .map((unit) => ({
      unit,
      score: overlapScore(readTerms, tokensFrom(contentUnitText(unit))),
    }))
    .sort((a, b) => b.score - a.score || a.unit.unitId.localeCompare(b.unit.unitId))
    .filter((entry) => entry.score > 0)
    .slice(0, 3)
    .map((entry) => entry.unit);
}

function useTierFor(candidate: {
  finalScore: number;
  hasProof: boolean;
  hasMeasurement: boolean;
  blockers: string[];
  readinessWarnings?: string[];
}): DepositoryCandidateUseTier {
  if (candidate.blockers.length) return 'reject';
  if (candidate.readinessWarnings?.length) return 'context-only';
  if (!candidate.hasMeasurement) return 'rank-only';
  if (!candidate.hasProof) return 'context-only';
  if (candidate.finalScore >= 0.78) return 'settlement-eligible';
  if (candidate.finalScore >= DEFAULT_THRESHOLDS.worthyScore) return 'patch-eligible';
  return 'rank-only';
}

function rankAsset(
  read: DepositorySearchRead,
  asset: DepositoryAsset,
  providerMatches: DepositoryProviderMatch[],
  thresholds: DepositorySearchThresholds
): DepositoryCandidate {
  const queryText = [
    read.prompt,
    ...read.targetArtifactKinds,
    ...read.closureCriteria,
    ...read.failureModes,
  ].join(' ');
  const readTerms = tokensFrom(queryText);
  const corpusText = assetCorpus(asset);
  const corpusTerms = tokensFrom(corpusText);
  const matchedTerms = intersection(readTerms, corpusTerms);
  const selectedUnits = selectedUnitsFor(readTerms, asset);
  const queryVector = hashVector(queryText);
  const unitScore = clamp01(
    Math.max(
      0,
      ...asset.contentUnits.map((unit) =>
        (0.55 * overlapScore(readTerms, tokensFrom(contentUnitText(unit)))) +
        (0.45 * cosine(queryVector, hashVector(contentUnitText(unit))))
      )
    )
  );
  const textScore = overlapScore(readTerms, corpusTerms);
  const artifactKindTokens = tokensFrom(asset.artifactKind);
  const targetKindTokens = tokensFrom(read.targetArtifactKinds.join(' '));
  const artifactKindScore = read.targetArtifactKinds.length
    ? Math.max(
        read.targetArtifactKinds
          .map(normalizeArtifactKind)
          .includes(normalizeArtifactKind(asset.artifactKind))
          ? 1
          : 0,
        overlapScore(targetKindTokens, artifactKindTokens)
      )
    : overlapScore(tokensFrom(read.prompt), artifactKindTokens);
  const repoScore = repositoryScore(read, asset);
  const revScore = revisionScore(read, asset);
  const proof = hasProofEvidence(asset);
  const measurement = hasMeasurementEvidence(asset);
  const proofRoot = proofRootFor(asset);
  const reconciliationReadbackRoot = reconciliationReadbackRootFor(asset);
  const proofRootRequired = readRequiresProofRoot(read);
  const reconciliationReadbackRequired = readRequiresReconciliationReadback(read);
  const providerScore = clamp01(Math.max(0, ...providerMatches.map((match) => match.score)));
  const proofScore = proof ? 1 : 0;
  const measurementScore = measurement ? 1 : 0;
  const semanticScore = clamp01((0.55 * textScore) + (0.35 * unitScore) + (0.10 * artifactKindScore));
  const blockers = [
    ...detectMockOrFrontier(asset),
    ...(normalizeRepository(read.repositoryFullName) && repoScore === 0
      ? ['repository_mismatch']
      : []),
    ...(read.sourceCommit && asset.sourceCommit && read.sourceCommit.toLowerCase() !== asset.sourceCommit.toLowerCase()
      ? ['source_commit_mismatch']
      : []),
  ];
  const readinessWarnings = [
    ...(proofRootRequired && !proofRoot ? ['proof_root_readback_missing'] : []),
    ...(reconciliationReadbackRequired && !reconciliationReadbackRoot ? ['reconciliation_readback_missing'] : []),
  ];
  const warnings = [
    ...(!proof ? ['wallet_or_attestation_proof_missing'] : []),
    ...(!measurement ? ['asset_measurement_evidence_missing'] : []),
    ...readinessWarnings,
    ...(semanticScore < thresholds.semanticScore ? ['semantic_match_below_review_floor'] : []),
  ];
  const penaltyMass = clamp01(
    (blockers.includes('repository_mismatch') ? 0.72 : 0) +
      (blockers.includes('source_commit_mismatch') ? 0.34 : 0) +
      (blockers.some((blocker) => blocker.includes('mock') || blocker.includes('frontier')) ? 0.9 : 0)
  );
  const finalScore = clamp01(
    (0.25 * textScore) +
      (0.18 * unitScore) +
      (0.17 * repoScore) +
      (0.12 * revScore) +
      (0.12 * artifactKindScore) +
      (0.07 * proofScore) +
      (0.06 * measurementScore) +
      (0.03 * providerScore) -
      penaltyMass
  );
  const matchedTargetKinds = read.targetArtifactKinds.filter((kind) =>
    normalizeArtifactKind(kind) === normalizeArtifactKind(asset.artifactKind) ||
    tokensFrom(kind).some((token) => artifactKindTokens.includes(token))
  );
  const ranking: DepositoryCandidateRanking = {
    finalScore,
    semanticScore,
    textScore,
    unitScore,
    repositoryScore: repoScore,
    revisionScore: revScore,
    artifactKindScore,
    proofScore,
    measurementScore,
    providerScore,
    penaltyMass,
    channelScores: {
      text: textScore,
      units: unitScore,
      repository: repoScore,
      revision: revScore,
      artifactKind: artifactKindScore,
      proof: proofScore,
      measurement: measurementScore,
      provider: providerScore,
    },
    explainability: {
      strongestScoreDrivers: [
        { label: 'textScore', value: textScore },
        { label: 'unitScore', value: unitScore },
        { label: 'repositoryScore', value: repoScore },
        { label: 'revisionScore', value: revScore },
        { label: 'artifactKindScore', value: artifactKindScore },
        { label: 'proofScore', value: proofScore },
        { label: 'measurementScore', value: measurementScore },
        { label: 'providerScore', value: providerScore },
      ].sort((a, b) => b.value - a.value || a.label.localeCompare(b.label)),
      penaltiesApplied: blockers,
      matchedTerms,
      matchedTargetKinds,
      providerMatches,
    },
  };

  const rejectionReasons = [
    ...blockers,
    ...(finalScore < thresholds.reviewScore ? ['ranking_score_below_review_floor'] : []),
    ...(semanticScore < thresholds.semanticScore ? ['semantic_score_below_review_floor'] : []),
  ];

  return {
    assetId: asset.assetId,
    title: asset.title,
    asset,
    selectedUnits,
    useTier: useTierFor({ finalScore, hasProof: proof, hasMeasurement: measurement, blockers, readinessWarnings }),
    ranking,
    verification: {
      repositoryBound: repoScore === 1,
      sourceRevisionBound: revScore >= 0.82,
      hasWalletOrAttestationProof: proof,
      hasAssetMeasurementEvidence: measurement,
      proofRootRequired,
      proofRootPresent: Boolean(proofRoot),
      reconciliationReadbackRequired,
      reconciliationReadbackPresent: Boolean(reconciliationReadbackRoot),
      blockers,
      warnings,
    },
    recall: {
      queryTerms: readTerms,
      matchedTerms,
      matchedUnitIds: selectedUnits.map((unit) => unit.unitId),
      providerMatches,
    },
    rejectionReasons,
  };
}

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
    selectedCandidateAssetIds: result.selectedCandidateAssetIds,
    queryRoot: result.queryRoot,
    rankingRoot: result.rankingRoot,
    searchedAssetCount: result.searchedAssetCount,
    embeddingPolicy: result.embeddingPolicy,
    selectionTrace: {
      selectedCandidates: result.selectedCandidates.map(summarizeDepositoryCandidateForFitEvidence),
      blockedCandidates: result.blockedCandidates.map(summarizeDepositoryCandidateForFitEvidence),
      candidateRanking: result.candidateRanking.map(summarizeDepositoryCandidateForFitEvidence),
      rejectedCandidateCount: result.rejectedCandidates.length,
    },
  };
}

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
        `Selected ${worthy.length} proof-bearing AssetPack candidate${worthy.length === 1 ? '' : 's'} for this Read.`,
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
  const embeddingPolicy = buildAssetPackEmbeddingPolicy();
  const createdAt = input.createdAt || new Date().toISOString();
  const queryRoot = `sha256:${sha256(stableStringify({ read: input.read, thresholds, embeddingPolicy }))}`;
  const rankingRoot = `sha256:${sha256(stableStringify(ranked.map((candidate) => ({
    assetId: candidate.assetId,
    ranking: candidate.ranking,
    blockers: candidate.verification.blockers,
    warnings: candidate.verification.warnings,
    useTier: candidate.useTier,
  }))))}`;

  return {
    schema: 'bitcode.asset-pack.depository-search',
    resultState: state.resultState,
    resultReasons: state.resultReasons,
    read: input.read,
    thresholds,
    searchedAssetCount: assets.length,
    selectedCandidateAssetIds: selected.map((candidate) => candidate.assetId),
    selectedCandidates: selected,
    rejectedCandidates: rejected,
    blockedCandidates: blocked,
    candidateRanking: ranked,
    embeddingPolicy,
    queryRoot,
    rankingRoot,
    createdAt,
  };
}

export function createLexicalDepositorySearchProvider(): DepositorySearchProvider {
  return {
    id: 'lexical-depository-search',
    search({ read, assets }) {
      const queryTerms = tokensFrom([
        read.prompt,
        ...read.targetArtifactKinds,
        ...read.closureCriteria,
        ...read.failureModes,
      ].join(' '));
      return assets
        .map((asset) => {
          const score = overlapScore(queryTerms, tokensFrom(assetCorpus(asset)));
          return {
            providerId: 'lexical-depository-search',
            channelId: 'lexical',
            assetId: asset.assetId,
            unitIds: selectedUnitsFor(queryTerms, asset).map((unit) => unit.unitId),
            score,
            evidenceRefs: [asset.assetId, asset.contentRoot].filter(Boolean) as string[],
            matchedValues: intersection(queryTerms, tokensFrom(assetCorpus(asset))),
          };
        })
        .filter((match) => match.score > 0);
    },
  };
}

export function normalizeDepositorySearchRead(input: unknown): DepositorySearchRead {
  const acceptedNeed = resolveReadNeedFromPipelineInput(input);
  if (isAcceptedReadNeed(acceptedNeed)) {
    return readNeedToDepositorySearchRead(acceptedNeed);
  }

  const record = recordValue(input) || {};
  const readRecord = recordValue(record.read);
  const sourceRevision = recordValue(record.sourceRevision);
  const repository = recordValue(record.repository);
  const readMeasurement = recordValue(record.readMeasurement);
  const prompt = firstString(
    typeof record.read === 'string' ? record.read : undefined,
    readRecord?.prompt,
    readRecord?.read,
    record.definitionOfRead,
    record.readDefinition,
    readMeasurement?.prompt,
    readMeasurement?.summary
  ) || '';
  const repositoryFullName = firstString(
    sourceRevision?.repositoryFullName,
    repository?.fullName,
    repository?.repositoryFullName,
    repository?.repo,
    readRecord?.repositoryFullName,
    readMeasurement?.repositoryFullName,
    getPath(readMeasurement, ['scenario', 'repo'])
  );
  const targetArtifactKinds = [
    ...stringArray(record.targetArtifactKinds),
    ...stringArray(record.targetKinds),
    ...stringArray(readRecord?.targetArtifactKinds),
    ...stringArray(readRecord?.targetKinds),
    ...stringArray(readMeasurement?.targetArtifactKinds),
  ];
  const closureCriteria = [
    ...stringArray(record.closureCriteria),
    ...stringArray(readRecord?.closureCriteria),
    ...stringArray(readMeasurement?.closureCriteria),
  ];

  return {
    id: firstString(readRecord?.id, readRecord?.readId, readMeasurement?.id, getPath(readMeasurement, ['scenario', 'id'])),
    prompt,
    repositoryFullName,
    sourceBranch: firstString(sourceRevision?.branch, repository?.branch, readRecord?.sourceBranch, readMeasurement?.sourceBranch),
    sourceCommit: firstString(sourceRevision?.commit, repository?.commit, readRecord?.sourceCommit, readMeasurement?.sourceCommit),
    targetArtifactKinds: [...new Set(targetArtifactKinds.map(normalizeArtifactKind))],
    closureCriteria: [...new Set(closureCriteria)],
    failureModes: [
      ...stringArray(record.failureModes),
      ...stringArray(readRecord?.failureModes),
      ...stringArray(readMeasurement?.failureModes),
    ],
  };
}

function fallbackContentUnits(assetId: string, text: string): DepositoryContentUnit[] {
  const unitText = stringValue(text) || assetId;
  return [
    {
      unitId: `${assetId}:unit-1`,
      unitKind: 'summary',
      text: unitText,
      unitHash: `sha256:${sha256(unitText)}`,
    },
  ];
}

export function normalizeDepositoryAsset(input: unknown): DepositoryAsset | null {
  const record = recordValue(input);
  if (!record) return null;
  const metadata = recordValue(record.metadata);
  const repoSnapshot = recordValue(record.repo_snapshot) || recordValue(record.repoSnapshot);
  const sourceRevision = recordValue(record.sourceRevision);
  const assetId = firstString(
    record.assetId,
    record.id,
    record.depositAssetId,
    record.candidateAssetId,
    record.deposit_asset_id
  );
  if (!assetId) return null;

  const title = firstString(record.title, metadata?.title, record.summary, metadata?.summary) || assetId;
  const summary = firstString(record.summary, metadata?.summary, record.description);
  const repositoryFullName =
    firstString(
      record.repositoryFullName,
      record.repository_full_name,
      sourceRevision?.repositoryFullName,
      metadata?.sourceRepo,
      getPath(record, ['githubBoundary', 'sourceRepo']),
      getPath(record, ['addressingSurface', 'repo'])
    ) ||
    (repoSnapshot?.org && repoSnapshot?.repo ? `${repoSnapshot.org}/${repoSnapshot.repo}` : null);
  const contentUnits = Array.isArray(record.contentUnits)
    ? record.contentUnits
        .map((unit, index) => normalizeContentUnit(assetId, unit, index))
        .filter(Boolean) as DepositoryContentUnit[]
    : fallbackContentUnits(assetId, [
        title,
        summary,
        repositoryFullName,
        record.sourceBranch,
        record.sourceCommit,
        record.contentRoot,
      ].join(' '));

  return {
    assetId,
    title,
    summary,
    artifactKind: normalizeArtifactKind(firstString(record.artifactKind, record.kind, metadata?.artifactKind) || 'asset-pack-evidence'),
    artifactType: firstString(record.artifactType, metadata?.artifactType),
    repositoryFullName,
    sourceBranch: firstString(record.sourceBranch, record.source_branch, sourceRevision?.branch, repoSnapshot?.branch),
    sourceCommit: firstString(record.sourceCommit, record.source_commit, sourceRevision?.commit, repoSnapshot?.commit),
    contentRoot: firstString(record.contentRoot, record.content_root),
    contentUnits,
    metadata,
    provenanceBinding: recordValue(record.provenanceBinding),
    sourceMaterialBinding: recordValue(record.sourceMaterialBinding),
    artifactSelectionSurface: recordValue(record.artifactSelectionSurface),
    addressingSurface: recordValue(record.addressingSurface),
    githubBoundary: recordValue(record.githubBoundary),
    githubAppAuthSurface: recordValue(record.githubAppAuthSurface),
    identitySurface: recordValue(record.identitySurface),
    signingSurface: recordValue(record.signingSurface),
    attestations: Array.isArray(record.attestations) ? record.attestations : [],
    assetMeasurement: record.assetMeasurement,
    measurementProvenance: Array.isArray(record.measurementProvenance) ? record.measurementProvenance : [],
    verificationEvidence: recordValue(record.verificationEvidence),
    hasWalletOrAttestationProof: record.hasWalletOrAttestationProof === true,
    hasAssetMeasurementEvidence: record.hasAssetMeasurementEvidence === true,
    createdAt: firstString(record.createdAt, record.created_at),
  };
}

function normalizeContentUnit(
  assetId: string,
  input: unknown,
  index: number
): DepositoryContentUnit | null {
  const record = recordValue(input);
  if (!record) return null;
  const text = firstString(record.text, record.content, record.summary);
  if (!text) return null;
  const unitId = firstString(record.unitId, record.id) || `${assetId}:unit-${index + 1}`;
  return {
    unitId,
    unitKind: firstString(record.unitKind, record.kind) || 'text',
    text,
    unitHash: firstString(record.unitHash, record.hash) || `sha256:${sha256(text)}`,
    path: firstString(record.path, record.sourcePath),
    codeAnalysisFacts: recordValue(record.codeAnalysisFacts) as DepositoryContentUnit['codeAnalysisFacts'],
  };
}

export function normalizePipelineDepositoryAssets(input: unknown): DepositoryAsset[] {
  const record = recordValue(input) || {};
  const candidateCollections = [
    record.depositoryAssets,
    record.depositCandidates,
    record.candidateAssets,
    record.assets,
  ].filter(Array.isArray) as unknown[][];
  const assets = candidateCollections
    .flat()
    .map(normalizeDepositoryAsset)
    .filter(Boolean) as DepositoryAsset[];

  if (assets.length) return assets;

  const depositRecord = recordValue(record.deposit);
  const sourceRevision = recordValue(record.sourceRevision);
  if (!depositRecord || !sourceRevision) return [];
  const assetId = firstString(depositRecord.assetId, depositRecord.id) || 'deposit-reference';
  const repositoryFullName = firstString(sourceRevision.repositoryFullName);
  const branch = firstString(sourceRevision.branch);
  const commit = firstString(sourceRevision.commit);
  const promptSummary = [
    'Deposited repository revision',
    repositoryFullName,
    branch,
    commit,
    'repository-revision fit-quality-receipt asset-pack-evidence proof-root reconciliation-readback',
  ].join(' ');

  return [
    {
      assetId,
      title: `Deposited repository revision ${repositoryFullName || assetId}`,
      summary: promptSummary,
      artifactKind: 'repository-revision',
      artifactType: 'repository/revision',
      repositoryFullName,
      sourceBranch: branch,
      sourceCommit: commit,
      contentRoot: `sha256:${sha256(promptSummary)}`,
      contentUnits: fallbackContentUnits(assetId, promptSummary),
      metadata: {
        summary: promptSummary,
        sourceRepo: repositoryFullName,
        sourcePaths: ['.bitcode/depositing-surface.json', '.bitcode/deposit-to-read-surface.json'],
      },
      sourceMaterialBinding: {
        mode: 'source-bound-repository-revision',
        mutableInBranch: false,
        materializationRoot: `.bitcode/source-material/${assetId}`,
      },
      hasWalletOrAttestationProof: depositRecord.hasWalletOrAttestationProof === true,
      hasAssetMeasurementEvidence: depositRecord.hasAssetMeasurementEvidence === true,
    },
  ];
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
  execution.store('tools', 'result', {
    tool: 'bitcode.depository.search',
    ok: true,
    input: {
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
    },
    output: {
      schema: result.schema,
      resultState: result.resultState,
      resultReasons: result.resultReasons,
      searchedAssetCount: result.searchedAssetCount,
      selectedCandidateAssetIds: result.selectedCandidateAssetIds,
      selectedCandidateCount: result.selectedCandidates.length,
      blockedCandidateCount: result.blockedCandidates.length,
      rejectedCandidateCount: result.rejectedCandidates.length,
      queryRoot: result.queryRoot,
      rankingRoot: result.rankingRoot,
      embeddingPolicy: result.embeddingPolicy,
    },
    phase: 'setup',
    agent: 'setup:depository-search',
    step: 'try',
    generation: 'tools_execution',
  });
}

function buildBlockedNeedFitSearchResult(input: {
  read: DepositorySearchRead;
  assets: DepositoryAsset[];
  blockers: string[];
}): DepositorySearchResult {
  const embeddingPolicy = buildAssetPackEmbeddingPolicy();
  const createdAt = new Date().toISOString();
  const thresholds = { ...DEFAULT_THRESHOLDS };
  const queryRoot = `sha256:${sha256(stableStringify({
    read: input.read,
    thresholds,
    embeddingPolicy,
    blockers: input.blockers,
  }))}`;
  const rankingRoot = `sha256:${sha256(stableStringify({
    blockedBeforeRanking: true,
    blockers: input.blockers,
    assetCount: input.assets.length,
  }))}`;

  return {
    schema: 'bitcode.asset-pack.depository-search',
    resultState: 'blocked_readiness',
    resultReasons: [
      'Need-Fit search requires an accepted Read-Need before depository candidate recall.',
      ...input.blockers,
    ],
    read: input.read,
    thresholds,
    searchedAssetCount: input.assets.length,
    selectedCandidateAssetIds: [],
    selectedCandidates: [],
    rejectedCandidates: [],
    blockedCandidates: [],
    candidateRanking: [],
    embeddingPolicy,
    queryRoot,
    rankingRoot,
    createdAt,
  };
}

export async function runDepositorySearchForPipelineInput(
  input: unknown,
  execution?: { store?: (namespace: string, key: string, value: unknown) => void; parent?: unknown }
): Promise<DepositorySearchResult> {
  const admission = admitNeedFitSearch(input);
  const read = normalizeDepositorySearchRead(input);
  const assets = normalizePipelineDepositoryAssets(input);
  const providers = [createLexicalDepositorySearchProvider()];
  const result = admission.admitted
    ? await searchDepositoryAssetSpace({
        read,
        assets,
        providers,
      })
    : buildBlockedNeedFitSearchResult({
        read,
        assets,
        blockers: admission.blockers,
      });

  const fitResult = buildDepositoryFitResultEvidence(result);
  const storeEvidence = (target?: { store?: (namespace: string, key: string, value: unknown) => void }) => {
    if (!target?.store) return;
    if (admission.acceptedNeed) {
      target.store('read/need', 'accepted', admission.acceptedNeed);
      target.store('read/need', 'measurementRoot', admission.acceptedNeed.measurementRoot);
      target.store('read/need', 'needId', admission.acceptedNeed.needId);
    }
    target.store('read/need-fit', 'admission', admission);
    target.store('depository/search', 'result', result);
    target.store('depository/search', 'candidateRanking', result.candidateRanking);
    target.store('depository/search', 'selectedCandidates', result.selectedCandidates);
    target.store('depository/search', 'selectionTrace', fitResult.selectionTrace);
    target.store('depository/search', 'embeddingPolicy', result.embeddingPolicy);
    target.store('fit', 'result', fitResult);
    target.store('fit', 'resultState', result.resultState);
    target.store('fit', 'resultReasons', result.resultReasons);
    target.store('fit', 'candidateRanking', result.candidateRanking);
    target.store('fit', 'selectionTrace', fitResult.selectionTrace);
  };

  if (execution?.store) {
    storeEvidence(execution);
    storeEvidence(execution.parent as { store?: (namespace: string, key: string, value: unknown) => void });
    storeDepositorySearchToolResult(execution, {
      read,
      assets,
      result,
      providerIds: providers.map((provider) => provider.id),
    });
  }

  return result;
}
