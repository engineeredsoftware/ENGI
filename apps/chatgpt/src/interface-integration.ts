import {
  type BtdInterfaceIntegrationRecordInput,
} from '@bitcode/btd/interface-integration-contract';

export function buildChatGptAppInterfaceIntegrationRecord(): BtdInterfaceIntegrationRecordInput {
  return {
    surface: 'chatgpt_app',
    consumerId: 'bitcode-chatgpt-app-interface',
    packageExport: '@bitcode/btd/interface-integration-contract',
    adapterPath: 'apps/chatgpt/src/interface-integration.ts',
    objectFamilies: ['read_access', 'organization_authority', 'protocol_telemetry'],
    proofRoot: 'chatgpt-app-interface-regression-proof-root',
    packageOwned: true,
    routeLocalReimplementation: false,
    sourceSafeLowDetailIntact: true,
    transactionCockpitRegression: false,
    notes: ['ChatGPT App connected-interface write carriers reuse package-owned BTD contracts'],
  };
}
