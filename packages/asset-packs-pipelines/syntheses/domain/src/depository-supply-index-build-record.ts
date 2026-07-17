/**
 * Build a single DepositorySupplyRecord from a raw deposit/asset payload.
 *
 * Assembles source binding, lifecycle readiness, search documents, vector/
 * storage projections, and compensation preview from source-safe fields only.
 */

import type {
  DepositorySupplyLifecycleState,
  DepositorySupplyRecord,
} from './depository-supply-index-types';
import {
  firstString,
  getPath,
  normalizeArtifactKind,
  recordValue,
  rootsFor,
  sha256,
  stringArray,
  supplyRoot,
  uniqueSorted,
} from './depository-supply-index-helpers';
import {
  buildCompensationPreview,
  buildSearchDocument,
  buildStorageProjection,
  buildVectorProjection,
} from './depository-supply-index-projections';
import { SOURCE_SAFE_METADATA_ONLY } from './depository-supply-index-helpers';

export function recordEmbeddingInputs(record: Record<string, unknown>): Record<string, unknown> {
  return (
    recordValue(record.embeddings) ||
    recordValue(record.embeddingVectors) ||
    recordValue(record.vectorEmbeddings) ||
    {}
  );
}

export function sanitizeSourceSafeText(parts: unknown[]): string {
  return uniqueSorted(
    parts
      .flatMap((part) => {
        if (Array.isArray(part)) return part;
        return [part];
      })
      .map((part) => (typeof part === 'string' ? part.trim() : ''))
      .filter(Boolean),
  ).join(' ');
}

export function contentUnitFacts(units: unknown[]): {
  sourcePaths: string[];
  symbols: string[];
  stackTags: string[];
  constraints: string[];
} {
  const sourcePaths: string[] = [];
  const symbols: string[] = [];
  const stackTags: string[] = [];
  const constraints: string[] = [];

  for (const unit of units) {
    const record = recordValue(unit);
    const facts = recordValue(record?.codeAnalysisFacts);
    const path = firstString(record?.path, record?.sourcePath);
    if (path) sourcePaths.push(path);
    sourcePaths.push(...stringArray(facts?.paths));
    symbols.push(...stringArray(facts?.symbols));
    stackTags.push(...stringArray(facts?.stackTags));
    constraints.push(...stringArray(facts?.constraints));
  }

  return {
    sourcePaths: uniqueSorted(sourcePaths),
    symbols: uniqueSorted(symbols),
    stackTags: uniqueSorted(stackTags),
    constraints: uniqueSorted(constraints),
  };
}

export function resolveSourceRevision(
  record: Record<string, unknown>,
  fallback: unknown,
): Record<string, unknown> {
  return (
    recordValue(record.sourceRevision) ||
    recordValue(record.repoSnapshot) ||
    recordValue(record.repo_snapshot) ||
    recordValue(fallback) ||
    {}
  );
}

export function buildSupplyRecord(input: {
  raw: unknown;
  fallbackSourceRevision: unknown;
}): DepositorySupplyRecord | null {
  const record = recordValue(input.raw);
  if (!record) return null;
  const metadata = recordValue(record.metadata) || {};
  const sourceRevision = resolveSourceRevision(record, input.fallbackSourceRevision);
  const depositId = firstString(record.depositId, record.id, record.deposit_id, record.assetId) || null;
  const assetId = firstString(record.assetId, record.depositAssetId, record.id, record.deposit_asset_id);
  if (!depositId || !assetId) return null;

  const contentUnits = Array.isArray(record.contentUnits) ? record.contentUnits : [];
  const facts = contentUnitFacts(contentUnits);
  const sourcePaths = uniqueSorted([
    ...facts.sourcePaths,
    ...stringArray(metadata.sourcePaths),
    ...stringArray(record.sourcePaths),
  ]);
  const symbols = uniqueSorted([
    ...facts.symbols,
    ...stringArray(metadata.symbols),
    ...stringArray(record.symbols),
  ]);
  const stackTags = uniqueSorted([
    ...facts.stackTags,
    ...stringArray(metadata.declaredStacks),
    ...stringArray(metadata.stackTags),
    ...stringArray(record.stackTags),
  ]);
  const constraints = uniqueSorted([
    ...facts.constraints,
    ...stringArray(metadata.declaredConstraints),
    ...stringArray(record.constraints),
  ]);
  const title = firstString(record.title, metadata.title, record.summary, metadata.summary) || assetId;
  const summary = firstString(record.summary, metadata.summary, record.description) || title;
  const repositoryFullName =
    firstString(
      record.repositoryFullName,
      record.repository_full_name,
      sourceRevision.repositoryFullName,
      sourceRevision.repo,
      metadata.sourceRepo,
      getPath(record, ['githubBoundary', 'sourceRepo']),
      getPath(record, ['addressingSurface', 'repo']),
    ) ||
    (sourceRevision.org && sourceRevision.repo ? `${sourceRevision.org}/${sourceRevision.repo}` : null);
  const sourceBranch = firstString(record.sourceBranch, record.source_branch, sourceRevision.branch);
  const sourceCommit = firstString(record.sourceCommit, record.source_commit, sourceRevision.commit);
  const contentRoot = firstString(record.contentRoot, record.content_root);
  const artifactKind = normalizeArtifactKind(
    firstString(record.artifactKind, record.kind, metadata.artifactKind),
  );
  const artifactType = firstString(record.artifactType, metadata.artifactType);
  const proofRoot = firstString(
    record.proofRoot,
    getPath(record, ['verificationEvidence', 'proofRoot']),
    getPath(record, ['assetMeasurement', 'proofRoot']),
  );
  const measurementRoot = firstString(
    record.measurementRoot,
    getPath(record, ['verificationEvidence', 'measurementRoot']),
    getPath(record, ['assetMeasurement', 'measurementRoot']),
  );
  const reconciliationReadbackRoot = firstString(
    record.reconciliationReadbackRoot,
    getPath(record, ['verificationEvidence', 'reconciliationReadbackRoot']),
    getPath(record, ['verificationEvidence', 'ledgerReadbackRoot']),
  );
  const hasWalletOrAttestationProof = Boolean(
    record.hasWalletOrAttestationProof ||
      proofRoot ||
      recordValue(record.signingSurface) ||
      recordValue(record.identitySurface) ||
      recordValue(record.githubBoundary) ||
      (Array.isArray(record.attestations) && record.attestations.length),
  );
  const hasAssetMeasurementEvidence = Boolean(
    record.hasAssetMeasurementEvidence ||
      measurementRoot ||
      record.assetMeasurement ||
      (Array.isArray(record.measurementProvenance) && record.measurementProvenance.length),
  );
  const baseText = sanitizeSourceSafeText([
    title,
    summary,
    artifactKind,
    artifactType,
    repositoryFullName,
    sourceBranch,
    sourceCommit,
    sourcePaths,
    symbols,
    stackTags,
    constraints,
    stringArray(metadata.tags),
  ]);
  const measurementText = sanitizeSourceSafeText([
    title,
    artifactKind,
    proofRoot ? 'proof-root-present' : 'proof-root-missing',
    measurementRoot ? 'measurement-root-present' : 'measurement-root-missing',
    reconciliationReadbackRoot ? 'reconciliation-readback-present' : 'reconciliation-readback-missing',
  ]);
  const searchDocuments = [
    buildSearchDocument({
      assetId,
      kind: 'lexical',
      sourceSafeText: baseText,
      sourcePaths,
      symbols,
      constraints,
    }),
    buildSearchDocument({
      assetId,
      kind: 'metadata',
      sourceSafeText: sanitizeSourceSafeText([
        artifactKind,
        artifactType,
        repositoryFullName,
        sourcePaths,
        stackTags,
      ]),
      sourcePaths,
      symbols,
      constraints,
    }),
    buildSearchDocument({
      assetId,
      kind: 'measurement',
      sourceSafeText: measurementText,
      sourcePaths,
      symbols,
      constraints,
    }),
    buildSearchDocument({
      assetId,
      kind: 'vector',
      sourceSafeText: sanitizeSourceSafeText([baseText, measurementText]),
      sourcePaths,
      symbols,
      constraints,
    }),
  ];
  const vectorProjection = buildVectorProjection({
    assetId,
    searchDocuments,
    embeddings: recordEmbeddingInputs(record),
  });
  const storageProjection = buildStorageProjection();
  const depositorWalletId = firstString(
    record.depositorWalletId,
    metadata.depositorWalletId,
    getPath(record, ['depositorBoundary', 'walletId']),
  );
  const btdRange = firstString(record.btdRange, metadata.btdRange, getPath(record, ['btd', 'range']));
  const blockers = [
    ...(!repositoryFullName ? ['repository_binding_missing'] : []),
    ...(!sourceBranch && !sourceCommit ? ['source_revision_binding_missing'] : []),
  ];
  const warnings = [
    ...(!hasWalletOrAttestationProof ? ['wallet_or_attestation_proof_missing'] : []),
    ...(!hasAssetMeasurementEvidence ? ['asset_measurement_evidence_missing'] : []),
    ...(!depositorWalletId ? ['depositor_wallet_missing'] : []),
    ...(vectorProjection.rows.some((row) => row.embeddingState === 'pending-embedding')
      ? ['embedding_rows_pending']
      : []),
    ...(vectorProjection.rows.some((row) => row.embeddingState === 'invalid-dimensions')
      ? ['embedding_row_invalid_dimensions']
      : []),
  ];
  const lexicalIndexed = searchDocuments.some(
    (document) => document.kind === 'lexical' && document.tokenCount > 0,
  );
  const metadataIndexed = searchDocuments.some(
    (document) => document.kind === 'metadata' && document.tokenCount > 0,
  );
  const vectorProjectionReady = vectorProjection.rows.every((row) => row.embeddingState === 'ready');
  const measurementReady = hasAssetMeasurementEvidence;
  const proofReady = hasWalletOrAttestationProof;
  const searchable = !blockers.length && lexicalIndexed && metadataIndexed && measurementReady;
  const repairRequired = Boolean(blockers.length || warnings.length);
  const state: DepositorySupplyLifecycleState = blockers.length
    ? 'blocked-readiness'
    : repairRequired
      ? 'indexed-repair-required'
      : 'indexed-searchable';
  const repairActions = uniqueSorted([
    ...(!repositoryFullName ? ['bind-repository-full-name'] : []),
    ...(!sourceBranch && !sourceCommit ? ['bind-source-branch-or-commit'] : []),
    ...(!hasWalletOrAttestationProof ? ['collect-wallet-or-attestation-proof'] : []),
    ...(!hasAssetMeasurementEvidence ? ['compute-asset-measurement'] : []),
    ...(!depositorWalletId ? ['bind-depositor-wallet-for-compensation'] : []),
    ...(!vectorProjectionReady ? ['sync-active-embedding-vector-rows'] : []),
  ]);
  const rightsBoundary = {
    depositorWalletId,
    btdRange,
    readerVisibilityBeforeSettlement: 'source-safe-metadata-only' as const,
    protectedSourceBeforeSettlementVisible: false as const,
    settlementRequiredForSourceBearingAssetPack: true as const,
    btdOwnershipBoundary: 'depositor-retains-btd-until-settlement-transfer' as const,
  };
  const sourceBinding = {
    repositoryFullName,
    sourceBranch,
    sourceCommit,
    contentRoot,
    sourcePathCount: sourcePaths.length,
    sourcePathRoots: rootsFor(sourcePaths, 'path-root'),
    rawSourceStoredExternally: true as const,
    protectedSourceVisibleInIndex: false as const,
  };
  const proofEvidence = {
    hasWalletOrAttestationProof,
    proofRoot,
    attestationCount: Array.isArray(record.attestations) ? record.attestations.length : 0,
  };
  const measurementEvidence = {
    hasAssetMeasurementEvidence,
    measurementRoot,
    measurementProvenanceCount: Array.isArray(record.measurementProvenance)
      ? record.measurementProvenance.length
      : 0,
  };
  const readbackEvidence = { reconciliationReadbackRoot };
  const searchDocumentRoot = supplyRoot(
    'sha256',
    searchDocuments.map((document) => ({
      documentId: document.documentId,
      kind: document.kind,
      sourceSafeTextRoot: document.sourceSafeTextRoot,
    })),
  );
  const vectorProjectionRoot = supplyRoot('sha256', vectorProjection);
  const storageProjectionRoot = supplyRoot('sha256', storageProjection);
  const rightsBoundaryRoot = supplyRoot('sha256', rightsBoundary);
  const compensationPreview = buildCompensationPreview({
    assetId,
    depositId,
    depositorWalletId,
    btdRange,
    sourceBound: Boolean(repositoryFullName && (sourceBranch || sourceCommit)),
    proofReady,
    measurementReady,
    searchable,
    blockers,
    warnings,
  });
  const recordSupplyRoot = supplyRoot('sha256', {
    assetId,
    depositId,
    sourceBinding,
    lifecycle: { state, searchable, blockers, warnings },
    rightsBoundaryRoot,
    compensationPreviewRoot: compensationPreview.roots.compensationPreviewRoot,
    searchDocumentRoot,
    vectorProjectionRoot,
    storageProjectionRoot,
  });

  return {
    schema: 'bitcode.depository.supply-record',
    supplyId: `supply:${sha256(`${depositId}:${assetId}`).slice(0, 24)}`,
    depositId,
    assetId,
    title,
    summary,
    artifactKind,
    artifactType,
    sourceBinding,
    lifecycle: {
      state,
      sourceReceived: Boolean(repositoryFullName || contentRoot || sourcePaths.length),
      measurementReady,
      proofReady,
      lexicalIndexed,
      metadataIndexed,
      vectorProjectionReady,
      searchable,
      repairRequired,
      blockers,
      warnings,
    },
    rightsBoundary,
    compensationPreview,
    proofEvidence,
    measurementEvidence,
    readbackEvidence,
    searchDocuments,
    vectorProjection,
    storageProjection,
    repairActions,
    sourceSafety: { ...SOURCE_SAFE_METADATA_ONLY },
    roots: {
      supplyRoot: recordSupplyRoot,
      searchDocumentRoot,
      vectorProjectionRoot,
      storageProjectionRoot,
      rightsBoundaryRoot,
      compensationPreviewRoot: compensationPreview.roots.compensationPreviewRoot,
    },
  };
}
