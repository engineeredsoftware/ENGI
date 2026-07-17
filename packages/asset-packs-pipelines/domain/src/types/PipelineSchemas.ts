import {
  AssetPackDeliveryMechanismTemplate,
  AssetPackWrittenAssetType,
} from './AssetPackWrittenAssetType';
import type { AssetPackFitResultState, DepositorySearchResult } from '../depository-search';
import type { AssetPackDisclosureReview } from '../asset-pack-disclosure';
import type { AssetPackSourceSafePreview, ShareToFeeQuote } from '../read-need';

/**
 * AssetPack *synthesis* output schemas (deposit/read SDIVF).
 *
 * writtenAssets / assetPackSynthesisArtifacts = synthesis evidence.
 * selectionEnvelope / options = product selection for /deposits or /reads.
 * reviewReadiness = Finish user-review posture (not Delivery).
 *
 * Exclusive settle-pipeline vocabulary (never on synthesis results):
 *   - Settlement = BTD-BTC payment + Bitcode System finalities
 *   - Delivery = settled Synthesized Read AssetPack(s) shipped as buyer-repo PRs
 *   - settleDelivery, shippable, delivery unlock, settlement rights boundary
 *
 * deliveryMechanismTemplate = catalog shape hint only (not Delivery execution).
 */

export interface AssetPackArtifacts {
  filesCreated: string[];
  filesModified: string[];
  testsAdded: number;
  testsPassing?: number;
  documentation: string[];
}

export interface AssetPackMetrics {
  duration: number;
  tokensUsed: number;
  measuredBtd: number;
  confidence: number;
}

/** Review / readiness projection only — no prUrl (settle exclusive). */
export interface AssetPackResultMeta {
  branch?: string;
  title?: string;
  mechanism?: AssetPackDeliveryMechanismTemplate;
  payload?: Record<string, unknown>;
  /** @deprecated settle-only; synthesis must not set prUrl */
  prUrl?: string;
}

export type DeliveryMechanismMeta = AssetPackResultMeta;
export type WrittenAssetResultMeta = AssetPackResultMeta;

export interface AssetPackSynthesisArtifactsMeta {
  summary?: string;
  fileChanges?: unknown;
  proofEvidence?: string[];
  reviewNotes?: string[];
  [key: string]: unknown;
}

export interface AssetPackOutput {
  success: boolean;
  summary?: string;
  /** Finish user-review posture — not Delivery (PR ship). */
  reviewReadiness?: DeliveryMechanismMeta;
  writtenAsset?: WrittenAssetResultMeta;
  assetPackSynthesisArtifacts?: AssetPackSynthesisArtifactsMeta;
  writtenAssets?: AssetPackSynthesisArtifactsMeta;
  artifacts?: Partial<AssetPackArtifacts>;
  metrics?: Partial<AssetPackMetrics>;
  writtenAssetType?: AssetPackWrittenAssetType;
  /** Catalog shape hint only — not Delivery execution. */
  deliveryMechanismTemplate?: AssetPackDeliveryMechanismTemplate;
  read?: string;
  semanticKind?: 'asset-pack-written-asset';
  resultState?: AssetPackFitResultState;
  fitResult?: {
    resultState: AssetPackFitResultState;
    resultReasons?: string[];
    selectedCandidateAssetIds?: string[];
    queryRoot?: string;
    rankingRoot?: string;
    searchedAssetCount?: number;
    embeddingPolicy?: DepositorySearchResult['embeddingPolicy'];
  };
  fit?: AssetPackOutput['fitResult'];
  depositorySearch?: DepositorySearchResult;
  sourceSafePreview?: AssetPackSourceSafePreview;
  assetPackDisclosureReview?: AssetPackDisclosureReview;
  feeQuote?: ShareToFeeQuote;
  selectionEnvelope?: Record<string, unknown>;
  options?: unknown[];
  depositOptions?: unknown[];
}

export type AssetPackWrittenAssetTypeValue =
  | 'read-satisfaction-asset-pack';
export type WrittenAssetTypeValue = AssetPackWrittenAssetTypeValue;
export type AssetPackDeliveryMechanismTemplateValue = AssetPackDeliveryMechanismTemplate;

export type AssetPackPostprocessedKind =
  /** Deposit synthesis: options for /deposits selection (not settle). */
  | 'deposit_options'
  /** Read synthesis: options for /reads → later settle-asset-pack-pipeline. */
  | 'read_options'
  /** Generic synthesis completion evidence (no settle PR). */
  | 'asset_pack_synthesis';
// Note: settle_delivery is never a synthesis postprocess kind — that result
// shape is produced only by settle-asset-pack-pipeline.

export interface AssetPackPostprocessed {
  executionId: string;
  kind: AssetPackPostprocessedKind;
  semanticKind?: 'asset-pack-written-asset';
  title: string;
  repository?: string;
  summary?: string;
  /** Deposit/read Finish selection envelope when present. */
  selectionEnvelope?: Record<string, unknown> | null;
  options?: unknown[];
  depositOptions?: unknown[];
  /** User-review posture — never Delivery (PR) or Settlement. */
  reviewReadiness?: DeliveryMechanismMeta;
  assetPackSynthesisArtifacts?: AssetPackSynthesisArtifactsMeta | null;
  writtenAssets?: AssetPackSynthesisArtifactsMeta | null;
  artifacts?: Partial<AssetPackArtifacts> | null;
  writtenAssetType?: AssetPackWrittenAssetType;
  deliveryMechanismTemplate?: AssetPackDeliveryMechanismTemplate;
  read?: string;
  resultState?: AssetPackFitResultState;
  fitResult?: AssetPackOutput['fitResult'];
  fit?: AssetPackOutput['fitResult'];
  depositorySearch?: DepositorySearchResult;
  sourceSafePreview?: AssetPackSourceSafePreview;
  assetPackDisclosureReview?: AssetPackDisclosureReview;
  feeQuote?: ShareToFeeQuote;
  assetPack?: {
    read?: string;
    writtenAssetType?: AssetPackWrittenAssetType;
    deliveryMechanismTemplate?: AssetPackDeliveryMechanismTemplate;
  };
  validationReady?: {
    approved: boolean;
    assessment?: unknown | null;
    confidence?: number | null;
  };
}
export interface AssetPackRepositoryRef {
  url: string;
  owner?: string;
  name?: string;
  branch?: string;
}

export interface AssetPackRequirements {
  testCoverage?: number;
  documentationRequired?: boolean;
  securityScanRequired?: boolean;
}

export interface AssetPackInput {
  definitionOfRead?: string;
  read?: string;
  repository: AssetPackRepositoryRef;
  sourceRevision?: {
    repositoryFullName?: string;
    branch?: string;
    commit?: string;
  };
  depositoryAssets?: unknown[];
  depositCandidates?: unknown[];
  requirements?: AssetPackRequirements;
  deliveryTarget?: 'pr';
  deliveryMechanismTemplate?: AssetPackDeliveryMechanismTemplate;
  writtenAssetType?: string;
}

export type AssetPackSynthesisInput = AssetPackInput;
export type AssetPackWrittenAssetOutput = AssetPackOutput;
export type AssetPackWrittenAssetPostprocessed = AssetPackPostprocessed;
export type ShippableOutput = AssetPackOutput;
export type ShippablePostprocessed = AssetPackPostprocessed;
