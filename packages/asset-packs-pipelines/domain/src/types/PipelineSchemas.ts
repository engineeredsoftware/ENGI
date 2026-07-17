import {
  AssetPackDeliveryMechanismTemplate,
  AssetPackWrittenAssetType,
} from './AssetPackWrittenAssetType';
import type { AssetPackFitResultState, DepositorySearchResult } from '../depository-search';
import type { AssetPackDisclosureReview } from '../asset-pack-disclosure';
import type { AssetPackSourceSafePreview, ShareToFeeQuote } from '../read-need';

/**
 * AssetPack synthesis output schemas.
 * writtenAssets / assetPackSynthesisArtifacts = synthesis evidence (SDIVF).
 * settleDelivery = buyer-repo PR surface **after settle Simple only**
 *   (ExecutionPipelineSimpleSettleAssetPack). Synthesis deposit/read pipelines
 *   must not author this field; they emit selection envelopes / options.
 * deliveryMechanism = connected-interface projection of delivery readiness.
 * shippable (singular) = settle-stage PR receipt with prUrl (not Finish shipping).
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

export interface AssetPackResultMeta {
  prUrl?: string;
  branch?: string;
  title?: string;
  mechanism?: AssetPackDeliveryMechanismTemplate;
  payload?: Record<string, unknown>;
}

export type ShippableMeta = AssetPackResultMeta;
export type DeliveryMechanismMeta = ShippableMeta;
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
  shippable?: ShippableMeta;
  /**
   * Buyer-repo delivery after settle Simple (PR URL/summary). Sole field name
   * for that surface (pre-production: no shippables alias).
   */
  settleDelivery?: AssetPackSynthesisArtifactsMeta;
  deliveryMechanism?: DeliveryMechanismMeta;
  writtenAsset?: WrittenAssetResultMeta;
  assetPackSynthesisArtifacts?: AssetPackSynthesisArtifactsMeta;
  writtenAssets?: AssetPackSynthesisArtifactsMeta;
  artifacts?: Partial<AssetPackArtifacts>;
  metrics?: Partial<AssetPackMetrics>;
  writtenAssetType?: AssetPackWrittenAssetType;
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
  /**
   * Not used by synthesis postprocess. Settle pipeline owns shippable / settleDelivery.
   * Left optional only for type compatibility with older consumers reading host output.
   */
  shippable?: ShippableMeta;
  /**
   * Never set by synthesis deposit/read postprocess — settle-pipeline exclusive.
   */
  settleDelivery?: AssetPackSynthesisArtifactsMeta | null;
  /** Deposit/read Finish selection envelope when present. */
  selectionEnvelope?: Record<string, unknown> | null;
  options?: unknown[];
  depositOptions?: unknown[];
  deliveryMechanism?: DeliveryMechanismMeta;
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
