/**
 * Depository supply index types — searchable source-safe supply records.
 *
 * Lifecycle, compensation preview, search documents, vector/storage projections.
 * Builders live in helpers and the public entry module.
 */

import {
  ASSET_PACK_VECTOR_STORAGE_TABLE,
  buildAssetPackEmbeddingPolicy,
} from './embedding-config';

export type DepositorySupplyLifecycleState =
  | 'indexed-searchable'
  | 'indexed-repair-required'
  | 'blocked-readiness';

export type DepositorySupplyCompensationState =
  | 'eligible-if-selected-for-assetpack'
  | 'repair-required-before-compensation'
  | 'blocked-before-compensation';

export type DepositorySupplySearchDocumentKind =
  | 'lexical'
  | 'metadata'
  | 'measurement'
  | 'vector';

export interface DepositorySupplyIndexInput {
  deposits?: unknown[];
  depositoryAssets?: unknown[];
  sourceRevision?: unknown;
  createdAt?: string;
}

export interface DepositorySupplyRecord {
  schema: 'bitcode.depository.supply-record';
  supplyId: string;
  depositId: string;
  assetId: string;
  title: string;
  summary: string;
  artifactKind: string;
  artifactType: string | null;
  sourceBinding: {
    repositoryFullName: string | null;
    sourceBranch: string | null;
    sourceCommit: string | null;
    contentRoot: string | null;
    sourcePathCount: number;
    sourcePathRoots: string[];
    rawSourceStoredExternally: true;
    protectedSourceVisibleInIndex: false;
  };
  lifecycle: {
    state: DepositorySupplyLifecycleState;
    sourceReceived: boolean;
    measurementReady: boolean;
    proofReady: boolean;
    lexicalIndexed: boolean;
    metadataIndexed: boolean;
    vectorProjectionReady: boolean;
    searchable: boolean;
    repairRequired: boolean;
    blockers: string[];
    warnings: string[];
  };
  rightsBoundary: {
    depositorWalletId: string | null;
    btdRange: string | null;
    readerVisibilityBeforeSettlement: 'source-safe-metadata-only';
    protectedSourceBeforeSettlementVisible: false;
    settlementRequiredForSourceBearingAssetPack: true;
    btdOwnershipBoundary: 'depositor-retains-btd-until-settlement-transfer';
  };
  compensationPreview: DepositorySupplyCompensationPreview;
  proofEvidence: {
    hasWalletOrAttestationProof: boolean;
    proofRoot: string | null;
    attestationCount: number;
  };
  measurementEvidence: {
    hasAssetMeasurementEvidence: boolean;
    measurementRoot: string | null;
    measurementProvenanceCount: number;
  };
  readbackEvidence: {
    reconciliationReadbackRoot: string | null;
  };
  searchDocuments: DepositorySupplySearchDocument[];
  vectorProjection: DepositorySupplyVectorProjection;
  storageProjection: DepositorySupplyStorageProjection;
  repairActions: string[];
  sourceSafety: DepositorySupplySourceSafety;
  roots: {
    supplyRoot: string;
    searchDocumentRoot: string;
    vectorProjectionRoot: string;
    storageProjectionRoot: string;
    rightsBoundaryRoot: string;
    compensationPreviewRoot: string;
  };
}

export interface DepositorySupplyCompensationPreview {
  schema: 'bitcode.depository.supply-compensation-preview';
  state: DepositorySupplyCompensationState;
  assetId: string;
  depositId: string;
  depositorWalletId: string | null;
  candidateBtdRange: string | null;
  compensationRoute: {
    payer: 'future-reader-after-settlement';
    payee: 'depositing-wallet';
    priceAsset: 'BTC';
    allocationMethod: 'source-to-shares-largest-remainder';
    sourceToSharesProofState: 'not-created-until-accepted-need-fit-and-settlement';
    btdMintBoundary: 'not-minted-by-deposit-admission';
    btdRightsTransferBoundary: 'reader-receives-rights-only-after-btc-settlement';
  };
  readiness: {
    sourceBound: boolean;
    proofReady: boolean;
    measurementReady: boolean;
    searchable: boolean;
    depositorWalletReady: boolean;
    eligibleForFindingFits: boolean;
    eligibleForCompensationIfSelected: boolean;
    blockers: string[];
    warnings: string[];
  };
  visibility: {
    beforeSettlement: 'source-safe-compensation-route-metadata';
    protectedSourceVisible: false;
    unpaidAssetPackSourceVisible: false;
    walletPrivateMaterialVisible: false;
    settlementPrivatePayloadVisible: false;
  };
  readback: {
    ledgerAccountKeys: string[];
    databaseProjectionTables: string[];
    objectStorageVisibility: 'source-safe-metadata-only-before-settlement';
  };
  roots: {
    compensationRouteRoot: string;
    sourceToSharesPreviewRoot: string;
    readbackRoot: string;
    compensationPreviewRoot: string;
  };
}

export interface DepositorySupplySearchDocument {
  schema: 'bitcode.depository.supply-search-document';
  documentId: string;
  kind: DepositorySupplySearchDocumentKind;
  sourceSafeText: string;
  sourceSafeTextRoot: string;
  tokenCount: number;
  sourcePathRoots: string[];
  symbolRoots: string[];
  constraintRoots: string[];
  protectedSourceVisible: false;
}

export interface DepositorySupplyVectorProjection {
  schema: 'bitcode.depository.supply-vector-projection';
  provider: 'openai';
  model: string;
  dimensions: number;
  distanceMetric: 'cosine';
  vectorStore: ReturnType<typeof buildAssetPackEmbeddingPolicy>['vectorStore'];
  rows: Array<{
    vectorRowId: string;
    assetId: string;
    searchDocumentId: string;
    embeddingInputRoot: string;
    embeddingDimensions: number;
    embeddingPresent: boolean;
    embeddingState: 'ready' | 'pending-embedding' | 'invalid-dimensions';
    protectedSourceVisible: false;
  }>;
}

export interface DepositorySupplyStorageProjection {
  schema: 'bitcode.depository.supply-storage-projection';
  assetPackEvidenceTable: 'deliverables';
  vectorTable: typeof ASSET_PACK_VECTOR_STORAGE_TABLE;
  vectorMatchRpc: 'match_deliverable_vectors';
  sourceSafeColumns: string[];
  privateColumnsExcluded: string[];
  readbackChecks: string[];
}

export interface DepositorySupplySourceSafety {
  sourceSafeMetadataOnly: true;
  protectedSourceVisible: false;
  rawSourceTextVisible: false;
  credentialsSerialized: false;
  walletPrivateMaterialVisible: false;
  unpaidAssetPackSourceVisible: false;
}

export interface DepositorySupplyIndex {
  schema: 'bitcode.depository.supply-index';
  indexId: string;
  createdAt: string;
  records: DepositorySupplyRecord[];
  recordCount: number;
  searchableRecordCount: number;
  repairRequiredRecordCount: number;
  blockedRecordCount: number;
  embeddingPolicy: ReturnType<typeof buildAssetPackEmbeddingPolicy>;
  storageProjection: DepositorySupplyStorageProjection;
  sourceSafety: DepositorySupplySourceSafety;
  roots: {
    indexRoot: string;
    recordRoots: string[];
    storageProjectionRoot: string;
  };
}
