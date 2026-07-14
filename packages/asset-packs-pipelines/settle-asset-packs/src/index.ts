/**
 * @bitcode/asset-packs-pipelines-settle-asset-packs
 *
 * Hierarchy: SettleAssetPacks + Simple + Pipeline
 *   factorySettleAssetPacksSimplePipeline → SettleAssetPacksSimplePipeline
 *
 * **Not** SDIVF. SynthesizeRead produces multiple options; each **bought**
 * option starts its own settle pipeline (1:1 AssetPack : settle run).
 *
 * Stages (binding V48 law):
 *   1. validate-settlement-readiness
 *   2. settle-btc              — BTC-testnet payment finality observation
 *   3. mint-btd                — needinesses-weighted BTD → master (ERC1155 id 0)
 *   4. settle-btd              — BTD master → buyer Ethereum wallet
 *   5. settle-asset-pack       — ERC1155 add-only AssetPack co-ownership
 *   6. ship-asset-pack-patch-pr
 *   7. journal-and-pack-activity
 *
 * BTD mint amount = weighted needinesses scalar only (absolutes never mint).
 */

import { createHash } from 'crypto';
import type { Executor } from '@bitcode/execution-generics';
import {
  factorySimplePipeline,
  type SimplePipeline,
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

export type SettleAssetPacksSimplePipeline = SimplePipeline<any, any>;

/** Best-effort cross-stage store (domain storeCrossPhaseArtifact parity). */
function storeCrossPhaseArtifact(
  execution: { store?: (ns: string, key: string, value: unknown) => void; get?: (ns: string, key: string) => unknown } | null | undefined,
  namespace: string,
  key: string,
  value: unknown,
): void {
  try {
    execution?.store?.(namespace, key, value);
  } catch {
    /* storage must never decide pipeline success */
  }
}

export interface SettleAssetPacksInput {
  repository?: {
    url?: string | null;
    owner?: string | null;
    name?: string | null;
    branch?: string | null;
    commit?: string | null;
    fullName?: string | null;
  };
  /**
   * Exactly one bought option (1:1 settle). Legacy `selectedOptions[0]` accepted
   * when `assetPackOption` omitted.
   */
  assetPackOption?: unknown;
  /** @deprecated Prefer assetPackOption — only first entry is settled. */
  selectedOptions?: unknown[];
  synthesizedPacks?: unknown;
  assetPackPreviewBoundary?: unknown;
  shareToFeeQuote?: unknown;
  paymentObservation?: unknown;
  githubAccessToken?: string | null;
  userId?: string | null;
  readerWalletId?: string | null;
  depositorWalletId?: string | null;
  /** Buyer Ethereum address for settle-btd + co-ownership. */
  buyerEthereumAddress?: string | null;
  /** Depositor Ethereum address (initial AssetPack co-owner). */
  depositorEthereumAddress?: string | null;
  /** Master treasury that receives minted BTD before transfer. */
  masterEthereumAddress?: string | null;
  /** Optional projected / live ERC1155 state bag. */
  erc1155State?: BitcodeErc1155State | null;
  need?: string | null;
  synthesisRunId?: string | null;
  [key: string]: unknown;
}

function resolveSingleOption(input: SettleAssetPacksInput): Record<string, unknown> {
  if (input.assetPackOption && typeof input.assetPackOption === 'object') {
    return input.assetPackOption as Record<string, unknown>;
  }
  const list = Array.isArray(input.selectedOptions)
    ? input.selectedOptions
    : Array.isArray(input.synthesizedPacks)
      ? input.synthesizedPacks
      : [];
  if (list.length === 0) {
    throw new Error(
      'SettleAssetPacks requires exactly one assetPackOption (1:1 AssetPack : settle pipeline).',
    );
  }
  if (list.length > 1) {
    throw new Error(
      `SettleAssetPacks is 1:1 per bought option; received ${list.length}. Spawn one pipeline per option.`,
    );
  }
  const only = list[0];
  if (!only || typeof only !== 'object') {
    throw new Error('SettleAssetPacks assetPackOption must be an object.');
  }
  return only as Record<string, unknown>;
}

function assetPackKeyFor(option: Record<string, unknown>, input: SettleAssetPacksInput): string {
  if (typeof option.id === 'string' && option.id.trim()) return option.id.trim();
  if (typeof option.optionRoot === 'string' && option.optionRoot.trim()) return option.optionRoot.trim();
  const title = typeof option.title === 'string' ? option.title : 'option';
  const seed = `${input.synthesisRunId || 'run'}:${title}:${JSON.stringify(option.kind || '')}`;
  return createHash('sha256').update(seed).digest('hex').slice(0, 32);
}

function defaultMasterAddress(input: SettleAssetPacksInput): string {
  return (
    (typeof input.masterEthereumAddress === 'string' && input.masterEthereumAddress.trim()) ||
    '0xbitcode-master-treasury'
  );
}

function defaultBuyerAddress(input: SettleAssetPacksInput): string {
  return (
    (typeof input.buyerEthereumAddress === 'string' && input.buyerEthereumAddress.trim()) ||
    (typeof input.readerWalletId === 'string' && input.readerWalletId.trim()) ||
    `0xreader-${input.userId || 'anonymous'}`
  );
}

function defaultDepositorAddress(input: SettleAssetPacksInput): string {
  return (
    (typeof input.depositorEthereumAddress === 'string' &&
      input.depositorEthereumAddress.trim()) ||
    (typeof input.depositorWalletId === 'string' && input.depositorWalletId.trim()) ||
    '0xdepositor'
  );
}

// ---------------------------------------------------------------------------
// 1. validate-settlement-readiness
// ---------------------------------------------------------------------------
const validateSettlementReadiness: Executor<SettleAssetPacksInput, SettleAssetPacksInput> = async (
  input,
  execution,
) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'stage', 'validate-settlement-readiness');
  const assetPackOption = resolveSingleOption(input);
  const assetPackKey = assetPackKeyFor(assetPackOption, input);
  const boundary =
    (input as any)?.assetPackSettlementRightsDeliveryBoundary || {
      schema: 'bitcode.settle-asset-packs.validation',
      state: 'ready',
      pipeline: 'settle-asset-packs',
      selectedCount: 1,
      assetPackKey,
      cardinality: '1:1',
    };
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'validation', boundary);
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'assetPackOption', assetPackOption);
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'assetPackKey', assetPackKey);
  return {
    ...input,
    assetPackOption,
    selectedOptions: [assetPackOption],
    assetPackSettlementRightsDeliveryBoundary: boundary,
  };
};

// ---------------------------------------------------------------------------
// 2. settle-btc (agent surface)
// ---------------------------------------------------------------------------
const settleBtc: Executor<SettleAssetPacksInput, SettleAssetPacksInput> = async (
  input,
  execution,
) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'stage', 'settle-btc');
  const prior =
    input.paymentObservation && typeof input.paymentObservation === 'object'
      ? (input.paymentObservation as Record<string, unknown>)
      : {};
  const txId = typeof prior.txId === 'string' && prior.txId.trim() ? prior.txId.trim() : null;
  let mempool: Record<string, unknown> | null = null;

  // Live mempool observation when txId is provided (testnet). Projected otherwise.
  if (txId) {
    try {
      const network =
        typeof prior.network === 'string' && prior.network.includes('main')
          ? 'mainnet'
          : 'testnet';
      // mempool.space public API — testnet path when network is testnet/signet.
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
        const body = (await res.json()) as Record<string, unknown>;
        const status = (body.status as Record<string, unknown> | undefined) || {};
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
  const observation = {
    schema: 'bitcode.settle-asset-packs.payment-observation',
    agent: 'settle-btc',
    network: typeof prior.network === 'string' ? prior.network : 'btc-testnet',
    status: confirmed
      ? 'final'
      : txId
        ? 'observed'
        : 'observed-projection',
    txId,
    amountSats: typeof prior.amountSats === 'number' ? prior.amountSats : null,
    confirmedAt: confirmed
      ? new Date(
          typeof mempool?.blockTime === 'number'
            ? (mempool.blockTime as number) * 1000
            : Date.now(),
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
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'paymentObservation', observation);
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'settleBtc', observation);
  return { ...input, paymentObservation: observation };
};

// ---------------------------------------------------------------------------
// 3. mint-btd (agent surface)
// ---------------------------------------------------------------------------
const mintBtd: Executor<SettleAssetPacksInput, SettleAssetPacksInput> = async (
  input,
  execution,
) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'stage', 'mint-btd');
  const option =
    (execution?.get?.('settle-asset-packs', 'assetPackOption') as Record<string, unknown>) ||
    resolveSingleOption(input);
  const assetPackKey =
    (execution?.get?.('settle-asset-packs', 'assetPackKey') as string) ||
    assetPackKeyFor(option, input);

  const settlementBtd = assertPositiveSettlementBtd(
    computeSettlementBtdFromNeedinesses(option.measurements ?? option, { assetPackKey }),
  );

  const master = defaultMasterAddress(input);
  let state =
    input.erc1155State ||
    createBitcodeErc1155State({
      masterAccount: master,
      operator: '0xbitcode-settlement-operator',
      name: 'Bitcode',
      symbol: 'BTD',
    });

  const { state: nextState, receipt } = mintBtdToMaster(state, {
    amountBaseUnits: settlementBtd.amountBaseUnits,
    needFitVolume: settlementBtd.needFitVolume,
    weightedNeedinessesSum: settlementBtd.weightedNeedinessesSum,
    needinessesCount: settlementBtd.needinessesCount,
    assetPackKey,
    proofRoot: settlementBtd.proofRoot,
  });

  const mintArtifact = {
    schema: 'bitcode.settle-asset-packs.mint-btd',
    agent: 'mint-btd',
    settlementBtd,
    receipt: {
      ...receipt,
      amountBaseUnits: receipt.amountBaseUnits.toString(),
      btdTotalMintedBefore: receipt.btdTotalMintedBefore.toString(),
      btdTotalMintedAfter: receipt.btdTotalMintedAfter.toString(),
      maxSupplyBaseUnits: receipt.maxSupplyBaseUnits.toString(),
      settlementSequence: receipt.settlementSequence.toString(),
      tokenId: receipt.tokenId.toString(),
    },
    masterAccount: master,
    masterBtdBalance: balanceOf(nextState, master, BITCODE_BTD_TOKEN_ID).toString(),
    note:
      'BTD minted to master from needinesses-weighted scalar only (absolutes excluded). Finite 21M supply.',
  };
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'mintBtd', mintArtifact);
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'settlementBtd', settlementBtd);
  storeCrossPhaseArtifact(
    execution,
    'settle-asset-packs',
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
// 4. settle-btd (agent surface)
// ---------------------------------------------------------------------------
const settleBtd: Executor<SettleAssetPacksInput, SettleAssetPacksInput> = async (
  input,
  execution,
) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'stage', 'settle-btd');
  const mintArtifact =
    (input as any).mintBtd || execution?.get?.('settle-asset-packs', 'mintBtd');
  const settlementBtd =
    (input as any).settlementBtd ||
    execution?.get?.('settle-asset-packs', 'settlementBtd') ||
    mintArtifact?.settlementBtd;
  if (!settlementBtd?.amountBaseUnits) {
    throw new Error('settle-btd requires prior mint-btd with positive amountBaseUnits.');
  }
  const amountBaseUnits =
    typeof settlementBtd.amountBaseUnits === 'bigint'
      ? settlementBtd.amountBaseUnits
      : BigInt(String(settlementBtd.amountBaseUnits));

  const buyer = defaultBuyerAddress(input);
  const master = defaultMasterAddress(input);
  const assetPackKey =
    (execution?.get?.('settle-asset-packs', 'assetPackKey') as string) || 'asset-pack';
  let state =
    input.erc1155State ||
    createBitcodeErc1155State({
      masterAccount: master,
      operator: '0xbitcode-settlement-operator',
    });

  // Ensure master holds the minted amount (re-mint if state was rehydrated empty).
  if (balanceOf(state, master, BITCODE_BTD_TOKEN_ID) < amountBaseUnits) {
    const reMint = mintBtdToMaster(state, {
      amountBaseUnits,
      needFitVolume: settlementBtd.needFitVolume ?? 0,
      weightedNeedinessesSum: settlementBtd.weightedNeedinessesSum ?? 0,
      needinessesCount: settlementBtd.needinessesCount ?? 0,
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

  const settleBtdArtifact = {
    schema: 'bitcode.settle-asset-packs.settle-btd',
    agent: 'settle-btd',
    receipt: {
      ...receipt,
      amountBaseUnits: receipt.amountBaseUnits.toString(),
      settlementSequence: receipt.settlementSequence.toString(),
      tokenId: receipt.tokenId.toString(),
    },
    buyerAccount: buyer,
    buyerBtdBalance: balanceOf(nextState, buyer, BITCODE_BTD_TOKEN_ID).toString(),
    masterBtdBalance: balanceOf(nextState, master, BITCODE_BTD_TOKEN_ID).toString(),
    note: 'BTD transferred from master treasury to buyer Ethereum wallet.',
  };
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'settleBtd', settleBtdArtifact);
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'rights', {
    schema: 'bitcode.settle-asset-packs.rights-transfer',
    readerWalletId: input.readerWalletId || null,
    depositorWalletId: input.depositorWalletId || null,
    buyerEthereumAddress: buyer,
    btdMinted: true,
    btdTransferred: true,
    amountBaseUnits: amountBaseUnits.toString(),
    status: 'transferred',
  });
  storeCrossPhaseArtifact(
    execution,
    'settle-asset-packs',
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
// 5. settle-asset-pack (agent surface) — ERC1155 co-ownership
// ---------------------------------------------------------------------------
const settleAssetPack: Executor<SettleAssetPacksInput, SettleAssetPacksInput> = async (
  input,
  execution,
) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'stage', 'settle-asset-pack');
  const option =
    (execution?.get?.('settle-asset-packs', 'assetPackOption') as Record<string, unknown>) ||
    resolveSingleOption(input);
  const assetPackKey =
    (execution?.get?.('settle-asset-packs', 'assetPackKey') as string) ||
    assetPackKeyFor(option, input);
  const buyer = defaultBuyerAddress(input);
  const depositor = defaultDepositorAddress(input);
  const master = defaultMasterAddress(input);
  let state =
    input.erc1155State ||
    createBitcodeErc1155State({
      masterAccount: master,
      operator: '0xbitcode-settlement-operator',
    });

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

  const settleApArtifact = {
    schema: 'bitcode.settle-asset-packs.settle-asset-pack',
    agent: 'settle-asset-pack',
    receipt: {
      ...receipt,
      tokenId: receipt.tokenId.toString(),
      settlementSequence: receipt.settlementSequence.toString(),
    },
    coOwners: receipt.coOwners,
    removedPriorOwner: false as const,
    note:
      'Buyer added as equal AssetPack co-owner (ERC1155). Depositor retains ownership; burn/remove forbidden.',
  };
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'settleAssetPack', settleApArtifact);
  storeCrossPhaseArtifact(
    execution,
    'settle-asset-packs',
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
const shipAssetPackPatchPr: Executor<SettleAssetPacksInput, any> = async (input, execution) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'stage', 'ship-asset-pack-patch-pr');
  const repo = input.repository || {};
  const option =
    (execution?.get?.('settle-asset-packs', 'assetPackOption') as Record<string, unknown>) ||
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
  let status: 'projected' | 'opened' | 'failed' = 'projected';
  let note =
    'Settle ships the AssetPack .patch against the reading repository; live PR when credentials allow.';
  let prError: string | null = null;

  if (input.githubAccessToken && owner && name && patch) {
    try {
      const { createPullRequest } = await import('@bitcode/generic-vcs-git');
      const bodyLines = [
        '## Bitcode SettleAssetPacks delivery',
        '',
        '1:1 AssetPack settlement after BTC finality, BTD mint/transfer, and ERC1155 co-ownership.',
        '',
        `### ${title}`,
        '',
        patch && typeof (patch as any).patchSummary === 'string'
          ? String((patch as any).patchSummary)
          : 'Patch descriptor attached.',
      ];
      const pr = await createPullRequest({
        provider: 'github',
        accessToken: input.githubAccessToken,
        owner,
        repo: name,
        title: `Bitcode: ${title}`,
        body: bodyLines.join('\n'),
        sourceBranch: headBranch,
        targetBranch: baseBranch,
      });
      prUrl =
        (pr as any)?.url ||
        (pr as any)?.html_url ||
        (pr as any)?.htmlUrl ||
        null;
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

  const shippable = {
    schema: 'bitcode.settle-asset-packs.shippable',
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
    // measurements for packs projection only (source-safe kinds)
    measurements,
    prUrl,
    status,
    prError,
    note,
  };
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'shippable', shippable);
  storeCrossPhaseArtifact(execution, 'finish', 'shippable', shippable);
  return { ...input, shippable, success: status !== 'failed' };
};

// ---------------------------------------------------------------------------
// 7. journal-and-pack-activity
// ---------------------------------------------------------------------------
function projectSourceSafePackMeasurements(option: Record<string, unknown>): Array<{
  kind: string;
  category: 'absolute' | 'neediness';
  volume: number | null;
  magnitude: number | null;
  unit: string | null;
  weight: number | null;
}> {
  const measurements =
    option.measurements && typeof option.measurements === 'object'
      ? (option.measurements as Record<string, unknown>)
      : {};
  const rows: Array<{
    kind: string;
    category: 'absolute' | 'neediness';
    volume: number | null;
    magnitude: number | null;
    unit: string | null;
    weight: number | null;
  }> = [];
  const absolutes = Array.isArray(measurements.absolutes) ? measurements.absolutes : [];
  for (const raw of absolutes) {
    if (!raw || typeof raw !== 'object') continue;
    const a = raw as Record<string, unknown>;
    const kind = typeof a.kind === 'string' ? a.kind : typeof a.id === 'string' ? a.id : null;
    if (!kind) continue;
    rows.push({
      kind,
      category: 'absolute',
      volume: typeof a.volume === 'number' ? a.volume : null,
      magnitude: typeof a.magnitude === 'number' ? a.magnitude : null,
      unit: typeof a.unit === 'string' ? a.unit : null,
      weight: typeof a.weight === 'number' ? a.weight : null,
    });
  }
  const needinesses = Array.isArray(measurements.needinesses) ? measurements.needinesses : [];
  for (const raw of needinesses) {
    if (!raw || typeof raw !== 'object') continue;
    const n = raw as Record<string, unknown>;
    const kind = typeof n.kind === 'string' ? n.kind : typeof n.id === 'string' ? n.id : null;
    if (!kind) continue;
    rows.push({
      kind,
      category: 'neediness',
      volume: typeof n.volume === 'number' ? n.volume : null,
      magnitude: null,
      unit: typeof n.unit === 'string' ? n.unit : null,
      weight: typeof n.weight === 'number' ? n.weight : null,
    });
  }
  return rows;
}

const journalAndPackActivity: Executor<any, any> = async (input, execution) => {
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'stage', 'journal-and-pack-activity');
  const option =
    (execution?.get?.('settle-asset-packs', 'assetPackOption') as Record<string, unknown>) ||
    (input.assetPackOption as Record<string, unknown>) ||
    {};
  const assetPackKey =
    (execution?.get?.('settle-asset-packs', 'assetPackKey') as string) || null;
  const shippable = input?.shippable || execution?.get?.('settle-asset-packs', 'shippable') || null;
  const paymentObservation =
    input?.paymentObservation || execution?.get?.('settle-asset-packs', 'paymentObservation') || null;
  const mintBtdArtifact = input?.mintBtd || execution?.get?.('settle-asset-packs', 'mintBtd') || null;
  const settleBtdArtifact =
    input?.settleBtd || execution?.get?.('settle-asset-packs', 'settleBtd') || null;
  const settleApArtifact =
    input?.settleAssetPack || execution?.get?.('settle-asset-packs', 'settleAssetPack') || null;
  const rights = execution?.get?.('settle-asset-packs', 'rights') || null;
  const measurementRows = projectSourceSafePackMeasurements(option);
  const title = typeof option.title === 'string' ? option.title : null;
  const prUrl =
    shippable && typeof shippable === 'object' && typeof (shippable as any).prUrl === 'string'
      ? (shippable as any).prUrl
      : null;
  const deliveryStatus =
    shippable && typeof shippable === 'object' && typeof (shippable as any).status === 'string'
      ? (shippable as any).status
      : 'projected';
  const repositoryFullName =
    shippable && typeof shippable === 'object'
      ? (shippable as any)?.repository?.fullName || null
      : null;

  const activity = {
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
    paymentObservation: paymentObservation
      ? {
          schema: (paymentObservation as any).schema,
          network: (paymentObservation as any).network || 'btc-testnet',
          status: (paymentObservation as any).status || null,
          txId: (paymentObservation as any).txId || null,
          amountSats:
            typeof (paymentObservation as any).amountSats === 'number'
              ? (paymentObservation as any).amountSats
              : null,
          finality: (paymentObservation as any).finality || null,
        }
      : null,
    mintBtd: mintBtdArtifact
      ? {
          needFitVolume: mintBtdArtifact.settlementBtd?.needFitVolume ?? null,
          amountBaseUnits: mintBtdArtifact.receipt?.amountBaseUnits ?? null,
          masterAccount: mintBtdArtifact.masterAccount ?? null,
        }
      : null,
    settleBtd: settleBtdArtifact
      ? {
          buyerAccount: settleBtdArtifact.buyerAccount ?? null,
          amountBaseUnits: settleBtdArtifact.receipt?.amountBaseUnits ?? null,
        }
      : null,
    settleAssetPack: settleApArtifact
      ? {
          tokenId: settleApArtifact.receipt?.tokenId ?? null,
          coOwners: settleApArtifact.coOwners ?? [],
          removedPriorOwner: false,
        }
      : null,
    shippable: shippable
      ? {
          schema: (shippable as any).schema || 'bitcode.settle-asset-packs.shippable',
          deliveryMechanism: (shippable as any).deliveryMechanism || 'pull_request',
          repository: (shippable as any).repository || null,
          headBranch: (shippable as any).headBranch || null,
          baseBranch: (shippable as any).baseBranch || null,
          patchCount: (shippable as any).patchCount ?? 1,
          prUrl,
          status: deliveryStatus,
          note: (shippable as any).note || null,
        }
      : null,
    rights,
  };
  storeCrossPhaseArtifact(execution, 'settle-asset-packs', 'packActivity', activity);
  storeCrossPhaseArtifact(execution, 'finish', 'packActivity', activity);
  const summaryTitle = title
    ? `Settled AssetPack: ${title}`
    : 'Settled AssetPack option';
  return {
    ...input,
    success: true,
    packActivity: activity,
    summary: `${summaryTitle}. SettleAssetPacks: validate → settle-btc → mint-btd → settle-btd → settle-asset-pack → ship PR → packs.`,
  };
};

export function factorySettleAssetPacksSimplePipeline(
  pipelineName: string = 'settle-asset-packs',
): SettleAssetPacksSimplePipeline {
  return factorySimplePipeline(pipelineName, {
    stages: [
      { id: 'validate-settlement-readiness', run: validateSettlementReadiness },
      { id: 'settle-btc', run: settleBtc },
      { id: 'mint-btd', run: mintBtd },
      { id: 'settle-btd', run: settleBtd },
      { id: 'settle-asset-pack', run: settleAssetPack },
      { id: 'ship-asset-pack-patch-pr', run: shipAssetPackPatchPr },
      { id: 'journal-and-pack-activity', run: journalAndPackActivity },
    ],
  } as any);
}

export const settleAssetPacksSimplePipeline: SettleAssetPacksSimplePipeline =
  factorySettleAssetPacksSimplePipeline();

export const runSettleAssetPacksSimplePipeline = settleAssetPacksSimplePipeline;
