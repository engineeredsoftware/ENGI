// @ts-check

export const BTD_MAX_MINTABLE_SUPPLY = 21_000_000;
export const BTD_QUANTIZATION_Q = 1000n;
export const BITCODE_FEE_ASSET = 'BTC';
export const BITCODE_PUBLIC_BITCOIN_PROOF_NETWORK = 'signet';
export const BTD_MEASUREMINT_CURVE = 'hyperbolic_saturation';
export const REQUIRED_TERMINAL_TRANSACTION_KINDS = [
  'read_submission',
  'fit_closure',
  'proof_admission',
  'asset_pack_mint',
  'btc_fee_payment',
  'asset_pack_anchor',
  'licensed_read_purchase',
  'exchange_order',
  'exchange_order_cancel',
  'rights_transfer',
  'dispute_holdback',
  'settlement_finalization',
  'ledger_database_reconciliation'
];
export const REQUIRED_DEPLOYMENT_ENVIRONMENT_KEYS = [
  'BITCODE_CRYPTO_LANE',
  'BITCODE_BITCOIN_NETWORK',
  'BITCODE_LEDGER_NETWORK',
  'BITCODE_BTC_RPC_URL',
  'BITCODE_CRYPTO_TELEMETRY_SINK',
  'BITCODE_ROLLBACK_PLAN_ROOT'
];

/**
 * @param {{
 *   receiptId: string,
 *   assetPackId: string,
 *   units: Array<{
 *     unitId: string,
 *     proofReceiptRoot: string,
 *     dedupeReceiptRoot: string,
 *     fitAccepted: boolean,
 *     normalizedUnits: bigint,
 *     excludedReason?: string
 *   }>,
 *   issuedAt: string
 * }} input
 */
export function measureSemanticVolume(input) {
  const includedUnits = [];
  const excludedUnits = [];
  const unitIds = new Set();
  const proofRoots = new Set();
  let normalizedBitcodeVolume = 0n;

  for (const unit of input.units) {
    if (unit.excludedReason || !unit.fitAccepted || unit.normalizedUnits <= 0n) {
      excludedUnits.push({
        unitId: unit.unitId,
        excludedReason: unit.excludedReason || (!unit.fitAccepted ? 'fit_not_accepted' : 'non_positive_semantic_units')
      });
      continue;
    }

    if (unitIds.has(unit.unitId) || proofRoots.has(unit.proofReceiptRoot)) {
      throw new Error('duplicate included semantic unit');
    }

    unitIds.add(unit.unitId);
    proofRoots.add(unit.proofReceiptRoot);
    normalizedBitcodeVolume += unit.normalizedUnits;
    includedUnits.push({
      unitId: unit.unitId,
      proofReceiptRoot: unit.proofReceiptRoot,
      dedupeReceiptRoot: unit.dedupeReceiptRoot,
      normalizedUnits: unit.normalizedUnits.toString()
    });
  }

  return {
    type: 'btd_semantic_volume_measurement',
    receiptId: input.receiptId,
    assetPackId: input.assetPackId,
    normalizedBitcodeVolume: normalizedBitcodeVolume.toString(),
    tokenCount: Number(normalizedBitcodeVolume / BTD_QUANTIZATION_Q),
    includedUnits,
    excludedUnits,
    issuedAt: input.issuedAt
  };
}

/**
 * @param {{ totalMinted: number, tokenCount: number }} input
 */
export function allocateRange(input) {
  if (!Number.isSafeInteger(input.totalMinted) || input.totalMinted < 0) {
    throw new Error('totalMinted must be a non-negative safe integer');
  }
  if (!Number.isSafeInteger(input.tokenCount) || input.tokenCount <= 0) {
    throw new Error('tokenCount must be a positive safe integer');
  }
  if (input.totalMinted + input.tokenCount > BTD_MAX_MINTABLE_SUPPLY) {
    throw new Error('BTD max supply exceeded');
  }

  return {
    rangeStart: input.totalMinted,
    rangeEndExclusive: input.totalMinted + input.tokenCount,
    totalMintedAfter: input.totalMinted + input.tokenCount
  };
}

/**
 * @param {{
 *   receiptId: string,
 *   assetPackId: string,
 *   rangeStart: number,
 *   rangeEndExclusive: number,
 *   totalMintedBefore: number,
 *   sourceManifestRoot: string,
 *   measurementReceiptRoot: string,
 *   fitReceiptRoot: string,
 *   proofRoot: string,
 *   dedupeReceiptRoot: string,
 *   settlementJournalRoot: string,
 *   exchangeReceiptRoot: string,
 *   accessPolicyId: string,
 *   accessPolicyHash: string,
 *   mintedAtExchangeSequence: bigint,
 *   issuedAt: string
 * }} input
 */
export function buildAssetPackMintReceipt(input) {
  const tokenCount = input.rangeEndExclusive - input.rangeStart;
  if (tokenCount <= 0) {
    throw new Error('mint receipt range must be non-empty');
  }
  if (input.totalMintedBefore !== input.rangeStart) {
    throw new Error('mint receipt totalMintedBefore must equal rangeStart');
  }

  return {
    type: 'btd_asset_pack_mint',
    receiptId: input.receiptId,
    assetPackId: input.assetPackId,
    rangeStart: input.rangeStart,
    rangeEndExclusive: input.rangeEndExclusive,
    tokenCount,
    totalMintedBefore: input.totalMintedBefore,
    totalMintedAfter: input.totalMintedBefore + tokenCount,
    maxSupply: BTD_MAX_MINTABLE_SUPPLY,
    sourceManifestRoot: input.sourceManifestRoot,
    measurementReceiptRoot: input.measurementReceiptRoot,
    fitReceiptRoot: input.fitReceiptRoot,
    proofRoot: input.proofRoot,
    dedupeReceiptRoot: input.dedupeReceiptRoot,
    settlementJournalRoot: input.settlementJournalRoot,
    exchangeReceiptRoot: input.exchangeReceiptRoot,
    accessPolicyId: input.accessPolicyId,
    accessPolicyHash: input.accessPolicyHash,
    mintedAtExchangeSequence: input.mintedAtExchangeSequence.toString(),
    issuedAt: input.issuedAt
  };
}

/**
 * @param {{ mintReceipts: any[], allocationReceipts?: any[] }} input
 */
export function replayAssetPackMintReceipts(input) {
  const errors = [];
  let totalMinted = 0;
  const ranges = [];
  const allocationByAssetPackId = new Map();

  for (const allocation of input.allocationReceipts || []) {
    const allocated = allocation.allocations.reduce((sum, item) => sum + item.tokenCount, 0);
    if (allocated !== allocation.tokenCount) {
      errors.push(`allocation ${allocation.assetPackId}: tokenCount drift`);
    }
    allocationByAssetPackId.set(allocation.assetPackId, allocation);
  }

  for (const receipt of input.mintReceipts) {
    if (receipt.maxSupply !== BTD_MAX_MINTABLE_SUPPLY) {
      errors.push(`mint ${receipt.assetPackId}: invalid maxSupply`);
    }
    for (const rootKey of ['sourceManifestRoot', 'measurementReceiptRoot', 'fitReceiptRoot', 'proofRoot', 'dedupeReceiptRoot', 'settlementJournalRoot', 'exchangeReceiptRoot', 'accessPolicyId', 'accessPolicyHash']) {
      if (!receipt[rootKey]) {
        errors.push(`mint ${receipt.assetPackId}: missing ${rootKey}`);
      }
    }
    if (receipt.rangeStart !== totalMinted || receipt.totalMintedBefore !== totalMinted) {
      errors.push(`mint ${receipt.assetPackId}: supply/range drift`);
    }
    if (receipt.tokenCount !== receipt.rangeEndExclusive - receipt.rangeStart) {
      errors.push(`mint ${receipt.assetPackId}: tokenCount drift`);
    }
    if (receipt.totalMintedAfter !== receipt.totalMintedBefore + receipt.tokenCount) {
      errors.push(`mint ${receipt.assetPackId}: totalMintedAfter drift`);
    }
    const allocation = allocationByAssetPackId.get(receipt.assetPackId);
    if (allocation && (
      allocation.rangeStart !== receipt.rangeStart ||
      allocation.rangeEndExclusive !== receipt.rangeEndExclusive ||
      allocation.tokenCount !== receipt.tokenCount
    )) {
      errors.push(`allocation ${receipt.assetPackId}: range drift`);
    }
    ranges.push({
      assetPackId: receipt.assetPackId,
      rangeStart: receipt.rangeStart,
      rangeEndExclusive: receipt.rangeEndExclusive
    });
    totalMinted = receipt.totalMintedAfter;
  }

  return {
    blocking: errors.length > 0,
    errors,
    totalMinted,
    nextTokenId: totalMinted,
    ranges,
    allocationCount: allocationByAssetPackId.size
  };
}

/**
 * @param {{
 *   walletId: string,
 *   assetPackId: string,
 *   accessPolicy: {
 *     accessPolicyId: string,
 *     accessPolicyHash: string,
 *     ownerRead: boolean,
 *     licensedRead: boolean
 *   },
 *   ownershipClaims?: Array<{
 *     walletId: string,
 *     assetPackId: string,
 *     rangeStart: number,
 *     rangeEndExclusive: number,
 *     accessPolicyHash: string
 *   }>,
 *   licenses?: Array<{
 *     licenseId: string,
 *     walletId: string,
 *     assetPackId: string,
 *     accessPolicyHash: string,
 *     validFrom: string,
 *     expiresAt?: string
 *   }>,
 *   at: string
 * }} input
 */
export function evaluateReadAccess(input) {
  const at = new Date(input.at);
  const matchingOwner = (input.ownershipClaims || []).find((claim) =>
    claim.walletId === input.walletId &&
    claim.assetPackId === input.assetPackId &&
    claim.accessPolicyHash === input.accessPolicy.accessPolicyHash &&
    claim.rangeEndExclusive > claim.rangeStart
  );

  if (matchingOwner && input.accessPolicy.ownerRead) {
    return {
      decision: 'owner_read',
      accessPolicyHash: input.accessPolicy.accessPolicyHash,
      reason: 'wallet_owns_policy_matching_range'
    };
  }

  const policyMatchedLicenses = (input.licenses || []).filter((license) =>
    license.walletId === input.walletId &&
    license.assetPackId === input.assetPackId &&
    license.accessPolicyHash === input.accessPolicy.accessPolicyHash
  );
  const validLicense = policyMatchedLicenses.find((license) =>
    new Date(license.validFrom) <= at &&
    (!license.expiresAt || new Date(license.expiresAt) > at)
  );

  if (validLicense && input.accessPolicy.licensedRead) {
    return {
      decision: 'licensed_read',
      accessPolicyHash: input.accessPolicy.accessPolicyHash,
      reason: 'wallet_has_valid_policy_matching_license'
    };
  }

  if (
    policyMatchedLicenses.some((license) =>
      license.expiresAt && new Date(license.expiresAt) <= at
    )
  ) {
    return deniedAccess(input.accessPolicy.accessPolicyHash, 'license_expired');
  }

  const mismatchedPolicy = [...(input.ownershipClaims || []), ...(input.licenses || [])].some((entry) =>
    entry.walletId === input.walletId &&
    entry.assetPackId === input.assetPackId &&
    entry.accessPolicyHash !== input.accessPolicy.accessPolicyHash
  );
  if (mismatchedPolicy) {
    return deniedAccess(input.accessPolicy.accessPolicyHash, 'policy_mismatch');
  }

  return deniedAccess(input.accessPolicy.accessPolicyHash, 'no_owner_or_valid_license');
}

function deniedAccess(accessPolicyHash, reason) {
  return {
    decision: 'denied',
    accessPolicyHash,
    reason
  };
}

/**
 * @param {{
 *   receiptId: string,
 *   assetPackId: string,
 *   normalizedBitcodeVolume: bigint,
 *   cumulativeMeasurementBefore: bigint,
 *   totalMintedBefore: number,
 *   curveParameter: bigint,
 *   proofRoot: string,
 *   settlementJournalRoot: string,
 *   accessPolicyHash: string,
 *   issuedAt: string
 * }} input
 */
export function measureMint(input) {
  const before = targetMinted(input.cumulativeMeasurementBefore, input.curveParameter);
  const cumulativeMeasurementAfter = input.cumulativeMeasurementBefore + input.normalizedBitcodeVolume;
  const after = targetMinted(cumulativeMeasurementAfter, input.curveParameter);
  const availableCells = BTD_MAX_MINTABLE_SUPPLY - input.totalMintedBefore;
  const tokenCount = Math.max(0, Math.min(after.targetMinted - before.targetMinted, availableCells));
  const rangeStart = tokenCount > 0 ? input.totalMintedBefore : undefined;
  const rangeEndExclusive = tokenCount > 0 ? input.totalMintedBefore + tokenCount : undefined;

  return {
    type: 'btd_measure_mint',
    receiptId: input.receiptId,
    assetPackId: input.assetPackId,
    curve: BTD_MEASUREMINT_CURVE,
    normalizedBitcodeVolume: input.normalizedBitcodeVolume.toString(),
    cumulativeMeasurementBefore: input.cumulativeMeasurementBefore.toString(),
    cumulativeMeasurementAfter: cumulativeMeasurementAfter.toString(),
    targetMintedBefore: before.targetMinted,
    targetMintedAfter: after.targetMinted,
    residualMintCreditBefore: before.residualMintCredit.toString(),
    residualMintCreditAfter: after.residualMintCredit.toString(),
    tokenCount,
    rangeStart,
    rangeEndExclusive,
    zeroCellReason: tokenCount === 0 ? (availableCells <= 0 ? 'tail_exhausted' : 'below_integer_threshold') : undefined,
    totalMintedBefore: input.totalMintedBefore,
    totalMintedAfter: input.totalMintedBefore + tokenCount,
    maxSupply: BTD_MAX_MINTABLE_SUPPLY,
    proofRoot: input.proofRoot,
    settlementJournalRoot: input.settlementJournalRoot,
    accessPolicyHash: input.accessPolicyHash,
    issuedAt: input.issuedAt
  };
}

/**
 * @param {bigint} cumulativeMeasurement
 * @param {bigint} curveParameter
 */
function targetMinted(cumulativeMeasurement, curveParameter) {
  if (cumulativeMeasurement === 0n) {
    return { targetMinted: 0, residualMintCredit: 0n };
  }

  const denominator = cumulativeMeasurement + curveParameter;
  const numerator = BigInt(BTD_MAX_MINTABLE_SUPPLY) * cumulativeMeasurement;
  return {
    targetMinted: Number(numerator / denominator),
    residualMintCredit: numerator % denominator
  };
}

/**
 * @param {{
 *   receiptId: string,
 *   assetPackId: string,
 *   rangeStart: number,
 *   rangeEndExclusive: number,
 *   contributors: Array<{ contributorId: string, walletId: string, weight: bigint }>,
 *   issuedAt: string
 * }} input
 */
export function buildContributorAllocationReceipt(input) {
  const tokenCount = input.rangeEndExclusive - input.rangeStart;
  if (tokenCount <= 0) {
    throw new Error('contributor allocation range must be non-empty');
  }

  const totalWeight = input.contributors.reduce((sum, contributor) => sum + contributor.weight, 0n);
  if (totalWeight <= 0n) {
    throw new Error('contributor allocation requires positive total weight');
  }

  const preliminary = input.contributors.map((contributor) => {
    const numerator = BigInt(tokenCount) * contributor.weight;
    return {
      ...contributor,
      base: Number(numerator / totalWeight),
      remainder: numerator % totalWeight
    };
  });
  let remaining = tokenCount - preliminary.reduce((sum, contributor) => sum + contributor.base, 0);
  const extras = new Set();
  for (const contributor of preliminary.slice().sort((left, right) => {
    if (left.remainder === right.remainder) {
      return left.contributorId.localeCompare(right.contributorId);
    }
    return left.remainder > right.remainder ? -1 : 1;
  })) {
    if (remaining <= 0) break;
    extras.add(contributor.contributorId);
    remaining -= 1;
  }

  let cursor = input.rangeStart;
  const allocations = preliminary
    .slice()
    .sort((left, right) => left.contributorId.localeCompare(right.contributorId))
    .map((contributor) => {
      const count = contributor.base + (extras.has(contributor.contributorId) ? 1 : 0);
      const rangeStart = count > 0 ? cursor : undefined;
      const rangeEndExclusive = count > 0 ? cursor + count : undefined;
      cursor += count;
      return {
        contributorId: contributor.contributorId,
        walletId: contributor.walletId,
        tokenCount: count,
        rangeStart,
        rangeEndExclusive,
        weight: contributor.weight.toString()
      };
    });

  return {
    type: 'btd_contributor_allocation',
    receiptId: input.receiptId,
    assetPackId: input.assetPackId,
    rangeStart: input.rangeStart,
    rangeEndExclusive: input.rangeEndExclusive,
    tokenCount,
    allocationMethod: 'hare_niemeyer_weighted_fit',
    allocations,
    issuedAt: input.issuedAt
  };
}

/**
 * @param {{
 *   receiptId: string,
 *   childAssetPackId: string,
 *   existingEdges?: Array<{ parentAssetPackId: string, childAssetPackId: string, status?: string }>,
 *   duplicateSourceRoots?: string[],
 *   edges: Array<{ parentAssetPackId: string, childAssetPackId?: string, edgeKind: string, confidenceBps: number, timelessnessBps: number, depth: number, evidenceRoot: string, sourceFingerprintRoot?: string, claimantId?: string, reviewerId?: string, createdAfterChildFit?: boolean, conflictDisclosure?: string[] }>,
 *   issuedAt: string
 * }} input
 */
export function buildAncestryReviewReceipt(input) {
  const minConfidenceBps = 2500;
  const duplicateSourceRoots = new Set(input.duplicateSourceRoots || []);
  const graphEdges = [...(input.existingEdges || [])];
  const seen = new Set();
  const edges = input.edges.map((edge) => {
    const normalized = {
      ...edge,
      childAssetPackId: edge.childAssetPackId || input.childAssetPackId,
      createdAfterChildFit: edge.createdAfterChildFit !== false,
      conflictDisclosure: edge.conflictDisclosure || []
    };
    const key = `${normalized.parentAssetPackId}->${normalized.childAssetPackId}:${normalized.edgeKind}`;
    let status = 'payable';
    let rejectionReason = undefined;
    let riskFlags = [];

    if (seen.has(key)) {
      status = 'rejected';
      rejectionReason = 'duplicate_edge';
      riskFlags = ['duplicate_edge'];
    } else if (normalized.childAssetPackId !== input.childAssetPackId) {
      status = 'rejected';
      rejectionReason = 'child_mismatch';
      riskFlags = ['child_mismatch'];
    } else if (normalized.parentAssetPackId === normalized.childAssetPackId) {
      status = 'rejected';
      rejectionReason = 'self_edge';
      riskFlags = ['self_edge'];
    } else if (normalized.createdAfterChildFit !== true) {
      status = 'rejected';
      rejectionReason = 'not_late_bound';
      riskFlags = ['not_late_bound'];
    } else if (normalized.sourceFingerprintRoot && duplicateSourceRoots.has(normalized.sourceFingerprintRoot)) {
      status = 'rejected';
      rejectionReason = 'duplicate_source';
      riskFlags = ['duplicate_source'];
    } else if (normalized.claimantId && normalized.claimantId === normalized.reviewerId) {
      status = 'rejected';
      rejectionReason = 'claimant_reviewer_conflict';
      riskFlags = ['claimant_reviewer_conflict'];
    } else if (hasDirectReciprocalDemoEdge(graphEdges, normalized)) {
      status = 'rejected';
      rejectionReason = 'reciprocal_loop';
      riskFlags = ['reciprocal_loop'];
    } else if (wouldCreateDemoCycle(graphEdges, normalized)) {
      status = 'rejected';
      rejectionReason = 'dependency_cycle';
      riskFlags = ['dependency_cycle'];
    } else if (normalized.confidenceBps < minConfidenceBps) {
      status = 'recorded_unpaid';
      rejectionReason = 'confidence_below_threshold';
      riskFlags = ['confidence_below_threshold'];
    } else if (normalized.edgeKind === 'citation_only') {
      status = 'recorded_unpaid';
      rejectionReason = 'citation_only';
      riskFlags = ['citation_only'];
    } else if (normalized.conflictDisclosure.length > 0) {
      status = 'recorded_unpaid';
      rejectionReason = 'conflict_disclosed';
      riskFlags = ['conflict_disclosed'];
    }
    seen.add(key);
    const routeWeight =
      status === 'payable'
        ? String((BigInt(normalized.confidenceBps) * BigInt(normalized.timelessnessBps)) / BigInt((1 + normalized.depth) ** 2))
        : '0';
    const reviewed = {
      ...normalized,
      status,
      rejectionReason,
      riskFlags,
      routeWeight,
      supplyEffect: 'none',
      mintCountDelta: 0
    };
    if (status !== 'rejected') {
      graphEdges.push(reviewed);
    }
    return reviewed;
  });
  return {
    type: 'btd_ancestry_review',
    receiptId: input.receiptId,
    childAssetPackId: input.childAssetPackId,
    minConfidenceBps,
    payableEdgeCount: edges.filter((edge) => edge.status === 'payable').length,
    recordedUnpaidEdgeCount: edges.filter((edge) => edge.status === 'recorded_unpaid').length,
    rejectedEdgeCount: edges.filter((edge) => edge.status === 'rejected').length,
    supplyEffect: 'none',
    mintCountDelta: 0,
    edges,
    issuedAt: input.issuedAt
  };
}

function hasDirectReciprocalDemoEdge(graphEdges, edge) {
  return graphEdges.some(
    (known) =>
      known.status !== 'rejected' &&
      known.parentAssetPackId === edge.childAssetPackId &&
      known.childAssetPackId === edge.parentAssetPackId
  );
}

function wouldCreateDemoCycle(graphEdges, edge) {
  const adjacency = new Map();
  for (const known of graphEdges) {
    if (known.status === 'rejected') continue;
    const children = adjacency.get(known.parentAssetPackId) || [];
    children.push(known.childAssetPackId);
    adjacency.set(known.parentAssetPackId, children);
  }
  const stack = [edge.childAssetPackId];
  const visited = new Set();
  while (stack.length) {
    const current = stack.pop();
    if (!current || visited.has(current)) continue;
    if (current === edge.parentAssetPackId) return true;
    visited.add(current);
    stack.push(...(adjacency.get(current) || []));
  }
  return false;
}

/**
 * @param {{
 *   receiptId: string,
 *   paymentId: string,
 *   assetPackId: string,
 *   grossSats: bigint,
 *   directWalletId: string,
 *   ancestorWalletId: string,
 *   treasuryWalletId: string,
 *   disputeHoldbackWalletId?: string,
 *   disputeHoldbackBps?: bigint,
 *   exchangeSequence: bigint,
 *   issuedAt: string
 * }} input
 */
export function buildLicensedReadRevenueRouteReceipt(input) {
  const holdbackBps = input.disputeHoldbackBps && input.disputeHoldbackBps > 0n
    ? input.disputeHoldbackBps
    : 0n;
  const directBps = holdbackBps > 0n ? 7000n : 8000n;
  const ancestorBps = holdbackBps > 0n ? 1000n : 1200n;
  const treasuryBps = 10000n - directBps - ancestorBps - holdbackBps;
  const directSats = (input.grossSats * directBps) / 10000n;
  const ancestorSats = (input.grossSats * ancestorBps) / 10000n;
  const disputeHoldbackSats =
    holdbackBps > 0n
      ? (input.grossSats * holdbackBps) / 10000n
      : 0n;
  const treasurySats = input.grossSats - directSats - ancestorSats - disputeHoldbackSats;
  if (treasuryBps < 0n || treasurySats < 0n) {
    throw new Error('licensed-read revenue split is overallocated');
  }
  if (disputeHoldbackSats > 0n && !input.disputeHoldbackWalletId) {
    throw new Error('dispute holdback wallet is required');
  }
  const pendingRoutes =
    disputeHoldbackSats > 0n
      ? [
          {
            category: 'dispute_holdback',
            walletId: input.disputeHoldbackWalletId,
            sats: disputeHoldbackSats.toString(),
            reason: 'dispute_holdback_pending'
          }
        ]
      : [];

  return {
    type: 'btd_licensed_read_revenue_route',
    receiptId: input.receiptId,
    paymentId: input.paymentId,
    assetPackId: input.assetPackId,
    priceAsset: BITCODE_FEE_ASSET,
    grossSats: input.grossSats.toString(),
    directSats: directSats.toString(),
    ancestorSats: ancestorSats.toString(),
    treasurySats: treasurySats.toString(),
    disputeHoldbackSats: disputeHoldbackSats.toString(),
    directRoutes: [{ walletId: input.directWalletId, sats: directSats.toString(), weight: '1' }],
    ancestorRoutes: [{ walletId: input.ancestorWalletId, sats: ancestorSats.toString(), weight: '1' }],
    treasuryRoutes: [{ walletId: input.treasuryWalletId, sats: treasurySats.toString(), weight: '1' }],
    disputeHoldbackWalletId: input.disputeHoldbackWalletId,
    pendingRoutes,
    failedRoutes: [],
    routeState: pendingRoutes.length ? 'pending' : 'settled',
    treasuryWalletId: input.treasuryWalletId,
    exchangeSequence: input.exchangeSequence.toString(),
    issuedAt: input.issuedAt
  };
}

/**
 * @param {{
 *   receiptId: string,
 *   payerWalletId: string,
 *   walletSessionId: string,
 *   network: 'regtest' | 'signet' | 'testnet' | 'mainnet',
 *   satsPaid: bigint,
 *   terminalJournalRoot: string,
 *   exchangeSequence: bigint,
 *   issuedAt: string
 * }} input
 */
export function buildPreparedBtcFeeReceipt(input) {
  if (input.network !== 'regtest' && input.network !== 'signet') {
    throw new Error('V27 demonstration fee proof uses regtest or signet');
  }
  if (!input.walletAuthorizationProof) {
    throw new Error('wallet authorization proof is required for BTC fee receipts');
  }
  if (input.satsPaid <= 0n) {
    throw new Error('satsPaid must be positive');
  }

  return {
    type: 'btc_fee_transaction',
    receiptId: input.receiptId,
    feePurpose: 'asset_pack_anchor',
    payerWalletId: input.payerWalletId,
    walletSessionId: input.walletSessionId,
    network: input.network,
    walletAuthorizationProof: input.walletAuthorizationProof,
    txid: null,
    psbt: 'demo-psbt',
    satsPaid: input.satsPaid.toString(),
    exchangeSequence: input.exchangeSequence.toString(),
    terminalJournalRoot: input.terminalJournalRoot,
    finalityState: 'prepared',
    confirmations: 0,
    feeAsset: BITCODE_FEE_ASSET,
    serverCustody: false,
    issuedAt: input.issuedAt
  };
}

/**
 * @param {ReturnType<typeof buildPreparedBtcFeeReceipt>} receipt
 * @param {{ txid: string, confirmations: number }} confirmation
 */
export function confirmBtcFeeReceipt(receipt, confirmation) {
  if (!confirmation.txid) {
    throw new Error('confirmed BTC fee receipt requires txid');
  }
  if (confirmation.confirmations <= 0) {
    throw new Error('confirmed BTC fee receipt requires confirmations');
  }

  return {
    ...receipt,
    txid: confirmation.txid,
    psbt: null,
    finalityState: 'confirmed',
    confirmations: confirmation.confirmations
  };
}

/**
 * @param {{
 *   receiptId: string,
 *   assetPackId: string,
 *   rangeStart: number,
 *   rangeEndExclusive: number,
 *   commitmentRoot: string,
 *   sourceManifestRoot: string,
 *   proofRoot: string,
 *   accessPolicyHash: string,
 *   issuedAt: string
 * }} input
 */
export function buildBitcoinAnchorReceipt(input) {
  if (input.rangeEndExclusive <= input.rangeStart) {
    throw new Error('anchor range must be non-empty');
  }

  return {
    type: 'btd_asset_pack_ledger_anchor',
    receiptId: input.receiptId,
    assetPackId: input.assetPackId,
    chain: 'bitcoin',
    network: BITCODE_PUBLIC_BITCOIN_PROOF_NETWORK,
    commitmentMethod: 'taproot',
    commitmentRoot: input.commitmentRoot,
    sourceManifestRoot: input.sourceManifestRoot,
    proofRoot: input.proofRoot,
    accessPolicyHash: input.accessPolicyHash,
    btdRangeStart: input.rangeStart,
    btdRangeEndExclusive: input.rangeEndExclusive,
    finalityState: 'prepared',
    confirmations: 0,
    issuedAt: input.issuedAt
  };
}

/**
 * @param {{
 *   receiptId: string,
 *   orderId: string,
 *   assetPackId: string,
 *   rangeStart: number,
 *   rangeEndExclusive: number,
 *   fromWalletId: string,
 *   toWalletId: string,
 *   priceSats: bigint,
 *   accessPolicyHash: string,
 *   btcFeeReceiptId: string,
 *   ledgerAnchorId: string,
 *   exchangeSequence: bigint,
 *   issuedAt: string
 * }} input
 */
export function buildRightsTransferReceipt(input) {
  if (input.rangeEndExclusive <= input.rangeStart) {
    throw new Error('rights-transfer range must be non-empty');
  }
  if (!input.btcFeeReceiptId || !input.ledgerAnchorId || !input.accessPolicyHash) {
    throw new Error('rights transfer requires fee, ledger anchor, and policy evidence');
  }

  return {
    type: 'btd_asset_pack_rights_transfer',
    receiptId: input.receiptId,
    orderId: input.orderId,
    assetPackId: input.assetPackId,
    rangeStart: input.rangeStart,
    rangeEndExclusive: input.rangeEndExclusive,
    fromWalletId: input.fromWalletId,
    toWalletId: input.toWalletId,
    priceAsset: BITCODE_FEE_ASSET,
    priceSats: input.priceSats.toString(),
    accessPolicyHash: input.accessPolicyHash,
    btcFeeReceiptId: input.btcFeeReceiptId,
    ledgerAnchorId: input.ledgerAnchorId,
    exchangeSequence: input.exchangeSequence.toString(),
    issuedAt: input.issuedAt
  };
}

/**
 * @param {{
 *   receiptId: string,
 *   entries: Array<{ transactionKind: string }>,
 *   issuedAt: string
 * }} input
 */
export function buildTerminalJournalCoverageReceipt(input) {
  const observedTransactionKinds = Array.from(
    new Set(input.entries.map((entry) => entry.transactionKind))
  ).sort();
  const observed = new Set(observedTransactionKinds);
  const missingTransactionKinds = REQUIRED_TERMINAL_TRANSACTION_KINDS.filter(
    (kind) => !observed.has(kind)
  );

  return {
    type: 'btd_terminal_journal_coverage',
    receiptId: input.receiptId,
    requiredTransactionKinds: REQUIRED_TERMINAL_TRANSACTION_KINDS,
    observedTransactionKinds,
    missingTransactionKinds,
    blocking: missingTransactionKinds.length > 0,
    issuedAt: input.issuedAt
  };
}

/**
 * @param {{
 *   receiptId: string,
 *   repairs: Array<{ repairId: string, blocking: boolean }>,
 *   metaphysicalFacts?: Array<{ factId: string, canonicalRoot: string, private: boolean }>,
 *   issuedAt: string
 * }} input
 */
export function buildReconciliationReceipt(input) {
  const metaphysicalFacts = input.metaphysicalFacts || [];
  if (metaphysicalFacts.some((fact) => !fact.private || !fact.canonicalRoot)) {
    throw new Error('metaphysical canonical facts require private hash-bound roots');
  }

  return {
    type: 'btd_ledger_database_reconciliation',
    receiptId: input.receiptId,
    repairs: input.repairs,
    metaphysicalFacts,
    blocking: input.repairs.some((repair) => repair.blocking),
    issuedAt: input.issuedAt
  };
}

/**
 * @param {{
 *   receiptId: string,
 *   upgradeId: string,
 *   fromVersion: string,
 *   toVersion: string,
 *   network: 'regtest' | 'signet' | 'testnet' | 'mainnet',
 *   migrationRoot: string,
 *   preStateRoot: string,
 *   approvalReceiptRoot: string,
 *   rollbackPlanRoot: string,
 *   issuedAt: string
 * }} input
 */
export function buildProtocolUpgradeReceipt(input) {
  return {
    type: 'btd_protocol_upgrade',
    receiptId: input.receiptId,
    upgradeId: input.upgradeId,
    fromVersion: input.fromVersion,
    toVersion: input.toVersion,
    network: input.network,
    migrationRoot: input.migrationRoot,
    preStateRoot: input.preStateRoot,
    postStateRoot: null,
    approvalReceiptRoot: input.approvalReceiptRoot,
    rollbackPlanRoot: input.rollbackPlanRoot,
    upgradeState: 'planned',
    issuedAt: input.issuedAt
  };
}

/**
 * @param {{
 *   receiptId: string,
 *   lane: 'local' | 'regtest' | 'signet' | 'testnet' | 'mainnet-ready' | 'mainnet-value-bearing',
 *   network: 'regtest' | 'signet' | 'testnet' | 'mainnet',
 *   presentEnvironmentKeys: string[],
 *   operationalApprovalRoot?: string,
 *   issuedAt: string
 * }} input
 */
export function buildDeploymentReadinessReceipt(input) {
  if (input.lane === 'mainnet-value-bearing' && !input.operationalApprovalRoot) {
    throw new Error('value-bearing mainnet requires operational approval');
  }
  const present = new Set(input.presentEnvironmentKeys);
  const missingEnvironmentKeys = REQUIRED_DEPLOYMENT_ENVIRONMENT_KEYS.filter(
    (key) => !present.has(key)
  );

  return {
    type: 'btd_deployment_readiness',
    receiptId: input.receiptId,
    lane: input.lane,
    network: input.network,
    requiredEnvironmentKeys: REQUIRED_DEPLOYMENT_ENVIRONMENT_KEYS,
    missingEnvironmentKeys,
    blocking: missingEnvironmentKeys.length > 0,
    issuedAt: input.issuedAt
  };
}

/**
 * @param {{
 *   receiptId: string,
 *   event: string,
 *   subjectId: string,
 *   issuedAt: string
 * }} input
 */
export function buildCryptoTelemetryEventReceipt(input) {
  const critical = ['ledger_provider.disagreement', 'exchange_journal.drift', 'upgrade_migration.failed'];
  const warning = ['wallet.signing_failed', 'btc_fee.confirmation_lag', 'database_projection.lag', 'settlement_route.failed'];
  return {
    type: 'btd_crypto_telemetry_event',
    receiptId: input.receiptId,
    event: input.event,
    severity: critical.includes(input.event) ? 'critical' : warning.includes(input.event) ? 'warning' : 'info',
    subjectId: input.subjectId,
    issuedAt: input.issuedAt
  };
}
