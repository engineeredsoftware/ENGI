import {
  BTD_INTERFACE_INTEGRATION_REQUIRED_OBJECT_FAMILIES,
  BTD_INTERFACE_INTEGRATION_REQUIRED_SURFACES,
  buildBtdInterfaceIntegrationRecord,
  buildBtdInterfaceIntegrationRegressionProof,
  type BtdInterfaceIntegrationRecordInput,
} from '../src/interface-integration';

const issuedAt = '2026-05-21T00:00:00.000Z';

function record(
  input: Pick<
    BtdInterfaceIntegrationRecordInput,
    'surface' | 'consumerId' | 'packageExport' | 'adapterPath' | 'objectFamilies'
  >,
): BtdInterfaceIntegrationRecordInput {
  return {
    ...input,
    proofRoot: `${input.consumerId}-proof-root`,
    packageOwned: true,
    routeLocalReimplementation: false,
    sourceSafeLowDetailIntact: true,
    transactionCockpitRegression: false,
    notes: ['package-owned object consumed with source-safe disclosure'],
    issuedAt,
  };
}

function records(): BtdInterfaceIntegrationRecordInput[] {
  return [
    record({
      surface: 'product',
      consumerId: 'terminal-transaction-cockpit',
      packageExport: '@bitcode/btd/interface-integration-contract',
      adapterPath: 'apps/uapi/components/bitcode/pipeline/models/transaction-route-readiness.ts',
      objectFamilies: ['btd_registry', 'read_access', 'terminal_journal'],
    }),
    record({
      surface: 'api',
      consumerId: 'btd-api-route-boundary',
      packageExport: '@bitcode/btd',
      adapterPath: 'packages/api/src/routes/btd-crypto.ts',
      objectFamilies: ['btd_receipts', 'btc_fee_operation', 'ledger_projection', 'protocol_telemetry'],
    }),
    record({
      surface: 'mcp',
      consumerId: 'bitcode-mcp-interface',
      packageExport: '@bitcode/btd/interface-integration-contract',
      adapterPath: 'apps/mcp/src/interface-integration.ts',
      objectFamilies: ['source_to_shares_proof', 'organization_authority'],
    }),
    record({
      surface: 'chatgpt_app',
      consumerId: 'bitcode-chatgpt-app-interface',
      packageExport: '@bitcode/btd/interface-integration-contract',
      adapterPath: 'apps/chatgpt/src/interface-integration.ts',
      objectFamilies: ['read_access', 'organization_authority'],
    }),
    record({
      surface: 'auxillaries_hook',
      consumerId: 'auxillaries-interface-hook',
      packageExport: '@bitcode/btd/interface-integration-contract',
      adapterPath: 'apps/uapi/components/bitcode/pipeline/models/transaction-route-readiness.ts',
      objectFamilies: ['btd_registry', 'organization_authority'],
    }),
    record({
      surface: 'exchange_hook',
      consumerId: 'exchange-interface-hook',
      packageExport: '@bitcode/btd/interface-integration-contract',
      adapterPath: 'apps/uapi/components/bitcode/pipeline/models/transaction-route-readiness.ts',
      objectFamilies: ['btd_receipts', 'btc_fee_operation', 'ledger_projection'],
    }),
    record({
      surface: 'conversations_hook',
      consumerId: 'conversations-interface-hook',
      packageExport: '@bitcode/btd/interface-integration-contract',
      adapterPath: 'apps/uapi/components/bitcode/pipeline/models/transaction-route-readiness.ts',
      objectFamilies: ['read_access', 'organization_authority', 'protocol_telemetry'],
    }),
  ];
}

describe('interface integration regression proof', () => {
  it('proves product, API, MCP, ChatGPT App, Auxillaries, Exchange, and Conversations hooks use package-owned objects', () => {
    const proof = buildBtdInterfaceIntegrationRegressionProof({
      records: records(),
      lowDetailProofRoot: 'terminal-low-detail-source-safe-proof-root',
      transactionCockpitProofRoot: 'terminal-transaction-cockpit-regression-proof-root',
      issuedAt,
    });

    expect(proof.kind).toBe('btd.interface_integration_regression_proof');
    expect(proof.coverage.surfaces.required).toEqual([
      ...BTD_INTERFACE_INTEGRATION_REQUIRED_SURFACES,
    ]);
    expect(proof.coverage.objectFamilies.required).toEqual([
      ...BTD_INTERFACE_INTEGRATION_REQUIRED_OBJECT_FAMILIES,
    ]);
    expect(proof.coverage.surfaces.missing).toEqual([]);
    expect(proof.coverage.objectFamilies.missing).toEqual([]);
    expect(proof.packageOwned).toBe(true);
    expect(proof.routeLocalReimplementation).toBe(false);
    expect(proof.sourceSafeLowDetailIntact).toBe(true);
    expect(proof.transactionCockpitRegression).toBe(false);
    expect(proof.sourceSafety.containsProtectedSource).toBe(false);
  });

  it('fails closed when an interface record is route-local reimplementation', () => {
    expect(() =>
      buildBtdInterfaceIntegrationRecord({
        ...records()[0],
        routeLocalReimplementation: true,
      }),
    ).toThrow(/route-local reimplementation/);
  });

  it('fails closed when required interface coverage is missing', () => {
    expect(() =>
      buildBtdInterfaceIntegrationRegressionProof({
        records: records().filter((entry) => entry.surface !== 'mcp'),
        lowDetailProofRoot: 'terminal-low-detail-source-safe-proof-root',
        transactionCockpitProofRoot: 'terminal-transaction-cockpit-regression-proof-root',
      }),
    ).toThrow(/missing surfaces: mcp/);
  });

  it('fails closed on secret-looking or protected-source labels', () => {
    expect(() =>
      buildBtdInterfaceIntegrationRecord({
        ...records()[0],
        notes: ['private source should not be summarized here'],
      }),
    ).toThrow(/must not contain secrets or protected source/);
  });
});
