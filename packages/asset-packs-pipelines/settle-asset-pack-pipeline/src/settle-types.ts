/**
 * Strongly typed contracts for SettleAssetPackSimplePipeline and BitcodeERC1155
 * settlement artifacts. No `unknown` on settle/contract surfaces.
 */

import type {
  AssetPackMeasurementsForSettlement,
  BitcodeErc1155State,
  NeedinessRowInput,
  SettlementBtdFromNeedinessesResult,
  SerializedBitcodeErc1155State,
} from '@bitcode/btd/erc1155';

// ---------------------------------------------------------------------------
// AssetPack option (one settle run)
// ---------------------------------------------------------------------------

export interface SettleAssetPackPatch {
  patchSummary?: string;
  path?: string;
  /** Source-safe patch descriptor fields only; raw diff bodies withheld at packs. */
  format?: string;
}

export interface SettleAssetPackOption {
  id?: string;
  optionRoot?: string;
  measurementRoot?: string;
  title?: string;
  kind?: string;
  summary?: string;
  patch?: SettleAssetPackPatch | null;
  measurements: AssetPackMeasurementsForSettlement;
  confidence?: number | null;
  selectable?: boolean;
  settleable?: boolean;
}

export interface SettleRepositoryRef {
  url?: string | null;
  owner?: string | null;
  name?: string | null;
  branch?: string | null;
  commit?: string | null;
  fullName?: string | null;
}

// ---------------------------------------------------------------------------
// Payment / mempool (settle-btc)
// ---------------------------------------------------------------------------

export interface SettleBtcPaymentObservationInput {
  schema?: string;
  network?: string;
  status?: string;
  txId?: string | null;
  amountSats?: number | null;
  confirmedAt?: string | null;
  finality?: string | null;
}

export interface SettleBtcMempoolObservation {
  schema: 'bitcode.settle-btc.mempool-observation';
  txId: string;
  confirmed: boolean;
  blockHeight?: number | null;
  blockTime?: number | null;
  fee?: number | null;
  source?: string;
  error?: string;
}

export interface SettleBtcPaymentObservation {
  schema: 'bitcode.settle-asset-pack.payment-observation';
  agent: 'settle-btc';
  network: string;
  status: 'final' | 'observed' | 'observed-projection';
  txId: string | null;
  amountSats: number | null;
  confirmedAt: string;
  finality: string;
  mempool: SettleBtcMempoolObservation | null;
  note: string;
}

// ---------------------------------------------------------------------------
// Stage artifacts
// ---------------------------------------------------------------------------

export interface SettleValidationBoundary {
  schema: 'bitcode.settle-asset-pack.validation';
  state: string;
  pipeline: 'settle-asset-pack-pipeline';
  selectedCount: 1;
  assetPackKey: string;
  cardinality: '1:1';
}

export interface MintBtdReceiptWire {
  kind: 'btd.erc1155.mint';
  tokenId: string;
  to: string;
  amountBaseUnits: string;
  needFitVolume: number;
  weightedNeedinessesSum: number;
  needinessesCount: number;
  btdTotalMintedBefore: string;
  btdTotalMintedAfter: string;
  maxSupplyBaseUnits: string;
  assetPackKey: string;
  settlementSequence: string;
  proofRoot: string;
  issuedAt: string;
}

export interface MintBtdArtifact {
  schema: 'bitcode.settle-asset-pack.mint-btd';
  agent: 'mint-btd';
  settlementBtd: SettlementBtdFromNeedinessesResult;
  receipt: MintBtdReceiptWire;
  masterAccount: string;
  masterBtdBalance: string;
  note: string;
}

export interface SettleBtdReceiptWire {
  kind: 'btd.erc1155.transfer';
  tokenId: string;
  from: string;
  to: string;
  amountBaseUnits: string;
  assetPackKey: string;
  settlementSequence: string;
  proofRoot: string;
  issuedAt: string;
}

export interface SettleBtdArtifact {
  schema: 'bitcode.settle-asset-pack.settle-btd';
  agent: 'settle-btd';
  receipt: SettleBtdReceiptWire;
  buyerAccount: string;
  buyerBtdBalance: string;
  masterBtdBalance: string;
  note: string;
}

export interface SettleAssetPackReceiptWire {
  kind: 'asset-pack.erc1155.co-own';
  tokenId: string;
  assetPackKey: string;
  addedAccount: string;
  coOwners: string[];
  removedPriorOwner: false;
  settlementSequence: string;
  proofRoot: string;
  issuedAt: string;
}

export interface SettleAssetPackArtifact {
  schema: 'bitcode.settle-asset-pack.settle-asset-pack';
  agent: 'settle-asset-pack';
  receipt: SettleAssetPackReceiptWire;
  coOwners: string[];
  removedPriorOwner: false;
  note: string;
}

export interface SettleRightsArtifact {
  schema: 'bitcode.settle-asset-pack.rights-transfer';
  readerWalletId: string | null;
  depositorWalletId: string | null;
  buyerEthereumAddress: string;
  btdMinted: true;
  btdTransferred: true;
  amountBaseUnits: string;
  status: 'transferred';
}

export interface SettleShippableRepository {
  url: string | null;
  owner: string | null;
  name: string | null;
  branch: string;
  commit: string | null;
  fullName: string | null;
}

export interface SettleShippable {
  schema: 'bitcode.settle-asset-pack.shippable';
  deliveryMechanism: 'pull_request';
  repository: SettleShippableRepository;
  headBranch: string;
  baseBranch: string;
  patchCount: number;
  optionTitle: string;
  measurements: AssetPackMeasurementsForSettlement | null;
  prUrl: string | null;
  status: 'projected' | 'opened' | 'failed';
  prError: string | null;
  note: string;
}

export interface SourceSafePackMeasurementRow {
  kind: string;
  category: 'absolute' | 'neediness';
  volume: number | null;
  magnitude: number | null;
  unit: string | null;
  weight: number | null;
}

export interface PackActivityPaymentObservation {
  schema: string | undefined;
  network: string;
  status: string | null;
  txId: string | null;
  amountSats: number | null;
  finality: string | null;
}

export interface PackActivityShippableSummary {
  schema: string;
  deliveryMechanism: string;
  repository: SettleShippableRepository | null;
  headBranch: string | null;
  baseBranch: string | null;
  patchCount: number;
  prUrl: string | null;
  status: string;
  note: string | null;
}

export interface SettlePackActivity {
  schema: 'bitcode.packs.activity';
  surface: '/packs';
  packActivityType: 'settled-assetpack';
  activityType: 'settled-assetpack';
  settledAt: string;
  repositoryFullName: string | null;
  optionCount: 1;
  assetPackKey: string | null;
  assetPackTitle: string | null;
  optionTitles: string[];
  measurements: SourceSafePackMeasurementRow[];
  settlementState: 'settled';
  rightsState: 'btd-rights-transferred';
  deliveryState: string;
  deliveryReference: string | null;
  prUrl: string | null;
  paymentObservation: PackActivityPaymentObservation | null;
  mintBtd: {
    needFitVolume: number | null;
    amountBaseUnits: string | null;
    masterAccount: string | null;
  } | null;
  settleBtd: {
    buyerAccount: string | null;
    amountBaseUnits: string | null;
  } | null;
  settleAssetPack: {
    tokenId: string | null;
    coOwners: string[];
    removedPriorOwner: false;
  } | null;
  shippable: PackActivityShippableSummary | null;
  rights: SettleRightsArtifact | null;
}

// ---------------------------------------------------------------------------
// Pipeline input / output
// ---------------------------------------------------------------------------

export interface SettleAssetPackInput {
  repository?: SettleRepositoryRef;
  /** Exactly one bought option (1:1 settle). */
  assetPackOption?: SettleAssetPackOption;
  /**
   * Legacy multi-select carrier — only length-1 accepted; length > 1 throws.
   * Prefer `assetPackOption`.
   */
  selectedOptions?: SettleAssetPackOption[];
  synthesizedPacks?: SettleAssetPackOption[];
  paymentObservation?: SettleBtcPaymentObservationInput | SettleBtcPaymentObservation;
  githubAccessToken?: string | null;
  userId?: string | null;
  readerWalletId?: string | null;
  depositorWalletId?: string | null;
  buyerEthereumAddress?: string | null;
  depositorEthereumAddress?: string | null;
  masterEthereumAddress?: string | null;
  erc1155State?: BitcodeErc1155State | null;
  need?: string | null;
  synthesisRunId?: string | null;
  assetPackSettlementRightsDeliveryBoundary?: SettleValidationBoundary | null;
  /** Populated as stages complete (threaded through Simple pipeline). */
  mintBtd?: MintBtdArtifact;
  settleBtd?: SettleBtdArtifact;
  settleAssetPack?: SettleAssetPackArtifact;
  settlementBtd?: SettlementBtdFromNeedinessesResult;
  shippable?: SettleShippable;
  packActivity?: SettlePackActivity;
  settlementFinalized?: boolean;
  success?: boolean;
  summary?: string;
}

export interface SettleAssetPackResult extends SettleAssetPackInput {
  assetPackOption: SettleAssetPackOption;
  selectedOptions: [SettleAssetPackOption];
  success: boolean;
  packActivity: SettlePackActivity;
  summary: string;
  erc1155State: BitcodeErc1155State;
  mintBtd: MintBtdArtifact;
  settleBtd: SettleBtdArtifact;
  settleAssetPack: SettleAssetPackArtifact;
  settlementBtd: SettlementBtdFromNeedinessesResult;
  shippable: SettleShippable;
  paymentObservation: SettleBtcPaymentObservation;
  /** Product AssetPack after settlement (ReadSynthesizedSettledAssetPack). */
  readSynthesizedSettledAssetPack?: import('@bitcode/generic-asset-packs-read-synthesized-settled').ReadSynthesizedSettledAssetPack;
}

/**
 * Execution store surface used by settle stages.
 *
 * Structural: must accept `@bitcode/execution-generics` Execution (StorableValue)
 * while still documenting settle-local value shapes for callers.
 */
export interface SettleExecutionStore {
  store(namespace: string, key: string, value: SettleStoreValue | string | number | boolean | null): void;
  get(namespace: string, key: string): unknown;
}

export type SettleStoreValue =
  | string
  | number
  | boolean
  | null
  | SettleAssetPackOption
  | SettleValidationBoundary
  | SettleBtcPaymentObservation
  | MintBtdArtifact
  | SettleBtdArtifact
  | SettleAssetPackArtifact
  | SettlementBtdFromNeedinessesResult
  | SettleRightsArtifact
  | SettleShippable
  | SettlePackActivity
  | SerializedBitcodeErc1155State
  | BitcodeErc1155State
  | NeedinessRowInput[]
  | SourceSafePackMeasurementRow[];

export type { NeedinessRowInput, AssetPackMeasurementsForSettlement, SerializedBitcodeErc1155State };
