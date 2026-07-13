/**
 * Depository supply index projections — search documents, storage/vector rows,
 * compensation preview, and search-asset mapping.
 *
 * Pure builders over source-safe metadata; no raw source materialization.
 */

import {
  ASSET_PACK_VECTOR_STORAGE_TABLE,
  buildAssetPackEmbeddingPolicy,
  normalizeAssetPackEmbeddingVector,
} from './embedding-config';
import type { DepositoryAsset, DepositoryContentUnit } from './depository-search';
import type {
  DepositorySupplyCompensationPreview,
  DepositorySupplyCompensationState,
  DepositorySupplyIndex,
  DepositorySupplyRecord,
  DepositorySupplySearchDocument,
  DepositorySupplySearchDocumentKind,
  DepositorySupplyStorageProjection,
  DepositorySupplyVectorProjection,
} from './depository-supply-index-types';
import {
  rootsFor,
  supplyRoot,
  tokensFrom,
  uniqueSorted,
} from './depository-supply-index-helpers';

export function buildSearchDocument(input: {
  assetId: string;
  kind: DepositorySupplySearchDocumentKind;
  sourceSafeText: string;
  sourcePaths: string[];
  symbols: string[];
  constraints: string[];
}): DepositorySupplySearchDocument {
  const documentId = `${input.assetId}:${input.kind}`;
  return {
    schema: 'bitcode.depository.supply-search-document',
    documentId,
    kind: input.kind,
    sourceSafeText: input.sourceSafeText,
    sourceSafeTextRoot: supplyRoot('sha256', input.sourceSafeText),
    tokenCount: tokensFrom(input.sourceSafeText).length,
    sourcePathRoots: rootsFor(input.sourcePaths, 'path-root'),
    symbolRoots: rootsFor(input.symbols, 'symbol-root'),
    constraintRoots: rootsFor(input.constraints, 'constraint-root'),
    protectedSourceVisible: false,
  };
}

export function buildStorageProjection(): DepositorySupplyStorageProjection {
  return {
    schema: 'bitcode.depository.supply-storage-projection',
    assetPackEvidenceTable: 'deliverables',
    vectorTable: ASSET_PACK_VECTOR_STORAGE_TABLE,
    vectorMatchRpc: 'match_deliverable_vectors',
    sourceSafeColumns: [
      'deliverables.id',
      'deliverables.title',
      'deliverables.output',
      'deliverables.config',
      'deliverable_vectors.deliverable_id',
      'deliverable_vectors.embedding',
    ],
    privateColumnsExcluded: [
      'raw-source-text',
      'provider-token',
      'wallet-private-material',
      'unpaid-assetpack-source',
      'settlement-private-payload',
    ],
    readbackChecks: [
      'deliverables row exists for every searchable supply record',
      'deliverable_vectors rows bind to the active embedding policy',
      'match_deliverable_vectors returns only source-safe metadata before settlement',
    ],
  };
}

export function buildVectorProjection(input: {
  assetId: string;
  searchDocuments: DepositorySupplySearchDocument[];
  embeddings: Record<string, unknown>;
}): DepositorySupplyVectorProjection {
  const embeddingPolicy = buildAssetPackEmbeddingPolicy();
  return {
    schema: 'bitcode.depository.supply-vector-projection',
    provider: embeddingPolicy.provider,
    model: embeddingPolicy.model,
    dimensions: embeddingPolicy.dimensions,
    distanceMetric: embeddingPolicy.vectorStore.distanceMetric,
    vectorStore: embeddingPolicy.vectorStore,
    rows: input.searchDocuments.map((document) => {
      const embedding = input.embeddings[document.documentId] ?? input.embeddings[document.kind];
      const normalized = normalizeAssetPackEmbeddingVector(embedding, {
        provider: embeddingPolicy.provider,
        model: embeddingPolicy.model,
        dimensions: embeddingPolicy.dimensions,
        encodingFormat: embeddingPolicy.encodingFormat,
        inputTokenLimit: embeddingPolicy.inputTokenLimit,
        vectorStore: embeddingPolicy.vectorStore,
      });
      const embeddingPresent = Array.isArray(embedding);
      return {
        vectorRowId: `${input.assetId}:${document.kind}:vector`,
        assetId: input.assetId,
        searchDocumentId: document.documentId,
        embeddingInputRoot: document.sourceSafeTextRoot,
        embeddingDimensions: embeddingPolicy.dimensions,
        embeddingPresent: Boolean(normalized),
        embeddingState: normalized
          ? 'ready'
          : embeddingPresent
            ? 'invalid-dimensions'
            : 'pending-embedding',
        protectedSourceVisible: false,
      };
    }),
  };
}

export function buildCompensationPreview(input: {
  assetId: string;
  depositId: string;
  depositorWalletId: string | null;
  btdRange: string | null;
  sourceBound: boolean;
  proofReady: boolean;
  measurementReady: boolean;
  searchable: boolean;
  blockers: string[];
  warnings: string[];
}): DepositorySupplyCompensationPreview {
  const compensationBlockers = [
    ...input.blockers,
    ...(!input.depositorWalletId ? ['depositor_wallet_missing'] : []),
    ...(!input.proofReady ? ['wallet_or_attestation_proof_missing'] : []),
    ...(!input.measurementReady ? ['asset_measurement_evidence_missing'] : []),
    ...(!input.searchable ? ['depository_searchability_missing'] : []),
  ];
  const eligibleForCompensationIfSelected = compensationBlockers.length === 0;
  const state: DepositorySupplyCompensationState = eligibleForCompensationIfSelected
    ? 'eligible-if-selected-for-assetpack'
    : input.blockers.length
      ? 'blocked-before-compensation'
      : 'repair-required-before-compensation';
  const compensationRoute = {
    payer: 'future-reader-after-settlement' as const,
    payee: 'depositing-wallet' as const,
    priceAsset: 'BTC' as const,
    allocationMethod: 'source-to-shares-largest-remainder' as const,
    sourceToSharesProofState: 'not-created-until-accepted-need-fit-and-settlement' as const,
    btdMintBoundary: 'not-minted-by-deposit-admission' as const,
    btdRightsTransferBoundary: 'reader-receives-rights-only-after-btc-settlement' as const,
  };
  const readback = {
    ledgerAccountKeys: [
      `supplier:${input.assetId}:pending_claims`,
      ...(input.depositorWalletId
        ? [
            `depositor:${input.depositorWalletId}:deposited_assets`,
            `depositor:${input.depositorWalletId}:eligible_compensation_routes`,
          ]
        : []),
    ],
    databaseProjectionTables: [
      'deliverables',
      'deliverable_vectors',
      'ledger_entries',
      'source_to_shares_allocations',
    ],
    objectStorageVisibility: 'source-safe-metadata-only-before-settlement' as const,
  };
  const compensationRouteRoot = supplyRoot('sha256', compensationRoute);
  const sourceToSharesPreviewRoot = supplyRoot('sha256', {
    assetId: input.assetId,
    depositId: input.depositId,
    depositorWalletId: input.depositorWalletId,
    candidateBtdRange: input.btdRange,
    allocationMethod: compensationRoute.allocationMethod,
    sourceToSharesProofState: compensationRoute.sourceToSharesProofState,
  });
  const readbackRoot = supplyRoot('sha256', readback);
  const readiness = {
    sourceBound: input.sourceBound,
    proofReady: input.proofReady,
    measurementReady: input.measurementReady,
    searchable: input.searchable,
    depositorWalletReady: Boolean(input.depositorWalletId),
    eligibleForFindingFits: input.searchable,
    eligibleForCompensationIfSelected,
    blockers: uniqueSorted(compensationBlockers),
    warnings: uniqueSorted(input.warnings),
  };
  const visibility = {
    beforeSettlement: 'source-safe-compensation-route-metadata' as const,
    protectedSourceVisible: false as const,
    unpaidAssetPackSourceVisible: false as const,
    walletPrivateMaterialVisible: false as const,
    settlementPrivatePayloadVisible: false as const,
  };
  const compensationPreviewRoot = supplyRoot('sha256', {
    assetId: input.assetId,
    depositId: input.depositId,
    state,
    readiness,
    compensationRouteRoot,
    sourceToSharesPreviewRoot,
    readbackRoot,
    visibility,
  });

  return {
    schema: 'bitcode.depository.supply-compensation-preview',
    state,
    assetId: input.assetId,
    depositId: input.depositId,
    depositorWalletId: input.depositorWalletId,
    candidateBtdRange: input.btdRange,
    compensationRoute,
    readiness,
    visibility,
    readback,
    roots: {
      compensationRouteRoot,
      sourceToSharesPreviewRoot,
      readbackRoot,
      compensationPreviewRoot,
    },
  };
}

export function contentUnitFromSupplyRecord(record: DepositorySupplyRecord): DepositoryContentUnit {
  const sourceSafeText = record.searchDocuments.map((document) => document.sourceSafeText).join(' ');
  return {
    unitId: `${record.assetId}:supply-index-source-safe-unit`,
    unitKind: 'depository-supply-index',
    text: sourceSafeText,
    unitHash: supplyRoot('sha256', sourceSafeText),
    codeAnalysisFacts: {
      symbols: record.searchDocuments.flatMap((document) => document.symbolRoots),
      paths: record.sourceBinding.sourcePathRoots,
      stackTags: [],
      constraints: record.searchDocuments.flatMap((document) => document.constraintRoots),
    },
  };
}

export function mapSupplyAssetsFromIndex(index: DepositorySupplyIndex): DepositoryAsset[] {
  return index.records
    .filter((record) => record.lifecycle.searchable)
    .map((record) => ({
      assetId: record.assetId,
      title: record.title,
      summary: record.summary,
      artifactKind: record.artifactKind,
      artifactType: record.artifactType,
      repositoryFullName: record.sourceBinding.repositoryFullName,
      sourceBranch: record.sourceBinding.sourceBranch,
      sourceCommit: record.sourceBinding.sourceCommit,
      contentRoot: record.sourceBinding.contentRoot,
      contentUnits: [contentUnitFromSupplyRecord(record)],
      metadata: {
        depositorySupplyIndexId: index.indexId,
        depositorySupplyRecordId: record.supplyId,
        sourcePaths: record.sourceBinding.sourcePathRoots,
        tags: ['depository-supply-index', record.lifecycle.state],
        declaredConstraints: record.repairActions,
      },
      sourceMaterialBinding: {
        mode: 'source-bound-repository-revision',
        sourceSafeIndexOnly: true,
        protectedSourceVisible: false,
      },
      verificationEvidence: {
        proofRoot: record.proofEvidence.proofRoot,
        measurementRoot: record.measurementEvidence.measurementRoot,
        reconciliationReadbackRoot: record.readbackEvidence.reconciliationReadbackRoot,
        depositorySupplyIndexRoot: index.roots.indexRoot,
      },
      signingSurface: record.proofEvidence.hasWalletOrAttestationProof
        ? {
            source: 'depository-supply-index',
            proofRoot: record.proofEvidence.proofRoot,
            attestationCount: record.proofEvidence.attestationCount,
          }
        : undefined,
      assetMeasurement: record.measurementEvidence.hasAssetMeasurementEvidence
        ? {
            source: 'depository-supply-index',
            measurementRoot: record.measurementEvidence.measurementRoot,
            measurementProvenanceCount: record.measurementEvidence.measurementProvenanceCount,
          }
        : undefined,
      hasWalletOrAttestationProof: record.proofEvidence.hasWalletOrAttestationProof,
      hasAssetMeasurementEvidence: record.measurementEvidence.hasAssetMeasurementEvidence,
    }));
}
