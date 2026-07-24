/**
 * Depository-search ranking and scoring helpers.
 * Tokenization, channel scores, proof/measurement signals, and rankAsset —
 * exported only for sibling depository-search modules.
 */
import { createHash } from 'node:crypto';
import {
  absoluteFacetScore,
  absoluteFacetsCorpusText,
  extractAbsoluteFacets,
} from './depository-search-absolute-facets';
import {
  DEFAULT_THRESHOLDS,
  type DepositoryAsset,
  type DepositoryCandidate,
  type DepositoryCandidateRanking,
  type DepositoryCandidateUseTier,
  type DepositoryContentUnit,
  type DepositoryProviderMatch,
  type DepositorySearchRead,
  type DepositorySearchThresholds,
} from './depository-search-types';

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

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return Number(value.toFixed(4));
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function stableStringify(value: unknown): string {
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

export function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
}

export function recordValue(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function getPath(value: unknown, path: string[]): unknown {
  let cursor: unknown = value;
  for (const part of path) {
    if (!cursor || typeof cursor !== 'object' || Array.isArray(cursor)) return undefined;
    cursor = (cursor as Record<string, unknown>)[part];
  }
  return cursor;
}

export function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    const candidate = stringValue(value);
    if (candidate) return candidate;
  }
  return null;
}

export function tokensFrom(value: unknown): string[] {
  const text = Array.isArray(value) ? value.join(' ') : String(value ?? '');
  const pieces = text
    .toLowerCase()
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
  return [...new Set(pieces)].sort();
}

export function overlapScore(left: string[] | string, right: string[] | string): number {
  const leftTokens = Array.isArray(left) ? left : tokensFrom(left);
  const rightSet = new Set(Array.isArray(right) ? right : tokensFrom(right));
  if (!leftTokens.length || !rightSet.size) return 0;
  const matches = leftTokens.filter((token) => rightSet.has(token));
  return clamp01(matches.length / Math.max(1, leftTokens.length));
}

export function intersection(left: string[], right: string[]): string[] {
  const rightSet = new Set(right);
  return [...new Set(left.filter((token) => rightSet.has(token)))].sort();
}

function normalizeRepository(value?: string | null): string | null {
  const normalized = stringValue(value).toLowerCase();
  return normalized.includes('/') ? normalized : null;
}

export function normalizeArtifactKind(value?: string | null): string {
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

function contentUnitSymbolicText(unit: DepositoryContentUnit): string {
  return [
    ...(unit.codeAnalysisFacts?.symbols || []),
    ...(unit.codeAnalysisFacts?.configKeys || []),
    ...(unit.codeAnalysisFacts?.stackTags || []),
    ...(unit.codeAnalysisFacts?.constraints || []),
  ].join(' ');
}

function assetPathText(asset: DepositoryAsset): string {
  return [
    ...(asset.contentUnits || []).map((unit) => unit.path || ''),
    ...(asset.contentUnits || []).flatMap((unit) => unit.codeAnalysisFacts?.paths || []),
    ...(stringArray(asset.metadata?.sourcePaths)),
  ].join(' ');
}

function assetSymbolicText(asset: DepositoryAsset): string {
  return (asset.contentUnits || []).map(contentUnitSymbolicText).join(' ');
}

function assetMetadataText(asset: DepositoryAsset): string {
  return [
    asset.artifactKind,
    asset.artifactType,
    ...(stringArray(asset.metadata?.tags)),
    ...(stringArray(asset.metadata?.declaredStacks)),
    ...(stringArray(asset.metadata?.declaredConstraints)),
    ...(stringArray(asset.metadata?.sourcePaths)),
    absoluteFacetsCorpusText(extractAbsoluteFacets(asset)),
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

export function assetCorpus(asset: DepositoryAsset): string {
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
    // Absolute facets drive lexical + measurement channels (deposit/read search).
    absoluteFacetsCorpusText(extractAbsoluteFacets(asset)),
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
  const facets = extractAbsoluteFacets(asset);
  return Boolean(
    asset.hasAssetMeasurementEvidence ||
      asset.assetMeasurement ||
      asset.measurementProvenance?.length ||
      asset.verificationEvidence?.measurementRoot ||
      asset.verificationEvidence?.measurementLogs ||
      facets.kinds.length > 0 ||
      facets.weightedMeasuredCount > 0
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

export function proofRootFor(asset: DepositoryAsset): string | null {
  const verificationEvidence = asset.verificationEvidence || {};
  return firstString(
    verificationEvidence.proofRoot,
    verificationEvidence.proof_root,
    getPath(asset.assetMeasurement, ['proofRoot']),
    getPath(asset.assetMeasurement, ['proof_root'])
  );
}

export function measurementRootFor(asset: DepositoryAsset): string | null {
  const verificationEvidence = asset.verificationEvidence || {};
  return firstString(
    verificationEvidence.measurementRoot,
    verificationEvidence.measurement_root,
    getPath(asset.assetMeasurement, ['measurementRoot']),
    getPath(asset.assetMeasurement, ['measurement_root'])
  );
}

export function reconciliationReadbackRootFor(asset: DepositoryAsset): string | null {
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

export function readLooksBroad(read: DepositorySearchRead): boolean {
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

export function selectedUnitsFor(readTerms: string[], asset: DepositoryAsset): DepositoryContentUnit[] {
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

export function rankAsset(
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
  const embeddingVectorScore = clamp01(
    Math.max(
      0,
      ...asset.contentUnits.map((unit) => cosine(queryVector, hashVector(contentUnitText(unit))))
    )
  );
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
  const symbolicScore = overlapScore(readTerms, tokensFrom(assetSymbolicText(asset)));
  const pathScore = overlapScore(readTerms, tokensFrom(assetPathText(asset)));
  const metadataScore = overlapScore(readTerms, tokensFrom(assetMetadataText(asset)));
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
  const absoluteFacets = extractAbsoluteFacets(asset);
  const absoluteScore = absoluteFacetScore(asset, { queryTerms: readTerms });
  // Measurement channel: evidence presence stays strong (legacy fit thresholds);
  // absolute facet richness boosts further without requiring facets for worthy_fit.
  const measurementScore = clamp01((measurement ? 0.7 : 0) + 0.3 * absoluteScore);
  const proofRoot = proofRootFor(asset);
  const reconciliationReadbackRoot = reconciliationReadbackRootFor(asset);
  const proofRootRequired = readRequiresProofRoot(read);
  const reconciliationReadbackRequired = readRequiresReconciliationReadback(read);
  const providerScore = clamp01(Math.max(0, ...providerMatches.map((match) => match.score)));
  const proofScore = proof ? 1 : 0;
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
  // Measurement weight raised: absolute facets are first-class commercial signal.
  const finalScore = clamp01(
    (0.22 * textScore) +
      (0.16 * unitScore) +
      (0.15 * repoScore) +
      (0.11 * revScore) +
      (0.11 * artifactKindScore) +
      (0.07 * proofScore) +
      (0.12 * measurementScore) +
      (0.03 * providerScore) +
      (0.03 * embeddingVectorScore) -
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
      lexical: textScore,
      symbolic: symbolicScore,
      path: pathScore,
      metadata: metadataScore,
      measurement: measurementScore,
      absoluteFacets: absoluteScore,
      absoluteComposite: absoluteFacets.composite,
      embeddingVector: embeddingVectorScore,
      providerSpecific: providerScore,
      text: textScore,
      units: unitScore,
      repository: repoScore,
      revision: revScore,
      artifactKind: artifactKindScore,
      proof: proofScore,
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
        { label: 'absoluteFacetScore', value: absoluteScore },
        { label: 'absoluteComposite', value: absoluteFacets.composite },
        { label: 'providerScore', value: providerScore },
      ].sort((a, b) => b.value - a.value || a.label.localeCompare(b.label)),
      penaltiesApplied: blockers,
      matchedTerms: [
        ...matchedTerms,
        ...absoluteFacets.kinds.filter((k) => readTerms.some((t) => k.includes(t) || t.includes(k))),
      ],
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
