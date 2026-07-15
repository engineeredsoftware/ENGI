/*
 * Lightweight unit tests for `$BTD` measurement and BTC fee-basis logic.
 * **NOTE** – These tests use Jest’s fake timers and a stub Supabase client so
 * they never touch a real database.  They are intended as documentation as
 * much as validation – CI may stub `@bitcode/supabase` with a local fake.
 */

import {
  BtdFungibleMutationRejectedError,
  BTD_MAX_MINTABLE_SUPPLY,
  BITCODE_FEE_ASSET,
  applyAssetPackSettlementUnlockToPreview,
  assertBtdAccessPolicyTemplateCoverage,
  assertBtdMintableSupplyLimit,
  buildAssetPackSettlementUnlock,
  buildBtdOrganizationPolicyAuthority,
  buildBtdWalletBtdSupportProjection,
  buildBtdReadAccessProjectionFromRegistryRows,
  calculateLlmBtcFeeEstimate,
  calculateMeasuredBtdFromTokens,
  evaluateBtdOrganizationInterfaceAuthority,
  evaluateBtdReadAccess,
  listBtdAccessPolicyTemplates,
  reconcileLedgerDatabaseProjection,
  summarizeBtdOrganizationRegistryAuthority,
} from '../src';

describe('calculateLlmBtcFeeEstimate', () => {
  const table: Array<[
    model: string,
    input: number,
    output: number,
    expectedUsd: number,
  ]> = [
    ['gemini-2.5-flash', 1000, 0, 0.00035],
    ['gemini-2.5-flash', 0, 1000, 0.0014],
    ['sonnet-4', 1_000_000, 0, 3],
  ];

  it.each(table)('%s in=%i out=%i', (model, input, output, expected) => {
    const estimate = calculateLlmBtcFeeEstimate(model, { inputTokens: input, outputTokens: output });
    expect(estimate.feeAsset).toBe(BITCODE_FEE_ASSET);
    expect(estimate.btcFeesPaid).toBeNull();
    expect(estimate.btcFeeUsdEquivalent).toBe(expected);
  });

  it('throws on unknown model', () => {
    expect(() =>
      calculateLlmBtcFeeEstimate('unknown-model', { inputTokens: 10, outputTokens: 10 }),
    ).toThrow();
  });
});

describe('AssetPack settlement unlock', () => {
  const completeReadback = {
    semanticMeasurement: true,
    measureMintReceipt: true,
    assetPackRange: true,
    btdCell: true,
    ownershipEvent: true,
    readLicense: true,
    mintReceipt: true,
    btcFeeTransaction: true,
    ledgerAnchor: true,
    terminalJournal: true,
    cryptoTelemetry: true,
  };

  it('unlocks protected source only after settlement, readback, license, and delivery agree', () => {
    const unlock = buildAssetPackSettlementUnlock({
      ledgerSettlement: {
        status: 'settled',
        settlementAdmissible: true,
        assetPackId: 'asset-pack-1',
        ledgerAnchorId: 'ledger-anchor-1',
        btcFeeReceiptId: 'btc-fee-1',
        ownershipEventId: 'ownership-1',
        readLicenseId: 'license-1',
        depositorWalletId: 'wallet-depositor',
        readerWalletId: 'wallet-reader',
        readback: completeReadback,
      },
      pullRequestTarget: 'https://github.com/engineeredsoftware/ENGI/pull/42',
    });

    expect(unlock).toMatchObject({
      schema: 'bitcode.asset-pack.settlement-unlock',
      state: 'licensed_read',
      sourceAvailable: true,
      settlementAdmissible: true,
      deliveryAvailable: true,
      assetPackId: 'asset-pack-1',
      readLicenseId: 'license-1',
      btcFeeReceiptId: 'btc-fee-1',
      missingReadbackKeys: [],
    });

    const preview = applyAssetPackSettlementUnlockToPreview(
      {
        accessPolicy: { readRightState: 'pending_settlement' },
        unlock: { state: 'pending_settlement', sourceAvailable: false },
        delivery: { pullRequestTarget: null, availableAfterSettlement: true },
      },
      unlock,
    );

    expect(preview).toMatchObject({
      accessPolicy: { readRightState: 'licensed_read' },
      unlock: {
        state: 'licensed_read',
        sourceAvailable: true,
      },
      delivery: {
        pullRequestTarget: 'https://github.com/engineeredsoftware/ENGI/pull/42',
      },
      settlementUnlock: unlock,
    });
  });

  it('keeps protected source withheld when any settlement readback key is missing', () => {
    const unlock = buildAssetPackSettlementUnlock({
      ledgerSettlement: {
        status: 'settled',
        settlementAdmissible: true,
        assetPackId: 'asset-pack-1',
        readLicenseId: 'license-1',
        readback: {
          ...completeReadback,
          readLicense: false,
        },
      },
      pullRequestTarget: 'https://github.com/engineeredsoftware/ENGI/pull/42',
    });

    expect(unlock).toMatchObject({
      state: 'pending_settlement',
      sourceAvailable: false,
      settlementAdmissible: false,
      missingReadbackKeys: ['readLicense'],
    });
    expect(unlock.reason).toContain('readLicense');
  });
});

describe('Auxillaries Wallet/BTD support projection', () => {
  it('derives no-custody signer, range, read-right, treasury, and settlement posture', () => {
    const projection = buildBtdWalletBtdSupportProjection({
      wallet: {
        address: 'tb1pwallet',
        provider: 'leather',
        verificationState: 'verified',
        connected: true,
        valid: true,
        network: 'testnet',
      },
      aggregateBtd: 12,
      btcFeeBalance: 0.025,
      recentAssetPacks: [
        {
          assetPackId: 'asset-pack-owner',
          rangeStart: 100,
          rangeEndExclusive: 112,
          readRightState: 'owner_read',
          sourceSafePreviewRoot: 'preview-root-owner',
        },
        {
          assetPackId: 'asset-pack-license',
          rangeStart: 200,
          rangeEndExclusive: 205,
          readRightState: 'licensed_read',
        },
      ],
    });

    expect(projection.walletCapability).toMatchObject({
      hasBinding: true,
      noCustody: true,
      serverCustody: false,
      capabilities: ['message_sign', 'psbt_sign', 'rights_transfer'],
    });
    expect(projection.signerPosture).toMatchObject({
      ready: true,
      canSignPsbt: true,
      canSignRightsTransfer: true,
      serverCustody: false,
    });
    expect(projection.networkReadiness).toMatchObject({
      state: 'ready',
      network: 'testnet',
      blocker: null,
    });
    expect(projection.btdReadRightSummary).toMatchObject({
      aggregateBtd: 12,
      assetPackCount: 2,
      rangeCount: 2,
      totalRangeCells: 17,
      ownerReadCount: 1,
      licensedReadCount: 1,
      protectedSourceVisible: false,
      sourceSafePreviewRoots: ['preview-root-owner'],
    });
    expect(projection.treasurySummary).toMatchObject({
      feeAsset: 'BTC',
      noCustody: true,
      treasuryScope: 'account',
      organizationTreasurySeparated: true,
      exchangeMarketState: 'not_exchange_market_state',
    });
    expect(projection.settlementReadiness).toBe('ready');
    expect(projection.settlementBlockers).toEqual([]);
    expect(projection.btdSupportRoot).toMatch(/^[0-9a-f]{64}$/);
  });

  it('blocks settlement when wallet identity is missing', () => {
    const projection = buildBtdWalletBtdSupportProjection({
      wallet: null,
      aggregateBtd: 0,
      recentAssetPacks: [],
    });

    expect(projection.walletCapability.hasBinding).toBe(false);
    expect(projection.signerPosture.requiredAction).toBe('connect_wallet');
    expect(projection.networkReadiness).toMatchObject({
      state: 'blocked',
      blocker: 'wallet.network_missing',
    });
    expect(projection.settlementReadiness).toBe('blocked');
    expect(projection.settlementBlockers).toEqual(
      expect.arrayContaining(['wallet.connect_wallet', 'wallet.network_missing']),
    );
  });
});

describe('calculateMeasuredBtdFromTokens', () => {
  it('measures content amount without implying spend', () => {
    expect(calculateMeasuredBtdFromTokens({ inputTokens: 1200, outputTokens: 50 })).toBe(2);
  });
});

describe('BTD mintable supply ceiling', () => {
  it('records the V27+ fixed measured BTD mint ceiling', () => {
    expect(BTD_MAX_MINTABLE_SUPPLY).toBe(21_000_000);
  });

  it('fails closed when a proposed mint would exceed the ceiling', () => {
    expect(assertBtdMintableSupplyLimit(20_999_999, 1)).toBe(21_000_000);
    expect(() => assertBtdMintableSupplyLimit(21_000_000, 1)).toThrow(/21,000,000/);
  });
});

describe('BtdFungibleMutationRejectedError', () => {
  it('makes fungible BTD mutation attempts fail closed', () => {
    const err = new BtdFungibleMutationRejectedError('nope');
    expect(err.code).toBe('BTD_IS_NON_FUNGIBLE');
  });
});

describe('BTD access policy templates', () => {
  it('covers owner-read, licensed-read, policy, dispute, and takedown posture', () => {
    const templates = assertBtdAccessPolicyTemplateCoverage(listBtdAccessPolicyTemplates());

    expect(templates.map((template) => template.kind)).toEqual(
      expect.arrayContaining([
        'owner_read',
        'licensed_read',
        'derivative_use',
        'redistribution',
        'confidentiality',
        'dispute',
        'takedown',
      ]),
    );
    expect(templates.flatMap((template) => template.prohibitedClaims)).toEqual(
      expect.arrayContaining([
        'price appreciation',
        'dividend',
        'copyright transfer',
        'marketplace royalty',
      ]),
    );
  });
});

describe('ledger/database reconciliation repair', () => {
  it('classifies drift, emits repair actions, and preserves proof roots', () => {
    const report = reconcileLedgerDatabaseProjection({
      reconciliationId: 'reconciliation-gate6',
      ledgerFacts: [
        {
          factId: 'anchor-1',
          ledgerRoot: 'ledger-root-1',
          finalityState: 'confirmed',
        },
      ],
      databaseFacts: [
        {
          factId: 'anchor-1',
          projectedLedgerRoot: 'stale-root',
          projectedFinalityState: 'broadcast',
        },
        {
          factId: 'orphan-projection-1',
          projectedLedgerRoot: 'orphan-root',
          projectedFinalityState: 'confirmed',
        },
      ],
      settlementConservationChecks: [
        {
          checkId: 'settlement-check-1',
          expectedDebitSats: 1000,
          observedDebitSats: 1000,
          expectedCreditSats: 1000,
          observedCreditSats: 900,
          feeQuoteRoot: 'fee-quote-root',
          paymentReceiptRoot: 'payment-receipt-root',
        },
      ],
      metaphysicalFacts: [
        {
          factId: 'encrypted-source-pointer',
          factKind: 'encrypted_storage_pointer',
          canonicalRoot: 'encrypted-storage-root',
          private: true,
        },
      ],
      issuedAt: '2026-05-20T12:00:00.000Z',
    });

    expect(report.state).toBe('blocked');
    expect(report.blocking).toBe(true);
    expect(report.driftKindCounts).toMatchObject({
      ledger_root_mismatch: 1,
      ledger_finality_mismatch: 1,
      database_orphan_projection: 1,
      settlement_conservation_drift: 1,
    });
    expect(report.repairs.map((repair) => repair.repairActionKind)).toEqual(
      expect.arrayContaining([
        'project_ledger_fact',
        'update_finality_state',
        'quarantine_database_projection',
        'pause_settlement_unlock',
      ]),
    );
    expect(report.repairActions).toHaveLength(report.repairs.length);
    expect(report.repairActions.every((action) => action.proofRoot.startsWith('btd-proof-root:'))).toBe(true);
    expect(report.proofRoots.repairPlanRoot).toMatch(/^btd-proof-root:repair-plan:/);
    expect(report.settlementConservation.status).toBe('drifted');
  });
});

describe('registry-derived read access projection', () => {
  it('maps range, ownership, and read-license rows into owner-read decisions', () => {
    const projection = buildBtdReadAccessProjectionFromRegistryRows({
      assetPackId: 'asset-pack-1',
      range: {
        asset_pack_id: 'asset-pack-1',
        range_start: 10,
        range_end_exclusive: 15,
        token_count: 5,
        access_policy_id: 'policy-1',
        access_policy_hash: 'policy-hash',
      },
      ownershipRows: [
        {
          to_wallet_id: 'wallet-owner',
          asset_pack_id: 'asset-pack-1',
          range_start: 10,
          range_end_exclusive: 15,
          access_policy_hash: 'policy-hash',
        },
      ],
    });

    const decision = evaluateBtdReadAccess({
      walletId: 'wallet-owner',
      assetPackId: 'asset-pack-1',
      accessPolicy: projection.accessPolicy,
      ownershipClaims: projection.ownershipClaims,
      licenses: projection.licenses,
      at: '2026-05-19T00:00:00.000Z',
    });

    expect(projection.range.tokenCount).toBe(5);
    expect(decision.decision).toBe('owner_read');
  });

  it('maps registry read-license rows into licensed-read decisions', () => {
    const projection = buildBtdReadAccessProjectionFromRegistryRows({
      assetPackId: 'asset-pack-1',
      range: {
        asset_pack_id: 'asset-pack-1',
        range_start: 10,
        range_end_exclusive: 15,
        token_count: 5,
        access_policy_id: 'policy-1',
        access_policy_hash: 'policy-hash',
      },
      licenseRows: [
        {
          license_id: 'license-1',
          wallet_id: 'wallet-reader',
          asset_pack_id: 'asset-pack-1',
          access_policy_hash: 'policy-hash',
          valid_from: '2026-05-01T00:00:00.000Z',
          expires_at: '2026-06-01T00:00:00.000Z',
        },
      ],
    });

    const decision = evaluateBtdReadAccess({
      walletId: 'wallet-reader',
      assetPackId: 'asset-pack-1',
      accessPolicy: projection.accessPolicy,
      ownershipClaims: projection.ownershipClaims,
      licenses: projection.licenses,
      at: '2026-05-19T00:00:00.000Z',
    });

    expect(decision.decision).toBe('licensed_read');
  });

  it('keeps denied read decisions explicit for policy mismatch and revoked licenses', () => {
    const projection = buildBtdReadAccessProjectionFromRegistryRows({
      assetPackId: 'asset-pack-1',
      range: {
        asset_pack_id: 'asset-pack-1',
        range_start: 10,
        range_end_exclusive: 15,
        token_count: 5,
        access_policy_id: 'policy-1',
        access_policy_hash: 'policy-hash',
      },
      ownershipRows: [
        {
          to_wallet_id: 'wallet-reader',
          asset_pack_id: 'asset-pack-1',
          range_start: 10,
          range_end_exclusive: 15,
          access_policy_hash: 'stale-policy-hash',
        },
      ],
      licenseRows: [
        {
          license_id: 'license-1',
          wallet_id: 'wallet-reader',
          asset_pack_id: 'asset-pack-1',
          access_policy_hash: 'policy-hash',
          valid_from: '2026-05-01T00:00:00.000Z',
          revoked_at: '2026-05-10T00:00:00.000Z',
        },
      ],
    });

    expect(evaluateBtdReadAccess({
      walletId: 'wallet-reader',
      assetPackId: 'asset-pack-1',
      accessPolicy: projection.accessPolicy,
      ownershipClaims: [],
      licenses: projection.licenses,
      at: '2026-05-19T00:00:00.000Z',
    })).toMatchObject({
      decision: 'denied',
      reason: 'license_revoked',
    });

    expect(evaluateBtdReadAccess({
      walletId: 'wallet-reader',
      assetPackId: 'asset-pack-1',
      accessPolicy: projection.accessPolicy,
      ownershipClaims: projection.ownershipClaims,
      licenses: [],
      at: '2026-05-19T00:00:00.000Z',
    })).toMatchObject({
      decision: 'denied',
      reason: 'policy_mismatch',
    });
  });
});

describe('organization interface authority', () => {
  it('summarizes organization holdings and read-license usage from registry rows', () => {
    const summary = summarizeBtdOrganizationRegistryAuthority({
      organizationId: 'org-1',
      walletIds: ['wallet-owner', 'wallet-reader', 'wallet-reader'],
      ownershipRows: [
        {
          to_wallet_id: 'wallet-owner',
          asset_pack_id: 'asset-pack-1',
          range_start: 0,
          range_end_exclusive: 7,
        },
      ],
      readLicenseRows: [
        {
          license_id: 'license-active',
          wallet_id: 'wallet-reader',
          asset_pack_id: 'asset-pack-2',
          valid_from: '2026-05-01T00:00:00.000Z',
        },
        {
          license_id: 'license-expired',
          wallet_id: 'wallet-reader',
          asset_pack_id: 'asset-pack-3',
          valid_from: '2026-04-01T00:00:00.000Z',
          expires_at: '2026-05-02T00:00:00.000Z',
        },
        {
          license_id: 'license-revoked',
          wallet_id: 'wallet-reader',
          asset_pack_id: 'asset-pack-4',
          valid_from: '2026-04-01T00:00:00.000Z',
          revoked_at: '2026-05-03T00:00:00.000Z',
        },
      ],
      at: '2026-05-19T00:00:00.000Z',
    });

    expect(summary).toMatchObject({
      organizationId: 'org-1',
      source: 'btd_registry',
      walletIds: ['wallet-owner', 'wallet-reader'],
      ownedCellCount: 7,
      ownedAssetPackIds: ['asset-pack-1'],
      readLicenseCount: 3,
      activeReadLicenseCount: 1,
      expiredReadLicenseCount: 1,
      revokedReadLicenseCount: 1,
      licensedAssetPackIds: ['asset-pack-2'],
    });
    expect(summary.authorityRoot).toMatch(/^btd-proof-root:organization-registry-authority:/);
  });

  it('allows paid AssetPack delivery only with role, wallet, settlement, confirmation, and registry read access', () => {
    const decision = evaluateBtdOrganizationInterfaceAuthority({
      actorId: 'user-1',
      organizationId: 'org-1',
      organizationRole: 'member',
      organizationPermissionGrants: ['asset_pack:deliver'],
      interfaceSurface: 'chatgpt_app',
      action: 'deliver_asset_pack',
      walletId: 'wallet-reader',
      settlementState: 'settled',
      confirmed: true,
      readAccessDecision: {
        decision: 'licensed_read',
        accessPolicyHash: 'policy-hash',
        reason: 'wallet_has_valid_policy_matching_license',
      },
      targetAnchor: 'github:engineeredsoftware/ENGI/pull/42',
      at: '2026-05-19T00:00:00.000Z',
    });

    expect(decision).toMatchObject({
      kind: 'btd_organization_interface_authority_decision',
      decision: 'allowed',
      interfaceSurface: 'chatgpt_app',
      action: 'deliver_asset_pack',
      sourceVisibility: 'protected_source_allowed',
      satisfied: {
        role: true,
        permissionGrant: true,
        walletBinding: true,
        registryReadAccess: true,
        settlement: true,
        explicitConfirmation: true,
        interfaceAction: true,
      },
    });
    expect(decision.reasons).toEqual(
      expect.arrayContaining([
        'role_authorized',
        'explicit_permission_grant_authorized',
        'licensed_read_access_authorized',
      ]),
    );
    expect(decision.proofRoots.authorityRoot).toMatch(/^btd-proof-root:organization-interface-authority:/);
  });

  it('fails closed for unpaid protected-source unlock and unsupported ChatGPT administration', () => {
    const unpaidUnlock = evaluateBtdOrganizationInterfaceAuthority({
      actorId: 'user-1',
      organizationId: 'org-1',
      organizationRole: 'admin',
      interfaceSurface: 'terminal',
      action: 'unlock_asset_pack_source',
      walletId: 'wallet-reader',
      settlementState: 'pending',
      readAccessDecision: {
        decision: 'owner_read',
        accessPolicyHash: 'policy-hash',
        reason: 'wallet_owns_policy_matching_range',
      },
      at: '2026-05-19T00:00:00.000Z',
    });
    const chatGptAdmin = evaluateBtdOrganizationInterfaceAuthority({
      actorId: 'user-1',
      organizationId: 'org-1',
      organizationRole: 'owner',
      interfaceSurface: 'chatgpt_app',
      action: 'administer_organization',
      confirmed: true,
      at: '2026-05-19T00:00:00.000Z',
    });

    expect(unpaidUnlock).toMatchObject({
      decision: 'denied',
      reason: 'settlement_required',
      sourceVisibility: 'blocked',
    });
    expect(chatGptAdmin).toMatchObject({
      decision: 'denied',
      reason: 'interface_action_not_authorized',
      sourceVisibility: 'source_safe_preview',
    });
  });

  it('allows settlement-adjacent organization policy authority only when role, grant, wallet, policy, and multi-sig all admit it', () => {
    const authority = buildBtdOrganizationPolicyAuthority({
      actorId: 'user-1',
      organizationId: 'org-1',
      teamId: 'team-core',
      memberId: 'member-operator',
      organizationRole: 'admin',
      organizationPermissionGrants: ['settlement:pay_btc_fee'],
      interfaceSurface: 'terminal',
      action: 'pay_btc_fee',
      walletId: 'wallet-reader',
      settlementState: 'not_required',
      confirmed: true,
      policyId: 'policy-1',
      policyHash: 'policy-hash-1',
      accountAdmitted: true,
      interfaceAdmitted: true,
      multiSig: {
        required: true,
        requiredSignatures: 2,
        presentSignatures: 2,
        approverIds: ['member-operator', 'member-reviewer'],
        policyRoot: 'multisig-root-1',
      },
      recoveryRoute: '/packs?auxillary-open-to=profile',
      at: '2026-05-21T00:00:00.000Z',
    });

    expect(authority).toMatchObject({
      kind: 'btd_organization_policy_authority',
      actorId: 'user-1',
      organizationId: 'org-1',
      teamId: 'team-core',
      memberId: 'member-operator',
      role: 'admin',
      explicitGrantSet: ['settlement:pay_btc_fee'],
      walletBindingRequired: true,
      walletBindingState: 'bound',
      policy: {
        policyId: 'policy-1',
        policyHash: 'policy-hash-1',
        action: 'pay_btc_fee',
        interfaceSurface: 'terminal',
      },
      multiSigPosture: {
        state: 'ready',
        required: true,
        requiredSignatures: 2,
        presentSignatures: 2,
        requiredAction: 'none',
      },
      policyDecision: 'allowed',
      denialReason: null,
      denialReasons: [],
      sourceVisibility: 'source_safe_preview',
    });
    expect(authority.actionDecision?.decision).toBe('allowed');
    expect(authority.authorityRoot).toMatch(/^btd-proof-root:organization-policy-authority:/);
  });

  it('keeps protected-source organization policy authority failed closed until every authority input admits it', () => {
    const authority = buildBtdOrganizationPolicyAuthority({
      actorId: 'user-1',
      organizationId: 'org-1',
      teamId: 'team-core',
      memberId: 'member-operator',
      organizationRole: 'member',
      organizationPermissionGrants: [],
      interfaceSurface: 'terminal',
      action: 'deliver_asset_pack',
      walletId: null,
      settlementState: 'pending',
      confirmed: false,
      readAccessDecision: {
        decision: 'denied',
        accessPolicyHash: 'policy-hash',
        reason: 'no_owner_or_valid_license',
      },
      policyId: null,
      policyHash: null,
      accountAdmitted: true,
      interfaceAdmitted: false,
      multiSig: {
        required: true,
        requiredSignatures: 2,
        presentSignatures: 1,
        approverIds: ['member-operator'],
      },
      at: '2026-05-21T00:00:00.000Z',
    });

    expect(authority).toMatchObject({
      policyDecision: 'denied',
      denialReason: 'explicit_permission_grant_required',
      protectedSourceAction: true,
      settlementAdjacentAction: true,
      walletBindingState: 'missing',
      sourceVisibility: 'blocked',
      multiSigPosture: {
        state: 'approval_required',
        requiredAction: 'collect_signatures',
      },
    });
    expect(authority.denialReasons).toEqual(
      expect.arrayContaining([
        'explicit_permission_grant_required',
        'wallet_binding_missing',
        'policy_missing',
        'interface_not_admitted',
        'multisig_approval_required',
        'registry_read_access_denied',
        'settlement_required',
        'explicit_confirmation_required',
      ]),
    );
    expect(authority.actionDecision?.decision).toBe('denied');
  });

  it('authorizes deposit admission only with deposit role grant, wallet binding, confirmation, and policy root', () => {
    const authority = buildBtdOrganizationPolicyAuthority({
      actorId: 'user-1',
      organizationId: 'org-1',
      teamId: 'team-core',
      memberId: 'member-depositor',
      organizationRole: 'admin',
      organizationPermissionGrants: ['deposit:submit'],
      interfaceSurface: 'terminal',
      action: 'submit_deposit',
      walletId: 'wallet-depositor',
      confirmed: true,
      policyId: 'deposit-policy-1',
      policyHash: 'deposit-policy-hash-1',
      accountAdmitted: true,
      interfaceAdmitted: true,
      at: '2026-05-29T00:00:00.000Z',
    });

    expect(authority).toMatchObject({
      policyDecision: 'allowed',
      depositAdmissionAction: true,
      walletBindingState: 'bound',
      sourceVisibility: 'source_safe_preview',
      policy: {
        action: 'submit_deposit',
        interfaceSurface: 'terminal',
      },
    });
    expect(authority.actionDecision?.decision).toBe('allowed');
  });

  it('fails deposit approval closed when wallet authority or explicit approval is missing', () => {
    const authority = buildBtdOrganizationPolicyAuthority({
      actorId: 'user-1',
      organizationId: 'org-1',
      organizationRole: 'admin',
      organizationPermissionGrants: ['deposit:approve_option'],
      interfaceSurface: 'terminal',
      action: 'approve_deposit_option',
      walletId: null,
      confirmed: false,
      policyId: 'deposit-policy-1',
      policyHash: 'deposit-policy-hash-1',
      accountAdmitted: true,
      interfaceAdmitted: true,
      at: '2026-05-29T00:00:00.000Z',
    });

    expect(authority).toMatchObject({
      policyDecision: 'denied',
      depositAdmissionAction: true,
      walletBindingState: 'missing',
      sourceVisibility: 'source_safe_preview',
    });
    expect(authority.denialReasons).toEqual(
      expect.arrayContaining(['wallet_binding_missing', 'explicit_confirmation_required']),
    );
  });
});
