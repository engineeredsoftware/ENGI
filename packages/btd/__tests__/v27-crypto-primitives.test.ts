import { BITCODE_FEE_ASSET, BTD_MAX_MINTABLE_SUPPLY } from '../src/constants';
import { measureProofAddressableSemanticVolume } from '../src/semantic-volume';
import { createBtdSupplyState } from '../src/supply';
import { applyBtdMeasureMint, createBtdMeasureMintState } from '../src/measuremint';
import { evaluateBtdReadAccess } from '../src/access';
import { allocateAssetPackRange } from '../src/range';
import { buildBtdMintReceipt } from '../src/receipts';
import { replayBtdMeasureMintReceipts, replayBtdMintReceipts } from '../src/replay';
import { createWalletSignerSession } from '../src/wallet';
import {
  advanceBtcFeeTransactionReceipt,
  assertBtcFeeTransactionReceipt,
  buildPreparedBtcFeeTransactionReceipt,
} from '../src/bitcoin-fees';
import {
  BitcoinFeeTransactionProvider,
  broadcastBtcFeeWithProvider,
  observeBtcFeeWithProvider,
  prepareBtcFeeWithProvider,
} from '../src/bitcoin-provider';
import {
  V27_CRYPTO_DEPLOYMENT_ENVIRONMENT_KEYS,
  buildV27CryptoDeploymentLane,
  buildV27CryptoDeploymentReadinessReceipt,
} from '../src/deployment-lanes';
import { buildV27CryptoTelemetryRecord } from '../src/telemetry';
import {
  advanceAssetPackLedgerAnchor,
  buildPreparedAssetPackLedgerAnchor,
} from '../src/ledger-anchor';
import {
  acceptAssetPackExchangeOrder,
  buildAssetPackRightsTransferReceipt,
  cancelAssetPackExchangeOrder,
  createAssetPackExchangeOrder,
  settleAssetPackExchangeOrder,
} from '../src/exchange';
import {
  REQUIRED_JOURNAL_TRANSACTION_KINDS,
  buildJournalEntry,
  buildJournalCoverageReceipt,
  diffJournalProjection,
} from '../src/journal';
import { reconcileLedgerDatabaseProjection } from '../src/reconciliation';
import { allocateBtdContributorCells } from '../src/allocation';
import { reviewBtdAncestorEdges } from '../src/ancestry';
import {
  assertLicensedReadRevenueRouteConserved,
  buildLicensedReadRevenueRoute,
} from '../src/revenue';
import {
  advanceBtdProtocolUpgradeReceipt,
  buildPlannedBtdProtocolUpgradeReceipt,
} from '../src/upgrade';

const issuedAt = '2026-05-06T00:00:00.000Z';

function walletAuthorizationProof(label: string) {
  return {
    proofKind: 'message_signature' as const,
    message: `Authorize Bitcode wallet session ${label}`,
    signature: `signature-${label}`,
    verifiedAt: issuedAt,
  };
}

function rangeInput(overrides: Record<string, unknown> = {}) {
  return {
    assetPackId: 'asset-pack-range',
    readId: 'read-1',
    acceptedNeed: true as const,
    acceptedFit: true as const,
    sourceManifestRoot: 'source-root',
    measurementReceiptRoot: 'measurement-root',
    fitReceiptRoot: 'fit-root',
    proofRoot: 'proof-root',
    dedupeReceiptRoot: 'dedupe-root',
    settlementJournalRoot: 'settlement-root',
    exchangeReceiptRoot: 'exchange-root',
    accessPolicyId: 'policy-1',
    accessPolicyHash: 'policy-hash',
    normalizedBitcodeVolume: 2000n,
    tokenCount: 2,
    mintedAtExchangeSequence: 1n,
    ...overrides,
  };
}

describe('V27 proof-addressable semantic volume', () => {
  it('measures only fit-accepted, deduped semantic units and quantizes deterministically', () => {
    const receipt = measureProofAddressableSemanticVolume({
      measurementId: 'measurement-1',
      assetPackId: 'asset-pack-1',
      issuedAt,
      units: [
        {
          unitId: 'unit-a',
          proofReceiptRoot: 'proof-a',
          dedupeReceiptRoot: 'dedupe-a',
          fitAccepted: true,
          normalizedUnits: 1500n,
        },
        {
          unitId: 'unit-b',
          proofReceiptRoot: 'proof-b',
          dedupeReceiptRoot: 'dedupe-b',
          fitAccepted: true,
          normalizedUnits: 800n,
        },
        {
          unitId: 'unit-c',
          proofReceiptRoot: 'proof-c',
          dedupeReceiptRoot: 'dedupe-c',
          fitAccepted: false,
          normalizedUnits: 9999n,
        },
      ],
    });

    expect(receipt.normalizedBitcodeVolume).toBe(2300n);
    expect(receipt.tokenCount).toBe(2);
    expect(receipt.includedUnits).toHaveLength(2);
    expect(receipt.excludedUnits).toEqual([
      {
        unitId: 'unit-c',
        proofReceiptRoot: 'proof-c',
        dedupeReceiptRoot: 'dedupe-c',
        excludedReason: 'fit_not_accepted',
      },
    ]);
  });

  it('rejects duplicate included proof roots because replay would be ambiguous', () => {
    expect(() =>
      measureProofAddressableSemanticVolume({
        measurementId: 'measurement-dup',
        assetPackId: 'asset-pack-1',
        units: [
          {
            unitId: 'unit-a',
            proofReceiptRoot: 'proof-shared',
            dedupeReceiptRoot: 'dedupe-a',
            fitAccepted: true,
            normalizedUnits: 1000n,
          },
          {
            unitId: 'unit-b',
            proofReceiptRoot: 'proof-shared',
            dedupeReceiptRoot: 'dedupe-b',
            fitAccepted: true,
            normalizedUnits: 1000n,
          },
        ],
      }),
    ).toThrow(/Duplicate included proof receipt root/);
  });
});

describe('V27 supply, range, and mint receipt primitives', () => {
  it('uses fixed-supply measureminting decay before range allocation', () => {
    const first = applyBtdMeasureMint({
      state: createBtdMeasureMintState({ curveParameter: 10_000n }),
      assetPackId: 'asset-pack-measuremint-1',
      semanticVolume: { normalizedBitcodeVolume: 10_000n },
      proofRoot: 'proof-root-1',
      settlementJournalRoot: 'settlement-root-1',
      accessPolicyHash: 'policy-hash-1',
      exchangeSequence: 1n,
      issuedAt,
    });
    const second = applyBtdMeasureMint({
      state: first.nextState,
      assetPackId: 'asset-pack-measuremint-2',
      semanticVolume: { normalizedBitcodeVolume: 10_000n },
      proofRoot: 'proof-root-2',
      settlementJournalRoot: 'settlement-root-2',
      accessPolicyHash: 'policy-hash-2',
      exchangeSequence: 2n,
      issuedAt,
    });

    expect(first.receipt.tokenCount).toBe(10_500_000);
    expect(second.receipt.tokenCount).toBe(3_500_000);
    expect(second.nextState.totalMinted).toBe(14_000_000);
    expect(second.nextState.totalMinted).toBeLessThanOrEqual(BTD_MAX_MINTABLE_SUPPLY);
  });

  it('emits zero-cell receipts in the practical tail instead of failing valid measurement', () => {
    const result = applyBtdMeasureMint({
      state: createBtdMeasureMintState({
        totalMinted: 20_999_999,
        nextTokenId: 20_999_999,
        cumulativeAdmittedMeasurement: 209_999_990_000_000n,
        curveParameter: 10_000n,
      }),
      assetPackId: 'asset-pack-tail',
      semanticVolume: { normalizedBitcodeVolume: 1n },
      proofRoot: 'proof-root-tail',
      settlementJournalRoot: 'settlement-root-tail',
      accessPolicyHash: 'policy-hash-tail',
      exchangeSequence: 3n,
      issuedAt,
    });

    expect(result.receipt.tokenCount).toBe(0);
    expect(result.receipt.zeroCellReason).toBe('below_integer_threshold');
    expect(result.nextState.cumulativeAdmittedMeasurement).toBe(209_999_990_000_001n);
  });

  it('allocates a contiguous AssetPack range and emits a conserved mint receipt', () => {
    const measurement = measureProofAddressableSemanticVolume({
      measurementId: 'measurement-range',
      assetPackId: 'asset-pack-range',
      units: [
        {
          unitId: 'unit-a',
          proofReceiptRoot: 'proof-a',
          dedupeReceiptRoot: 'dedupe-a',
          fitAccepted: true,
          normalizedUnits: 2500n,
        },
      ],
    });

    const allocation = allocateAssetPackRange(createBtdSupplyState(), {
      ...rangeInput({
        measurementReceiptRoot: measurement.measurementId,
        normalizedBitcodeVolume: measurement.normalizedBitcodeVolume,
        tokenCount: measurement.tokenCount,
      }),
    });

    const receipt = buildBtdMintReceipt(allocation, issuedAt);
    const replay = replayBtdMintReceipts([receipt]);

    expect(allocation.range.rangeStart).toBe(0);
    expect(allocation.range.rangeEndExclusive).toBe(2);
    expect(allocation.nextSupply.totalMinted).toBe(2);
    expect(receipt.totalMintedBefore).toBe(0);
    expect(receipt.totalMintedAfter).toBe(2);
    expect(receipt.maxSupply).toBe(BTD_MAX_MINTABLE_SUPPLY);
    expect(replay.blocking).toBe(false);
    expect(replay.totalMinted).toBe(2);
  });

  it('fails closed when a range would exceed the fixed supply cap', () => {
    expect(() =>
      allocateAssetPackRange(
        createBtdSupplyState({
          totalMinted: BTD_MAX_MINTABLE_SUPPLY - 1,
          nextTokenId: BTD_MAX_MINTABLE_SUPPLY - 1,
        }),
        rangeInput({
          assetPackId: 'asset-pack-overflow',
          tokenCount: 2,
        }),
      ),
    ).toThrow(/21000000/);
  });

  it('fails closed on invalid range input before supply mutation', () => {
    const state = createBtdSupplyState();

    expect(() =>
      allocateAssetPackRange(
        state,
        rangeInput({
          tokenCount: 0,
        }),
      ),
    ).toThrow(/tokenCount must be positive/);

    expect(state.totalMinted).toBe(0);
    expect(state.nextTokenId).toBe(0);
  });

  it('rejects source deposit, candidate fit, uncommitted proof, and missing Exchange sequence before mint', () => {
    expect(() =>
      allocateAssetPackRange(
        createBtdSupplyState(),
        rangeInput({
          acceptedNeed: false,
        }) as any,
      ),
    ).toThrow(/accepted Read/);

    expect(() =>
      allocateAssetPackRange(
        createBtdSupplyState(),
        rangeInput({
          acceptedFit: false,
        }) as any,
      ),
    ).toThrow(/accepted Fit/);

    expect(() =>
      allocateAssetPackRange(
        createBtdSupplyState(),
        rangeInput({
          proofRoot: '',
        }) as any,
      ),
    ).toThrow(/proofRoot must be a non-empty string/);

    expect(() =>
      allocateAssetPackRange(
        createBtdSupplyState(),
        rangeInput({
          settlementJournalRoot: '',
        }) as any,
      ),
    ).toThrow(/settlementJournalRoot must be a non-empty string/);

    expect(() =>
      allocateAssetPackRange(
        createBtdSupplyState(),
        rangeInput({
          mintedAtExchangeSequence: 0n,
        }),
      ),
    ).toThrow(/mintedAtExchangeSequence must be a positive bigint/);
  });

  it('prevents duplicate primary AssetPack ranges and stale-state overlap', () => {
    const first = allocateAssetPackRange(
      createBtdSupplyState(),
      rangeInput({ assetPackId: 'asset-pack-one-range' }),
    );

    expect(() =>
      allocateAssetPackRange(
        first.nextSupply,
        rangeInput({
          assetPackId: 'asset-pack-one-range',
          mintedAtExchangeSequence: 2n,
        }),
        { existingRanges: [first.range] },
      ),
    ).toThrow(/already has a primary BTD range/);

    expect(() =>
      allocateAssetPackRange(
        createBtdSupplyState(),
        rangeInput({
          assetPackId: 'asset-pack-stale-state',
          tokenCount: 1,
          mintedAtExchangeSequence: 3n,
        }),
        { existingRanges: [first.range] },
      ),
    ).toThrow(/overlaps/);
  });

  it('replays sequential mint receipts into the next token state', () => {
    const first = allocateAssetPackRange(
      createBtdSupplyState(),
      rangeInput({ assetPackId: 'asset-pack-replay-range-1' }),
    );
    const second = allocateAssetPackRange(
      first.nextSupply,
      rangeInput({
        assetPackId: 'asset-pack-replay-range-2',
        tokenCount: 3,
        normalizedBitcodeVolume: 3000n,
        mintedAtExchangeSequence: 2n,
      }),
      { existingRanges: [first.range] },
    );
    const replay = replayBtdMintReceipts([
      buildBtdMintReceipt(first, issuedAt),
      buildBtdMintReceipt(second, issuedAt),
    ]);

    expect(second.range.rangeStart).toBe(first.range.rangeEndExclusive);
    expect(replay.blocking).toBe(false);
    expect(replay.nextTokenId).toBe(second.nextSupply.nextTokenId);
    expect(replay.nextTokenId).toBe(5);
  });

  it('replays mint and allocation receipts into exact supply, range, allocation, and next-token state', () => {
    const first = allocateAssetPackRange(
      createBtdSupplyState(),
      rangeInput({ assetPackId: 'asset-pack-replay-bundle-1' }),
    );
    const second = allocateAssetPackRange(
      first.nextSupply,
      rangeInput({
        assetPackId: 'asset-pack-replay-bundle-2',
        tokenCount: 3,
        normalizedBitcodeVolume: 3000n,
        mintedAtExchangeSequence: 2n,
      }),
      { existingRanges: [first.range] },
    );
    const firstReceipt = buildBtdMintReceipt(first, issuedAt);
    const secondReceipt = buildBtdMintReceipt(second, issuedAt);
    const firstAllocation = allocateBtdContributorCells({
      assetPackId: first.range.assetPackId,
      rangeStart: first.range.rangeStart,
      rangeEndExclusive: first.range.rangeEndExclusive,
      issuedAt,
      contributors: [
        {
          contributorId: 'contributor-a',
          walletId: 'wallet-a',
          normalizedContributionVolume: 1000n,
          fitBps: 10_000,
          qualityBps: 10_000,
          provenanceBps: 10_000,
          noveltyBps: 10_000,
          antiNoiseBps: 10_000,
        },
      ],
    });
    const secondAllocation = allocateBtdContributorCells({
      assetPackId: second.range.assetPackId,
      rangeStart: second.range.rangeStart,
      rangeEndExclusive: second.range.rangeEndExclusive,
      issuedAt,
      contributors: [
        {
          contributorId: 'contributor-b',
          walletId: 'wallet-b',
          normalizedContributionVolume: 2000n,
          fitBps: 10_000,
          qualityBps: 10_000,
          provenanceBps: 10_000,
          noveltyBps: 10_000,
          antiNoiseBps: 10_000,
        },
      ],
    });

    const replay = replayBtdMintReceipts(
      [firstReceipt, secondReceipt],
      [firstAllocation, secondAllocation],
    );

    expect(replay.blocking).toBe(false);
    expect(replay.supplyCheckpoints).toEqual([
      {
        assetPackId: 'asset-pack-replay-bundle-1',
        totalMintedBefore: 0,
        totalMintedAfter: 2,
        rangeStart: 0,
        rangeEndExclusive: 2,
      },
      {
        assetPackId: 'asset-pack-replay-bundle-2',
        totalMintedBefore: 2,
        totalMintedAfter: 5,
        rangeStart: 2,
        rangeEndExclusive: 5,
      },
    ]);
    expect(replay.ranges.map((range) => range.assetPackId)).toEqual([
      'asset-pack-replay-bundle-1',
      'asset-pack-replay-bundle-2',
    ]);
    expect(replay.allocations.map((allocation) => allocation.assetPackId)).toEqual([
      'asset-pack-replay-bundle-1',
      'asset-pack-replay-bundle-2',
    ]);
    expect(replay.nextTokenId).toBe(5);
  });

  it('blocks replay when receipts mutate roots, cap, range, policy, or allocation conservation', () => {
    const allocation = allocateAssetPackRange(
      createBtdSupplyState(),
      rangeInput({ assetPackId: 'asset-pack-replay-mutation' }),
    );
    const receipt = buildBtdMintReceipt(allocation, issuedAt);
    const contributorAllocation = allocateBtdContributorCells({
      assetPackId: allocation.range.assetPackId,
      rangeStart: allocation.range.rangeStart,
      rangeEndExclusive: allocation.range.rangeEndExclusive,
      issuedAt,
      contributors: [
        {
          contributorId: 'contributor-a',
          walletId: 'wallet-a',
          normalizedContributionVolume: 1000n,
          fitBps: 10_000,
          qualityBps: 10_000,
          provenanceBps: 10_000,
          noveltyBps: 10_000,
          antiNoiseBps: 10_000,
        },
      ],
    });

    expect(
      replayBtdMintReceipts([{ ...receipt, proofRoot: '' }]).errors,
    ).toContain('proofRoot must be a non-empty string.');
    expect(
      replayBtdMintReceipts([
        {
          ...receipt,
          rangeEndExclusive: receipt.rangeEndExclusive + 1,
        },
      ]).errors,
    ).toContain('Mint receipt tokenCount does not match range boundaries.');
    expect(
      replayBtdMintReceipts([
        {
          ...receipt,
          maxSupply: 21_000_001 as typeof BTD_MAX_MINTABLE_SUPPLY,
        },
      ]).errors,
    ).toContain(`maxSupply must be ${BTD_MAX_MINTABLE_SUPPLY}.`);
    expect(
      replayBtdMintReceipts([{ ...receipt, accessPolicyHash: '' }]).errors,
    ).toContain('accessPolicyHash must be a non-empty string.');
    expect(
      replayBtdMintReceipts(
        [receipt],
        [
          {
            ...contributorAllocation,
            allocations: [
              {
                ...contributorAllocation.allocations[0],
                tokenCount: contributorAllocation.allocations[0].tokenCount + 1,
              },
            ],
          },
        ],
      ).errors,
    ).toContain('Contributor allocation rangeEndExclusive drift.');
  });
});

describe('V27 access and replay primitives', () => {
  it('separates owner-read, licensed-read, and denied access by policy hash', () => {
    const policy = {
      accessPolicyId: 'policy-1',
      accessPolicyHash: 'policy-hash',
      ownerRead: true,
      licensedRead: true,
      derivativeUse: false,
      redistributionAllowed: false,
      confidentiality: 'public_proof_private_source' as const,
    };

    expect(
      evaluateBtdReadAccess({
        walletId: 'wallet-owner',
        assetPackId: 'asset-pack-1',
        accessPolicy: policy,
        ownershipClaims: [
          {
            walletId: 'wallet-owner',
            assetPackId: 'asset-pack-1',
            rangeStart: 0,
            rangeEndExclusive: 2,
            accessPolicyHash: 'policy-hash',
          },
        ],
        at: issuedAt,
      }).decision,
    ).toBe('owner_read');

    expect(
      evaluateBtdReadAccess({
        walletId: 'wallet-reader',
        assetPackId: 'asset-pack-1',
        accessPolicy: policy,
        licenses: [
          {
            licenseId: 'license-1',
            walletId: 'wallet-reader',
            assetPackId: 'asset-pack-1',
            accessPolicyHash: 'policy-hash',
            validFrom: '2026-05-05T00:00:00.000Z',
            expiresAt: '2026-05-07T00:00:00.000Z',
          },
        ],
        at: issuedAt,
      }).decision,
    ).toBe('licensed_read');

    expect(
      evaluateBtdReadAccess({
        walletId: 'wallet-denied',
        assetPackId: 'asset-pack-1',
        accessPolicy: policy,
        at: issuedAt,
      }).decision,
    ).toBe('denied');
  });

  it('rejects expired licensed reads without treating them as ownership', () => {
    const policy = {
      accessPolicyId: 'policy-1',
      accessPolicyHash: 'policy-hash',
      ownerRead: true,
      licensedRead: true,
      derivativeUse: false,
      redistributionAllowed: false,
      confidentiality: 'public_proof_private_source' as const,
    };
    const decision = evaluateBtdReadAccess({
      walletId: 'wallet-reader',
      assetPackId: 'asset-pack-1',
      accessPolicy: policy,
      licenses: [
        {
          licenseId: 'license-expired',
          walletId: 'wallet-reader',
          assetPackId: 'asset-pack-1',
          accessPolicyHash: 'policy-hash',
          validFrom: '2026-05-01T00:00:00.000Z',
          expiresAt: '2026-05-05T00:00:00.000Z',
        },
      ],
      at: issuedAt,
    });

    expect(decision).toEqual({
      decision: 'denied',
      accessPolicyHash: 'policy-hash',
      reason: 'license_expired',
    });
  });

  it('rejects policy-hash drift on ownership and licensed-read inputs', () => {
    const policy = {
      accessPolicyId: 'policy-1',
      accessPolicyHash: 'policy-hash-committed',
      ownerRead: true,
      licensedRead: true,
      derivativeUse: false,
      redistributionAllowed: false,
      confidentiality: 'public_proof_private_source' as const,
    };

    expect(
      evaluateBtdReadAccess({
        walletId: 'wallet-owner',
        assetPackId: 'asset-pack-1',
        accessPolicy: policy,
        ownershipClaims: [
          {
            walletId: 'wallet-owner',
            assetPackId: 'asset-pack-1',
            rangeStart: 0,
            rangeEndExclusive: 2,
            accessPolicyHash: 'policy-hash-stale',
          },
        ],
        at: issuedAt,
      }),
    ).toEqual({
      decision: 'denied',
      accessPolicyHash: 'policy-hash-committed',
      reason: 'policy_mismatch',
    });

    expect(
      evaluateBtdReadAccess({
        walletId: 'wallet-reader',
        assetPackId: 'asset-pack-1',
        accessPolicy: policy,
        licenses: [
          {
            licenseId: 'license-stale-policy',
            walletId: 'wallet-reader',
            assetPackId: 'asset-pack-1',
            accessPolicyHash: 'policy-hash-stale',
            validFrom: '2026-05-01T00:00:00.000Z',
            expiresAt: '2026-05-07T00:00:00.000Z',
          },
        ],
        at: issuedAt,
      }),
    ).toEqual({
      decision: 'denied',
      accessPolicyHash: 'policy-hash-committed',
      reason: 'policy_mismatch',
    });
  });

  it('replays measuremint receipts including zero-cell tail events', () => {
    const first = applyBtdMeasureMint({
      state: createBtdMeasureMintState({ curveParameter: 10_000n }),
      assetPackId: 'asset-pack-replay-1',
      semanticVolume: { normalizedBitcodeVolume: 10_000n },
      proofRoot: 'proof-root-1',
      settlementJournalRoot: 'settlement-root-1',
      accessPolicyHash: 'policy-hash-1',
      exchangeSequence: 1n,
      issuedAt,
    });
    const second = applyBtdMeasureMint({
      state: first.nextState,
      assetPackId: 'asset-pack-replay-2',
      semanticVolume: { normalizedBitcodeVolume: 1n },
      proofRoot: 'proof-root-2',
      settlementJournalRoot: 'settlement-root-2',
      accessPolicyHash: 'policy-hash-2',
      exchangeSequence: 2n,
      issuedAt,
    });

    const replay = replayBtdMeasureMintReceipts([first.receipt, second.receipt]);

    expect(replay.blocking).toBe(false);
    expect(replay.totalMinted).toBe(second.receipt.totalMintedAfter);
    expect(replay.cumulativeAdmittedMeasurement).toBe(10_001n);
  });
});

describe('V27 wallet and BTC fee transaction primitives', () => {
  it('keeps BTC fee signing user-controlled through the PSBT lifecycle', () => {
    const session = createWalletSignerSession({
      walletSessionId: 'session-1',
      walletId: 'wallet-1',
      userId: 'user-1',
      address: 'tb1ptest',
      network: 'signet',
      nonce: 'nonce-1',
      capabilities: ['psbt_sign', 'rights_transfer'],
      authorizationProof: walletAuthorizationProof('session-1'),
      authorizedAt: issuedAt,
    });

    const prepared = buildPreparedBtcFeeTransactionReceipt({
      receiptId: 'fee-1',
      feePurpose: 'asset_pack_anchor',
      payerSession: session,
      psbt: 'cHNidP8BAHECAAAAA',
      satsPaid: 1200n,
      exchangeSequence: 2n,
      terminalJournalRoot: 'journal-root',
      relatedAssetPackId: 'asset-pack-range',
      issuedAt,
    });

    const signed = advanceBtcFeeTransactionReceipt(prepared, {
      finalityState: 'signed',
      psbt: 'signed-psbt',
    });
    const broadcast = advanceBtcFeeTransactionReceipt(signed, {
      finalityState: 'broadcast',
      txid: 'txid-1',
    });
    const confirmed = advanceBtcFeeTransactionReceipt(broadcast, {
      finalityState: 'confirmed',
      confirmations: 2,
    });

    expect(prepared.feeAsset).toBe(BITCODE_FEE_ASSET);
    expect(prepared.serverCustody).toBe(false);
    expect(prepared.walletAuthorizationProof.proofKind).toBe('message_signature');
    expect(prepared.txid).toBeNull();
    expect(confirmed.txid).toBe('txid-1');
    expect(confirmed.confirmations).toBe(2);
    expect(() =>
      advanceBtcFeeTransactionReceipt(confirmed, { finalityState: 'failed' }),
    ).toThrow(/Invalid BTC fee transition/);
    expect(() =>
      assertBtcFeeTransactionReceipt({
        ...prepared,
        feeAsset: 'BTD' as unknown as typeof BITCODE_FEE_ASSET,
      }),
    ).toThrow(/must use BTC/);
  });

  it('fails closed when a signer session has no address authorization proof', () => {
    const session = createWalletSignerSession({
      walletSessionId: 'session-unproved',
      walletId: 'wallet-unproved',
      userId: 'user-unproved',
      address: 'tb1punproved',
      network: 'signet',
      nonce: 'nonce-unproved',
      capabilities: ['psbt_sign'],
      authorizedAt: issuedAt,
    });

    expect(session.state).toBe('prepared');
    expect(session.failureReason).toBe('address_authorization_required');
    expect(() =>
      buildPreparedBtcFeeTransactionReceipt({
        receiptId: 'fee-unproved',
        feePurpose: 'terminal_operation',
        payerSession: session,
        psbt: 'cHNidP8BAHECAAAAA',
        satsPaid: 1200n,
        exchangeSequence: 2n,
        terminalJournalRoot: 'journal-root',
        issuedAt,
      }),
    ).toThrow(/Wallet session is not authorized/);
  });

  it('keeps live Bitcoin provider integration behind a network-checked receipt boundary', async () => {
    const session = createWalletSignerSession({
      walletSessionId: 'session-provider',
      walletId: 'wallet-provider',
      userId: 'user-provider',
      address: 'tb1pprovider',
      network: 'signet',
      nonce: 'nonce-provider',
      capabilities: ['psbt_sign'],
      authorizationProof: walletAuthorizationProof('session-provider'),
      authorizedAt: issuedAt,
    });
    const provider: BitcoinFeeTransactionProvider = {
      network: 'signet',
      async prepareFeePsbt() {
        return { psbt: 'provider-psbt', satsPerVbyte: 2 };
      },
      async broadcastSignedPsbt() {
        return { txid: 'provider-txid', vout: 0 };
      },
      async observeTransaction(txid) {
        return {
          txid,
          network: 'signet',
          confirmations: 2,
          finalityState: 'confirmed',
        };
      },
    };

    const prepared = await prepareBtcFeeWithProvider({
      provider,
      receiptId: 'fee-provider',
      payerSession: session,
      feePurpose: 'asset_pack_anchor',
      satsPaid: 1400n,
      exchangeSequence: 9n,
      terminalJournalRoot: 'journal-root-provider',
      issuedAt,
    });
    const broadcast = await broadcastBtcFeeWithProvider({
      provider,
      signedReceipt: prepared,
      signedPsbt: 'signed-provider-psbt',
    });
    const confirmed = await observeBtcFeeWithProvider({
      provider,
      broadcastReceipt: broadcast,
    });

    expect(prepared.finalityState).toBe('prepared');
    expect(broadcast.finalityState).toBe('broadcast');
    expect(confirmed.finalityState).toBe('confirmed');
    expect(confirmed.confirmations).toBe(2);
  });
});

describe('V27 deployment lane primitives', () => {
  it('separates signet proof and mainnet-ready controls from value-bearing launch', () => {
    const signet = buildV27CryptoDeploymentLane({
      lane: 'signet',
      bitcoinNetwork: 'signet',
      ledgerNetwork: 'signet',
      rollbackPlanRoot: 'rollback-root',
    });
    const mainnetReady = buildV27CryptoDeploymentLane({
      lane: 'mainnet-ready',
      bitcoinNetwork: 'mainnet',
      ledgerNetwork: 'mainnet',
      rollbackPlanRoot: 'rollback-root',
    });

    expect(signet.signetProofRequired).toBe(true);
    expect(mainnetReady.valueBearing).toBe(false);
    expect(() =>
      buildV27CryptoDeploymentLane({
        lane: 'mainnet-value-bearing',
        bitcoinNetwork: 'mainnet',
        ledgerNetwork: 'mainnet',
        rollbackPlanRoot: 'rollback-root',
      }),
    ).toThrow(/operational approval root/);
  });

  it('records environment readiness and telemetry severity for crypto operations', () => {
    const signet = buildV27CryptoDeploymentLane({
      lane: 'signet',
      bitcoinNetwork: 'signet',
      ledgerNetwork: 'signet',
      rollbackPlanRoot: 'rollback-root',
    });
    const complete = buildV27CryptoDeploymentReadinessReceipt({
      readinessId: 'readiness-signet',
      lane: signet,
      presentEnvironmentKeys: [...V27_CRYPTO_DEPLOYMENT_ENVIRONMENT_KEYS],
      issuedAt,
    });
    const missing = buildV27CryptoDeploymentReadinessReceipt({
      readinessId: 'readiness-missing',
      lane: signet,
      presentEnvironmentKeys: ['BITCODE_CRYPTO_LANE'],
      issuedAt,
    });
    const telemetry = buildV27CryptoTelemetryRecord({
      event: 'ledger_provider.disagreement',
      subjectId: 'anchor-1',
      receiptRoot: 'receipt-root',
      ledgerAnchorId: 'anchor-1',
      issuedAt,
    });

    expect(complete.blocking).toBe(false);
    expect(missing.blocking).toBe(true);
    expect(missing.missingEnvironmentKeys).toContain('BITCODE_BTC_RPC_URL');
    expect(telemetry.severity).toBe('critical');
  });
});

describe('V27 ledger anchor and minimal Exchange primitives', () => {
  it('anchors an AssetPack range on the Bitcoin primary path', () => {
    const prepared = buildPreparedAssetPackLedgerAnchor({
      anchorId: 'anchor-1',
      assetPackId: 'asset-pack-range',
      chain: 'bitcoin',
      network: 'signet',
      commitmentRoot: 'commitment-root',
      sourceManifestRoot: 'source-root',
      proofRoot: 'proof-root',
      accessPolicyHash: 'policy-hash',
      btdRangeStart: 0,
      btdRangeEndExclusive: 2,
    });

    const confirmed = advanceAssetPackLedgerAnchor(
      advanceAssetPackLedgerAnchor(prepared, {
        finalityState: 'broadcast',
        txidOrHash: 'anchor-txid',
      }),
      {
        finalityState: 'confirmed',
        confirmations: 3,
      },
    );

    expect(prepared.commitmentMethod).toBe('taproot');
    expect(confirmed.finalityState).toBe('confirmed');
    expect(confirmed.txidOrHash).toBe('anchor-txid');
  });

  it('keeps Ethereum anchors secondary and explicit through registry/event commitments', () => {
    const anchor = buildPreparedAssetPackLedgerAnchor({
      anchorId: 'anchor-eth-1',
      assetPackId: 'asset-pack-range',
      chain: 'ethereum',
      network: 'sepolia',
      commitmentMethod: 'ethereum_registry_event',
      commitmentRoot: 'eth-commitment-root',
      sourceManifestRoot: 'source-root',
      proofRoot: 'proof-root',
      accessPolicyHash: 'policy-hash',
      btdRangeStart: 0,
      btdRangeEndExclusive: 2,
      contractAddress: '0x0000000000000000000000000000000000000001',
      tokenId: 'asset-pack-range',
    });

    expect(anchor.chain).toBe('ethereum');
    expect(anchor.commitmentMethod).toBe('ethereum_registry_event');
    expect(() =>
      buildPreparedAssetPackLedgerAnchor({
        anchorId: 'anchor-eth-invalid',
        assetPackId: 'asset-pack-range',
        chain: 'ethereum',
        network: 'sepolia',
        commitmentRoot: 'eth-commitment-root',
        sourceManifestRoot: 'source-root',
        proofRoot: 'proof-root',
        accessPolicyHash: 'policy-hash',
        btdRangeStart: 0,
        btdRangeEndExclusive: 2,
      }),
    ).toThrow(/Ethereum anchors must declare/);
  });

  it('replays minimal Exchange rights transfer only after order settlement', () => {
    for (const orderKind of ['sell', 'buy', 'bid', 'ask'] as const) {
      const orderByKind = createAssetPackExchangeOrder({
        orderId: `order-kind-${orderKind}`,
        orderKind,
        assetPackId: 'asset-pack-range',
        rangeStart: 0,
        rangeEndExclusive: 2,
        makerWalletId: `wallet-${orderKind}`,
        priceSats: 5000n,
        accessPolicyHash: 'policy-hash',
        createdAtExchangeSequence: 3n,
      });

      expect(orderByKind.orderKind).toBe(orderKind);
      expect(orderByKind.priceAsset).toBe(BITCODE_FEE_ASSET);
    }

    const order = createAssetPackExchangeOrder({
      orderId: 'order-1',
      orderKind: 'sell',
      assetPackId: 'asset-pack-range',
      rangeStart: 0,
      rangeEndExclusive: 2,
      makerWalletId: 'wallet-seller',
      priceSats: 5000n,
      accessPolicyHash: 'policy-hash',
      createdAtExchangeSequence: 3n,
    });

    expect(cancelAssetPackExchangeOrder(order).orderState).toBe('cancelled');
    expect(() =>
      buildAssetPackRightsTransferReceipt({
        receiptId: 'transfer-open-order',
        settledOrder: acceptAssetPackExchangeOrder(order, 'wallet-buyer'),
        fromWalletId: 'wallet-seller',
        toWalletId: 'wallet-buyer',
        btcFeeReceiptId: 'fee-1',
        issuedAt,
      }),
    ).toThrow(/settled Exchange order/);

    const settled = settleAssetPackExchangeOrder(
      acceptAssetPackExchangeOrder(order, 'wallet-buyer'),
      {
        settledAtExchangeSequence: 4n,
        ledgerAnchorId: 'anchor-1',
      },
    );
    expect(() =>
      buildAssetPackRightsTransferReceipt({
        receiptId: 'transfer-no-anchor',
        settledOrder: settleAssetPackExchangeOrder(
          acceptAssetPackExchangeOrder(order, 'wallet-buyer'),
          {
            settledAtExchangeSequence: 4n,
          },
        ),
        fromWalletId: 'wallet-seller',
        toWalletId: 'wallet-buyer',
        btcFeeReceiptId: 'fee-1',
        issuedAt,
      }),
    ).toThrow(/ledgerAnchorId/);

    const transfer = buildAssetPackRightsTransferReceipt({
      receiptId: 'transfer-1',
      settledOrder: settled,
      fromWalletId: 'wallet-seller',
      toWalletId: 'wallet-buyer',
      btcFeeReceiptId: 'fee-1',
      issuedAt,
    });

    expect(transfer.kind).toBe('btd.asset_pack_rights_transfer');
    expect(transfer.priceAsset).toBe(BITCODE_FEE_ASSET);
    expect(transfer.exchangeSequence).toBe(4n);
  });
});

describe('V27 allocation, ancestry, and licensed-read revenue primitives', () => {
  it('allocates whole cells by deterministic weighted fit without losing range conservation', () => {
    const allocation = allocateBtdContributorCells({
      assetPackId: 'asset-pack-allocation',
      rangeStart: 10,
      rangeEndExclusive: 15,
      issuedAt,
      contributors: [
        {
          contributorId: 'contributor-b',
          walletId: 'wallet-b',
          normalizedContributionVolume: 1000n,
          fitBps: 10_000,
          qualityBps: 10_000,
          provenanceBps: 10_000,
          noveltyBps: 10_000,
          antiNoiseBps: 10_000,
        },
        {
          contributorId: 'contributor-a',
          walletId: 'wallet-a',
          normalizedContributionVolume: 3000n,
          fitBps: 10_000,
          qualityBps: 10_000,
          provenanceBps: 10_000,
          noveltyBps: 10_000,
          antiNoiseBps: 10_000,
        },
      ],
    });

    expect(allocation.allocations.map((item) => item.contributorId)).toEqual([
      'contributor-a',
      'contributor-b',
    ]);
    expect(allocation.allocations.reduce((sum, item) => sum + item.tokenCount, 0)).toBe(5);
    expect(allocation.allocations[0].rangeStart).toBe(10);
    expect(allocation.allocations[1].rangeEndExclusive).toBe(15);
  });

  it('keeps ancestry late-bound and payable only after evidence thresholds pass', () => {
    const review = reviewBtdAncestorEdges({
      reviewId: 'ancestry-review-1',
      childAssetPackId: 'asset-pack-child',
      issuedAt,
      edges: [
        {
          parentAssetPackId: 'asset-pack-parent',
          childAssetPackId: 'asset-pack-child',
          edgeKind: 'implementation_dependency',
          evidenceRoot: 'evidence-root',
          confidenceBps: 8_000,
          timelessnessBps: 7_500,
          depth: 1,
          createdAfterChildFit: true,
          conflictDisclosure: [],
        },
        {
          parentAssetPackId: 'asset-pack-citation',
          childAssetPackId: 'asset-pack-child',
          edgeKind: 'citation_only',
          evidenceRoot: 'citation-root',
          confidenceBps: 8_000,
          timelessnessBps: 7_500,
          depth: 1,
          createdAfterChildFit: true,
          conflictDisclosure: [],
        },
        {
          parentAssetPackId: 'asset-pack-premint',
          childAssetPackId: 'asset-pack-child',
          edgeKind: 'proof_dependency',
          evidenceRoot: 'premint-root',
          confidenceBps: 9_000,
          timelessnessBps: 9_000,
          depth: 1,
          createdAfterChildFit: false,
          conflictDisclosure: [],
        },
      ],
    });

    expect(review.edges[0].status).toBe('payable');
    expect(review.edges[1].status).toBe('recorded_unpaid');
    expect(review.edges[2].status).toBe('rejected');
    expect(review.edges[2].rejectionReason).toBe('not_late_bound');
    expect(BigInt(review.edges[0].routeWeight) > 0n).toBe(true);
    expect(review.supplyEffect).toBe('none');
    expect(review.mintCountDelta).toBe(0);
  });

  it('rejects ancestry attack paths without creating supply side effects', () => {
    const review = reviewBtdAncestorEdges({
      reviewId: 'ancestry-review-attack',
      childAssetPackId: 'asset-pack-child',
      issuedAt,
      existingEdges: [
        {
          parentAssetPackId: 'asset-pack-child',
          childAssetPackId: 'asset-pack-grandchild',
          status: 'payable',
        },
        {
          parentAssetPackId: 'asset-pack-child',
          childAssetPackId: 'asset-pack-cycle-middle',
          status: 'payable',
        },
        {
          parentAssetPackId: 'asset-pack-cycle-middle',
          childAssetPackId: 'asset-pack-cycle-root',
          status: 'payable',
        },
      ],
      duplicateSourceRoots: ['duplicate-source-root'],
      edges: [
        {
          parentAssetPackId: 'asset-pack-grandchild',
          childAssetPackId: 'asset-pack-child',
          edgeKind: 'implementation_dependency',
          evidenceRoot: 'reciprocal-root',
          confidenceBps: 9_000,
          timelessnessBps: 9_000,
          depth: 1,
          createdAfterChildFit: true,
          conflictDisclosure: [],
        },
        {
          parentAssetPackId: 'asset-pack-cycle-root',
          childAssetPackId: 'asset-pack-child',
          edgeKind: 'proof_dependency',
          evidenceRoot: 'cycle-root',
          confidenceBps: 9_000,
          timelessnessBps: 9_000,
          depth: 2,
          createdAfterChildFit: true,
          conflictDisclosure: [],
        },
        {
          parentAssetPackId: 'asset-pack-duplicate-source',
          childAssetPackId: 'asset-pack-child',
          edgeKind: 'source_reuse',
          evidenceRoot: 'duplicate-root',
          sourceFingerprintRoot: 'duplicate-source-root',
          confidenceBps: 9_000,
          timelessnessBps: 9_000,
          depth: 1,
          createdAfterChildFit: true,
          conflictDisclosure: [],
        },
        {
          parentAssetPackId: 'asset-pack-conflicted',
          childAssetPackId: 'asset-pack-child',
          edgeKind: 'teaching_dependency',
          evidenceRoot: 'conflict-root',
          claimantId: 'operator-a',
          reviewerId: 'operator-a',
          confidenceBps: 9_000,
          timelessnessBps: 9_000,
          depth: 1,
          createdAfterChildFit: true,
          conflictDisclosure: [],
        },
        {
          parentAssetPackId: 'asset-pack-disclosed',
          childAssetPackId: 'asset-pack-child',
          edgeKind: 'conceptual_dependency',
          evidenceRoot: 'disclosed-root',
          claimantId: 'operator-a',
          reviewerId: 'operator-b',
          confidenceBps: 9_000,
          timelessnessBps: 9_000,
          depth: 1,
          createdAfterChildFit: true,
          conflictDisclosure: ['common_control_disclosed'],
        },
      ],
    });

    expect(review.edges.map((edge) => edge.rejectionReason)).toEqual([
      'reciprocal_loop',
      'dependency_cycle',
      'duplicate_source',
      'claimant_reviewer_conflict',
      'conflict_disclosed',
    ]);
    expect(review.edges.map((edge) => edge.status)).toEqual([
      'rejected',
      'rejected',
      'rejected',
      'rejected',
      'recorded_unpaid',
    ]);
    expect(review.edges.every((edge) => edge.mintCountDelta === 0)).toBe(true);
    expect(review.edges.every((edge) => edge.supplyEffect === 'none')).toBe(true);
    expect(review.rejectedEdgeCount).toBe(4);
    expect(review.recordedUnpaidEdgeCount).toBe(1);
    expect(review.payableEdgeCount).toBe(0);
  });

  it('routes licensed-read sats locally and conserves direct, ancestry, and treasury pools', () => {
    const route = buildLicensedReadRevenueRoute({
      paymentId: 'read-payment-1',
      assetPackId: 'asset-pack-allocation',
      grossSats: 10_001n,
      treasuryWalletId: 'wallet-treasury',
      exchangeSequence: 7n,
      issuedAt,
      directRecipients: [
        { walletId: 'wallet-a', weight: 3n },
        { walletId: 'wallet-b', weight: 1n },
      ],
      ancestorRecipients: [{ walletId: 'wallet-ancestor', weight: 1n }],
    });

    expect(route.priceAsset).toBe(BITCODE_FEE_ASSET);
    expect(route.directSats + route.ancestorSats + route.treasurySats).toBe(10_001n);
    expect(route.disputeHoldbackSats).toBe(0n);
    expect(route.routeState).toBe('settled');
    expect(assertLicensedReadRevenueRouteConserved(route)).toBe(route);
  });

  it('records dispute holdback and pending/failed route categories without breaking conservation', () => {
    const route = buildLicensedReadRevenueRoute({
      paymentId: 'read-payment-holdback',
      assetPackId: 'asset-pack-allocation',
      grossSats: 10_000n,
      treasuryWalletId: 'wallet-treasury',
      disputeHoldbackWalletId: 'wallet-holdback',
      exchangeSequence: 9n,
      issuedAt,
      directSplitBps: 7_000,
      ancestorSplitBps: 1_000,
      treasurySplitBps: 1_000,
      disputeHoldbackBps: 1_000,
      directRecipients: [
        { walletId: 'wallet-a', weight: 3n },
        { walletId: 'wallet-b', weight: 1n },
      ],
      ancestorRecipients: [{ walletId: 'wallet-ancestor', weight: 1n }],
      pendingRoutes: [
        {
          category: 'direct',
          walletId: 'wallet-b',
          sats: 1750n,
          reason: 'wallet_settlement_pending',
        },
      ],
      failedRoutes: [
        {
          category: 'treasury',
          walletId: 'wallet-treasury',
          sats: 0n,
          reason: 'no_failure_amount_recorded',
        },
      ],
    });

    expect(route.directSats).toBe(7_000n);
    expect(route.ancestorSats).toBe(1_000n);
    expect(route.treasurySats).toBe(1_000n);
    expect(route.disputeHoldbackSats).toBe(1_000n);
    expect(route.pendingRoutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: 'dispute_holdback', sats: 1_000n }),
      ]),
    );
    expect(route.routeState).toBe('failed');
    expect(
      route.directSats + route.ancestorSats + route.treasurySats + route.disputeHoldbackSats,
    ).toBe(route.grossSats);
    expect(assertLicensedReadRevenueRouteConserved(route)).toBe(route);
  });

  it('requires explicit holdback custody when a licensed-read split reserves dispute sats', () => {
    expect(() =>
      buildLicensedReadRevenueRoute({
        paymentId: 'read-payment-missing-holdback-wallet',
        assetPackId: 'asset-pack-allocation',
        grossSats: 10_000n,
        treasuryWalletId: 'wallet-treasury',
        exchangeSequence: 9n,
        issuedAt,
        directSplitBps: 7_000,
        ancestorSplitBps: 1_000,
        treasurySplitBps: 1_000,
        disputeHoldbackBps: 1_000,
        directRecipients: [{ walletId: 'wallet-a', weight: 1n }],
        ancestorRecipients: [{ walletId: 'wallet-ancestor', weight: 1n }],
      }),
    ).toThrow(/disputeHoldbackWalletId/);
  });

  it('keeps licensed-read revenue valid when no payable ancestry exists', () => {
    const route = buildLicensedReadRevenueRoute({
      paymentId: 'read-payment-no-ancestor',
      assetPackId: 'asset-pack-allocation',
      grossSats: 10_000n,
      treasuryWalletId: 'wallet-treasury',
      exchangeSequence: 8n,
      issuedAt,
      directRecipients: [{ walletId: 'wallet-a', weight: 1n }],
    });

    expect(route.ancestorSats).toBe(0n);
    expect(route.ancestorRoutes).toEqual([]);
    expect(route.treasurySats).toBe(2_000n);
    expect(route.treasuryRoutes).toEqual([
      { walletId: 'wallet-treasury', sats: 2_000n, weight: '1' },
    ]);
    expect(assertLicensedReadRevenueRouteConserved(route)).toBe(route);
  });
});

describe('V27 Terminal journal and ledger/database reconciliation primitives', () => {
  it('covers every required Terminal transaction family before Gate 13 can close', () => {
    const entries = REQUIRED_JOURNAL_TRANSACTION_KINDS.map((transactionKind, index) =>
      buildJournalEntry({
        journalEntryId: `journal-${transactionKind}`,
        transactionKind,
        actorId: 'user-1',
        preStateRoot: `pre-${transactionKind}`,
        postStateRoot: `post-${transactionKind}`,
        receiptRoots: [`receipt-${transactionKind}`],
        ledgerAnchorIds:
          transactionKind === 'btc_fee_payment' ||
          transactionKind === 'asset_pack_anchor' ||
          transactionKind === 'rights_transfer'
            ? [`anchor-${transactionKind}`]
            : [],
        exchangeSequence: BigInt(index + 1),
        issuedAt,
      }),
    );
    const coverage = buildJournalCoverageReceipt({
      coverageId: 'terminal-coverage-1',
      entries,
      issuedAt,
    });
    const missing = buildJournalCoverageReceipt({
      coverageId: 'terminal-coverage-missing',
      entries: entries.filter((entry) => entry.transactionKind !== 'rights_transfer'),
      issuedAt,
    });

    expect(coverage.blocking).toBe(false);
    expect(coverage.missingTransactionKinds).toEqual([]);
    expect(coverage.observedTransactionKinds).toContain('read_submission');
    expect(coverage.observedTransactionKinds).toContain('rights_transfer');
    expect(missing.blocking).toBe(true);
    expect(missing.missingTransactionKinds).toEqual(['rights_transfer']);
  });

  it('marks projection drift as blocking before UI can claim finality', () => {
    const entry = buildJournalEntry({
      journalEntryId: 'journal-1',
      transactionKind: 'asset_pack_anchor',
      actorId: 'user-1',
      preStateRoot: 'pre-root',
      postStateRoot: 'post-root',
      receiptRoots: ['fee-1', 'anchor-1'],
      ledgerAnchorIds: ['anchor-1'],
      exchangeSequence: 5n,
      issuedAt,
    });

    const diff = diffJournalProjection(entry, {
      journalEntryId: 'journal-1',
      postStateRoot: 'stale-post-root',
      receiptRoots: ['fee-1', 'anchor-1'],
      ledgerAnchorIds: ['anchor-1'],
    });

    expect(diff.blocking).toBe(true);
    expect(diff.mismatches).toContain('post_state_root');
  });

  it('emits projection repair receipts when database state contradicts ledger facts', () => {
    const report = reconcileLedgerDatabaseProjection({
      reconciliationId: 'reconcile-1',
      ledgerFacts: [
        {
          factId: 'anchor-1',
          ledgerRoot: 'confirmed-root',
          finalityState: 'confirmed',
        },
      ],
      databaseFacts: [
        {
          factId: 'anchor-1',
          projectedLedgerRoot: 'stale-root',
          projectedFinalityState: 'broadcast',
        },
      ],
      metaphysicalFacts: [
        {
          factId: 'private-source-1',
          factKind: 'private_source_metadata',
          canonicalRoot: 'private-source-root',
          receiptRoot: 'private-source-receipt-root',
          private: true,
        },
      ],
      issuedAt,
    });
    const confirmedDowngrade = reconcileLedgerDatabaseProjection({
      reconciliationId: 'reconcile-confirmed',
      ledgerFacts: [
        {
          factId: 'anchor-confirmed',
          ledgerRoot: 'confirmed-root',
          finalityState: 'confirmed',
        },
      ],
      databaseFacts: [
        {
          factId: 'anchor-confirmed',
          projectedLedgerRoot: 'confirmed-root',
          projectedFinalityState: 'broadcast',
        },
      ],
      issuedAt,
    });
    const replay = reconcileLedgerDatabaseProjection({
      reconciliationId: 'reconcile-confirmed',
      ledgerFacts: [
        {
          factId: 'anchor-confirmed',
          ledgerRoot: 'confirmed-root',
          finalityState: 'confirmed',
        },
      ],
      databaseFacts: [
        {
          factId: 'anchor-confirmed',
          projectedLedgerRoot: 'confirmed-root',
          projectedFinalityState: 'broadcast',
        },
      ],
      issuedAt,
    });

    expect(report.repairs).toHaveLength(2);
    expect(report.blocking).toBe(true);
    expect(report.metaphysicalFacts[0].canonicalRoot).toBe('private-source-root');
    expect(confirmedDowngrade.repairs).toEqual(replay.repairs);
    expect(confirmedDowngrade.repairs[0].blocking).toBe(true);
    expect(() =>
      reconcileLedgerDatabaseProjection({
        reconciliationId: 'reconcile-public-private-fact',
        ledgerFacts: [],
        databaseFacts: [],
        metaphysicalFacts: [
          {
            factId: 'public-private-fact',
            factKind: 'need_fit_context',
            canonicalRoot: 'root',
            private: false,
          },
        ],
        issuedAt,
      }),
    ).toThrow(/marked private/);
  });
});

describe('V27 protocol upgrade receipt primitives', () => {
  it('keeps testnet/mainnet upgrade work receipt-bound and reversible before verification', () => {
    const planned = buildPlannedBtdProtocolUpgradeReceipt({
      upgradeId: 'upgrade-v27-1',
      fromVersion: 'V26',
      toVersion: 'V27',
      network: 'signet',
      migrationRoot: 'migration-root',
      preStateRoot: 'pre-state-root',
      approvalReceiptRoot: 'approval-root',
      rollbackPlanRoot: 'rollback-root',
      issuedAt,
    });
    const applied = advanceBtdProtocolUpgradeReceipt(planned, {
      upgradeState: 'applied',
      postStateRoot: 'post-state-root',
      ledgerAnchorId: 'anchor-1',
    });
    const verified = advanceBtdProtocolUpgradeReceipt(applied, {
      upgradeState: 'verified',
    });

    expect(planned.upgradeState).toBe('planned');
    expect(verified.upgradeState).toBe('verified');
    expect(() =>
      advanceBtdProtocolUpgradeReceipt(verified, { upgradeState: 'failed' }),
    ).toThrow(/Invalid upgrade transition/);
  });
});
