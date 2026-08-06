export const BTD_INTERFACE_INTEGRATION_REQUIRED_SURFACES = [
  'product',
  'api',
  'mcp',
  'chatgpt_app',
  'auxillaries_hook',
  'exchange_hook',
  'conversations_hook',
] as const;

export type BtdInterfaceIntegrationSurface =
  (typeof BTD_INTERFACE_INTEGRATION_REQUIRED_SURFACES)[number];

export const BTD_INTERFACE_INTEGRATION_REQUIRED_OBJECT_FAMILIES = [
  'btd_registry',
  'read_access',
  'btd_receipts',
  'btc_fee_operation',
  'ledger_projection',
  'source_to_shares_proof',
  'protocol_telemetry',
  'organization_authority',
  'terminal_journal',
] as const;

export type BtdInterfaceIntegrationObjectFamily =
  (typeof BTD_INTERFACE_INTEGRATION_REQUIRED_OBJECT_FAMILIES)[number];

export interface BtdInterfaceIntegrationRecordInput {
  surface: BtdInterfaceIntegrationSurface;
  consumerId: string;
  packageExport: string;
  adapterPath: string;
  objectFamilies: readonly BtdInterfaceIntegrationObjectFamily[];
  proofRoot: string;
  packageOwned: boolean;
  routeLocalReimplementation: boolean;
  sourceSafeLowDetailIntact: boolean;
  transactionCockpitRegression: boolean;
  notes?: readonly string[];
  issuedAt?: string;
}
