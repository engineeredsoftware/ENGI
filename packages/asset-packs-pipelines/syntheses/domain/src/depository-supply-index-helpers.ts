/**
 * Pure helpers for depository supply index construction.
 *
 * Scalar/string/path utilities and deposit extraction. Heavier build-record and
 * projection builders live in sibling modules and are re-exported here so the
 * public `depository-supply-index` entry keeps a single helpers import path.
 */

import { createHash } from 'node:crypto';
import type {
  DepositorySupplyIndexInput,
  DepositorySupplySourceSafety,
} from './depository-supply-index-types';
import { stableStringify } from './deposit-source-safe-utils';

export const SOURCE_SAFE_METADATA_ONLY: DepositorySupplySourceSafety = {
  sourceSafeMetadataOnly: true,
  protectedSourceVisible: false,
  rawSourceTextVisible: false,
  credentialsSerialized: false,
  walletPrivateMaterialVisible: false,
  unpaidAssetPackSourceVisible: false,
};

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** SHA-256 content root (`prefix:hex`) used throughout the supply index. */
export function supplyRoot(prefix: string, value: unknown): string {
  return `${prefix}:${sha256(stableStringify(value))}`;
}

export function recordValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    const candidate = stringValue(value);
    if (candidate) return candidate;
  }
  return null;
}

export function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => stringValue(entry)).filter(Boolean);
}

export function getPath(value: unknown, path: string[]): unknown {
  let cursor: unknown = value;
  for (const part of path) {
    if (!cursor || typeof cursor !== 'object' || Array.isArray(cursor)) return undefined;
    cursor = (cursor as Record<string, unknown>)[part];
  }
  return cursor;
}

export function normalizeArtifactKind(value: unknown): string {
  return (stringValue(value) || 'asset-pack-evidence').toLowerCase().replace(/[_\s]+/g, '-');
}

export function tokensFrom(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 2);
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort();
}

export function rootsFor(values: string[], prefix: string): string[] {
  return uniqueSorted(values).map((value) => supplyRoot(prefix, value));
}

export function extractDeposits(input: DepositorySupplyIndexInput): unknown[] {
  const deposits = [
    ...(Array.isArray(input.deposits) ? input.deposits : []),
    ...(Array.isArray(input.depositoryAssets) ? input.depositoryAssets : []),
  ];

  if (deposits.length) return deposits;
  const sourceRevision = recordValue(input.sourceRevision);
  return sourceRevision ? [{ sourceRevision, assetId: 'deposit-reference' }] : [];
}

// Re-export build-record + projections so existing `from './depository-supply-index-helpers'` imports stay valid.
export {
  buildSupplyRecord,
  contentUnitFacts,
  recordEmbeddingInputs,
  resolveSourceRevision,
  sanitizeSourceSafeText,
} from './depository-supply-index-build-record';

export {
  buildCompensationPreview,
  buildSearchDocument,
  buildStorageProjection,
  buildVectorProjection,
  contentUnitFromSupplyRecord,
  mapSupplyAssetsFromIndex,
} from './depository-supply-index-projections';
