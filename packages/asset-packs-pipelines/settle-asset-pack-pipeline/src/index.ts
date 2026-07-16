/**
 * @bitcode/asset-packs-pipelines-settle-asset-pack-pipeline
 *
 * Product pipeline name: **settle-asset-pack-pipeline** (singular AssetPack).
 *
 * Hierarchy: SettleAssetPack + Simple + Pipeline
 *   factoryExecutionPipelineSimpleSettleAssetPack → ExecutionPipelineSimpleSettleAssetPack
 *
 * **Not** SDIVF. Synthesize-reads produces multiple options; each **bought**
 * option starts its own settle pipeline (1:1 AssetPack : settle run) and yields
 * ReadSynthesizedSettledAssetPack commercial state.
 *
 * Stages (binding V48 law):
 *   1. validate-settlement-readiness
 *   2. settle-btc
 *   3. mint-btd
 *   4. settle-btd
 *   5. settle-asset-pack
 *   6. ship-asset-pack-patch-pr
 *   7. journal-and-pack-activity
 *
 * All settle/contract surfaces are strongly typed (see settle-types.ts).
 */

import { createHash } from 'crypto';
import type { Executor } from '@bitcode/execution-generics';
import {
  factoryExecutionPipelineSimple,
  type ExecutionPipelineSimple,
} from '@bitcode/generic-pipelines-simple';
import {
  addAssetPackCoOwner,
  assertPositiveSettlementBtd,
  balanceOf,
  BITCODE_BTD_TOKEN_ID,
  computeSettlementBtdFromNeedinesses,
  createBitcodeErc1155State,
  mintBtdToMaster,
  serializeBitcodeErc1155State,
  transferBtdFromMasterToBuyer,
  type BitcodeErc1155State,
} from '@bitcode/btd/erc1155';
import { buildReadSynthesizedAssetPack } from '@bitcode/generic-asset-packs-read-synthesized';
import {
  buildReadSynthesizedSettledAssetPack,
  type ReadSynthesizedSettledAssetPack,
} from '@bitcode/generic-asset-packs-read-synthesized-settled';
import type {
  MintBtdArtifact,
  PackActivityPaymentObservation,
  PackActivityShippableSummary,
  SettleAssetPackArtifact,
  SettleAssetPackOption,
  SettleAssetPackInput,
  SettleAssetPackResult,
  SettleBtcMempoolObservation,
  SettleBtcPaymentObservation,
  SettleExecutionStore,
  SettlePackActivity,
  SettleRightsArtifact,
  SettleShippable,
  SettleStoreValue,
  SettleValidationBoundary,
  SourceSafePackMeasurementRow,
  SettleBtdArtifact,
} from './settle-types';

export type { SettleAssetPackInput, SettleAssetPackResult, SettleAssetPackOption };
export type * from './settle-types';
export { parseSettleAssetPackOption, parseSettleAssetPackOptions } from './parse-settle-option';

export type ExecutionPipelineSimpleSettleAssetPack = ExecutionPipelineSimple<
  SettleAssetPackInput,
  SettleAssetPackResult
>;

function optionToReadSynthesized(option: SettleAssetPackOption) {
  const needinesses = (option.measurements?.needinesses ?? []).map((row) => {
    const measurementKind =
      'measurementKind' in row && typeof row.measurementKind === 'string'
        ? row.measurementKind
        : 'kind' in row && typeof row.kind === 'string'
          ? row.kind
          : 'need-fit';
    return {
      measurementKind,
      volume: typeof row.volume === 'number' ? row.volume : 0,
      magnitude: typeof row.magnitude === 'number' ? row.magnitude : typeof row.volume === 'number' ? row.volume : 0,
      weight: typeof row.weight === 'number' ? row.weight : 0,
      unit: typeof row.unit === 'string' ? row.unit : 'fit',
      category: 'neediness' as const,
    };
  });
  const absolutes = (option.measurements?.absolutes ?? []).map((row) => {
    const measurementKind =
      typeof row.measurementKind === 'string'
        ? row.measurementKind
        : typeof row.kind === 'string'
          ? row.kind
          : 'absolute';
    return {
      measurementKind,
      volume: typeof row.volume === 'number' ? row.volume : 0,
      magnitude: typeof row.magnitude === 'number' ? row.magnitude : 0,
      weight: typeof row.weight === 'number' ? row.weight : 0,
      unit: typeof row.unit === 'string' ? row.unit : 'normalized',
      category: 'absolute' as const,
    };
  });
  return buildReadSynthesizedAssetPack({
    assetPackId:
      (typeof option.id === 'string' && option.id) ||
      (typeof option.optionRoot === 'string' && option.optionRoot) ||
      `settled-${Date.now().toString(36)}`,
    title: option.title || 'AssetPack',
    summary: option.summary || option.title || 'Settled AssetPack',
    measurements: { absolutes, needinesses },
    kind: option.kind ?? null,
    needFit: null,
    settleable: true,
  });
}
/**
 * Settle stages receive the pipeline `Execution` (StorableValue), not a
 * settle-only store. Use a structural duck type so both assign cleanly.
 */
type SettleStageExecution = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Execution + SettleExecutionStore bridge
  store?(namespace: string, key: string, value: any): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Execution + SettleExecutionStore bridge
  get?(namespace: string, key: string): any;
};

function storeCrossPhaseArtifact(
  execution: SettleStageExecution | null | undefined,
  namespace: string,
  key: string,
  value: SettleStoreValue,
): void {
  try {
    execution?.store?.(namespace, key, value);
  } catch {
    /* storage must never decide pipeline success */
  }
}

function getStored<T extends SettleStoreValue>(
  execution: SettleStageExecution | null | undefined,
  namespace: string,
  key: string,
): T | undefined {
  return execution?.get?.(namespace, key) as T | undefined;
}

function resolveSingleOption(input: SettleAssetPackInput): SettleAssetPackOption {
  if (input.assetPackOption) {
    return input.assetPackOption;
  }
  const list: SettleAssetPackOption[] = Array.isArray(input.selectedOptions)
    ? input.selectedOptions
    : Array.isArray(input.synthesizedPacks)
      ? input.synthesizedPacks
      : [];
  if (list.length === 0) {
    throw new Error(
      'SettleAssetPack requires exactly one assetPackOption (1:1 AssetPack : settle pipeline).',
    );
  }
  if (list.length > 1) {
    throw new Error(
      `SettleAssetPack is 1:1 per bought option; received ${list.length}. Spawn one pipeline per option.`,
    );
  }
  return list[0];
}

function assetPackKeyFor(option: SettleAssetPackOption, input: SettleAssetPackInput): string {
  if (typeof option.id === 'string' && option.id.trim()) return option.id.trim();
  if (typeof option.optionRoot === 'string' && option.optionRoot.trim()) {
    return option.optionRoot.trim();
  }
  const title = typeof option.title === 'string' ? option.title : 'option';
  const seed = `${input.synthesisRunId || 'run'}:${title}:${option.kind || ''}`;
  return createHash('sha256').update(seed).digest('hex').slice(0, 32);
}

function defaultMasterAddress(input: SettleAssetPackInput): string {
  return (
    (typeof input.masterEthereumAddress === 'string' && input.masterEthereumAddress.trim()) ||
    '0xbitcode-master-treasury'
  );
}

function defaultBuyerAddress(input: SettleAssetPackInput): string {
  return (
    (typeof input.buyerEthereumAddress === 'string' && input.buyerEthereumAddress.trim()) ||
    (typeof input.readerWalletId === 'string' && input.readerWalletId.trim()) ||
    `0xreader-${input.userId || 'anonymous'}`
  );
}

function defaultDepositorAddress(input: SettleAssetPackInput): string {
  return (
    (typeof input.depositorEthereumAddress === 'string' &&
      input.depositorEthereumAddress.trim()) ||
    (typeof input.depositorWalletId === 'string' && input.depositorWalletId.trim()) ||
    '0xdepositor'
  );
}

function ensureErc1155State(
  input: SettleAssetPackInput,
  master: string,
): BitcodeErc1155State {
  return (
    input.erc1155State ||
    createBitcodeErc1155State({
      masterAccount: master,
      operator: '0xbitcode-settlement-operator',
      name: 'Bitcode',
      symbol: 'BTD',
    })
  );
}

function isSettleBtcObservation(
  value: SettleAssetPackInput['paymentObservation'],
): value is SettleBtcPaymentObservation {
  return (
    typeof value === 'object' &&
    value !== null &&
    'agent' in value &&
    (value as SettleBtcPaymentObservation).agent === 'settle-btc' &&
    (value as SettleBtcPaymentObservation).schema ===
      'bitcode.settle-asset-pack.payment-observation'
  );
}

// ---------------------------------------------------------------------------
// 1. validate-settlement-readiness
// ---------------------------------------------------------------------------
const validateSettlementReadiness: Executor<SettleAssetPackInput, SettleAssetPackInput> = async (
  input,
  execution,
) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'stage', 'validate-settlement-readiness');
  const assetPackOption = resolveSingleOption(input);
  const assetPackKey = assetPackKeyFor(assetPackOption, input);
  const boundary: SettleValidationBoundary =
    input.assetPackSettlementRightsDeliveryBoundary || {
      schema: 'bitcode.settle-asset-pack.validation',
      state: 'ready',
      pipeline: 'settle-asset-pack-pipeline',
      selectedCount: 1,
      assetPackKey,
      cardinality: '1:1',
    };
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'validation', boundary);
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'assetPackOption', assetPackOption);
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'assetPackKey', assetPackKey);
  return {
    ...input,
    assetPackOption,
    selectedOptions: [assetPackOption],
    assetPackSettlementRightsDeliveryBoundary: boundary,
  };
};

// ---------------------------------------------------------------------------
// 2. settle-btc
// ---------------------------------------------------------------------------
interface MempoolTxJson {
  fee?: number;
  status?: {
    confirmed?: boolean;
    block_height?: number;
    block_time?: number;
  };
}

const settleBtc: Executor<SettleAssetPackInput, SettleAssetPackInput> = async (
  input,
  execution,
) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'stage', 'settle-btc');
  const prior = input.paymentObservation ?? {};
  const txId =
    typeof prior.txId === 'string' && prior.txId.trim() ? prior.txId.trim() : null;
  let mempool: SettleBtcMempoolObservation | null = null;

  if (txId) {
    try {
      const network =
        typeof prior.network === 'string' && prior.network.includes('main')
          ? 'mainnet'
          : 'testnet';
      const base =
        network === 'mainnet'
          ? 'https://mempool.space/api'
          : 'https://mempool.space/testnet/api';
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8_000);
      const res = await fetch(`${base}/tx/${encodeURIComponent(txId)}`, {
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));
      if (res.ok) {
        const body = (await res.json()) as MempoolTxJson;
        const status = body.status ?? {};
        mempool = {
          schema: 'bitcode.settle-btc.mempool-observation',
          txId,
          confirmed: Boolean(status.confirmed),
          blockHeight: status.block_height ?? null,
          blockTime: status.block_time ?? null,
          fee: body.fee ?? null,
          source: base,
        };
      } else {
        mempool = {
          schema: 'bitcode.settle-btc.mempool-observation',
          txId,
          confirmed: false,
          error: `mempool HTTP ${res.status}`,
          source: base,
        };
      }
    } catch (err) {
      mempool = {
        schema: 'bitcode.settle-btc.mempool-observation',
        txId,
        confirmed: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  const confirmed = Boolean(mempool?.confirmed);
  const observation: SettleBtcPaymentObservation = {
    schema: 'bitcode.settle-asset-pack.payment-observation',
    agent: 'settle-btc',
    network: typeof prior.network === 'string' ? prior.network : 'btc-testnet',
    status: confirmed ? 'final' : txId ? 'observed' : 'observed-projection',
    txId,
    amountSats: typeof prior.amountSats === 'number' ? prior.amountSats : null,
    confirmedAt: confirmed
      ? new Date(
          typeof mempool?.blockTime === 'number' ? mempool.blockTime * 1000 : Date.now(),
        ).toISOString()
      : prior.confirmedAt || new Date().toISOString(),
    finality: confirmed
      ? 'testnet-confirmed'
      : txId
        ? 'testnet-mempool-observed'
        : 'testnet-projected',
    mempool,
    note: confirmed
      ? 'BTC payment confirmed on-chain (mempool observation).'
      : txId
        ? 'BTC txId observed via mempool API; awaiting confirmations or projected finality for testnet settle.'
        : 'Projected testnet payment observation (supply txId for live mempool watch).',
  };
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'paymentObservation', observation);
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'settleBtc', observation);
  return { ...input, paymentObservation: observation };
};

// ---------------------------------------------------------------------------
// 3. mint-btd
// ---------------------------------------------------------------------------
const mintBtd: Executor<SettleAssetPackInput, SettleAssetPackInput> = async (
  input,
  execution,
) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'stage', 'mint-btd');
  const option =
    getStored<SettleAssetPackOption>(execution, 'settle-asset-pack-pipeline', 'assetPackOption') ||
    resolveSingleOption(input);
  const assetPackKey =
    getStored<string>(execution, 'settle-asset-pack-pipeline', 'assetPackKey') ||
    assetPackKeyFor(option, input);

  const settlementBtd = assertPositiveSettlementBtd(
    computeSettlementBtdFromNeedinesses(option.measurements, { assetPackKey }),
  );

  const master = defaultMasterAddress(input);
  const state = ensureErc1155State(input, master);

  const { state: nextState, receipt } = mintBtdToMaster(state, {
    amountBaseUnits: settlementBtd.amountBaseUnits,
    needFitVolume: settlementBtd.needFitVolume,
    weightedNeedinessesSum: settlementBtd.weightedNeedinessesSum,
    needinessesCount: settlementBtd.needinessesCount,
    assetPackKey,
    proofRoot: settlementBtd.proofRoot,
  });

  const mintArtifact: MintBtdArtifact = {
    schema: 'bitcode.settle-asset-pack.mint-btd',
    agent: 'mint-btd',
    settlementBtd,
    receipt: {
      kind: receipt.kind,
      tokenId: receipt.tokenId.toString(),
      to: receipt.to,
      amountBaseUnits: receipt.amountBaseUnits.toString(),
      needFitVolume: receipt.needFitVolume,
      weightedNeedinessesSum: receipt.weightedNeedinessesSum,
      needinessesCount: receipt.needinessesCount,
      btdTotalMintedBefore: receipt.btdTotalMintedBefore.toString(),
      btdTotalMintedAfter: receipt.btdTotalMintedAfter.toString(),
      maxSupplyBaseUnits: receipt.maxSupplyBaseUnits.toString(),
      assetPackKey: receipt.assetPackKey,
      settlementSequence: receipt.settlementSequence.toString(),
      proofRoot: receipt.proofRoot,
      issuedAt: receipt.issuedAt,
    },
    masterAccount: master,
    masterBtdBalance: balanceOf(nextState, master, BITCODE_BTD_TOKEN_ID).toString(),
    note:
      'BTD minted to master from needinesses-weighted scalar only (absolutes excluded). Finite 21M supply.',
  };
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'mintBtd', mintArtifact);
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'settlementBtd', settlementBtd);
  storeCrossPhaseArtifact(
    execution,
    'settle-asset-pack-pipeline',
    'erc1155State',
    serializeBitcodeErc1155State(nextState),
  );
  return {
    ...input,
    erc1155State: nextState,
    mintBtd: mintArtifact,
    settlementBtd,
  };
};

// ---------------------------------------------------------------------------
// 4. settle-btd
// ---------------------------------------------------------------------------
const settleBtd: Executor<SettleAssetPackInput, SettleAssetPackInput> = async (
  input,
  execution,
) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'stage', 'settle-btd');
  const mintArtifact =
    input.mintBtd ||
    getStored<MintBtdArtifact>(execution, 'settle-asset-pack-pipeline', 'mintBtd');
  const settlementBtd =
    input.settlementBtd ||
    getStored<MintBtdArtifact['settlementBtd']>(execution, 'settle-asset-pack-pipeline', 'settlementBtd') ||
    mintArtifact?.settlementBtd;
  if (!settlementBtd || settlementBtd.amountBaseUnits <= 0n) {
    throw new Error('settle-btd requires prior mint-btd with positive amountBaseUnits.');
  }
  const amountBaseUnits = settlementBtd.amountBaseUnits;

  const buyer = defaultBuyerAddress(input);
  const master = defaultMasterAddress(input);
  const assetPackKey =
    getStored<string>(execution, 'settle-asset-pack-pipeline', 'assetPackKey') || 'asset-pack';
  let state = ensureErc1155State(input, master);

  if (balanceOf(state, master, BITCODE_BTD_TOKEN_ID) < amountBaseUnits) {
    const reMint = mintBtdToMaster(state, {
      amountBaseUnits,
      needFitVolume: settlementBtd.needFitVolume,
      weightedNeedinessesSum: settlementBtd.weightedNeedinessesSum,
      needinessesCount: settlementBtd.needinessesCount,
      assetPackKey,
      proofRoot: settlementBtd.proofRoot || 'btd-remint',
    });
    state = reMint.state;
  }

  const { state: nextState, receipt } = transferBtdFromMasterToBuyer(state, {
    buyerAccount: buyer,
    amountBaseUnits,
    assetPackKey,
  });

  const settleBtdArtifact: SettleBtdArtifact = {
    schema: 'bitcode.settle-asset-pack.settle-btd',
    agent: 'settle-btd',
    receipt: {
      kind: receipt.kind,
      tokenId: receipt.tokenId.toString(),
      from: receipt.from,
      to: receipt.to,
      amountBaseUnits: receipt.amountBaseUnits.toString(),
      assetPackKey: receipt.assetPackKey,
      settlementSequence: receipt.settlementSequence.toString(),
      proofRoot: receipt.proofRoot,
      issuedAt: receipt.issuedAt,
    },
    buyerAccount: buyer,
    buyerBtdBalance: balanceOf(nextState, buyer, BITCODE_BTD_TOKEN_ID).toString(),
    masterBtdBalance: balanceOf(nextState, master, BITCODE_BTD_TOKEN_ID).toString(),
    note: 'BTD transferred from master treasury to buyer Ethereum wallet.',
  };
  const rights: SettleRightsArtifact = {
    schema: 'bitcode.settle-asset-pack.rights-transfer',
    readerWalletId: input.readerWalletId || null,
    depositorWalletId: input.depositorWalletId || null,
    buyerEthereumAddress: buyer,
    btdMinted: true,
    btdTransferred: true,
    amountBaseUnits: amountBaseUnits.toString(),
    status: 'transferred',
  };
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'settleBtd', settleBtdArtifact);
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'rights', rights);
  storeCrossPhaseArtifact(
    execution,
    'settle-asset-pack-pipeline',
    'erc1155State',
    serializeBitcodeErc1155State(nextState),
  );
  return {
    ...input,
    erc1155State: nextState,
    settleBtd: settleBtdArtifact,
    settlementFinalized: true,
  };
};

// ---------------------------------------------------------------------------
// 5. settle-asset-pack
// ---------------------------------------------------------------------------
const settleAssetPack: Executor<SettleAssetPackInput, SettleAssetPackInput> = async (
  input,
  execution,
) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'stage', 'settle-asset-pack');
  const option =
    getStored<SettleAssetPackOption>(execution, 'settle-asset-pack-pipeline', 'assetPackOption') ||
    resolveSingleOption(input);
  const assetPackKey =
    getStored<string>(execution, 'settle-asset-pack-pipeline', 'assetPackKey') ||
    assetPackKeyFor(option, input);
  const buyer = defaultBuyerAddress(input);
  const depositor = defaultDepositorAddress(input);
  const master = defaultMasterAddress(input);
  const state = ensureErc1155State(input, master);

  const metadataRoot =
    (typeof option.optionRoot === 'string' && option.optionRoot) ||
    (typeof option.measurementRoot === 'string' && option.measurementRoot) ||
    `ap-meta:${assetPackKey}`;

  const { state: nextState, receipt } = addAssetPackCoOwner(state, {
    assetPackKey,
    buyerAccount: buyer,
    depositorAccount: depositor,
    metadataRoot,
  });

  const settleApArtifact: SettleAssetPackArtifact = {
    schema: 'bitcode.settle-asset-pack.settle-asset-pack',
    agent: 'settle-asset-pack',
    receipt: {
      kind: receipt.kind,
      tokenId: receipt.tokenId.toString(),
      assetPackKey: receipt.assetPackKey,
      addedAccount: receipt.addedAccount,
      coOwners: [...receipt.coOwners],
      removedPriorOwner: false,
      settlementSequence: receipt.settlementSequence.toString(),
      proofRoot: receipt.proofRoot,
      issuedAt: receipt.issuedAt,
    },
    coOwners: [...receipt.coOwners],
    removedPriorOwner: false,
    note:
      'Buyer added as equal AssetPack co-owner (ERC1155). Depositor retains ownership; burn/remove forbidden.',
  };
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'settleAssetPack', settleApArtifact);
  storeCrossPhaseArtifact(
    execution,
    'settle-asset-pack-pipeline',
    'erc1155State',
    serializeBitcodeErc1155State(nextState),
  );
  return {
    ...input,
    erc1155State: nextState,
    settleAssetPack: settleApArtifact,
  };
};

// ---------------------------------------------------------------------------
// 6. ship-asset-pack-patch-pr
// ---------------------------------------------------------------------------
interface CreatePullRequestResult {
  url?: string;
  html_url?: string;
  htmlUrl?: string;
}

const shipAssetPackPatchPr: Executor<SettleAssetPackInput, SettleAssetPackInput> = async (
  input,
  execution,
) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'stage', 'ship-asset-pack-patch-pr');
  const repo = input.repository || {};
  const option =
    getStored<SettleAssetPackOption>(execution, 'settle-asset-pack-pipeline', 'assetPackOption') ||
    resolveSingleOption(input);
  const title = typeof option.title === 'string' ? option.title : 'AssetPack delivery';
  const patch = option.patch ?? null;
  const measurements = option.measurements ?? null;

  const owner =
    (typeof repo.owner === 'string' && repo.owner) ||
    (typeof repo.fullName === 'string' ? repo.fullName.split('/')[0] : null);
  const name =
    (typeof repo.name === 'string' && repo.name) ||
    (typeof repo.fullName === 'string' ? repo.fullName.split('/')[1] : null);
  const baseBranch = (typeof repo.branch === 'string' && repo.branch) || 'main';
  const headBranch = `bitcode/settle-asset-pack-${Date.now().toString(36)}`;

  let prUrl: string | null = null;
  let status: SettleShippable['status'] = 'projected';
  let note =
    'Settle ships the AssetPack .patch against the reading repository; live PR when credentials allow.';
  let prError: string | null = null;

  if (input.githubAccessToken && owner && name && patch) {
    try {
      const { createPullRequest } = await import('@bitcode/generic-vcs-git');
      const bodyLines = [
        '## Bitcode SettleAssetPack delivery',
        '',
        '1:1 AssetPack settlement after BTC finality, BTD mint/transfer, and ERC1155 co-ownership.',
        '',
        `### ${title}`,
        '',
        typeof patch.patchSummary === 'string'
          ? patch.patchSummary
          : 'Patch descriptor attached.',
      ];
      const pr = (await createPullRequest({
        provider: 'github',
        accessToken: input.githubAccessToken,
        owner,
        repo: name,
        title: `Bitcode: ${title}`,
        body: bodyLines.join('\n'),
        sourceBranch: headBranch,
        targetBranch: baseBranch,
      })) as CreatePullRequestResult;
      prUrl = pr.url || pr.html_url || pr.htmlUrl || null;
      status = prUrl ? 'opened' : 'projected';
      note = prUrl
        ? 'Live GitHub pull request opened for AssetPack patch delivery.'
        : 'Pull request API returned without URL; shippable recorded as projected.';
    } catch (err) {
      status = 'failed';
      prError = err instanceof Error ? err.message : String(err);
      note = `Live PR open failed (${prError}); shippable recorded for repair.`;
    }
  }

  const shippable: SettleShippable = {
    schema: 'bitcode.settle-asset-pack.shippable',
    deliveryMechanism: 'pull_request',
    repository: {
      url: repo.url || null,
      owner: owner || null,
      name: name || null,
      branch: baseBranch,
      commit: repo.commit || null,
      fullName: repo.fullName || (owner && name ? `${owner}/${name}` : null),
    },
    headBranch,
    baseBranch,
    patchCount: patch ? 1 : 0,
    optionTitle: title,
    measurements,
    prUrl,
    status,
    prError,
    note,
  };
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'shippable', shippable);
  return { ...input, shippable, success: status !== 'failed' };
};

// ---------------------------------------------------------------------------
// 7. journal-and-pack-activity
// ---------------------------------------------------------------------------
function projectSourceSafePackMeasurements(
  option: SettleAssetPackOption,
): SourceSafePackMeasurementRow[] {
  const measurements = option.measurements;
  const rows: SourceSafePackMeasurementRow[] = [];
  for (const raw of measurements.absolutes ?? []) {
    const kind =
      (typeof raw.kind === 'string' && raw.kind) ||
      (typeof raw.measurementKind === 'string' && raw.measurementKind) ||
      null;
    if (!kind) continue;
    rows.push({
      kind,
      category: 'absolute',
      volume: typeof raw.volume === 'number' ? raw.volume : null,
      magnitude: typeof raw.magnitude === 'number' ? raw.magnitude : null,
      unit: typeof raw.unit === 'string' ? raw.unit : null,
      weight: typeof raw.weight === 'number' ? raw.weight : null,
    });
  }
  for (const raw of measurements.needinesses ?? []) {
    const kind =
      'measurementKind' in raw && typeof raw.measurementKind === 'string'
        ? raw.measurementKind
        : 'kind' in raw && typeof raw.kind === 'string'
          ? raw.kind
          : null;
    if (!kind) continue;
    rows.push({
      kind,
      category: 'neediness',
      volume: typeof raw.volume === 'number' ? raw.volume : null,
      magnitude: null,
      unit: typeof raw.unit === 'string' ? raw.unit : null,
      weight: typeof raw.weight === 'number' ? raw.weight : null,
    });
  }
  return rows;
}

const journalAndPackActivity: Executor<SettleAssetPackInput, SettleAssetPackResult> = async (
  input,
  execution,
) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'stage', 'journal-and-pack-activity');
  const option =
    getStored<SettleAssetPackOption>(execution, 'settle-asset-pack-pipeline', 'assetPackOption') ||
    input.assetPackOption ||
    resolveSingleOption(input);
  const assetPackKey =
    getStored<string>(execution, 'settle-asset-pack-pipeline', 'assetPackKey') || null;
  const shippable =
    input.shippable ||
    getStored<SettleShippable>(execution, 'settle-asset-pack-pipeline', 'shippable') ||
    null;
  const paymentObservationRaw = input.paymentObservation;
  const paymentObservation: SettleBtcPaymentObservation | null = isSettleBtcObservation(
    paymentObservationRaw,
  )
    ? paymentObservationRaw
    : getStored<SettleBtcPaymentObservation>(
        execution,
        'settle-asset-pack-pipeline',
        'paymentObservation',
      ) || null;
  const mintBtdArtifact =
    input.mintBtd || getStored<MintBtdArtifact>(execution, 'settle-asset-pack-pipeline', 'mintBtd') || null;
  const settleBtdArtifact =
    input.settleBtd ||
    getStored<SettleBtdArtifact>(execution, 'settle-asset-pack-pipeline', 'settleBtd') ||
    null;
  const settleApArtifact =
    input.settleAssetPack ||
    getStored<SettleAssetPackArtifact>(execution, 'settle-asset-pack-pipeline', 'settleAssetPack') ||
    null;
  const rights =
    getStored<SettleRightsArtifact>(execution, 'settle-asset-pack-pipeline', 'rights') || null;
  const measurementRows = projectSourceSafePackMeasurements(option);
  const title = typeof option.title === 'string' ? option.title : null;
  const prUrl = shippable?.prUrl ?? null;
  const deliveryStatus = shippable?.status ?? 'projected';
  const repositoryFullName = shippable?.repository?.fullName ?? null;

  const paymentObservationSummary: PackActivityPaymentObservation | null = paymentObservation
    ? {
        schema: paymentObservation.schema,
        network: paymentObservation.network || 'btc-testnet',
        status: paymentObservation.status || null,
        txId: paymentObservation.txId || null,
        amountSats:
          typeof paymentObservation.amountSats === 'number'
            ? paymentObservation.amountSats
            : null,
        finality: paymentObservation.finality || null,
      }
    : null;

  const shippableSummary: PackActivityShippableSummary | null = shippable
    ? {
        schema: shippable.schema,
        deliveryMechanism: shippable.deliveryMechanism,
        repository: shippable.repository,
        headBranch: shippable.headBranch,
        baseBranch: shippable.baseBranch,
        patchCount: shippable.patchCount,
        prUrl,
        status: deliveryStatus,
        note: shippable.note,
      }
    : null;

  const activity: SettlePackActivity = {
    schema: 'bitcode.packs.activity',
    surface: '/packs',
    packActivityType: 'settled-assetpack',
    activityType: 'settled-assetpack',
    settledAt: new Date().toISOString(),
    repositoryFullName,
    optionCount: 1,
    assetPackKey,
    assetPackTitle: title,
    optionTitles: title ? [title] : [],
    measurements: measurementRows,
    settlementState: 'settled',
    rightsState: 'btd-rights-transferred',
    deliveryState: deliveryStatus,
    deliveryReference: prUrl,
    prUrl,
    paymentObservation: paymentObservationSummary,
    mintBtd: mintBtdArtifact
      ? {
          needFitVolume: mintBtdArtifact.settlementBtd.needFitVolume,
          amountBaseUnits: mintBtdArtifact.receipt.amountBaseUnits,
          masterAccount: mintBtdArtifact.masterAccount,
        }
      : null,
    settleBtd: settleBtdArtifact
      ? {
          buyerAccount: settleBtdArtifact.buyerAccount,
          amountBaseUnits: settleBtdArtifact.receipt.amountBaseUnits,
        }
      : null,
    settleAssetPack: settleApArtifact
      ? {
          tokenId: settleApArtifact.receipt.tokenId,
          coOwners: settleApArtifact.coOwners,
          removedPriorOwner: false,
        }
      : null,
    shippable: shippableSummary,
    rights,
  };
  storeCrossPhaseArtifact(execution, 'settle-asset-pack-pipeline', 'packActivity', activity);
  storeCrossPhaseArtifact(execution, 'finish', 'packActivity', activity);
  const summaryTitle = title ? `Settled AssetPack: ${title}` : 'Settled AssetPack option';

  if (!mintBtdArtifact || !settleBtdArtifact || !settleApArtifact || !shippable || !input.settlementBtd) {
    // Stages thread these; re-read from input when present after full run.
  }
  const settlementBtd =
    input.settlementBtd || mintBtdArtifact?.settlementBtd;
  if (!mintBtdArtifact || !settleBtdArtifact || !settleApArtifact || !shippable || !settlementBtd) {
    throw new Error(
      'journal-and-pack-activity requires mint-btd, settle-btd, settle-asset-pack, shippable, and settlementBtd.',
    );
  }
  if (!input.erc1155State) {
    throw new Error('journal-and-pack-activity requires erc1155State from prior stages.');
  }
  if (!paymentObservation) {
    throw new Error('journal-and-pack-activity requires settle-btc paymentObservation.');
  }

  const readSynthesizedSettledAssetPack: ReadSynthesizedSettledAssetPack =
    buildReadSynthesizedSettledAssetPack({
      readOption: optionToReadSynthesized(option),
      btdRights: {
        needFitVolume: settlementBtd.needFitVolume,
        amountBaseUnits: mintBtdArtifact.receipt.amountBaseUnits,
        masterAccount: mintBtdArtifact.masterAccount,
        buyerAccount: settleBtdArtifact.buyerAccount,
        mintProofRoot: mintBtdArtifact.receipt.proofRoot,
        transferProofRoot: settleBtdArtifact.receipt.proofRoot,
        status: 'transferred',
      },
      btcSettlement: {
        network: paymentObservation.network,
        status: paymentObservation.status,
        txId: paymentObservation.txId,
        amountSats: paymentObservation.amountSats,
        finality: paymentObservation.finality,
        confirmedAt: paymentObservation.confirmedAt,
      },
      assetPackRights: {
        tokenId: settleApArtifact.receipt.tokenId,
        assetPackKey: settleApArtifact.receipt.assetPackKey,
        coOwners: settleApArtifact.coOwners,
        removedPriorOwner: false,
        proofRoot: settleApArtifact.receipt.proofRoot,
      },
      delivery: {
        mechanism: 'pull_request',
        status: shippable.status,
        prUrl: shippable.prUrl,
        headBranch: shippable.headBranch,
        baseBranch: shippable.baseBranch,
        repositoryFullName: shippable.repository.fullName,
      },
    });
  storeCrossPhaseArtifact(
    execution,
    'settle-asset-pack-pipeline',
    'readSynthesizedSettledAssetPack',
    readSynthesizedSettledAssetPack as never,
  );

  return {
    ...input,
    assetPackOption: option,
    selectedOptions: [option],
    success: true,
    packActivity: activity,
    summary: `${summaryTitle}. settle-asset-pack-pipeline: validate → settle-btc → mint-btd → settle-btd → settle-asset-pack → ship PR → packs.`,
    erc1155State: input.erc1155State,
    mintBtd: mintBtdArtifact,
    settleBtd: settleBtdArtifact,
    settleAssetPack: settleApArtifact,
    settlementBtd,
    shippable,
    paymentObservation,
    readSynthesizedSettledAssetPack,
  };
};

export function factoryExecutionPipelineSimpleSettleAssetPack(
  pipelineName: string = 'settle-asset-pack-pipeline',
): ExecutionPipelineSimpleSettleAssetPack {
  return factoryExecutionPipelineSimple(pipelineName, {
    stages: [
      { id: 'validate-settlement-readiness', run: validateSettlementReadiness },
      { id: 'settle-btc', run: settleBtc },
      { id: 'mint-btd', run: mintBtd },
      { id: 'settle-btd', run: settleBtd },
      { id: 'settle-asset-pack', run: settleAssetPack },
      { id: 'ship-asset-pack-patch-pr', run: shipAssetPackPatchPr },
      { id: 'journal-and-pack-activity', run: journalAndPackActivity },
    ],
  });
}

export const executionPipelineSimpleSettleAssetPack: ExecutionPipelineSimpleSettleAssetPack =
  factoryExecutionPipelineSimpleSettleAssetPack();

export const runExecutionPipelineSimpleSettleAssetPack = executionPipelineSimpleSettleAssetPack;
