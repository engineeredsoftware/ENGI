jest.mock(
  '@bitcode/supabase/ssr/server',
  () => ({
    createClient: async () => ({
      auth: {
        getUser: async () => ({
          data: { user: { id: 'mock-user' } },
          error: null,
        }),
      },
    }),
  }),
  { virtual: true },
);

import {
  advanceBtcFeeQuote,
  buildBtdApiSchemaCompatibilityMatrix,
  buildBtdAncestryReviewSettlement,
  buildBtdAssetPackLedgerAnchorSettlement,
  buildBtdAssetPackExchangeSettlement,
  buildBtdBtcFeeTransactionSettlement,
  buildBtdBridgeReadinessResearchSettlement,
  buildBtdDeploymentReadinessSettlement,
  buildBtdInterfaceIntegrationRegressionSettlement,
  buildBtdInterfaceTelemetryProofHookRegistry,
  buildBtdInterfaceConsumerUxRegressionProof,
  buildBtdInterfaceAuthorizationPolicy,
  buildBtdAssetPackRightsInterfaceContract,
  buildBtdLedgerDatabaseReconciliationSettlement,
  buildBtdReadLicenseInterfaceContract,
  buildBtdLicensedReadRevenueSettlement,
  buildBtdMintDraft,
  buildBtdOrganizationInterfaceAuthorityDecision,
  buildBtdProtocolTelemetrySettlement,
  buildBtdReadAccessDecision,
  buildBtdSourceToSharesProofSettlement,
  buildBtdJournalSettlement,
  buildBtdProtocolTelemetryRecord,
  buildBtcFeeQuote,
  createBtdMeasureMintState,
  getBtdApiSchemaCompatibilityRow,
  getBtdInterfaceTelemetryProofHook,
  getBtdInterfaceConsumerUxRegressionRow,
  getBtdInterfaceAuthorizationPolicyFixture,
  getBtdReadLicenseAssetPackRightsInterfaceFixture,
} from '@bitcode/btd';
import {
  buildGetBtdRegistrySnapshotRoute,
  buildPostBtdAncestryReviewRoute,
  buildPostBtdAssetPackLedgerAnchorRoute,
  buildPostBtdAssetPackExchangeRoute,
  buildPostBtdBtcFeeTransactionRoute,
  buildPostBtdBridgeReadinessResearchRoute,
  buildPostBtdDeploymentReadinessRoute,
  buildPostBtdInterfaceIntegrationRegressionRoute,
  buildPostBtdLedgerDatabaseReconciliationRoute,
  buildPostBtdLicensedReadRevenueRoute,
  buildPostBtdMintDraftRoute,
  buildPostBtdOrganizationInterfaceAuthorityRoute,
  buildPostBtdProtocolTelemetryRoute,
  buildPostBtdReadAccessRoute,
  buildPostBtdSourceToSharesProofRoute,
  buildPostBtdJournalRoute,
  postBtdInterfaceIntegrationRegression,
} from '../btd-crypto';

const issuedAt = '2026-05-06T00:00:00.000Z';

function walletSessionInput() {
  return {
    walletSessionId: 'wallet-session-api-1',
    walletId: 'wallet-api-1',
    userId: 'user-1',
    address: 'tb1papi',
    network: 'signet' as const,
    nonce: 'nonce-api-1',
    capabilities: ['psbt_sign' as const],
    authorizationProof: {
      proofKind: 'message_signature' as const,
      message: 'Authorize Bitcode API wallet session',
      signature: 'signature-api-1',
      verifiedAt: issuedAt,
    },
    authorizedAt: issuedAt,
  };
}

function acceptedFeeQuote() {
  return advanceBtcFeeQuote(
    buildBtcFeeQuote({
      quoteId: 'quote-api-1',
      feePurpose: 'asset_pack_anchor',
      network: 'signet',
      sats: 1200n,
      satsPerVbyte: 4,
      measurementRoot: 'measurement-root-api-1',
      relatedAssetPackId: 'asset-pack-api-1',
      issuedAt,
      expiresAt: '2026-05-06T01:00:00.000Z',
    }),
    { state: 'accepted' },
  );
}

function mintDraftInput() {
  return {
    assetPackId: 'asset-pack-api-1',
    readId: 'read-api-1',
    acceptedNeed: true as const,
    acceptedFit: true as const,
    sourceManifestRoot: 'source-root',
    fitReceiptRoot: 'fit-root',
    proofRoot: 'proof-root',
    dedupeReceiptRoot: 'dedupe-root',
    settlementJournalRoot: 'settlement-root',
    exchangeReceiptRoot: 'exchange-root',
    accessPolicyId: 'policy-1',
    accessPolicyHash: 'policy-hash',
    exchangeSequence: 1n,
    issuedAt,
    measureMintState: createBtdMeasureMintState({ curveParameter: 10_000n }),
    semanticUnits: [
      {
        unitId: 'unit-a',
        proofReceiptRoot: 'proof-a',
        dedupeReceiptRoot: 'dedupe-a',
        fitAccepted: true,
        normalizedUnits: 10_000n,
      },
    ],
    contributors: [
      {
        contributorId: 'contributor-a',
        walletId: 'wallet-a',
        normalizedContributionVolume: 10_000n,
        fitBps: 10_000,
        qualityBps: 10_000,
        provenanceBps: 10_000,
        noveltyBps: 10_000,
        antiNoiseBps: 10_000,
      },
    ],
  };
}

function mintDraftRequestBody(overrides: Record<string, unknown> = {}) {
  const input = mintDraftInput();

  return {
    ...input,
    exchangeSequence: '1',
    measureMintState: {
      ...input.measureMintState,
      cumulativeAdmittedMeasurement: '0',
      residualMintCredit: '0',
      curveParameter: '10000',
    },
    semanticUnits: input.semanticUnits.map((unit) => ({
      ...unit,
      normalizedUnits: unit.normalizedUnits.toString(),
    })),
    contributors: input.contributors.map((contributor) => ({
      ...contributor,
      normalizedContributionVolume: contributor.normalizedContributionVolume.toString(),
    })),
    ...overrides,
  };
}

function sourceToSharesProofBody(overrides: Record<string, unknown> = {}) {
  return {
    readId: 'read-api-source-to-shares-1',
    assetPackId: 'asset-pack-api-source-to-shares-1',
    acceptedNeedRoot: 'accepted-need-api-root',
    findingFitsResultRoot: 'finding-fits-api-root',
    fitDeposits: [
      {
        depositId: 'deposit-api-a',
        assetPackId: 'fit-asset-api-a',
        depositorWalletId: 'wallet-depositor-api-a',
        sourceManifestRoot: 'source-api-root-a',
        findingFitsResultRoot: 'finding-fits-api-root-a',
        measurementRoot: 'measurement-api-root-a',
        normalizedMeasurementUnits: '20000',
        fitQualityBps: 10000,
        provenanceBps: 10000,
        accepted: true,
      },
      {
        depositId: 'deposit-api-b',
        assetPackId: 'fit-asset-api-b',
        depositorWalletId: 'wallet-depositor-api-b',
        sourceManifestRoot: 'source-api-root-b',
        findingFitsResultRoot: 'finding-fits-api-root-b',
        measurementRoot: 'measurement-api-root-b',
        normalizedMeasurementUnits: '10000',
        fitQualityBps: 10000,
        provenanceBps: 10000,
        accepted: true,
      },
    ],
    btdRange: {
      assetPackId: 'asset-pack-api-source-to-shares-1',
      rangeStart: 40,
      rangeEndExclusive: 43,
      tokenCount: 3,
      measureMintReceiptRoot: 'measuremint-api-root',
    },
    feeQuote: {
      quoteId: 'quote-api-source-to-shares-1',
      quoteRoot: 'quote-api-source-root',
      grossSats: '9000',
    },
    paymentObservation: {
      paymentReceiptRoot: 'payment-api-source-root',
      observedDebitSats: '9000',
      observedCreditSats: '9000',
      finalityState: 'confirmed',
      txid: 'txid-api-source-to-shares',
    },
    exchangeSequence: '18',
    issuedAt,
    ...overrides,
  };
}

function bridgeReadinessResearchBody(overrides: Record<string, unknown> = {}) {
  return {
    postureId: 'bridge-readiness-api-1',
    exchangeSequence: '19',
    issuedAt,
    ...overrides,
  };
}

function protocolTelemetryBody(overrides: Record<string, unknown> = {}) {
  const telemetry = {
    event: 'btd.source_to_shares_proof.emitted' as const,
    subjectKind: 'source_to_shares_proof' as const,
    subjectId: 'source-to-shares-api-1',
    root: 'source-to-shares-api-root',
    receiptRoot: 'source-to-shares-api-receipt-root',
    proofRoot: 'source-to-shares-api-proof-root',
    artifactPath: '.bitcode/source-to-shares-api-proof.json',
    metadata: {
      sourceSafe: true,
      settlementAdmissible: true,
    },
    issuedAt,
  };
  const record = buildBtdProtocolTelemetryRecord(telemetry);

  return {
    telemetry: [telemetry],
    proofHooks: [
      {
        proofFamily: 'source_to_shares' as const,
        subjectKind: 'source_to_shares_proof' as const,
        subjectId: 'source-to-shares-api-1',
        evidenceRoot: 'source-to-shares-api-root',
        telemetryRoot: record.telemetryRoot,
        theoremIds: ['source-safe', 'settlement-conserved'],
        replayStepIds: ['emit-telemetry', 'bind-source-to-shares-proof'],
        witnessArtifactPaths: ['.bitcode/source-to-shares-api-proof.json'],
        generatedArtifactPath: '.bitcode/generated/source-to-shares-api-proof.json',
        issuedAt,
      },
    ],
    exchangeSequence: '20',
    issuedAt,
    ...overrides,
  };
}

function interfaceIntegrationRegressionBody(overrides: Record<string, unknown> = {}) {
  const recordBase = {
    packageOwned: true,
    routeLocalReimplementation: false,
    sourceSafeLowDetailIntact: true,
    transactionCockpitRegression: false,
    notes: ['package-owned object consumed source-safely'],
    issuedAt,
  };

  return {
    records: [
      {
        ...recordBase,
        surface: 'product',
        consumerId: 'terminal-transaction-cockpit',
        packageExport: '@bitcode/btd/interface-integration-contract',
        adapterPath: 'apps/uapi/components/bitcode/pipeline/models/transaction-route-readiness.ts',
        objectFamilies: ['btd_registry', 'read_access', 'terminal_journal'],
        proofRoot: 'terminal-interface-proof-root',
      },
      {
        ...recordBase,
        surface: 'api',
        consumerId: 'btd-api-route-boundary',
        packageExport: '@bitcode/btd',
        adapterPath: 'packages/api/src/routes/btd-crypto.ts',
        objectFamilies: [
          'btd_receipts',
          'btc_fee_operation',
          'ledger_projection',
          'protocol_telemetry',
        ],
        proofRoot: 'api-interface-proof-root',
      },
      {
        ...recordBase,
        surface: 'mcp',
        consumerId: 'bitcode-mcp-interface',
        packageExport: '@bitcode/btd/interface-integration-contract',
        adapterPath: 'apps/mcp/src/interface-integration.ts',
        objectFamilies: ['source_to_shares_proof', 'organization_authority'],
        proofRoot: 'mcp-interface-proof-root',
      },
      {
        ...recordBase,
        surface: 'chatgpt_app',
        consumerId: 'bitcode-chatgpt-app-interface',
        packageExport: '@bitcode/btd/interface-integration-contract',
        adapterPath: 'apps/chatgpt/src/interface-integration.ts',
        objectFamilies: ['read_access', 'organization_authority'],
        proofRoot: 'chatgpt-app-interface-proof-root',
      },
      {
        ...recordBase,
        surface: 'auxillaries_hook',
        consumerId: 'auxillaries-interface-hook',
        packageExport: '@bitcode/btd/interface-integration-contract',
        adapterPath: 'apps/uapi/components/bitcode/pipeline/models/transaction-route-readiness.ts',
        objectFamilies: ['btd_registry', 'organization_authority'],
        proofRoot: 'auxillaries-interface-proof-root',
      },
      {
        ...recordBase,
        surface: 'exchange_hook',
        consumerId: 'exchange-interface-hook',
        packageExport: '@bitcode/btd/interface-integration-contract',
        adapterPath: 'apps/uapi/components/bitcode/pipeline/models/transaction-route-readiness.ts',
        objectFamilies: ['btd_receipts', 'btc_fee_operation', 'ledger_projection'],
        proofRoot: 'exchange-interface-proof-root',
      },
      {
        ...recordBase,
        surface: 'conversations_hook',
        consumerId: 'conversations-interface-hook',
        packageExport: '@bitcode/btd/interface-integration-contract',
        adapterPath: 'apps/uapi/components/bitcode/pipeline/models/transaction-route-readiness.ts',
        objectFamilies: ['read_access', 'organization_authority', 'protocol_telemetry'],
        proofRoot: 'conversations-interface-proof-root',
      },
    ],
    lowDetailProofRoot: 'terminal-low-detail-source-safe-proof-root',
    transactionCockpitProofRoot: 'terminal-transaction-cockpit-regression-proof-root',
    exchangeSequence: '21',
    issuedAt,
    ...overrides,
  };
}

describe('BTD crypto API builders', () => {
  it('shares the package-owned InterfaceAuthorizationPolicy fixture for API request admission', () => {
    const fixture = getBtdInterfaceAuthorizationPolicyFixture('api-request-read-allowed');
    const policy = buildBtdInterfaceAuthorizationPolicy(fixture.input);

    expect(fixture.fixturePath).toBe('packages/api/src/routes/__tests__/btd-crypto.test.ts');
    expect(policy).toMatchObject({
      interfaceSurface: 'api',
      action: 'request_read',
      decision: 'allowed',
      denialCodes: [],
      actor: {
        organizationId: 'org-api-1',
        teamId: 'team-api-reading',
        organizationRole: 'member',
      },
      sourceVisibility: 'source_safe_preview',
    });
    expect(policy.proofRoots.policyRoot).toMatch(/^btd-interface-auth:interface-authorization-policy:/);
  });

  it('shares the package-owned ReadLicense and AssetPackRights fixture for API preview admission', () => {
    const fixture = getBtdReadLicenseAssetPackRightsInterfaceFixture('api-read-license-source-safe-preview');
    const readLicense = buildBtdReadLicenseInterfaceContract(fixture.readLicenseInput);
    const rights = buildBtdAssetPackRightsInterfaceContract(fixture.assetPackRightsInput);

    expect(fixture.fixturePath).toBe('packages/api/src/routes/__tests__/btd-crypto.test.ts');
    expect(readLicense).toMatchObject({
      interfaceSurface: 'api',
      action: 'review_asset_pack_preview',
      decision: 'source_safe_preview_admitted',
      protectedSourceVisible: false,
      licensePosture: 'preview_only_not_required',
    });
    expect(rights).toMatchObject({
      interfaceSurface: 'api',
      decision: 'preview_admitted',
      rightsPosture: 'preview_only_locked',
      btcSettlementFinality: 'quote_pending',
      protectedSourceVisible: false,
    });
  });

  it('shares the package-owned API schema compatibility matrix for versionless public routes', () => {
    const matrix = buildBtdApiSchemaCompatibilityMatrix();
    const publicRows = matrix.rows.filter((row) => row.consumerSurface === 'public_api');
    const registryRow = getBtdApiSchemaCompatibilityRow('public-api-btd-registry-success');

    expect(publicRows).toHaveLength(3);
    expect(publicRows.every((row) => row.path.startsWith('/api/') && !row.path.includes('/v1/'))).toBe(true);
    expect(matrix.observedExamplePostures).toEqual(
      expect.arrayContaining(['success', 'denied', 'blocked', 'stale', 'deferred']),
    );
    expect(registryRow).toMatchObject({
      routeId: 'api.btd.registry.snapshot',
      path: '/api/btd/registry',
      examplePosture: 'success',
      protectedSourceVisible: false,
    });
  });

  it('shares the package-owned InterfaceTelemetryProofHook for public API readback replay', () => {
    const registry = buildBtdInterfaceTelemetryProofHookRegistry();
    const hook = getBtdInterfaceTelemetryProofHook('interface.telemetry.public-api-reading');

    expect(registry.observedInterfaceIds).toContain('public_api');
    expect(hook).toMatchObject({
      interfaceId: 'public_api',
      actionId: 'api.btd.readAccess',
      posture: 'denied',
      denialReason: 'read-license-or-authority-missing',
    });
    expect(hook.roots).toMatchObject({
      requestRoot: expect.stringMatching(/^request-root:/),
      responseRoot: expect.stringMatching(/^response-root:/),
      ledgerRoot: expect.stringMatching(/^ledger-root:/),
      databaseRoot: expect.stringMatching(/^database-root:/),
      objectStorageRoot: expect.stringMatching(/^object-storage-root:/),
    });
    expect(hook.replayCommand).toContain('btd-crypto.test.ts');
  });

  it('shares the package-owned InterfaceConsumerUxRegressionProof for public API denied states', () => {
    const proof = buildBtdInterfaceConsumerUxRegressionProof();
    const row = getBtdInterfaceConsumerUxRegressionRow(
      'interface.consumer.public-api-read-access-denied',
    );

    expect(proof.observedSurfaces).toContain('public_api');
    expect(row).toMatchObject({
      surface: 'public_api',
      consumerPath: '/api/btd/read-access',
      posture: 'denied_readable',
      denialCode: 'READ_LICENSE_OR_AUTHORITY_MISSING',
      protectedSourceVisible: false,
      promptBodyVisible: false,
    });
    expect(row.sourceSafeSummary).toMatch(/structured denial/i);
    expect(row.proofRoots.length).toBeGreaterThan(0);
    expect(row.repairSteps).toEqual(expect.arrayContaining(['refresh-read-license']));
    expect(row.feeRightsPreview).toMatchObject({
      previewState: 'blocked_until_rights',
      rightsPosture: 'missing',
      protectedSourceVisible: false,
    });
  });

  it('builds a deterministic mint draft from accepted Read-Fit semantic units', () => {
    const draft = buildBtdMintDraft(mintDraftInput());

    expect(draft.kind).toBe('btd_mint_draft');
    expect(draft.zeroCell).toBe(false);
    expect(draft.measureMint.tokenCount).toBe(10_500_000);
    expect(draft.rangeAllocation?.range.rangeStart).toBe(0);
    expect(draft.rangeAllocation?.previousSupply.curveParameter).toBe(10_000n);
    expect(draft.mintReceipt?.totalMintedAfter).toBe(10_500_000);
    expect(draft.contributorAllocation?.allocations).toHaveLength(1);
    expect(draft.terminalJournalEntry.transactionKind).toBe('asset_pack_mint');
    expect(draft.terminalJournalEntry.exchangeSequence).toBe(1n);
    expect(draft.terminalJournalEntry.receiptRoots).toContain(draft.measurement.measurementId);
    expect(draft.terminalJournalEntry.receiptRoots.length).toBeGreaterThanOrEqual(3);
  });

  it('returns authenticated registry snapshots from the route boundary', async () => {
    const route = buildGetBtdRegistrySnapshotRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
      registry: {
        getSupplyState: async () => ({ total_minted: 1, max_supply: 21_000_000 }),
        listAssetPackRanges: async (assetPackId?: string) => [{ asset_pack_id: assetPackId }],
      } as any,
    });

    const response = await route(
      new Request('https://bitcode.test/api/btd/registry?assetPackId=asset-pack-api-1'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.kind).toBe('btd_registry_snapshot');
    expect(body.ranges).toEqual([{ asset_pack_id: 'asset-pack-api-1' }]);
    expect(body.routePosture.feeAsset).toBe('BTC');
  });

  it('returns JSON-safe mint drafts from the route boundary', async () => {
    const route = buildPostBtdMintDraftRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/mint-draft', {
        method: 'POST',
        body: JSON.stringify(mintDraftRequestBody()),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.measureMint.tokenCount).toBe(10_500_000);
    expect(body.measureMint.normalizedBitcodeVolume).toBe('10000');
    expect(body.terminalJournalEntry.exchangeSequence).toBe('1');
  });

  it('fails mint drafts closed when Read admission is absent', async () => {
    const route = buildPostBtdMintDraftRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/mint-draft', {
        method: 'POST',
        body: JSON.stringify(mintDraftRequestBody({ acceptedNeed: false })),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('BTD mint draft requires accepted Read.');
  });

  it('fails mint drafts closed when Fit admission is absent', async () => {
    const route = buildPostBtdMintDraftRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/mint-draft', {
        method: 'POST',
        body: JSON.stringify(mintDraftRequestBody({ acceptedFit: false })),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('BTD mint draft requires accepted Finding Fits result.');
  });

  it('fails mint drafts closed when uncommitted proof inputs are missing', async () => {
    const route = buildPostBtdMintDraftRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/mint-draft', {
        method: 'POST',
        body: JSON.stringify(mintDraftRequestBody({ proofRoot: '' })),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('proofRoot must be a non-empty string.');
  });

  it('fails mint drafts closed without a positive Exchange sequence', async () => {
    const route = buildPostBtdMintDraftRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/mint-draft', {
        method: 'POST',
        body: JSON.stringify(mintDraftRequestBody({ exchangeSequence: '0' })),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('BTD mint draft requires a positive Exchange sequence.');
  });

  it('builds read-access decisions without merging owner-read and licensed-read rights', () => {
    const policy = {
      accessPolicyId: 'policy-api-1',
      accessPolicyHash: 'policy-api-hash',
      ownerRead: true,
      licensedRead: true,
      derivativeUse: false,
      redistributionAllowed: false,
      confidentiality: 'public_proof_private_source' as const,
    };

    const owner = buildBtdReadAccessDecision({
      actorId: 'user-1',
      walletId: 'wallet-owner',
      assetPackId: 'asset-pack-api-1',
      accessPolicy: policy,
      ownershipClaims: [
        {
          walletId: 'wallet-owner',
          assetPackId: 'asset-pack-api-1',
          rangeStart: 0,
          rangeEndExclusive: 10,
          accessPolicyHash: 'policy-api-hash',
        },
      ],
      at: issuedAt,
    });
    const licensed = buildBtdReadAccessDecision({
      actorId: 'user-1',
      walletId: 'wallet-reader',
      assetPackId: 'asset-pack-api-1',
      accessPolicy: policy,
      licenses: [
        {
          licenseId: 'license-api-1',
          walletId: 'wallet-reader',
          assetPackId: 'asset-pack-api-1',
          accessPolicyHash: 'policy-api-hash',
          validFrom: '2026-05-01T00:00:00.000Z',
          expiresAt: '2026-05-07T00:00:00.000Z',
        },
      ],
      at: issuedAt,
    });

    expect(owner.decision.decision).toBe('owner_read');
    expect(licensed.decision.decision).toBe('licensed_read');
    expect(owner.policyDisclosure.accessPolicyHash).toBe('policy-api-hash');
  });

  it('returns JSON-safe read-access decisions from the route boundary', async () => {
    const route = buildPostBtdReadAccessRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/read-access', {
        method: 'POST',
        body: JSON.stringify({
          walletId: 'wallet-reader',
          assetPackId: 'asset-pack-api-1',
          accessPolicy: {
            accessPolicyId: 'policy-api-1',
            accessPolicyHash: 'policy-api-hash',
            ownerRead: true,
            licensedRead: true,
            derivativeUse: false,
            redistributionAllowed: false,
            confidentiality: 'public_proof_private_source',
          },
          licenses: [
            {
              licenseId: 'license-api-1',
              walletId: 'wallet-reader',
              assetPackId: 'asset-pack-api-1',
              accessPolicyHash: 'policy-api-hash',
              validFrom: '2026-05-01T00:00:00.000Z',
              expiresAt: '2026-05-07T00:00:00.000Z',
            },
          ],
          at: issuedAt,
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.kind).toBe('btd_read_access_decision');
    expect(body.decision.decision).toBe('licensed_read');
    expect(body.policyDisclosure.accessPolicyId).toBe('policy-api-1');
  });

  it('can derive read-access policy and licenses from the registry projection', async () => {
    const route = buildPostBtdReadAccessRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
      registry: {
        listAssetPackRanges: async () => [
          {
            asset_pack_id: 'asset-pack-api-1',
            access_policy_id: 'policy-registry-1',
            access_policy_hash: 'policy-registry-hash',
          },
        ],
        listOwnershipClaims: async () => [],
        listReadLicenses: async () => [
          {
            license_id: 'license-registry-1',
            wallet_id: 'wallet-reader',
            asset_pack_id: 'asset-pack-api-1',
            access_policy_hash: 'policy-registry-hash',
            valid_from: '2026-05-01T00:00:00.000Z',
            expires_at: '2026-05-07T00:00:00.000Z',
          },
        ],
      } as any,
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/read-access', {
        method: 'POST',
        body: JSON.stringify({
          walletId: 'wallet-reader',
          assetPackId: 'asset-pack-api-1',
          at: issuedAt,
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.decision.decision).toBe('licensed_read');
    expect(body.policyDisclosure.accessPolicyId).toBe('policy-registry-1');
    expect(body.policyDisclosure.accessPolicyHash).toBe('policy-registry-hash');
  });

  it('keeps expired license and policy mismatch failures explicit at the route boundary', async () => {
    const route = buildPostBtdReadAccessRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
    });
    const expiredResponse = await route(
      new Request('https://bitcode.test/api/btd/read-access', {
        method: 'POST',
        body: JSON.stringify({
          walletId: 'wallet-reader',
          assetPackId: 'asset-pack-api-1',
          accessPolicy: {
            accessPolicyId: 'policy-api-1',
            accessPolicyHash: 'policy-api-hash',
            ownerRead: true,
            licensedRead: true,
            derivativeUse: false,
            redistributionAllowed: false,
            confidentiality: 'public_proof_private_source',
          },
          licenses: [
            {
              licenseId: 'license-expired',
              walletId: 'wallet-reader',
              assetPackId: 'asset-pack-api-1',
              accessPolicyHash: 'policy-api-hash',
              validFrom: '2026-05-01T00:00:00.000Z',
              expiresAt: '2026-05-05T00:00:00.000Z',
            },
          ],
          at: issuedAt,
        }),
      }),
    );
    const mismatchResponse = await route(
      new Request('https://bitcode.test/api/btd/read-access', {
        method: 'POST',
        body: JSON.stringify({
          walletId: 'wallet-owner',
          assetPackId: 'asset-pack-api-1',
          accessPolicy: {
            accessPolicyId: 'policy-api-1',
            accessPolicyHash: 'policy-api-hash',
            ownerRead: true,
            licensedRead: true,
            derivativeUse: false,
            redistributionAllowed: false,
            confidentiality: 'public_proof_private_source',
          },
          ownershipClaims: [
            {
              walletId: 'wallet-owner',
              assetPackId: 'asset-pack-api-1',
              rangeStart: 0,
              rangeEndExclusive: 10,
              accessPolicyHash: 'stale-policy-hash',
            },
          ],
          at: issuedAt,
        }),
      }),
    );

    expect((await expiredResponse.json()).decision.reason).toBe('license_expired');
    expect((await mismatchResponse.json()).decision.reason).toBe('policy_mismatch');
  });

  it('builds organization interface authority decisions with source visibility and proof roots', () => {
    const decision = buildBtdOrganizationInterfaceAuthorityDecision({
      actorId: 'user-1',
      organizationId: 'org-api-1',
      organizationRole: 'admin',
      organizationPermissionGrants: ['asset_pack:deliver'],
      interfaceSurface: 'mcp',
      action: 'deliver_asset_pack',
      walletId: 'wallet-reader',
      settlementState: 'settled',
      confirmed: true,
      targetAnchor: 'github:engineeredsoftware/ENGI/pull/42',
      readAccessDecision: {
        decision: 'owner_read',
        accessPolicyHash: 'policy-api-hash',
        reason: 'wallet_owns_policy_matching_range',
      },
      at: issuedAt,
    });

    expect(decision).toMatchObject({
      routeKind: 'btd_organization_interface_authority_route_decision',
      kind: 'btd_organization_interface_authority_decision',
      decision: 'allowed',
      interfaceSurface: 'mcp',
      action: 'deliver_asset_pack',
      sourceVisibility: 'protected_source_allowed',
      reason: 'role_authorized',
    });
    expect(decision.reasons).toEqual(expect.arrayContaining(['owner_read_access_authorized']));
    expect(decision.proofRoots.authorityRoot).toMatch(/^btd-proof-root:organization-interface-authority:/);
  });

  it('returns JSON-safe organization interface authority decisions from the route boundary', async () => {
    const route = buildPostBtdOrganizationInterfaceAuthorityRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/organization-interface-authority', {
        method: 'POST',
        body: JSON.stringify({
          organizationId: 'org-api-1',
          organizationRole: 'member',
          organizationPermissionGrants: ['reading:request_finding_fits'],
          interfaceSurface: 'product',
          action: 'request_finding_fits',
          at: issuedAt,
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.routeKind).toBe('btd_organization_interface_authority_route_decision');
    expect(body.decision).toBe('allowed');
    expect(body.sourceVisibility).toBe('source_safe_preview');
    expect(body.satisfied.role).toBe(true);
    expect(body.proofRoots.interfaceRoot).toMatch(/^btd-proof-root:interface-authority:/);
  });

  it('keeps organization authority denials explicit at the route boundary', async () => {
    const route = buildPostBtdOrganizationInterfaceAuthorityRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/organization-interface-authority', {
        method: 'POST',
        body: JSON.stringify({
          organizationId: 'org-api-1',
          organizationRole: 'viewer',
          interfaceSurface: 'chatgpt_app',
          action: 'deliver_asset_pack',
          settlementState: 'pending',
          confirmed: false,
          at: issuedAt,
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.decision).toBe('denied');
    expect(body.reasons).toEqual(
      expect.arrayContaining([
        'role_insufficient',
        'wallet_binding_missing',
        'registry_read_access_required',
        'settlement_required',
        'explicit_confirmation_required',
      ]),
    );
  });

  it('builds licensed-read revenue settlement receipts with holdback and route state', () => {
    const settlement = buildBtdLicensedReadRevenueSettlement({
      actorId: 'user-1',
      paymentId: 'payment-api-1',
      assetPackId: 'asset-pack-api-1',
      grossSats: 10_000n,
      directRecipients: [{ walletId: 'wallet-direct', weight: 1n }],
      ancestorRecipients: [{ walletId: 'wallet-ancestor', weight: 1n }],
      treasuryWalletId: 'wallet-treasury',
      disputeHoldbackWalletId: 'wallet-holdback',
      exchangeSequence: 9n,
      directSplitBps: 7_000,
      ancestorSplitBps: 1_000,
      treasurySplitBps: 1_000,
      disputeHoldbackBps: 1_000,
      issuedAt,
    });

    expect(settlement.receipt.directSats).toBe(7_000n);
    expect(settlement.receipt.ancestorSats).toBe(1_000n);
    expect(settlement.receipt.treasurySats).toBe(1_000n);
    expect(settlement.receipt.disputeHoldbackSats).toBe(1_000n);
    expect(settlement.receipt.routeState).toBe('pending');
    expect(settlement.terminalJournalEntry.transactionKind).toBe('settlement_finalization');
  });

  it('builds ancestry review receipts with anti-game rejection and no supply effect', () => {
    const settlement = buildBtdAncestryReviewSettlement({
      actorId: 'user-1',
      reviewId: 'ancestry-review-api-1',
      childAssetPackId: 'asset-pack-child',
      exchangeSequence: 10n,
      existingEdges: [
        {
          parentAssetPackId: 'asset-pack-child',
          childAssetPackId: 'asset-pack-parent',
          status: 'payable',
        },
      ],
      edges: [
        {
          parentAssetPackId: 'asset-pack-parent',
          childAssetPackId: 'asset-pack-child',
          edgeKind: 'implementation_dependency',
          evidenceRoot: 'evidence-root',
          confidenceBps: 9_000,
          timelessnessBps: 9_000,
          depth: 1,
          createdAfterChildFit: true,
          conflictDisclosure: [],
        },
      ],
      issuedAt,
    });

    expect(settlement.receipt.edges[0].status).toBe('rejected');
    expect(settlement.receipt.edges[0].rejectionReason).toBe('reciprocal_loop');
    expect(settlement.receipt.supplyEffect).toBe('none');
    expect(settlement.receipt.mintCountDelta).toBe(0);
    expect(settlement.terminalJournalEntry.receiptRoots).toEqual(['ancestry-review-api-1']);
  });

  it('builds BTC fee transaction settlements from user-authorized PSBT handoff receipts', () => {
    const prepared = buildBtdBtcFeeTransactionSettlement({
      actorId: 'user-1',
      action: 'prepare',
      receiptId: 'btc-fee-api-1',
      feePurpose: 'asset_pack_anchor',
      payerSession: walletSessionInput(),
      feeQuote: acceptedFeeQuote(),
      psbt: 'cHNidP8BAHECAAAAA',
      satsPaid: 1200n,
      satsPerVbyte: 4,
      exchangeSequence: 11n,
      terminalJournalRoot: 'terminal-journal-root',
      relatedAssetPackId: 'asset-pack-api-1',
      issuedAt,
    });
    const signed = buildBtdBtcFeeTransactionSettlement({
      actorId: 'user-1',
      action: 'mark_signed',
      previousReceipt: prepared.receipt,
      signedPsbt: 'signed-psbt',
      issuedAt,
    });
    const broadcast = buildBtdBtcFeeTransactionSettlement({
      actorId: 'user-1',
      action: 'mark_broadcast',
      previousReceipt: signed.receipt,
      txid: 'btc-txid-api-1',
      issuedAt,
    });
    const confirmed = buildBtdBtcFeeTransactionSettlement({
      actorId: 'user-1',
      action: 'observe',
      previousReceipt: broadcast.receipt,
      observedFinalityState: 'confirmed',
      confirmations: 2,
      issuedAt,
    });

    expect(prepared.receipt.serverCustody).toBe(false);
    expect(prepared.receipt.feeAsset).toBe('BTC');
    expect(prepared.receipt.walletAuthorizationProof.proofKind).toBe('message_signature');
    expect(prepared.receipt.exchangeSequence).toBe(11n);
    expect(prepared.operationPosture).toMatchObject({
      phase: 'psbt_ready',
      canSignPsbt: true,
      noServerCustody: true,
      psbtHandoffState: 'prepared_unsigned',
      broadcastState: 'not_broadcast',
      networkPolicy: {
        admitted: true,
        environment: 'staging-testnet',
        mainnet: false,
      },
      taprootScriptPosture: {
        commitmentMethod: 'taproot',
        taprootAdmitted: true,
      },
      quote: { quoteId: 'quote-api-1' },
    });
    expect(prepared.terminalJournalEntry.transactionKind).toBe('btc_fee_payment');
    expect(confirmed.receipt.txid).toBe('btc-txid-api-1');
    expect(confirmed.receipt.confirmations).toBe(2);
  });

  it('builds AssetPack ledger anchor settlements on the selected Taproot path', () => {
    const prepared = buildBtdAssetPackLedgerAnchorSettlement({
      actorId: 'user-1',
      action: 'prepare',
      anchorId: 'anchor-api-1',
      assetPackId: 'asset-pack-api-1',
      chain: 'bitcoin',
      network: 'signet',
      commitmentRoot: 'commitment-root',
      sourceManifestRoot: 'source-root',
      proofRoot: 'proof-root',
      accessPolicyHash: 'policy-hash',
      btdRangeStart: 0,
      btdRangeEndExclusive: 10,
      exchangeSequence: 12n,
      issuedAt,
    });
    const broadcast = buildBtdAssetPackLedgerAnchorSettlement({
      actorId: 'user-1',
      action: 'mark_broadcast',
      previousAnchor: prepared.anchor,
      txidOrHash: 'anchor-txid-api-1',
      outputIndex: 0,
      exchangeSequence: 12n,
      issuedAt,
    });
    const confirmed = buildBtdAssetPackLedgerAnchorSettlement({
      actorId: 'user-1',
      action: 'observe',
      previousAnchor: broadcast.anchor,
      observedFinalityState: 'confirmed',
      confirmations: 3,
      exchangeSequence: 12n,
      issuedAt,
    });

    expect(prepared.anchor.commitmentMethod).toBe('taproot');
    expect(prepared.terminalJournalEntry.transactionKind).toBe('asset_pack_anchor');
    expect(confirmed.anchor.finalityState).toBe('confirmed');
    expect(confirmed.anchor.txidOrHash).toBe('anchor-txid-api-1');
  });

  it('builds minimal AssetPack Exchange order and rights-transfer settlements', () => {
    const created = buildBtdAssetPackExchangeSettlement({
      actorId: 'user-1',
      action: 'create_order',
      orderId: 'order-api-1',
      orderKind: 'sell',
      assetPackId: 'asset-pack-api-1',
      rangeStart: 0,
      rangeEndExclusive: 10,
      makerWalletId: 'wallet-seller',
      priceSats: 50_000n,
      accessPolicyHash: 'policy-hash',
      createdAtExchangeSequence: 13n,
      issuedAt,
    });
    const accepted = buildBtdAssetPackExchangeSettlement({
      actorId: 'user-1',
      action: 'accept_order',
      previousOrder: created.order,
      takerWalletId: 'wallet-buyer',
      issuedAt,
    });
    const settled = buildBtdAssetPackExchangeSettlement({
      actorId: 'user-1',
      action: 'settle_order',
      previousOrder: accepted.order,
      settledAtExchangeSequence: 14n,
      ledgerAnchorId: 'anchor-api-1',
      issuedAt,
    });
    const transfer = buildBtdAssetPackExchangeSettlement({
      actorId: 'user-1',
      action: 'transfer_rights',
      previousOrder: settled.order,
      receiptId: 'transfer-api-1',
      fromWalletId: 'wallet-seller',
      toWalletId: 'wallet-buyer',
      btcFeeReceiptId: 'btc-fee-api-1',
      issuedAt,
    });

    expect(created.order?.priceAsset).toBe('BTC');
    expect(settled.order?.orderState).toBe('settled');
    expect(transfer.rightsTransfer?.ledgerAnchorId).toBe('anchor-api-1');
    expect(transfer.terminalJournalEntry.transactionKind).toBe('rights_transfer');
  });

  it('builds BTD journal coverage and blocking diff settlements', () => {
    const entry = buildBtdJournalSettlement({
      actorId: 'user-1',
      action: 'commit_entry',
      journalEntryId: 'journal-api-1',
      transactionKind: 'rights_transfer',
      preStateRoot: 'pre-root',
      postStateRoot: 'post-root',
      receiptRoots: ['transfer-api-1'],
      ledgerAnchorIds: ['anchor-api-1'],
      exchangeSequence: 15n,
      issuedAt,
    });
    const diff = buildBtdJournalSettlement({
      actorId: 'user-1',
      action: 'diff_projection',
      entry: entry.entry,
      projection: {
        journalEntryId: 'journal-api-1',
        postStateRoot: 'stale-root',
        receiptRoots: ['transfer-api-1'],
        ledgerAnchorIds: ['anchor-api-1'],
      },
      issuedAt,
    });
    const coverage = buildBtdJournalSettlement({
      actorId: 'user-1',
      action: 'coverage',
      coverageId: 'terminal-coverage-api-1',
      entries: [
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
        'ledger_database_reconciliation',
      ].map((transactionKind, index) => ({
        journalEntryId: `journal-${transactionKind}`,
        transactionKind: transactionKind as any,
        actorId: 'user-1',
        preStateRoot: `pre-${transactionKind}`,
        postStateRoot: `post-${transactionKind}`,
        receiptRoots: [`receipt-${transactionKind}`],
        ledgerAnchorIds: [],
        exchangeSequence: BigInt(index + 1),
        issuedAt,
      })),
      issuedAt,
    });

    expect(entry.entry?.transactionKind).toBe('rights_transfer');
    expect(diff.diff?.blocking).toBe(true);
    expect(diff.diff?.mismatches).toContain('post_state_root');
    expect(coverage.coverage?.blocking).toBe(false);
  });

  it('builds ledger/database reconciliation settlements with private canonical facts', () => {
    const settlement = buildBtdLedgerDatabaseReconciliationSettlement({
      actorId: 'user-1',
      reconciliationId: 'reconciliation-api-1',
      ledgerFacts: [
        {
          factId: 'anchor-api-1',
          ledgerRoot: 'confirmed-root',
          finalityState: 'confirmed',
        },
      ],
      databaseFacts: [
        {
          factId: 'anchor-api-1',
          projectedLedgerRoot: 'confirmed-root',
          projectedFinalityState: 'broadcast',
        },
      ],
      metaphysicalFacts: [
        {
          factId: 'private-source-api-1',
          factKind: 'private_source_metadata',
          canonicalRoot: 'private-source-root',
          receiptRoot: 'private-source-receipt-root',
          private: true,
        },
      ],
      issuedAt,
    });

    expect(settlement.report.blocking).toBe(true);
    expect(settlement.report.state).toBe('approval_required');
    expect(settlement.report.repairs[0].repairKind).toBe('ledger_finality_state');
    expect(settlement.report.repairs[0].repairActionKind).toBe('update_finality_state');
    expect(settlement.report.proofRoots.repairPlanRoot).toMatch(/^btd-proof-root:repair-plan:/);
    expect(settlement.report.metaphysicalFacts[0].canonicalRoot).toBe('private-source-root');
    expect(settlement.terminalJournalEntry.transactionKind).toBe('ledger_database_reconciliation');
    expect(settlement.terminalJournalEntry.receiptRoots).toContain(
      settlement.report.proofRoots.repairPlanRoot,
    );
  });

  it('builds source-to-shares proof settlements with exact conservation roots', () => {
    const settlement = buildBtdSourceToSharesProofSettlement({
      actorId: 'user-1',
      ...sourceToSharesProofBody(),
      exchangeSequence: 18n,
    } as any);

    expect(settlement.kind).toBe('btd_source_to_shares_proof_settlement');
    expect(settlement.proof.contributionWeights.map((entry) => entry.shareBps)).toEqual([
      6667,
      3333,
    ]);
    expect(settlement.proof.settlementConservation).toMatchObject({
      state: 'balanced',
      settlementAdmissible: true,
      allocationConserved: true,
    });
    expect(
      settlement.proof.settlementAllocations.reduce(
        (sum, route) => sum + route.allocatedSats,
        0n,
      ),
    ).toBe(9000n);
    expect(settlement.terminalJournalEntry.transactionKind).toBe('settlement_finalization');
    expect(settlement.terminalJournalEntry.receiptRoots).toContain(
      settlement.proof.settlementConservation.conservationRoot,
    );
  });

  it('builds bridge-readiness research settlements without chain-of-record admission', () => {
    const settlement = buildBtdBridgeReadinessResearchSettlement({
      actorId: 'user-1',
      ...bridgeReadinessResearchBody(),
      exchangeSequence: 19n,
    } as any);

    expect(settlement.kind).toBe('btd_bridge_readiness_research_settlement');
    expect(settlement.committed).toBe(false);
    expect(settlement.posture.bridgeChainOfRecordTruth).toBe('no_bridge_chain_of_record');
    expect(settlement.posture.records.map((record) => record.path)).toEqual([
      'bitcoin_taproot_anchor',
      'bitvm_execution_bridge',
      'bsc_opbnb_distribution',
      'binance_web3_wallet_distribution',
      'future_distribution_path',
    ]);
    expect(settlement.posture.records.every((record) => record.chainOfRecordAdmitted === false)).toBe(
      true,
    );
    expect(settlement.terminalJournalEntry.transactionKind).toBe('proof_admission');
    expect(settlement.terminalJournalEntry.receiptRoots).toContain(settlement.posture.proofRoot);
  });

  it('builds Protocol telemetry settlements with source-safe proof hooks', () => {
    const settlement = buildBtdProtocolTelemetrySettlement({
      actorId: 'user-1',
      ...protocolTelemetryBody(),
      exchangeSequence: 20n,
    } as any);

    expect(settlement.kind).toBe('btd_protocol_telemetry_settlement');
    expect(settlement.committed).toBe(false);
    expect(settlement.envelope.compatibleWith).toEqual(['V32', 'V35']);
    expect(settlement.envelope.sourceSafety.sourceSafe).toBe(true);
    expect(settlement.envelope.telemetry[0]).toMatchObject({
      event: 'btd.source_to_shares_proof.emitted',
      subjectKind: 'source_to_shares_proof',
    });
    expect(settlement.envelope.telemetry[0].sourceSafety.containsProtectedSource).toBe(false);
    expect(settlement.envelope.proofHooks[0]).toMatchObject({
      proofFamily: 'source_to_shares',
      subjectKind: 'source_to_shares_proof',
    });
    expect(settlement.terminalJournalEntry.transactionKind).toBe('proof_admission');
    expect(settlement.terminalJournalEntry.receiptRoots).toContain(
      settlement.envelope.telemetryRoot,
    );
  });

  it('builds deployment readiness, telemetry, and upgrade settlements', () => {
    const readiness = buildBtdDeploymentReadinessSettlement({
      actorId: 'user-1',
      action: 'deployment_lane',
      readinessId: 'readiness-api-1',
      lane: 'signet',
      bitcoinNetwork: 'signet',
      ledgerNetwork: 'signet',
      rollbackPlanRoot: 'rollback-root',
      presentEnvironmentKeys: [
        'BITCODE_CRYPTO_LANE',
        'BITCODE_BITCOIN_NETWORK',
        'BITCODE_LEDGER_NETWORK',
        'BITCODE_BTC_RPC_URL',
        'BITCODE_BTC_FEE_WALLET_CONNECTOR',
        'BITCODE_LEDGER_ANCHOR_PROVIDER',
        'BITCODE_CRYPTO_TELEMETRY_SINK',
        'BITCODE_ROLLBACK_PLAN_ROOT',
      ],
      issuedAt,
    });
    const telemetry = buildBtdDeploymentReadinessSettlement({
      actorId: 'user-1',
      action: 'telemetry_event',
      telemetryEvent: 'ledger_provider.disagreement',
      telemetrySubjectId: 'anchor-api-1',
      telemetryReceiptRoot: 'receipt-root',
      telemetryLedgerAnchorId: 'anchor-api-1',
      issuedAt,
    });
    const upgrade = buildBtdDeploymentReadinessSettlement({
      actorId: 'user-1',
      action: 'upgrade_plan',
      upgradeId: 'upgrade-api-1',
      fromVersion: 'V26',
      toVersion: 'V27',
      ledgerNetwork: 'signet',
      migrationRoot: 'migration-root',
      preStateRoot: 'pre-root',
      approvalReceiptRoot: 'approval-root',
      rollbackPlanRoot: 'rollback-root',
      issuedAt,
    });

    expect(readiness.readiness?.blocking).toBe(false);
    expect(telemetry.telemetry?.severity).toBe('critical');
    expect(upgrade.upgradeReceipt?.upgradeState).toBe('planned');
  });

  it('returns JSON-safe licensed-read revenue settlements and persists only on explicit commit', async () => {
    const insertLicensedReadRevenueRoute = jest.fn(async (row) => ({
      payment_id: row.payment_id,
      route_state: row.route_state,
    }));
    const route = buildPostBtdLicensedReadRevenueRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
      registry: {
        insertLicensedReadRevenueRoute,
      } as any,
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/licensed-read-revenue', {
        method: 'POST',
        body: JSON.stringify({
          paymentId: 'payment-api-1',
          assetPackId: 'asset-pack-api-1',
          grossSats: '10000',
          directRecipients: [{ walletId: 'wallet-direct', weight: '1' }],
          ancestorRecipients: [{ walletId: 'wallet-ancestor', weight: '1' }],
          treasuryWalletId: 'wallet-treasury',
          disputeHoldbackWalletId: 'wallet-holdback',
          exchangeSequence: '9',
          directSplitBps: 7000,
          ancestorSplitBps: 1000,
          treasurySplitBps: 1000,
          disputeHoldbackBps: 1000,
          commitToRegistry: true,
          issuedAt,
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.kind).toBe('btd_licensed_read_revenue_settlement');
    expect(body.receipt.disputeHoldbackSats).toBe('1000');
    expect(body.receipt.routeState).toBe('pending');
    expect(body.committed).toBe(true);
    expect(insertLicensedReadRevenueRoute).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_id: 'payment-api-1',
        gross_sats: '10000',
        dispute_holdback_sats: '1000',
        route_state: 'pending',
      }),
    );
  });

  it('returns JSON-safe ancestry reviews and persists review rows only on explicit commit', async () => {
    const insertAncestorEdge = jest.fn(async (row) => ({
      edge_id: row.edge_id,
      status: row.status,
    }));
    const route = buildPostBtdAncestryReviewRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
      registry: {
        insertAncestorEdge,
      } as any,
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/ancestry-review', {
        method: 'POST',
        body: JSON.stringify({
          reviewId: 'ancestry-review-api-1',
          childAssetPackId: 'asset-pack-child',
          exchangeSequence: '10',
          duplicateSourceRoots: ['duplicate-source-root'],
          commitToRegistry: true,
          issuedAt,
          edges: [
            {
              parentAssetPackId: 'asset-pack-parent',
              childAssetPackId: 'asset-pack-child',
              edgeKind: 'source_reuse',
              evidenceRoot: 'evidence-root',
              sourceFingerprintRoot: 'duplicate-source-root',
              confidenceBps: 9000,
              timelessnessBps: 9000,
              depth: 1,
              createdAfterChildFit: true,
              conflictDisclosure: [],
            },
          ],
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.kind).toBe('btd_ancestry_review_settlement');
    expect(body.receipt.supplyEffect).toBe('none');
    expect(body.receipt.edges[0].status).toBe('rejected');
    expect(body.receipt.edges[0].rejectionReason).toBe('duplicate_source');
    expect(body.committed).toBe(true);
    expect(insertAncestorEdge).toHaveBeenCalledWith(
      expect.objectContaining({
        review_id: 'ancestry-review-api-1',
        child_asset_pack_id: 'asset-pack-child',
        status: 'rejected',
        rejection_reason: 'duplicate_source',
        source_fingerprint_root: 'duplicate-source-root',
        supply_effect: 'none',
        mint_count_delta: 0,
      }),
    );
  });

  it('returns JSON-safe BTC fee transaction settlements and persists only on explicit commit', async () => {
    const insertBtcFeeTransaction = jest.fn(async (row) => ({
      receipt_id: row.receipt_id,
      finality_state: row.finality_state,
    }));
    const route = buildPostBtdBtcFeeTransactionRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
      registry: {
        insertBtcFeeTransaction,
      } as any,
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/btc-fee-transaction', {
        method: 'POST',
        body: JSON.stringify({
          action: 'prepare',
          receiptId: 'btc-fee-api-1',
          feePurpose: 'asset_pack_anchor',
          payerSession: walletSessionInput(),
          feeQuote: {
            ...acceptedFeeQuote(),
            sats: '1200',
          },
          psbt: 'cHNidP8BAHECAAAAA',
          satsPaid: '1200',
          satsPerVbyte: 4,
          exchangeSequence: '11',
          terminalJournalRoot: 'terminal-journal-root',
          relatedAssetPackId: 'asset-pack-api-1',
          commitToRegistry: true,
          issuedAt,
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.kind).toBe('btd_btc_fee_transaction_settlement');
    expect(body.receipt.feeAsset).toBe('BTC');
    expect(body.receipt.serverCustody).toBe(false);
    expect(body.receipt.exchangeSequence).toBe('11');
    expect(body.operationPosture).toMatchObject({
      phase: 'psbt_ready',
      canSignPsbt: true,
      psbtHandoffState: 'prepared_unsigned',
      broadcastState: 'not_broadcast',
      networkPolicy: {
        admitted: true,
        environment: 'staging-testnet',
      },
      quote: {
        quoteId: 'quote-api-1',
        sats: '1200',
      },
    });
    expect(body.committed).toBe(true);
    expect(insertBtcFeeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        receipt_id: 'btc-fee-api-1',
        fee_purpose: 'asset_pack_anchor',
        fee_asset: 'BTC',
        server_custody: false,
        wallet_authorization_proof: expect.objectContaining({
          proofKind: 'message_signature',
        }),
        sats_paid: '1200',
        sats_per_vbyte: 4,
        related_asset_pack_id: 'asset-pack-api-1',
      }),
    );
  });

  it('returns JSON-safe AssetPack ledger anchor settlements and persists only on explicit commit', async () => {
    const insertLedgerAnchor = jest.fn(async (row) => ({
      anchor_id: row.anchor_id,
      finality_state: row.finality_state,
    }));
    const route = buildPostBtdAssetPackLedgerAnchorRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
      registry: {
        insertLedgerAnchor,
      } as any,
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/asset-pack-ledger-anchor', {
        method: 'POST',
        body: JSON.stringify({
          action: 'prepare',
          anchorId: 'anchor-api-1',
          assetPackId: 'asset-pack-api-1',
          chain: 'bitcoin',
          network: 'signet',
          commitmentRoot: 'commitment-root',
          sourceManifestRoot: 'source-root',
          proofRoot: 'proof-root',
          accessPolicyHash: 'policy-hash',
          btdRangeStart: 0,
          btdRangeEndExclusive: 10,
          exchangeSequence: '12',
          commitToRegistry: true,
          issuedAt,
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.kind).toBe('btd_asset_pack_ledger_anchor_settlement');
    expect(body.anchor.commitmentMethod).toBe('taproot');
    expect(body.anchor.network).toBe('signet');
    expect(body.committed).toBe(true);
    expect(insertLedgerAnchor).toHaveBeenCalledWith(
      expect.objectContaining({
        anchor_id: 'anchor-api-1',
        chain: 'bitcoin',
        network: 'signet',
        commitment_method: 'taproot',
        btd_range_start: 0,
        btd_range_end_exclusive: 10,
      }),
    );
  });

  it('returns JSON-safe AssetPack Exchange settlements and persists explicit commits', async () => {
    const insertExchangeOrder = jest.fn(async (row) => ({
      order_id: row.order_id,
      order_state: row.order_state,
    }));
    const updateExchangeOrder = jest.fn(async (orderId, row) => ({
      order_id: orderId,
      order_state: row.order_state,
    }));
    const insertRightsTransferReceipt = jest.fn(async (row) => ({
      receipt_id: row.receipt_id,
    }));
    const route = buildPostBtdAssetPackExchangeRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
      registry: {
        insertExchangeOrder,
        updateExchangeOrder,
        insertRightsTransferReceipt,
      } as any,
    });
    const createdResponse = await route(
      new Request('https://bitcode.test/api/btd/asset-pack-exchange', {
        method: 'POST',
        body: JSON.stringify({
          action: 'create_order',
          orderId: 'order-api-1',
          orderKind: 'sell',
          assetPackId: 'asset-pack-api-1',
          rangeStart: 0,
          rangeEndExclusive: 10,
          makerWalletId: 'wallet-seller',
          priceSats: '50000',
          accessPolicyHash: 'policy-hash',
          createdAtExchangeSequence: '13',
          commitToRegistry: true,
          issuedAt,
        }),
      }),
    );
    const createdBody = await createdResponse.json();
    const settledOrder = {
      ...createdBody.order,
      priceSats: '50000',
      createdAtExchangeSequence: '13',
      takerWalletId: 'wallet-buyer',
      orderState: 'settled',
      settledAtExchangeSequence: '14',
      ledgerAnchorId: 'anchor-api-1',
    };
    const transferResponse = await route(
      new Request('https://bitcode.test/api/btd/asset-pack-exchange', {
        method: 'POST',
        body: JSON.stringify({
          action: 'transfer_rights',
          previousOrder: settledOrder,
          receiptId: 'transfer-api-1',
          fromWalletId: 'wallet-seller',
          toWalletId: 'wallet-buyer',
          btcFeeReceiptId: 'btc-fee-api-1',
          commitToRegistry: true,
          issuedAt,
        }),
      }),
    );
    const transferBody = await transferResponse.json();

    expect(createdResponse.status).toBe(200);
    expect(createdBody.order.priceAsset).toBe('BTC');
    expect(createdBody.committed).toBe(true);
    expect(transferResponse.status).toBe(200);
    expect(transferBody.rightsTransfer.ledgerAnchorId).toBe('anchor-api-1');
    expect(insertExchangeOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: 'order-api-1',
        price_asset: 'BTC',
        price_sats: '50000',
      }),
    );
    expect(insertRightsTransferReceipt).toHaveBeenCalledWith(
      expect.objectContaining({
        receipt_id: 'transfer-api-1',
        btc_fee_receipt_id: 'btc-fee-api-1',
        ledger_anchor_id: 'anchor-api-1',
      }),
    );
    expect(updateExchangeOrder).not.toHaveBeenCalled();
  });

  it('returns JSON-safe BTD journal settlements and persists explicit commits', async () => {
    const insertJournalEntry = jest.fn(async (row) => ({
      journal_entry_id: row.journal_entry_id,
      transaction_kind: row.transaction_kind,
    }));
    const route = buildPostBtdJournalRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
      registry: {
        insertJournalEntry,
      } as any,
    });
    const commitResponse = await route(
      new Request('https://bitcode.test/api/btd/journal', {
        method: 'POST',
        body: JSON.stringify({
          action: 'commit_entry',
          journalEntryId: 'journal-api-1',
          transactionKind: 'rights_transfer',
          preStateRoot: 'pre-root',
          postStateRoot: 'post-root',
          receiptRoots: ['transfer-api-1'],
          ledgerAnchorIds: ['anchor-api-1'],
          exchangeSequence: '15',
          commitToRegistry: true,
          issuedAt,
        }),
      }),
    );
    const commitBody = await commitResponse.json();
    const diffResponse = await route(
      new Request('https://bitcode.test/api/btd/journal', {
        method: 'POST',
        body: JSON.stringify({
          action: 'diff_projection',
          entry: commitBody.entry,
          projection: {
            journalEntryId: 'journal-api-1',
            postStateRoot: 'stale-root',
            receiptRoots: ['transfer-api-1'],
            ledgerAnchorIds: ['anchor-api-1'],
          },
          issuedAt,
        }),
      }),
    );
    const diffBody = await diffResponse.json();

    expect(commitResponse.status).toBe(200);
    expect(commitBody.entry.exchangeSequence).toBe('15');
    expect(commitBody.committed).toBe(true);
    expect(diffResponse.status).toBe(200);
    expect(diffBody.diff.blocking).toBe(true);
    expect(insertJournalEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        journal_entry_id: 'journal-api-1',
        transaction_kind: 'rights_transfer',
        ledger_anchor_ids: ['anchor-api-1'],
        exchange_sequence: '15',
      }),
    );
  });

  it('returns JSON-safe ledger/database reconciliation settlements and persists repairs', async () => {
    const insertReconciliationRepair = jest.fn(async (row) => ({
      repair_id: row.repair_id,
      blocking: row.blocking,
    }));
    const route = buildPostBtdLedgerDatabaseReconciliationRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
      registry: {
        insertReconciliationRepair,
      } as any,
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/ledger-database-reconciliation', {
        method: 'POST',
        body: JSON.stringify({
          reconciliationId: 'reconciliation-api-1',
          ledgerFacts: [
            {
              factId: 'anchor-api-1',
              ledgerRoot: 'confirmed-root',
              finalityState: 'confirmed',
            },
          ],
          databaseFacts: [
            {
              factId: 'anchor-api-1',
              projectedLedgerRoot: 'confirmed-root',
              projectedFinalityState: 'broadcast',
            },
            {
              factId: 'artifact-api-1',
              projectedLedgerRoot: 'artifact-ledger-root',
              projectedFinalityState: 'prepared',
              projectedObjectStorageRoot: 'artifact-database-root',
            },
          ],
          objectStorageArtifacts: [
            {
              factId: 'artifact-api-1',
              artifactId: 'artifact-api-1',
              artifactKind: 'pipeline_evidence',
              storageRoot: 'artifact-storage-root',
              sourceVisibility: 'proof_public',
              durable: true,
              containsProtectedSource: false,
              encrypted: false,
            },
          ],
          metaphysicalFacts: [
            {
              factId: 'private-source-api-1',
              factKind: 'private_source_metadata',
              canonicalRoot: 'private-source-root',
              receiptRoot: 'private-source-receipt-root',
              private: true,
            },
          ],
          stagingTestnetReadback: {
            kind: 'btd.supabase_projection_readback',
            readbackId: 'staging-readback-api-1',
            lane: 'staging-testnet',
            supabaseProjectRef: 'tkpyosihuouusyaxtbau',
            restHost: 'tkpyosihuouusyaxtbau.supabase.co',
            adminCredentialState: 'provided_out_of_band',
            secretValuesStored: false,
            tableReadbacks: [
              {
                table: 'btd_asset_pack_ranges',
                expectedCount: 1,
                observedCount: 1,
                synchronized: true,
              },
            ],
            state: 'synchronized',
            blockingReasons: [],
            proofRoot: 'btd-proof-root:supabase-projection-readback:api',
            issuedAt,
          },
          settlementConservationChecks: [
            {
              checkId: 'settlement-conservation-api-1',
              expectedDebitSats: 1000,
              observedDebitSats: 1000,
              expectedCreditSats: 1000,
              observedCreditSats: 900,
            },
          ],
          commitToRegistry: true,
          issuedAt,
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.kind).toBe('btd_ledger_database_reconciliation_settlement');
    expect(body.report.blocking).toBe(true);
    expect(body.report.state).toBe('blocked');
    expect(body.report.driftKindCounts.settlement_conservation_drift).toBe(1);
    expect(body.report.driftKindCounts.object_storage_root_mismatch).toBe(1);
    expect(body.report.objectStorageArtifacts[0].storageRoot).toBe('artifact-storage-root');
    expect(body.report.stagingTestnetReadback.secretValuesStored).toBe(false);
    expect(body.report.metaphysicalFacts[0].canonicalRoot).toBe('private-source-root');
    expect(body.committed).toBe(true);
    expect(insertReconciliationRepair).toHaveBeenCalledWith(
      expect.objectContaining({
        reconciliation_id: 'reconciliation-api-1',
        fact_id: 'anchor-api-1',
        repair_kind: 'ledger_finality_state',
        before_value: 'broadcast',
        after_value: 'confirmed',
        blocking: true,
      }),
    );
  });

  it('returns JSON-safe source-to-shares proofs from the route boundary', async () => {
    const route = buildPostBtdSourceToSharesProofRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/source-to-shares-proof', {
        method: 'POST',
        body: JSON.stringify(sourceToSharesProofBody()),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.kind).toBe('btd_source_to_shares_proof_settlement');
    expect(body.committed).toBe(false);
    expect(body.proof.feeQuote.priceAsset).toBe('BTC');
    expect(body.proof.feeQuote.grossSats).toBe('9000');
    expect(body.proof.settlementConservation.noOverpayment.passed).toBe(true);
    expect(body.proof.settlementConservation.noUnderpayment.passed).toBe(true);
    expect(body.terminalJournalEntry.exchangeSequence).toBe('18');
  });

  it('returns JSON-safe bridge-readiness research posture from the route boundary', async () => {
    const route = buildPostBtdBridgeReadinessResearchRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/bridge-readiness-research', {
        method: 'POST',
        body: JSON.stringify(bridgeReadinessResearchBody()),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.kind).toBe('btd_bridge_readiness_research_settlement');
    expect(body.committed).toBe(false);
    expect(body.posture.activeBtdChainOfRecord).toBe('bitcoin_btd_registry');
    expect(body.posture.bridgeChainOfRecordTruth).toBe('no_bridge_chain_of_record');
    expect(body.posture.allNonAdmitted).toBe(true);
    expect(body.posture.records).toHaveLength(5);
    expect(body.terminalJournalEntry.exchangeSequence).toBe('19');
  });

  it('returns JSON-safe Protocol telemetry proof hooks from the route boundary', async () => {
    const route = buildPostBtdProtocolTelemetryRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/protocol-telemetry', {
        method: 'POST',
        body: JSON.stringify(protocolTelemetryBody()),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.kind).toBe('btd_protocol_telemetry_settlement');
    expect(body.committed).toBe(false);
    expect(body.envelope.compatibleWith).toEqual(['V32', 'V35']);
    expect(body.envelope.sourceSafety.containsSecret).toBe(false);
    expect(body.envelope.telemetry[0].event).toBe('btd.source_to_shares_proof.emitted');
    expect(body.envelope.proofHooks[0].proofFamily).toBe('source_to_shares');
    expect(body.terminalJournalEntry.exchangeSequence).toBe('20');
  });

  it('returns JSON-safe interface integration regression proof from the route boundary', async () => {
    const direct = buildBtdInterfaceIntegrationRegressionSettlement({
      ...(interfaceIntegrationRegressionBody() as any),
      exchangeSequence: 21n,
      actorId: 'user-1',
    });
    const route = buildPostBtdInterfaceIntegrationRegressionRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/interface-integration-regression', {
        method: 'POST',
        body: JSON.stringify(interfaceIntegrationRegressionBody()),
      }),
    );
    const body = await response.json();

    expect(direct.kind).toBe('btd_interface_integration_regression_settlement');
    expect(postBtdInterfaceIntegrationRegression).toBeDefined();
    expect(response.status).toBe(200);
    expect(body.kind).toBe('btd_interface_integration_regression_settlement');
    expect(body.committed).toBe(false);
    expect(body.proof.coverage.surfaces.missing).toEqual([]);
    expect(body.proof.coverage.objectFamilies.missing).toEqual([]);
    expect(body.proof.packageOwned).toBe(true);
    expect(body.proof.routeLocalReimplementation).toBe(false);
    expect(body.proof.sourceSafeLowDetailIntact).toBe(true);
    expect(body.proof.transactionCockpitRegression).toBe(false);
    expect(body.terminalJournalEntry.exchangeSequence).toBe('21');
  });

  it('fails interface integration regression when source-safe low detail is not proven', async () => {
    const route = buildPostBtdInterfaceIntegrationRegressionRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
    });
    const body = interfaceIntegrationRegressionBody({
      records: (interfaceIntegrationRegressionBody().records as any[]).map((record, index) => ({
        ...record,
        sourceSafeLowDetailIntact: index === 0 ? false : record.sourceSafeLowDetailIntact,
      })),
    });
    const response = await route(
      new Request('https://bitcode.test/api/btd/interface-integration-regression', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain('source-safe low-detail UX');
  });

  it('returns JSON-safe deployment readiness settlements and persists telemetry or upgrades', async () => {
    const insertCryptoTelemetryEvent = jest.fn(async (row) => ({
      event: row.event,
      severity: row.severity,
    }));
    const insertProtocolUpgradeReceipt = jest.fn(async (row) => ({
      upgrade_id: row.upgrade_id,
      upgrade_state: row.upgrade_state,
    }));
    const route = buildPostBtdDeploymentReadinessRoute({
      resolveAuthenticatedUser: async () => ({ userId: 'user-1' }),
      registry: {
        insertCryptoTelemetryEvent,
        insertProtocolUpgradeReceipt,
      } as any,
    });
    const telemetryResponse = await route(
      new Request('https://bitcode.test/api/btd/deployment-readiness', {
        method: 'POST',
        body: JSON.stringify({
          action: 'telemetry_event',
          telemetryEvent: 'btc_fee.confirmation_lag',
          telemetrySubjectId: 'fee-api-1',
          telemetryReceiptRoot: 'fee-receipt-root',
          commitToRegistry: true,
          issuedAt,
        }),
      }),
    );
    const upgradeResponse = await route(
      new Request('https://bitcode.test/api/btd/deployment-readiness', {
        method: 'POST',
        body: JSON.stringify({
          action: 'upgrade_plan',
          upgradeId: 'upgrade-api-1',
          fromVersion: 'V26',
          toVersion: 'V27',
          ledgerNetwork: 'signet',
          migrationRoot: 'migration-root',
          preStateRoot: 'pre-root',
          approvalReceiptRoot: 'approval-root',
          rollbackPlanRoot: 'rollback-root',
          commitToRegistry: true,
          issuedAt,
        }),
      }),
    );
    const telemetryBody = await telemetryResponse.json();
    const upgradeBody = await upgradeResponse.json();

    expect(telemetryResponse.status).toBe(200);
    expect(telemetryBody.telemetry.severity).toBe('warning');
    expect(telemetryBody.committed).toBe(true);
    expect(upgradeResponse.status).toBe(200);
    expect(upgradeBody.upgradeReceipt.upgradeState).toBe('planned');
    expect(upgradeBody.committed).toBe(true);
    expect(insertCryptoTelemetryEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'btc_fee.confirmation_lag',
        severity: 'warning',
        subject_id: 'fee-api-1',
      }),
    );
    expect(insertProtocolUpgradeReceipt).toHaveBeenCalledWith(
      expect.objectContaining({
        upgrade_id: 'upgrade-api-1',
        from_version: 'V26',
        to_version: 'V27',
        network: 'signet',
        upgrade_state: 'planned',
      }),
    );
  });
});
