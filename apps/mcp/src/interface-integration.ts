import {
  type BtdInterfaceIntegrationRecordInput,
} from '@bitcode/btd/interface-integration-contract';

export function buildMcpInterfaceIntegrationRecord(): BtdInterfaceIntegrationRecordInput {
  return {
    surface: 'mcp',
    consumerId: 'bitcode-mcp-interface',
    packageExport: '@bitcode/btd/interface-integration-contract',
    adapterPath: 'apps/mcp/src/interface-integration.ts',
    objectFamilies: ['source_to_shares_proof', 'organization_authority', 'protocol_telemetry'],
    proofRoot: 'mcp-interface-regression-proof-root',
    packageOwned: true,
    routeLocalReimplementation: false,
    sourceSafeLowDetailIntact: true,
    transactionCockpitRegression: false,
    notes: ['MCP exposes package-owned Protocol objects instead of local BTD policy copies'],
  };
}
