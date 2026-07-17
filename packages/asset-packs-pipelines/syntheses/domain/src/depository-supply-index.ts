/**
 * Depository supply index public entry.
 *
 * Builds searchable source-safe supply records from deposits/assets, asserts
 * serialization boundaries, and projects records into depository search assets.
 * Package export path `./depository-supply-index` remains this file.
 */

import { buildAssetPackEmbeddingPolicy } from './embedding-config';
import type { DepositoryAsset } from './depository-search';
import type {
  DepositorySupplyIndex,
  DepositorySupplyIndexInput,
  DepositorySupplyRecord,
} from './depository-supply-index-types';
import {
  SOURCE_SAFE_METADATA_ONLY,
  buildStorageProjection,
  buildSupplyRecord,
  extractDeposits,
  mapSupplyAssetsFromIndex,
  sha256,
  supplyRoot,
} from './depository-supply-index-helpers';
import { stableStringify } from './deposit-source-safe-utils';

export type {
  DepositorySupplyCompensationPreview,
  DepositorySupplyCompensationState,
  DepositorySupplyIndex,
  DepositorySupplyIndexInput,
  DepositorySupplyLifecycleState,
  DepositorySupplyRecord,
  DepositorySupplySearchDocument,
  DepositorySupplySearchDocumentKind,
  DepositorySupplySourceSafety,
  DepositorySupplyStorageProjection,
  DepositorySupplyVectorProjection,
} from './depository-supply-index-types';

export function buildDepositorySupplyIndex(input: DepositorySupplyIndexInput): DepositorySupplyIndex {
  const records = extractDeposits(input)
    .map((deposit) => buildSupplyRecord({ raw: deposit, fallbackSourceRevision: input.sourceRevision }))
    .filter((record): record is DepositorySupplyRecord => Boolean(record));
  const storageProjection = buildStorageProjection();
  const recordRoots = records.map((record) => record.roots.supplyRoot).sort();
  const indexRoot = supplyRoot('sha256', {
    recordRoots,
    storageProjection,
    embeddingPolicy: buildAssetPackEmbeddingPolicy(),
  });

  return {
    schema: 'bitcode.depository.supply-index',
    indexId: `depository-supply-index:${sha256(recordRoots.join(':')).slice(0, 24)}`,
    createdAt: input.createdAt || new Date().toISOString(),
    records,
    recordCount: records.length,
    searchableRecordCount: records.filter((record) => record.lifecycle.searchable).length,
    repairRequiredRecordCount: records.filter((record) => record.lifecycle.repairRequired).length,
    blockedRecordCount: records.filter((record) => record.lifecycle.state === 'blocked-readiness').length,
    embeddingPolicy: buildAssetPackEmbeddingPolicy(),
    storageProjection,
    sourceSafety: { ...SOURCE_SAFE_METADATA_ONLY },
    roots: {
      indexRoot,
      recordRoots,
      storageProjectionRoot: supplyRoot('sha256', storageProjection),
    },
  };
}

export function assertDepositorySupplyIndexSourceSafe(index: DepositorySupplyIndex): void {
  const serialized = stableStringify(index).toLowerCase();
  const forbidden = [
    `${['sk', 'proj'].join('-')}-`,
    `${['sb', 'secret'].join('_')}__`,
    ['service', 'role'].join('_'),
    ['wallet', 'private', 'key'].join('_'),
    ['raw', 'source', 'text'].join('_'),
    ['unpaid', 'assetpack', 'source'].join('_'),
    ['settlement', 'private', 'payload'].join('_'),
  ];
  for (const marker of forbidden) {
    if (serialized.includes(marker)) {
      throw new Error(`Depository supply index contains forbidden source-safety marker: ${marker}`);
    }
  }
  if (!index.sourceSafety.sourceSafeMetadataOnly) {
    throw new Error('Depository supply index must remain source-safe metadata only.');
  }
}

export function depositorySupplyAssetsFromIndex(index: DepositorySupplyIndex): DepositoryAsset[] {
  return mapSupplyAssetsFromIndex(index);
}
